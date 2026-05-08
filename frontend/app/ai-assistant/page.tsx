"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState, ErrorState } from "@/components/ui/States";
import { Card } from "@/components/ui/Card";
import { Bot, RefreshCw, AlertTriangle, FileText, Activity, ShieldAlert, CheckCircle2 } from "lucide-react";
import { 
  getPreviousInsights, 
  generateFinancialSummary, 
  generatePortfolioRiskSummary, 
  generateMonthlyReport 
} from "@/lib/api";

export default function AIAssistantPage() {
  const router = useRouter();
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [generatingStatus, setGeneratingStatus] = useState<string | null>(null);

  const fetchInsights = async () => {
    try {
      const data = await getPreviousInsights();
      setInsights(data);
    } catch (err: any) {
      if (err.message === "Unauthorized") {
        router.push("/login");
      } else {
        setError("Failed to fetch past insights.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [router]);

  const handleGenerate = async (type: 'financial' | 'portfolio' | 'monthly') => {
    setGeneratingStatus(type);
    setError(null);
    try {
      if (type === 'financial') await generateFinancialSummary();
      else if (type === 'portfolio') await generatePortfolioRiskSummary();
      else if (type === 'monthly') await generateMonthlyReport();
      
      // Refresh the list after generation
      await fetchInsights();
    } catch (err: any) {
      setError(`Failed to generate ${type} insight: ` + err.message);
    } finally {
      setGeneratingStatus(null);
    }
  };

  if (loading && insights.length === 0) return <LoadingState title="Waking up the AI..." />;

  return (
    <div className="animate-in fade-in duration-500 pb-12 max-w-5xl mx-auto">
      <PageHeader 
        title="AI Financial Assistant" 
        description="Receive educational insights regarding your financial habits and portfolio."
      />

      {error && <ErrorState title="AI Error" description={error} inCard={true} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-6">
        <Card className="hover:border-indigo-500/50 transition-colors flex flex-col group">
          <div className="mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4">
              <Activity className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-base font-semibold text-slate-100">Spending Analysis</h3>
            <p className="text-sm text-slate-400 mt-2">Get an educational observation based on your recent income, expenses, and top categories.</p>
          </div>
          <div className="mt-auto pt-4">
            <button 
              onClick={() => handleGenerate('financial')}
              disabled={generatingStatus !== null}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-400 font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {generatingStatus === 'financial' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
              {generatingStatus === 'financial' ? 'Generating...' : 'Analyze Spending'}
            </button>
          </div>
        </Card>

        <Card className="hover:border-emerald-500/50 transition-colors flex flex-col group">
          <div className="mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-4">
              <ShieldAlert className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-base font-semibold text-slate-100">Portfolio Risk</h3>
            <p className="text-sm text-slate-400 mt-2">Analyze your asset allocation and concentration to generate a risk awareness profile.</p>
          </div>
          <div className="mt-auto pt-4">
            <button 
              onClick={() => handleGenerate('portfolio')}
              disabled={generatingStatus !== null}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {generatingStatus === 'portfolio' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
              {generatingStatus === 'portfolio' ? 'Generating...' : 'Analyze Portfolio'}
            </button>
          </div>
        </Card>

        <Card className="hover:border-sky-500/50 transition-colors flex flex-col group">
          <div className="mb-4">
            <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-base font-semibold text-slate-100">Health Report</h3>
            <p className="text-sm text-slate-400 mt-2">Generate an overall monthly financial health report based on your holistic data.</p>
          </div>
          <div className="mt-auto pt-4">
            <button 
              onClick={() => handleGenerate('monthly')}
              disabled={generatingStatus !== null}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-sky-500/20 text-slate-300 hover:text-sky-400 font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {generatingStatus === 'monthly' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
              {generatingStatus === 'monthly' ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </Card>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-slate-500" />
          Recent Insights
        </h2>
        {generatingStatus && (
          <span className="text-sm text-indigo-400 animate-pulse flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> AI is thinking...
          </span>
        )}
      </div>

      <div className="space-y-4">
        {insights.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-500">
            No insights generated yet. Click one of the buttons above to get started.
          </div>
        ) : (
          insights.map((insight) => (
            <Card key={insight.id} className="relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-slate-700 group-hover:bg-indigo-500 transition-colors" />
              <div className="flex justify-between items-start mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {insight.prompt.includes('fallback') ? 'Rule-Based Engine' : 'AI Engine'} • {insight.prompt.split(' ')[0]}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(insight.generated_at).toLocaleString()}
                </span>
              </div>
              <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {insight.insight}
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="mt-12 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-400/80 leading-relaxed">
          <strong>Important Disclaimer:</strong> All insights generated on this platform are for educational and demonstrative purposes only. 
          The information provided does not constitute financial, investment, or trading advice. You should always conduct your own research 
          or consult with a certified financial professional before making any financial decisions.
        </p>
      </div>
    </div>
  );
}
