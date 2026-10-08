"use client";

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Home, User, Briefcase } from 'lucide-react';
import { AICopilot } from '@/components/ui/AICopilot';

const volunteerLinks = [
  { href: '/volunteer', label: 'Dashboard', icon: <Home size={18} /> },
  { href: '/volunteer/profile', label: 'My Profile', icon: <User size={18} /> },
  { href: '/volunteer/assignments', label: 'My Assignments', icon: <Briefcase size={18} /> },
];

export default function VolunteerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['Volunteer']}>
      <>
        <DashboardLayout links={volunteerLinks}>
          {children}
        </DashboardLayout>
        <AICopilot contextData={{ role: 'Volunteer' }} />
      </>
    </ProtectedRoute>
  );
}
