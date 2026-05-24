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

export interface ListStat {
  id: string;
  name: string;
  totalTasks: number;
  doneTasks: number;
  inProgressTasks: number;
  completionPct: number;
}

export interface FolderStat {
  id: string;
  name: string;
  totalTasks: number;
  doneTasks: number;
  completionPct: number;
  lists: ListStat[];
}

export type ScoreSummary = FolderStat[];
