# Network Security Threat Detection System

A production-ready machine learning and DevOps application for real-time phishing and network threat detection.

## Fast Overview
- **Author:** Prince Maurya
- **Core:** End-to-end ML pipeline with a beautiful, dynamic Dark-Themed UI.
- **Backend:** FastAPI for seamless data ingestion, model orchestration, and predictions.
- **Frontend:** Jinja2 templating with Vanilla CSS and JS for a dynamic Single-Page Application feel.
- **DevOps:** Dockerized packaging, Git Actions CI/CD to AWS ECR, and automated deployments to AWS EC2.

---

## Live Demonstration

- **App Dashboard (UI):** [http://13.233.60.175:8080/](http://13.233.60.175:8080/)
- **Swagger Documentation (API):** [http://13.233.60.175:8080/docs](http://13.233.60.175:8080/docs)

---

## Tech Stack Overview

- **Python:** Primary application language.
- **FastAPI + Uvicorn:** High-performance async web framework.
- **Scikit-learn:** Model training and validation (RandomForest, DecisionTrees, etc).
- **MongoDB:** NoSQL database for structured data ingestion.
- **Docker:** Application containerization.
- **GitHub Actions:** CI/CD automated test & deployment pipelines.
- **AWS:** Amazon ECR for container registries and EC2 for hosting.

---

## Application Structure

```text
networksecurity/
├── .github/workflows/          # CI/CD workflows for AWS Automation
├── networksecurity/            # Core computational engine
│   ├── components/             # Ingestion, Validation, Transformation, Training
│   ├── pipeline/               # Full pipeline orchestrators
│   ├── model/                  # Custom Scikit-Learn estimators
│   ├── cloud/                  # AWS S3 sync adapters
│   └── exception/              # Customized traceback and exception handlers
├── static/                     # CSS stylesheets, JS frontend controllers, visuals
├── templates/                  # Jinja2 HTML views (Dashboards, Predict, Logs)
├── final_model/                # Pickled production ML models (.pkl)
├── logs/                       # System events and exception history
├── prediction_output/          # Auto-generated CSV files of predictions
├── app.py                      # FastAPI core entry point
└── Dockerfile                  # Slim Python 3.10 deployment schema
```

---

## Project Endpoints & UIs

The system offers both a clean browser user interface and raw API endpoints.

### Beautiful Frontend Panels
- `GET /` — The main graphical dashboard / overview.
- `GET /train-ui` — UI interface for triggering and viewing the training pipeline status.
- `GET /predict-ui` — UI interface with drag-and-drop CSV upload for real-time threat predictions.
- `GET /logs-ui` — Live remote view of the EC2 container's internal logfiles.

### Raw Backend APIs
- `GET /train` — Silently triggers the ML Data Ingestion → Validation → Transformation → Training pipeline.
- `POST /predict` — Accepts a CSV upload and responds with evaluated ML labels.
- `GET /api/status` — General server health-check ping.
- `GET /docs` — Auto-generated Swagger documentation.

---

## Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/alwaysprince05/networksecurity.git
cd networksecurity
```

### 2. Initialize the Python environment
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Environment Secrets Configure
Create a `.env` file at the root. You must provide a valid MongoDB connection string where your phishing data is stored.
```env
MONGODB_URL_KEY="mongodb+srv://<user>:<password>@cluster/..."
```

### 4. Boot the server
```bash
python app.py
```
Open up your browser to `http://127.0.0.1:8000/` and you'll immediately see the frontend interface.

---

## Operations & DevOps

### Docker Deployments
The application is aggressively optimized using a thin Debian Linux image and a strict `.dockerignore` file to ensure the ML pipeline remains isolated, extremely lightweight, and avoids arbitrary database collisions with local `mlflow` runs.
```bash
docker build -t networksecurity .
docker run -d --name networksecurity -p 8080:8000 networksecurity
```

### Continuous Deployment (AWS EC2 + ECR)
The application utilizes an automated **GitHub Actions** script (`main.yml`) that instantly initiates upon pushed code. 
1. The code is compressed and rigorously vetted.
2. The Dockerfile compiles within a GitHub Runner and patches to AWS ECR.
3. Once pushed, it securely SSH's into our AWS EC2 instance, safely removes the old active container, and runs the newest system codebase autonomously. 

**(Ensure that `MONGODB_URL_KEY`, `AWS_ACCESS_KEY_ID`, `AWS_ECR_LOGIN_URI`, and `EC2_SSH_KEY` are placed in your repository's secrets panel to allow automated deployments to function properly)**
