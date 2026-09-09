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
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getRooms, createRoom, updateRoom, deleteRoom, type Room } from '../services/roomService';
import { useAuth } from '../contexts/AuthContext';

const Rooms = () => {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'LANDLORD';

  const [rooms, setRooms] = useState<Room[]>([]);
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
      setFormData({ room_number: '', room_type: '', price: '', area: '', description: '', status: 'AVAILABLE' as Room['status'] });
    }
    setIsFormOpen(true);
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
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Số phòng *</label>
            <Input required value={formData.room_number} onChange={e => setFormData({...formData, room_number: e.target.value})} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Loại phòng</label>
            <Input value={formData.room_type} onChange={e => setFormData({...formData, room_type: e.target.value})} placeholder="VD: Studio, 1PN..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Giá phòng (VNĐ) *</label>
              <Input type="number" required min="1" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              {formData.price && (
                <p className="text-sm text-green-600 mt-1 font-medium">
                  Hiển thị: {Number(formData.price).toLocaleString('vi-VN')} đ
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Diện tích (m2) *</label>
              <Input type="number" required min="1" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Trạng thái</label>
            <select 
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value as Room['status']})}
            >
              <option value="AVAILABLE">Trống</option>
              <option value="RENTED">Đang thuê</option>
              <option value="MAINTENANCE">Bảo trì</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Mô tả</label>
            <textarea 
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <Button type="submit" className="w-full">Lưu lại</Button>
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
