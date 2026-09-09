import React, { useRef } from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Header = ({ toggleMobileSidebar }: { toggleMobileSidebar: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const fetchNotifications = () => {
      import('../services/notificationService').then(m => {
        m.getNotifications().then(data => {
          setNotifications(data.slice(0, 5));
          setUnreadCount(data.filter((n: any) => !n.is_read).length);
        });
      }).catch(() => {});
    };

    fetchNotifications();

    window.addEventListener('notificationsUpdated', fetchNotifications);
    return () => window.removeEventListener('notificationsUpdated', fetchNotifications);
  }, []);
  
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif: any) => {
    setIsNotificationOpen(false);
    
    // Đánh dấu đã đọc ngầm
    if (!notif.is_read) {
      import('../services/notificationService').then(m => {
        m.markAsRead(notif.id).then(() => {
          window.dispatchEvent(new Event('notificationsUpdated'));
        });
      });
    }

    const isTenant = user?.role === 'TENANT';
    const type = notif.type || '';

    if (type === 'RENT_REQUEST' || notif.title?.includes('Yêu cầu thuê phòng')) {
      navigate(`/contracts?action=create&autoFill=${encodeURIComponent(notif.content || '')}`);
    } else if (type.startsWith('INVOICE') || type.startsWith('OVERDUE_')) {
      navigate(isTenant ? '/my-invoices' : '/invoices');
    } else if (type.startsWith('SYSTEM')) {
      navigate(isTenant ? '/my-maintenance' : '/maintenance');
    } else if (type.startsWith('CONTRACT') || type.startsWith('EXPIRING_')) {
      navigate(isTenant ? '/my-room' : '/contracts');
    } else {
      navigate('/notifications');
    }
  };

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

        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className="relative text-slate-500 hover:text-primary transition-colors flex items-center justify-center">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-danger rounded-full border-2 border-white text-[9px] font-bold text-white flex items-center justify-center">{unreadCount}</span>}
          </button>
          
          {isNotificationOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                <span className="font-semibold text-slate-800">Thông báo</span>
                <span className="text-xs text-primary cursor-pointer hover:underline" onClick={() => { setIsNotificationOpen(false); navigate('/notifications'); }}>Xem tất cả</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer ${!notif.is_read ? 'bg-blue-50/10' : ''}`}
                  >
                    <p className={`text-sm ${!notif.is_read ? 'font-semibold' : 'font-medium'} text-slate-800`}>{notif.title}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notif.content}</p>
                  </div>
                )) : (
                  <div className="p-4 text-center text-sm text-slate-500">Không có thông báo nào</div>
                )}
              </div>
            </div>
          )}
        </div>

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
