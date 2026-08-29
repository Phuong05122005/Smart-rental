import api from './api';

export interface Contract {
  id: string;
  tenant_id: string;
  room_id: string;
  start_date: string;
  end_date: string;
  rent_price: string | number;
  deposit: string | number;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  tenant_name?: string;
  room_number?: string;
}

export const getContracts = async (params?: any) => {
  const response = await api.get('/contracts', { params });
  return response.data;
};

export const getContract = async (id: string) => {
  const response = await api.get(`/contracts/${id}`);
  return response.data;
};

export const createContract = async (data: Partial<Contract>) => {
  const response = await api.post('/contracts', data);
  return response.data;
};

export const updateContract = async (id: string, data: Partial<Contract>) => {
  const response = await api.put(`/contracts/${id}`, data);
  return response.data;
};
