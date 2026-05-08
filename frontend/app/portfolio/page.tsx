"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { ChartContainer } from "@/components/ui/ChartContainer";
import { LoadingState, ErrorState } from "@/components/ui/States";
import { Card } from "@/components/ui/Card";
import { AllocationDonutChart, RiskGauge } from "@/components/charts/PortfolioCharts";
import { AddAssetModal } from "@/components/AddAssetModal";
import { Plus, ShieldAlert, Crosshair, Network, TrendingUp, Trash2 } from "lucide-react";
import { getPortfolio, getPortfolioRiskAnalysis, deletePortfolioAsset } from "@/lib/api";

export default function PortfolioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [holdings, setHoldings] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [holdingsRes, analysisRes] = await Promise.all([
        getPortfolio(),
        getPortfolioRiskAnalysis()
      ]);
      setHoldings(holdingsRes);
      setAnalysis(analysisRes);
    } catch (err: any) {
      if (err.message === "Unauthorized") {
        router.push("/login");
      } else {
        setError(err.message || "Failed to load portfolio data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this asset?")) return;
    try {
      await deletePortfolioAsset(id);
      fetchData();
    } catch (err) {
      alert("Failed to delete asset");
    }
  };

  if (loading && !analysis) return <LoadingState title="Analyzing portfolio risk..." />;
  if (error) return <ErrorState title="Portfolio Error" description={error} />;

  const isAggressive = analysis?.risk_profile === "Aggressive";
  const isConservative = analysis?.risk_profile === "Conservative";

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      <PageHeader 
        title="Portfolio Risk Analyzer" 
        description="Deep dive into your asset allocations and risk exposure."
        action={
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Asset
          </button>
        }
      />

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          title="Risk Profile" 
          value={analysis?.risk_profile || "Unknown"} 
          icon={ShieldAlert}
        />
        <MetricCard 
          title="Diversification Score" 
          value={`${analysis?.diversification_score.toFixed(0)}/100`} 
          icon={Network}
        />
        <MetricCard 
          title="Largest Concentration" 
          value={`${analysis?.largest_holding_concentration.toFixed(1)}%`} 
          icon={Crosshair}
          trend={{ value: 0, isPositive: analysis?.largest_holding_concentration < 40 }} // Visual mock
        />
        <MetricCard 
          title="Total Holdings" 
          value={holdings.length.toString()} 
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="flex flex-col">
            <div className="p-5 border-b border-slate-800">
              <h3 className="text-base font-semibold text-slate-100">Asset Holdings</h3>
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-slate-400">
                    <th className="font-medium p-4">Asset</th>
                    <th className="font-medium p-4">Class</th>
                    <th className="font-medium p-4 text-right">Qty</th>
                    <th className="font-medium p-4 text-right">Avg Price</th>
                    <th className="font-medium p-4 text-right">Value</th>
                    <th className="font-medium p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">No assets in portfolio</td>
                    </tr>
                  ) : (
                    holdings.map((h) => {
                      const val = h.quantity * h.average_buy_price;
                      return (
                        <tr key={h.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                          <td className="p-4 font-semibold text-indigo-400">{h.ticker_symbol}</td>
                          <td className="p-4"><span className="text-xs bg-slate-800 px-2 py-1 rounded">{h.asset_class}</span></td>
                          <td className="p-4 text-right text-slate-300">{h.quantity}</td>
                          <td className="p-4 text-right text-slate-300">${h.average_buy_price.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                          <td className="p-4 text-right font-medium text-slate-200">${val.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                          <td className="p-4 text-center">
                            <button onClick={() => handleDelete(h.id)} className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
            <h3 className="text-lg font-semibold text-slate-100 mb-2">AI Risk Observation</h3>
            <p className="text-slate-300 leading-relaxed mb-4">{analysis?.explanation}</p>
            <div className="text-xs text-slate-500 border-t border-slate-800/50 pt-3">
              <span className="font-semibold text-rose-400/80">DISCLAIMER:</span> {analysis?.disclaimer}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <ChartContainer title="Asset Allocation" height={280}>
            <AllocationDonutChart data={analysis?.allocations || {}} />
          </ChartContainer>
          
          <ChartContainer title="Risk Algorithm Score" height={200}>
            <RiskGauge score={analysis?.risk_score || 0} />
          </ChartContainer>
        </div>
      </div>

      <AddAssetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData} 
      />
    </div>
  );
}
