"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { User, Mail, Shield, Bell, Key, LogOut } from "lucide-react";
import { getCurrentUser } from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data);
      } catch (err) {
        router.push("/login");
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    window.location.href = "/login";
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl pb-12">
      <PageHeader 
        title="Settings" 
        description="Manage your account preferences and personal information."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        
        {/* Sidebar inside settings */}
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-500/10 text-indigo-400 font-medium rounded-lg transition-colors border border-indigo-500/20">
            <User className="w-5 h-5" /> Account Profile
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-medium rounded-lg transition-colors">
            <Shield className="w-5 h-5" /> Security
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-medium rounded-lg transition-colors">
            <Bell className="w-5 h-5" /> Notifications
          </button>
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-6">Profile Information</h3>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-300 border border-slate-700">
                  {user?.email?.[0].toUpperCase() || "U"}
                </div>
                <div>
                  <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors">
                    Change Avatar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      disabled 
                      value={user?.email || "Loading..."}
                      className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-300 opacity-70 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Your email address cannot be changed.</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-rose-500/20">
            <h3 className="text-lg font-semibold text-rose-400 mb-2">Danger Zone</h3>
            <p className="text-sm text-slate-400 mb-6">These actions are permanent and cannot be undone.</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-lg transition-colors">
                <Key className="w-4 h-4" /> Delete Account
              </button>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
