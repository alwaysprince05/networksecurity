<div align="center">
  <h1>🛡️ Network Security Threat Detection System</h1>
  <p><i>An Enterprise-Grade Machine Learning & DevOps Platform for Real-Time Network Threat Analysis</i></p>
  
  [![Python](https://img.shields.io/badge/Python-3.10+-blue.svg?style=flat&logo=python&logoColor=white)](https://www.python.org)
  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
  [![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
  [![GitHub Actions](https://img.shields.io/badge/AWS_CI%2FCD-Passing-brightgreen?style=flat&logo=githubactions)](https://github.com/alwaysprince05/networksecurity/actions)
  
  <br />

  [![Live Dashboard Link](https://img.shields.io/badge/View_Live_App-00d4ff?style=for-the-badge)](http://13.233.60.175:8080/)
  [![API Documentation](https://img.shields.io/badge/Swagger_API_Docs-85ea2d?style=for-the-badge&logo=swagger)](http://13.233.60.175:8080/docs)

  <br />
</div>

<div align="center">
  <img src="assets/image8.png" alt="Network Security System Dashboard (Dark)" width="900" style="border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.5); margin-bottom: 20px;"/>
  <br>
  <img src="assets/image9.png" alt="Network Security System Dashboard (Light)" width="900" style="border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.5);"/>
</div>

---

## 📑 Table of Contents
- [✨ Architecture & Key Features](#-architecture--key-features)
- [🛠️ Technology Stack](#️-technology-stack)
- [🌐 Live Deployment](#-live-deployment)
- [🧠 Machine Learning Pipeline](#-machine-learning-pipeline)
- [📡 API & UI Endpoints](#-api--ui-endpoints)
- [💻 Local Development Setup](#-local-development-setup)
- [🚀 Cloud Operations & DevOps](#-cloud-operations--devops)
- [📂 Repository Structure](#-repository-structure)

---

## ✨ Architecture & Key Features

This project implements a full-stack, decoupled **Intrusion Detection System (IDS)** designed to analyze massive datasets of network traffic and classify them as **Normal** or **Malicious** in real-time.

- **Automated ML Pipeline:** A fully integrated pipeline handling Data Ingestion (MongoDB), Data Validation, Data Transformation (KNN Imputation), and Model Training (Random Forest) triggered via a single API call.
- **Real-Time SOC Dashboard:** A premium, dark-themed responsive UI mimicking a modern Security Operations Center (SOC). Features dynamic DOM updates, Chart.js visualizations, and asynchronous REST data fetching.
- **Dynamic Metric Tracking:** The system evaluates itself mathematically (`accuracy_score`, `f1_score`, `precision`, `recall`) post-training and seamlessly updates the UI without requiring a server reboot.
- **High-Performance Inference Engine:** Powered by FastAPI, the prediction route handles large `.csv` uploads (up to 50,000+ rows) gracefully, utilizing Pandas for fast vector calculations and secure HTML table rendering with pagination.
- **Continuous Deployment (CI/CD):** Zero-downtime automated deployments via GitHub Actions to AWS EC2 using isolated Docker containers.

---

## 🛠️ Technology Stack

| Category | Technologies Used |
| :--- | :--- |
| **Backend Framework** | Python 3.10, FastAPI, Uvicorn |
| **Machine Learning** | Scikit-learn (Random Forest Classification), Pandas, Numpy |
| **Database & Storage** | MongoDB (NoSQL), AWS S3 (Artifacts) |
| **Frontend UI/UX** | Vanilla HTML5/CSS3, JavaScript, Jinja2, Chart.js |
| **DevOps & Cloud** | Docker, GitHub Actions (CI/CD), AWS ECR, AWS EC2 |
| **Experiment Tracking** | MLFlow, DagsHub (Optional integration) |

---

## 🌐 Live Deployment

The system is currently deployed and fully operational on AWS. Experience the platform below:

> 🔗 **[Launch the Live Dashboard](http://13.233.60.175:8080/)**  
> 🔗 **[Explore the Swagger API Documentation](http://13.233.60.175:8080/docs)**

---

## 🧠 Machine Learning Pipeline

The project follows strict MLOps principles. The training architecture is strictly separated from the inference engine to ensure data integrity and prevent data leakage.

1. **Data Ingestion:** Securely pulls the original `phisingData.csv` training data from MongoDB clusters.
2. **Data Validation:** Ensures schema compliance and validates required feature columns before proceeding.
3. **Data Transformation:** Handles missing network features using `KNNImputer` and applies robust scaling.
4. **Model Training:** Utilizes `RandomizedSearchCV` to hyperparameter tune a **Random Forest Classifier**. Evaluates model strictly using Classification metrics (`accuracy_score`, `precision`, `recall`, `f1_score`).
5. **Model Push:** Promotes the `model.pkl` and `preprocessor.pkl` to the `final_model/` directory for live inference.

---

## 📡 API & UI Endpoints

The FastAPI backend exposes both the graphical interface and raw programmatic REST APIs.

### User Interfaces (UI)
- `GET /` — The main graphical dashboard / statistics overview.
- `GET /train-ui` — Interface for safely triggering and monitoring the ML training pipeline.
- `GET /predict-ui` — Drag-and-drop batch prediction engine for `.csv` network logs.
- `GET /logs-ui` — Live remote viewer for server activity logs.

### Raw REST APIs
- `GET /train` — Silently triggers the ML Data Pipeline.
- `POST /predict` — Accepts a `.csv` payload and returns evaluated ML labels.
- `GET /api/stats` — Serves latest prediction metrics (Total Packets, Malicious Counts).
- `GET /api/ml_metrics` — Serves dynamic, real-time ML performance scores (Accuracy, F1, etc.).
- `GET /api/status` — Health-check ping.

---

## 💻 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/alwaysprince05/networksecurity.git
cd networksecurity
```

### 2. Initialize the Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
```

### 3. Configure Secrets
Create a `.env` file at the root to establish the database connection.
```env
MONGODB_URL_KEY="mongodb+srv://<user>:<password>@cluster/..."
```

### 4. Boot the Server
```bash
python app.py
```
Open up your browser to `http://127.0.0.1:8000/` and you'll immediately see the frontend interface.

---

## 🚀 Cloud Operations & DevOps

### Docker Containerization
The application is aggressively optimized using a thin Debian Linux image and a strict `.dockerignore` file. This prevents arbitrary database collisions with local `mlflow` trackers or massive `.csv` files.
```bash
docker build -t networksecurity .
docker run -d --name networksecurity -p 8080:8000 networksecurity
```

### CI/CD Pipeline (AWS EC2 + ECR)
The application utilizes a fully automated **GitHub Actions** architecture (`main.yml`) that instantly initiates upon a push to the `main` branch. 
1. **Build & Test:** The code is vetted within an isolated GitHub Runner.
2. **Push to ECR:** The `Dockerfile` compiles and patches a new image to **AWS Elastic Container Registry (ECR)**.
3. **Deploy to EC2:** A secure SSH connection is established to our **AWS EC2** instance, terminating the old running container and spinning up the newest codebase automatically.

---

<details>
<summary>📂 <strong>Click to expand Repository Structure</strong></summary>

```text
networksecurity/
├── .github/workflows/          # CI/CD workflows for AWS Automation
├── networksecurity/            # Core computational engine
│   ├── components/             # Ingestion, Validation, Transformation, Training
│   ├── pipeline/               # Full pipeline orchestrators
│   ├── model/                  # Custom Scikit-Learn estimators
│   └── exception/              # Customized traceback handlers
├── static/                     # CSS stylesheets, JS frontend controllers
├── templates/                  # Jinja2 HTML views (Dashboards, Predict, Logs)
├── final_model/                # Pickled production ML models (.pkl) & metrics
├── prediction_output/          # Auto-generated prediction states
├── logs/                       # System events and exception history
├── app.py                      # FastAPI core entry point
└── Dockerfile                  # Slim Python 3.10 deployment schema
```

</details>

---

<div align="center">
  <p><b>Developed by Prince Kumar Maurya</b></p>
  <p><i>Network Security • Machine Learning • MLOps</i></p>
</div>
