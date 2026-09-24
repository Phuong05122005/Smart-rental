import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/Dialog';
import { EmptyState } from '../components/ui/EmptyState';
import { Plus, Edit2, Trash2, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { getServices, createService, updateService, deleteService, type Service } from '../services/serviceService';
import { getHouses, type House } from '../services/houseService';
import { useAuth } from '../contexts/AuthContext';

const Services = () => {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'LANDLORD';

  const [services, setServices] = useState<Service[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    price: '',
    house_id: '',
    description: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [servicesData, housesData] = await Promise.all([
        getServices(),
        getHouses()
      ]);
      setServices(servicesData);
      setHouses(housesData);
    } catch (err) {
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        unit: service.unit,
        price: service.price.toString(),
        house_id: service.house_id || '',
        description: service.description || ''
      });
    } else {
      setEditingService(null);
      setFormData({ name: '', unit: '', price: '', house_id: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        unit: formData.unit,
        price: Number(formData.price),
        house_id: formData.house_id || null,
        description: formData.description
      };

      if (editingService) {
        await updateService(editingService.id, data);
        toast.success('Cập nhật thành công');
      } else {
        await createService(data);
        toast.success('Thêm dịch vụ thành công');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async () => {
    if (!serviceToDelete) return;
    try {
      await deleteService(serviceToDelete.id);
      toast.success('Xóa thành công');
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Không thể xóa dịch vụ này');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Dịch vụ</h1>
        {canEdit && (
          <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Thêm dịch vụ
          </Button>
        )}
      </div>

      <Card className="p-4">
        {services.length === 0 && !loading ? (
          <EmptyState
            icon={Zap}
            title="Chưa có dịch vụ nào"
            description="Tạo các dịch vụ như Điện, Nước, Internet... để áp dụng cho phòng."
            action={canEdit ? { label: 'Thêm ngay', onClick: () => handleOpenModal() } : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên dịch vụ</TableHead>
                  <TableHead>Đơn vị</TableHead>
                  <TableHead>Đơn giá</TableHead>
                  <TableHead>Áp dụng cho</TableHead>
                  {canEdit && <TableHead className="text-right">Thao tác</TableHead>}
                </TableRow>
              </TableHeader>
              <tbody>
                {services.map((service) => {
                  const houseName = houses.find(h => h.id === service.house_id)?.name || 'Tất cả nhà trọ';
                  return (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell>{service.unit}</TableCell>
                      <TableCell>{Number(service.price).toLocaleString()} ₫</TableCell>
                      <TableCell>{houseName}</TableCell>
                      {canEdit && (
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleOpenModal(service)} className="mr-2">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => { setServiceToDelete(service); setIsDeleteModalOpen(true); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingService ? 'Sửa dịch vụ' : 'Thêm dịch vụ mới'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tên dịch vụ <span className="text-red-500">*</span></label>
            <Input required className="h-11 text-sm font-medium shadow-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="VD: Điện sinh hoạt, Nước máy, Rác..." />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Đơn vị tính <span className="text-red-500">*</span></label>
              <Input required className="h-11 text-sm font-medium shadow-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="VD: kWh, m3, Tháng..." />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Đơn giá (VNĐ) <span className="text-red-500">*</span></label>
              <Input required type="number" min="0" className="h-11 text-sm font-bold shadow-sm text-blue-700 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              {formData.price && (
                <p className="text-[11px] text-slate-500 mt-1.5 font-medium flex items-center gap-1">
                  Mức giá: <span className="text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-200">{Number(formData.price).toLocaleString('vi-VN')} ₫ / {formData.unit || 'đơn vị'}</span>
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Áp dụng cho nhà trọ</label>
            <select 
              className="w-full px-4 h-11 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm cursor-pointer transition-colors"
              value={formData.house_id} 
              onChange={e => setFormData({...formData, house_id: e.target.value})}
            >
              <option value="">🌎 Áp dụng cho TẤT CẢ nhà trọ</option>
              {houses.map(h => <option key={h.id} value={h.id}>🏠 {h.name}</option>)}
            </select>
            <p className="text-xs text-slate-500 mt-2 font-medium">Nếu không chọn, dịch vụ này sẽ tự động khả dụng ở mọi nhà trọ.</p>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" className="h-10 px-6 font-medium" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit" className="h-10 px-6 font-semibold bg-blue-600 hover:bg-blue-700 shadow-sm">Lưu thông tin</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDelete} title="Xóa dịch vụ" message="Bạn có chắc muốn xóa dịch vụ này không?" confirmText="Xóa" type="danger" />
    </div>
  );
};

export default Services;
