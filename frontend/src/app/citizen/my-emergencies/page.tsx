"use client";

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { AlertTriangle, MapPin, Calendar } from 'lucide-react';

interface Emergency {
  _id: string;
  category: string;
  location: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function MyEmergenciesPage() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmergencies = async () => {
      try {
        const data = await fetchApi<{ emergencies: Emergency[] }>('/emergencies/my');
        setEmergencies(data.emergencies);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch emergencies');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmergencies();
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="border-b border-base-300 pb-5">
        <h1 className="text-3xl font-bold tracking-tight">My Emergencies</h1>
        <p className="text-base-content/60 mt-2">
          Track the status of incidents you have reported.
        </p>
      </div>
      
      {error && (
        <div className="alert alert-error animate-in zoom-in-95 shadow-sm">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : emergencies.length === 0 ? (
        <EmptyState 
          icon={<AlertTriangle size={48} />}
          title="No emergencies reported"
          description="You haven't reported any emergencies yet."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {emergencies.map(emergency => (
            <div key={emergency._id} className="glass-panel rounded-2xl premium-card-hover transition-all duration-300 flex flex-col h-full border border-base-300">
              <div className="card-body">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="card-title text-xl font-bold tracking-tight text-base-content/90">{emergency.category}</h2>
                  <StatusBadge status={emergency.status} />
                </div>
                
                <div className="flex-grow space-y-4">
                  <div className="flex items-start gap-2 text-sm text-base-content/70">
                    <MapPin size={16} className="mt-0.5 text-base-content/40 shrink-0" />
                    <span>{emergency.location}</span>
                  </div>
                  
                  <div className="bg-base-200/50 p-4 rounded-xl border border-base-300/50">
                    <p className="text-sm text-base-content/80 line-clamp-3 leading-relaxed">
                      {emergency.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-base-content/40 mt-6 pt-4 border-t border-base-200/50">
                  <Calendar size={14} />
                  Reported on {new Date(emergency.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
