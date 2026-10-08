"use client";


import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { AlertTriangle, Users, Briefcase, Heart } from 'lucide-react';
import Link from 'next/link';
import { StatCard } from '@/components/ui/StatCard';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { AIDashboardPanel } from '@/components/ui/AIDashboardPanel';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    emergencies: { total: 0, pending: 0, active: 0 },
    volunteers: { total: 0, available: 0 },
    assignments: { total: 0, active: 0 },
    donations: { total: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Raw data for AI panel
  const [rawEmergencies, setRawEmergencies] = useState<any[]>([]);
  const [rawVolunteers, setRawVolunteers] = useState<any[]>([]);
  const [rawResources, setRawResources] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [emRes, volRes, assRes, donRes, resRes] = await Promise.all([
          fetchApi<{ emergencies: any[] }>('/emergencies'),
          fetchApi<{ volunteers: any[] }>('/volunteers'),
          fetchApi<{ assignments: any[] }>('/assignments'),
          fetchApi<{ pledges: any[] }>('/donations/all'),
          fetchApi<{ resources: any[] }>('/emergency-resources/all')
        ]);

        const emergencies = emRes.emergencies || [];
        const volunteers = volRes.volunteers || [];
        const assignments = assRes.assignments || [];
        const pledges = donRes.pledges || [];
        const resources = resRes.resources || [];

        setRawEmergencies(emergencies);
        setRawVolunteers(volunteers);
        setRawResources(resources);

        setStats({
          emergencies: {
            total: emergencies.length,
            pending: emergencies.filter(e => e.status === 'Pending').length,
            active: emergencies.filter(e => e.status === 'Ongoing' || e.status === 'Verified').length
          },
          volunteers: {
            total: volunteers.length,
            available: volunteers.filter(v => v.availability).length
          },
          assignments: {
            total: assignments.length,
            active: assignments.filter(a => a.status === 'Assigned' || a.status === 'In Progress').length
          },
          donations: {
            total: pledges.length
          }
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 bg-base-300 w-64 rounded animate-pulse"></div>
          <div className="h-4 bg-base-300 w-96 rounded animate-pulse"></div>
        </div>
        <LoadingSkeleton type="stat" count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-base-300 pb-5">
        <h1 className="text-3xl font-bold tracking-tight">Administrator Dashboard</h1>
        <p className="text-base-content/60 mt-2">Overview of system activity and resources.</p>
      </div>
      
      {error && (
        <div className="alert alert-error animate-in zoom-in-95">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <Link href="/admin/emergencies" className="block transition-transform hover:-translate-y-1">
          <StatCard
            title="Emergencies"
            value={stats.emergencies.total}
            icon={<AlertTriangle size={24} className="text-rose-500" />}
            colorClass="text-rose-500"
            description={`${stats.emergencies.pending} Pending | ${stats.emergencies.active} Active`}
          />
        </Link>

        <Link href="/admin/volunteers" className="block transition-transform hover:-translate-y-1">
          <StatCard
            title="Volunteers"
            value={stats.volunteers.total}
            icon={<Users size={24} className="text-blue-500" />}
            colorClass="text-blue-500"
            description={`${stats.volunteers.available} Available Now`}
          />
        </Link>

        <Link href="/admin/assignments" className="block transition-transform hover:-translate-y-1">
          <StatCard
            title="Assignments"
            value={stats.assignments.total}
            icon={<Briefcase size={24} className="text-indigo-500" />}
            colorClass="text-indigo-500"
            description={`${stats.assignments.active} Active Tasks`}
          />
        </Link>

        <Link href="/admin/donations" className="block transition-transform hover:-translate-y-1">
          <StatCard
            title="Donation Pledges"
            value={stats.donations.total}
            icon={<Heart size={24} className="text-emerald-500" />}
            colorClass="text-emerald-500"
            description="Across all verified emergencies"
          />
        </Link>

      </div>

      {/* === AI Intelligence Center === */}
      <AIDashboardPanel 
        emergencies={rawEmergencies} 
        volunteers={rawVolunteers}
        resources={rawResources}
      />
    </div>
  );
}
