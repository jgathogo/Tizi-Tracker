import React, { useRef, useState, useEffect } from 'react';
import { Download, Upload, X, Trash2, Settings, FileJson, AlertTriangle, Calendar } from 'lucide-react';
import { UserProfile, WorkoutSchedule } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onImport: (data: UserProfile) => void;
  onReset: () => void;
  onUpdate: (data: UserProfile) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, user, onImport, onReset, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<WorkoutSchedule>(
    user.schedule || { frequency: 3, preferredDays: [1, 3, 5], flexible: true }
  );

  useEffect(() => {
    if (user.schedule) {
      setSchedule(user.schedule);
    }
  }, [user.schedule]);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const toggleDay = (day: number) => {
    const newDays = schedule.preferredDays.includes(day)
      ? schedule.preferredDays.filter(d => d !== day)
      : [...schedule.preferredDays, day].sort();
    const newSchedule = { ...schedule, preferredDays: newDays };
    setSchedule(newSchedule);
    onUpdate({ ...user, schedule: newSchedule });
  };

  const updateFrequency = (freq: number) => {
    const newSchedule = { ...schedule, frequency: freq };
    setSchedule(newSchedule);
    onUpdate({ ...user, schedule: newSchedule });
  };

  const toggleFlexible = () => {
    const newSchedule = { ...schedule, flexible: !schedule.flexible };
    setSchedule(newSchedule);
    onUpdate({ ...user, schedule: newSchedule });
  };

  if (!isOpen) return null;

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    const date = new Date().toISOString().split('T')[0];
    downloadAnchorNode.setAttribute("download", `tizilog_backup_${date}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Basic validation
        if (!json.currentWeights || !json.history) {
            throw new Error("Invalid file format");
        }
        onImport(json);
        onClose();
      } catch (err) {
        setError("Failed to parse file. Please select a valid backup JSON.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[80] p-4 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-700">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-2 text-white">
             <Settings size={20} />
             <h3 className="text-lg font-bold">Data & Settings</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Export Section */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Backup</h4>
            <button 
                onClick={handleExport}
                className="w-full flex items-center justify-between p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl border border-slate-600 transition-all group"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <Download size={20} />
                    </div>
                    <div className="text-left">
                        <div className="font-bold text-white">Export Data</div>
                        <div className="text-xs text-slate-400">Download JSON backup</div>
                    </div>
                </div>
                <FileJson size={18} className="text-slate-500" />
            </button>
          </div>

          {/* Import Section */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Restore</h4>
            <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".json"
                onChange={handleFileChange}
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-between p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl border border-slate-600 transition-all group"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <Upload size={20} />
                    </div>
                    <div className="text-left">
                        <div className="font-bold text-white">Import Data</div>
                        <div className="text-xs text-slate-400">Restore from JSON file</div>
                    </div>
                </div>
                <FileJson size={18} className="text-slate-500" />
            </button>
            {error && <div className="text-red-400 text-xs px-2">{error}</div>}
          </div>

          <hr className="border-slate-700" />

          {/* Workout Schedule Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Calendar size={14} /> Workout Schedule
            </h4>
            
            {/* Frequency */}
            <div className="space-y-2">
              <label className="text-xs text-slate-300">Workouts per week</label>
              <div className="flex gap-2">
                {[2, 3, 4, 5, 6].map(freq => (
                  <button
                    key={freq}
                    onClick={() => updateFrequency(freq)}
                    className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                      schedule.frequency === freq
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {freq}x
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Days */}
            <div className="space-y-2">
              <label className="text-xs text-slate-300">Preferred workout days</label>
              <div className="grid grid-cols-7 gap-2">
                {dayNames.map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleDay(idx)}
                    className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                      schedule.preferredDays.includes(idx)
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Flexible Mode */}
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div>
                <div className="text-sm font-semibold text-white">Flexible Schedule</div>
                <div className="text-xs text-slate-400">Allow workouts on any day, not just preferred</div>
              </div>
              <button
                onClick={toggleFlexible}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  schedule.flexible ? 'bg-green-600' : 'bg-slate-600'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    schedule.flexible ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Exercise Repeat Count */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Progression Settings</h4>
            <div className="space-y-2">
              <label className="text-xs text-slate-300">Repeat each exercise at weight before progressing</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(count => (
                  <button
                    key={count}
                    onClick={() => onUpdate({ ...user, repeatCount: count })}
                    className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                      (user.repeatCount || 2) === count
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {count}x
                  </button>
                ))}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                After completing {user.repeatCount || 2} successful workouts at a weight, the app will automatically increase the weight.
              </div>
            </div>
          </div>

          <hr className="border-slate-700" />

          {/* Danger Zone */}
          <div className="space-y-2">
             <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                 <AlertTriangle size={14} /> Danger Zone
             </h4>
             <button 
                onClick={() => {
                    if(window.confirm("Are you sure? This will delete all your history and reset weights. This cannot be undone.")) {
                        onReset();
                        onClose();
                    }
                }}
                className="w-full flex items-center justify-center gap-2 p-3 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 rounded-xl transition-colors font-medium text-sm"
            >
                <Trash2 size={16} /> Reset All Data
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};
