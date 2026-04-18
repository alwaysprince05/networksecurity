import sys
import os

import certifi
ca = certifi.where()

from dotenv import load_dotenv
load_dotenv()
mongo_db_url = os.getenv("MONGODB_URL_KEY")
import pymongo
from networksecurity.exception.exception import NetworkSecurityException
from networksecurity.logging.logger import logging
from networksecurity.pipeline.training_pipeline import TrainingPipeline

from fastapi import FastAPI, File, UploadFile, Request
from fastapi.responses import HTMLResponse, Response, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.responses import RedirectResponse
from uvicorn import run as app_run
import pandas as pd

from networksecurity.utils.main_utils.utils import load_object
from networksecurity.utils.ml_utils.model.estimator import NetworkModel

client = pymongo.MongoClient(mongo_db_url, tlsCAFile=ca)

from networksecurity.constant.training_pipeline import DATA_INGESTION_COLLECTION_NAME
from networksecurity.constant.training_pipeline import DATA_INGESTION_DATABASE_NAME

database = client[DATA_INGESTION_DATABASE_NAME]
collection = database[DATA_INGESTION_COLLECTION_NAME]

app = FastAPI(title="NetworkSecurity IDS", version="1.0.0")

@app.exception_handler(NetworkSecurityException)
async def network_security_exception_handler(request: Request, exc: NetworkSecurityException):
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": str(exc)},
    )

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# Jinja2 templates
templates = Jinja2Templates(directory="templates")


# ─────────────────────────────────────────────
# UI ROUTES
# ─────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse, tags=["UI"])
async def dashboard(request: Request):
    """Main Dashboard page"""
    return templates.TemplateResponse(request, "index.html")


@app.get("/train-ui", response_class=HTMLResponse, tags=["UI"])
async def train_ui(request: Request):
    """Training pipeline trigger page"""
    return templates.TemplateResponse(request, "train.html")


@app.get("/predict-ui", response_class=HTMLResponse, tags=["UI"])
async def predict_ui(request: Request):
    """Prediction upload page"""
    return templates.TemplateResponse(request, "predict.html")


@app.get("/logs-ui", response_class=HTMLResponse, tags=["UI"])
async def logs_ui(request: Request):
    """System logs viewer page"""
    return templates.TemplateResponse(request, "logs.html")


# ─────────────────────────────────────────────
# API ROUTES
# ─────────────────────────────────────────────

@app.get("/train", tags=["API"])
async def train_route():
    """Trigger full training pipeline"""
    try:
        train_pipeline = TrainingPipeline()
        train_pipeline.run_pipeline()
        return JSONResponse(
            content={"status": "success", "message": "Training completed successfully"},
            status_code=200
        )
    except Exception as e:
        raise NetworkSecurityException(e, sys)


@app.post("/predict", tags=["API"])
async def predict_route(request: Request, file: UploadFile = File(...)):
    """Upload a CSV file and get predictions"""
    try:
        df = pd.read_csv(file.file)
        preprocessor = load_object("final_model/preprocessor.pkl")
        final_model = load_object("final_model/model.pkl")
        network_model = NetworkModel(preprocessor=preprocessor, model=final_model)
        y_pred = network_model.predict(df)
        df["predicted_column"] = y_pred
        df.to_csv("prediction_output/output.csv", index=False)

        # Map -1 → Malicious, 1 → Normal for display
        df["Threat Status"] = df["predicted_column"].map(
            lambda x: "🔴 Malicious" if x == -1 else "🟢 Normal"
        )

        table_html = df.to_html(
            classes="results-table",
            index=False,
            border=0,
            escape=False
        )

        return templates.TemplateResponse(
            request,
            "predict.html",
            {
                "table_html": table_html,
                "total_rows": len(df),
                "malicious_count": int((df["predicted_column"] == -1).sum()),
                "normal_count": int((df["predicted_column"] == 1).sum()),
                "filename": file.filename,
            }
        )

    except Exception as e:
        raise NetworkSecurityException(e, sys)


@app.get("/api/status", tags=["API"])
async def api_status():
    """Health check endpoint"""
    return JSONResponse(content={"status": "healthy", "service": "NetworkSecurity IDS"})


if __name__ == "__main__":
    app_run(app, host="0.0.0.0", port=8000)
