import React, { useState, useEffect } from 'react';
import { Plus, BarChart2, Activity, Sparkles, X, Settings } from 'lucide-react';
import { Habit, ViewMode } from './types';
import * as storage from './services/storage';
import HabitGrid from './components/HabitGrid';
import Stats from './components/Stats';
import AICoach from './components/AICoach';
import HabitDetail from './components/HabitDetail';
import SettingsModal from './components/SettingsModal';

function App() {
  // Use lazy initialization to load habits immediately from storage.
  // This ensures we don't start with an empty array and overwrite existing data.
  const [habits, setHabits] = useState<Habit[]>(() => {
    return storage.loadHabits();
  });

  const [view, setView] = useState<ViewMode>(ViewMode.TRACKER);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  
  // Add Habit Form State
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDesc, setNewHabitDesc] = useState('');

  // Save changes to LocalStorage whenever the habits state changes
  useEffect(() => {
    storage.saveHabits(habits);
  }, [habits]);

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const newHabit: Habit = {
      id: storage.generateId(),
      name: newHabitName,
      description: newHabitDesc,
      createdAt: new Date().toISOString(),
      category: 'productivity', // Default, could expand form to include this
      logs: {},
      notes: {}
    };

    setHabits([...habits, newHabit]);
    setNewHabitName('');
    setNewHabitDesc('');
    setShowAddModal(false);
  };

  const toggleHabit = (id: string, date: string) => {
    setHabits(habits.map(h => {
      if (h.id !== id) return h;
      const newLogs = { ...h.logs };
      if (newLogs[date]) {
        delete newLogs[date];
      } else {
        newLogs[date] = true;
      }
      return { ...h, logs: newLogs };
    }));
  };

  const deleteHabit = (id: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
        setHabits(habits.filter(h => h.id !== id));
    }
  };

  const updateHabit = (updatedHabit: Habit) => {
    setHabits(habits.map(h => h.id === updatedHabit.id ? updatedHabit : h));
    // If the currently selected habit is updated, update the modal view too
    if (selectedHabit && selectedHabit.id === updatedHabit.id) {
        setSelectedHabit(updatedHabit);
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-black rounded-sm"></div>
            <span className="font-semibold tracking-tight text-lg">Habit Tracker</span>
          </div>
          
          <div className="flex items-center gap-1 bg-neutral-100/50 p-1 rounded-full border border-neutral-200/50">
            <button 
              onClick={() => setView(ViewMode.TRACKER)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${view === ViewMode.TRACKER ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
            >
              Tracker
            </button>
            <button 
              onClick={() => setView(ViewMode.STATS)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${view === ViewMode.STATS ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
            >
              Stats
            </button>
            <button 
              onClick={() => setView(ViewMode.COACH)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${view === ViewMode.COACH ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
            >
              <Sparkles size={14} className={view === ViewMode.COACH ? 'text-amber-500' : ''}/>
              Coach
            </button>
          </div>

          <div className="w-20 flex justify-end gap-2">
            <button 
                onClick={() => setShowSettingsModal(true)}
                className="text-neutral-500 hover:bg-neutral-100 hover:text-black transition-colors p-2 rounded-full"
                aria-label="Settings & Export"
            >
                <Settings size={18} />
            </button>
            <button 
                onClick={() => setShowAddModal(true)}
                className="bg-black text-white hover:bg-neutral-800 transition-colors p-2 rounded-full"
                aria-label="Add Habit"
            >
                <Plus size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        <header className="mb-10 animate-fade-in">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            {view === ViewMode.TRACKER && "Today's Focus"}
            {view === ViewMode.STATS && "Performance Overview"}
            {view === ViewMode.COACH && "AI Insights"}
          </h1>
          <p className="text-neutral-500">
             {view === ViewMode.TRACKER && "Track your consistency and build momentum."}
             {view === ViewMode.STATS && "Visualize your progress over time."}
             {view === ViewMode.COACH && "Get personalized feedback from your Gemini assistant."}
          </p>
        </header>

        {view === ViewMode.TRACKER && (
          <HabitGrid 
            habits={habits} 
            onToggle={toggleHabit} 
            onDelete={deleteHabit} 
            onHabitClick={setSelectedHabit}
          />
        )}

        {view === ViewMode.STATS && (
          <Stats habits={habits} />
        )}

        {view === ViewMode.COACH && (
          <AICoach habits={habits} />
        )}
      </main>

      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-100 p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">New Habit</h2>
                <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-black transition-colors">
                    <X size={20} />
                </button>
            </div>
            
            <form onSubmit={addHabit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Name</label>
                    <input 
                        type="text" 
                        value={newHabitName}
                        onChange={(e) => setNewHabitName(e.target.value)}
                        placeholder="e.g. Read 30 mins"
                        className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                        autoFocus
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Description (Optional)</label>
                    <input 
                        type="text" 
                        value={newHabitDesc}
                        onChange={(e) => setNewHabitDesc(e.target.value)}
                        placeholder="e.g. Before bed, no phone"
                        className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                    />
                </div>
                <div className="pt-2 flex justify-end gap-3">
                    <button 
                        type="button" 
                        onClick={() => setShowAddModal(false)}
                        className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-black transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={!newHabitName.trim()}
                        className="px-6 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        Create Habit
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal 
            habits={habits}
            onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* Habit Detail Modal (Monthly View + Notes) */}
      {selectedHabit && (
        <HabitDetail 
            habit={selectedHabit} 
            onClose={() => setSelectedHabit(null)} 
            onUpdate={updateHabit}
        />
      )}
    </div>
  );
}

export default App;