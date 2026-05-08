"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { ChartContainer } from "@/components/ui/ChartContainer";
import { LoadingState, ErrorState } from "@/components/ui/States";
import { Card } from "@/components/ui/Card";
import { CashFlowLineChart, CategoryPieChart, IncomeExpenseBarChart } from "@/components/charts/FinanceCharts";
import { AddTransactionModal } from "@/components/AddTransactionModal";
import { Plus, HeartPulse, PiggyBank, Receipt, ArrowRightLeft } from "lucide-react";
import { getMonthlySummary, getCategoryBreakdown, getCashFlow, getHealthScore, getTransactions } from "@/lib/api";

export default function FinanceDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [summary, setSummary] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [cashFlow, setCashFlow] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [recentTx, setRecentTx] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumRes, catRes, cfRes, healthRes, txRes] = await Promise.all([
        getMonthlySummary(),
        getCategoryBreakdown(),
        getCashFlow(),
        getHealthScore(),
        getTransactions()
      ]);
      setSummary(sumRes);
      setCategories(catRes);
      setCashFlow(cfRes);
      setHealth(healthRes);
      setRecentTx(txRes.slice(0, 5)); // Just top 5
    } catch (err: any) {
      if (err.message === "Unauthorized") {
        router.push("/login");
      } else {
        setError(err.message || "Failed to load dashboard data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  if (loading && !summary) return <LoadingState title="Analyzing your finances..." />;
  if (error) return <ErrorState title="Dashboard Error" description={error} />;

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      <PageHeader 
        title="Personal Finance" 
        description="Comprehensive analysis of your income, expenses, and cash flow."
        action={
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
        }
      />

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          title="Financial Health" 
          value={`${health?.score}/100`} 
          subtitle={health?.status}
          icon={HeartPulse}
          trend={{ value: 0, isPositive: health?.score >= 60 }} // Mock trend just for color
        />
        <MetricCard 
          title="Monthly Income" 
          value={`$${summary?.total_income.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
          icon={ArrowRightLeft}
        />
        <MetricCard 
          title="Monthly Expenses" 
          value={`$${summary?.total_expense.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
          icon={Receipt}
        />
        <MetricCard 
          title="Savings Rate" 
          value={`${summary?.savings_rate.toFixed(1)}%`} 
          icon={PiggyBank}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartContainer title="Cash Flow (Last 6 Months)">
          <CashFlowLineChart data={cashFlow} />
        </ChartContainer>

        <ChartContainer title="Expense Breakdown (30 Days)">
          <CategoryPieChart data={categories} />
        </ChartContainer>

        <ChartContainer title="Income vs Expense">
          <IncomeExpenseBarChart income={summary?.total_income || 0} expense={summary?.total_expense || 0} />
        </ChartContainer>

        <Card className="flex flex-col">
          <div className="p-5 border-b border-slate-800">
            <h3 className="text-base font-semibold text-slate-100">Recent Transactions</h3>
          </div>
          <div className="flex-1 overflow-auto">
            {recentTx.length === 0 ? (
              <div className="h-full flex items-center justify-center p-8 text-slate-500">
                No recent transactions
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-slate-400">
                    <th className="font-medium p-4">Date</th>
                    <th className="font-medium p-4">Category</th>
                    <th className="font-medium p-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTx.map((tx) => (
                    <tr key={tx.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                      <td className="p-4 text-slate-300">
                        {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300">
                          {tx.category}
                        </span>
                      </td>
                      <td className={`p-4 text-right font-semibold ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData} 
      />
    </div>
  );
}
