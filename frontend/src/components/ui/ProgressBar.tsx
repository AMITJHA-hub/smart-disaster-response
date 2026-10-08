import React from 'react';

export const ProgressBar = ({ current, total, label }: { current: number, total: number, label?: string }) => {
  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  
  let colorClass = 'bg-amber-500';
  if (percentage >= 100) colorClass = 'bg-emerald-500';
  else if (percentage > 0) colorClass = 'bg-indigo-500';

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-base-content/70">{label || 'Progress'}</span>
        <span className="font-medium">{current} / {total} ({percentage}%)</span>
      </div>
      <div className="w-full h-2.5 bg-base-300 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};
