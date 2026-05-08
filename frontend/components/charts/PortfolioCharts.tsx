"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#64748b'];

export function AllocationDonutChart({ data }: { data: Record<string, number> }) {
  const chartData = Object.keys(data).map(key => ({
    name: key,
    value: data[key]
  })).filter(item => item.value > 0);

  if (!chartData || chartData.length === 0) return <div className="h-full flex items-center justify-center text-slate-500">No allocation data</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={90}
          paddingAngle={4}
          dataKey="value"
          stroke="none"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <RechartsTooltip 
          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
          itemStyle={{ color: '#f8fafc' }}
          formatter={(value: number) => [`${value.toFixed(1)}%`, 'Allocation']}
        />
        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function RiskGauge({ score }: { score: number }) {
  let color = "bg-emerald-500";
  if (score > 45) color = "bg-amber-500";
  if (score > 75) color = "bg-rose-500";

  return (
    <div className="w-full flex flex-col items-center justify-center h-full pt-4">
      <div className="text-5xl font-black tracking-tighter text-slate-100 mb-2">{score.toFixed(0)}</div>
      <div className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-6">Risk Score</div>
      
      <div className="w-full max-w-[200px] h-3 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-1000 ease-out rounded-full`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      
      <div className="w-full max-w-[200px] flex justify-between mt-2 text-[10px] text-slate-500 font-medium">
        <span>CONSERVATIVE</span>
        <span>AGGRESSIVE</span>
      </div>
    </div>
  );
}
