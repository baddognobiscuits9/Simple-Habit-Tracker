import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Check, MessageSquare, Calendar } from 'lucide-react';
import { Habit } from '../types';
import { getLocalDateKey } from '../services/date';

interface HabitDetailProps {
  habit: Habit;
  onUpdate: (updatedHabit: Habit) => void;
  onClose: () => void;
}

const HabitDetail: React.FC<HabitDetailProps> = ({ habit, onUpdate, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');

  // Calendar Logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const formatDateKey = (day: number) => {
    const d = new Date(year, month, day);
    return getLocalDateKey(d);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const handleJumpToToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(null);
  };

  const handleDayClick = (day: number) => {
    const dateKey = formatDateKey(day);
    setSelectedDay(dateKey);
    setNoteInput(habit.notes?.[dateKey] || '');
  };

  const toggleStatus = (dateKey: string) => {
    const newLogs = { ...habit.logs };
    if (newLogs[dateKey]) {
      delete newLogs[dateKey];
    } else {
      newLogs[dateKey] = true;
    }
    onUpdate({ ...habit, logs: newLogs });
  };

  const saveNote = () => {
    if (!selectedDay) return;
    const newNotes = { ...habit.notes };
    if (noteInput.trim()) {
      newNotes[selectedDay] = noteInput.trim();
    } else {
      delete newNotes[selectedDay];
    }
    onUpdate({ ...habit, notes: newNotes });
    setSelectedDay(null); // Close editor after save
  };

  // Stats for this month
  const daysInThisMonth = days.map(d => formatDateKey(d));
  const completedInMonth = daysInThisMonth.filter(d => habit.logs[d]).length;
  const completionRate = Math.round((completedInMonth / daysInMonth) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900">{habit.name}</h2>
            {habit.description && <p className="text-neutral-500 mt-1">{habit.description}</p>}
            <div className="flex gap-4 mt-4 text-xs font-medium uppercase tracking-wider text-neutral-500">
                <div>Monthly Rate: <span className="text-neutral-900">{completionRate}%</span></div>
                <div>Total: <span className="text-neutral-900">{completedInMonth} days</span></div>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-black transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6">
          
          {/* Month Nav */}
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-1">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-neutral-100 rounded-full transition-colors"><ChevronLeft size={20}/></button>
                <button onClick={handleNextMonth} className="p-1 hover:bg-neutral-100 rounded-full transition-colors"><ChevronRight size={20}/></button>
             </div>
             
             <span className="font-medium text-neutral-900">{monthName}</span>
             
             <button 
                onClick={handleJumpToToday}
                className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 bg-neutral-100 px-2 py-1 rounded-full transition-colors"
                title="Go to current month"
             >
                <Calendar size={12} />
                Today
             </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
              <div key={d} className="text-center text-xs text-neutral-400 font-medium py-1">{d}</div>
            ))}
            
            {/* Empty cells for offset */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Days */}
            {days.map(day => {
              const dateKey = formatDateKey(day);
              const isCompleted = !!habit.logs[dateKey];
              const hasNote = !!habit.notes?.[dateKey];
              const isSelected = selectedDay === dateKey;
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`
                    aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all
                    ${isSelected ? 'ring-2 ring-black ring-offset-2' : ''}
                    ${isCompleted 
                      ? 'bg-neutral-900 text-white' 
                      : 'bg-neutral-50 text-neutral-900 hover:bg-neutral-100'}
                  `}
                >
                  <span className={`text-xs ${isToday && !isCompleted ? 'font-bold' : ''}`}>{day}</span>
                  {hasNote && (
                    <div className={`w-1 h-1 rounded-full mt-1 ${isCompleted ? 'bg-white/50' : 'bg-amber-500'}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Day Editor (Notes) */}
          {selectedDay && (
            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-900">
                  {new Date(selectedDay).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
                <button 
                  onClick={() => toggleStatus(selectedDay)}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                    ${habit.logs[selectedDay] 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'}
                  `}
                >
                  {habit.logs[selectedDay] ? <><Check size={12}/> Completed</> : 'Mark Complete'}
                </button>
              </div>
              
              <div className="relative">
                 <textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Add a note... (e.g. 'Too tired today', 'Great session')"
                    className="w-full h-24 p-3 text-sm bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black resize-none"
                 />
                 <MessageSquare size={14} className="absolute bottom-3 right-3 text-neutral-300" />
              </div>
              
              <div className="flex justify-end mt-3 gap-2">
                 <button onClick={() => setSelectedDay(null)} className="px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-black">Cancel</button>
                 <button onClick={saveNote} className="px-4 py-1.5 bg-black text-white text-xs font-medium rounded-lg hover:bg-neutral-800">Save Note</button>
              </div>
            </div>
          )}

          {!selectedDay && (
             <div className="text-center text-sm text-neutral-400 py-4">
                Select a day to view logs or add a note.
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default HabitDetail;