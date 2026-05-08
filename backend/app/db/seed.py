import sys
import os
import random
from datetime import datetime, timedelta

# Add the parent directory to sys.path so we can import the app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from app.db.session import SessionLocal, engine
from app.models.all_models import (
    Base, User, Transaction, Budget, Asset, Portfolio, 
    PortfolioHolding, RiskAnalysisResult, Order, Trade,
    TransactionType, OrderSide, OrderStatus
)
from app.core.security import get_password_hash

# Common constants
EXPENSE_CATEGORIES = ["Rent", "Groceries", "Transport", "Entertainment", "Education", "Utilities", "Healthcare", "Shopping"]
INCOME_CATEGORIES = ["Salary", "Freelance", "Investment", "Bonus"]

GLOBAL_ASSETS = [
    {"ticker": "AAPL", "name": "Apple Inc.", "class": "Stocks"},
    {"ticker": "MSFT", "name": "Microsoft Corp.", "class": "Stocks"},
    {"ticker": "TSLA", "name": "Tesla Inc.", "class": "Stocks"},
    {"ticker": "SPY", "name": "SPDR S&P 500", "class": "ETFs"},
    {"ticker": "QQQ", "name": "Invesco QQQ", "class": "ETFs"},
    {"ticker": "BTC", "name": "Bitcoin", "class": "Crypto"},
    {"ticker": "ETH", "name": "Ethereum", "class": "Crypto"},
    {"ticker": "GLD", "name": "SPDR Gold Trust", "class": "Commodities"},
    {"ticker": "TLT", "name": "iShares 20+ Year Treasury Bond", "class": "Bonds"},
    {"ticker": "VNQ", "name": "Vanguard Real Estate Index Fund", "class": "Real Estate"}
]

def clear_data(db):
    print("Clearing existing data...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Database cleared and schema recreated.")

def seed_assets(db):
    print("Seeding global assets...")
    assets = []
    for a in GLOBAL_ASSETS:
        asset = Asset(ticker_symbol=a["ticker"], name=a["name"], asset_class=a["class"])
        db.add(asset)
        assets.append(asset)
    db.commit()
    return assets

def seed_users_and_data(db, assets):
    print("Seeding 50 users and their data...")
    password_hash = get_password_hash("password123")
    
    now = datetime.utcnow()
    one_year_ago = now - timedelta(days=365)
    
    total_tx = 0
    
    for i in range(1, 51):
        # 1. Create User
        user = User(
            email=f"user{i}@example.com",
            hashed_password=password_hash,
            created_at=now
        )
        db.add(user)
        db.flush() # Get user.id
        
        # 2. Create Transactions (12 months, ~25 tx per user = 1250 total)
        current_date = one_year_ago
        while current_date < now:
            # Monthly Income
            db.add(Transaction(
                user_id=user.id, amount=random.uniform(4000, 8000),
                type=TransactionType.INCOME, category=random.choice(INCOME_CATEGORIES),
                date=current_date, description="Monthly Income"
            ))
            total_tx += 1
            
            # 2-3 Expenses per month
            for _ in range(random.randint(2, 4)):
                exp_date = current_date + timedelta(days=random.randint(1, 28))
                if exp_date > now: continue
                db.add(Transaction(
                    user_id=user.id, amount=random.uniform(50, 1500),
                    type=TransactionType.EXPENSE, category=random.choice(EXPENSE_CATEGORIES),
                    date=exp_date, description="Expense"
                ))
                total_tx += 1
                
            current_date += timedelta(days=30)
            
        # 3. Create Portfolio & Holdings
        portfolio = Portfolio(user_id=user.id, name="Main Portfolio")
        db.add(portfolio)
        db.flush()
        
        num_holdings = random.randint(3, 7)
        chosen_assets = random.sample(assets, num_holdings)
        allocations = [random.randint(10, 100) for _ in range(num_holdings)]
        total_alloc = sum(allocations)
        
        for j, asset in enumerate(chosen_assets):
            perc = (allocations[j] / total_alloc) * 100
            holding = PortfolioHolding(
                portfolio_id=portfolio.id,
                asset_id=asset.id,
                quantity=random.uniform(1.0, 100.0),
                average_buy_price=random.uniform(50.0, 500.0),
                allocation_percentage=perc
            )
            db.add(holding)
            
        # 4. Create dummy orders and trades
        for _ in range(random.randint(1, 3)):
            order = Order(
                user_id=user.id,
                asset_id=random.choice(assets).id,
                side=random.choice([OrderSide.BUY, OrderSide.SELL]),
                price=random.uniform(100.0, 1000.0),
                quantity=random.uniform(1.0, 10.0),
                status=OrderStatus.FILLED,
                filled_quantity=0 # Simplified, will set to filled below
            )
            order.filled_quantity = order.quantity
            db.add(order)
            db.flush()
            
            # We skip creating actual matching trades for this mock data to keep it fast, 
            # or we create a fake trade referencing this order twice (mocking it)
            trade = Trade(
                buy_order_id=order.id,
                sell_order_id=order.id,
                asset_id=order.asset_id,
                price=order.price,
                quantity=order.quantity
            )
            db.add(trade)

        if i % 10 == 0:
            print(f"  Processed {i} users...")
            db.commit() # Commit in batches

    db.commit()
    print(f"Successfully generated 50 users and {total_tx} transactions!")

def main():
    db = SessionLocal()
    try:
        clear_data(db)
        assets = seed_assets(db)
        seed_users_and_data(db, assets)
        print("Database seeding completed successfully.")
    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
