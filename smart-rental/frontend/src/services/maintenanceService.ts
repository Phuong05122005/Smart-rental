import api from './api';

export interface MaintenanceRequest {
  id: string;
  tenant_id: string;
  room_id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  created_at: string;
  room?: any;
  tenant?: any;
}

export const getMaintenanceRequests = async () => {
  const response = await api.get('/maintenance');
  return response.data;
};

export const createMaintenanceRequest = async (data: Partial<MaintenanceRequest>) => {
  const response = await api.post('/maintenance', data);
  return response.data;
};

export const updateMaintenanceStatus = async (id: string, status: string) => {
  const response = await api.put(`/maintenance/${id}/status`, { status });
  return response.data;
};
