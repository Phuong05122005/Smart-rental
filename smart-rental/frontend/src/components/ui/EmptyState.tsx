import React from 'react';
import { FolderOpen } from 'lucide-react';

export const EmptyState = ({ title = 'Không có dữ liệu', description = 'Hiện chưa có dữ liệu để hiển thị.' }: { title?: string, description?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg border border-dashed border-slate-300">
      <FolderOpen className="w-12 h-12 text-slate-300 mb-4" />
      <h3 className="text-lg font-medium text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-1">{description}</p>
    </div>
  );
};
