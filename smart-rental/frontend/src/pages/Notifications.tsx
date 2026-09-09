import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Bell, Check, CheckCircle2 } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead, type Notification } from '../services/notificationService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchNotifs = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      toast.error('Lỗi tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await markAsRead(id);
    fetchNotifs();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    toast.success('Đã đánh dấu tất cả là đã đọc');
    fetchNotifs();
  };

  const handleNotificationClick = async (notif: Notification) => {
    // Mark as read if unread
    if (!notif.is_read) {
      await markAsRead(notif.id);
    }
    
    // Navigate based on role and type
    const isTenant = user?.role === 'TENANT';
    const type = notif.type || '';

    if (type === 'RENT_REQUEST' || notif.title?.includes('Yêu cầu thuê phòng')) {
      navigate('/contracts', { state: { openCreateModal: true } });
    } else if (type.startsWith('INVOICE') || type.startsWith('OVERDUE_')) {
      navigate(isTenant ? '/my-invoices' : '/invoices');
    } else if (type.startsWith('SYSTEM')) {
      navigate(isTenant ? '/my-maintenance' : '/maintenance');
    } else if (type.startsWith('CONTRACT') || type.startsWith('EXPIRING_')) {
      navigate(isTenant ? '/my-room' : '/contracts');
    } else {
      // Reload list to update read status if no navigation
      fetchNotifs();
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Đang tải...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Thông báo của bạn</h2>
          <p className="text-sm text-slate-500 mt-1">Cập nhật các hoạt động mới nhất từ hệ thống</p>
        </div>
        {notifications.some(n => !n.is_read) && (
          <Button variant="outline" className="gap-2 border-blue-500 text-blue-600 hover:bg-blue-50" onClick={handleMarkAllAsRead}>
            <CheckCircle2 className="w-4 h-4" /> Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      <Card className="shadow-sm border-slate-100 overflow-hidden rounded-xl bg-white">
        {notifications.length === 0 ? (
          <div className="text-slate-500 text-center py-16 flex flex-col items-center">
            <Bell className="w-12 h-12 text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">Bạn chưa có thông báo nào.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map(notif => (
              <div 
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-5 flex gap-4 items-start transition-colors group cursor-pointer ${
                  notif.is_read ? 'bg-white hover:bg-slate-50/50' : 'bg-blue-50/40 hover:bg-blue-50/60'
                }`}
              >
                <div className={`p-3 rounded-full shrink-0 mt-1 shadow-sm ${
                  notif.is_read 
                    ? 'bg-slate-100 text-slate-400 border border-slate-200' 
                    : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/20'
                }`}>
                  <Bell className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className={`font-semibold text-base truncate ${notif.is_read ? 'text-slate-600' : 'text-slate-800'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-xs font-medium text-slate-400 whitespace-nowrap bg-slate-100 px-2 py-1 rounded-md">
                      {new Date(notif.created_at).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  
                  <p className={`text-sm mt-1.5 leading-relaxed ${notif.is_read ? 'text-slate-500' : 'text-slate-600 font-medium'}`}>
                    {notif.content}
                  </p>
                </div>

                {!notif.is_read ? (
                  <button 
                    onClick={(e) => handleMarkAsRead(notif.id, e)} 
                    className="shrink-0 text-blue-600 hover:text-white p-2 rounded-lg hover:bg-blue-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100" 
                    title="Đánh dấu đã đọc"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="shrink-0 w-9 h-9"></div> /* Placeholder to keep alignment */
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Notifications;
