## 🚀 Overview

Production-ready **Machine Learning + DevOps project** for detecting phishing/network threats.

- Built with **FastAPI + ML**
- Containerized using **Docker**
- Deployed on **AWS EC2**
- Uses **AWS ECR for image storage**
- Fully automated using **GitHub Actions CI/CD**

---

## ✨ Features

- 🔍 ML-based Threat Detection
- ⚡ FastAPI REST API
- 🐳 Dockerized Application
- ☁️ AWS Deployment (EC2 + ECR)
- 🔄 Automated CI/CD Pipeline

---

## 🐳 Docker Setup (Local)

```bash
docker build -t networksecurity .
docker run -d -p 8080:8080 networksecurity
```
---

## ☁️ CI/CD Pipeline Flow
GitHub Push
     ↓
GitHub Actions (CI/CD)
     ↓
Docker Build
     ↓
Push to AWS ECR
     ↓
Pull on EC2
     ↓
Remove Old Container
     ↓
Run New Container
     ↓
Live API 🚀

---

🔐 GitHub Secrets Setup

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_ECR_LOGIN_URI=
ECR_REPOSITORY_NAME=networkssecurity

---

☁️ EC2 Setup (Docker Installation)

sudo apt-get update -y
sudo apt-get upgrade -y

curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

sudo usermod -aG docker ubuntu
newgrp docker

---

📂 Project Structure
NetworkSecurity/
│
├── .github/workflows/
├── data_schema/
├── final_model/
├── Network_Data/
├── networksecurity/
│   ├── components/
│   ├── pipeline/
│   ├── utils/
│   ├── cloud/
│
├── notebooks/
├── prediction_output/
├── templates/
├── valid_data/
│
├── app.py
├── main.py
├── push_data.py
├── test_mongodb.py
│
├── Dockerfile
├── requirements.txt
├── setup.py
├── mlflow.db
│
├── .env
├── .gitignore
└── README.md

🧠 Architecture Overview
	•	components/ → ML pipeline steps
	•	pipeline/ → Workflow execution
	•	utils/ → Helper functions
	•	cloud/ → AWS integration
	•	app.py → API layer

---

⚙️ Local Setup

git clone https://github.com/alwaysprince05/networksecurity.git
cd networksecurity

python -m venv venv
source venv/bin/activate

pip install -r requirements.txt

uvicorn app:app --reload

## 🌐 Live API

👉 http://15.206.81.166:8080/docs
