import os
import sys
import json
import pandas as pd

# Add the root 'Quant-Bot' directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from models.confidence.model import ConfidenceClassifier

def get_confidence_prediction(model_path, current_features):
    """
    Interface for the Strategy/Fusion Engine.
    Takes a single row of current market features (including Team B's predicted return),
    and outputs the expected JSON format.
    """
    # 1. Initialize and load the frozen calibrated model
    classifier = ConfidenceClassifier()
    classifier.load_model(model_path)
    
    # 2. Convert input dictionary to DataFrame if necessary
    if isinstance(current_features, dict):
        current_features = pd.DataFrame([current_features])
        
    # 3. Extract the predicted return to pass along in the output
    predicted_return = current_features['predicted_return'].iloc[0]
    
    # 4. Generate the calibrated confidence score
    confidence_score = classifier.predict_confidence(current_features)[0]
    
    # 5. Format and return the JSON payload exactly as agreed with Team B/Fusion layer
    result = {
        "predicted_return": float(predicted_return),
        "confidence": float(confidence_score)
    }
    
    return json.dumps(result)

if __name__ == "__main__":
    # Example usage for testing
    dummy_input = {
        "predicted_return": 0.024,
        "feature_1_volatility": 0.15,
        "feature_2_momentum": 0.8
    }
    
    # Adjust this path based on where you run the script from
    model_file = "saved_models/confidence_classifier_xgboost_v2.pkl" 
    
    if os.path.exists(model_file):
        output = get_confidence_prediction(model_file, dummy_input)
        print("API Output:", output)
    else:
        print(f"Model file {model_file} not found. Run train.py first.")