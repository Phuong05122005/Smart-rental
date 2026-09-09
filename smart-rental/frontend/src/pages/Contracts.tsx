import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Plus, Search, Eye, RefreshCw, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

import { getContracts, createContract, updateContract, type Contract } from '../services/contractService';
import { getRooms, type Room } from '../services/roomService';
import { getTenants, type Tenant } from '../services/tenantService';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

const Contracts = () => {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'LANDLORD';

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  // Form Data
  const [formData, setFormData] = useState({
    tenant_id: '',
    room_id: '',
    start_date: '',
    end_date: '',
    rent_price: '',
    deposit: ''
  });
  
  // Selection lists for form
  const [roomsList, setRoomsList] = useState<Room[]>([]);
  const [tenantsList, setTenantsList] = useState<Tenant[]>([]);

  const fetchContracts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getContracts({ page, limit: 10, search, status: statusFilter });
      setContracts(res.data);
      setTotalPages(res.meta.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi tải danh sách hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchContracts();
  };

  const location = useLocation();
  useEffect(() => {
    if (location.state?.openCreateModal) {
      openForm(location.state?.autoFillFrom);
      // Clean up state so it doesn't reopen on reload
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const loadFormDependencies = async (autoFillFrom?: string) => {
    try {
      // Get all tenants and AVAILABLE rooms
      const [rRes, tRes] = await Promise.all([
        getRooms({ limit: 100, status: 'AVAILABLE' }),
        getTenants({ limit: 100 })
      ]);
      setRoomsList(rRes.data);
      setTenantsList(tRes.data);

      if (autoFillFrom) {
        const match = autoFillFrom.match(/Khách thuê (.*?) vừa gửi yêu cầu muốn thuê phòng (.*?)\./);
        if (match) {
          const tenantName = match[1];
          const roomNumber = match[2];
          const matchedTenant = tRes.data.find((t: any) => t.full_name === tenantName || t.username === tenantName);
          const matchedRoom = rRes.data.find((r: any) => String(r.room_number) === String(roomNumber));
          
          if (matchedTenant || matchedRoom) {
            const today = new Date();
            const nextYear = new Date();
            nextYear.setFullYear(today.getFullYear() + 1);
            
            setFormData(prev => ({
              ...prev,
              tenant_id: matchedTenant ? matchedTenant.id : prev.tenant_id,
              room_id: matchedRoom ? matchedRoom.id : prev.room_id,
              rent_price: matchedRoom ? String(matchedRoom.price) : prev.rent_price,
              start_date: today.toISOString().split('T')[0],
              end_date: nextYear.toISOString().split('T')[0]
            }));
            toast.success('Đã tự động điền thông tin từ yêu cầu thuê phòng!');
          }
        }
      }
    } catch (err) {
      toast.error('Không tải được danh sách phòng/khách thuê');
    }
  };

  const openForm = (autoFillFrom?: string) => {
    setFormData({ tenant_id: '', room_id: '', start_date: '', end_date: '', rent_price: '', deposit: '0' });
    loadFormDependencies(autoFillFrom);
    setIsFormOpen(true);
  };





  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createContract(formData);
      toast.success('Tạo hợp đồng thành công');
      setIsFormOpen(false);
      fetchContracts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const openView = (contract: Contract) => {
    setSelectedContract(contract);
    setIsViewOpen(true);
  };

  const openUpdateStatus = (contract: Contract) => {
    setSelectedContract(contract);
    setIsUpdateStatusOpen(true);
  };

  const handleUpdateStatus = async (status: Contract['status']) => {
    if (!selectedContract) return;
    try {
      await updateContract(selectedContract.id, { status });
      toast.success(`Đã cập nhật trạng thái hợp đồng thành ${status}`);
      setIsUpdateStatusOpen(false);
      fetchContracts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi cập nhật');
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('vi-VN');

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ACTIVE': return <Badge status="success">Đang hiệu lực</Badge>;
      case 'EXPIRED': return <Badge status="warning">Hết hạn</Badge>;
      case 'CANCELLED': return <Badge status="danger">Đã hủy</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800">Quản lý Hợp đồng</h2>
        {canEdit && (
          <Button className="gap-2" onClick={() => openForm()}><Plus className="w-4 h-4" /> Tạo hợp đồng mới</Button>
        )}
      </div>

      <Card className="shadow-sm border-slate-100 overflow-hidden rounded-xl">
        <div className="p-5 border-b border-slate-100 flex gap-4 items-center bg-slate-50/50">
          <form onSubmit={handleSearch} className="relative w-full sm:w-80">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              className="pl-10 h-10 border-slate-200 focus:border-blue-500 shadow-sm rounded-lg" 
              placeholder="Mã HĐ, Tên KH, Số phòng..." 
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
            <option value="ACTIVE">Đang hiệu lực</option>
            <option value="EXPIRED">Đã hết hạn</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            Đang tải dữ liệu hợp đồng...
          </div>
        ) : error ? (
          <ErrorState message={error} />
        ) : contracts.length === 0 ? (
          <EmptyState title="Không tìm thấy hợp đồng" description="Chưa có dữ liệu hợp đồng nào hoặc không khớp với tìm kiếm." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table className="w-full text-sm text-left">
                <TableHeader className="bg-slate-50/80 border-b border-slate-100 uppercase text-xs font-semibold text-slate-500 tracking-wider">
                  <TableRow>
                    <TableHead className="py-4 pl-6">Mã HĐ</TableHead>
                    <TableHead className="py-4">Khách thuê</TableHead>
                    <TableHead className="py-4 text-center">Phòng</TableHead>
                    <TableHead className="py-4 text-center">Thời hạn</TableHead>
                    <TableHead className="py-4 text-right">Giá thuê</TableHead>
                    <TableHead className="py-4 text-right">Tiền cọc</TableHead>
                    <TableHead className="py-4 text-center">Trạng thái</TableHead>
                    {canEdit && <TableHead className="py-4 text-right pr-6">Thao tác</TableHead>}
                  </TableRow>
                </TableHeader>
                <tbody className="divide-y divide-slate-100">
                  {contracts.map((c) => (
                    <TableRow key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                      <TableCell className="pl-6 py-4 font-mono text-xs text-slate-400 font-medium">{c.id.substring(0, 8).toUpperCase()}</TableCell>
                      <TableCell className="py-4 font-semibold text-slate-800">{c.tenant_name}</TableCell>
                      <TableCell className="py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          {c.room_number}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100">
                          <span className="text-xs font-medium text-slate-500">{formatDate(c.start_date)}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="text-xs font-bold text-slate-700">{formatDate(c.end_date)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-right text-slate-600">{Number(c.rent_price).toLocaleString('vi-VN')} đ</TableCell>
                      <TableCell className="py-4 text-right text-slate-600">{Number(c.deposit).toLocaleString('vi-VN')} đ</TableCell>
                      <TableCell className="py-4 text-center">{getStatusBadge(c.status)}</TableCell>
                      {canEdit && (
                        <TableCell className="py-4 pr-6 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openView(c)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Xem">
                              <Eye className="w-4 h-4" />
                            </button>
                            {c.status === 'ACTIVE' && (
                              <button onClick={() => openUpdateStatus(c)} className="p-2 rounded-lg text-slate-400 hover:text-warning hover:bg-orange-50 transition-colors" title="Cập nhật trạng thái">
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            </div>
            
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

      {/* Create Contract Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Tạo hợp đồng mới">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Khách thuê *</label>
            <select required className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm mt-1" value={formData.tenant_id} onChange={e => setFormData({...formData, tenant_id: e.target.value})}>
              <option value="">-- Chọn khách thuê --</option>
              {tenantsList.map(t => <option key={t.id} value={t.id}>{t.full_name} ({t.identity_number})</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Phòng (Chỉ phòng Trống) *</label>
            <select required className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm mt-1" value={formData.room_id} onChange={e => setFormData({...formData, room_id: e.target.value})}>
              <option value="">-- Chọn phòng --</option>
              {roomsList.map(r => <option key={r.id} value={r.id}>Phòng {r.room_number} - {Number(r.price).toLocaleString()}đ</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Ngày bắt đầu *</label>
              <Input required type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Ngày kết thúc *</label>
              <Input required type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Giá thuê (VNĐ) *</label>
              <Input required type="number" min="1" value={formData.rent_price} onChange={e => setFormData({...formData, rent_price: e.target.value})} />
              {formData.rent_price && (
                <p className="text-sm text-green-600 mt-1 font-medium">
                  Hiển thị: {Number(formData.rent_price).toLocaleString('vi-VN')} đ
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Tiền cọc (VNĐ) *</label>
              <Input required type="number" min="0" value={formData.deposit} onChange={e => setFormData({...formData, deposit: e.target.value})} />
              {formData.deposit && (
                <p className="text-sm text-green-600 mt-1 font-medium">
                  Hiển thị: {Number(formData.deposit).toLocaleString('vi-VN')} đ
                </p>
              )}
            </div>
          </div>
          <Button type="submit" className="w-full">Tạo Hợp Đồng</Button>
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Chi tiết hợp đồng">
        {selectedContract && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
              <span className="text-sm text-slate-500 col-span-1">Mã Hợp đồng:</span>
              <span className="font-mono text-sm text-slate-900 col-span-2">{selectedContract.id}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
              <span className="text-sm text-slate-500 col-span-1">Khách thuê:</span>
              <span className="font-medium text-slate-900 col-span-2">{selectedContract.tenant_name}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
              <span className="text-sm text-slate-500 col-span-1">Phòng:</span>
              <span className="font-medium text-primary-light col-span-2">{selectedContract.room_number}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
              <span className="text-sm text-slate-500 col-span-1">Thời hạn:</span>
              <span className="font-medium text-slate-900 col-span-2">{formatDate(selectedContract.start_date)} - {formatDate(selectedContract.end_date)}</span>
            </div>
            <div className="grid grid-cols-3 pb-2">
              <span className="text-sm text-slate-500 col-span-1">Trạng thái:</span>
              <span className="col-span-2">{getStatusBadge(selectedContract.status)}</span>
            </div>
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal isOpen={isUpdateStatusOpen} onClose={() => setIsUpdateStatusOpen(false)} title="Cập nhật trạng thái">
        <div className="space-y-4 p-4 text-center">
          <p className="text-slate-600 mb-6">Bạn muốn làm gì với hợp đồng này?</p>
          <div className="flex gap-4">
            <Button variant="danger" className="flex-1" onClick={() => handleUpdateStatus('CANCELLED')}>Hủy hợp đồng</Button>
            <Button variant="outline" className="flex-1 text-orange-500 border-orange-500 hover:bg-orange-50" onClick={() => handleUpdateStatus('EXPIRED')}>Đánh dấu hết hạn</Button>
          </div>
          <p className="text-xs text-slate-500 mt-4 text-left">* Lưu ý: Phòng sẽ tự động chuyển về trạng thái TRỐNG nếu không còn hợp đồng ACTIVE nào khác.</p>
        </div>
      </Modal>

    </div>
  );
};

export default Contracts;
