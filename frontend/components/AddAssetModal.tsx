"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { addPortfolioAsset } from "@/lib/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// In a real app we'd fetch these from the backend
const ASSET_LIST = [
  { id: 1, ticker: "BTC", class: "Crypto" },
  { id: 2, ticker: "ETH", class: "Crypto" },
  { id: 3, ticker: "AAPL", class: "Stocks" },
  { id: 4, ticker: "MSFT", class: "Stocks" },
  { id: 5, ticker: "SPY", class: "ETFs" }
];

export function AddAssetModal({ isOpen, onClose, onSuccess }: Props) {
  const [assetId, setAssetId] = useState(1);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await addPortfolioAsset({
        asset_id: assetId,
        quantity: parseFloat(quantity),
        average_buy_price: parseFloat(price)
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to add asset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-slate-100">Add Portfolio Asset</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Asset</label>
            <select
              value={assetId}
              onChange={(e) => setAssetId(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {ASSET_LIST.map(a => (
                <option key={a.id} value={a.id}>{a.ticker} - {a.class}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Quantity</label>
            <input
              type="number"
              step="0.00000001"
              required
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="0.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Average Buy Price ($)</label>
            <input
              type="number"
              step="0.01"
              required
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="0.00"
            />
          </div>

          {error && <div className="text-sm text-rose-400 p-2 bg-rose-500/10 rounded-lg">{error}</div>}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Asset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
