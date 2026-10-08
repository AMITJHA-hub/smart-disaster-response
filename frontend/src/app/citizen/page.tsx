"use client";

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { AlertTriangle, FileText } from 'lucide-react';

export default function CitizenDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="border-b border-base-300 pb-5">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, <span className="text-primary">{user?.name}</span></h1>
        <p className="text-base-content/60 mt-2">
          Your portal for reporting emergencies and coordinating with first responders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="glass-panel rounded-3xl p-8 premium-card-hover transition-all duration-300 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 border-error/20 bg-error/5">
          <div className="h-24 w-24 rounded-full bg-error/10 flex items-center justify-center mb-6 shadow-lg shadow-error/20">
            <AlertTriangle size={48} className="text-error" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-base-content/90">Report an Emergency</h2>
          <p className="text-sm text-base-content/60 mb-8 leading-relaxed">
            Need immediate help? Report a disaster, fire, medical emergency, or structural failure to dispatch response teams instantly.
          </p>
          <div className="mt-auto w-full">
            <Link href="/citizen/report" className="btn btn-error w-full shadow-lg shadow-error/30 text-white font-semibold">
              Report Now
            </Link>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-8 premium-card-hover transition-all duration-300 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-6">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
            <FileText size={48} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-base-content/90">My Emergencies</h2>
          <p className="text-sm text-base-content/60 mb-8 leading-relaxed">
            Track the status of incidents you have reported. See real-time updates as volunteers and resources are deployed.
          </p>
          <div className="mt-auto w-full">
            <Link href="/citizen/my-emergencies" className="btn btn-primary w-full shadow-lg shadow-indigo-500/30">
              View Status
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
