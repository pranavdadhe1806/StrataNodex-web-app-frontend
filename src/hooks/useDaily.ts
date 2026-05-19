import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dailyApi, ComputeScoreInput, DailyListResponse } from '../api/daily.api';
import type { Node } from '../types/node.types';

const DAILY_KEY = 'daily';

export function useDailyList() {
  return useQuery<DailyListResponse, Error>({
    queryKey: [DAILY_KEY, 'list'],
    queryFn: dailyApi.getDailyList,
  });
}

export function useAddToDaily() {
  const queryClient = useQueryClient();
  return useMutation<Node, Error, string>({
    mutationFn: dailyApi.addToDaily,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DAILY_KEY, 'list'] });
    },
  });
}

export function useRemoveFromDaily() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (nodeId) => dailyApi.removeFromDaily(nodeId).then(() => {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DAILY_KEY, 'list'] });
    },
  });
}

export function useTodayNodes() {
  return useQuery<Node[], Error>({
    queryKey: [DAILY_KEY, 'today'],
    queryFn: dailyApi.getToday,
  });
}

export function useOverdueNodes() {
  return useQuery<Node[], Error>({
    queryKey: [DAILY_KEY, 'overdue'],
    queryFn: dailyApi.getOverdue,
  });
}

export function useDailyScore(date: string) {
  return useQuery<{ date: string; points: number }, Error>({
    queryKey: [DAILY_KEY, 'score', date],
    queryFn: () => dailyApi.getScore(date),
    enabled: !!date,
  });
}

export function useComputeScore() {
  const queryClient = useQueryClient();

  return useMutation<{ date: string; points: number }, Error, ComputeScoreInput>({
    mutationFn: dailyApi.computeScore,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [DAILY_KEY, 'score', variables.date] });
    },
  });
}
