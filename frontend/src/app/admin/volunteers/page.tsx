"use client";


import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Users, Mail, Phone, MapPin } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Volunteer {
  _id: string;
  user: User;
  skills: string[];
  availability: boolean;
  area: string;
}

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [areaFilter, setAreaFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  const fetchVolunteers = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (areaFilter) queryParams.append('area', areaFilter);
      if (availabilityFilter !== 'all') {
        queryParams.append('availability', availabilityFilter === 'true' ? 'true' : 'false');
      }

      const qs = queryParams.toString();
      const data = await fetchApi<{ volunteers: Volunteer[] }>(`/volunteers${qs ? `?${qs}` : ''}`);
      setVolunteers(data.volunteers);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch volunteers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, [areaFilter, availabilityFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-base-300 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Volunteers</h1>
          <p className="text-base-content/60 mt-1">View and filter available volunteer personnel.</p>
        </div>
        
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Filter by Area..." 
            className="input input-bordered shadow-sm w-full md:w-48" 
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
          />
          <select 
            className="select select-bordered shadow-sm"
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
          >
            <option value="all">All Availability</option>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
        </div>
      </div>
      
      {error && <div className="alert alert-error animate-in zoom-in-95"><span>{error}</span></div>}

      {isLoading ? (
        <LoadingSkeleton type="card" count={6} />
      ) : volunteers.length === 0 ? (
        <EmptyState 
          icon={<Users size={48} />}
          title="No volunteers found"
          description="Try adjusting your filters or wait for users to register."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {volunteers.map(volunteer => (
            <div key={volunteer._id} className="glass-panel rounded-2xl premium-card-hover transition-all duration-300">
              <div className="card-body">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="card-title text-lg">{volunteer.user?.name || 'Unknown'}</h2>
                  <div className={`badge ${volunteer.availability ? 'badge-success text-white' : 'badge-ghost'}`}>
                    {volunteer.availability ? 'Available' : 'Unavailable'}
                  </div>
                </div>
                <div className="text-sm text-base-content/70 space-y-1.5 mb-4">
                  <p className="flex items-center gap-2"><span className="text-base-content/40"><Mail size={14} /></span> {volunteer.user?.email}</p>
                  <p className="flex items-center gap-2"><span className="text-base-content/40"><Phone size={14} /></span> {volunteer.user?.phone || 'N/A'}</p>
                  <p className="flex items-center gap-2"><span className="text-base-content/40"><MapPin size={14} /></span> {volunteer.area}</p>
                </div>
                
                <div className="pt-2 border-t border-base-200">
                  <p className="text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {volunteer.skills && volunteer.skills.length > 0 ? (
                      volunteer.skills.map((skill, i) => (
                        <span key={i} className="badge badge-sm badge-outline text-xs">{skill}</span>
                      ))
                    ) : (
                      <span className="text-xs text-base-content/40">No skills listed</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
