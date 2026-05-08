"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState, ErrorState } from "@/components/ui/States";
import { Card } from "@/components/ui/Card";
import { ArrowRightLeft, ActivitySquare, AlertCircle, TrendingUp, TrendingDown, BookOpen } from "lucide-react";
import { getUserOrders, getOrderBook, getUserTrades, createOrder } from "@/lib/api";

export default function TradingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [orderBook, setOrderBook] = useState<{bids: any[], asks: any[]}>({ bids: [], asks: [] });
  const [orders, setOrders] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);

  // Form state
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // We'll hardcode assetId = 1 (e.g. BTC) for the simulator MVP
  const ASSET_ID = 1;

  const fetchData = async () => {
    try {
      const [bookData, ordersData, tradesData] = await Promise.all([
        getOrderBook(ASSET_ID),
        getUserOrders(),
        getUserTrades()
      ]);
      setOrderBook(bookData);
      setOrders(ordersData);
      setTrades(tradesData);
    } catch (err: any) {
      if (err.message === "Unauthorized") {
        router.push("/login");
      } else {
        setError("Failed to fetch trading data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // In a real app we'd use WebSockets. For this MVP simulator, we can poll every 5s or just rely on manual/after-trade refresh.
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || !quantity) return;
    setSubmitting(true);
    try {
      await createOrder({
        asset_id: ASSET_ID,
        side,
        price: parseFloat(price),
        quantity: parseFloat(quantity)
      });
      // Refresh immediately
      await fetchData();
      setPrice("");
      setQuantity("");
    } catch (err: any) {
      alert(err.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && orders.length === 0) return <LoadingState title="Loading trading engine..." />;
  if (error) return <ErrorState title="Simulator Error" description={error} />;

  const openOrders = orders.filter(o => o.status === "OPEN");

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      <PageHeader 
        title="Trading Simulator" 
        description="Test your limit orders against an educational matching engine."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left Column: Place Order & Explanation */}
        <div className="space-y-6">
          <Card>
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
                Place Limit Order
              </h3>
              <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded">BTC/USD</span>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setSide("BUY")}
                  className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${side === "BUY" ? "bg-emerald-500/20 text-emerald-400" : "text-slate-500 hover:text-slate-300"}`}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => setSide("SELL")}
                  className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${side === "SELL" ? "bg-rose-500/20 text-rose-400" : "text-slate-500 hover:text-slate-300"}`}
                >
                  Sell
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Price (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. 60000"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Quantity (BTC)</label>
                <input
                  type="number"
                  step="0.00000001"
                  required
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. 0.5"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-2.5 font-medium rounded-lg transition-colors disabled:opacity-50 mt-2 ${side === "BUY" ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-rose-500 hover:bg-rose-600 text-white"}`}
              >
                {submitting ? "Placing..." : `Place ${side} Order`}
              </button>
            </form>
          </Card>

          <div className="p-5 bg-sky-500/10 border border-sky-500/20 rounded-xl">
            <h4 className="text-sm font-semibold text-sky-400 flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4" />
              How the matching engine works
            </h4>
            <p className="text-xs text-sky-200/70 leading-relaxed mb-2">
              This simulator uses a <strong>Price-Time Priority</strong> matching algorithm similar to real exchanges.
            </p>
            <ul className="text-xs text-sky-200/70 space-y-1 list-disc list-inside">
              <li><strong>Buy orders</strong> match with the lowest available sell order price.</li>
              <li><strong>Sell orders</strong> match with the highest available buy order price.</li>
              <li>Partial fills happen if opposite quantity is smaller.</li>
            </ul>
          </div>
        </div>

        {/* Middle Column: Order Book */}
        <Card className="flex flex-col h-[500px]">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <ActivitySquare className="w-4 h-4 text-slate-400" />
              Order Book (BTC/USD)
            </h3>
          </div>
          
          <div className="flex-1 flex flex-col overflow-hidden font-mono text-sm">
            {/* Table Header */}
            <div className="grid grid-cols-2 px-4 py-2 border-b border-slate-800 text-xs text-slate-500">
              <div>Price (USD)</div>
              <div className="text-right">Quantity</div>
            </div>

            {/* Asks (Sells) - Show bottom 8 */}
            <div className="flex-1 overflow-hidden flex flex-col-reverse justify-start">
              {orderBook.asks.slice(0, 8).reverse().map((ask: any, i: number) => (
                <div key={`ask-${i}`} className="grid grid-cols-2 px-4 py-1.5 hover:bg-rose-500/10 cursor-pointer transition-colors group">
                  <div className="text-rose-400">{ask.price.toFixed(2)}</div>
                  <div className="text-right text-slate-300">{ask.quantity.toFixed(4)}</div>
                </div>
              ))}
            </div>

            {/* Spread Indicator */}
            <div className="py-2 px-4 bg-slate-950/50 border-y border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-400">
              <div className="flex items-center gap-1">Spread <TrendingUp className="w-3 h-3" /></div>
              <div>---</div>
            </div>

            {/* Bids (Buys) - Show top 8 */}
            <div className="flex-1 overflow-hidden flex flex-col justify-start">
              {orderBook.bids.slice(0, 8).map((bid: any, i: number) => (
                <div key={`bid-${i}`} className="grid grid-cols-2 px-4 py-1.5 hover:bg-emerald-500/10 cursor-pointer transition-colors group">
                  <div className="text-emerald-400">{bid.price.toFixed(2)}</div>
                  <div className="text-right text-slate-300">{bid.quantity.toFixed(4)}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Right Column: User Open Orders & Trades */}
        <div className="space-y-6 h-[500px] flex flex-col">
          <Card className="flex-1 flex flex-col min-h-0">
            <div className="p-4 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-100">Your Open Orders</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {openOrders.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">No open orders</div>
              ) : (
                <div className="space-y-2">
                  {openOrders.map(o => (
                    <div key={o.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                      <div className="flex justify-between mb-1">
                        <span className={`font-bold ${o.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>{o.side}</span>
                        <span className="text-slate-400">{new Date(o.created_at).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-300">${o.price.toFixed(2)}</span>
                        <span className="text-slate-300">{o.quantity - o.filled_quantity} left</span>
                      </div>
                      <div className="mt-2 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${o.side === 'BUY' ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                          style={{width: `${(o.filled_quantity / o.quantity) * 100}%`}}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card className="flex-1 flex flex-col min-h-0">
            <div className="p-4 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-100">Trade History</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {trades.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">No trades yet</div>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 sticky top-0">
                    <tr className="text-slate-500">
                      <th className="font-medium p-3">Time</th>
                      <th className="font-medium p-3 text-right">Price</th>
                      <th className="font-medium p-3 text-right">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {trades.map(t => (
                      <tr key={t.id} className="border-t border-slate-800 hover:bg-slate-800/30">
                        <td className="p-3 text-slate-400">{new Date(t.executed_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</td>
                        <td className="p-3 text-right text-slate-200">${t.price.toFixed(2)}</td>
                        <td className="p-3 text-right text-slate-400">{t.quantity.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
