import React from 'react';
import { UserProfile, ExerciseName } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ProgressProps {
  history: UserProfile['history'];
}

export const Progress: React.FC<ProgressProps> = ({ history }) => {
  // Transform history into chart data
  // Structure: { date: '2023-01-01', Squat: 100, Bench: 80, ... }
  
  const data = history.map(h => {
    const entry: any = { date: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) };
    h.exercises.forEach(ex => {
        // Only track successful sets? Or just the weight attempted?
        // Usually progress tracks weight lifted.
        entry[ex.name] = ex.weight;
    });
    return entry;
  }).reverse(); // Recharts renders left-to-right, but our history is usually desc. So we might need to sort by date asc for chart.
  
  const sortedData = [...data].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const colors: Record<string, string> = {
    'Squat': '#3b82f6', // Blue
    'Bench Press': '#ef4444', // Red
    'Barbell Row': '#10b981', // Emerald
    'Overhead Press': '#f59e0b', // Amber
    'Deadlift': '#8b5cf6' // Violet
  };

  return (
    <div className="h-[500px] w-full p-4 bg-slate-800 rounded-2xl border border-slate-700">
      <h3 className="text-lg font-bold text-white mb-4">Strength Progression</h3>
      {sortedData.length < 2 ? (
          <div className="h-full flex items-center justify-center text-slate-500">
              Not enough data to display chart. Complete more workouts!
          </div>
      ) : (
        <ResponsiveContainer width="100%" height="90%">
            <LineChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickMargin={10} />
            <YAxis stroke="#94a3b8" fontSize={12} domain={['dataMin - 10', 'auto']} />
            <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }}
                itemStyle={{ color: '#cbd5e1' }}
            />
            <Legend />
            {(Object.keys(colors) as ExerciseName[]).map(ex => (
                <Line 
                    key={ex} 
                    type="monotone" 
                    dataKey={ex} 
                    stroke={colors[ex]} 
                    strokeWidth={2}
                    dot={{ r: 3, fill: colors[ex] }}
                    connectNulls
                />
            ))}
            </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
