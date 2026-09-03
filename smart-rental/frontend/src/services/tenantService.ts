import api from './api';

export interface Tenant {
  id: string;
  full_name: string;
  identity_number: string;
  phone: string;
  email: string | null;
  current_room?: string | null;
  status?: 'RENTING' | 'INACTIVE';
  user_id?: string | null;
}

export const getTenants = async (params?: any) => {
  const response = await api.get('/tenants', { params });
  return response.data;
};

export const getTenant = async (id: string) => {
  const response = await api.get(`/tenants/${id}`);
  return response.data;
};

export const createTenant = async (data: Partial<Tenant>) => {
  const response = await api.post('/tenants', data);
  return response.data;
};

export const updateTenant = async (id: string, data: Partial<Tenant>) => {
  const response = await api.put(`/tenants/${id}`, data);
  return response.data;
};

export const deleteTenant = async (id: string) => {
  const response = await api.delete(`/tenants/${id}`);
  return response.data;
};

export const createTenantAccount = async (id: string) => {
  const response = await api.post(`/tenants/${id}/account`);
  return response.data;
};
