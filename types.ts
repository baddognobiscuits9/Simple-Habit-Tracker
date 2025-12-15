export interface HabitLog {
  [dateIsoString: string]: boolean; // '2023-10-27': true
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  logs: HabitLog;
  notes?: { [dateIsoString: string]: string }; // New field for daily notes
  category: 'health' | 'productivity' | 'learning' | 'mindfulness' | 'other';
}

export interface DayStats {
  date: string;
  completionRate: number;
}

export enum ViewMode {
  TRACKER = 'TRACKER',
  STATS = 'STATS',
  COACH = 'COACH'
}
