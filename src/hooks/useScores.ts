import { useQuery } from '@tanstack/react-query';
import { scoreApi } from '../api/score.api';
import type { DailyScore, ScoreSummary } from '../types/score.types';

const SCORES_KEY = 'scores';

export function useScores(limit = 90) {
  return useQuery<DailyScore[], Error>({
    queryKey: [SCORES_KEY, limit],
    queryFn: () => scoreApi.getAll(limit),
  });
}

export function useStreak() {
  return useQuery<{ streak: number }, Error>({
    queryKey: [SCORES_KEY, 'streak'],
    queryFn: scoreApi.getStreak,
  });
}

export function useScoreSummary() {
  return useQuery<ScoreSummary, Error>({
    queryKey: [SCORES_KEY, 'summary'],
    queryFn: scoreApi.getSummary,
  });
}
