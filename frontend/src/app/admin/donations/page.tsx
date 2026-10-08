"use client";

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';

interface Pledge {
  _id: string;
  emergency: any;
  donor: any;
  donationType: string;
  quantity: number;
  status: string;
  createdAt: string;
}

export default function AdminDonationsPage() {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPledges = async () => {
    try {
      const data = await fetchApi<{ pledges: Pledge[] }>('/donations/all');
      setPledges(data.pledges);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pledges');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPledges();
  }, []);

  const handleVerify = async (id: string) => {
    try {
      await fetchApi(`/donations/${id}/verify`, { method: 'PATCH' });
      fetchPledges(); // Refresh the list
    } catch (err: any) {
      alert(err.message || 'Failed to verify pledge');
    }
  };

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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Donation Pledges</h1>
      </div>
      
      {error && <div className="alert alert-error"><span>{error}</span></div>}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : pledges.length === 0 ? (
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body items-center text-center py-12">
            <h2 className="card-title text-xl text-gray-500">No pledges</h2>
            <p className="text-gray-400">No donation pledges have been made yet.</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-base-100 rounded-box border border-base-300 shadow-sm">
          <table className="table w-full">
            <thead>
              <tr className="bg-base-200">
                <th>Date</th>
                <th>Donor Info</th>
                <th>Emergency</th>
                <th>Donation</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pledges.map(pledge => (
                <tr key={pledge._id} className="hover">
                  <td className="whitespace-nowrap">
                    {new Date(pledge.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    {pledge.donor ? (
                      <div>
                        <div className="font-medium">{pledge.donor.name}</div>
                        <div className="text-xs text-gray-500">{pledge.donor.email}</div>
                        <div className="text-xs text-gray-500">{pledge.donor.phone}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Unknown Donor</span>
                    )}
                  </td>
                  <td>
                    {pledge.emergency ? (
                      <div>
                        <div className="font-medium">{pledge.emergency.category}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[150px]">{pledge.emergency.location}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Deleted</span>
                    )}
                  </td>
                  <td>
                    <div className="font-bold text-primary text-lg">{pledge.quantity}</div>
                    <div className="text-xs text-gray-600">{pledge.donationType}</div>
                  </td>
                  <td>
                    <div className={`badge ${getStatusBadge(pledge.status)}`}>
                      {pledge.status}
                    </div>
                  </td>
                  <td>
                    {pledge.status === 'Pending' && (
                      <button 
                        onClick={() => handleVerify(pledge._id)}
                        className="btn btn-sm btn-outline btn-success"
                      >
                        Verify Received
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
