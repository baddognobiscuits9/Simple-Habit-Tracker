import { Habit } from '../types';

const STORAGE_KEY = 'habitai_data_v1';

export const saveHabits = (habits: Habit[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  } catch (error) {
    console.error('Failed to save habits', error);
  }
};

export const loadHabits = (): Habit[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const parsed: Habit[] = JSON.parse(data);
    // Migration: Ensure notes object exists for older data
    return parsed.map(h => ({
      ...h,
      notes: h.notes || {}
    }));
  } catch (error) {
    console.error('Failed to load habits', error);
    return [];
  }
};

export const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};
