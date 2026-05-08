"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState, ErrorState } from "@/components/ui/States";
import { Card } from "@/components/ui/Card";
import { getTransactions } from "@/lib/api";
import { Search, Filter, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function TransactionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  // Filtering
  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch (err: any) {
        if (err.message === "Unauthorized") {
          router.push("/login");
        } else {
          setError("Failed to fetch transactions");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading) return <LoadingState title="Loading transactions..." />;
  if (error) return <ErrorState title="Error" description={error} />;

  // Sort by date descending
  const sortedTx = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const filteredTx = sortedTx.filter(tx => {
    if (filterType !== "ALL" && tx.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (tx.description?.toLowerCase().includes(q) || tx.category.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      <PageHeader 
        title="Transactions History" 
        description="View and filter all your historical income and expenses."
      />

      <Card className="flex flex-col min-h-[600px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search description or category..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 w-full sm:w-auto">
            <button onClick={() => setFilterType("ALL")} className={`flex-1 sm:px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${filterType === "ALL" ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"}`}>All</button>
            <button onClick={() => setFilterType("INCOME")} className={`flex-1 sm:px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${filterType === "INCOME" ? "bg-emerald-500/20 text-emerald-400" : "text-slate-500 hover:text-slate-300"}`}>Income</button>
            <button onClick={() => setFilterType("EXPENSE")} className={`flex-1 sm:px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${filterType === "EXPENSE" ? "bg-rose-500/20 text-rose-400" : "text-slate-500 hover:text-slate-300"}`}>Expense</button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          {filteredTx.length === 0 ? (
            <div className="h-[400px] flex items-center justify-center text-slate-500 flex-col gap-2">
              <Filter className="w-8 h-8 text-slate-700" />
              <p>No transactions found for these filters.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 sticky top-0">
                <tr>
                  <th className="font-medium p-4 whitespace-nowrap">Date</th>
                  <th className="font-medium p-4">Description</th>
                  <th className="font-medium p-4">Category</th>
                  <th className="font-medium p-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredTx.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-4 text-slate-400 whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-200">{tx.description || "—"}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {tx.category}
                      </span>
                    </td>
                    <td className={`p-4 text-right font-semibold whitespace-nowrap flex items-center justify-end gap-2 ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.type === 'INCOME' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
