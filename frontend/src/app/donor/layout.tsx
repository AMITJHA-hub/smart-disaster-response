"use client";

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Home, AlertTriangle, Heart } from 'lucide-react';
import { AICopilot } from '@/components/ui/AICopilot';

const donorLinks = [
  { href: '/donor', label: 'Dashboard', icon: <Home size={18} /> },
  { href: '/donor/emergencies', label: 'Verified Emergencies', icon: <AlertTriangle size={18} /> },
  { href: '/donor/pledges', label: 'My Pledges', icon: <Heart size={18} /> },
];

export default function DonorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['Donor']}>
      <>
        <DashboardLayout links={donorLinks}>
          {children}
        </DashboardLayout>
        <AICopilot contextData={{ role: 'Donor' }} />
      </>
    </ProtectedRoute>
  );
}
