import api from './api';

export interface MeterReading {
  id: string;
  room_id: string;
  room?: {
    room_number: string;
    house?: { name: string };
  };
  type: string;
  month: number;
  year: number;
  old_index: number;
  new_index: number;
  consumption: number;
}

export const getMeterReadings = async (params?: { month?: number, year?: number, house_id?: string }) => {
  const response = await api.get('/meter-readings', { params });
  return response.data;
};

export const saveMeterReading = async (data: { room_id: string, type: string, month: number, year: number, old_index: number, new_index: number }) => {
  const response = await api.post('/meter-readings', data);
  return response.data;
};
