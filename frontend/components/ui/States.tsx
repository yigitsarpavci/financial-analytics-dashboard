import React from 'react';
import { FolderSearch, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from './Card';

interface StateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  inCard?: boolean;
}

export function EmptyState({ title, description, action, inCard = true }: StateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
        <FolderSearch className="w-6 h-6 text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-200 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-400 max-w-sm mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );

  return inCard ? <Card>{content}</Card> : content;
}

export function ErrorState({ title, description, action, inCard = true }: StateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-rose-400" />
      </div>
      <h3 className="text-lg font-medium text-rose-200 mb-1">{title}</h3>
      {description && <p className="text-sm text-rose-400/70 max-w-sm mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );

  return inCard ? <Card className="border-rose-500/20">{content}</Card> : content;
}

export function LoadingState({ title = "Loading...", description, inCard = true }: Omit<StateProps, 'action'>) {
  const content = (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-4" />
      <h3 className="text-lg font-medium text-slate-200 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-400 max-w-sm">{description}</p>}
    </div>
  );

  return inCard ? <Card>{content}</Card> : content;
}
