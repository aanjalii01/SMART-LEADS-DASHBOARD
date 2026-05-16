import api from './api';
import { ApiResponse, User } from '../types';

interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  register: async (name: string, email: string, password: string, role?: string) => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', {
      name, email, password, role,
    });
    return data;
  },

  login: async (email: string, password: string) => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
    return data;
  },

  getMe: async () => {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data;
  },
};
