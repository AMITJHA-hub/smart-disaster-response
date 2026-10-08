"use client";

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';

interface Emergency {
  _id: string;
  category: string;
  location: string;
  status: string;
}

interface Pledge {
  _id: string;
  emergency: Emergency;
  donationType: string;
  quantity: number;
  status: 'Pending' | 'Accepted' | 'Fulfilled' | 'Cancelled';
  createdAt: string;
}

export default function DonorPledgesPage() {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPledges = async () => {
      try {
        const data = await fetchApi<{ pledges: Pledge[] }>('/donations/my');
        setPledges(data.pledges);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch pledges');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPledges();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return 'badge-warning';
      case 'Accepted': return 'badge-info';
      case 'Fulfilled': return 'badge-success';
      case 'Cancelled': return 'badge-error';
      default: return 'badge-ghost';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Donation Pledges</h1>
      
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : pledges.length === 0 ? (
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body items-center text-center py-12">
            <h2 className="card-title text-xl text-gray-500">No pledges yet</h2>
            <p className="text-gray-400">You haven't made any donation pledges.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pledges.map(pledge => (
            <div key={pledge._id} className="card bg-base-100 shadow-sm border border-base-300">
              <div className="card-body">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="card-title text-lg">{pledge.donationType}</h2>
                  <div className={`badge ${getStatusBadge(pledge.status)}`}>
                    {pledge.status}
                  </div>
                </div>
                
                <p className="text-3xl font-bold text-primary mb-4">{pledge.quantity}</p>

                {pledge.emergency && (
                  <div className="bg-base-200 p-3 rounded-lg text-sm mb-2">
                    <p className="font-semibold">{pledge.emergency.category}</p>
                    <p className="text-gray-500">{pledge.emergency.location}</p>
                  </div>
                )}
                
                <div className="text-xs text-gray-400 mt-auto pt-4 border-t border-base-200">
                  Pledged on {new Date(pledge.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
