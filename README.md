# QuantBot — AI Quantitative Trading System

A modular AI-driven trading system that combines return prediction with prediction confidence to generate risk-aware trading signals.

---

## Overview

QuantBot is an experimental quantitative trading system designed to investigate whether combining an AI regression model with a separate confidence model can produce better trading decisions than using a return prediction alone.

The system is built around two core AI models:

1. **Regression AI** — predicts the future return of an asset.
2. **Confidence AI** — estimates how reliable or useful the regression prediction is.

The two outputs are combined by a strategy layer before being passed to the execution and risk-management systems.

### Core Architecture

```text
                    MARKET DATA
                         |
              +----------+----------+
              |                     |
              v                     v
        REGRESSION AI        CONFIDENCE AI
        "What happens?"      "Can I trust it?"
              |                     |
              |                     |
       Predicted Return       Confidence Score
          +2.40%                    87%
              |                     |
              +----------+----------+
                         |
                         v
                   FUSION ENGINE
                         |
                         v
                  TRADING SIGNAL
                         |
                         v
              RISK & POSITION SIZING
                         |
                         v
                  ORDER EXECUTION
                         |
                         v
                SIMULATED EXCHANGE
```

---

## Project Objectives

- Predict future asset returns using machine learning.
- Estimate the reliability of those predictions.
- Combine prediction magnitude with model confidence.
- Simulate realistic market conditions.
- Account for transaction costs, spread and slippage.
- Backtest strategies using historical or simulated data.
- Compare regression-only and confidence-aware strategies.
- Measure performance using both machine-learning and trading metrics.

---

## AI Architecture

### 1. Regression AI

The regression model predicts a continuous future return.

For a prediction horizon `h`:

```text
R(t,h) = (Price(t+h) - Price(t)) / Price(t)
```

Example:

```text
Current price:  ₹100
Future price:   ₹102.40

Return:
                +2.40%
```

The sign of the regression output naturally determines direction:

```text
Positive return -> Bullish
Negative return -> Bearish
```

The regression model therefore does not require a separate direction classifier.

---

### 2. Confidence AI

The confidence model does not primarily predict whether the market will go up or down.

Instead, it estimates:

> How reliable is the regression model's prediction under the current market conditions?

Example:

```text
Regression prediction:  +2.40%
Confidence:             87%
```

Another example:

```text
Regression prediction:  -3.00%
Confidence:             35%
```

The second prediction is still bearish, but the system recognizes that the prediction is relatively unreliable.

### Important Training Rule

The confidence model must be trained using **out-of-sample regression predictions**.

This prevents the confidence model from learning from unrealistically accurate in-sample predictions and helps prevent data leakage.

---

## Signal Fusion

The initial fusion mechanism is:

```text
Final Signal = Predicted Return × Confidence
```

Example:

```text
Predicted return = +2.40%
Confidence       = 87%

Final signal = 2.40 × 0.87
             = +2.088%
```

Another example:

```text
Predicted return = -3.00%
Confidence       = 35%

Final signal = -3.00 × 0.35
             = -1.05%
```

The resulting signal is then passed to the strategy and risk-management layers.

The fusion mechanism may evolve as experiments determine whether a simple confidence-weighted signal or a learned meta-model performs better.

---

## System Components

```text
quantbot/
|
├── exchange/
|   └── Simulated market and execution system
|
├── models/
|   ├── regression/
|   |   └── Future-return prediction
|   |
|   └── confidence/
|       └── Prediction reliability estimation
|
├── strategy/
|   └── Signal fusion, position sizing and risk
|
├── backtesting/
|   └── Historical/simulated strategy evaluation
|
├── data/
|   ├── raw/
|   └── processed/
|
├── tests/
|   └── Automated testing
|
└── docs/
    └── Project documentation
```

---

## Team Structure

### Team A — Simulated Exchange

Responsible for creating the trading environment.

Responsibilities:

- Market data generation
- OHLCV generation
- Market regimes
- Order execution
- Bid/ask spread
- Slippage
- Transaction costs
- Portfolio tracking
- Position management

Location:

```text
exchange/
```

---

### Team B — Regression AI

Responsible for predicting future returns.

Responsibilities:

- Feature engineering
- Target generation
- Regression model selection
- Model training
- Validation
- Prediction pipeline
- Model evaluation

Location:

```text
models/regression/
```

Output:

```text
predicted_return
```

Example:

```text
+0.024
```

---

### Team C — Confidence AI

Responsible for estimating the reliability of the regression prediction.

Responsibilities:

- Confidence-label generation
- Out-of-sample regression predictions
- Classification model
- Confidence calibration
- Reliability evaluation
- Confidence prediction pipeline

Location:

```text
models/confidence/
```

Output:

```text
confidence
```

Example:

```text
0.87
```

---

## Market Simulation

The simulated exchange should eventually support different market regimes.

Examples:

- Bull market
- Bear market
- Sideways market
- High-volatility market
- Crash
- Momentum
- Mean-reversion

This allows the models to be tested under different conditions instead of only one type of market.

---

## Execution Model

The exchange should simulate realistic trading conditions including:

```text
Market Price
     |
     +-- Bid
     +-- Ask
     +-- Spread
     +-- Slippage
     +-- Transaction Fees
```

This prevents the backtest from assuming that every trade can be executed at the theoretical market price with zero costs.

---

## Backtesting

The backtesting engine will evaluate the complete system.

### Baseline

```text
Market Data
     |
Regression
     |
Trading Strategy
```

### Proposed System

```text
Market Data
     |
Regression
     |
Confidence AI
     |
Fusion
     |
Trading Strategy
```

The goal is to determine whether adding prediction confidence produces measurable improvements.

---

## Evaluation Metrics

### Machine Learning Metrics

#### Regression

- MAE
- RMSE
- R²
- Directional accuracy

#### Confidence Model

- Accuracy
- Precision
- Recall
- F1-score
- ROC-AUC
- Calibration

### Trading Metrics

- Total return
- Annualized return
- Sharpe ratio
- Sortino ratio
- Maximum drawdown
- Win rate
- Profit factor
- Number of trades
- Average trade return
- Transaction costs

---

## Data Leakage Prevention

Because this is a time-series problem, preventing future information from entering the training process is critical.

The project should use chronological data splitting:

```text
Past
 |
 v
Training Data
 |
 v
Validation Data
 |
 v
Test Data
 |
 v
Future
```

Randomly shuffling financial time-series data should generally be avoided when it allows future observations to influence training.

The confidence model must also use **out-of-sample predictions from the regression model** when generating its training labels and features.

---

## Experiments

The project will compare multiple configurations.

### Experiment 1 — Regression Only

```text
Market Data
     |
Regression
     |
Trading Signal
```

### Experiment 2 — Confidence Weighted

```text
Market Data
     |
Regression
     |
Confidence AI
     |
Fusion
     |
Trading Signal
```

### Experiment 3 — Advanced Fusion

A later version may use a meta-model:

```text
Regression Prediction
Confidence
Volatility
Spread
Volume
Market Regime
       |
       v
   Meta Model
       |
       v
Expected Net Return
```

This will only be introduced after the simpler architecture has been tested.

---

## Development Phases

### Phase 1 — Foundation

- Repository
- Data structures
- Simulated exchange
- Basic data generation

### Phase 2 — Regression

- Feature pipeline
- Regression model
- Training
- Validation
- Prediction API

### Phase 3 — Confidence

- Generate out-of-sample regression predictions
- Build confidence labels
- Train confidence model
- Calibrate confidence

### Phase 4 — Integration

- Fusion engine
- Strategy
- Position sizing
- Risk management

### Phase 5 — Backtesting

- Complete trading loop
- Transaction costs
- Slippage
- Performance metrics
- Walk-forward validation

### Phase 6 — Dashboard

- Live simulated price
- Model predictions
- Confidence
- Trading signals
- Portfolio
- Performance charts

---

## Technology Stack

Initial stack:

- Python
- NumPy
- Pandas
- Scikit-learn
- Matplotlib
- Plotly
- PyYAML

Potential future additions:

- XGBoost
- LightGBM
- PyTorch
- FastAPI
- Streamlit
- PostgreSQL

The final stack will be determined based on model and system requirements.

---

## Project Status

**Currently in development**

### Current Milestone

```text
[✓] Initial repository
[ ] Simulated exchange
[ ] Data pipeline
[ ] Regression model
[ ] Confidence model
[ ] Signal fusion
[ ] Risk management
[ ] Backtesting
[ ] Dashboard
```

---

## Disclaimer

QuantBot is an educational and research project.

It is designed for experimentation with machine learning, quantitative finance and algorithmic trading.

It is not financial advice and should not be used for real-money trading without extensive additional validation, risk controls and regulatory consideration.

---

## Project

**QuantBot**

AI-based confidence-aware quantitative trading system.

```text
Predict the return.
Measure the confidence.
Trade the signal.
Test the result.
```