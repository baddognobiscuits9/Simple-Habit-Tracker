import { Habit } from '../types';
import { getLocalDateKey } from './date';

// Helper to generate a range of dates (newest to oldest)
const getDateRange = (startDate: Date, endDate: Date): string[] => {
    const dates: string[] = [];
    const current = new Date(startDate);
    // Normalize to midnight to avoid infinite loops
    current.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    while (current <= end) {
        dates.push(getLocalDateKey(new Date(current)));
        current.setDate(current.getDate() + 1);
    }
    return dates.reverse(); // Return newest first
};

export const generateMarkdown = (habits: Habit[], startDate: Date, endDate: Date): string => {
  // Ensure we cover the full day for end date
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const dateKeys = getDateRange(start, end);
  const todayStr = getLocalDateKey(new Date());

  let md = `# Habit Tracker Summary (Generated ${todayStr})\n`;
  md += `Range: ${getLocalDateKey(start)} to ${getLocalDateKey(end)}\n\n`;

  if (habits.length === 0) {
    return md + "No habits found.";
  }

  habits.forEach(habit => {
    md += `## ${habit.name}\n`;
    if (habit.description) md += `> ${habit.description}\n`;
    md += `\n**Checklist:**\n`;
    
    dateKeys.forEach(date => {
        const isDone = habit.logs[date];
        const note = habit.notes?.[date];
        
        md += `- [${isDone ? 'x' : ' '}] ${date}`;
        if (note) md += ` — *${note}*`;
        md += `\n`;
    });
    md += `\n---\n`;
  });
  return md;
};

export const generateCSV = (habits: Habit[], startDate: Date, endDate: Date): string => {
  let csv = 'Date,Habit Name,Status,Note\n';
  
  // Ensure we cover the full day for end date
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const dateKeys = getDateRange(start, end);

  habits.forEach(habit => {
      dateKeys.forEach(date => {
          const status = habit.logs[date] ? 'Completed' : 'Missed';
          const note = habit.notes?.[date] || '';
          // Escape quotes in CSV
          const safeName = `"${habit.name.replace(/"/g, '""')}"`;
          const safeNote = `"${note.replace(/"/g, '""')}"`;
          
          csv += `${date},${safeName},${status},${safeNote}\n`;
      });
  });
  
  return csv;
};

export const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};