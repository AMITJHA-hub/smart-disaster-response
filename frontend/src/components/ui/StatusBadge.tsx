import React from 'react';

export const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (s: string) => {
    switch (s.toLowerCase()) {
      case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'verified': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50';
      case 'ongoing':
      case 'in progress': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50';
      case 'resolved':
      case 'completed':
      case 'fulfilled': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'rejected':
      case 'cancelled': return 'bg-rose-500/20 text-rose-400 border-rose-500/50';
      case 'assigned': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'partially fulfilled': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${getStatusColor(status)}`}>
      {status}
    </span>
  );
};
