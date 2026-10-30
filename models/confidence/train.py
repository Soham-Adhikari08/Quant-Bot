import pandas as pd
import joblib
from sklearn.metrics import brier_score_loss, roc_auc_score, classification_report
from model import get_base_model, get_calibrator

def train_and_evaluate(train_path, val_path, test_path):
    # 1. Load Data (Replace 'label_column' with Person A's exact target name)
    target = 'label_column' 
    
    train_df = pd.read_csv(train_path)
    X_train, y_train = train_df.drop(columns=[target, 'date']), train_df[target]
    
    val_df = pd.read_csv(val_path)
    X_val, y_val = val_df.drop(columns=[target, 'date']), val_df[target]
    
    test_df = pd.read_csv(test_path)
    X_test, y_test = test_df.drop(columns=[target, 'date']), test_df[target]

    # 2. Train Base Model on Training Data
    base_model = get_base_model()
    base_model.fit(X_train, y_train)

    # 3. Calibrate Strictly on Validation Data (Prevents Leakage)
    calibrated_model = get_calibrator(base_model)
    calibrated_model.fit(X_val, y_val)

    # 4. Evaluate on Test Data
    probs = calibrated_model.predict_proba(X_test)[:, 1]
    preds = calibrated_model.predict(X_test)
    
    print(f"Brier Score (Closer to 0 is better): {brier_score_loss(y_test, probs):.4f}")
    print(f"ROC-AUC: {roc_auc_score(y_test, probs):.4f}")
    print("\nClassification Report:\n", classification_report(y_test, preds))

    # 5. Save the final frozen model for inference
    joblib.dump(calibrated_model, 'confidence_model.pkl')
    print("Model saved to confidence_model.pkl")

if __name__ == "__main__":
    # Ask Person A for these exact relative paths
    train_and_evaluate('data/train.csv', 'data/val.csv', 'data/test.csv')
