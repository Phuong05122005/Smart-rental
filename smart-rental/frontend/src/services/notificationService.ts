import api from './api';

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const markAsRead = async (id: string) => {
  const response = await api.patch(`/notifications/${id}/read`);
  window.dispatchEvent(new Event('notificationsUpdated'));
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await api.patch('/notifications/read-all');
  window.dispatchEvent(new Event('notificationsUpdated'));
  return response.data;
};
