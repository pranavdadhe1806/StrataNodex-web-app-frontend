import client from './client';
import type { DailyScore } from '../types/score.types';

export const scoreApi = {
  getAll: (limit = 90) =>
    client.get<DailyScore[]>(`/scores?limit=${limit}`).then(r => r.data),

  getStreak: () =>
    client.get<{ streak: number }>('/scores/streak').then(r => r.data),
};
