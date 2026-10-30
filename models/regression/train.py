import numpy as np
import joblib
import os
from sklearn.model_selection import TimeSeriesSplit, RandomizedSearchCV
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from model import get_model

def get_mock_data(n_samples=2000, n_features=10):
    """Temporary mock data until Manthika's features.py is ready."""
    np.random.seed(42)
    X = np.random.randn(n_samples, n_features)
    y = X[:, 0] * 0.01 + X[:, 1] * -0.005 + np.random.randn(n_samples) * 0.002
    return X, y

def evaluate_metrics(y_true, y_pred, fold_name="Validation"):
    """Evaluates the exact metrics required by the project specifications."""
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    
    # Directional Accuracy: How often did we guess the sign (+/-) correctly?
    directional_accuracy = np.mean(np.sign(y_true) == np.sign(y_pred)) * 100
    
    print(f"--- {fold_name} Metrics ---")
    print(f"MAE: {mae:.6f} | RMSE: {rmse:.6f} | R2: {r2:.4f}")
    print(f"Directional Accuracy: {directional_accuracy:.2f}%")
    return mae

def train_and_save():
    X, y = get_mock_data()

    # 1. Walk-Forward Validation (Time Series Split)
    tscv = TimeSeriesSplit(n_splits=5)
    
    print("Executing Walk-Forward Validation...")
    fold = 1
    for train_index, val_index in tscv.split(X):
        X_train, X_val = X[train_index], X[val_index]
        y_train, y_val = y[train_index], y[val_index]
        print(f"Fold {fold}: Train={len(X_train)}, Val={len(X_val)}")
        fold += 1

    # Using the final most recent split for our final out-of-sample test
    X_train, X_test = X[train_index], X[val_index]
    y_train, y_test = y[train_index], y[val_index]

    # 2. Hyperparameter Tuning for XGBoost
    print("\nTuning XGBoost Hyperparameters...")
    base_xgb = get_model("xgb")
    
    param_grid = {
        'n_estimators': [50, 100, 200],
        'learning_rate': [0.01, 0.05, 0.1],
        'max_depth': [3, 5, 7],
        'subsample': [0.8, 1.0]
    }
    
    # Randomized search is faster than Grid search while yielding similar results
    search = RandomizedSearchCV(
        base_xgb, 
        param_distributions=param_grid, 
        n_iter=10, 
        cv=TimeSeriesSplit(n_splits=3), # Nested time-series CV for tuning
        scoring='neg_mean_absolute_error',
        random_state=42,
        n_jobs=-1
    )
    
    search.fit(X_train, y_train)
    best_model = search.best_estimator_
    
    print(f"\nBest XGBoost Parameters: {search.best_params_}")

    # 3. Evaluate the Best Model
    test_preds = best_model.predict(X_test)
    evaluate_metrics(y_test, test_preds, "Out-of-Sample Test")

    # 4. Save the Optimized Model
    current_dir = os.path.dirname(__file__)
    save_path = os.path.abspath(os.path.join(current_dir, "..", "..", "saved_models", "best_regression_model.joblib"))
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    joblib.dump(best_model, save_path)
    print(f"\nOptimized model successfully saved to {save_path}")

if __name__ == "__main__":
    train_and_save()