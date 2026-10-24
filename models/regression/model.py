from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

def get_model(model_name: str, **kwargs):
    if model_name == "linear":
        # Linear models need feature scaling
        return Pipeline([
            ("scaler", StandardScaler()),
            ("regressor", LinearRegression(**kwargs))
        ])
    elif model_name == "rf":
        return RandomForestRegressor(
            n_estimators=kwargs.get("n_estimators", 100),
            max_depth=kwargs.get("max_depth", 10),
            random_state=42
        )
    elif model_name == "xgb":
        return XGBRegressor(
            n_estimators=kwargs.get("n_estimators", 100),
            learning_rate=kwargs.get("learning_rate", 0.05),
            max_depth=kwargs.get("max_depth", 5),
            random_state=42
        )
    else:
        raise ValueError(f"Unknown model type: {model_name}")