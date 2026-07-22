import pandas as pd
import numpy as np
import os
import pickle
import json
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder

def train_model():
    print("Starting ML Model Training...")
    
    # Define paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, 'backend', 'data', 'historical.csv')
    model_dir = os.path.join(base_dir, 'ml')
    model_path = os.path.join(model_dir, 'model.pkl')
    
    if not os.path.exists(data_path):
        print(f"Error: Historical data not found at {data_path}")
        return
        
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)

    # Read data
    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} historical records.")

    # Convert date to datetime
    df['Date'] = pd.to_datetime(df['Date'])
    
    # Feature Engineering
    df['DayOfYear'] = df['Date'].dt.dayofyear
    df['sin_day'] = np.sin(2 * np.pi * df['DayOfYear'] / 365.25)
    df['cos_day'] = np.cos(2 * np.pi * df['DayOfYear'] / 365.25)
    
    # Encode Districts
    le = LabelEncoder()
    df['District_Encoded'] = le.fit_transform(df['District'])
    
    # Features (X) and Targets (y)
    X = df[['District_Encoded', 'sin_day', 'cos_day']]
    y_temp = df['Temperature']
    y_hi = df['HeatIndex']
    
    # Train Models
    print("Training Temperature predictor...")
    temp_model = RandomForestRegressor(n_estimators=50, random_state=42, n_jobs=-1)
    temp_model.fit(X, y_temp)
    
    print("Training Heat Index predictor...")
    hi_model = RandomForestRegressor(n_estimators=50, random_state=42, n_jobs=-1)
    hi_model.fit(X, y_hi)
    
    # Evaluate simple training accuracy as dummy check
    temp_score = temp_model.score(X, y_temp)
    hi_score = hi_model.score(X, y_hi)
    print(f"Training score - Temp: {temp_score:.4f}, Heat Index: {hi_score:.4f}")
    
    # Save objects
    model_data = {
        'temp_model': temp_model,
        'hi_model': hi_model,
        'label_encoder': le,
        'accuracy_metrics': {
            'temp_r2': float(temp_score),
            'hi_r2': float(hi_score)
        }
    }
    
    with open(model_path, 'wb') as f:
        pickle.dump(model_data, f)

    # Save metrics for backend/frontend consumption
    metrics_path = os.path.join(model_dir, 'metrics.json')
    with open(metrics_path, 'w') as f:
        json.dump({
            'temp_r2': float(temp_score),
            'hi_r2': float(hi_score),
            'trained_at': datetime.now().isoformat(),
            'districts': len(le.classes_),
            'records': len(df)
        }, f, indent=2)
        
    print(f"Successfully saved trained models to {model_path}")

if __name__ == "__main__":
    train_model()
