import { useQuery } from '@tanstack/react-query';
import { scoreApi } from '../api/score.api';
import type { DailyScore, StreakData } from '../types/score.types';

const SCORES_KEY = 'scores';

export function useScores() {
  return useQuery<DailyScore[], Error>({
    queryKey: [SCORES_KEY],
    queryFn: scoreApi.getAll,
  });
}

export function useStreak() {
  return useQuery<StreakData, Error>({
    queryKey: [SCORES_KEY, 'streak'],
    queryFn: scoreApi.getStreak,
  });
}
