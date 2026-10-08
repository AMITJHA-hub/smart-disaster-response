"use client";

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Home, AlertTriangle, FileText, User } from 'lucide-react';
import { AICopilot } from '@/components/ui/AICopilot';

const citizenLinks = [
  { href: '/citizen', label: 'Dashboard', icon: <Home size={18} /> },
  { href: '/citizen/report', label: 'Report Emergency', icon: <AlertTriangle size={18} /> },
  { href: '/citizen/my-emergencies', label: 'My Emergencies', icon: <FileText size={18} /> },
  // { href: '/citizen/profile', label: 'Profile', icon: <User size={18} /> }, // Optional based on backend support for standard users
];

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['Citizen']}>
      <>
        <DashboardLayout links={citizenLinks}>
          {children}
        </DashboardLayout>
        <AICopilot contextData={{ role: 'Citizen' }} />
      </>
    </ProtectedRoute>
  );
}
