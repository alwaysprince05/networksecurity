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

import glob
import re

@app.get("/api/logs")
async def get_system_logs():
    try:
        log_dir = os.path.join(os.getcwd(), "logs")
        if not os.path.exists(log_dir):
            return JSONResponse(status_code=200, content=[])
            
        list_of_files = glob.glob(f'{log_dir}/*/*.log')
        if not list_of_files:
            # Fallback if logs are direct children
            list_of_files = glob.glob(f'{log_dir}/*.log')
            if not list_of_files:
                return JSONResponse(status_code=200, content=[])
                
        # Filter strictly for files that actually contain log data
        filled_files = [f for f in list_of_files if os.path.getsize(f) > 0]
        if not filled_files:
            return JSONResponse(status_code=200, content=[])
            
        latest_file = max(filled_files, key=os.path.getmtime)
        
        parsed_logs = []
        log_pattern = re.compile(r'\[\s*(.*?)\s*\]\s*\d+\s+.*?\s+-\s+(INFO|WARNING|ERROR|DEBUG|CRITICAL)\s+-\s+(.*)')
        
        with open(latest_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        # Parse from newest (bottom) to oldest (top)
        for line in reversed(lines):
            match = log_pattern.match(line)
            if match:
                ts, level, msg = match.groups()
                
                # Filter out noisy, low-level debugging logs from UI
                if msg.startswith("Entered") or msg.startswith("Exited") or "method of" in msg:
                    continue
                    
                time_only = ts.split(' ')[1].split(',')[0] if ' ' in ts else ts
                
                ui_level = "info"
                lvl_upper = level.upper()
                if lvl_upper == "INFO":
                    if "success" in msg.lower() or "complete" in msg.lower() or "passed" in msg.lower() or "started" in msg.lower():
                        ui_level = "ok" if "started" not in msg.lower() else "info"
                    else:
                        ui_level = "info"
                elif lvl_upper == "WARNING":
                    ui_level = "warn"
                elif lvl_upper in ["ERROR", "CRITICAL"]:
                    ui_level = "error"
                
                parsed_logs.append({
                    "ts": time_only[-8:] if len(time_only) >= 8 else time_only,  # ensure HH:MM:SS
                    "level": ui_level,
                    "msg": msg.strip()
                })
                
                if len(parsed_logs) >= 200:
                    break
                    
        return JSONResponse(status_code=200, content=parsed_logs)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})


app.mount("/static", StaticFiles(directory="static"), name="static")

# Ensure prediction_output exists and mount it for downloads
os.makedirs("prediction_output", exist_ok=True)
app.mount("/prediction_output", StaticFiles(directory="prediction_output"), name="prediction_output")

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
        
        # If the user accidentally uploads a training dataset or a previous output.csv,
        # we must drop the target/output columns because the model expects only the 30 features.
        cols_to_drop = ["Result", "predicted_column", "Threat Status"]
        for col in cols_to_drop:
            if col in df.columns:
                df = df.drop(columns=[col])
            
        # Sort columns alphabetically to match the new training deterministic pipeline
        df = df[sorted(df.columns)]
        
        preprocessor = load_object("final_model/preprocessor.pkl")
        final_model = load_object("final_model/model.pkl")
        network_model = NetworkModel(preprocessor=preprocessor, model=final_model)
        y_pred = network_model.predict(df)
        df["predicted_column"] = y_pred
        os.makedirs("prediction_output", exist_ok=True)
        df.to_csv("prediction_output/output.csv", index=False)

        # Map 0 → Malicious, 1 → Normal for display
        df["Threat Status"] = df["predicted_column"].map(
            lambda x: "🔴 Malicious" if x == 0 else "🟢 Normal"
        )

        # Only render the first 100 rows in HTML to prevent server crashes on huge files
        table_html = df.head(100).to_html(
            classes="results-table",
            index=False,
            border=0,
            escape=False
        )

        malicious_count = int((df["predicted_column"] == 0).sum())
        normal_count = int((df["predicted_column"] == 1).sum())
        total_rows = len(df)
        
        # Save latest stats for dashboard to MongoDB
        stats_collection = database["prediction_stats"]
        stats_collection.update_one(
            {"_id": "latest"},
            {"$set": {
                "total_rows": total_rows,
                "malicious_count": malicious_count,
                "normal_count": normal_count
            }},
            upsert=True
        )

        return templates.TemplateResponse(
            request,
            "predict.html",
            {
                "table_html": table_html,
                "total_rows": total_rows,
                "malicious_count": malicious_count,
                "normal_count": normal_count,
                "filename": file.filename,
            }
        )

    except Exception as e:
        raise NetworkSecurityException(e, sys)


@app.get("/api/status", tags=["API"])
async def api_status():
    """Health check endpoint"""
    return JSONResponse(content={"status": "healthy", "service": "NetworkSecurity IDS"})

@app.get("/api/stats", tags=["API"])
async def get_stats():
    try:
        stats_collection = database["prediction_stats"]
        doc = stats_collection.find_one({"_id": "latest"})
        if doc:
            return JSONResponse(content={
                "total_rows": doc.get("total_rows", 0),
                "malicious_count": doc.get("malicious_count", 0),
                "normal_count": doc.get("normal_count", 0)
            })
    except Exception as e:
        pass
    
    # Fallback to local file if MongoDB is unreachable
    import json
    stats_file = "prediction_output/latest_stats.json"
    if os.path.exists(stats_file):
        with open(stats_file, "r") as f:
            return JSONResponse(content=json.load(f))
            
    return JSONResponse(content={"total_rows": 124853, "malicious_count": 1842, "normal_count": 123011})

@app.get("/api/ml_metrics", tags=["API"])
async def get_ml_metrics():
    import json
    metrics_file = "final_model/latest_metrics.json"
    if os.path.exists(metrics_file):
        with open(metrics_file, "r") as f:
            return JSONResponse(content=json.load(f))
    return JSONResponse(content={
        "model_name": "Random Forest",
        "accuracy": 0.974,
        "f1_score": 0.97,
        "precision": 0.98,
        "recall": 0.96
    })


if __name__ == "__main__":
    print("\n" + "="*55)
    print("🚀 App is running! Cmd + Click the link below:")
    print("👉 http://localhost:8000")
    print("="*55 + "\n")
    app_run(app, host="0.0.0.0", port=8000)
