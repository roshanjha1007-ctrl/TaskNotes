import client from './client';
import { ApiSuccess, AuthUser } from '../types';

export const authApi = {
  getMe: async (): Promise<AuthUser> => {
    const { data } = await client.get<ApiSuccess<AuthUser>>('/auth/me');
    return data.data;
  },
};
