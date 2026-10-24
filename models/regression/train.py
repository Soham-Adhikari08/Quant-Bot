import numpy as np
import joblib
import os
from model import get_model

def get_mock_data(n_samples=1000, n_features=10):
    """temp data need manthika to finish data feature des"""
    np.random.seed(42)
    X = np.random.randn(n_samples, n_features)
    # y is the target return: R(t,h)
    y = X[:, 0] * 0.01 + X[:, 1] * -0.005 + np.random.randn(n_samples) * 0.001 
    return X, y

def train_and_save():
    #replace later with given pipeline
    X, y = get_mock_data()

    train_idx = int(len(X) * 0.6)
    val_idx = int(len(X) * 0.8)

    X_train, y_train = X[:train_idx], y[:train_idx]
    X_val, y_val = X[train_idx:val_idx], y[train_idx:val_idx]
    X_test, y_test = X[val_idx:], y[val_idx:]

    print(f"Training shapes -> X: {X_train.shape}, y: {y_train.shape}")

    #train
    print("Training Linear Regression Baseline...")
    model = get_model("linear")
    model.fit(X_train, y_train)

    #mansik santulan test
    val_preds = model.predict(X_val)
    mae = np.mean(np.abs(val_preds - y_val))
    print(f"Validation MAE: {mae:.6f}")

    current_dir = os.path.dirname(__file__)
    save_path = os.path.abspath(os.path.join(current_dir, "..", "..", "saved_models", "best_regression_model.joblib"))
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    joblib.dump(model, save_path)
    print(f"Model successfully saved to {save_path}")

if __name__ == "__main__":
    train_and_save()