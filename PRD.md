# FinTech Intelligence Platform - Product Requirements Document (PRD)

## 1. Product Overview
The **FinTech Intelligence Platform** is a comprehensive, educational full-stack web application designed to demonstrate mastery of modern web development, financial algorithms, and data visualization. It provides users with tools to track personal finances, analyze investment portfolio risks, interact with an AI-powered financial assistant, and simulate a limit order book.

**Disclaimer:** This application is for educational purposes only and does not provide real financial advice.

---

## 2. MVP Scope (Minimum Viable Product)
The MVP will focus on the core user journey, establishing the complete full-stack infrastructure from database to frontend.

1. **Infrastructure setup:** Dockerized Next.js, FastAPI, and PostgreSQL environments.
2. **Personal Finance Dashboard:** Static manual entry for income/expenses and basic Recharts visualizations.
3. **Portfolio Analyzer:** Manual entry of assets (ticker/name, percentage allocation) and a simple pie chart showing concentration risk.
4. **AI Assistant Integration:** Basic OpenAI/LLM integration to provide educational feedback based on the dashboard and portfolio data.
5. **Mini Trading Simulator:** An in-memory or basic database-backed limit order book that matches buy/sell orders using price-time priority.

---

## 3. Full Feature List
### 3.1. Personal Finance Dashboard
- **Income/Expense Tracking:** CRUD operations for financial transactions.
- **Categorization:** Auto-sum spending by categories (Food, Housing, Utilities, etc.).
- **Budget Analysis:** Target vs. Actual spending analysis.
- **Financial Health Score:** Algorithmic calculation based on savings rate, fixed vs. variable expenses.

### 3.2. Portfolio Risk Analyzer
- **Asset Allocation:** Add/remove assets with weights (must sum to 100%).
- **Risk Scoring:** Basic volatility/risk score calculation based on asset class mapping.
- **Diversification Visualization:** Treemap or Pie charts showing sector and asset class concentration.

### 3.3. AI Financial Assistant
- **Context-Aware Insights:** Sends aggregated user data (anonymized/summarized) to the LLM to explain the user's financial standing.
- **Spending Summaries:** "You spent 40% of your income on Housing this month, which is within the recommended 30-40% range."
- **Educational Disclaimers:** Strict guardrails ensuring all responses contain educational disclaimers.

### 3.4. Mini Trading / Order Book Simulator
- **Order Entry:** Submit Buy or Sell Limit orders (Price, Quantity).
- **Order Book View:** Real-time or polled view of the Bid/Ask spread and depth.
- **Matching Engine:** Price-time priority matching logic.
- **Trade History:** Log of executed trades (Price, Quantity, Timestamp).

---

## 4. Database Entities (PostgreSQL)

| Entity | Description | Core Fields |
| :--- | :--- | :--- |
| `User` | Represents the platform user. | `id`, `email`, `created_at` |
| `Transaction` | Income/Expense entries. | `id`, `user_id`, `amount`, `type` (income/expense), `category`, `date` |
| `Budget` | Monthly budget targets. | `id`, `user_id`, `category`, `target_amount`, `month` |
| `PortfolioItem` | Holdings in the risk analyzer. | `id`, `user_id`, `ticker_symbol`, `allocation_percentage`, `asset_class` |
| `Order` | Limit orders for the simulator. | `id`, `user_id`, `side` (buy/sell), `price`, `quantity`, `status` (open/filled/canceled), `timestamp` |
| `Trade` | Executed matches from the order book. | `id`, `buy_order_id`, `sell_order_id`, `execution_price`, `quantity`, `timestamp` |

---

## 5. API Module List (FastAPI)

1. `POST /api/v1/auth/register` & `POST /api/v1/auth/login` (Authentication)
2. `GET/POST/PUT/DELETE /api/v1/transactions` (Finance Dashboard)
3. `GET /api/v1/finance/health-score` (Calculates health score)
4. `GET/POST /api/v1/portfolio` (Manage asset allocations)
5. `GET /api/v1/portfolio/risk` (Calculates risk metrics)
6. `POST /api/v1/ai/insight` (Generates LLM insights based on user data)
7. `POST /api/v1/trading/order` (Submit limit order)
8. `GET /api/v1/trading/book` (View order book depth)
9. `GET /api/v1/trading/history` (View executed trades)

---

## 6. Frontend Pages (Next.js)

- **`/` (Landing Page):** Showcase platform features and CV positioning.
- **`/dashboard`:** Personal finance overview, charts, and health score.
- **`/portfolio`:** Asset allocation entry forms and risk visualization charts.
- **`/ai-assistant`:** Chat-like interface for interacting with the financial assistant.
- **`/trading`:** Order book UI, order submission form, and trade history table.

---

## 7. Development Roadmap

- **Phase 1: Foundation (Current)**
  - Scaffold Next.js frontend and FastAPI backend.
  - Setup Docker compose, PostgreSQL, and Alembic migrations.
  - Define SQLAlchemy models.
- **Phase 2: Personal Finance & Portfolio**
  - Implement CRUD APIs for Transactions and Portfolio Items.
  - Build UI with Recharts for financial visualization.
- **Phase 3: Trading Simulator**
  - Implement the matching engine logic (price-time priority).
  - Build the Order Book and Order Entry UI.
- **Phase 4: AI & Polish**
  - Integrate OpenAI/LLM for the financial assistant.
  - Apply Tailwind CSS styling for a premium, professional look.
  - Write tests (pytest) for core backend logic.

---

## 8. CV Positioning Explanation

This project is explicitly designed to act as a **"hire me" beacon** for high-tier tech and FinTech roles. Here is how it translates to your CV:

* **"Full-Stack Engineering"**: Proves you can manage complex state on the frontend (Next.js/React) while building robust, typed APIs on the backend (FastAPI/Python).
* **"System Design & Algorithms"**: The **Order Book Simulator** is a classic algorithmic challenge. Implementing price-time priority matching demonstrates a deep understanding of data structures, concurrency concepts, and exchange mechanics.
* **"Data Modeling & Databases"**: Utilizing PostgreSQL with SQLAlchemy and Alembic migrations shows you understand production-grade relational database design.
* **"AI Integration"**: The **AI Financial Assistant** demonstrates your ability to build "wrapper" applications and safely integrate LLMs into traditional software architectures with strict guardrails (educational only).
* **"DevOps & Delivery"**: Dockerizing the entire stack proves you understand modern deployment pipelines and can ship code that runs reliably in any environment.
