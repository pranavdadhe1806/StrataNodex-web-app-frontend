import client from './client';
import type { Node } from '../types/node.types';

export interface DailyScore {
  date: string;
  points: number;
}

export interface ComputeScoreInput {
  date: string;
}

export const dailyApi = {
  getToday: () =>
    client.get<Node[]>('/daily/today').then(r => r.data),

  getOverdue: () =>
    client.get<Node[]>('/daily/overdue').then(r => r.data),

  computeScore: (data: ComputeScoreInput) =>
    client.post<DailyScore>('/daily/compute', data).then(r => r.data),

  getScore: (date: string) =>
    client.get<DailyScore>(`/daily/${date}`).then(r => r.data),
};
