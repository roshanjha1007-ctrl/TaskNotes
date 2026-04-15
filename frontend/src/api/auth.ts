import client from './client';
import { ApiSuccess, AuthUser, RoshanSession } from '../types';

export const authApi = {
  getMe: async (): Promise<AuthUser> => {
    const { data } = await client.get<ApiSuccess<AuthUser>>('/auth/me');
    return data.data;
  },

  verifyRoshanCode: async (code: string, password: string): Promise<RoshanSession> => {
    const { data } = await client.post<ApiSuccess<RoshanSession>>('/api/verify-roshan', {
      code,
      password,
    });
    return data.data;
  },

  validateRoshanSession: async (token: string): Promise<RoshanSession> => {
    const { data } = await client.get<ApiSuccess<RoshanSession>>('/api/verify-roshan', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data.data;
  },
};
