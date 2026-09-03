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
import { Plus, Search, Edit2, Trash2, Eye, Key, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { getTenants, createTenant, updateTenant, deleteTenant, createTenantAccount, type Tenant } from '../services/tenantService';
import * as XLSX from 'xlsx';
import { useAuth } from '../contexts/AuthContext';

const Tenants = () => {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'LANDLORD';

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

  const handleCreateAccount = async (tenant: Tenant) => {
    if (tenant.user_id) {
      toast.error('Khách thuê này đã có tài khoản');
      return;
    }
    const confirm = window.confirm(`Tạo tài khoản đăng nhập cho ${tenant.full_name}? Mật khẩu mặc định sẽ là 123456.`);
    if (!confirm) return;
    
    try {
      const res = await createTenantAccount(tenant.id);
      toast.success(res.message || 'Tạo tài khoản thành công');
      fetchTenants(); // refresh list
      window.alert(`Tài khoản tạo thành công!\nTên đăng nhập: ${res.data.username}\nMật khẩu: ${res.data.password}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const exportToExcel = () => {
    const data = tenants.map(t => ({
      'Họ tên': t.full_name,
      'CCCD/Passport': t.identity_number,
      'SĐT': t.phone,
      'Email': t.email || '',
      'Tài khoản': t.user_id ? 'Đã cấp' : 'Chưa cấp',
      'Phòng đang ở': t.current_room || '-',
      'Trạng thái': t.status === 'RENTING' ? 'Đang thuê' : 'Chưa thuê'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "KhachThue");
    XLSX.writeFile(wb, "DanhSachKhachThue.xlsx");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800">Quản lý khách thuê</h2>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={exportToExcel}><Download className="w-4 h-4" /> Xuất Excel</Button>
          {canEdit && (
            <Button className="gap-2" onClick={() => openForm()}><Plus className="w-4 h-4" /> Thêm khách thuê</Button>
          )}
        </div>
      </div>

      <Card className="shadow-sm border-slate-100 overflow-hidden rounded-xl">
        <div className="p-5 border-b border-slate-100 flex gap-4 items-center bg-slate-50/50">
          <form onSubmit={handleSearch} className="relative w-full sm:w-80">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              className="pl-10 h-10 border-slate-200 focus:border-blue-500 shadow-sm rounded-lg" 
              placeholder="Tìm kiếm tên, sđt, cccd..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            Đang tải dữ liệu khách thuê...
          </div>
        ) : error ? (
          <ErrorState message={error} />
        ) : tenants.length === 0 ? (
          <EmptyState title="Không tìm thấy khách thuê" description="Chưa có dữ liệu khách thuê nào hoặc không khớp với tìm kiếm." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table className="w-full text-sm text-left">
                <TableHeader className="bg-slate-50/80 border-b border-slate-100 uppercase text-xs font-semibold text-slate-500 tracking-wider">
                  <TableRow>
                    <TableHead className="py-4 pl-6">Họ tên</TableHead>
                    <TableHead className="py-4">CCCD/Passport</TableHead>
                    <TableHead className="py-4">Số điện thoại</TableHead>
                    <TableHead className="py-4">Email</TableHead>
                    <TableHead className="py-4 text-center">Phòng</TableHead>
                    <TableHead className="py-4 text-center">Tài khoản</TableHead>
                    <TableHead className="py-4 text-center">Trạng thái</TableHead>
                    <TableHead className="py-4 text-right pr-6">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <tbody className="divide-y divide-slate-100">
                  {tenants.map((tenant) => (
                    <TableRow key={tenant.id} className="hover:bg-slate-50/50 transition-colors group">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase border border-blue-200">
                            {tenant.full_name.split(' ').pop()?.charAt(0) || 'U'}
                          </div>
                          <span className="font-semibold text-slate-800">{tenant.full_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-slate-600 font-mono text-xs">{tenant.identity_number}</TableCell>
                      <TableCell className="py-4 text-slate-600">{tenant.phone}</TableCell>
                      <TableCell className="py-4 text-slate-500 text-xs">{tenant.email || '-'}</TableCell>
                      <TableCell className="py-4 text-center">
                        {tenant.current_room ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                            {tenant.current_room}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        {tenant.user_id ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Đã cấp
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                            Chưa cấp
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-center">{getStatusBadge(tenant.status)}</TableCell>
                      <TableCell className="py-4 pr-6 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {canEdit && !tenant.user_id && (
                            <button title="Cấp tài khoản" onClick={() => handleCreateAccount(tenant)} className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                              <Key className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => openView(tenant)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Xem chi tiết">
                            <Eye className="w-4 h-4" />
                          </button>
                          {canEdit && (
                            <button onClick={() => openForm(tenant)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Sửa">
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {canEdit && (
                            <button onClick={() => confirmDelete(tenant)} className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" title="Xóa">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </TableCell>
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
