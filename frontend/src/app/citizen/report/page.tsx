"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi, ApiError } from '@/lib/api';

export default function ReportEmergencyPage() {
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    location: '',
    image: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setSuccess(false);

    try {
      await fetchApi('/emergencies', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setSuccess(true);
      setFormData({ category: '', description: '', location: '', image: '' });
      
      // Give a moment for user to see success message
      setTimeout(() => {
        router.push('/citizen/my-emergencies');
      }, 2000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while reporting');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Report Emergency</h1>
      
      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="card-body">
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="alert alert-success mb-4">
              <span>Emergency reported successfully! Redirecting...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Category</span></label>
              <select 
                name="category" 
                className="select select-bordered w-full" 
                value={formData.category} 
                onChange={handleChange} 
                required
              >
                <option value="" disabled>Select category</option>
                <option value="Flood">Flood</option>
                <option value="Earthquake">Earthquake</option>
                <option value="Fire">Fire</option>
                <option value="Medical">Medical Emergency</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Location</span></label>
              <input 
                type="text" 
                name="location" 
                placeholder="Specific address or landmark" 
                className="input input-bordered w-full" 
                value={formData.location} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Description</span></label>
              <textarea 
                name="description" 
                placeholder="Describe the situation..." 
                className="textarea textarea-bordered h-24" 
                value={formData.description} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Image URL (Optional)</span>
              </label>
              <input 
                type="text" 
                name="image" 
                placeholder="https://..." 
                className="input input-bordered w-full" 
                value={formData.image} 
                onChange={handleChange} 
              />
            </div>

            <div className="form-control mt-6">
              <button 
                type="submit" 
                className={`btn btn-error text-white ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
