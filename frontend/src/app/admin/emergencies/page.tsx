"use client";


import { useEffect, useState, useCallback } from 'react';
import { fetchApi } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { AIInsight } from '@/components/ui/AIInsight';
import { AlertTriangle, MapPin, Sparkles, ShieldAlert } from 'lucide-react';

// Sub-component: AI Priority Insight for emergencies
function EmergencyPriorityInsight({ emergencies }: { emergencies: any[] }) {
  const [priorities, setPriorities] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchPriorities = useCallback(async () => {
    if (emergencies.length === 0) return;
    setIsLoading(true);
    try {
      const res = await fetchApi<{ priorities: string }>('/ai/emergency-priorities', {
        method: 'POST',
        body: JSON.stringify({ emergencies })
      });
      setPriorities(res.priorities);
    } catch {
      const pending = emergencies.filter(e => e.status === 'Pending');
      setPriorities(pending.length > 0
        ? `${pending.length} emergencies need immediate attention. Focus on: ${pending.slice(0, 3).map(e => `${e.category} at ${e.location}`).join(', ')}.`
        : 'All emergencies are being addressed.');
    } finally {
      setIsLoading(false);
    }
  }, [emergencies]);

  useEffect(() => {
    fetchPriorities();
  }, [fetchPriorities]);

  if (emergencies.length === 0) return null;

  const pendingCount = emergencies.filter(e => e.status === 'Pending').length;
  const variant = pendingCount > 2 ? 'warning' : pendingCount > 0 ? 'info' : 'success';

  return (
    <AIInsight
      title="AI PRIORITY ANALYSIS"
      variant={variant}
      confidence={Math.min(97, 80 + emergencies.length * 2)}
      loading={isLoading}
      insight={priorities}
      collapsible
    />
  );
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Emergency {
  _id: string;
  category: string;
  location: string;
  description: string;
  status: string;
  reportedBy: User | string; // Assuming populated or not
  createdAt: string;
}

export default function AdminEmergenciesPage() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchEmergencies = async () => {
    try {
      const data = await fetchApi<{ emergencies: Emergency[] }>('/emergencies');
      setEmergencies(data.emergencies);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch emergencies');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencies();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      await fetchApi(`/emergencies/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      
      setEmergencies(prev => prev.map(e => 
        e._id === id ? { ...e, status: newStatus } : e
      ));
    } catch (err: any) {
      alert(err.message || 'Failed to update emergency status');
    } finally {
      setUpdatingId(null);
    }
  };



  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const runAiAnalysis = async (emergency: Emergency) => {
    setIsAiLoading(true);
    setAiAnalysis(null);
    (document.getElementById('ai_modal') as HTMLDialogElement)?.showModal();

    try {
      const [severityRes, summaryRes, recsRes] = await Promise.all([
        fetchApi<any>('/ai/analyze-severity', { method: 'POST', body: JSON.stringify({ emergency }) }),
        fetchApi<any>('/ai/generate-summary', { method: 'POST', body: JSON.stringify({ emergency }) }),
        fetchApi<any>('/ai/recommendations', { method: 'POST', body: JSON.stringify({ emergency }) })
      ]);
      setAiAnalysis({ severity: severityRes, summary: summaryRes, recommendations: recsRes.recommendations });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-base-300 pb-5">
        <h1 className="text-3xl font-bold tracking-tight">Manage Emergencies</h1>
        <p className="text-base-content/60 mt-1">Review, verify, and track the status of reported emergencies.</p>
      </div>
      
      {error && <div className="alert alert-error animate-in zoom-in-95"><span>{error}</span></div>}

      {/* AI Priority Analysis */}
      {!isLoading && emergencies.length > 0 && (
        <EmergencyPriorityInsight emergencies={emergencies} />
      )}

      {isLoading ? (
        <LoadingSkeleton type="table" count={7} />
      ) : emergencies.length === 0 ? (
        <EmptyState 
          icon={<AlertTriangle size={48} />}
          title="No emergencies"
          description="The system currently has no reported emergencies."
        />
      ) : (
        <div className="overflow-x-auto glass-panel rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <table className="table w-full">
            <thead>
              <tr className="bg-base-200">
                <th>Date</th>
                <th>Details</th>
                <th>Status</th>
                <th>AI Insight</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {emergencies.map(emergency => (
                <tr key={emergency._id} className="hover">
                  <td className="whitespace-nowrap align-top pt-4">
                    {new Date(emergency.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="font-medium text-base-content/90">{emergency.category}</div>
                    <div className="text-xs text-base-content/60 mt-1 max-w-sm truncate" title={emergency.location}>
                      <MapPin size={12} className="inline mr-1" />
                      {emergency.location}
                    </div>
                  </td>
                  <td className="align-top pt-4">
                    <StatusBadge status={emergency.status} />
                  </td>
                  <td className="align-top pt-4">
                    <button 
                      className="btn btn-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500 hover:text-white transition-all group shadow-sm"
                      onClick={() => runAiAnalysis(emergency)}
                    >
                      <Sparkles size={12} className="mr-1 group-hover:animate-pulse" /> AI Analyze
                    </button>
                  </td>
                  <td className="align-top pt-4">
                    <div className="flex flex-wrap gap-2">
                      {emergency.status === 'Pending' && (
                        <>
                          <button 
                            className={`btn btn-xs btn-outline btn-info shadow-sm ${updatingId === emergency._id ? 'loading' : ''}`}
                            onClick={() => handleUpdateStatus(emergency._id, 'Verified')}
                            disabled={updatingId === emergency._id}
                          >Verify</button>
                          <button 
                            className={`btn btn-xs btn-outline btn-error shadow-sm ${updatingId === emergency._id ? 'loading' : ''}`}
                            onClick={() => handleUpdateStatus(emergency._id, 'Rejected')}
                            disabled={updatingId === emergency._id}
                          >Reject</button>
                        </>
                      )}
                      {emergency.status === 'Verified' && (
                        <button 
                          className={`btn btn-xs btn-primary shadow-sm ${updatingId === emergency._id ? 'loading' : ''}`}
                          onClick={() => handleUpdateStatus(emergency._id, 'Ongoing')}
                          disabled={updatingId === emergency._id}
                        >Start Ongoing</button>
                      )}
                      {emergency.status === 'Ongoing' && (
                        <button 
                          className={`btn btn-xs btn-success text-white shadow-sm ${updatingId === emergency._id ? 'loading' : ''}`}
                          onClick={() => handleUpdateStatus(emergency._id, 'Resolved')}
                          disabled={updatingId === emergency._id}
                        >Resolve</button>
                      )}
                      {(emergency.status === 'Resolved' || emergency.status === 'Rejected') && (
                        <span className="text-xs text-base-content/40 font-medium">Terminal State</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Modal */}
      <dialog id="ai_modal" className="modal">
        <div className="modal-box w-11/12 max-w-3xl border border-indigo-500/30">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl flex items-center gap-2 text-indigo-400">
              <Sparkles size={20} /> AI Incident Analysis
            </h3>
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost text-base-content/50">✕</button>
            </form>
          </div>
          
          {isAiLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <span className="loading loading-spinner loading-lg text-indigo-500"></span>
              <p className="text-base-content/50 animate-pulse">Running heuristic analysis and generating operations summary...</p>
            </div>
          ) : aiAnalysis ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-panel p-5 rounded-xl border border-base-300">
                  <h4 className="text-xs uppercase tracking-wider text-base-content/50 mb-2">Severity Assessment</h4>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-xl font-bold ${aiAnalysis.severity.severity === 'CRITICAL' ? 'text-error' : 'text-warning'}`}>
                      {aiAnalysis.severity.severity}
                    </span>
                    <span className="badge badge-outline border-indigo-500 text-indigo-400 text-xs">
                      {aiAnalysis.severity.confidence}% Confidence
                    </span>
                  </div>
                  <p className="text-sm text-base-content/70 italic">"{aiAnalysis.severity.reason}"</p>
                </div>
                
                <div className="glass-panel p-5 rounded-xl border border-base-300">
                  <h4 className="text-xs uppercase tracking-wider text-base-content/50 mb-2">Operational Summary</h4>
                  <p className="text-sm text-base-content/90 font-medium mb-1">{aiAnalysis.summary.summary}</p>
                  <p className="text-xs text-base-content/70 mb-3">{aiAnalysis.summary.concern}</p>
                  <ul className="text-xs space-y-1 text-base-content/70 list-disc pl-4">
                    {aiAnalysis.summary.focus.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="glass-panel p-5 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
                <h4 className="text-xs uppercase tracking-wider text-indigo-400 mb-4 flex items-center gap-2">
                  <Sparkles size={14} /> Recommended Actions
                </h4>
                <div className="space-y-3">
                  {aiAnalysis.recommendations.map((rec: any, idx: number) => (
                    <div key={idx} className="flex gap-3">
                      <div className="mt-0.5 text-success">✓</div>
                      <div>
                        <p className="text-sm font-medium text-base-content/90">{rec.action}</p>
                        <p className="text-xs text-base-content/50">{rec.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-error">Failed to generate AI insights.</div>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
