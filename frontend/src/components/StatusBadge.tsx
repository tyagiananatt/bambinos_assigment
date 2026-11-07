import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const s = status.toUpperCase();
  let bg = 'bg-gray-100 text-gray-700 border-gray-200';

  if (s.includes('AUTO_APPROVED') || s === 'APPROVED' || s === 'PAID' || s === 'COMPLIANT' || s === 'COMPLETED' || s === 'RESOLVED') {
    bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (s.includes('CRITICAL') || s.includes('FAIL') || s.includes('REJECTED')) {
    bg = 'bg-red-50 text-red-700 border-red-200';
  } else if (s.includes('HIGH') || s.includes('MISSING') || s.includes('PARTIAL') || s.includes('UNAVAILABLE') || s.includes('AT RISK')) {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (s.includes('MEDIUM') || s.includes('PENDING') || s.includes('REVIEW') || s.includes('IN REVIEW') || s.includes('OPEN')) {
    bg = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (s.includes('ALREADY_SCHEDULED') || s.includes('SCHEDULED')) {
    bg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }

  const px = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${bg} ${px}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

