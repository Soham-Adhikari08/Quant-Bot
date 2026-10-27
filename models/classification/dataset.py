"""
models/classification/dataset.py
Person A - Team C: Data, Labeling, and Feature Preparation for Confidence Classifier
"""

import pandas as pd
import numpy as np
from typing import Optional

def build_confidence_dataset(
    predictions_df: pd.DataFrame,
    market_context_df: pd.DataFrame,
    cost_threshold: float = 0.001,
    error_threshold: Optional[float] = None
) -> pd.DataFrame:
    """
    Merges Team B's out-of-sample predictions with Team A's market context features,
    computes residuals, and generates the binary 'reliable' target label.
    """
    # 1. Merge on timestamp (strictly left join on prediction timestamps)
    predictions_df["timestamp"] = pd.to_datetime(predictions_df["timestamp"])
    market_context_df["timestamp"] = pd.to_datetime(market_context_df["timestamp"])
    
    merged = pd.merge_asof(
        predictions_df.sort_values("timestamp"),
        market_context_df.sort_values("timestamp"),
        on="timestamp",
        direction="backward"
    )

    # 2. Derive diagnostic error columns
    merged["prediction_error"] = merged["predicted_return"] - merged["actual_return"]
    merged["absolute_error"] = merged["prediction_error"].abs()
    merged["prediction_magnitude"] = merged["predicted_return"].abs()

    # 3. Compute target label: 'reliable'
    if error_threshold is not None:
        merged["reliable"] = (merged["absolute_error"] <= error_threshold).astype(int)
    else:
        # Directional agreement that overcomes transaction fees
        sign_match = np.sign(merged["predicted_return"]) == np.sign(merged["actual_return"])
        cost_hurdle = merged["actual_return"].abs() > cost_threshold
        merged["reliable"] = (sign_match & cost_hurdle).astype(int)

    # Ensure chronologically sorted
    return merged.sort_values("timestamp").reset_index(drop=True)