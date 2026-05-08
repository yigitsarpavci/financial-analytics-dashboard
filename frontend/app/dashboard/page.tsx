"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { Card } from "@/components/ui/Card";
import { LoadingState, ErrorState } from "@/components/ui/States";
import { Wallet, TrendingUp, CreditCard, Activity } from 'lucide-react';
import { getTransactions, getPortfolio } from "@/lib/api";

export default function Dashboard() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [txData, pfData] = await Promise.all([
          getTransactions(),
          getPortfolio()
        ]);
        setTransactions(txData);
        setPortfolio(pfData);
      } catch (err: any) {
        if (err.message === "Unauthorized") {
          localStorage.removeItem("auth_token");
          router.push("/login");
        } else {
          setError("Failed to fetch dashboard data");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading) return <LoadingState title="Loading dashboard..." />;
  if (error) return <ErrorState title="Dashboard Error" description={error} />;

  const totalIncome = transactions.filter((t: any) => t.type === 'INCOME').reduce((acc: number, t: any) => acc + t.amount, 0);
  const totalExpense = transactions.filter((t: any) => t.type === 'EXPENSE').reduce((acc: number, t: any) => acc + t.amount, 0);
  const cashBalance = totalIncome - totalExpense;

  const portfolioValue = portfolio.reduce((acc: number, item: any) => acc + (item.quantity * item.average_buy_price), 0);
  const totalNetWorth = cashBalance + portfolioValue;

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader 
        title="Overview" 
        description="A high-level summary of your financial intelligence platform."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          title="Net Worth" 
          value={`$${totalNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={Wallet}
        />
        <MetricCard 
          title="Cash Balance" 
          value={`$${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={CreditCard}
        />
        <MetricCard 
          title="Portfolio Value" 
          value={`$${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={TrendingUp}
        />
        <MetricCard 
          title="Total Transactions" 
          value={transactions.length}
          icon={Activity}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col items-center justify-center text-center min-h-[300px]">
           <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 shadow-inner">
             <Activity className="w-8 h-8 text-indigo-400" />
           </div>
           <h3 className="text-xl font-bold text-slate-100 mb-2">Ready to trade?</h3>
           <p className="text-slate-400 mb-6">Head over to the Trading Simulator to test your strategies risk-free.</p>
           <button onClick={() => router.push('/trading')} className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors shadow-md shadow-indigo-500/20">
             Launch Simulator
           </button>
        </Card>
        
        <Card className="flex flex-col items-center justify-center text-center min-h-[300px]">
           <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 shadow-inner">
             <TrendingUp className="w-8 h-8 text-emerald-400" />
           </div>
           <h3 className="text-xl font-bold text-slate-100 mb-2">Analyze Risk</h3>
           <p className="text-slate-400 mb-6">Deep dive into your portfolio's risk profile and diversification score.</p>
           <button onClick={() => router.push('/portfolio')} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors shadow-md shadow-emerald-500/20">
             View Analysis
           </button>
        </Card>
      </div>
    </div>
  );
}
