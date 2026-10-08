import React from 'react';

export const EmptyState = ({ icon, title, description }: any) => {
  return (
    <div className="glass-panel rounded-2xl animate-in fade-in zoom-in-95 duration-300">
      <div className="card-body items-center text-center py-16">
        <div className="text-base-content/30 mb-4 p-4 rounded-full bg-base-200">
          {icon}
        </div>
        <h3 className="card-title text-xl text-base-content/80">{title}</h3>
        {description && <p className="text-sm text-base-content/50 max-w-sm mt-2">{description}</p>}
      </div>
    </div>
  );
};
