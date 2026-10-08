"use client";

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Home, AlertTriangle, Users, Briefcase, Box, Heart } from 'lucide-react';
import { AICopilot } from '@/components/ui/AICopilot';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';

const adminLinks = [
  { href: '/admin', label: 'Dashboard Overview', icon: <Home size={18} /> },
  { href: '/admin/emergencies', label: 'Emergencies', icon: <AlertTriangle size={18} /> },
  { href: '/admin/volunteers', label: 'Volunteers', icon: <Users size={18} /> },
  { href: '/admin/assignments', label: 'Assignments', icon: <Briefcase size={18} /> },
  { href: '/admin/resources', label: 'Resources', icon: <Box size={18} /> },
  { href: '/admin/donations', label: 'Donations', icon: <Heart size={18} /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [contextData, setContextData] = useState<any>({});

  useEffect(() => {
    const loadContext = async () => {
      try {
        const [emData, volData] = await Promise.all([
          fetchApi<{emergencies: any[]}>('/emergencies'),
          fetchApi<{volunteers: any[]}>('/volunteers')
        ]);
        setContextData({
          emergencies: emData.emergencies,
          volunteers: volData.volunteers
        });
      } catch (e) {}
    };
    loadContext();
  }, []);

  return (
    <ProtectedRoute allowedRoles={['Administrator']}>
      <>
        <DashboardLayout links={adminLinks}>
          {children}
        </DashboardLayout>
        <AICopilot contextData={contextData} />
      </>
    </ProtectedRoute>
  );
}
