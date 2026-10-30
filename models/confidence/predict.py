
import joblib

def load_model():
    return joblib.load('confidence_model.pkl')

def get_confidence_prediction(predicted_return, market_features, model=None):
    if model is None:
        model = load_model()
    
    # Predict the probability of the reliable class (index 1)
    confidence_score = model.predict_proba([market_features])[0][1]
    
    # Output structure expected by the Strategy Engine
    return {
        "predicted_return": predicted_return,
        "probability_up": round(confidence_score, 4) 
    }