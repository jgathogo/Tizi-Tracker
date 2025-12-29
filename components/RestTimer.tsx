import React, { useState, useEffect } from 'react';
import { Timer, X, Play, Pause, RefreshCw } from 'lucide-react';

interface RestTimerProps {
  initialSeconds?: number;
  autoStart?: boolean;
  onComplete?: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({ initialSeconds = 90, autoStart = false, onComplete }) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(autoStart);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    let interval: number | undefined;
    if (isActive && seconds > 0) {
      interval = window.setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      if (onComplete) onComplete();
      // Simple notification sound or vibration could go here
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, onComplete]);

  useEffect(() => {
     if(autoStart) {
         setSeconds(initialSeconds);
         setIsActive(true);
     }
  }, [autoStart, initialSeconds]); // Reset when initialSeconds changes usually implies new set

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const addTime = (amount: number) => setSeconds(prev => prev + amount);
  const subTime = (amount: number) => setSeconds(prev => Math.max(0, prev - amount));

  if (!isActive && seconds === initialSeconds && !autoStart) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${minimized ? 'w-16 h-16' : 'w-72'}`}>
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-white">
        
        {minimized ? (
           <button 
             onClick={() => setMinimized(false)}
             className="w-full h-full flex items-center justify-center bg-red-600 hover:bg-red-500 rounded-2xl"
           >
             <div className="text-sm font-bold">{formatTime(seconds)}</div>
           </button>
        ) : (
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2 text-slate-300">
                <Timer size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Rest Timer</span>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => setMinimized(true)} className="p-1 hover:bg-slate-700 rounded text-slate-400">
                   <span className="text-xs">_</span>
                 </button>
                 <button onClick={() => setIsActive(false)} className="p-1 hover:bg-slate-700 rounded text-slate-400">
                   <X size={16} />
                 </button>
              </div>
            </div>

            <div className="text-center mb-4">
              <div className={`text-5xl font-mono font-bold ${seconds === 0 ? 'text-green-400' : 'text-white'}`}>
                {formatTime(seconds)}
              </div>
            </div>

            <div className="flex justify-center gap-4 mb-4">
               <button onClick={() => subTime(10)} className="px-2 py-1 bg-slate-700 rounded text-xs">-10s</button>
               <button onClick={() => addTime(10)} className="px-2 py-1 bg-slate-700 rounded text-xs">+10s</button>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setIsActive(!isActive)}
                className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-2 ${isActive ? 'bg-amber-600 hover:bg-amber-500' : 'bg-green-600 hover:bg-green-500'}`}
              >
                {isActive ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Resume</>}
              </button>
              <button 
                onClick={() => { setIsActive(false); setSeconds(initialSeconds); }}
                className="px-3 bg-slate-700 hover:bg-slate-600 rounded-lg"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
