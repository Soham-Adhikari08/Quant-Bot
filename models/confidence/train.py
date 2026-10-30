import os
import argparse
import pandas as pd
from model import ConfidenceClassifier # Assuming the previous code is saved in model.py

def load_data_splits(data_dir):
    """
    Loads the train, validation, and test splits.
    Sync with Person A on the exact filenames, directory structure, 
    and the final name of the target label (e.g., 'is_reliable').
    """
    print(f"Loading data from {data_dir}...")
    
    try:
        # Assuming Person A exports these as CSVs or Parquet files
        train_df = pd.read_csv(os.path.join(data_dir, 'train.csv'))
        val_df = pd.read_csv(os.path.join(data_dir, 'val.csv'))
        test_df = pd.read_csv(os.path.join(data_dir, 'test.csv'))
        
        # NOTE: Coordinate with Person A to ensure the target column is named consistently.
        target_col = 'is_reliable' 
        
        X_train = train_df.drop(columns=[target_col])
        y_train = train_df[target_col]
        
        X_val = val_df.drop(columns=[target_col])
        y_val = val_df[target_col]
        
        X_test = test_df.drop(columns=[target_col])
        y_test = test_df[target_col]

        print("Data loaded successfully.")
        return X_train, y_train, X_val, y_val, X_test, y_test

    except FileNotFoundError as e:
        print(f"Error: {e}")
        print("Please check with Person A to ensure the data pipeline has exported the splits.")
        exit(1)

def main():
    parser = argparse.ArgumentParser(description="Train the Confidence Classifier (Team C - Person B)")
    parser.add_argument('--algo', type=str, choices=['xgboost', 'random_forest'], default='xgboost',
                        help='The algorithm to use for the base classifier')
    parser.add_argument('--data_dir', type=str, default='../data/processed/',
                        help='Directory containing the train.csv, val.csv, and test.csv splits from Person A')
    parser.add_argument('--model_dir', type=str, default='../saved_models/',
                        help='Directory to save the frozen calibrated model')
    
    args = parser.parse_args()

    # 1. Load the data prepared by Person A
    X_train, y_train, X_val, y_val, X_test, y_test = load_data_splits(args.data_dir)

    # 2. Initialize the model
    print(f"\nInitializing {args.algo.upper()} pipeline...")
    classifier = ConfidenceClassifier(algorithm=args.algo, random_state=42)

    # 3. Train the base model on the training set
    print("\n--- Phase 1: Training ---")
    classifier.train(X_train, y_train)

    # 4. Calibrate the model on the validation set to ensure accurate probabilities
    print("\n--- Phase 2: Calibration ---")
    # Using 'isotonic' as default, but you can switch to 'sigmoid' (Platt scaling) if data is sparse
    classifier.calibrate(X_val, y_val, method='isotonic')

    # 5. Evaluate the final calibrated model on the hold-out test set
    print("\n--- Phase 3: Evaluation ---")
    print("Testing on unseen data (Strict Data Leakage Control enforced):")
    metrics = classifier.evaluate(X_test, y_test)

    # 6. Freeze and save the model for the predict.py API / Team B integration
    print("\n--- Phase 4: Serialization ---")
    model_filename = f"confidence_classifier_{args.algo}_v2.pkl"
    save_path = os.path.join(args.model_dir, model_filename)
    classifier.save_model(save_path)
    
    print("\nTraining pipeline complete. Model is ready for the Fusion API.")

if __name__ == "__main__":
    main()