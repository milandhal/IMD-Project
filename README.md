# 🌡️ IMD Heat Index Prediction & Monitoring System

An AI-powered web application for predicting and monitoring the **Heat Index** across Odisha using Machine Learning and real-time weather data. The system combines meteorological analysis, predictive modeling, and an interactive dashboard to provide accurate heat stress insights for researchers, government agencies, and the public.

---

## 📌 Project Overview

The IMD Heat Index Prediction & Monitoring System is designed to estimate the perceived temperature (Heat Index) by combining multiple weather parameters such as temperature, humidity, wind speed, and atmospheric pressure.

The application provides:

- Historical Heat Index prediction using Machine Learning
- Real-time weather monitoring
- Interactive dashboard
- Data visualization
- RESTful API for predictions
- Responsive web interface

---

## 🚀 Features

### 🌡 Heat Index Prediction
- Predicts Heat Index using a trained Machine Learning model.
- Uses historical meteorological data.
- Provides accurate heat stress estimation.

### 📊 Interactive Dashboard
- Real-time weather statistics.
- Heat Index visualization.
- District-wise monitoring.
- Responsive UI.

### 🤖 Machine Learning
- Data preprocessing
- Feature Engineering
- Model Training
- Model Evaluation
- Prediction API

### 🌍 Real-Time Weather
- Live weather data integration.
- Automatic Heat Index calculation.
- API-based weather updates.

### 📈 Data Visualization
- Weather trends
- Heat Index comparison
- Statistical charts
- Performance metrics

---

# 🛠 Tech Stack

## Frontend

- React.js
- Vite
- HTML5
- CSS3
- JavaScript
- Axios

---

## Backend

- Node.js
- Express.js
- REST API
- dotenv
- CORS

---

## Machine Learning

- Python
- Scikit-learn
- Pandas
- NumPy
- Joblib / Pickle

---

## APIs

- OpenWeather API

---

# 📁 Project Structure

```
IMD-Project/
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── data/
│   ├── server.js
│   └── package.json
│
├── ml/
│   ├── train.py
│   ├── predict.py
│   ├── metrics.json
│   ├── requirements.txt
│   └── model.pkl
│
└── README.md
```

---

# ⚙ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/IMD-Project.git

cd IMD-Project
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on

```
http://localhost:5173
```

---

## Backend

```bash
cd backend

npm install

npm start
```

Backend runs on

```
http://localhost:5000
```

---

## Machine Learning

Install dependencies

```bash
cd ml

pip install -r requirements.txt
```

Train Model

```bash
python train.py
```

Predict

```bash
python predict.py
```

---

# 🔑 Environment Variables

Create a `.env` file inside the **backend** folder.

Example

```env
PORT=5000

OPENWEATHER_API_KEY=YOUR_API_KEY
```

---

# 📊 Workflow

```
Weather Data
      │
      ▼
Data Preprocessing
      │
      ▼
Feature Engineering
      │
      ▼
Machine Learning Model
      │
      ▼
Prediction API
      │
      ▼
Backend (Express)
      │
      ▼
React Frontend
      │
      ▼
Interactive Dashboard
```

---

# 📈 Machine Learning Pipeline

- Data Collection
- Data Cleaning
- Feature Engineering
- Train-Test Split
- Model Training
- Model Evaluation
- Heat Index Prediction

---

# 📸 Dashboard

The dashboard provides

- Current Weather
- Heat Index Prediction
- Temperature
- Humidity
- Wind Speed
- Pressure
- Statistical Graphs
- Historical Analysis

---

# 📄 License

This project is developed for educational and research purposes.

---

# 👨‍💻 Author

**Milan Dhal**

Data Science | Machine Learning | Full Stack Development




---

## ⭐ If you found this project useful, don't forget to star the repository.
