import React, { useState, useEffect } from 'react';
import { UserProfile, ExerciseSession, WorkoutSessionData, FormGuideData, WorkoutType } from './types';
import { getExerciseFormGuide } from './services/geminiService';
import { ExerciseCard } from './components/ExerciseCard';
import { RestTimer } from './components/RestTimer';
import { History } from './components/History';
import { Progress } from './components/Progress';
import { WarmupCalculator } from './components/WarmupCalculator';
import { WeightAdjustmentModal } from './components/WeightAdjustmentModal';
import { SettingsModal } from './components/SettingsModal';
import { LayoutDashboard, History as HistoryIcon, LineChart, Plus, Check, Play, ExternalLink, Loader2, Settings, Dumbbell, Activity, PlusCircle } from 'lucide-react';

// --- CONFIGURATION ---
const APP_NAME = "Tizi Log";

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
  unit: 'kg'
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

  useEffect(() => {
    const saved = localStorage.getItem('powerlifts_data');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('powerlifts_data', JSON.stringify(user));
  }, [user]);

  const startWorkout = (type: WorkoutType) => {
    let exercises: ExerciseSession[] = [];
    let customName = "";

    if (type === 'A' || type === 'B') {
        exercises = PROGRAMS[type].map(name => ({
          name,
          weight: user.currentWeights[name] || 0,
          sets: name === 'Deadlift' ? [null] : [null, null, null, null, null]
        }));
    } else {
        // Custom generic log
        customName = prompt("Enter activity name (e.g. Skipping, Running):") || "General Activity";
        exercises = [{
            name: customName,
            weight: 0,
            sets: [null],
            isCustom: true
        }];
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

  const addExerciseToActive = () => {
    if (!activeSession) return;
    const name = prompt("Exercise Name:");
    if (!name) return;
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
      updatedExercises[weightModal.index].weight = newWeight;
      setActiveSession({ ...activeSession, exercises: updatedExercises });
      setWeightModal(null);
  };

  const finishWorkout = () => {
    if (!activeSession) return;

    const newWeights = { ...user.currentWeights };
    const completedExercises = activeSession.exercises;

    // Only progress if it was a standard 5x5 workout
    if (activeSession.type === 'A' || activeSession.type === 'B') {
        completedExercises.forEach(ex => {
            let nextWeight = ex.weight;
            const allSetsDone = ex.sets.every(r => r === 5);
            if (allSetsDone) {
                const increment = ex.name === 'Deadlift' ? 5 : 2.5; 
                nextWeight += increment;
            }
            newWeights[ex.name] = nextWeight;
        });
    }

    const completedSession = {
        ...activeSession,
        endTime: Date.now(),
        completed: true
    };

    setUser(prev => ({
        ...prev,
        currentWeights: newWeights,
        history: [completedSession, ...prev.history],
        nextWorkout: activeSession.type === 'A' ? 'B' : activeSession.type === 'B' ? 'A' : prev.nextWorkout
    }));

    setActiveSession(null);
  };

  const cancelWorkout = () => {
      if(confirm("Are you sure? This session won't be saved.")) {
          setActiveSession(null);
      }
  };

  const fetchGuide = async (name: string) => {
      setGuideModal({ name, data: null, loading: true });
      const data = await getExerciseFormGuide(name);
      setGuideModal({ name, data, loading: false });
  };

  const renderDashboard = () => (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-4 pt-8">
       <header className="mb-8 flex justify-between items-start">
           <div>
               <h1 className="text-3xl font-bold text-white mb-2">{APP_NAME}</h1>
               <p className="text-slate-400">Log your progress, whatever the activity.</p>
           </div>
           <button 
             onClick={() => setSettingsOpen(true)}
             className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition-colors"
           >
               <Settings size={20} />
           </button>
       </header>

       {/* Quick Start Card */}
       <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-2xl border border-blue-500/30 relative overflow-hidden group mb-8">
           <div className="relative z-10">
               <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-4 backdrop-blur-sm">
                   NEXT 5X5 SESSION
               </div>
               <h2 className="text-3xl font-bold mb-4">Workout {user.nextWorkout}</h2>
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
                 <button onClick={cancelWorkout} className="text-red-400 hover:text-red-300 text-sm font-bold px-3 py-1 bg-red-900/10 rounded-lg">Cancel</button>
             </div>

             <div className="space-y-4">
                {activeSession.exercises.map((ex, exIdx) => (
                    <ExerciseCard 
                        key={exIdx} 
                        exercise={ex} 
                        unit={user.unit}
                        onSetUpdate={(setIdx, reps) => updateSet(exIdx, setIdx, reps)}
                        onOpenGuide={fetchGuide}
                        onOpenWarmup={(name, weight) => setWarmupModal({name, weight})}
                        onEditWeight={(name, weight) => setWeightModal({index: exIdx, name, weight})}
                    />
                ))}
                
                <button 
                    onClick={addExerciseToActive}
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
                        <History history={user.history} unit={user.unit} />
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
        onReset={() => setUser(INITIAL_STATE)}
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