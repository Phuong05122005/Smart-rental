import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, Shield } from 'lucide-react';

const AccountSettings = () => {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Mật khẩu mới không khớp!');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      toast.success('Đổi mật khẩu thành công!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const [profile, setProfile] = useState({ 
    full_name: user?.full_name || '',
    bank_name: (user as any)?.bank_name || '',
    bank_account: (user as any)?.bank_account || '',
    bank_owner: (user as any)?.bank_owner || ''
  });
  const [profileLoading, setProfileLoading] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await api.post('/auth/update-profile', profile);
      const updatedUser = res.data.data;
      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify({
          ...user,
          full_name: updatedUser.full_name,
          bank_name: updatedUser.bank_name,
          bank_account: updatedUser.bank_account,
          bank_owner: updatedUser.bank_owner
        }));
        // Note: The context won't update immediately unless we refresh or expose a `setUser` method.
        // We prompt the user to reload.
        toast.success('Cập nhật thông tin thành công! Trang sẽ tải lại để áp dụng thay đổi.', { duration: 3000 });
        setTimeout(() => window.location.reload(), 2000);
      } else {
        toast.success('Cập nhật thông tin thành công!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại.');
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Cài đặt Tài khoản</h2>
        <p className="text-sm text-slate-500 mt-1">Quản lý thông tin cá nhân và bảo mật tài khoản</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border-slate-100 rounded-xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-white p-5 flex flex-row items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                <User className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg font-semibold text-slate-800">Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tên đăng nhập / Số điện thoại</label>
                  <Input value={user?.username} disabled className="bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed font-mono h-11 text-sm shadow-inner" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Họ và tên <span className="text-red-500">*</span></label>
                  <Input 
                    required 
                    value={profile.full_name} 
                    onChange={e => setProfile({...profile, full_name: e.target.value})} 
                    className="h-11 text-sm font-medium shadow-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                {user?.role !== 'TENANT' && (
                  <div className="pt-5 border-t border-slate-100">
                    <h4 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">💳</span>
                      Thông tin nhận thanh toán (Dành cho Mã QR)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tên Ngân Hàng (VD: MB, VCB)</label>
                        <Input 
                          value={profile.bank_name} 
                          onChange={e => setProfile({...profile, bank_name: e.target.value})} 
                          className="h-11 text-sm font-bold text-slate-800 shadow-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 uppercase"
                          placeholder="MB"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Số tài khoản</label>
                        <Input 
                          value={profile.bank_account} 
                          onChange={e => setProfile({...profile, bank_account: e.target.value})} 
                          className="h-11 text-sm font-bold text-blue-700 font-mono shadow-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                          placeholder="0334812345"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tên chủ tài khoản (Không dấu)</label>
                        <Input 
                          value={profile.bank_owner} 
                          onChange={e => setProfile({...profile, bank_owner: e.target.value.toUpperCase()})} 
                          className="h-11 text-sm font-bold text-slate-800 shadow-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 uppercase"
                          placeholder="NGUYEN THAI PHUONG"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div className="pt-5 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Vai trò hệ thống</label>
                  <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg max-w-fit">
                    <Shield className="w-5 h-5 text-slate-400" />
                    <span className="font-bold text-slate-700 text-sm">{user?.role}</span>
                  </div>
                </div>
                <div className="pt-2">
                  <Button type="submit" disabled={profileLoading} className="w-full sm:w-auto h-11 px-8 font-semibold bg-blue-600 hover:bg-blue-700 shadow-sm">
                    {profileLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-100 rounded-xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-white p-5 flex flex-row items-center gap-3">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg font-semibold text-slate-800">Đổi mật khẩu</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Mật khẩu hiện tại <span className="text-red-500">*</span></label>
                  <Input 
                    type="password" 
                    required 
                    value={passwords.currentPassword}
                    onChange={e => setPasswords({...passwords, currentPassword: e.target.value})}
                    className="h-11 text-sm font-medium shadow-sm border-slate-200 focus:border-rose-500 focus:ring-rose-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Mật khẩu mới <span className="text-red-500">*</span></label>
                  <Input 
                    type="password" 
                    required 
                    minLength={6}
                    value={passwords.newPassword}
                    onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
                    className="h-11 text-sm font-medium shadow-sm border-slate-200 focus:border-rose-500 focus:ring-rose-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nhập lại mật khẩu mới <span className="text-red-500">*</span></label>
                  <Input 
                    type="password" 
                    required 
                    minLength={6}
                    value={passwords.confirmPassword}
                    onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
                    className="h-11 text-sm font-medium shadow-sm border-slate-200 focus:border-rose-500 focus:ring-rose-500/20"
                  />
                </div>
                <div className="pt-2">
                  <Button type="submit" disabled={loading} className="w-full sm:w-auto h-11 px-8 font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm border-transparent">
                    {loading ? 'Đang lưu...' : 'Đổi mật khẩu'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Cột hướng dẫn nhỏ bên cạnh */}
        <div className="hidden md:block">
          <Card className="shadow-sm border-slate-100 rounded-xl bg-blue-50/50 border-blue-100">
            <CardContent className="p-5">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Bảo mật
              </h4>
              <ul className="text-sm text-blue-700/80 space-y-2 list-disc pl-4">
                <li>Mật khẩu phải có ít nhất 6 ký tự.</li>
                <li>Không chia sẻ mật khẩu của bạn cho bất kỳ ai.</li>
                <li>Nên sử dụng chữ hoa, chữ thường và số để tăng độ bảo mật.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
