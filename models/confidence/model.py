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
                scale_pos_weight=1, 
                eval_metric='logloss',
                random_state=self.random_state,
                n_jobs=-1
            )
        else:
            raise ValueError("Algorithm must be 'xgboost' or 'random_forest'")

    def train(self, X_train, y_train):
        """Trains the base classification model."""
        self.base_estimator.fit(X_train, y_train)
        self.model = self.base_estimator

    def calibrate(self, X_val, y_val, method='isotonic'):
        """
        Calibrates the model using the validation set to ensure outputs are true probabilities.
        Includes a compatibility layer for Scikit-Learn 1.6+ API changes.
        """
        if self.model is None:
            raise RuntimeError("Must train the base model before calibration.")
        
        try:
            # Fix for Scikit-Learn 1.6+ API change
            from sklearn.frozen import FrozenEstimator
            self.calibrated_model = CalibratedClassifierCV(
                estimator=FrozenEstimator(self.model), 
                method=method
            )
        except ImportError:
            # Fallback for Scikit-Learn < 1.6
            self.calibrated_model = CalibratedClassifierCV(
                estimator=self.model, 
                method=method, 
                cv='prefit'
            )
            
        self.calibrated_model.fit(X_val, y_val)

    def evaluate(self, X_test, y_test):
        """Evaluates the calibrated model and calculates key reliability metrics."""
        if self.calibrated_model is None:
            raise RuntimeError("Must calibrate the model before evaluation.")

        # Predict classes and probabilities
        y_pred = self.calibrated_model.predict(X_test)
        y_proba = self.calibrated_model.predict_proba(X_test)[:, 1]

        metrics = {
            "Precision": precision_score(y_test, y_pred, zero_division=0),
            "Recall": recall_score(y_test, y_pred, zero_division=0),
            "F1_Score": f1_score(y_test, y_pred, zero_division=0),
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
            raise RuntimeError("Model must be trained and calibrated before predicting.")
        
        return self.calibrated_model.predict_proba(X)[:, 1]

    def save_model(self, filepath):
        """Freezes and saves the calibrated model for Team B/Strategy engine."""
        if self.calibrated_model is None:
            raise RuntimeError("Cannot save an uncalibrated model.")
        
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump(self.calibrated_model, filepath)
        print(f"Frozen calibrated model saved to {filepath}")

    def load_model(self, filepath):
        """Loads a frozen calibrated model."""
        self.calibrated_model = joblib.load(filepath)
        print(f"Model loaded from {filepath}")