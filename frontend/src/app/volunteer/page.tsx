"use client";

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { User, Briefcase } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [profileExists, setProfileExists] = useState<boolean | null>(null);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        await fetchApi('/volunteers/me');
        setProfileExists(true);
      } catch (err) {
        setProfileExists(false);
      }
    };
    checkProfile();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-base-300 pb-5">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}</h1>
        <p className="text-base-content/60 mt-2">
          Thank you for volunteering! Manage your profile and assignments here.
        </p>
      </div>

      {profileExists === false && (
        <div className="alert alert-warning shadow-sm border border-warning/20 bg-warning/10 animate-in zoom-in-95">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <span>You have not set up your Volunteer Profile yet. You won't be able to receive assignments until you do!</span>
          <div>
            <Link href="/volunteer/profile" className="btn btn-sm btn-primary">Setup Profile</Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="glass-panel rounded-2xl premium-card-hover transition-all duration-300">
          <div className="card-body items-center text-center py-10">
            <div className="p-4 bg-primary/10 rounded-full mb-4 text-primary">
              <User size={40} />
            </div>
            <h2 className="card-title text-xl">My Profile</h2>
            <p className="text-sm text-base-content/60 max-w-xs mt-2">Update your skills, availability, and response area.</p>
            <div className="card-actions mt-6">
              <Link href="/volunteer/profile" className="btn btn-outline btn-primary shadow-sm hover:shadow-md transition-shadow">
                Manage Profile
              </Link>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl premium-card-hover transition-all duration-300">
          <div className="card-body items-center text-center py-10">
            <div className="p-4 bg-indigo-500/10 rounded-full mb-4 text-indigo-500">
              <Briefcase size={40} />
            </div>
            <h2 className="card-title text-xl">My Assignments</h2>
            <p className="text-sm text-base-content/60 max-w-xs mt-2">View and update tasks assigned to you by administrators.</p>
            <div className="card-actions mt-6">
              <Link href="/volunteer/assignments" className="btn btn-primary shadow-sm hover:shadow-md transition-shadow">
                View Assignments
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
