"use client";

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { AlertTriangle, Heart } from 'lucide-react';

export default function DonorDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="border-b border-base-300 pb-5">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, <span className="text-indigo-500">{user?.name}</span></h1>
        <p className="text-base-content/60 mt-2">
          Thank you for your generosity. Here you can find emergencies in need and manage your resource pledges.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="glass-panel rounded-3xl p-8 premium-card-hover transition-all duration-300 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 border-warning/20 bg-warning/5">
          <div className="h-24 w-24 rounded-full bg-warning/10 flex items-center justify-center mb-6 shadow-lg shadow-warning/20">
            <AlertTriangle size={48} className="text-warning" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-base-content/90">Verified Emergencies</h2>
          <p className="text-sm text-base-content/60 mb-8 leading-relaxed">
            View active emergencies that desperately require supplies. Browse resource needs and contribute where you can.
          </p>
          <div className="mt-auto w-full">
            <Link href="/donor/emergencies" className="btn btn-warning w-full shadow-lg shadow-warning/30 text-white font-semibold">
              View Needs
            </Link>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-8 premium-card-hover transition-all duration-300 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-6 border-error/20 bg-error/5">
          <div className="h-24 w-24 rounded-full bg-error/10 flex items-center justify-center mb-6 shadow-lg shadow-error/20">
            <Heart size={48} className="text-error" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-base-content/90">My Pledges</h2>
          <p className="text-sm text-base-content/60 mb-8 leading-relaxed">
            Track the status of the resources you have pledged. See exactly when and where your donations are deployed.
          </p>
          <div className="mt-auto w-full">
            <Link href="/donor/pledges" className="btn btn-error w-full shadow-lg shadow-error/30 text-white font-semibold">
              View Pledges
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
