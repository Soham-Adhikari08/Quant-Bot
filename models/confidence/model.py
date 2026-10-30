import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score, brier_score_loss, log_loss

class ConfidenceClassifier:
    def __init__(self, algorithm='xgboost', random_state=42):
        """
        Initializes the confidence classifier.
        algorithm: 'xgboost' or 'random_forest'
        """
        self.algorithm = algorithm
        self.random_state = random_state
        self.model = None
        self.calibrated_model = None

        if self.algorithm == 'random_forest':
            self.base_estimator = RandomForestClassifier(
                n_estimators=200,
                max_depth=10,
                min_samples_split=5,
                class_weight='balanced',
                random_state=self.random_state,
                n_jobs=-1
            )
        elif self.algorithm == 'xgboost':
            self.base_estimator = XGBClassifier(
                n_estimators=200,
                max_depth=6,
                learning_rate=0.05,
                scale_pos_weight=1, # Adjust based on class imbalance
                eval_metric='logloss',
                random_state=self.random_state,
                n_jobs=-1
            )
        else:
            raise ValueError("Algorithm must be 'xgboost' or 'random_forest'")

    def train(self, X_train, y_train):
        """Trains the base classification model."""
        print(f"Training {self.algorithm} base model...")
        self.base_estimator.fit(X_train, y_train)
        self.model = self.base_estimator
        print("Base model training complete.")

    def calibrate(self, X_val, y_val, method='isotonic'):
        """
        Calibrates the model using the validation set to ensure outputs are true probabilities.
        method: 'isotonic' or 'sigmoid' (Platt scaling)
        """
        if self.model is None:
            raise NotFittedError("Must train the base model before calibration.")
        
        print(f"Calibrating model using {method} regression...")
        # Note: cv='prefit' means we use the already trained model and calibrate on validation data
        self.calibrated_model = CalibratedClassifierCV(
            estimator=self.model, 
            method=method, 
            cv='prefit'
        )
        self.calibrated_model.fit(X_val, y_val)
        print("Calibration complete.")

    def evaluate(self, X_test, y_test):
        """Evaluates the calibrated model and calculates key reliability metrics."""
        if self.calibrated_model is None:
            raise NotFittedError("Must calibrate the model before evaluation.")

        # Predict classes and probabilities
        y_pred = self.calibrated_model.predict(X_test)
        # We want the probability of class 1 (reliable prediction)
        y_proba = self.calibrated_model.predict_proba(X_test)[:, 1]

        metrics = {
            "Precision": precision_score(y_test, y_pred),
            "Recall": recall_score(y_test, y_pred),
            "F1_Score": f1_score(y_test, y_pred),
            "ROC_AUC": roc_auc_score(y_test, y_proba),
            "Brier_Score": brier_score_loss(y_test, y_proba),
            "Log_Loss": log_loss(y_test, y_proba)
        }

        print("\n--- Evaluation Metrics ---")
        for metric, value in metrics.items():
            print(f"{metric}: {value:.4f}")
        
        return metrics

    def predict_confidence(self, X):
        """
        Generates the final confidence score for the API.
        Returns a numpy array of probabilities.
        """
        if self.calibrated_model is None:
            raise NotFittedError("Model must be trained and calibrated before predicting.")
        
        return self.calibrated_model.predict_proba(X)[:, 1]

    def save_model(self, filepath):
        """Freezes and saves the calibrated model for Team B/Strategy engine."""
        if self.calibrated_model is None:
            raise NotFittedError("Cannot save an uncalibrated model.")
        
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump(self.calibrated_model, filepath)
        print(f"Frozen calibrated model saved to {filepath}")

    def load_model(self, filepath):
        """Loads a frozen calibrated model."""
        self.calibrated_model = joblib.load(filepath)
        print(f"Model loaded from {filepath}")


# --- Usage Example for your train.py pipeline ---
if __name__ == "__main__":
    # 1. Generate dummy data for scaffolding (Replace with Person A's data later)
    # Assume X has features (market context + Team B's predicted return)
    # Assume y is binary: 1 if Team B's prediction was reliable (error < threshold), else 0
    np.random.seed(42)
    X_train_dummy = np.random.rand(1000, 10)
    y_train_dummy = np.random.randint(0, 2, 1000)
    
    X_val_dummy = np.random.rand(200, 10)
    y_val_dummy = np.random.randint(0, 2, 200)

    X_test_dummy = np.random.rand(200, 10)
    y_test_dummy = np.random.randint(0, 2, 200)

    # 2. Initialize and Train (Choose 'xgboost' or 'random_forest')
    classifier = ConfidenceClassifier(algorithm='xgboost')
    classifier.train(X_train_dummy, y_train_dummy)

    # 3. Calibrate on unseen validation data to prevent overfitting the confidence scores
    classifier.calibrate(X_val_dummy, y_val_dummy, method='isotonic')

    # 4. Evaluate to generate the metrics required for your report
    classifier.evaluate(X_test_dummy, y_test_dummy)

    # 5. Freeze and save the model for your predict.py API
    classifier.save_model("saved_models/confidence_classifier_v2.pkl")