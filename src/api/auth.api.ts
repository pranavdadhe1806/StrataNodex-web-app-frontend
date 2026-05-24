import client from './client';
import type { User } from '../types/auth.types';

export const authApi = {
  me: () => client.get<User>('/auth/me').then(r => r.data),
  enable2FA: (method: 'EMAIL' | 'SMS' | 'TOTP') =>
    client.post<User>('/auth/2fa/enable', { method }).then(r => r.data),
  disable2FA: () => client.post<User>('/auth/2fa/disable').then(r => r.data),
  forgotPassword: (email: string) =>
    client.post('/auth/forgot-password', { email }).then(r => r.data),
  resetPassword: (email: string, code: string, newPassword: string) =>
    client.post('/auth/reset-password', { email, code, newPassword }).then(r => r.data),
  updateProfile: (data: { name?: string; dayStartTime?: string; dayEndTime?: string }) =>
    client.patch<User>('/auth/me', data).then(r => r.data),
};
