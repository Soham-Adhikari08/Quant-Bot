# Market Closed Modal Notification (320px Ultra-Slim)

Provide a smooth, centered 320px modal notification when a user attempts to execute a live trade outside NSE market hours, detailing the current market status, next opening date, and opening time with dark slate styling and an amber clock accent.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed in Phase 1:
> - **Modal Footprint**: Centered 320px (`max-w-[324px]`) ultra-slim card with smooth scale-fade transition and blurred background.
> - **Action Controls**: Single `Understood` button only to dismiss the modal and return the screen back to normal.
> - **Visual Accent**: Dark slate terminal aesthetic (`#0F172A`) with an amber clock badge (`Clock` icon in amber) and amber `MARKET CLOSED` header.
> - **Schedule Details**: Short, concise broker breakdown highlighting current IST time, next market open date, and open time (09:15 AM IST).

---

### 1. Overview & Core Concept

When continuous live trading is closed (before 09:15 AM IST, after 03:30 PM IST, or on weekends/market holidays) and sandbox simulation is off, attempting to execute a trade triggers an immediate, centered 320px modal. 

The modal clearly states that regular market hours have ended and specifies the exact next trading session date and time so traders know when execution resumes.

---

### 2. User Experience & Visual Design

#### Visual Specifications
- **Modal Dimensions**: `max-w-[324px] w-full bg-[#0F172A] border border-slate-800 rounded-2xl p-4 shadow-2xl shadow-slate-950/90 text-white z-50`
- **Backdrop**: Smooth scale-fade transition with `bg-slate-950/70 backdrop-blur-sm` that closes on click, Escape key, or button.
- **Header**:
  - Amber badge icon (`w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500`).
  - Title: `MARKET CLOSED` in bold amber uppercase (`text-xs font-bold text-amber-500 tracking-wider`).
  - Subtitle: `Regular trading session has concluded.`
- **Schedule Breakdown Table** (Clean broker grid):
  - Row 1: `Attempted Order` → `[BUY/SELL] {quantity} {symbol}` (`text-slate-300 font-mono text-xs`)
  - Row 2: `Current Time` → IST timestamp (`text-slate-400 font-mono text-xs`)
  - Divider: `border-t border-slate-800/90`
  - Row 3: `Next Market Open` → `{Next Date} at 09:15 AM IST` (`text-emerald-400 font-mono text-xs font-semibold`)
- **Primary Action**:
  - A single `Understood` button (`w-full py-2.5 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 transition-colors cursor-pointer`).

---

### 3. Key Product Decisions & Trade-Offs

- **Dedicated Modal vs Inline Banner**:
  - *Chosen*: Dedicated centered modal matches the design language established for the insufficient balance alert, providing immediate, focused feedback without displacing page contents.
- **Accurate Next Open Date Calculation**:
  - *Chosen*: Calculate the exact weekday date (e.g. if closed on Friday afternoon, calculate the upcoming Monday date; if closed on Monday evening, calculate Tuesday date).

---

### 4. Technical Architecture & Component Flow

```
┌─────────────────────────────────────────────────────────────┐
│                       TradingContext                        │
│   executeTrade() -> check (!marketStatus.isOpen)            │
│   triggers setMarketClosedAlert({ symbol, type, qty, ... }) │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 MarketClosedModal.tsx (320px)               │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  Backdrop: bg-slate-950/70 backdrop-blur-sm         │   │
│   │                                                     │   │
│   │  Card (324px): bg-[#0F172A]                         │   │
│   │  ┌───────────────────────────────────────────────┐  │   │
│   │  │ [🕒] MARKET CLOSED (Amber)            [x]     │  │   │
│   │  │ Regular trading session has concluded         │  │   │
│   │  ├───────────────────────────────────────────────┤  │   │
│   │  │ Order:       BUY 10 RELIANCE                  │  │   │
│   │  │ Current:     09:22 PM IST                     │  │   │
│   │  │ Next Open:   Tomorrow, 3 Nov 2026, 09:15 AM   │  │   │
│   │  ├───────────────────────────────────────────────┤  │   │
│   │  │ [ Understood ]                                │  │   │
│   │  └───────────────────────────────────────────────┘  │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

### 5. Verification Plan

1. **Trigger Check**: When market is closed and simulation override is OFF, click "Execute Trade". Verify the 320px modal pops up in the middle of the screen with backdrop blur.
2. **Date & Time Accuracy**: Confirm current IST time and next market open date (e.g., Tomorrow or Monday date) are clearly formatted.
3. **Smooth Dismissal**: Click "Understood", click backdrop, or hit Escape; ensure modal animates out smoothly and returns screen to normal.
4. **Build & Lint**: Run `compile_applet` and `lint_applet` to guarantee error-free compilation.
