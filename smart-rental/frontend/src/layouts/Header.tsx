import React from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Header = ({ toggleMobileSidebar }: { toggleMobileSidebar: () => void }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = React.useState(0);
  React.useEffect(() => {
    import('../services/notificationService').then(m => {
      m.getNotifications().then(data => setUnreadCount(data.filter((n: any) => !n.is_read).length));
    }).catch(() => {});
  }, []);
  
  const pathMap: Record<string, string> = {
    '/dashboard': 'Tổng quan',
    '/rooms': 'Quản lý phòng',
    '/tenants': 'Khách thuê',
    '/contracts': 'Hợp đồng',
    '/notifications': 'Thông báo',
    '/reports': 'Báo cáo',
    '/audit-logs': 'Lịch sử hoạt động',
    '/users': 'Tài khoản'
  };
  const title = pathMap[location.pathname] || 'Smart Rental';

  const roleNameMap: Record<string, string> = {
    'ADMIN': 'Quản trị viên',
    'LANDLORD': 'Chủ trọ',
    'STAFF': 'Nhân viên'
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shadow-sm">
      <div className="flex items-center gap-4">
        <button onClick={toggleMobileSidebar} className="lg:hidden text-slate-500 hover:text-primary">
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden sm:block text-lg font-semibold text-slate-800">
          {title}
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:bg-white w-64 transition-all"
          />
        </div>

        <button className="relative text-slate-500 hover:text-primary transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-danger rounded-full border-2 border-white text-[9px] font-bold text-white flex items-center justify-center">{unreadCount}</span>}
        </button>

        <div className="flex items-center gap-2 cursor-pointer border-l border-slate-200 pl-4 lg:pl-6">
          <div className="w-8 h-8 rounded-full bg-primary-light text-white flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-700">{user?.full_name || 'Người dùng'}</p>
            <p className="text-xs text-slate-500">{user?.role ? roleNameMap[user.role] : 'Khách'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
