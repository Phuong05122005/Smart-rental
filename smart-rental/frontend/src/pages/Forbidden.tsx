import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-md w-full">
        <ShieldAlert className="w-16 h-16 text-danger mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">403 - Truy cập bị từ chối</h2>
        <p className="text-slate-500 mb-6">Bạn không có quyền xem trang này. Vui lòng liên hệ quản trị viên nếu bạn nghĩ đây là một sự nhầm lẫn.</p>
        <Button onClick={() => navigate('/dashboard')} className="w-full">
          Quay lại trang chủ
        </Button>
      </div>
    </div>
  );
};

export default Forbidden;
