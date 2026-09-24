import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/Dialog';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Plus, Search, Edit2, Trash2, Home } from 'lucide-react';
import toast from 'react-hot-toast';
import { getHouses, createHouse, updateHouse, deleteHouse, type House } from '../services/houseService';
import { useAuth } from '../contexts/AuthContext';

const Houses = () => {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'LANDLORD';

  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHouse, setEditingHouse] = useState<House | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [houseToDelete, setHouseToDelete] = useState<House | null>(null);

  // Form
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    floors: '',
    description: ''
  });

  const fetchHouses = async () => {
    try {
      setLoading(true);
      const data = await getHouses();
      setHouses(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách nhà trọ');
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouses();
  }, []);

  const handleOpenModal = (house?: House) => {
    if (house) {
      setEditingHouse(house);
      setFormData({
        name: house.name,
        address: house.address,
        floors: house.floors ? house.floors.toString() : '',
        description: house.description || ''
      });
    } else {
      setEditingHouse(null);
      setFormData({ name: '', address: '', floors: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        floors: formData.floors ? parseInt(formData.floors) : null
      };

      if (editingHouse) {
        await updateHouse(editingHouse.id, data);
        toast.success('Cập nhật nhà trọ thành công');
      } else {
        await createHouse(data);
        toast.success('Thêm nhà trọ thành công');
      }
      setIsModalOpen(false);
      fetchHouses();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async () => {
    if (!houseToDelete) return;
    try {
      await deleteHouse(houseToDelete.id);
      toast.success('Xóa nhà trọ thành công');
      setIsDeleteModalOpen(false);
      fetchHouses();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Có lỗi xảy ra khi xóa');
    }
  };

  const filteredHouses = houses.filter(h => 
    h.name.toLowerCase().includes(search.toLowerCase()) || 
    h.address.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchHouses} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Nhà trọ</h1>
        {canEdit && (
          <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Thêm nhà trọ
          </Button>
        )}
      </div>

      <Card className="p-4">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredHouses.length === 0 ? (
          <EmptyState
            icon={Home}
            title="Không tìm thấy nhà trọ"
            description="Chưa có dữ liệu nhà trọ nào phù hợp với tìm kiếm của bạn."
            action={canEdit ? {
              label: 'Thêm nhà trọ mới',
              onClick: () => handleOpenModal()
            } : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên nhà trọ</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Số tầng</TableHead>
                  <TableHead>Số phòng</TableHead>
                  <TableHead>Chủ trọ</TableHead>
                  {canEdit && <TableHead className="text-right">Thao tác</TableHead>}
                </TableRow>
              </TableHeader>
              <tbody>
                {filteredHouses.map((house) => (
                  <TableRow key={house.id}>
                    <TableCell className="font-medium">{house.name}</TableCell>
                    <TableCell>{house.address}</TableCell>
                    <TableCell>{house.floors || '-'}</TableCell>
                    <TableCell>{house._count?.rooms || 0}</TableCell>
                    <TableCell>{house.landlord?.full_name || house.landlord?.username || '-'}</TableCell>
                    {canEdit && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenModal(house)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setHouseToDelete(house);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingHouse ? 'Sửa thông tin nhà trọ' : 'Thêm nhà trọ mới'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Tên nhà trọ <span className="text-red-500">*</span>
            </label>
            <Input
              required
              className="h-11 text-sm font-medium shadow-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: Trọ Hoa Mai, CCMN 123..."
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Địa chỉ <span className="text-red-500">*</span>
            </label>
            <Input
              required
              className="h-11 text-sm font-medium shadow-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="VD: 123 Đường Nguyễn Văn A, Quận 1..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Số tầng
              </label>
              <Input
                type="number"
                min="1"
                className="h-11 text-sm font-medium shadow-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                value={formData.floors}
                onChange={(e) => setFormData({ ...formData, floors: e.target.value })}
                placeholder="VD: 4"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Mô tả thêm
            </label>
            <textarea
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-colors"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ghi chú thêm về bãi xe, cổng giờ giấc tự do..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              className="h-10 px-6 font-medium"
              onClick={() => setIsModalOpen(false)}
            >
              Hủy
            </Button>
            <Button type="submit" className="h-10 px-6 font-semibold bg-blue-600 hover:bg-blue-700 shadow-sm">
              {editingHouse ? 'Lưu thay đổi' : 'Thêm nhà trọ'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa nhà trọ "${houseToDelete?.name}" không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  );
};

export default Houses;
