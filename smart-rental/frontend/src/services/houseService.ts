import api from './api';

export interface House {
  id: string;
  name: string;
  address: string;
  floors: number | null;
  description: string | null;
  image_url: string | null;
  landlord_id: string;
  landlord?: {
    id: string;
    full_name: string;
    username: string;
  };
  _count?: {
    rooms: number;
  };
  created_at: string;
}

export const getHouses = async () => {
  const response = await api.get('/houses');
  return response.data;
};

export const getHouseById = async (id: string) => {
  const response = await api.get(`/houses/${id}`);
  return response.data;
};

export const createHouse = async (data: Partial<House>) => {
  const response = await api.post('/houses', data);
  return response.data;
};

export const updateHouse = async (id: string, data: Partial<House>) => {
  const response = await api.put(`/houses/${id}`, data);
  return response.data;
};

export const deleteHouse = async (id: string) => {
  const response = await api.delete(`/houses/${id}`);
  return response.data;
};
