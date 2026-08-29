import React from 'react';
import { AlertCircle } from 'lucide-react';

export const ErrorState = ({ message = 'Đã có lỗi xảy ra.' }: { message?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-lg border border-red-100">
      <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
      <h3 className="text-lg font-medium text-red-800">Lỗi</h3>
      <p className="text-sm text-red-600 mt-1">{message}</p>
    </div>
  );
};
