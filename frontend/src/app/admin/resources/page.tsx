"use client";

import { useEffect, useState, useCallback } from 'react';
import { fetchApi } from '@/lib/api';
import { AIInsight } from '@/components/ui/AIInsight';
import { Sparkles } from 'lucide-react';

// Sub-component: live resource prediction
function ResourcePredictionInsight({ resources, emergencyCategory }: { resources: any[]; emergencyCategory: string }) {
  const [prediction, setPrediction] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchPrediction = useCallback(async () => {
    if (resources.length === 0) return;
    setIsLoading(true);
    try {
      const mapped = resources.map(r => ({
        name: r.resourceName,
        quantity: r.quantityReceived,
        threshold: r.quantityRequired,
      }));
      const res = await fetchApi<{ prediction: string }>('/ai/resource-prediction', {
        method: 'POST',
        body: JSON.stringify({ resources: mapped })
      });
      setPrediction(res.prediction);
    } catch {
      // fallback
      const atRisk = resources.filter(r => r.status !== 'Fulfilled');
      setPrediction(atRisk.length > 0
        ? `Potential shortages detected for: ${atRisk.map(r => r.resourceName).join(', ')}. Immediate allocation recommended for the ${emergencyCategory} response.`
        : 'All resources are within safe levels.');
    } finally {
      setIsLoading(false);
    }
  }, [resources, emergencyCategory]);

  useEffect(() => {
    fetchPrediction();
  }, [fetchPrediction]);

  if (resources.every(r => r.status === 'Fulfilled') && !prediction) return null;

  return (
    <AIInsight
      title="AI RESOURCE PREDICTION"
      variant={resources.some(r => r.status !== 'Fulfilled') ? 'warning' : 'success'}
      confidence={resources.length > 0 ? Math.min(95, 70 + resources.length * 5) : undefined}
      loading={isLoading}
      insight={prediction}
    />
  );
}

interface Resource {
  _id: string;
  resourceName: string;
  quantityRequired: number;
  quantityReceived: number;
  status: string;
}

interface Emergency {
  _id: string;
  category: string;
  location: string;
  status: string;
}

export default function AdminResourcesPage() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [selectedEmergency, setSelectedEmergency] = useState<string>('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [error, setError] = useState('');

  // Add Resource Modal state
  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceQty, setNewResourceQty] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  
  // AI Recommendation state
  const [recommendation, setRecommendation] = useState<string>('');
  const [isRecommending, setIsRecommending] = useState(false);

  // Update Resource state
  const [updatingId, setUpdatingId] = useState('');

  useEffect(() => {
    const fetchEmergencies = async () => {
      try {
        const data = await fetchApi<{ emergencies: Emergency[] }>('/emergencies');
        // Resources can only be added to Verified emergencies (per backend), but maybe Ongoing can also have resources viewed?
        const valid = data.emergencies.filter(e => e.status === 'Verified' || e.status === 'Ongoing');
        setEmergencies(valid);
        if (valid.length > 0) {
          setSelectedEmergency(valid[0]._id);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch emergencies');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmergencies();
  }, []);

  useEffect(() => {
    if (selectedEmergency) {
      fetchResources(selectedEmergency);
      setRecommendation(''); // Clear previous recommendation
    }
  }, [selectedEmergency]);

  const fetchResources = async (emId: string) => {
    setIsLoadingResources(true);
    try {
      const data = await fetchApi<{ resources: Resource[] }>(`/emergency-resources/${emId}`);
      setResources(data.resources);
    } catch (err: any) {
      console.error(err);
      setResources([]);
    } finally {
      setIsLoadingResources(false);
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await fetchApi('/emergency-resources', {
        method: 'POST',
        body: JSON.stringify({
          emergencyId: selectedEmergency,
          resourceName: newResourceName,
          quantityRequired: newResourceQty
        })
      });
      (document.getElementById('add_resource_modal') as HTMLDialogElement)?.close();
      setNewResourceName('');
      setNewResourceQty(1);
      fetchResources(selectedEmergency);
    } catch (err: any) {
      alert(err.message || 'Failed to add resource');
    } finally {
      setIsAdding(false);
    }
  };

  const handleGetRecommendation = async () => {
    if (!selectedEm) return;
    setIsRecommending(true);
    try {
      const res = await fetchApi<{ recommendation: string }>('/ai/resource-recommendation', {
        method: 'POST',
        body: JSON.stringify({ category: selectedEm.category, location: selectedEm.location })
      });
      setRecommendation(res.recommendation);
    } catch (err: any) {
      alert(err.message || 'Failed to get recommendation');
    } finally {
      setIsRecommending(false);
    }
  };

  const handleUpdateResource = async (id: string, currentReq: number) => {
    const qtyStr = prompt(`Enter new quantity received (max ${currentReq}):`);
    if (qtyStr === null) return;
    const qty = parseInt(qtyStr);
    if (isNaN(qty) || qty < 0 || qty > currentReq) {
      alert(`Invalid quantity. Must be between 0 and ${currentReq}.`);
      return;
    }

    setUpdatingId(id);
    try {
      await fetchApi(`/emergency-resources/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantityReceived: qty })
      });
      fetchResources(selectedEmergency);
    } catch (err: any) {
      alert(err.message || 'Failed to update resource');
    } finally {
      setUpdatingId('');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return 'badge-warning';
      case 'Partially Fulfilled': return 'badge-info';
      case 'Fulfilled': return 'badge-success';
      default: return 'badge-ghost';
    }
  };

  const selectedEm = emergencies.find(e => e._id === selectedEmergency);
  const canAddResource = selectedEm?.status === 'Verified';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-base-300 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Resources</h1>
          <p className="text-base-content/60 mt-1">Track and allocate emergency supplies and materials.</p>
        </div>
      </div>
      
      {error && <div className="alert alert-error animate-in zoom-in-95 shadow-sm"><span>{error}</span></div>}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <span className="loading loading-spinner loading-lg text-indigo-500"></span>
        </div>
      ) : emergencies.length === 0 ? (
        <div className="glass-panel border-base-300 rounded-2xl animate-in fade-in slide-in-from-bottom-4">
          <div className="card-body items-center text-center py-12">
            <h2 className="card-title text-xl text-base-content/50">No active emergencies</h2>
            <p className="text-base-content/40">There are no verified or ongoing emergencies to manage resources for.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="glass-panel border-base-300 rounded-2xl h-[600px] flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="p-4 border-b border-base-300/50 bg-base-200/30 rounded-t-2xl">
                <h3 className="font-semibold text-base-content/70 text-sm uppercase tracking-wider">Select Incident</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {emergencies.map(em => (
                  <button 
                    key={em._id}
                    className={`w-full text-left p-3 rounded-xl transition-all ${selectedEmergency === em._id ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'hover:bg-base-200/50 text-base-content/80'}`}
                    onClick={() => setSelectedEmergency(em._id)}
                  >
                    <div className="font-medium truncate">{em.category}</div>
                    <div className={`text-xs mt-1 ${selectedEmergency === em._id ? 'text-white/70' : 'text-base-content/50'}`}>
                      {em.status}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="glass-panel border-base-300 rounded-2xl min-h-[600px] flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="card-body">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-base-content/90 tracking-tight">{selectedEm?.category}</h2>
                    <p className="text-sm text-base-content/50 mt-1">{selectedEm?.location}</p>
                  </div>
                  {canAddResource && (
                    <div className="flex gap-2">
                      <button 
                        className={`btn btn-secondary shadow-sm ${isRecommending ? 'loading' : ''}`}
                        onClick={handleGetRecommendation}
                        disabled={isRecommending}
                      >
                        <Sparkles size={16} className="mr-1" /> AI Suggest
                      </button>
                      <button 
                        className="btn btn-primary shadow-sm"
                        onClick={() => (document.getElementById('add_resource_modal') as HTMLDialogElement)?.showModal()}
                      >
                        Add Resource
                      </button>
                    </div>
                  )}
                  {!canAddResource && (
                    <span className="text-sm text-base-content/50 italic bg-base-200/50 px-3 py-1 rounded-full">Requires Verification</span>
                  )}
                </div>

                {isLoadingResources ? (
                  <div className="flex-1 flex justify-center items-center">
                    <span className="loading loading-spinner text-indigo-500"></span>
                  </div>
                ) : resources.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-center p-8 text-base-content/40 italic">
                    No resources tracked for this emergency yet.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Dynamic AI Resource Prediction */}
                    <ResourcePredictionInsight resources={resources} emergencyCategory={selectedEm?.category || ''} />

                    {recommendation && (
                      <div className="glass-panel border-indigo-500/30 rounded-xl p-4 bg-indigo-500/5 animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 mb-2 text-indigo-400 font-semibold">
                          <Sparkles size={18} /> Recommended Resources to Add
                        </div>
                        <div className="text-sm text-base-content/80 whitespace-pre-line leading-relaxed pl-6">
                          {recommendation}
                        </div>
                      </div>
                    )}

                    <div className="overflow-x-auto rounded-xl border border-base-200/50">
                      <table className="table w-full">
                        <thead>
                          <tr className="bg-base-200/50">
                            <th className="text-base-content/60 uppercase tracking-wider text-xs">Resource Name</th>
                            <th className="text-base-content/60 uppercase tracking-wider text-xs">Fulfillment</th>
                            <th className="text-base-content/60 uppercase tracking-wider text-xs">Status</th>
                            <th className="text-base-content/60 uppercase tracking-wider text-xs">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resources.map(res => {
                            const percent = Math.round((res.quantityReceived / res.quantityRequired) * 100);
                            return (
                              <tr key={res._id} className="hover:bg-base-200/30 transition-colors">
                                <td className="font-medium text-base-content/90">{res.resourceName}</td>
                                <td>
                                  <div className="flex items-center gap-3">
                                    <div className="w-full max-w-xs h-2 bg-base-300 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full ${percent === 100 ? 'bg-success' : percent > 50 ? 'bg-info' : 'bg-warning'}`} 
                                        style={{ width: `${percent}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs font-semibold w-16 text-base-content/70">{res.quantityReceived} / {res.quantityRequired}</span>
                                  </div>
                                </td>
                                <td>
                                  <div className={`badge ${getStatusBadge(res.status)} shadow-sm whitespace-nowrap`}>
                                    {res.status}
                                  </div>
                                </td>
                                <td>
                                  {res.status !== 'Fulfilled' && (
                                    <button 
                                      className={`btn btn-xs btn-outline border-base-content/20 hover:bg-base-content/10 hover:text-base-content ${updatingId === res._id ? 'loading' : ''}`}
                                      onClick={() => handleUpdateResource(res._id, res.quantityRequired)}
                                      disabled={updatingId === res._id}
                                    >
                                      Update
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
      <dialog id="add_resource_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Add Required Resource</h3>
          <form onSubmit={handleAddResource} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Resource Name</span></label>
              <input 
                type="text" 
                className="input input-bordered w-full" 
                placeholder="e.g., Blankets, Water Bottles"
                value={newResourceName}
                onChange={(e) => setNewResourceName(e.target.value)}
                required
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Quantity Required</span></label>
              <input 
                type="number" 
                className="input input-bordered w-full" 
                min="1"
                value={newResourceQty}
                onChange={(e) => setNewResourceQty(parseInt(e.target.value))}
                required
              />
            </div>
            <div className="modal-action">
              <button type="button" className="btn" onClick={() => (document.getElementById('add_resource_modal') as HTMLDialogElement)?.close()}>Cancel</button>
              <button type="submit" className={`btn btn-primary ${isAdding ? 'loading' : ''}`} disabled={isAdding}>Add Resource</button>
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
