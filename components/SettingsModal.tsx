import React, { useRef, useState, useEffect } from 'react';
import { Download, Upload, X, Trash2, Settings, FileJson, AlertTriangle, Calendar, User, TrendingUp, Cloud, CloudOff, LogOut, LogIn, RefreshCw, CheckCircle2, Sun, Moon } from 'lucide-react';
import { UserProfile, WorkoutSchedule } from '../types';
import type { User as FirebaseUser } from 'firebase/auth';
import { isAuthAvailable } from '../services/authService';
import { isSyncAvailable, saveToCloud } from '../services/syncService';
import type { Theme } from '../App';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onImport: (data: UserProfile) => void;
  onReset: () => Promise<void>;
  onUpdate: (data: UserProfile) => void;
  firebaseUser?: FirebaseUser | null;
  syncStatus?: 'idle' | 'syncing' | 'synced' | 'error';
  lastSynced?: Date | null;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  theme,
  onThemeChange,
  onImport, 
  onReset, 
  onUpdate,
  firebaseUser,
  syncStatus = 'idle',
  lastSynced,
  onOpenAuth,
  onSignOut
}) => {
  const [manualSyncLoading, setManualSyncLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<WorkoutSchedule>(
    user.schedule || { frequency: 3, preferredDays: [1, 3, 5], flexible: true }
  );
  const [profileName, setProfileName] = useState(user.name || '');
  const [profileDateOfBirth, setProfileDateOfBirth] = useState(user.dateOfBirth || '');
  const [profileHeight, setProfileHeight] = useState(user.height?.toString() || '');
  const [profileWeight, setProfileWeight] = useState(user.bodyWeight?.toString() || '');

  useEffect(() => {
    if (user.schedule) {
      setSchedule(user.schedule);
    }
    setProfileName(user.name || '');
    setProfileDateOfBirth(user.dateOfBirth || '');
    setProfileHeight(user.height?.toString() || '');
    setProfileWeight(user.bodyWeight?.toString() || '');
  }, [user]);

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
      <div className={`rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl border overflow-hidden ${
        theme === 'dark'
          ? 'bg-slate-800 border-slate-700'
          : 'bg-white border-slate-300'
      }`}>
        <div className={`p-4 border-b flex justify-between items-center flex-shrink-0 ${
          theme === 'dark'
            ? 'border-slate-700 bg-slate-900/50'
            : 'border-slate-300 bg-slate-50'
        }`}>
          <div className={`flex items-center gap-2 ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
             <Settings size={20} />
             <h3 className="text-lg font-bold">Data & Settings</h3>
          </div>
          <button 
            onClick={onClose} 
            className={`transition-colors ${
              theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Export Section */}
          <div className="space-y-2">
            <h4 className={`text-sm font-bold uppercase tracking-wider ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}>Backup</h4>
            <button 
                onClick={handleExport}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all group ${
                  theme === 'dark'
                    ? 'bg-slate-700/50 hover:bg-slate-700 border-slate-600'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300'
                }`}
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <Download size={20} />
                    </div>
                    <div className="text-left">
                        <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          Export Data
                        </div>
                        <div className={theme === 'dark' ? 'text-xs text-slate-400' : 'text-xs text-slate-600'}>
                          Download JSON backup
                        </div>
                    </div>
                </div>
                <FileJson size={18} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
            </button>
          </div>

          {/* Import Section */}
          <div className="space-y-2">
            <h4 className={`text-sm font-bold uppercase tracking-wider ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}>Restore</h4>
            <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".json"
                onChange={handleFileChange}
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all group ${
                  theme === 'dark'
                    ? 'bg-slate-700/50 hover:bg-slate-700 border-slate-600'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300'
                }`}
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <Upload size={20} />
                    </div>
                    <div className="text-left">
                        <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          Import Data
                        </div>
                        <div className={theme === 'dark' ? 'text-xs text-slate-400' : 'text-xs text-slate-600'}>
                          Restore from JSON file
                        </div>
                    </div>
                </div>
                <FileJson size={18} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
            </button>
            {error && <div className="text-red-400 text-xs px-2">{error}</div>}
          </div>

          <hr className={theme === 'dark' ? 'border-slate-700' : 'border-slate-300'} />

          {/* Theme Toggle Section */}
          <div className="space-y-3">
            <h4 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />} Appearance
            </h4>
            
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div>
                <div className={`text-sm font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </div>
                <div className={`text-xs ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {theme === 'dark' 
                    ? 'Better for low-light environments and battery life'
                    : 'Better for bright environments and readability'}
                </div>
              </div>
              <button
                onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  theme === 'dark' ? 'bg-blue-600' : 'bg-orange-500'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    theme === 'dark' ? 'left-1' : 'right-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <hr className={theme === 'dark' ? 'border-slate-700' : 'border-slate-300'} />

          {/* Profile Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}>
                <User size={14} /> Profile
              </h4>
              {!user.name && (
                <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-1 rounded-full">
                  Name required
                </span>
              )}
            </div>
            
            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs text-slate-300">Name *</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => {
                  setProfileName(e.target.value);
                  onUpdate({ ...user, name: e.target.value });
                }}
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <label className="text-xs text-slate-300">Date of Birth</label>
              <input
                type="date"
                value={profileDateOfBirth}
                onChange={(e) => {
                  setProfileDateOfBirth(e.target.value);
                  onUpdate({ ...user, dateOfBirth: e.target.value });
                }}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Height */}
            <div className="space-y-2">
              <label className="text-xs text-slate-300">Height (cm)</label>
              <input
                type="number"
                value={profileHeight}
                onChange={(e) => {
                  const value = e.target.value;
                  setProfileHeight(value);
                  const numValue = value === '' ? undefined : parseFloat(value);
                  onUpdate({ ...user, height: numValue });
                }}
                placeholder="e.g., 175"
                min="0"
                step="0.1"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <label className="text-xs text-slate-300">Weight ({user.unit})</label>
              <input
                type="number"
                value={profileWeight}
                onChange={(e) => {
                  const value = e.target.value;
                  setProfileWeight(value);
                  const numValue = value === '' ? undefined : parseFloat(value);
                  onUpdate({ ...user, bodyWeight: numValue });
                }}
                placeholder={`e.g., 75`}
                min="0"
                step="0.1"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
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

          {/* Repeat Count Per Exercise */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Progression Settings</h4>
            <div className="text-xs text-slate-400 mb-3">
              Set how many times to repeat each exercise at a weight before progressing
            </div>
            <div className="space-y-3">
              {['Squat', 'Bench Press', 'Barbell Row', 'Overhead Press', 'Deadlift'].map(exerciseName => {
                const currentRepeatCount = user.repeatCount?.[exerciseName] ?? 2;
                return (
                  <div key={exerciseName} className="flex items-center justify-between">
                    <label className="text-sm text-slate-300 flex-1">{exerciseName}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={currentRepeatCount}
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10) || 2;
                          const newRepeatCounts = {
                            ...(user.repeatCount || {
                              'Squat': 2,
                              'Bench Press': 2,
                              'Barbell Row': 2,
                              'Overhead Press': 2,
                              'Deadlift': 2
                            }),
                            [exerciseName]: value
                          };
                          onUpdate({ ...user, repeatCount: newRepeatCounts });
                        }}
                        min="1"
                        step="1"
                        className="w-20 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <span className="text-xs text-slate-400 w-8">times</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              After completing the required number of successful workouts at a weight, the app will automatically increase the weight.
            </div>
          </div>

          {/* Weight Increments */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={14} /> Weight Increments
            </h4>
            <div className="text-xs text-slate-400 mb-3">
              Set how much weight to add when progressing each exercise
            </div>
            <div className="space-y-3">
              {['Squat', 'Bench Press', 'Barbell Row', 'Overhead Press', 'Deadlift'].map(exerciseName => {
                const defaultIncrement = exerciseName === 'Deadlift' ? 5 : 2.5;
                const currentIncrement = user.weightIncrements?.[exerciseName] ?? defaultIncrement;
                return (
                  <div key={exerciseName} className="flex items-center justify-between">
                    <label className="text-sm text-slate-300 flex-1">{exerciseName}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={currentIncrement}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || defaultIncrement;
                          const newIncrements = {
                            ...(user.weightIncrements || {
                              'Squat': 2.5,
                              'Bench Press': 2.5,
                              'Barbell Row': 2.5,
                              'Overhead Press': 2.5,
                              'Deadlift': 5
                            }),
                            [exerciseName]: value
                          };
                          onUpdate({ ...user, weightIncrements: newIncrements });
                        }}
                        min="0"
                        step="0.5"
                        className="w-20 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <span className="text-xs text-slate-400 w-8">{user.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              These increments are used when automatically progressing weights after completing required attempts.
            </div>
          </div>

          <hr className="border-slate-700" />

          {/* Cloud Sync Section */}
          {isAuthAvailable() && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Cloud size={14} /> Cloud Sync
              </h4>
              
              {firebaseUser ? (
                // Signed in
                <div className="space-y-3">
                  <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-400" />
                        <span className="text-sm font-medium text-green-300">Signed in</span>
                      </div>
                      <button
                        onClick={onSignOut}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                      >
                        <LogOut size={12} />
                        Sign out
                      </button>
                    </div>
                    <div className="text-xs text-slate-400">
                      {firebaseUser.email}
                    </div>
                  </div>

                  {/* Sync Status */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {syncStatus === 'syncing' && (
                        <>
                          <RefreshCw size={14} className="text-blue-400 animate-spin" />
                          <span className="text-slate-300">Syncing...</span>
                        </>
                      )}
                      {syncStatus === 'synced' && (
                        <>
                          <CheckCircle2 size={14} className="text-green-400" />
                          <span className="text-slate-300">Synced</span>
                        </>
                      )}
                      {syncStatus === 'error' && (
                        <>
                          <AlertTriangle size={14} className="text-red-400" />
                          <span className="text-red-300">Sync error</span>
                        </>
                      )}
                      {syncStatus === 'idle' && (
                        <>
                          <Cloud size={14} className="text-slate-400" />
                          <span className="text-slate-400">Not synced</span>
                        </>
                      )}
                    </div>
                    {lastSynced && (
                      <span className="text-xs text-slate-500">
                        {lastSynced.toLocaleTimeString()}
                      </span>
                    )}
                  </div>

                  {/* Manual Sync Button */}
                  <button
                    onClick={async () => {
                      if (!isSyncAvailable()) return;
                      setManualSyncLoading(true);
                      try {
                        await saveToCloud(user);
                        alert('✅ Data synced to cloud!');
                      } catch (error: any) {
                        alert('❌ Failed to sync: ' + (error.message || 'Unknown error'));
                      } finally {
                        setManualSyncLoading(false);
                      }
                    }}
                    disabled={manualSyncLoading || syncStatus === 'syncing' || !isSyncAvailable()}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-600/30 rounded-xl transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {manualSyncLoading ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <Cloud size={16} />
                        Sync Now
                      </>
                    )}
                  </button>

                  <div className="text-xs text-slate-500 mt-2">
                    Your data automatically syncs to the cloud when online. 
                    All data is encrypted and only you can access it.
                  </div>
                </div>
              ) : (
                // Not signed in
                <div className="space-y-3">
                  <div className="bg-slate-900/40 border border-slate-700 rounded-lg p-4 text-center">
                    <CloudOff size={24} className="text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-300 mb-3">
                      Sign in to sync your workout data across all your devices
                    </p>
                    <button
                      onClick={onOpenAuth}
                      className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium text-sm"
                    >
                      <LogIn size={16} />
                      Sign In / Sign Up
                    </button>
                  </div>
                  <div className="text-xs text-slate-500">
                    Cloud sync is optional. Your data is always saved locally and can be exported.
                  </div>
                </div>
              )}
            </div>
          )}

          <hr className="border-slate-700" />

          {/* Danger Zone */}
          <div className="space-y-2">
             <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                 <AlertTriangle size={14} /> Danger Zone
             </h4>
             <button 
                onClick={async () => {
                    await onReset();
                    onClose();
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
