import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  status?: 'success' | 'info' | 'warning' | 'danger' | 'default';
}

export const Badge: React.FC<BadgeProps> = ({ children, status = 'default' }) => {
  const variants = {
    success: "bg-green-100 text-green-700 border border-green-200",
    info: "bg-blue-100 text-blue-700 border border-blue-200",
    warning: "bg-orange-100 text-orange-700 border border-orange-200",
    danger: "bg-red-100 text-red-700 border border-red-200",
    default: "bg-slate-100 text-slate-700 border border-slate-200"
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[status]}`}>
      {children}
    </span>
  );
};
