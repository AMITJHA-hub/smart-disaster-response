"use client";

import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar, { SidebarLink } from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  links: SidebarLink[];
}

export default function DashboardLayout({ children, links }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <Navbar toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 pt-16">
        <Sidebar 
          links={links} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        
        <main className="flex-1 p-4 lg:ml-64 bg-base-200/50 min-h-[calc(100vh-4rem)]">
          <div className="container mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
