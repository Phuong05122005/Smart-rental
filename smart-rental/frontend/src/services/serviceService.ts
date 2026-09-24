import api from './api';

export interface Service {
  id: string;
  house_id: string | null;
  name: string;
  unit: string;
  price: number;
  description: string | null;
}

export const getServices = async () => {
  const response = await api.get('/services');
  return response.data;
};

export const createService = async (data: Partial<Service>) => {
  const response = await api.post('/services', data);
  return response.data;
};

export const updateService = async (id: string, data: Partial<Service>) => {
  const response = await api.put(`/services/${id}`, data);
  return response.data;
};

export const deleteService = async (id: string) => {
  const response = await api.delete(`/services/${id}`);
  return response.data;
};
