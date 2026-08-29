import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Plus, Search, Eye, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

import { getContracts, createContract, updateContract, type Contract } from '../services/contractService';
import { getRooms, type Room } from '../services/roomService';
import { getTenants, type Tenant } from '../services/tenantService';

const Contracts = () => {
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

  const loadFormDependencies = async () => {
    try {
      // Get all tenants and AVAILABLE rooms
      const [rRes, tRes] = await Promise.all([
        getRooms({ limit: 100, status: 'AVAILABLE' }),
        getTenants({ limit: 100 })
      ]);
      setRoomsList(rRes.data);
      setTenantsList(tRes.data);
    } catch (err) {
      toast.error('Không tải được danh sách phòng/khách thuê');
    }
  };

  const openForm = () => {
    setFormData({ tenant_id: '', room_id: '', start_date: '', end_date: '', rent_price: '', deposit: '0' });
    loadFormDependencies();
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
        <Button className="gap-2" onClick={openForm}><Plus className="w-4 h-4" /> Tạo hợp đồng mới</Button>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center">
          <form onSubmit={handleSearch} className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9" placeholder="Mã HĐ, Tên KH, Số phòng..." value={search} onChange={e => setSearch(e.target.value)} />
          </form>
          <select 
            className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-light w-full sm:w-auto"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hiệu lực</option>
            <option value="EXPIRED">Hết hạn</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>
        ) : error ? (
          <ErrorState message={error} />
        ) : contracts.length === 0 ? (
          <EmptyState title="Không tìm thấy hợp đồng" description="Chưa có dữ liệu hợp đồng nào." />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã HĐ</TableHead>
                  <TableHead>Khách thuê</TableHead>
                  <TableHead>Phòng</TableHead>
                  <TableHead>Thời hạn</TableHead>
                  <TableHead>Giá thuê</TableHead>
                  <TableHead>Tiền cọc</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {contracts.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs text-slate-500">{c.id.substring(0, 8).toUpperCase()}</TableCell>
                    <TableCell className="font-medium text-slate-900">{c.tenant_name}</TableCell>
                    <TableCell className="font-bold text-primary-light">{c.room_number}</TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(c.start_date)} -</div>
                      <div className="text-sm font-medium">{formatDate(c.end_date)}</div>
                    </TableCell>
                    <TableCell>{Number(c.rent_price).toLocaleString('vi-VN')}đ</TableCell>
                    <TableCell>{Number(c.deposit).toLocaleString('vi-VN')}đ</TableCell>
                    <TableCell>{getStatusBadge(c.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <button onClick={() => openView(c)} className="text-slate-400 hover:text-primary transition-colors"><Eye className="w-4 h-4" /></button>
                        {c.status === 'ACTIVE' && (
                          <button onClick={() => openUpdateStatus(c)} className="text-slate-400 hover:text-warning transition-colors"><RefreshCw className="w-4 h-4" /></button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
            
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm text-slate-500">Trang {page} / {totalPages}</span>
                <div className="flex gap-2">
                  <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Trước</Button>
                  <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Sau</Button>
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
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Tiền cọc (VNĐ) *</label>
              <Input required type="number" min="0" value={formData.deposit} onChange={e => setFormData({...formData, deposit: e.target.value})} />
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
