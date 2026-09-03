import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ErrorState } from '../components/ui/ErrorState';

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
        setError(err.response?.data?.message || 'Có lỗi xảy ra');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-4"><ErrorState message={error} /></div>;
  if (data.message) return <div className="p-8 text-center text-slate-500">{data.message}</div>;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Phòng của tôi</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin phòng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Mã phòng:</span>
              <span className="font-semibold text-primary">{data.room.room_number}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Loại phòng:</span>
              <span>{data.room.room_type}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Diện tích:</span>
              <span>{data.room.area} m²</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hợp đồng thuê</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Ngày bắt đầu:</span>
              <span>{new Date(data.contract.start_date).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Ngày kết thúc:</span>
              <span>{new Date(data.contract.end_date).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Giá thuê/tháng:</span>
              <span className="font-semibold text-danger">{Number(data.contract.rent_price).toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Tiền cọc:</span>
              <span>{Number(data.contract.deposit).toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Trạng thái:</span>
              <Badge status={data.contract.status === 'ACTIVE' ? 'success' : 'default'}>{data.contract.status}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyRoom;
