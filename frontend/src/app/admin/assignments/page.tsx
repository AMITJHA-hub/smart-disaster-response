"use client";


import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Briefcase, Sparkles } from 'lucide-react';

interface Assignment {
  _id: string;
  emergency: any;
  volunteer: any;
  status: string;
  createdAt: string;
}

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [selectedEmergency, setSelectedEmergency] = useState('');
  const [selectedVolunteer, setSelectedVolunteer] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchAssignments = async () => {
    try {
      const data = await fetchApi<{ assignments: Assignment[] }>('/assignments');
      setAssignments(data.assignments);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch assignments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const openAssignModal = async () => {
    try {
      const [emData, volData] = await Promise.all([
        fetchApi<{ emergencies: any[] }>('/emergencies'),
        fetchApi<{ volunteers: any[] }>('/volunteers?availability=true')
      ]);
      setEmergencies(emData.emergencies.filter(e => e.status === 'Verified'));
      setVolunteers(volData.volunteers);
      setSelectedEmergency('');
      setSelectedVolunteer('');
      (document.getElementById('assign_modal') as HTMLDialogElement)?.showModal();
    } catch (err) {
      alert('Failed to load data for assignment');
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAssigning(true);
    try {
      await fetchApi('/assignments', {
        method: 'POST',
        body: JSON.stringify({ emergencyId: selectedEmergency, volunteerId: selectedVolunteer })
      });
      (document.getElementById('assign_modal') as HTMLDialogElement)?.close();
      fetchAssignments();
    } catch (err: any) {
      alert(err.message || 'Failed to assign volunteer');
    } finally {
      setIsAssigning(false);
    }
  };

  const [aiRecommendations, setAiRecommendations] = useState<any[] | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiMatch = async () => {
    if (!selectedEmergency) return alert('Select an emergency first');
    setIsAiLoading(true);
    setAiRecommendations(null);
    try {
      const em = emergencies.find(e => e._id === selectedEmergency);
      const res = await fetchApi<any>('/ai/match-volunteers', {
        method: 'POST',
        body: JSON.stringify({ emergency: em, volunteers })
      });
      setAiRecommendations(res.recommendedVolunteers);
    } catch (err) {
      alert('AI Matching failed');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-base-300 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Assignments</h1>
          <p className="text-base-content/60 mt-1">Assign and coordinate volunteers for verified emergencies.</p>
        </div>
        <button className="btn btn-primary shadow-sm hover:shadow-md transition-shadow" onClick={openAssignModal}>
          <Briefcase size={18} className="mr-2" /> Assign Volunteer
        </button>
      </div>
      
      {error && <div className="alert alert-error animate-in zoom-in-95"><span>{error}</span></div>}

      {isLoading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : assignments.length === 0 ? (
        <EmptyState 
          icon={<Briefcase size={48} />}
          title="No assignments"
          description="No volunteers have been assigned to emergencies yet."
        />
      ) : (
        <div className="overflow-x-auto glass-panel rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <table className="table w-full">
            <thead>
              <tr className="bg-base-200">
                <th>Date</th>
                <th>Emergency</th>
                <th>Volunteer</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(assignment => (
                <tr key={assignment._id} className="hover">
                  <td className="whitespace-nowrap">
                    {new Date(assignment.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    {assignment.emergency ? (
                      <div>
                        <div className="font-medium text-base-content/90">{assignment.emergency.category}</div>
                        <div className="text-xs text-base-content/50">{assignment.emergency.location}</div>
                      </div>
                    ) : (
                      <span className="text-base-content/40 italic">Deleted Emergency</span>
                    )}
                  </td>
                  <td>
                    {assignment.volunteer ? (
                      <div>
                        <div className="font-medium text-base-content/90">{assignment.volunteer.user?.name}</div>
                        <div className="text-xs text-base-content/50">{assignment.volunteer.area}</div>
                      </div>
                    ) : (
                      <span className="text-base-content/40 italic">Deleted Volunteer</span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={assignment.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Modal */}
      <dialog id="assign_modal" className="modal">
        <div className="modal-box w-11/12 max-w-2xl border border-indigo-500/30">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-indigo-400">
            <Briefcase size={20} /> Assign Volunteer
          </h3>
          <form onSubmit={handleAssign} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Verified Emergency</span></label>
              <select 
                className="select select-bordered w-full bg-base-200/50" 
                value={selectedEmergency}
                onChange={e => {
                  setSelectedEmergency(e.target.value);
                  setAiRecommendations(null);
                }}
                required
              >
                <option value="" disabled>Select emergency...</option>
                {emergencies.map(em => (
                  <option key={em._id} value={em._id}>{em.category} - {em.location}</option>
                ))}
              </select>
            </div>
            
            {selectedEmergency && (
              <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4 my-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-indigo-400 flex items-center gap-1"><Sparkles size={14}/> AI Matchmaking</span>
                  <button type="button" onClick={handleAiMatch} className={`btn btn-xs bg-indigo-500 hover:bg-indigo-600 text-white border-none ${isAiLoading ? 'loading' : ''}`}>
                    Find Best Matches
                  </button>
                </div>
                {aiRecommendations && (
                  <div className="space-y-2 mt-4">
                    {aiRecommendations.length > 0 ? aiRecommendations.map((rec: any, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row justify-between p-3 bg-base-100 rounded-lg border border-base-300">
                        <div>
                          <p className="font-medium text-sm flex items-center gap-2">
                            {idx + 1}. {rec.user?.name} 
                            <span className="badge badge-sm badge-outline text-indigo-400 border-indigo-500">{rec.matchScore}% Match</span>
                          </p>
                          <p className="text-xs text-base-content/60 mt-1 italic">{rec.reason}</p>
                        </div>
                        <button type="button" onClick={() => setSelectedVolunteer(rec._id)} className="btn btn-xs btn-outline mt-2 sm:mt-0 self-start sm:self-center">
                          Select
                        </button>
                      </div>
                    )) : (
                      <p className="text-xs text-base-content/50">No strong matches found.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="form-control">
              <label className="label"><span className="label-text">Available Volunteer</span></label>
              <select 
                className="select select-bordered w-full bg-base-200/50" 
                value={selectedVolunteer}
                onChange={e => setSelectedVolunteer(e.target.value)}
                required
              >
                <option value="" disabled>Select volunteer manually...</option>
                {volunteers.map(vol => (
                  <option key={vol._id} value={vol._id}>{vol.user?.name} ({vol.area})</option>
                ))}
              </select>
            </div>
            <div className="modal-action border-t border-base-300 pt-4 mt-6">
              <button type="button" className="btn btn-ghost" onClick={() => (document.getElementById('assign_modal') as HTMLDialogElement)?.close()}>Cancel</button>
              <button type="submit" className={`btn btn-primary ${isAssigning ? 'loading' : ''}`} disabled={isAssigning || !selectedEmergency || !selectedVolunteer}>
                Confirm Assignment
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
