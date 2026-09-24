import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { ErrorState } from '../components/ui/ErrorState';
import { Home, FileText, Calendar, DollarSign, ShieldCheck, DoorOpen, Maximize, CheckCircle2, Building2 } from 'lucide-react';

const MyRoom = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/my-room')
      .then(res => {
        setData(res.data);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
      Đang tải thông tin phòng...
    </div>
  );
  if (error) return <div className="p-4"><ErrorState message={error} /></div>;
  if (data.message) return (
    <div className="p-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
        <Home size={32} />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">Chưa có thông tin</h3>
      <p className="text-slate-500">{data.message}</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
          <Home className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Phòng của tôi</h2>
          <p className="text-sm text-slate-500">Quản lý thông tin phòng và hợp đồng thuê</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Thông tin phòng */}
        <Card className="shadow-sm border-slate-100 rounded-2xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <DoorOpen className="w-5 h-5 text-blue-600" />
              Thông tin phòng
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="p-2 bg-slate-100 rounded-lg"><Home className="w-4 h-4" /></div>
                <span className="font-medium">Mã phòng / Số phòng</span>
              </div>
              <span className="text-lg font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                {data.room.room_number}
              </span>
            </div>
            
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="p-2 bg-slate-100 rounded-lg"><Building2 className="w-4 h-4" /></div>
                <span className="font-medium">Loại phòng</span>
              </div>
              <span className="font-semibold text-slate-800">{data.room.room_type || 'Tiêu chuẩn'}</span>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="p-2 bg-slate-100 rounded-lg"><Maximize className="w-4 h-4" /></div>
                <span className="font-medium">Diện tích</span>
              </div>
              <span className="font-bold text-slate-800">{data.room.area} m²</span>
            </div>

            <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl flex items-start gap-3 border border-emerald-100">
              <CheckCircle2 className="w-5 h-5 mt-0.5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Phòng đang hoạt động tốt</p>
                <p className="text-xs text-emerald-600/80 mt-1">Mọi thông tin về phòng của bạn đã được xác thực trên hệ thống.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hợp đồng thuê */}
        <Card className="shadow-sm border-slate-100 rounded-2xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Hợp đồng thuê
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Ngày bắt đầu</span>
                </div>
                <div className="font-bold text-slate-800">{new Date(data.contract.start_date).toLocaleDateString('vi-VN')}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Ngày kết thúc</span>
                </div>
                <div className="font-bold text-slate-800">{new Date(data.contract.end_date).toLocaleDateString('vi-VN')}</div>
              </div>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="p-2 bg-slate-100 rounded-lg"><DollarSign className="w-4 h-4" /></div>
                <span className="font-medium">Giá thuê / tháng</span>
              </div>
              <span className="text-lg font-black text-rose-600">
                {Number(data.contract.rent_price).toLocaleString('vi-VN')} ₫
              </span>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="p-2 bg-slate-100 rounded-lg"><ShieldCheck className="w-4 h-4" /></div>
                <span className="font-medium">Tiền cọc đảm bảo</span>
              </div>
              <span className="font-bold text-emerald-600">
                {Number(data.contract.deposit).toLocaleString('vi-VN')} ₫
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-600 pl-11">Trạng thái hợp đồng</span>
              {data.contract.status === 'ACTIVE' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Đang hiệu lực
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                  {data.contract.status}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyRoom;
