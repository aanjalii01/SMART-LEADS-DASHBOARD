import api from './api';
import { ApiResponse, Lead, LeadFilters, LeadFormData, StatsData } from '../types';

export const leadsService = {
  getLeads: async (filters: LeadFilters) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.source) params.append('source', filters.source);
    if (filters.search) params.append('search', filters.search);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.page) params.append('page', String(filters.page));
    params.append('limit', '10');

    const { data } = await api.get<ApiResponse<Lead[]>>(`/leads?${params.toString()}`);
    return data;
  },

  getLead: async (id: string) => {
    const { data } = await api.get<ApiResponse<Lead>>(`/leads/${id}`);
    return data;
  },

  createLead: async (leadData: LeadFormData) => {
    const { data } = await api.post<ApiResponse<Lead>>('/leads', leadData);
    return data;
  },

  updateLead: async (id: string, leadData: Partial<LeadFormData>) => {
    const { data } = await api.put<ApiResponse<Lead>>(`/leads/${id}`, leadData);
    return data;
  },

  deleteLead: async (id: string) => {
    const { data } = await api.delete<ApiResponse<null>>(`/leads/${id}`);
    return data;
  },

  exportCSV: async (filters: Omit<LeadFilters, 'page'>) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.source) params.append('source', filters.source);
    if (filters.search) params.append('search', filters.search);

    const response = await api.get(`/leads/export?${params.toString()}`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  getStats: async () => {
    const { data } = await api.get<ApiResponse<StatsData>>('/leads/stats');
    return data;
  },
};
