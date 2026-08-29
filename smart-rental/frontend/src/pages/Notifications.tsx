import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Bell, Check, CheckCircle2 } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead, type Notification } from '../services/notificationService';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    fetchNotifs();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    toast.success('Đã đánh dấu tất cả là đã đọc');
    fetchNotifs();
  };

  if (loading) return <div className="p-8 text-slate-500">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Thông báo của bạn</h2>
        {notifications.some(n => !n.is_read) && (
          <Button variant="outline" className="gap-2" onClick={handleMarkAllAsRead}>
            <CheckCircle2 className="w-4 h-4" /> Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-slate-500 text-center py-12 bg-white rounded-xl border border-slate-200">
            Không có thông báo nào.
          </div>
        ) : (
          notifications.map(notif => (
            <Card key={notif.id} className={notif.is_read ? 'bg-slate-50' : 'bg-white border-l-4 border-l-primary'}>
              <div className="p-4 flex gap-4 items-start">
                <div className={`p-2 rounded-full shrink-0 ${notif.is_read ? 'bg-slate-200 text-slate-500' : 'bg-primary-light/20 text-primary'}`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${notif.is_read ? 'text-slate-600' : 'text-slate-900'}`}>{notif.title}</h4>
                  <p className={`text-sm mt-1 ${notif.is_read ? 'text-slate-500' : 'text-slate-600'}`}>{notif.content}</p>
                  <span className="text-xs text-slate-400 mt-2 block">{new Date(notif.created_at).toLocaleString('vi-VN')}</span>
                </div>
                {!notif.is_read && (
                  <button onClick={() => handleMarkAsRead(notif.id)} className="text-primary hover:text-primary-dark p-2 rounded-full hover:bg-primary/10 transition-colors" title="Đánh dấu đã đọc">
                    <Check className="w-5 h-5" />
                  </button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
