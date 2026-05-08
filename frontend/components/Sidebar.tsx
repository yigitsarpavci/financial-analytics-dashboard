"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  ShieldAlert, 
  Bot, 
  ActivitySquare, 
  Settings 
} from 'lucide-react';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: Receipt },
  { name: 'Personal Finance', href: '/finance', icon: PieChart },
  { name: 'Portfolio Risk', href: '/portfolio', icon: ShieldAlert },
  { name: 'AI Assistant', href: '/ai-assistant', icon: Bot },
  { name: 'Trading Simulator', href: '/trading', icon: ActivitySquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  };

  return (
    <div className="w-64 h-screen bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 flex flex-col fixed top-0 left-0 z-10">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-emerald-400" />
          </div>
          <span className="font-bold text-lg text-slate-100 tracking-tight">FinTech App</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard');
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
      
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
              U
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-200">My Account</span>
            </div>
          </div>
          <button onClick={handleLogout} className="text-xs text-rose-400 hover:text-rose-300 font-medium">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
