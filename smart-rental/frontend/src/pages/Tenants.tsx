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
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { getTenants, createTenant, updateTenant, deleteTenant, type Tenant } from '../services/tenantService';

const Tenants = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [search, setSearch] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    identity_number: '',
    phone: '',
    email: ''
  });

  const fetchTenants = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getTenants({ page, limit: 10, search });
      setTenants(res.data);
      setTotalPages(res.meta.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách khách thuê');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [page]);

  // Handle Search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTenants();
  };

  const openForm = (tenant?: Tenant) => {
    if (tenant) {
      setSelectedTenant(tenant);
      setFormData({
        full_name: tenant.full_name,
        identity_number: tenant.identity_number,
        phone: tenant.phone,
        email: tenant.email || ''
      });
    } else {
      setSelectedTenant(null);
      setFormData({ full_name: '', identity_number: '', phone: '', email: '' });
    }
    setIsFormOpen(true);
  };

  const openView = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsViewOpen(true);
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.identity_number || !formData.phone) {
      toast.error('Vui lòng nhập Họ tên, CCCD và Số điện thoại.');
      return;
    }
    
    try {
      if (selectedTenant) {
        await updateTenant(selectedTenant.id, formData);
        toast.success('Cập nhật khách thuê thành công');
      } else {
        await createTenant(formData);
        toast.success('Thêm khách thuê mới thành công');
      }
      setIsFormOpen(false);
      fetchTenants();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const confirmDelete = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedTenant) return;
    try {
      await deleteTenant(selectedTenant.id);
      toast.success('Xóa khách thuê thành công');
      fetchTenants();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const getStatusBadge = (status?: string) => {
    if (status === 'RENTING') return <Badge status="info">Đang thuê</Badge>;
    return <Badge status="default">Chưa thuê</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800">Quản lý khách thuê</h2>
        <Button className="gap-2" onClick={() => openForm()}><Plus className="w-4 h-4" /> Thêm khách thuê</Button>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 flex gap-4 items-center">
          <form onSubmit={handleSearch} className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              className="pl-9" 
              placeholder="Tìm kiếm tên, sđt, cccd..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>
        ) : error ? (
          <ErrorState message={error} />
        ) : tenants.length === 0 ? (
          <EmptyState title="Không tìm thấy khách thuê" description="Chưa có dữ liệu khách thuê nào hoặc không khớp với tìm kiếm." />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>CCCD/Passport</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phòng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium text-slate-900">{tenant.full_name}</TableCell>
                    <TableCell>{tenant.identity_number}</TableCell>
                    <TableCell>{tenant.phone}</TableCell>
                    <TableCell>{tenant.email || '-'}</TableCell>
                    <TableCell className="font-medium text-primary-light">{tenant.current_room || '-'}</TableCell>
                    <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <button onClick={() => openView(tenant)} className="text-slate-400 hover:text-primary transition-colors"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => openForm(tenant)} className="text-slate-400 hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => confirmDelete(tenant)} className="text-slate-400 hover:text-danger transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
            
            {/* Pagination Controls */}
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

      {/* Form Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedTenant ? 'Cập nhật khách thuê' : 'Thêm khách thuê mới'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Họ tên *</label>
            <Input required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="Nguyễn Văn A" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">CCCD/Passport *</label>
            <Input required value={formData.identity_number} onChange={e => setFormData({...formData, identity_number: e.target.value})} placeholder="001200334455" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Số điện thoại *</label>
            <Input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="0901234567" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="example@gmail.com" />
          </div>
          <Button type="submit" className="w-full">Lưu lại</Button>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Thông tin khách thuê">
        {selectedTenant && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
              <span className="text-sm text-slate-500 col-span-1">Họ tên:</span>
              <span className="font-medium text-slate-900 col-span-2">{selectedTenant.full_name}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
              <span className="text-sm text-slate-500 col-span-1">CCCD/Passport:</span>
              <span className="font-medium text-slate-900 col-span-2">{selectedTenant.identity_number}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
              <span className="text-sm text-slate-500 col-span-1">Số điện thoại:</span>
              <span className="font-medium text-slate-900 col-span-2">{selectedTenant.phone}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
              <span className="text-sm text-slate-500 col-span-1">Email:</span>
              <span className="font-medium text-slate-900 col-span-2">{selectedTenant.email || 'Không có'}</span>
            </div>
            <div className="grid grid-cols-3 pb-2">
              <span className="text-sm text-slate-500 col-span-1">Tình trạng:</span>
              <span className="col-span-2">{getStatusBadge(selectedTenant.status)} {selectedTenant.current_room && `- Phòng ${selectedTenant.current_room}`}</span>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xóa khách thuê"
        message={`Bạn có chắc chắn muốn xóa khách thuê ${selectedTenant?.full_name}? Hành động này không thể hoàn tác.`}
        isDestructive
      />
    </div>
  );
};

export default Tenants;
