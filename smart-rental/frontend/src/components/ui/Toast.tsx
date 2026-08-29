import React from 'react';

export const Toast = ({ message, type = 'info' }: { message: string, type?: 'success' | 'error' | 'info' }) => {
  const bg = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  return (
    <div className={`fixed bottom-4 right-4 ${bg[type]} text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50`}>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};
