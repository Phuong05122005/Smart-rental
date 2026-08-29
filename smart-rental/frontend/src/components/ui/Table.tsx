import React from 'react';

export const Table = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className="overflow-x-auto"><table className={`w-full text-sm text-left text-slate-600 ${className}`}>{children}</table></div>
);

export const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">{children}</thead>
);

export const TableRow = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <tr className={`border-b border-slate-200 hover:bg-slate-50/50 transition-colors ${className}`}>{children}</tr>
);

export const TableHead = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <th className={`px-6 py-4 font-semibold text-slate-700 ${className}`}>{children}</th>
);

export const TableCell = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <td className={`px-6 py-4 align-middle ${className}`}>{children}</td>
);
