import React from 'react';

export const StatCard = ({ title, value, icon, description, colorClass = "text-primary" }: any) => {
  return (
    <div className="card glass-panel rounded-2xl premium-card-hover transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
      <div className="card-body p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-base-content/70">{title}</p>
            <p className={`text-3xl font-bold mt-2 ${colorClass}`}>{value}</p>
          </div>
          <div className={`p-3 rounded-xl bg-base-200 ${colorClass}`}>
            {icon}
          </div>
        </div>
        {description && (
          <p className="text-xs text-base-content/60 mt-4">{description}</p>
        )}
      </div>
    </div>
  );
};
