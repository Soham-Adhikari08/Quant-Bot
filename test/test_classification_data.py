"""
tests/test_classification_data.py
Sanity and leakage tests for Team C datasets.
"""

import pytest
import pandas as pd
import numpy as np

TRAIN_PATH = "data/processed/classification_train.csv"
VAL_PATH = "data/processed/classification_val.csv"
TEST_PATH = "data/processed/classification_test.csv"

def test_temporal_ordering_and_no_overlap():
    train = pd.read_csv(TRAIN_PATH)
    val = pd.read_csv(VAL_PATH)
    test = pd.read_csv(TEST_PATH)

    train["timestamp"] = pd.to_datetime(train["timestamp"])
    val["timestamp"] = pd.to_datetime(val["timestamp"])
    test["timestamp"] = pd.to_datetime(test["timestamp"])

    # Strict non-overlapping intervals
    assert train["timestamp"].max() < val["timestamp"].min(), "Leakage: Train overlaps with Validation!"
    assert val["timestamp"].max() < test["timestamp"].min(), "Leakage: Validation overlaps with Test!"

def test_label_validity_and_balance():
    for name, path in [("train", TRAIN_PATH), ("val", VAL_PATH), ("test", TEST_PATH)]:
        df = pd.read_csv(path)
        assert "reliable" in df.columns, f"Target 'reliable' missing from {name}"
        assert df["reliable"].isin([0, 1]).all(), f"Invalid values in {name} target"
        
        balance = df["reliable"].mean()
        # Verify classes are not completely degenerate
        assert 0.05 < balance < 0.95, f"Severe class imbalance in {name}: {balance:.2%} positive"