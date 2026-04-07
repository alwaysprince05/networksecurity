# Network Security Threat Detection

Production-ready machine learning and DevOps project for phishing/network threat detection using FastAPI, Docker, and AWS.

## Overview

- End-to-end ML pipeline with real-time API inference

- Data ingestion and model training pipeline
- Prediction through a FastAPI endpoint
- Docker-based packaging
- CI/CD with GitHub Actions
- Deployment flow using AWS ECR and EC2

## Tech Stack

- Python
- FastAPI + Uvicorn
- Scikit-learn
- MongoDB (via `pymongo`)
- Docker
- GitHub Actions
- AWS (ECR + EC2)

## Repository Structure

```text
networksecurity/
├── .github/workflows/          # CI/CD workflow
├── networksecurity/            # Core package
│   ├── components/             # ML pipeline components
│   ├── pipeline/               # Training orchestration
│   ├── utils/                  # Utilities/helpers
│   ├── cloud/                  # Cloud integrations
│   ├── constant/               # Constants/config values
│   ├── entity/                 # Config and artifact entities
│   ├── exception/              # Custom exception handling
│   └── logging/                # Logging setup
├── templates/                  # HTML templates for prediction output
├── final_model/                # Saved model artifacts
├── prediction_output/          # Generated prediction CSV output
├── app.py                      # FastAPI app entry point
├── main.py                     # Local training pipeline runner
├── requirements.txt            # Python dependencies
└── Dockerfile                  # Container build definition
```

## API Endpoints

Once the app is running, Swagger docs are available at `/docs`.

- `GET /`  
  Redirects to API docs.
- `GET /train`  
  Triggers training pipeline execution.
- `POST /predict`  
  Accepts CSV file upload and returns a rendered prediction table.

## Local Development Setup

### 1) Clone and enter project

```bash
git clone https://github.com/alwaysprince05/networksecurity.git
cd networksecurity
```

### 2) Create virtual environment

```bash
python -m venv .venv
source .venv/bin/activate
```

### 3) Install dependencies

```bash
pip install -r requirements.txt
```

### 4) Configure environment variables

Create a `.env` file in project root:

```env
MONGODB_URL_KEY=<your_mongodb_connection_string>
```

### 5) Run the API

```bash
python app.py
```

Open: `http://127.0.0.1:8000/docs`

## Docker (Local)

Build and run:

```bash
docker build -t networksecurity .
docker run -d --name networksecurity -p 8080:8080 networksecurity
```

Open: `http://127.0.0.1:8080/docs`

## CI/CD Pipeline (GitHub Actions)

The workflow in `.github/workflows/main.yml` performs:

1. Continuous Integration job on push to `main`
2. Docker image build and push to Amazon ECR
3. Continuous Deployment on a self-hosted runner (EC2)

High-level flow:

```text
GitHub Push -> CI Checks -> Docker Build -> Push to ECR -> Pull on EC2 -> Run Container
```

## Required GitHub Secrets

Set these repository secrets before enabling deployment:

```env
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_ECR_LOGIN_URI=
ECR_REPOSITORY_NAME=networksecurity
```

## EC2 Docker Setup (One Time)

```bash
sudo apt-get update -y
sudo apt-get upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
newgrp docker
```

## Troubleshooting

- If `/predict` fails, verify uploaded CSV schema matches training features.
- If app fails at startup, confirm `.env` contains valid `MONGODB_URL_KEY`.
- If deployment fails, validate AWS credentials and ECR repository name.

## Live API

Current deployment: [Live API](http://15.206.81.166:8080/docs)
