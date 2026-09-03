import React, { useState } from 'react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Building2, User, Lock } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    if (user?.role === 'TENANT') {
      return <Navigate to="/my-room" replace />;
    }
    if (user?.role === 'STAFF') {
      return <Navigate to="/rooms" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Vui lòng nhập tài khoản và mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      toast.success(response.data.message);
      login(response.data.token, response.data.user);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Section - Hero/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900"></div>
        {/* Decorative circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full bg-blue-400/20 blur-3xl"></div>
        
        <div className="relative z-10 text-center text-white px-12">
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
              <Building2 className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-extrabold mb-6 tracking-tight drop-shadow-md">Smart Rental</h1>
          <p className="text-blue-100 text-lg max-w-md mx-auto leading-relaxed font-medium">
            Giải pháp quản lý phòng trọ toàn diện. Đơn giản hóa công việc kinh doanh và nâng cao trải nghiệm khách thuê của bạn.
          </p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-slate-50 lg:bg-white relative">
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2 text-primary font-bold text-xl">
          <Building2 className="w-6 h-6" /> Smart Rental
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left mt-10 lg:mt-0">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Đăng nhập</h2>
            <p className="text-slate-500 mt-2 text-base">Vui lòng nhập thông tin để tiếp tục</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 mt-8">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Tên đăng nhập</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input 
                  type="text" 
                  placeholder="Nhập username..." 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="pl-10 h-12 text-base bg-white focus:bg-slate-50 transition-colors"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-700">Mật khẩu</label>
                <a href="#" onClick={(e) => e.preventDefault()} className="text-sm font-medium text-primary hover:underline hover:text-blue-700 transition-colors">Quên mật khẩu?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input 
                  type="password" 
                  placeholder="Nhập mật khẩu..." 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="pl-10 h-12 text-base bg-white focus:bg-slate-50 transition-colors"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="rounded border-slate-300 text-primary w-4 h-4 cursor-pointer focus:ring-primary" />
              <label htmlFor="remember" className="text-sm font-medium text-slate-600 cursor-pointer select-none hover:text-slate-900 transition-colors">
                Ghi nhớ đăng nhập
              </label>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng Nhập Hệ Thống'}
            </Button>
          </form>

          <div className="text-center text-sm text-slate-500 pt-8">
            &copy; {new Date().getFullYear()} Smart Rental. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
