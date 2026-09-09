import api from './api';

export interface Room {
  id: string;
  room_number: string;
  room_type: string;
  price: string | number;
  area: string | number;
  description: string | null;
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
  current_tenant?: string | null;
}

export const getRooms = async (params?: any) => {
  const response = await api.get('/rooms', { params });
  return response.data;
};

export const getRoom = async (id: string) => {
  const response = await api.get(`/rooms/${id}`);
  return response.data;
};

export const createRoom = async (data: Partial<Room>) => {
  const response = await api.post('/rooms', data);
  return response.data;
};

export const updateRoom = async (id: string, data: Partial<Room>) => {
  const response = await api.put(`/rooms/${id}`, data);
  return response.data;
};

export const deleteRoom = async (id: string) => {
  const response = await api.delete(`/rooms/${id}`);
  return response.data;
};

export const requestRentRoom = async (id: string) => {
  const response = await api.post(`/rooms/${id}/rent-request`);
  return response.data;
};
