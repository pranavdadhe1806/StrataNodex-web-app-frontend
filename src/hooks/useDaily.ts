import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dailyApi, ComputeScoreInput } from '../api/daily.api';
import type { Node } from '../types/node.types';

const DAILY_KEY = 'daily';

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
