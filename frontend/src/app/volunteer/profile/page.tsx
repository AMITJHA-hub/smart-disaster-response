"use client";

import { useEffect, useState } from 'react';
import { fetchApi, ApiError } from '@/lib/api';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { User, MapPin, Wrench, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface VolunteerProfile {
  _id?: string;
  skills: string[];
  availability: boolean;
  area: string;
}

export default function VolunteerProfilePage() {
  const [profile, setProfile] = useState<VolunteerProfile>({
    skills: [],
    availability: true,
    area: ''
  });
  const [skillsInput, setSkillsInput] = useState('');
  const [isExisting, setIsExisting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await fetchApi<{ volunteer: VolunteerProfile }>('/volunteers/me');
        setProfile(data.volunteer);
        setSkillsInput(data.volunteer.skills.join(', '));
        setIsExisting(true);
      } catch (err: any) {
        if (err.status !== 404) {
          setError(err.message || 'Failed to load profile');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setProfile(prev => ({ ...prev, [name]: checked }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkillsInput(e.target.value);
    setProfile(prev => ({
      ...prev,
      skills: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      if (isExisting) {
        await fetchApi('/volunteers/me', {
          method: 'PATCH',
          body: JSON.stringify(profile)
        });
        setSuccess('Profile updated successfully');
      } else {
        await fetchApi('/volunteers', {
          method: 'POST',
          body: JSON.stringify(profile)
        });
        setSuccess('Profile created successfully');
        setIsExisting(true);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton type="card" count={1} />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-base-300 pb-5">
        <h1 className="text-3xl font-bold tracking-tight">My Volunteer Profile</h1>
        <p className="text-base-content/60 mt-1">Manage your operational readiness and skills.</p>
      </div>
      
      <div className="glass-panel rounded-2xl">
        <div className="card-body p-8">
          {error && (
            <div className="alert alert-error animate-in zoom-in-95 shadow-sm mb-6">
              <AlertTriangle size={20} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="alert alert-success bg-success/10 text-success border-success/20 animate-in zoom-in-95 shadow-sm mb-6">
              <CheckCircle2 size={20} />
              <span>{success}</span>
            </div>
          )}

          {!isExisting && (
            <div className="alert alert-info bg-info/10 text-info border-info/20 mb-8">
              <span>Please set up your profile to start receiving emergency assignments.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <MapPin size={16} className="text-base-content/50" />
                  Service Area (City/Region)
                </span>
              </label>
              <input 
                type="text" 
                name="area" 
                placeholder="e.g., Downtown, North Side" 
                className="input input-bordered w-full bg-base-200/50 focus:bg-base-200" 
                value={profile.area} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Wrench size={16} className="text-base-content/50" />
                  Skills (comma separated)
                </span>
              </label>
              <input 
                type="text" 
                placeholder="e.g., First Aid, Driving, Search and Rescue" 
                className="input input-bordered w-full bg-base-200/50 focus:bg-base-200" 
                value={skillsInput} 
                onChange={handleSkillsChange} 
              />
              {profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {profile.skills.map((skill, idx) => (
                    <span key={idx} className="badge badge-primary badge-outline">{skill}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="form-control bg-base-200/30 p-4 rounded-xl border border-base-300/50 mt-4">
              <label className="label cursor-pointer justify-between">
                <div>
                  <span className="label-text font-medium block text-base">Operational Readiness</span>
                  <span className="label-text-alt text-base-content/60 mt-1">Are you currently available to receive emergency assignments?</span>
                </div>
                <input 
                  type="checkbox" 
                  name="availability"
                  className="toggle toggle-primary toggle-lg" 
                  checked={profile.availability} 
                  onChange={handleChange} 
                />
              </label>
            </div>

            <div className="form-control mt-8 pt-4 border-t border-base-300">
              <button 
                type="submit" 
                className={`btn btn-primary w-full shadow-sm hover:shadow-md transition-all ${isSaving ? 'loading' : ''}`}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : (isExisting ? 'Update Profile' : 'Complete Setup')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
