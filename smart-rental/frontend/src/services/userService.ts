import api from './api';

export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const toggleUserStatus = async (id: string) => {
  const response = await api.patch(`/users/${id}/toggle-status`);
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};
