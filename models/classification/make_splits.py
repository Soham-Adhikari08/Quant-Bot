"""
models/classification/make_splits.py
Chronological splits and regime slicing (No time-travel / data leakage).
"""

import os
import pandas as pd
from typing import Tuple

def split_chronological(
    df: pd.DataFrame,
    train_ratio: float = 0.60,
    val_ratio: float = 0.20
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Strict temporal split: [Train: 0 -> T1] [Val: T1 -> T2] [Test: T2 -> end]
    """
    df = df.sort_values("timestamp").reset_index(drop=True)
    n = len(df)
    train_end = int(n * train_ratio)
    val_end = int(n * (train_ratio + val_ratio))
    
    train_df = df.iloc[:train_end].copy()
    val_df = df.iloc[train_end:val_end].copy()
    test_df = df.iloc[val_end:].copy()
    
    return train_df, val_df, test_df

def save_regime_slices(
    test_df: pd.DataFrame,
    output_dir: str = "data/processed/regimes"
):
    """
    Exports isolated regime evaluation slices (bull, bear, sideways, high_vol, crash)
    so Person B can evaluate calibrated reliability curves per market state.
    """
    os.makedirs(output_dir, exist_ok=True)
    for regime, group in test_df.groupby("regime"):
        clean_name = regime.lower().replace(" ", "_")
        path = os.path.join(output_dir, f"test_regime_{clean_name}.csv")
        group.to_csv(path, index=False)
        print(f"Saved regime slice '{regime}': {len(group)} rows -> {path}")

if __name__ == "__main__":
    # Updated to absolute import so Python finds it from the Quant-Bot root folder
    from models.classification.dataset import build_confidence_dataset 
    
    raw_preds_path = "data/raw/predictions.csv" 
    raw_market_path = "data/raw/market_context.csv"
    output_dir = "data/processed/"
    
    try:
        preds_df = pd.read_csv(raw_preds_path)
        market_df = pd.read_csv(raw_market_path)
    except FileNotFoundError:
        print("Error: Raw data missing. Ensure Team B and Team A have provided the initial CSVs.")
        exit(1)
        
    print("Building master confidence dataset...")
    master_df = build_confidence_dataset(preds_df, market_df)
    
    print("Splitting data chronologically...")
    train_df, val_df, test_df = split_chronological(master_df, train_ratio=0.70, val_ratio=0.15)
    
    os.makedirs(output_dir, exist_ok=True)
    train_df.to_csv(os.path.join(output_dir, "train.csv"), index=False)
    val_df.to_csv(os.path.join(output_dir, "val.csv"), index=False)
    test_df.to_csv(os.path.join(output_dir, "test.csv"), index=False)
    print(f"Main splits saved successfully to {output_dir}")
    
    regimes_dir = os.path.join(output_dir, "regimes")
    save_regime_slices(test_df, output_dir=regimes_dir)