import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, DoorOpen, Users, FileText, Bell, BarChart2, History, UserCog, Menu, LogOut, Wrench } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Sidebar = ({ isOpen, toggleSidebar }: { isOpen: boolean, toggleSidebar: () => void }) => {
  const { user, logout } = useAuth();
  const role = user?.role || 'STAFF';

  const menuItems = [
    { name: 'Phòng của tôi', path: '/my-room', icon: DoorOpen, roles: ['TENANT'] },
    { name: 'Hóa đơn của tôi', path: '/my-invoices', icon: FileText, roles: ['TENANT'] },
    { name: 'Báo cáo sự cố', path: '/my-maintenance', icon: Wrench, roles: ['TENANT'] },
    { name: 'Tổng quan', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'LANDLORD'] },
    { name: 'Quản lý phòng', path: '/rooms', icon: DoorOpen, roles: ['ADMIN', 'LANDLORD', 'STAFF'] },
    { name: 'Khách thuê', path: '/tenants', icon: Users, roles: ['ADMIN', 'LANDLORD', 'STAFF'] },
    { name: 'Hợp đồng', path: '/contracts', icon: FileText, roles: ['ADMIN', 'LANDLORD', 'STAFF'] },
    { name: 'Hóa đơn', path: '/invoices', icon: FileText, roles: ['ADMIN', 'LANDLORD', 'STAFF'] },
    { name: 'Sửa chữa', path: '/maintenance', icon: Wrench, roles: ['ADMIN', 'LANDLORD', 'STAFF'] },
    { name: 'Thông báo', path: '/notifications', icon: Bell, roles: ['ADMIN', 'LANDLORD', 'STAFF', 'TENANT'] },
    { name: 'Báo cáo', path: '/reports', icon: BarChart2, roles: ['ADMIN', 'LANDLORD'] },
    { name: 'Lịch sử hoạt động', path: '/audit-logs', icon: History, roles: ['ADMIN'] },
    { name: 'Q.Lý Tài khoản', path: '/users', icon: UserCog, roles: ['ADMIN'] },
    { name: 'Hồ sơ cá nhân', path: '/account-settings', icon: UserCog, roles: ['ADMIN', 'LANDLORD', 'STAFF', 'TENANT'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <aside className={`bg-primary text-white flex flex-col transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'} h-full shrink-0 relative shadow-xl z-20`}>
      <div className="h-16 flex items-center justify-center border-b border-white/10 shrink-0">
        {isOpen ? (
          <h1 className="text-xl font-extrabold tracking-widest drop-shadow-sm">SMART RENTAL</h1>
        ) : (
          <h1 className="text-xl font-extrabold tracking-widest">SR</h1>
        )}
      </div>

      <nav className="flex-1 py-5 overflow-y-auto custom-scrollbar">
        <ul className="space-y-1.5 px-3">
          {visibleItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-white/15 text-white shadow-sm font-semibold' 
                      : 'text-blue-100 hover:bg-white/5 hover:text-white font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-5 h-5 shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    {isOpen && <span className="ml-3 text-sm">{item.name}</span>}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/10 flex flex-col gap-2 shrink-0">
        <button onClick={logout} className="group flex items-center px-4 py-3 rounded-xl text-blue-100 hover:bg-white/10 hover:text-white transition-all duration-200 w-full justify-center lg:justify-start">
          <LogOut className="w-5 h-5 shrink-0 transition-transform group-hover:-translate-x-1" />
          {isOpen && <span className="ml-3 text-sm font-medium">Đăng xuất</span>}
        </button>
        <button onClick={toggleSidebar} className="text-blue-200 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors mx-auto lg:hidden">
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};
