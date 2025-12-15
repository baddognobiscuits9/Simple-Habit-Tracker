import React from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Habit } from '../types';
import { getLocalDateKey } from '../services/date';

interface StatsProps {
  habits: Habit[];
}

const Stats: React.FC<StatsProps> = ({ habits }) => {
  if (habits.length === 0) return null;

  // --- 1. Daily Trend Data (Last 14 Days) ---
  const dailyData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 13 + i);
    const dateKey = getLocalDateKey(d);
    
    const completedCount = habits.filter(h => h.logs[dateKey]).length;
    const totalHabits = habits.length;
    const rate = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

    return {
      name: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      rate: rate
    };
  });

  // --- 2. Monthly Trend Data (Last 6 Months) ---
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - 5 + i);
    const year = d.getFullYear();
    const month = d.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Calculate aggregate completion rate for this specific month across ALL habits
    let totalPossible = 0;
    let totalCompleted = 0;

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(year, month, day);
        const dateKey = getLocalDateKey(dayDate);

        habits.forEach(habit => {
            totalPossible++;
            if (habit.logs[dateKey]) {
                totalCompleted++;
            }
        });
    }
    
    const rate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    return {
        name: d.toLocaleDateString('en-US', { month: 'short' }),
        rate: rate
    };
  });

  const totalCompletions = habits.reduce((acc, h) => {
    return acc + Object.values(h.logs).filter(v => v).length;
  }, 0);

  const averageRate = Math.round(dailyData.reduce((acc, d) => acc + d.rate, 0) / dailyData.length);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="p-6 border border-neutral-100 rounded-xl bg-neutral-50">
             <p className="text-neutral-500 text-xs uppercase tracking-wider font-medium mb-1">Total Completions</p>
             <p className="text-3xl font-semibold text-neutral-900">{totalCompletions}</p>
         </div>
         <div className="p-6 border border-neutral-100 rounded-xl bg-neutral-50">
             <p className="text-neutral-500 text-xs uppercase tracking-wider font-medium mb-1">Avg. Consistency (14d)</p>
             <p className="text-3xl font-semibold text-neutral-900">{averageRate}%</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend Area Chart */}
        <div className="h-[300px] w-full border border-neutral-100 rounded-xl p-6 bg-white shadow-sm">
            <h3 className="text-sm font-medium text-neutral-900 mb-6">Daily Consistency (14d)</h3>
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#171717" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#171717" stopOpacity={0}/>
                </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#a3a3a3' }} 
                    dy={10}
                    interval={2}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#a3a3a3' }}
                    domain={[0, 100]}
                />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: '#171717', 
                        border: 'none', 
                        borderRadius: '4px', 
                        color: '#fff',
                        fontSize: '12px'
                    }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{ stroke: '#e5e5e5' }}
                />
                <Area 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#171717" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRate)" 
                    animationDuration={1000}
                />
            </AreaChart>
            </ResponsiveContainer>
        </div>

        {/* Monthly Trend Bar Chart */}
        <div className="h-[300px] w-full border border-neutral-100 rounded-xl p-6 bg-white shadow-sm">
            <h3 className="text-sm font-medium text-neutral-900 mb-6">Monthly Performance (6m)</h3>
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#a3a3a3' }} 
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#a3a3a3' }}
                    domain={[0, 100]}
                />
                <Tooltip 
                    cursor={{fill: '#f9f9f9'}}
                    contentStyle={{ 
                        backgroundColor: '#171717', 
                        border: 'none', 
                        borderRadius: '4px', 
                        color: '#fff',
                        fontSize: '12px'
                    }}
                    itemStyle={{ color: '#fff' }}
                />
                <Bar 
                    dataKey="rate" 
                    fill="#171717" 
                    radius={[4, 4, 0, 0]}
                    barSize={32}
                    animationDuration={1000}
                />
            </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Stats;