from sklearn.ensemble import RandomForestClassifier
from sklearn.calibration import CalibratedClassifierCV

def get_base_model():
    # Standard classifier before probability calibration
    return RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)

def get_calibrator(trained_base_model):
    # Wrapper to calibrate probabilities (ensures 0.85 actually means 85% confidence)
    return CalibratedClassifierCV(estimator=trained_base_model, method='sigmoid', cv='prefit')
