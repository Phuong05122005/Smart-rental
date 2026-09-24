import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/Dialog';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Plus, Search, Edit2, Trash2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { getRooms, createRoom, updateRoom, deleteRoom, predictRoomPrice, type Room } from '../services/roomService';
import { getHouses, type House } from '../services/houseService';
import { useAuth } from '../contexts/AuthContext';

const Rooms = () => {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'LANDLORD';

  const [rooms, setRooms] = useState<Room[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    room_number: '',
    room_type: '',
    price: '',
    area: '',
    description: '',
    status: 'AVAILABLE' as Room['status']
  });

  
  const fetchHouses = async () => {
    try {
      const data = await getHouses();
      setHouses(data);
    } catch (err) {
      console.error(err);
    }
  };
  
  const fetchRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getRooms({ page, limit: 10, search, status: statusFilter });
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

  // Handle Search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRooms();
  };

  const openForm = (room?: Room) => {
    if (room) {
      setSelectedRoom(room);
      setFormData({
        room_number: room.room_number,
        room_type: room.room_type || '',
        price: room.price.toString(),
        area: room.area.toString(),
        description: room.description || '',
        status: room.status
      });
    } else {
      setSelectedRoom(null);
      setFormData({ house_id: '', room_number: '', room_type: '', price: '', area: '', capacity: '1', description: '', status: 'AVAILABLE' as Room['status'] });
    }
    setIsFormOpen(true);
  };

  
  const handlePredictPrice = async () => {
    if (!formData.area) {
      toast.error('Vui lòng nhập Diện tích trước để AI dự đoán');
      return;
    }
    try {
      setIsAILoading(true);
      // Giả định capacity = 2 nếu người dùng chưa có trường capacity
      const res = await predictRoomPrice(Number(formData.area), 2);
      setFormData({ ...formData, price: res.data.predicted_price.toString() });
      toast.success('AI đã gợi ý giá phòng: ' + res.data.predicted_price.toLocaleString() + ' ₫');
    } catch (err) {
      toast.error('Lỗi khi lấy dự đoán AI');
    } finally {
      setIsAILoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.room_number || !formData.price || !formData.area) {
      toast.error('Vui lòng nhập đầy đủ Số phòng, Giá và Diện tích.');
      return;
    }
    
    try {
      if (selectedRoom) {
        await updateRoom(selectedRoom.id, formData);
        toast.success('Cập nhật phòng thành công');
      } else {
        await createRoom(formData);
        toast.success('Thêm phòng mới thành công');
      }
      setIsFormOpen(false);
      fetchRooms();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const confirmDelete = (room: Room) => {
    setSelectedRoom(room);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedRoom) return;
    try {
      await deleteRoom(selectedRoom.id);
      toast.success('Xóa phòng thành công');
      fetchRooms();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RENTED': return <Badge status="info">Đang thuê</Badge>;
      case 'AVAILABLE': return <Badge status="success">Trống</Badge>;
      case 'MAINTENANCE': return <Badge status="warning">Bảo trì</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800">Quản lý phòng</h2>
        {canEdit && (
          <Button className="gap-2" onClick={() => openForm()}><Plus className="w-4 h-4" /> Thêm phòng mới</Button>
        )}
      </div>

      <Card className="shadow-sm border-slate-100 overflow-hidden rounded-xl">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center bg-slate-50/50">
          <form onSubmit={handleSearch} className="relative w-full sm:w-72">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              className="pl-10 h-10 border-slate-200 focus:border-blue-500 shadow-sm rounded-lg" 
              placeholder="Tìm số phòng, loại..." 
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
            <option value="RENTED">Đang thuê</option>
            <option value="MAINTENANCE">Bảo trì</option>
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
          <EmptyState title="Không tìm thấy phòng" description="Chưa có phòng nào hoặc không khớp với tìm kiếm." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table className="w-full text-sm text-left">
                <TableHeader className="bg-slate-50/80 border-b border-slate-100 uppercase text-xs font-semibold text-slate-500 tracking-wider">
                  <TableRow>
                    <TableHead className="py-4 pl-6">Phòng</TableHead>
                    <TableHead className="py-4">Loại phòng</TableHead>
                    <TableHead className="py-4">Giá (VNĐ)</TableHead>
                    <TableHead className="py-4 text-center">Diện tích (m²)</TableHead>
                    <TableHead className="py-4 text-center">Trạng thái</TableHead>
                    <TableHead className="py-4">Khách thuê</TableHead>
                    {canEdit && <TableHead className="py-4 text-right pr-6">Thao tác</TableHead>}
                  </TableRow>
                </TableHeader>
                <tbody className="divide-y divide-slate-100">
                  {rooms.map((room) => (
                    <TableRow key={room.id} className="hover:bg-slate-50/50 transition-colors group">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                            {room.room_number}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 font-medium text-slate-700">{room.room_type || '-'}</TableCell>
                      <TableCell className="py-4 font-semibold text-slate-800">{Number(room.price).toLocaleString('vi-VN')} đ</TableCell>
                      <TableCell className="py-4 text-center text-slate-600">{room.area}</TableCell>
                      <TableCell className="py-4 text-center">{getStatusBadge(room.status)}</TableCell>
                      <TableCell className="py-4">
                        {room.contracts && room.contracts.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {room.contracts.filter(c => c.status === 'ACTIVE').map(c => (
                              <div key={c.id} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-sm font-medium text-slate-700">
                                  {c.tenant.full_name}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                            Trống
                          </span>
                        )}
                      </TableCell>
                      {canEdit && (
                        <TableCell className="py-4 pr-6 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openForm(room)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Sửa">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => confirmDelete(room)} className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" title="Xóa">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white rounded-b-xl">
                <span className="text-sm font-medium text-slate-500">Trang {page} / {totalPages}</span>
                <div className="flex gap-2">
                  <Button variant="outline" className="h-9 px-4 text-sm font-medium" disabled={page === 1} onClick={() => setPage(page - 1)}>Trước</Button>
                  <Button variant="outline" className="h-9 px-4 text-sm font-medium" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Sau</Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Form Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedRoom ? 'Cập nhật phòng' : 'Thêm phòng mới'}>
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Nhà trọ <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 h-10 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm cursor-pointer transition-colors"
                value={formData.house_id}
                onChange={(e) => setFormData({ ...formData, house_id: e.target.value })}
                required
              >
                <option value="" disabled>-- Chọn nhà trọ --</option>
                {houses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Trạng thái
              </label>
              <select 
                className="w-full px-3 h-10 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm cursor-pointer transition-colors"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as Room['status']})}
              >
                <option value="AVAILABLE">✨ Trống</option>
                <option value="RENTED">🔒 Đang thuê</option>
                <option value="MAINTENANCE">🔧 Bảo trì</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Số phòng <span className="text-red-500">*</span></label>
              <Input required className="h-10 text-sm font-medium shadow-sm" value={formData.room_number} onChange={e => setFormData({...formData, room_number: e.target.value})} placeholder="VD: P.101" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Loại phòng</label>
              <Input className="h-10 text-sm font-medium shadow-sm" value={formData.room_type} onChange={e => setFormData({...formData, room_type: e.target.value})} placeholder="VD: Studio, 1PN..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sức chứa (người) <span className="text-red-500">*</span></label>
              <Input required type="number" min="1" className="h-10 text-sm font-medium shadow-sm" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Diện tích (m2) <span className="text-red-500">*</span></label>
              <Input required type="number" min="1" className="h-10 text-sm font-medium shadow-sm" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Giá phòng (VNĐ) <span className="text-red-500">*</span>
              </label>
              <button type="button" onClick={handlePredictPrice} disabled={isAILoading} className="text-xs text-blue-700 hover:text-blue-900 flex items-center gap-1 font-bold bg-blue-100 hover:bg-blue-200 px-2.5 py-1.5 rounded-md shadow-sm transition-colors">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> {isAILoading ? 'Đang phân tích dữ liệu...' : '🤖 Dùng AI dự đoán giá'}
              </button>
            </div>
            <Input type="number" required min="1" className="h-10 text-base font-bold shadow-sm text-blue-700 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="VD: 3000000" />
            {formData.price && (
              <p className="text-xs text-slate-500 mt-2 font-medium flex items-center gap-1">
                Giá thuê hiển thị: <span className="text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded border border-green-200">{Number(formData.price).toLocaleString('vi-VN')} ₫ / tháng</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Mô tả thêm</label>
            <textarea 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-colors"
              rows={3}
              placeholder="Tiện ích nội thất, hướng cửa, sổ hộ khẩu..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          
          <div className="pt-2">
            <Button type="submit" className="w-full h-11 font-semibold text-base bg-blue-600 hover:bg-blue-700 shadow-sm">Lưu thông tin phòng</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xóa phòng"
        message={`Bạn có chắc chắn muốn xóa phòng ${selectedRoom?.room_number}? Hành động này không thể hoàn tác.`}
        isDestructive
      />
    </div>
  );
};

export default Rooms;
