import client from './client';
import type { NotificationPreferences } from '../types/notification.types';

export const notificationApi = {
  getPreferences: () =>
    client.get<NotificationPreferences>('/notifications').then(r => r.data),

  updatePreferences: (data: Partial<NotificationPreferences>) =>
    client.post('/notifications', data).then(r => r.data),

  generateTelegramCode: () =>
    client.post<{ code: string }>('/notifications/telegram/generate-code').then(r => r.data),

  unlinkTelegram: () =>
    client.delete('/notifications/telegram/unlink').then(r => r.data),
};
