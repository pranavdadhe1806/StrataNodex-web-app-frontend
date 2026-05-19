import client from './client';
import type { Node } from '../types/node.types';
import type { List } from '../types/list.types';

export interface DailyScore {
  date: string;
  points: number;
}

export interface ComputeScoreInput {
  date: string;
}

export interface DailyListResponse {
  list: List;
  nodes: Node[];
}

export const dailyApi = {
  getDailyList: () =>
    client.get<DailyListResponse>('/daily/list').then(r => r.data),

  addToDaily: (nodeId: string) =>
    client.post<Node>(`/daily/add/${nodeId}`).then(r => r.data),

  removeFromDaily: (nodeId: string) =>
    client.delete(`/daily/remove/${nodeId}`),

  getToday: () =>
    client.get<Node[]>('/daily/today').then(r => r.data),

  getOverdue: () =>
    client.get<Node[]>('/daily/overdue').then(r => r.data),

  computeScore: (data: ComputeScoreInput) =>
    client.post<DailyScore>('/daily/compute', data).then(r => r.data),

  getScore: (date: string) =>
    client.get<DailyScore>(`/daily/${date}`).then(r => r.data),
};
