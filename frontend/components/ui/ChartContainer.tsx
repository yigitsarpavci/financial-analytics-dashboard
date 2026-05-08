import React from 'react';
import { Card } from './Card';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  height?: number | string;
}

export function ChartContainer({ title, subtitle, children, height = 300 }: ChartContainerProps) {
  return (
    <Card>
      <div className="mb-6">
        <h3 className="text-base font-semibold text-slate-100">{title}</h3>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div style={{ height }}>
        {children}
      </div>
    </Card>
  );
}
