import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { Search, DoorOpen, Maximize2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { getRooms, requestRentRoom, type Room } from '../services/roomService';

const AvailableRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getRooms({ page, limit: 12, search, status: statusFilter });
      setRooms(res.data);
      setTotalPages(res.meta.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách phòng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRooms();
  };

  const handleRequestRent = async (roomId: string) => {
    try {
      await requestRentRoom(roomId);
      toast.success('Yêu cầu thuê phòng đã được gửi! Quản lý sẽ sớm liên hệ với bạn.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RENTED': return <Badge status="danger">Đã có người thuê</Badge>;
      case 'AVAILABLE': return <Badge status="success">Phòng trống</Badge>;
      case 'MAINTENANCE': return <Badge status="warning">Đang bảo trì</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Danh sách các phòng</h2>
        <p className="text-slate-500 mt-1">Khám phá và đăng ký thuê các phòng còn trống trong hệ thống</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <form onSubmit={handleSearch} className="relative w-full sm:w-80">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            className="pl-10 h-10 border-slate-200 focus:border-blue-500 shadow-sm rounded-lg" 
            placeholder="Tìm số phòng, loại phòng..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <select 
          className="px-4 h-10 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-auto shadow-sm cursor-pointer transition-colors"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="AVAILABLE">Phòng trống</option>
          <option value="RENTED">Đã có người thuê</option>
          <option value="MAINTENANCE">Đang bảo trì</option>
        </select>
      </div>
      
      {loading ? (
        <div className="p-12 text-center text-slate-500 flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          Đang tải dữ liệu phòng...
        </div>
      ) : error ? (
        <ErrorState message={error} />
      ) : rooms.length === 0 ? (
        <EmptyState title="Không tìm thấy phòng" description="Chưa có phòng nào khớp với tiêu chí tìm kiếm." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <Card key={room.id} className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200 rounded-2xl group">
                <div className="h-40 bg-gradient-to-br from-blue-50 to-slate-100 relative flex items-center justify-center border-b border-slate-100 group-hover:from-blue-100/50 transition-colors">
                  <DoorOpen className="w-16 h-16 text-blue-200 group-hover:text-blue-300 transition-colors drop-shadow-sm" />
                  <div className="absolute top-4 right-4">
                    {getStatusBadge(room.status)}
                  </div>
                  <div className="absolute -bottom-5 left-6 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-md font-black text-slate-800 flex items-center gap-2 text-lg">
                    Phòng {room.room_number}
                  </div>
                </div>
                <CardContent className="p-6 pt-10 space-y-5">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-3xl font-black text-blue-700 tracking-tight">
                        {Number(room.price).toLocaleString('vi-VN')} <span className="text-sm text-slate-500 font-medium">₫/tháng</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-white rounded-md shadow-sm text-slate-400"><Tag className="w-4 h-4" /></div>
                      <span className="font-semibold text-slate-700 truncate">{room.room_type || 'Tiêu chuẩn'}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-white rounded-md shadow-sm text-slate-400"><Maximize2 className="w-4 h-4" /></div>
                      <span className="font-semibold text-slate-700">{room.area} m²</span>
                    </div>
                  </div>
                  
                  {room.description && (
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed h-10">
                      {room.description}
                    </p>
                  )}
                  
                  <div className="pt-2">
                    <button 
                      className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${room.status === 'AVAILABLE' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                      disabled={room.status !== 'AVAILABLE'}
                      onClick={() => handleRequestRent(room.id)}
                    >
                      {room.status === 'AVAILABLE' ? (
                        <>Đăng ký thuê phòng ngay</>
                      ) : (
                        <>Không thể đăng ký</>
                      )}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button variant="outline" className="h-10 px-4 text-sm font-medium" disabled={page === 1} onClick={() => setPage(page - 1)}>Trang trước</Button>
              <span className="text-sm font-medium text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200">Trang {page} / {totalPages}</span>
              <Button variant="outline" className="h-10 px-4 text-sm font-medium" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Trang sau</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AvailableRooms;
