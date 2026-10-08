import React from 'react';

export const LoadingSkeleton = ({ type = 'card', count = 1 }: { type?: 'card' | 'table' | 'stat', count?: number }) => {
  const renderCardSkeleton = () => (
    <div className="card bg-base-100 shadow-sm border border-base-300 animate-pulse">
      <div className="card-body p-6 space-y-4">
        <div className="h-4 bg-base-300 rounded w-1/3"></div>
        <div className="h-10 bg-base-300 rounded w-full"></div>
        <div className="h-4 bg-base-300 rounded w-2/3"></div>
        <div className="flex gap-2 pt-4">
          <div className="h-10 bg-base-300 rounded w-24"></div>
          <div className="h-10 bg-base-300 rounded w-24"></div>
        </div>
      </div>
    </div>
  );

  const renderTableSkeleton = () => (
    <div className="overflow-x-auto bg-base-100 rounded-box border border-base-300 shadow-sm animate-pulse">
      <table className="table w-full">
        <thead>
          <tr className="bg-base-200">
            <th><div className="h-4 bg-base-300 rounded w-16"></div></th>
            <th><div className="h-4 bg-base-300 rounded w-24"></div></th>
            <th><div className="h-4 bg-base-300 rounded w-24"></div></th>
            <th><div className="h-4 bg-base-300 rounded w-16"></div></th>
          </tr>
        </thead>
        <tbody>
          {[...Array(count)].map((_, i) => (
            <tr key={i}>
              <td><div className="h-4 bg-base-300 rounded w-20"></div></td>
              <td>
                <div className="h-4 bg-base-300 rounded w-32 mb-2"></div>
                <div className="h-3 bg-base-300 rounded w-24"></div>
              </td>
              <td><div className="h-4 bg-base-300 rounded w-24"></div></td>
              <td><div className="h-6 bg-base-300 rounded-full w-20"></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderStatSkeleton = () => (
    <div className="card bg-base-100 shadow-sm border border-base-300 animate-pulse">
      <div className="card-body p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-3 w-full">
            <div className="h-4 bg-base-300 rounded w-1/2"></div>
            <div className="h-8 bg-base-300 rounded w-1/3"></div>
          </div>
          <div className="w-12 h-12 bg-base-300 rounded-xl"></div>
        </div>
      </div>
    </div>
  );

  if (type === 'table') return renderTableSkeleton();
  if (type === 'stat') return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => <React.Fragment key={i}>{renderStatSkeleton()}</React.Fragment>)}
    </div>
  );
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => <React.Fragment key={i}>{renderCardSkeleton()}</React.Fragment>)}
    </div>
  );
};
