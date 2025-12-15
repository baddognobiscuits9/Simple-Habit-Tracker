import React from 'react';
import { Check, Trash2, Zap, MessageSquare } from 'lucide-react';
import { Habit } from '../types';
import { getLocalDateKey, isDateToday } from '../services/date';

interface HabitGridProps {
  habits: Habit[];
  onToggle: (habitId: string, date: string) => void;
  onDelete: (habitId: string) => void;
  onHabitClick: (habit: Habit) => void;
}

const HabitGrid: React.FC<HabitGridProps> = ({ habits, onToggle, onDelete, onHabitClick }) => {
  // Generate last 7 days
  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - 6 + i); // Start 6 days ago
    return d;
  });

  const formatDateLabel = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-neutral-500 animate-fade-in">
        <div className="w-12 h-12 mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
          <Zap size={20} className="text-neutral-400" />
        </div>
        <p className="text-lg font-medium text-neutral-900">No habits tracked yet.</p>
        <p className="text-sm mt-1">Add your first habit to start building consistency.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto pb-6 animate-slide-up">
      <table className="w-full min-w-[600px] border-collapse">
        <thead>
          <tr>
            <th className="text-left py-4 pr-8 pl-2 font-medium text-neutral-500 text-xs uppercase tracking-wider w-1/3">Habit</th>
            {dates.map((date) => (
              <th key={date.toString()} className={`text-center py-4 font-medium text-xs uppercase tracking-wider ${isDateToday(date) ? 'text-black' : 'text-neutral-400'}`}>
                <div className="flex flex-col items-center gap-1">
                  <span>{formatDateLabel(date)}</span>
                  <span className={`text-[10px] ${isDateToday(date) ? 'bg-black text-white px-1.5 py-0.5 rounded-full' : ''}`}>
                    {date.getDate()}
                  </span>
                </div>
              </th>
            ))}
            <th className="w-10"></th>
          </tr>
        </thead>
        <tbody>
          {habits.map((habit) => (
            <tr key={habit.id} className="group border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors">
              <td className="py-4 pl-2 pr-8">
                <div className="flex flex-col items-start">
                  <button 
                    onClick={() => onHabitClick(habit)}
                    className="font-medium text-neutral-900 hover:underline hover:text-black text-left"
                  >
                    {habit.name}
                  </button>
                  {habit.description && <span className="text-xs text-neutral-500 mt-0.5">{habit.description}</span>}
                </div>
              </td>
              {dates.map((date) => {
                const dateKey = getLocalDateKey(date);
                const isCompleted = !!habit.logs[dateKey];
                const hasNote = !!habit.notes?.[dateKey];
                const noteText = habit.notes?.[dateKey];
                
                return (
                  <td key={`${habit.id}-${dateKey}`} className="text-center py-3 relative">
                    <div className="relative inline-block">
                        <button
                        onClick={() => onToggle(habit.id, dateKey)}
                        title={noteText || (isCompleted ? "Completed" : "Not completed")}
                        className={`
                            w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 relative
                            ${isCompleted 
                            ? 'bg-neutral-900 text-white shadow-sm scale-100' 
                            : 'bg-neutral-100 text-transparent hover:bg-neutral-200 hover:text-neutral-300 scale-95 hover:scale-100'}
                        `}
                        >
                        <Check size={14} strokeWidth={3} />
                        </button>
                        {hasNote && (
                            <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-white flex items-center justify-center ${isCompleted ? 'bg-neutral-500' : 'bg-amber-500'}`}>
                            </div>
                        )}
                    </div>
                  </td>
                );
              })}
              <td className="text-right py-3 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onDelete(habit.id)}
                  className="p-2 text-neutral-300 hover:text-red-500 transition-colors"
                  title="Delete Habit"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HabitGrid;