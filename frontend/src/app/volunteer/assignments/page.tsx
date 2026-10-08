"use client";

import { useEffect, useState, useCallback } from 'react';
import { fetchApi } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { AIInsight } from '@/components/ui/AIInsight';
import { Briefcase, MapPin, AlertTriangle, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

// Sub-component: AI Volunteer Briefing
function VolunteerBriefingInsight({ assignments }: { assignments: any[] }) {
  const [briefing, setBriefing] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchBriefing = useCallback(async () => {
    if (assignments.length === 0) return;
    setIsLoading(true);
    try {
      const emergencies = assignments.map(a => a.emergency).filter(Boolean);
      const res = await fetchApi<{ briefing: string }>('/ai/volunteer-briefing', {
        method: 'POST',
        body: JSON.stringify({ 
          volunteer: { name: 'Volunteer' }, // Ideally from AuthContext
          assignedEmergencies: emergencies
        })
      });
      setBriefing(res.briefing);
    } catch {
      setBriefing('Unable to generate AI briefing at this time. Please review your assignments below.');
    } finally {
      setIsLoading(false);
    }
  }, [assignments]);

  useEffect(() => {
    fetchBriefing();
  }, [fetchBriefing]);

  if (assignments.length === 0) return null;

  return (
    <AIInsight
      title="YOUR AI MISSION BRIEFING"
      variant="info"
      loading={isLoading}
      insight={briefing}
      collapsible
    />
  );
}

interface Emergency {
  _id: string;
  category: string;
  location: string;
  description: string;
  status: string;
}

interface Assignment {
  _id: string;
  emergency: Emergency;
  status: 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export default function VolunteerAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchAssignments = async () => {
    try {
      const data = await fetchApi<{ assignments: Assignment[] }>('/assignments/me');
      setAssignments(data.assignments);
    } catch (err: any) {
      if (err.status !== 404) {
        setError(err.message || 'Failed to fetch assignments');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      await fetchApi(`/assignments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      
      // Update local state
      setAssignments(prev => prev.map(a => 
        a._id === id ? { ...a, status: newStatus as any } : a
      ));
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-base-300 pb-5">
        <h1 className="text-3xl font-bold tracking-tight">My Assignments</h1>
        <p className="text-base-content/60 mt-1">Review and manage your emergency response tasks.</p>
      </div>
      
      {error && (
        <div className="alert alert-error animate-in zoom-in-95 shadow-sm">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <LoadingSkeleton type="card" count={4} />
      ) : assignments.length === 0 ? (
        <EmptyState 
          icon={<Briefcase size={48} />}
          title="No assignments yet"
          description="You have not been assigned to any emergencies. Check back later."
        />
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <VolunteerBriefingInsight assignments={assignments.filter(a => a.status === 'Assigned' || a.status === 'In Progress')} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {assignments.map(assignment => (
            <div key={assignment._id} className="glass-panel rounded-2xl premium-card-hover transition-all duration-300 flex flex-col h-full">
              <div className="card-body">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="card-title text-xl text-base-content/90 font-bold tracking-tight">
                    {assignment.emergency?.category || 'Unknown Emergency'}
                  </h2>
                  <StatusBadge status={assignment.status} />
                </div>
                
                {assignment.emergency && (
                  <div className="flex-grow space-y-4">
                    <div className="flex items-start gap-2 text-sm text-base-content/70">
                      <MapPin size={16} className="mt-0.5 text-base-content/40 shrink-0" />
                      <span>{assignment.emergency.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-base-content/70">
                      <AlertTriangle size={16} className="text-base-content/40 shrink-0" />
                      <span>Emergency Status: <span className="font-medium text-base-content">{assignment.emergency.status}</span></span>
                    </div>

                    <div className="bg-base-200/50 p-4 rounded-xl border border-base-300/50">
                      <p className="text-sm text-base-content/80 line-clamp-3 leading-relaxed">
                        {assignment.emergency.description}
                      </p>
                    </div>
                  </div>
                )}

                <div className="card-actions justify-end mt-6 pt-4 border-t border-base-200/50">
                  {assignment.status === 'Assigned' && (
                    <button 
                      className={`btn btn-primary shadow-sm ${updatingId === assignment._id ? 'loading' : ''}`}
                      onClick={() => handleUpdateStatus(assignment._id, 'In Progress')}
                      disabled={updatingId === assignment._id}
                    >
                      Start Task
                    </button>
                  )}
                  {assignment.status === 'In Progress' && (
                    <button 
                      className={`btn btn-success text-white shadow-sm ${updatingId === assignment._id ? 'loading' : ''}`}
                      onClick={() => handleUpdateStatus(assignment._id, 'Completed')}
                      disabled={updatingId === assignment._id}
                    >
                      <CheckCircle2 size={18} className="mr-1" /> Mark Completed
                    </button>
                  )}
                  {(assignment.status === 'Assigned' || assignment.status === 'In Progress') && (
                    <button 
                      className={`btn btn-outline btn-error shadow-sm ${updatingId === assignment._id ? 'loading' : ''}`}
                      onClick={() => handleUpdateStatus(assignment._id, 'Cancelled')}
                      disabled={updatingId === assignment._id}
                    >
                      <XCircle size={18} className="mr-1" /> Cancel
                    </button>
                  )}
                  {(assignment.status === 'Completed' || assignment.status === 'Cancelled') && (
                    <div className="text-sm font-medium text-base-content/40 flex items-center gap-2 h-12">
                      Assignment {assignment.status}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}
