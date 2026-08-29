import api from './api';

export const getRevenueReport = async () => {
  const response = await api.get('/reports/revenue');
  return response.data;
};

export const getOccupancyReport = async () => {
  const response = await api.get('/reports/occupancy');
  return response.data;
};
