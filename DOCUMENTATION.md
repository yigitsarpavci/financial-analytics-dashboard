# FinTech Intelligence Platform - Comprehensive Documentation

This document serves as the extended technical manual, user guide, and architectural decision record (ADR) for the FinTech Intelligence Platform. It outlines how to use the system, the engineering trade-offs made during development, and troubleshooting steps.

---

## 📖 1. User Manual

### 1.1 Authentication & Onboarding
- **Demo Access:** You can log in using seeded demo accounts (e.g., `user1@example.com` to `user50@example.com` with the password `password123`).
- **Registration:** Users can register a new account. The system hashes passwords using `bcrypt` and issues a JWT token valid for 24 hours.

### 1.2 Personal Finance Dashboard
- **Overview:** Tracks your monthly income and expenses.
- **Charts:** Features a Cash Flow line chart and Category Breakdown pie chart.
- **Transactions:** A dedicated `/transactions` page allows filtering all historical transactions by `Income` or `Expense`.

### 1.3 Portfolio Risk Analyzer
- **Overview:** Evaluates your current asset allocation.
- **Risk Score:** Calculates a custom score (0-100) based on asset volatility and concentration. High concentration in a single asset (e.g., 80% Bitcoin) will dramatically increase the risk score.
- **Diversification:** Provides actionable insights on whether the portfolio is under-diversified.

### 1.4 AI Financial Assistant
- **Overview:** Generates educational financial summaries based on your real platform data.
- **LLM Mode:** If `OPENAI_API_KEY` is provided in the `.env` file, the assistant uses `gpt-3.5-turbo` to generate personalized, dynamic text.
- **Fallback Mode:** If no API key is provided, the system safely falls back to a locally processed, rule-based text engine. No API crashes will occur.

### 1.5 Trading Simulator
- **Overview:** A live limit-order trading environment.
- **Order Book:** Displays Bids (Buy orders) and Asks (Sell orders). 
- **Matching Engine:** Employs a **Price-Time Priority** matching algorithm. If you place a limit buy order at a price equal to or higher than the lowest available ask, the trade executes immediately (handling partial fills if necessary).

---

## 🏗 2. Architecture & Engineering Decisions

### 2.1 Tech Stack Justification
- **FastAPI (Backend):** Chosen for its exceptional speed and native `async` support. Since trading engines and AI calls are I/O bound, async Python provides optimal throughput.
- **Next.js 14 & App Router (Frontend):** Selected for component-based architecture and easy routing. Server Components were minimized in favor of Client Components (`"use client"`) due to the heavily interactive nature of financial charts and order books.
- **Docker Compose:** Ensures that the Next.js frontend, FastAPI backend, and PostgreSQL database run in identical environments locally and in production.

### 2.2 Known Limitations & Future Improvements
During the development of this MVP, specific architectural trade-offs were made. These should be addressed before a true enterprise production launch:

1. **Lack of WebSockets (Real-Time Updates):** 
   - *Current State:* The Trading Simulator and Order Book rely on client-side fetching/polling.
   - *Improvement:* Implement FastAPI WebSockets so the frontend order book updates instantly without refreshing when another user places an order.
2. **Synchronous Order Matching:** 
   - *Current State:* The Matching Engine runs on the main API thread. When an order is placed, the database is locked and matched synchronously.
   - *Improvement:* Offload the matching engine to a background queue (e.g., **Celery** + **Redis**) to prevent blocking the main thread during high-frequency trading.
3. **JWT Storage:** 
   - *Current State:* JWTs are stored in `localStorage`, which is standard for MVPs but vulnerable to XSS attacks.
   - *Improvement:* Move tokens to `HttpOnly` cookies.
4. **No Financial APIs:** 
   - *Current State:* Asset prices are mocked or statically entered.
   - *Improvement:* Integrate Alpaca or Yahoo Finance APIs for live ticker prices.

---

## 🐛 3. Troubleshooting & Post-Mortem Logs

Throughout development, several critical edge cases were identified and solved:

- **HTTPX Version Collision (OpenAI Client Crash):** 
  - *Issue:* An automatic dependency update to `httpx` broke the internal initialization of the `openai` Python SDK, causing the backend to crash on startup.
  - *Fix:* Explicitly pinned `httpx==0.27.2` and `bcrypt==3.2.2` in `requirements.txt`.
- **AI Initialization Security Flaw:** 
  - *Issue:* The AI service originally used `SECRET_KEY` as a fallback when `OPENAI_API_KEY` was missing, which could have accidentally leaked the JWT secret to external servers.
  - *Fix:* The initialization logic was rewritten to safely detect a missing key and instantly route traffic to the local Rule-Based Engine.
- **Frontend UI/UX Consistency:** 
  - *Issue:* Data tables and order books were misaligned due to dynamic numeric widths.
  - *Fix:* Implemented `font-variant-numeric: tabular-nums` globally in Tailwind CSS to ensure a Bloomberg Terminal-style rigid number alignment.

---

## 🚀 4. Local Setup & Testing

### Starting the Project
```bash
# 1. Clone the repository and configure .env
cp backend/.env.example backend/.env

# 2. Build and start all services
docker-compose up -d --build

# 3. Seed the database with 50 mock users and 2000+ transactions
docker-compose exec backend python app/db/seed.py
```

### Running the Test Suite
The project maintains a 100% pass rate for its core engine unit tests.
```bash
# Run Pytest with proper Python Path mapping
docker-compose exec -e PYTHONPATH=/app backend pytest app/tests/
```
