# 🛡️ OJT - Product Requirements Document (PRD)

## 📌 Project Title
**Network Security Intrusion Detection ML System**

---

## 🧠 Problem Statement
Modern computer networks are increasingly vulnerable to cyber threats such as DDoS attacks, brute-force attacks, port scanning, and unauthorized access. Traditional rule-based Intrusion Detection Systems (IDS) struggle to detect unknown or evolving attack patterns.

This project aims to build a Machine Learning-based Intrusion Detection System (IDS) capable of detecting malicious network traffic in real-time with high accuracy and low latency.

---

## 📖 Overview
This system uses Machine Learning techniques to analyze network traffic and classify it as either normal or malicious. The goal is to create a scalable, efficient, and real-time intrusion detection system suitable for modern cloud environments.

---

## 🎯 Objectives
- Detect malicious network traffic using ML models  
- Achieve high detection accuracy (>90%)  
- Minimize false positive rate (<5%)  
- Provide real-time prediction via REST APIs  
- Enable scalable deployment using Docker and AWS  

---

## ✨ Key Features
- Real-time traffic classification (Normal vs Attack)  
- ML-based anomaly detection  
- REST API for predictions (FastAPI)  
- Logging and alert system  
- Dockerized deployment  
- Cloud-ready architecture  

---

## ⚙️ Tech Stack
- **Backend:** FastAPI (Python)  
- **Machine Learning:** Scikit-learn, Pandas, NumPy  
- **Deployment:** Docker, AWS EC2  
- **Version Control:** GitHub  

---

## 🏗️ Architecture Overview
The system consists of multiple layers:

1. **Data Ingestion Layer** – Collects network traffic data  
2. **Preprocessing Layer** – Cleans and transforms data  
3. **Feature Engineering** – Extracts important features  
4. **ML Model Layer** – Classifies traffic  
5. **API Layer** – Serves predictions via FastAPI  
6. **Deployment Layer** – Docker + AWS EC2  

👉 See detailed design: [System Design](./SystemDesign.MD)

---

## 📊 Performance Metrics
- Accuracy: **> 90%**  
- False Positive Rate: **< 5%**  
- API Response Time: **< 200ms**  
- Throughput: **10,000+ requests/sec (target)**  
- Uptime: **99%**  

---

## 🔐 Security Considerations
- Input validation to prevent malicious payloads  
- Secure API endpoints (future scope)  
- Logging and monitoring  
- Rate limiting  

---

## 🚀 Deployment Strategy
- Containerize application using Docker  
- Deploy on AWS EC2  
- Use GitHub for version control  
- Optional CI/CD pipeline integration  

---

## 🔄 Workflow
1. Collect network traffic data  
2. Preprocess and clean data  
3. Train ML model  
4. Deploy model via FastAPI  
5. Receive real-time requests  
6. Predict traffic type  
7. Trigger alerts if malicious  

---

## 📈 Future Scope
- Deep Learning models (LSTM)  
- Real-time streaming with Kafka  
- Dashboard visualization (React)  
- SIEM integration  
- Authentication system  

---

## 📎 Full PDF Version
[Download Full PRD PDF](./PrincePRD.pdf)

---

## 👨‍💻 Author
Prince Maurya