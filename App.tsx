import React, { useState, useEffect } from 'react';
import { UserProfile, ExerciseSession, WorkoutSessionData, FormGuideData, WorkoutType, WorkoutSchedule } from './types';
import { getExerciseFormGuide } from './services/geminiService';
import { ExerciseCard } from './components/ExerciseCard';
import { RestTimer } from './components/RestTimer';
import { History } from './components/History';
import { Progress } from './components/Progress';
import { WarmupCalculator } from './components/WarmupCalculator';
import { WeightAdjustmentModal } from './components/WeightAdjustmentModal';
import { SettingsModal } from './components/SettingsModal';
import { AddExerciseModal } from './components/AddExerciseModal';
import { WorkoutCompleteModal } from './components/WorkoutCompleteModal';
import { Logo } from './components/Logo';
import { LayoutDashboard, History as HistoryIcon, LineChart, Plus, Check, Play, ExternalLink, Loader2, Settings, Dumbbell, Activity, PlusCircle, Calendar, Download, AlertCircle } from 'lucide-react';
import { getWeightPerSide } from './utils/plateCalculator';
import { exportUserData, getLastBackupDate, shouldShowBackupReminder, getDaysSinceLastBackup } from './utils/backup';
import { AuthModal } from './components/AuthModal';
import { onAuthStateChange, getCurrentUser, signOut, isAuthAvailable } from './services/authService';
import { saveToCloud, loadFromCloud, mergeData, isSyncAvailable } from './services/syncService';
import type { User as FirebaseUser } from 'firebase/auth';

// --- CONFIGURATION ---
// Change this variable to rename the app throughout the UI.
const APP_NAME = "Tizi Tracker";

const INITIAL_STATE: UserProfile = {
  currentWeights: {
    'Squat': 20,
    'Bench Press': 20,
    'Barbell Row': 30,
    'Overhead Press': 20,
    'Deadlift': 40
  },
  nextWorkout: 'A',
  history: [],
  unit: 'kg',
  schedule: {
    frequency: 3,
    preferredDays: [1, 3, 5], // Monday, Wednesday, Friday
    flexible: true
  },
  exerciseAttempts: {}, // Track attempt number per exercise at current weight
  repeatCount: {
    'Squat': 2,
    'Bench Press': 2,
    'Barbell Row': 2,
    'Overhead Press': 2,
    'Deadlift': 2
  }, // Repeat count per exercise before progressing
  weightIncrements: {
    'Squat': 2.5,
    'Bench Press': 2.5,
    'Barbell Row': 2.5,
    'Overhead Press': 2.5,
    'Deadlift': 5
  }
};

const PROGRAMS = {
  'A': ['Squat', 'Bench Press', 'Barbell Row'],
  'B': ['Squat', 'Overhead Press', 'Deadlift']
};

export default function App() {
  const [user, setUser] = useState<UserProfile>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<'workout' | 'history' | 'progress'>('workout');
  const [activeSession, setActiveSession] = useState<WorkoutSessionData | null>(null);
  const [restTimerStart, setRestTimerStart] = useState(false);
  
  // Modals
  const [warmupModal, setWarmupModal] = useState<{name: string, weight: number} | null>(null);
  const [guideModal, setGuideModal] = useState<{name: string, data: FormGuideData | null, loading: boolean} | null>(null);
  const [weightModal, setWeightModal] = useState<{index: number, name: string, weight: number} | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addExerciseModalOpen, setAddExerciseModalOpen] = useState(false);
  const [completedWorkout, setCompletedWorkout] = useState<{workout: WorkoutSessionData, nextWorkout: 'A' | 'B'} | null>(null);
  
  // Cloud Sync / Authentication state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  useEffect(() => {
    // Try new key first, fallback to old key for migration
    const saved = localStorage.getItem('tizi_tracker_data') || localStorage.getItem('powerlifts_data');
    if (saved) {
      try {
        const loaded = JSON.parse(saved);
        // Migrate global repeatCount to per-exercise format if needed
        if (loaded.repeatCount && typeof loaded.repeatCount === 'number') {
          const globalValue = loaded.repeatCount;
          loaded.repeatCount = {
            'Squat': globalValue,
            'Bench Press': globalValue,
            'Barbell Row': globalValue,
            'Overhead Press': globalValue,
            'Deadlift': globalValue
          };
          console.log('🔄 Tizi Tracker: Migrated global repeatCount to per-exercise format', loaded.repeatCount);
        }
        setUser(loaded);
        // Migrate to new key if using old key
        if (localStorage.getItem('powerlifts_data') && !localStorage.getItem('tizi_tracker_data')) {
          localStorage.setItem('tizi_tracker_data', saved);
          localStorage.removeItem('powerlifts_data');
        }
        console.log('✅ Tizi Tracker: Data loaded successfully', {
          historyCount: loaded.history?.length || 0,
          nextWorkout: loaded.nextWorkout,
          exercises: Object.keys(loaded.currentWeights || {})
        });
        // Prompt for name if missing (new users only)
        if (!loaded.name && (!loaded.history || loaded.history.length === 0)) {
          setTimeout(() => {
            const name = window.prompt("Welcome to Tizi Tracker! What's your name?");
            if (name && name.trim()) {
              setUser({ ...loaded, name: name.trim() });
            }
          }, 500);
        }
      } catch (e) {
        console.error("❌ Tizi Tracker: Failed to load data", e);
      }
    } else {
      console.log('ℹ️ Tizi Tracker: Starting fresh - no saved data');
      // Brand new user - prompt for name
      setTimeout(() => {
        const name = window.prompt("Welcome to Tizi Tracker! What's your name?");
        if (name && name.trim()) {
          setUser({ ...INITIAL_STATE, name: name.trim() });
        }
      }, 500);
    }
  }, []);

  // Auth state listener - watch for sign in/out
  useEffect(() => {
    if (!isAuthAvailable()) return;

    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // User signed in - load data from cloud and merge with local
        console.log('✅ User signed in:', firebaseUser.email);
        try {
          setSyncStatus('syncing');
          
          // Get current local data
          const localSaved = localStorage.getItem('tizi_tracker_data');
          const localData = localSaved ? JSON.parse(localSaved) : user;
          
          const cloudData = await loadFromCloud();
          
          if (cloudData) {
            // Merge cloud data with local data
            const merged = mergeData(localData, cloudData);
            setUser(merged);
            // Save merged data locally
            localStorage.setItem('tizi_tracker_data', JSON.stringify(merged));
            console.log('✅ Cloud data merged with local data');
          } else {
            // No cloud data yet - offer to sync local data to cloud
            if (localData.history && localData.history.length > 0) {
              const shouldSync = window.confirm(
                'Would you like to sync your existing workout data to the cloud?\n\n' +
                'This will make your data available on all devices.'
              );
              if (shouldSync) {
                await saveToCloud(localData);
                setSyncStatus('synced');
                setLastSynced(new Date());
              }
            }
          }
          setSyncStatus('synced');
          setLastSynced(new Date());
        } catch (error) {
          console.error('❌ Failed to sync on sign-in:', error);
          setSyncStatus('error');
        }
      } else {
        // User signed out
        console.log('ℹ️ User signed out');
        setSyncStatus('idle');
        setLastSynced(null);
      }
    });

    return () => unsubscribe();
  }, []); // Only run once on mount

  // Sync to cloud when user data changes (if signed in)
  useEffect(() => {
    if (!isSyncAvailable() || !firebaseUser) return;

    // Debounce sync - only sync after a short delay to avoid too many requests
    const syncTimeout = setTimeout(async () => {
      try {
        setSyncStatus('syncing');
        await saveToCloud(user);
        setSyncStatus('synced');
        setLastSynced(new Date());
        console.log('✅ Data synced to cloud');
      } catch (error) {
        console.error('❌ Failed to sync to cloud:', error);
        setSyncStatus('error');
      }
    }, 2000); // Wait 2 seconds after last change before syncing

    return () => clearTimeout(syncTimeout);
  }, [user, firebaseUser]); // Sync whenever user data or auth state changes

  // Save to localStorage (always, regardless of cloud sync)
  useEffect(() => {
    try {
      localStorage.setItem('tizi_tracker_data', JSON.stringify(user));
      console.log('💾 Tizi Tracker: Data saved', {
        historyCount: user.history.length,
        nextWorkout: user.nextWorkout
      });
    } catch (e) {
      console.error("❌ Tizi Tracker: Failed to save data", e);
    }
  }, [user]);

  const startWorkout = (type: WorkoutType) => {
    let exercises: ExerciseSession[] = [];
    let customName = "";

    if (type === 'A' || type === 'B') {
        exercises = PROGRAMS[type].map(name => {
          const currentWeight = user.currentWeights[name] || 0;
          const attempt = user.exerciseAttempts?.[name] || 1;
          return {
            name,
            weight: currentWeight,
            sets: name === 'Deadlift' ? [null] : [null, null, null, null, null],
            attempt
          };
        });
        console.log(`🏋️ Tizi Tracker: Started Workout ${type}`, {
          exercises: exercises.map(e => `${e.name} @ ${e.weight}${user.unit}`)
        });
    } else {
        // Custom generic log
        customName = window.prompt("Enter activity name (e.g. Skipping, Running):") || "General Activity";
        exercises = [{
            name: customName,
            weight: 0,
            sets: [null],
            isCustom: true
        }];
        console.log(`🏃 Tizi Tracker: Started Custom Activity: ${customName}`);
    }

    const newSession: WorkoutSessionData = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type,
      customName,
      exercises,
      notes: '',
      completed: false,
      startTime: Date.now()
    };
    setActiveSession(newSession);
  };

  const addExerciseToActive = (name: string) => {
    if (!activeSession) return;
    const newEx: ExerciseSession = {
        name,
        weight: 0,
        sets: [null, null, null]
    };
    setActiveSession({
        ...activeSession,
        exercises: [...activeSession.exercises, newEx]
    });
  };

  const updateSet = (exerciseIndex: number, setIndex: number, reps: number) => {
    if (!activeSession) return;
    const updatedExercises = [...activeSession.exercises];
    updatedExercises[exerciseIndex].sets[setIndex] = reps;
    
    if (reps > 0) {
        setRestTimerStart(true);
        setTimeout(() => setRestTimerStart(false), 100);
    }

    setActiveSession({ ...activeSession, exercises: updatedExercises });
  };

  const updateExerciseWeight = (newWeight: number) => {
      if (!activeSession || !weightModal) return;
      const updatedExercises = [...activeSession.exercises];
      const exercise = updatedExercises[weightModal.index];
      const oldWeight = exercise.weight;
      updatedExercises[weightModal.index].weight = newWeight;
      
      // If weight changed, reset attempt counter to 1
      if (newWeight !== oldWeight) {
        updatedExercises[weightModal.index].attempt = 1;
        // Also update user's exerciseAttempts if this is a standard exercise
        if (activeSession.type === 'A' || activeSession.type === 'B') {
          setUser(prev => ({
            ...prev,
            exerciseAttempts: {
              ...(prev.exerciseAttempts || {}),
              [exercise.name]: 1
            }
          }));
        }
      }
      
      setActiveSession({ ...activeSession, exercises: updatedExercises });
      setWeightModal(null);
  };

  const updateExerciseAttempt = (exerciseIndex: number, attempt: number) => {
      if (!activeSession) return;
      const updatedExercises = [...activeSession.exercises];
      updatedExercises[exerciseIndex].attempt = attempt;
      setActiveSession({ ...activeSession, exercises: updatedExercises });
      
      // Also update user's exerciseAttempts if this is a standard exercise
      if (activeSession.type === 'A' || activeSession.type === 'B') {
        const exercise = updatedExercises[exerciseIndex];
        setUser(prev => ({
          ...prev,
          exerciseAttempts: {
            ...(prev.exerciseAttempts || {}),
            [exercise.name]: attempt
          }
        }));
      }
  };

  const finishWorkout = () => {
    if (!activeSession) return;

    const newWeights = { ...user.currentWeights };
    const newAttempts = { ...(user.exerciseAttempts || {}) };
    const completedExercises = activeSession.exercises;

    // Only progress if it was a standard 5x5 workout
    if (activeSession.type === 'A' || activeSession.type === 'B') {
        completedExercises.forEach(ex => {
            const currentWeight = ex.weight;
            const currentAttempt = ex.attempt || 1;
            const allSetsDone = ex.sets.every(r => r === 5);
            // Get per-exercise repeat count, fallback to 2 if not set
            const repeatCount = user.repeatCount?.[ex.name] ?? 2;
            
            if (allSetsDone) {
                // Check if we've completed the required number of attempts
                if (currentAttempt >= repeatCount) {
                    // Progress to next weight and reset attempt counter
                    // Use user-defined increment, fallback to defaults (2.5kg for most, 5kg for Deadlift)
                    const defaultIncrement = ex.name === 'Deadlift' ? 5 : 2.5;
                    const increment = user.weightIncrements?.[ex.name] ?? defaultIncrement;
                    const nextWeight = currentWeight + increment;
                    newWeights[ex.name] = nextWeight;
                    newAttempts[ex.name] = 1; // Reset to 1st attempt at new weight
                    console.log(`📈 Tizi Tracker: ${ex.name} progressed to ${nextWeight}${user.unit} (attempt 1)`);
                } else {
                    // Same weight, increment attempt counter
                    newWeights[ex.name] = currentWeight;
                    newAttempts[ex.name] = currentAttempt + 1;
                    console.log(`🔄 Tizi Tracker: ${ex.name} at ${currentWeight}${user.unit} (attempt ${currentAttempt + 1}/${repeatCount})`);
                }
            } else {
                // Sets not all completed, keep same weight and attempt
                newWeights[ex.name] = currentWeight;
                newAttempts[ex.name] = currentAttempt;
            }
        });
    }

    const completedSession = {
        ...activeSession,
        endTime: Date.now(),
        completed: true
    };

    const nextWorkout = activeSession.type === 'A' ? 'B' : activeSession.type === 'B' ? 'A' : user.nextWorkout;

    console.log('✅ Tizi Tracker: Workout completed', {
      type: activeSession.type,
      exercises: completedExercises.length,
      nextWorkout,
      duration: completedSession.endTime && activeSession.startTime 
        ? Math.round((completedSession.endTime - activeSession.startTime) / 1000 / 60) + ' minutes'
        : 'N/A'
    });

    // Save the workout to history
    setUser(prev => ({
        ...prev,
        currentWeights: newWeights,
        exerciseAttempts: newAttempts,
        history: [completedSession, ...prev.history],
        nextWorkout
    }));

    // Show completion modal
    setCompletedWorkout({ workout: completedSession, nextWorkout });
    
    // Auto-backup after workout completion (silent, no prompt)
    setTimeout(() => {
      const updatedUser = {
        ...user,
        currentWeights: newWeights,
        exerciseAttempts: newAttempts,
        history: [completedSession, ...user.history],
        nextWorkout
      };
      exportUserData(updatedUser);
      console.log('💾 Tizi Tracker: Auto-backup created after workout completion');
    }, 1000);
    
    // Clear active session
    setActiveSession(null);
  };

  const cancelWorkout = () => {
      if (window.confirm("Are you sure? This session won't be saved.")) {
          setActiveSession(null);
      }
  };

  const deleteWorkout = (workoutId: string) => {
      if (window.confirm("Are you sure you want to delete this workout? This cannot be undone.")) {
          setUser(prev => ({
              ...prev,
              history: prev.history.filter(w => w.id !== workoutId)
          }));
          console.log('🗑️ Tizi Tracker: Workout deleted', workoutId);
      }
  };

  const fetchGuide = async (name: string) => {
      setGuideModal({ name, data: null, loading: true });
      const data = await getExerciseFormGuide(name);
      setGuideModal({ name, data, loading: false });
  };

  /**
   * Gets a relative date label for a workout date.
   * 
   * Args:
   *   workoutDate: The workout date as a Date object or ISO string.
   * 
   * Returns:
   *   string: "TODAY", "YESTERDAY", or formatted date like "Mon, 29 Dec".
   */
  const getRelativeDateLabel = (workoutDate: Date | string): string => {
    const workout = new Date(workoutDate);
    const today = new Date();
    
    // Reset time to midnight for accurate date comparison
    workout.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - workout.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "TODAY";
    } else if (diffDays === 1) {
      return "YESTERDAY";
    } else {
      // Format as "Mon, 29 Dec" or similar
      return workout.toLocaleDateString('en-US', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  /**
   * Calculates the next workout date based on workout schedule and last workout.
   * 
   * Considers:
   * - Last workout date from history
   * - Schedule frequency (workouts per week)
   * - Preferred days
   * - Minimum rest days between workouts
   * 
   * Args:
   *   schedule: Optional workout schedule settings.
   *   lastWorkoutDate: Optional date of the last completed workout.
   * 
   * Returns:
   *   Date: The next workout date in local timezone.
   */
  const getNextWorkoutDate = (schedule?: WorkoutSchedule, lastWorkoutDate?: Date): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight
    const todayDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // If no schedule, default to tomorrow
    if (!schedule) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }

    // Calculate minimum days between workouts based on frequency
    // e.g., 3x/week = ~2.3 days between, so minimum 1 day rest
    // e.g., 2x/week = ~3.5 days between, so minimum 2 days rest
    const minDaysBetween = schedule.frequency >= 3 ? 1 : schedule.frequency === 2 ? 2 : 3;

    // If we have a last workout date, check if enough time has passed
    if (lastWorkoutDate) {
      const lastDate = new Date(lastWorkoutDate);
      lastDate.setHours(0, 0, 0, 0);
      const daysSinceLast = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // If not enough time has passed, we need to look ahead
      if (daysSinceLast < minDaysBetween) {
        // Need to wait at least minDaysBetween days
        const daysToWait = minDaysBetween - daysSinceLast;
        const earliestDate = new Date(today);
        earliestDate.setDate(today.getDate() + daysToWait);
        const earliestDay = earliestDate.getDay();
        
        // Check if the earliest possible date is a preferred day
        if (schedule.preferredDays.length === 0 || schedule.preferredDays.includes(earliestDay)) {
          return earliestDate;
        }
        
        // Otherwise, find the next preferred day after the minimum wait period
        if (schedule.flexible) {
          for (let i = daysToWait; i <= 14; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() + i);
            const checkDay = checkDate.getDay();
            
            if (schedule.preferredDays.length === 0 || schedule.preferredDays.includes(checkDay)) {
              return checkDate;
            }
          }
        } else {
          // Strict mode: find next preferred day after minimum wait
          const sortedPreferred = [...schedule.preferredDays].sort((a, b) => {
            const aAdj = a <= earliestDay ? a + 7 : a;
            const bAdj = b <= earliestDay ? b + 7 : b;
            return aAdj - bAdj;
          });
          
          const nextDay = sortedPreferred[0] || schedule.preferredDays[0] || 1;
          let daysUntilNext = nextDay <= earliestDay ? (nextDay + 7) - earliestDay : nextDay - earliestDay;
          daysUntilNext = Math.max(daysUntilNext, daysToWait); // Ensure minimum wait
          
          const nextDate = new Date(today);
          nextDate.setDate(today.getDate() + daysUntilNext);
          return nextDate;
        }
      }
    }

    // If enough time has passed (or no last workout), check if today is valid
    if (schedule.preferredDays.length === 0 || schedule.preferredDays.includes(todayDay)) {
      // Check if a workout was already done today
      if (lastWorkoutDate) {
        const lastDate = new Date(lastWorkoutDate);
        lastDate.setHours(0, 0, 0, 0);
        const daysSinceLast = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceLast === 0) {
          // Workout was done today, so next is tomorrow or later
          // Fall through to find next preferred day
        } else {
          // Enough time has passed, today is valid
          return today;
        }
      } else {
        // No previous workout, today is valid if it's a preferred day
        return today;
      }
    }

    // Find next preferred day
    if (schedule.flexible) {
      for (let i = 1; i <= 14; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);
        const checkDay = checkDate.getDay();
        
        if (schedule.preferredDays.length === 0 || schedule.preferredDays.includes(checkDay)) {
          return checkDate;
        }
      }
    } else {
      // Strict mode: only use preferred days
      const sortedPreferred = [...schedule.preferredDays].sort((a, b) => {
        const aAdj = a <= todayDay ? a + 7 : a;
        const bAdj = b <= todayDay ? b + 7 : b;
        return aAdj - bAdj;
      });
      
      const nextDay = sortedPreferred[0] || schedule.preferredDays[0] || 1;
      const daysUntilNext = nextDay <= todayDay ? (nextDay + 7) - todayDay : nextDay - todayDay;
      
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + daysUntilNext);
      return nextDate;
    }

    // Fallback to tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  const renderDashboard = () => {
    // Get most recent completed workout
    const recentWorkout = user.history
      .filter(w => w.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    // Get exercises for next workout
    const nextExercises = PROGRAMS[user.nextWorkout] || [];
    const nextWorkoutPreview = nextExercises.map(name => ({
      name,
      weight: user.currentWeights[name] || 0
    }));

    return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-4 pt-8">
       <header className="mb-8 flex justify-between items-start">
           <div className="flex items-center gap-3">
               <Logo size={48} className="flex-shrink-0" />
               <div>
                   <h1 className="text-3xl font-bold text-white mb-2">{APP_NAME}</h1>
                   <p className="text-slate-400">Log your progress, whatever the activity.</p>
               </div>
           </div>
           <div className="flex gap-2">
               <button 
                 onClick={() => {
                   if (exportUserData(user)) {
                     alert('✅ Backup saved! Check your Downloads folder.');
                   } else {
                     alert('❌ Failed to save backup. Please try again.');
                   }
                 }}
                 className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-xl border border-green-500 transition-colors flex items-center gap-2"
                 title="Save Backup to Device"
               >
                   <Download size={18} />
               </button>
               <button 
                 onClick={() => setSettingsOpen(true)}
                 className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition-colors"
               >
                   <Settings size={20} />
               </button>
           </div>
       </header>

       {/* Backup Reminder */}
       {shouldShowBackupReminder() && (
         <div className="bg-amber-900/30 border border-amber-600/50 rounded-2xl p-4 mb-4 flex items-start gap-3">
           <AlertCircle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
           <div className="flex-1">
             <div className="text-sm font-semibold text-amber-300 mb-1">
               Backup Recommended
             </div>
             <div className="text-xs text-amber-400/80 mb-2">
               {getLastBackupDate() 
                 ? `Last backup: ${getLastBackupDate()!.toLocaleDateString()} (${getDaysSinceLastBackup()} days ago)`
                 : 'You haven\'t created a backup yet. Save your data to your device now!'}
             </div>
             <button
               onClick={() => {
                 if (exportUserData(user)) {
                   alert('✅ Backup saved! Check your Downloads folder.');
                 } else {
                   alert('❌ Failed to save backup. Please try again.');
                 }
               }}
               className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5"
             >
               <Download size={14} />
               Save Backup Now
             </button>
           </div>
         </div>
       )}

       {/* Recent Workout Card */}
       {recentWorkout && (
         <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 mb-4">
           <div className="flex items-center gap-2 mb-3">
             <HistoryIcon size={16} className="text-slate-400" />
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
               {getRelativeDateLabel(recentWorkout.date)}
             </h3>
           </div>
           <div className="flex items-center justify-between mb-2">
             <span className="text-lg font-bold text-white">
               {recentWorkout.customName || `Workout ${recentWorkout.type}`}
             </span>
             <span className="text-xs text-slate-400">
               {new Date(recentWorkout.date).toLocaleDateString()}
             </span>
           </div>
           <div className="flex flex-wrap gap-2 mt-3">
             {recentWorkout.exercises.slice(0, 3).map((ex, idx) => (
               <span key={idx} className="text-sm text-slate-300 bg-slate-700/50 px-3 py-1 rounded-lg">
                 {ex.name} {ex.weight}{user.unit}
               </span>
             ))}
             {recentWorkout.exercises.length > 3 && (
               <span className="text-sm text-slate-500">+{recentWorkout.exercises.length - 3} more</span>
             )}
           </div>
         </div>
       )}

       {/* Quick Start Card */}
       <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-2xl border border-blue-500/30 relative overflow-hidden group mb-4">
           <div className="relative z-10">
               <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-4 backdrop-blur-sm">
                   NEXT 5X5 SESSION
               </div>
               <h2 className="text-3xl font-bold mb-2">Workout {user.nextWorkout}</h2>
               {(() => {
                 // Get last workout date
                 const lastWorkout = user.history
                   .filter(w => w.completed)
                   .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                 const lastWorkoutDate = lastWorkout ? new Date(lastWorkout.date) : undefined;
                 
                 const nextDate = getNextWorkoutDate(user.schedule, lastWorkoutDate);
                 const today = new Date();
                 today.setHours(0, 0, 0, 0);
                 const nextDateMidnight = new Date(nextDate);
                 nextDateMidnight.setHours(0, 0, 0, 0);
                 const daysDiff = Math.round((nextDateMidnight.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                 const isToday = daysDiff === 0;
                 const isTomorrow = daysDiff === 1;
                 return (
                   <div className="flex items-center gap-2 mb-4 text-blue-100">
                     <Calendar size={16} />
                     <span className="text-sm font-medium">
                       {isToday
                         ? 'Scheduled for today'
                         : isTomorrow 
                         ? 'Scheduled for tomorrow'
                         : `Scheduled for ${nextDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}`
                       }
                     </span>
                   </div>
                 );
               })()}
               <div className="mb-4 space-y-1.5">
                 {nextWorkoutPreview.map((ex, idx) => {
                   const weightPerSide = getWeightPerSide(ex.weight, user.unit);
                   return (
                     <div key={idx} className="text-blue-100 text-sm">
                       <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                         <span>{ex.name} - {ex.weight}{user.unit}</span>
                       </div>
                       {weightPerSide > 0 && (
                         <div className="text-blue-200/70 text-xs ml-5 mt-0.5">
                           {weightPerSide.toFixed(weightPerSide % 1 === 0 ? 0 : 1)}{user.unit} / side
                         </div>
                       )}
                     </div>
                   );
                 })}
               </div>
               <button 
                onClick={() => startWorkout(user.nextWorkout)}
                className="bg-white text-blue-900 px-6 py-3 rounded-xl font-bold text-md flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-lg"
               >
                   <Dumbbell size={18} /> Start 5x5
               </button>
           </div>
       </div>

       {/* Activity Hub */}
       <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 px-1">Other Activities</h3>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <button 
             onClick={() => startWorkout('Custom')}
             className="flex items-center gap-4 p-5 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 transition-all text-left group"
           >
                <div className="p-3 bg-orange-500/20 text-orange-400 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-all">
                    <Activity size={24} />
                </div>
                <div>
                    <div className="font-bold text-white">Custom Activity</div>
                    <div className="text-xs text-slate-500">Log skipping, cardio, etc.</div>
                </div>
           </button>
           
           <div className="p-5 bg-slate-800/40 rounded-2xl border border-slate-700/50 flex flex-col justify-center">
                <div className="text-slate-500 text-xs mb-1">Total History</div>
                <div className="text-2xl font-bold text-white flex items-center gap-2">
                    {user.history.length} <span className="text-sm font-normal text-slate-500">entries</span>
                </div>
           </div>
       </div>
    </div>
    );
  };

  const renderActiveSession = () => {
      if (!activeSession) return null;
      return (
        <div className="max-w-2xl mx-auto p-4 pb-32">
             <div className="flex justify-between items-center mb-6">
                 <div>
                     <h2 className="text-2xl font-bold text-white">
                         {activeSession.customName ? activeSession.customName : `Workout ${activeSession.type}`}
                     </h2>
                     <div className="text-slate-400 text-sm">{new Date(activeSession.startTime).toLocaleTimeString()}</div>
                 </div>
                 <button 
                    onClick={cancelWorkout} 
                    className="text-red-400 hover:text-red-300 text-sm font-bold px-4 py-2 bg-red-900/20 hover:bg-red-900/40 rounded-xl border border-red-900/30 transition-all"
                  >
                    Cancel
                  </button>
             </div>

             <div className="space-y-4">
                {activeSession.exercises.map((ex, exIdx) => (
                    <ExerciseCard 
                        key={exIdx} 
                        exercise={ex} 
                        unit={user.unit}
                        exerciseIndex={exIdx}
                        onSetUpdate={(setIdx, reps) => updateSet(exIdx, setIdx, reps)}
                        onOpenGuide={fetchGuide}
                        onOpenWarmup={(name, weight) => setWarmupModal({name, weight})}
                        onEditWeight={(name, weight) => setWeightModal({index: exIdx, name, weight})}
                        onEditAttempt={updateExerciseAttempt}
                    />
                ))}
                
                <button 
                    onClick={() => setAddExerciseModalOpen(true)}
                    className="w-full py-4 border-2 border-dashed border-slate-700 rounded-2xl text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-all flex items-center justify-center gap-2"
                >
                    <PlusCircle size={20} /> Add Exercise
                </button>
             </div>

            <div className="mt-8">
                <label className="block text-slate-400 text-sm mb-2 font-medium">Session Notes</label>
                <textarea 
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    rows={3}
                    placeholder="How did it feel?"
                    value={activeSession.notes}
                    onChange={(e) => setActiveSession({...activeSession, notes: e.target.value})}
                />
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/90 backdrop-blur border-t border-slate-800 flex justify-center z-40">
                <button 
                    onClick={finishWorkout}
                    className="w-full max-w-md bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                    <Check size={24} /> Finish & Log
                </button>
            </div>
        </div>
      );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-blue-500/30">
      
      {!activeSession && (
          <div className="fixed bottom-0 w-full bg-slate-800/80 backdrop-blur-md border-t border-slate-700 z-50">
              <div className="flex justify-around max-w-md mx-auto">
                  <button 
                    onClick={() => setActiveTab('workout')}
                    className={`flex-1 py-4 flex flex-col items-center gap-1 ${activeTab === 'workout' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                      <LayoutDashboard size={20} />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Dash</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-4 flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                      <HistoryIcon size={20} />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">History</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('progress')}
                    className={`flex-1 py-4 flex flex-col items-center gap-1 ${activeTab === 'progress' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                      <LineChart size={20} />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Trends</span>
                  </button>
              </div>
          </div>
      )}

      <main className={!activeSession ? "pb-24" : ""}>
          {activeSession ? renderActiveSession() : (
              <>
                {activeTab === 'workout' && renderDashboard()}
                {activeTab === 'history' && (
                    <div className="max-w-2xl mx-auto p-4 pt-8">
                        <header className="mb-6 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">Activity Log</h2>
                            <button onClick={() => setSettingsOpen(true)} className="p-2 text-slate-400 hover:text-white transition-colors"><Settings size={18} /></button>
                        </header>
                        <History history={user.history} unit={user.unit} onDelete={deleteWorkout} />
                    </div>
                )}
                {activeTab === 'progress' && (
                    <div className="max-w-2xl mx-auto p-4 pt-8">
                        <header className="mb-6 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">Trends</h2>
                            <button onClick={() => setSettingsOpen(true)} className="p-2 text-slate-400 hover:text-white transition-colors"><Settings size={18} /></button>
                        </header>
                        <Progress history={user.history} />
                    </div>
                )}
              </>
          )}
      </main>

      <RestTimer initialSeconds={90} autoStart={restTimerStart} />
      
      {warmupModal && (
          <WarmupCalculator 
            exerciseName={warmupModal.name} 
            workWeight={warmupModal.weight} 
            unit={user.unit}
            onClose={() => setWarmupModal(null)}
          />
      )}
      
      <WeightAdjustmentModal 
        isOpen={!!weightModal}
        onClose={() => setWeightModal(null)}
        onSave={updateExerciseWeight}
        currentWeight={weightModal?.weight || 0}
        exerciseName={weightModal?.name || ''}
        unit={user.unit}
      />
      
      <SettingsModal 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        user={user}
        onImport={(data) => setUser(data)}
        onReset={async () => {
          if (window.confirm("Are you sure? This will delete all your history and reset weights. This cannot be undone.")) {
            const resetState = INITIAL_STATE;
            setUser(resetState);
            
            // If signed in, immediately sync the reset state to cloud (no debounce)
            if (firebaseUser && isSyncAvailable()) {
              try {
                setSyncStatus('syncing');
                await saveToCloud(resetState);
                setSyncStatus('synced');
                setLastSynced(new Date());
                console.log('✅ Reset state synced to cloud');
              } catch (error) {
                console.error('❌ Failed to sync reset to cloud:', error);
                setSyncStatus('error');
              }
            }
          }
        }}
        onUpdate={(data) => setUser(data)}
        firebaseUser={firebaseUser}
        syncStatus={syncStatus}
        lastSynced={lastSynced}
        onOpenAuth={() => setAuthModalOpen(true)}
        onSignOut={async () => {
          try {
            await signOut();
            setFirebaseUser(null);
          } catch (error) {
            console.error('Failed to sign out:', error);
          }
        }}
      />
      
      <AddExerciseModal
        isOpen={addExerciseModalOpen}
        onClose={() => setAddExerciseModalOpen(false)}
        onAdd={addExerciseToActive}
      />

      {completedWorkout && (
        <WorkoutCompleteModal
          isOpen={true}
          onClose={() => setCompletedWorkout(null)}
          workout={completedWorkout.workout}
          nextWorkout={completedWorkout.nextWorkout}
          unit={user.unit}
          schedule={user.schedule}
          userName={user.name}
        />
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={() => {
          setAuthModalOpen(false);
          // Auth state change will trigger sync in useEffect
        }}
      />

      {guideModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
              <div className="bg-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-700 max-h-[80vh] flex flex-col">
                  <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                      <h3 className="text-lg font-bold text-white">Coach: {guideModal.name}</h3>
                      <button onClick={() => setGuideModal(null)}><Plus className="rotate-45 text-slate-400 hover:text-white transition-colors" size={24} /></button>
                  </div>
                  <div className="p-6 overflow-y-auto">
                      {guideModal.loading ? (
                          <div className="flex flex-col items-center justify-center py-12 gap-4">
                              <Loader2 className="animate-spin text-blue-500" size={40} />
                              <p className="text-slate-400">Loading AI tips...</p>
                          </div>
                      ) : (
                          <>
                            <div className="mb-6">
                                <h4 className="text-xs uppercase tracking-widest text-blue-400 font-bold mb-3">Form Check</h4>
                                <ul className="space-y-3">
                                    {guideModal.data?.tips.map((tip, i) => (
                                        <li key={i} className="flex gap-3 text-slate-200 text-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                                            <span className="leading-relaxed">{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div>
                                <h4 className="text-xs uppercase tracking-widest text-red-400 font-bold mb-3">Videos</h4>
                                <div className="space-y-3">
                                    {guideModal.data?.videos.map((vid, i) => (
                                        <a 
                                          key={i} 
                                          href={vid.uri} 
                                          target="_blank" 
                                          rel="noreferrer"
                                          className="block bg-slate-700/50 hover:bg-slate-700 p-4 rounded-xl border border-slate-600 transition-colors group"
                                        >
                                            <div className="font-bold text-white group-hover:text-blue-300 flex items-center justify-between gap-2">
                                                {vid.title} 
                                                <ExternalLink size={14} className="opacity-50" />
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                          </>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
