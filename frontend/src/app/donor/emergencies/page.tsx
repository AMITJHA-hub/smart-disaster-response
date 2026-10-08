"use client";

import { useEffect, useState } from 'react';
import { fetchApi, ApiError } from '@/lib/api';

interface Emergency {
  _id: string;
  category: string;
  location: string;
  description: string;
  status: string;
}

export default function DonorEmergenciesPage() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [pledgeData, setPledgeData] = useState({
    emergencyId: '',
    donationType: 'Food',
    quantity: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pledgeSuccess, setPledgeSuccess] = useState('');
  const [pledgeError, setPledgeError] = useState('');

  useEffect(() => {
    const fetchEmergencies = async () => {
      try {
        const data = await fetchApi<{ emergencies: Emergency[] }>('/emergencies');
        // Donors should typically only see Verified emergencies that might need resources
        // Some might be Ongoing
        const availableEmergencies = data.emergencies.filter(
          e => e.status === 'Verified' || e.status === 'Ongoing'
        );
        setEmergencies(availableEmergencies);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch emergencies');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmergencies();
  }, []);

  const openPledgeModal = (emergencyId: string) => {
    setPledgeData(prev => ({ ...prev, emergencyId }));
    setPledgeSuccess('');
    setPledgeError('');
    (document.getElementById('pledge_modal') as HTMLDialogElement)?.showModal();
  };

  const handlePledgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPledgeError('');
    setPledgeSuccess('');

    try {
      await fetchApi('/donations', {
        method: 'POST',
        body: JSON.stringify(pledgeData)
      });
      setPledgeSuccess('Donation pledge recorded successfully! Thank you.');
      setTimeout(() => {
        (document.getElementById('pledge_modal') as HTMLDialogElement)?.close();
      }, 2000);
    } catch (err: any) {
      setPledgeError(err.message || 'Failed to submit pledge');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Emergencies in Need</h1>
      
      {error && <div className="alert alert-error"><span>{error}</span></div>}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : emergencies.length === 0 ? (
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body items-center text-center py-12">
            <h2 className="card-title text-xl text-gray-500">No active emergencies found</h2>
            <p className="text-gray-400">There are currently no verified emergencies requiring donations.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {emergencies.map(emergency => (
            <div key={emergency._id} className="card bg-base-100 shadow-sm border border-base-300">
              <div className="card-body">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="card-title text-lg">{emergency.category}</h2>
                  <div className="badge badge-info">{emergency.status}</div>
                </div>
                <p className="text-sm text-gray-500 mb-1">
                  <span className="font-semibold">Location:</span> {emergency.location}
                </p>
                <p className="text-sm line-clamp-3 mb-4">{emergency.description}</p>
                
                <div className="card-actions justify-end mt-auto pt-4 border-t border-base-200">
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => openPledgeModal(emergency._id)}
                  >
                    Pledge Resource
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pledge Modal */}
      <dialog id="pledge_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Make a Donation Pledge</h3>
          <p className="text-sm text-gray-500 mb-4">
            This records your intention to donate. Please select the resource type and quantity.
          </p>

          {pledgeSuccess && <div className="alert alert-success mb-4"><span>{pledgeSuccess}</span></div>}
          {pledgeError && <div className="alert alert-error mb-4"><span>{pledgeError}</span></div>}

          <form onSubmit={handlePledgeSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Donation Type</span></label>
              <select 
                className="select select-bordered" 
                value={pledgeData.donationType}
                onChange={e => setPledgeData({...pledgeData, donationType: e.target.value})}
                required
              >
                <option value="Food">Food</option>
                <option value="Water">Water</option>
                <option value="Clothing">Clothing</option>
                <option value="Medical Supplies">Medical Supplies</option>
                <option value="Money">Monetary Pledge</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Quantity / Amount</span></label>
              <input 
                type="number" 
                className="input input-bordered" 
                min="1"
                value={pledgeData.quantity}
                onChange={e => setPledgeData({...pledgeData, quantity: parseInt(e.target.value)})}
                required
              />
            </div>

            <div className="modal-action">
              <button type="button" className="btn" onClick={() => (document.getElementById('pledge_modal') as HTMLDialogElement)?.close()}>
                Cancel
              </button>
              <button type="submit" className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting}>
                Submit Pledge
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
