import client from './client';
import type { DailyScore, StreakData } from '../types/score.types';

export const scoreApi = {
  getAll: () =>
    client.get<DailyScore[]>('/score').then(r => r.data),

  getStreak: () =>
    client.get<StreakData>('/score/streak').then(r => r.data),
};
