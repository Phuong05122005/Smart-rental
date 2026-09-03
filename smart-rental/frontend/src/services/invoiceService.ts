import api from './api';

export interface Invoice {
  id: string;
  contract_id: string;
  title: string;
  amount: number | string;
  issue_date: string;
  due_date: string;
  status: 'UNPAID' | 'PAID' | 'OVERDUE';
  description?: string;
  contract?: any;
}

export const getInvoices = async (params?: any) => {
  const response = await api.get('/invoices', { params });
  return response.data;
};

export const createInvoice = async (data: Partial<Invoice>) => {
  const response = await api.post('/invoices', data);
  return response.data;
};

export const updateInvoiceStatus = async (id: string, status: string) => {
  const response = await api.put(`/invoices/${id}/status`, { status });
  return response.data;
};
