import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const s = status.toLowerCase();

  if (s === 'confirmed' || s === 'active' || s === 'connected' || s === 'delivered') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 capitalize">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        {status}
      </span>
    );
  }

  if (s === 'processing' || s === 'in transit' || s === 'shipped' || s === 'syncing') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60 capitalize">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        {status}
      </span>
    );
  }

  if (s === 'delayed' || s === 'offline' || s === 'cancelled' || s === 'expired') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200/60 capitalize">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        {status}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200 capitalize">
      {status}
    </span>
  );
}

