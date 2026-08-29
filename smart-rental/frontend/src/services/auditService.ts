import api from './api';

export interface AuditLog {
  id: string;
  actor_id: string | null;
  actor_name: string;
  action: string;
  target_type: string;
  target_id: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

export const getAuditLogs = async (params?: any) => {
  const response = await api.get('/audit-logs', { params });
  return response.data;
};
