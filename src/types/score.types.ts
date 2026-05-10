export interface DailyScore {
  id: string;
  date: string;
  points: number;
  totalNodes: number;
  doneNodes: number;
  listId: string | null;
  userId: string;
}

export interface StreakData {
  account: number;
  lists: Record<string, number>;
  folders: Record<string, number>;
}

export interface ScoreBreakdown {
  listId: string;
  listName: string;
  done: number;
  total: number;
  points: number;
}
