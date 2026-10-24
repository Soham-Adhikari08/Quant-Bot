import joblib
import numpy as np
import os

class RegressionPredictor:
    def __init__(self, model_path: str = None):
        if model_path is None:
            model_path = os.path.join(os.path.dirname(__file__), "..", "..", "saved_models", "best_regression_model.joblib")
        
        self.model = joblib.load(model_path)

    def predict(self, payload: dict) -> dict:
        """
        Input: {"symbol": "ALPHA", "features": [f1, f2, ...]}
        Output: {"predicted_return": float}
        """
        features_array = np.array(payload["features"]).reshape(1, -1)

        pred = float(self.model.predict(features_array)[0])
        
        return {
            "predicted_return": round(pred, 6)
        }

if __name__ == "__main__":
    predictor = RegressionPredictor()
    test_payload = {
        "symbol": "ALPHA",
        "features": [0.5, -0.2, 0.1, 0.05, -0.01, 1.2, 0.8, -0.4, 0.3, 0.9]
    }
    result = predictor.predict(test_payload)
    print("API Test Output:", result)