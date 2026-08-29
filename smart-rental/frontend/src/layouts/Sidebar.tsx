import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, DoorOpen, Users, FileText, Bell, BarChart2, History, UserCog, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Sidebar = ({ isOpen, toggleSidebar }: { isOpen: boolean, toggleSidebar: () => void }) => {
  const { user, logout } = useAuth();
  const role = user?.role || 'STAFF';

  const menuItems = [
    { name: 'Tổng quan', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'LANDLORD'] },
    { name: 'Quản lý phòng', path: '/rooms', icon: DoorOpen, roles: ['ADMIN', 'LANDLORD', 'STAFF'] },
    { name: 'Khách thuê', path: '/tenants', icon: Users, roles: ['ADMIN', 'LANDLORD', 'STAFF'] },
    { name: 'Hợp đồng', path: '/contracts', icon: FileText, roles: ['ADMIN', 'LANDLORD', 'STAFF'] },
    { name: 'Thông báo', path: '/notifications', icon: Bell, roles: ['ADMIN', 'LANDLORD', 'STAFF'] },
    { name: 'Báo cáo', path: '/reports', icon: BarChart2, roles: ['ADMIN', 'LANDLORD'] },
    { name: 'Lịch sử hoạt động', path: '/audit-logs', icon: History, roles: ['ADMIN'] },
    { name: 'Tài khoản', path: '/users', icon: UserCog, roles: ['ADMIN'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <aside className={`bg-primary text-white flex flex-col transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'} h-full shrink-0 relative`}>
      <div className="h-16 flex items-center justify-center border-b border-blue-800 shrink-0">
        {isOpen ? (
          <h1 className="text-xl font-bold tracking-wider">SMART RENTAL</h1>
        ) : (
          <h1 className="text-xl font-bold">SR</h1>
        )}
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {visibleItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-3 rounded-lg transition-colors ${
                    isActive ? 'bg-primary-light text-white' : 'text-blue-100 hover:bg-blue-800'
                  }`
                }
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {isOpen && <span className="ml-3 text-sm font-medium">{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-blue-800 flex flex-col gap-2 shrink-0">
        <button onClick={logout} className="flex items-center px-3 py-3 rounded-lg text-blue-100 hover:bg-danger hover:text-white transition-colors w-full justify-center lg:justify-start">
          <LogOut className="w-5 h-5 shrink-0" />
          {isOpen && <span className="ml-3 text-sm font-medium">Đăng xuất</span>}
        </button>
        <button onClick={toggleSidebar} className="text-blue-200 hover:text-white p-2 rounded-lg hover:bg-blue-800 transition-colors mx-auto lg:hidden">
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};
