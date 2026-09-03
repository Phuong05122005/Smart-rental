import React, { useState, useEffect } from 'react';
import { getUsers } from '../services/userService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { ConfirmDialog } from '../components/ui/Dialog';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Plus, Lock, Unlock, Trash2 } from 'lucide-react';
import { toggleUserStatus, deleteUser } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'STAFF'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      toast.success('Tạo tài khoản thành công!');
      setIsFormOpen(false);
      setFormData({ username: '', password: '', full_name: '', role: 'STAFF' });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await toggleUserStatus(id);
      toast.success(res.message);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const confirmDelete = (user: any) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      const res = await deleteUser(selectedUser.id);
      toast.success(res.message);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsDeleteOpen(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Quản trị viên</span>;
      case 'LANDLORD':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Chủ trọ</span>;
      case 'STAFF':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Nhân viên</span>;
      case 'TENANT':
        return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Khách thuê</span>;
      default:
        return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">{role}</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'ACTIVE' 
      ? <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Hoạt động</span>
      : <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Khóa</span>;
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Quản lý tài khoản</h2>
          <p className="text-sm text-slate-500 mt-1">Quản lý phân quyền và truy cập hệ thống</p>
        </div>
        <Button className="gap-2" onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4" /> Tạo tài khoản hệ thống
        </Button>
      </div>

      <Card className="shadow-sm border-slate-100 overflow-hidden rounded-xl">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-semibold text-slate-800">Danh sách tài khoản</h3>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            Đang tải dữ liệu...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full text-sm text-left">
              <TableHeader className="bg-slate-50/80 border-b border-slate-100 uppercase text-xs font-semibold text-slate-500 tracking-wider">
                <TableRow>
                  <TableHead className="py-4 pl-6">Tên đăng nhập</TableHead>
                  <TableHead className="py-4">Họ và tên</TableHead>
                  <TableHead className="py-4">Vai trò</TableHead>
                  <TableHead className="py-4 text-center">Trạng thái</TableHead>
                  <TableHead className="py-4 text-center">Ngày tạo</TableHead>
                  <TableHead className="py-4 text-right pr-6">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <TableCell className="pl-6 py-4 font-semibold text-slate-800">{user.username}</TableCell>
                    <TableCell className="py-4 text-slate-600 font-medium">{user.full_name}</TableCell>
                    <TableCell className="py-4">{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="py-4 text-center">{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="py-4 text-center text-slate-500 font-medium">
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {user.username !== 'admin' && user.id !== currentUser?.id && (
                          <>
                            <button 
                              title={user.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa'}
                              onClick={() => handleToggleStatus(user.id)} 
                              className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                            >
                              {user.status === 'ACTIVE' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </button>
                            <button 
                              title="Xóa tài khoản"
                              onClick={() => confirmDelete(user)} 
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Tạo tài khoản hệ thống mới">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Tên đăng nhập</label>
            <Input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="admin2 / staff1" />
          </div>
          <div>
            <label className="text-sm font-medium">Họ và tên</label>
            <Input required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="Nguyễn Văn B" />
          </div>
          <div>
            <label className="text-sm font-medium">Mật khẩu</label>
            <Input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Vai trò hệ thống</label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'ADMIN', title: 'Quản trị viên (ADMIN)', desc: 'Toàn quyền kiểm soát hệ thống, tài khoản.' },
                { id: 'LANDLORD', title: 'Chủ trọ (LANDLORD)', desc: 'Quản lý kinh doanh, phòng, doanh thu.' },
                { id: 'STAFF', title: 'Nhân viên (STAFF)', desc: 'Vận hành, ghi điện nước, xử lý sự cố.' }
              ].map(r => (
                <div 
                  key={r.id} 
                  onClick={() => setFormData({...formData, role: r.id})}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${formData.role === r.id ? 'border-primary bg-blue-50 ring-1 ring-primary' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.role === r.id ? 'border-primary' : 'border-slate-300'}`}>
                    {formData.role === r.id && <div className="w-2 h-2 bg-primary rounded-full" />}
                  </div>
                  <div>
                    <div className="font-medium text-sm text-slate-800">{r.title}</div>
                    <div className="text-xs text-slate-500">{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full">Tạo tài khoản</Button>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xóa tài khoản"
        message={`Bạn có chắc chắn muốn xóa tài khoản ${selectedUser?.username}? Hành động này không thể hoàn tác.`}
        isDestructive
      />
    </div>
  );
};

export default Users;
