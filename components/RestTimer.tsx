import React, { useState, useEffect, useRef } from 'react';
import { Timer, X, Play, Pause, RefreshCw, Volume2, VolumeX, Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { playBellSound, playBeepSound } from '../utils/audioUtils';
import { triggerHapticFeedback, showNotification, requestNotificationPermission, isHapticAvailable } from '../utils/notificationUtils';
import type { Theme } from '../utils/themeColors';

interface RestTimerProps {
  initialSeconds?: number;
  autoStart?: boolean;
  onComplete?: () => void;
  theme?: Theme;
}

export const RestTimer: React.FC<RestTimerProps> = ({ initialSeconds = 90, autoStart = false, onComplete, theme = 'dark' }) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(autoStart);
  const [minimized, setMinimized] = useState(false);
  const [isDocked, setIsDocked] = useState(false);
  const [dockPosition, setDockPosition] = useState<'top' | 'bottom'>('bottom');
  const [isMuted, setIsMuted] = useState(false);
  const [enableIntervalAlerts, setEnableIntervalAlerts] = useState(false);
  const hasTriggeredOnCompleteRef = useRef(false);
  const lastIntervalAlertRef = useRef<number | null>(null);
  const notificationPermissionRequestedRef = useRef(false);

  useEffect(() => {
    let interval: number | undefined;
    
    if (isActive) {
      interval = window.setInterval(() => {
        setSeconds((prev) => {
          const newSeconds = prev - 1;
          
          // Play completion bell when reaching 0 (only once per timer session)
          if (newSeconds === 0 && !hasTriggeredOnCompleteRef.current) {
            hasTriggeredOnCompleteRef.current = true;
            
            // Issue #31: Enhanced Rest Timer - Haptics and Background Notifications
            // Trigger haptic feedback (vibration) when timer completes
            if (isHapticAvailable()) {
              triggerHapticFeedback([200, 100, 200, 100, 200]); // buzz-buzz-buzz pattern
            }
            
            // Show background notification if page is not in focus
            showNotification('Rest Time Complete!', {
              body: 'Time to start your next set.',
            });
            
            if (!isMuted) {
              playBellSound();
            }
            if (onComplete) {
              // Call onComplete - use setTimeout to avoid state update issues during render
              // This will be handled by the test framework's fake timers
              setTimeout(() => onComplete(), 0);
            }
          }
          
          // Interval alerts (every 30 seconds or 1 minute if enabled)
          if (enableIntervalAlerts && newSeconds > 0 && !isMuted) {
            const intervalSeconds = 30; // Alert every 30 seconds
            if (newSeconds % intervalSeconds === 0 && newSeconds !== lastIntervalAlertRef.current) {
              lastIntervalAlertRef.current = newSeconds;
              playBeepSound();
            }
          }
          
          return newSeconds;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, onComplete, isMuted, enableIntervalAlerts]);

  useEffect(() => {
     if(autoStart) {
         setSeconds(initialSeconds);
         setIsActive(true);
         hasTriggeredOnCompleteRef.current = false; // Reset onComplete flag for new timer
         lastIntervalAlertRef.current = null; // Reset interval alert tracking
     }
  }, [autoStart, initialSeconds]); // Reset when initialSeconds changes usually implies new set

  // Request notification permission on mount (only once)
  useEffect(() => {
    if (!notificationPermissionRequestedRef.current) {
      requestNotificationPermission().then(granted => {
        if (granted) {
          console.log('✅ Notification permission granted');
        }
      });
      notificationPermissionRequestedRef.current = true;
    }
  }, []);

  const formatTime = (sec: number) => {
    const isNegative = sec < 0;
    const absSec = Math.abs(sec);
    const m = Math.floor(absSec / 60);
    const s = absSec % 60;
    const formatted = `${m}:${s < 10 ? '0' : ''}${s}`;
    return isNegative ? `-${formatted}` : formatted;
  };

  const addTime = (amount: number) => setSeconds(prev => prev + amount);
  const subTime = (amount: number) => setSeconds(prev => prev - amount); // Allow negative values

  if (!isActive && seconds === initialSeconds && !autoStart) return null;

  // Docked mode: Slim bar at top or bottom
  if (isDocked) {
    return (
      <div className={`fixed ${dockPosition === 'top' ? 'top-0' : 'bottom-20'} left-0 right-0 z-[100] transition-all duration-300`}>
        <div className="bg-base-200 border-b border-base-300 shadow-lg text-base-content">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Timer size={18} className="text-base-content/60" />
                <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">Rest Timer</span>
                <div className={`text-2xl font-mono font-bold ${
                  seconds < 0 
                    ? 'text-error'
                    : seconds === 0 
                      ? 'text-warning'
                      : 'text-base-content'
                }`}>
                  {formatTime(seconds)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!minimized && (
                  <>
                    <button 
                      onClick={() => setIsMuted(!isMuted)} 
                      className="p-1.5 hover:bg-base-300 rounded text-base-content/60"
                      title={isMuted ? "Unmute alerts" : "Mute alerts"}
                    >
                      {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <button 
                      onClick={() => setIsActive(!isActive)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                        isActive ? 'bg-warning hover:bg-warning/80 text-warning-content' : 'bg-success hover:bg-success/80 text-success-content'
                      }`}
                    >
                      {isActive ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Resume</>}
                    </button>
                    <button 
                      onClick={() => { 
                        setIsActive(false); 
                        setSeconds(initialSeconds);
                        hasTriggeredOnCompleteRef.current = false;
                        lastIntervalAlertRef.current = null;
                      }}
                      className="p-1.5 bg-base-300 hover:bg-base-300/80 rounded-lg"
                      title="Reset"
                    >
                      <RefreshCw size={14} className="text-base-content" />
                    </button>
                  </>
                )}
                <button 
                  onClick={() => setMinimized(!minimized)} 
                  className="p-1.5 hover:bg-base-300 rounded text-base-content/60"
                  title={minimized ? "Expand" : "Minimize"}
                >
                  {minimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button 
                  onClick={() => setIsDocked(false)} 
                  className="p-1.5 hover:bg-base-300 rounded text-base-content/60"
                  title="Undock (Floating Mode)"
                >
                  <Maximize2 size={16} />
                </button>
                <button 
                  onClick={() => setIsActive(false)} 
                  className="p-1.5 hover:bg-base-300 rounded text-base-content/60"
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Floating mode: Original bubble design
  // Fix issue #32: Position timer higher to avoid overlapping Finish button and navigation bar
  // Changed from bottom-4 (16px) to bottom-28 (112px) to clear the bottom interaction zone
  return (
    <div className={`fixed bottom-28 right-4 z-[100] transition-all duration-300 ${minimized ? 'w-16 h-16' : 'w-72'}`}>
      <div className="bg-base-200 border border-base-300 rounded-2xl shadow-2xl overflow-hidden text-base-content">
        
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
              <div className="flex items-center gap-2 text-base-content/70">
                <Timer size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Rest Timer</span>
              </div>
              <div className="flex gap-2">
                 <button 
                   onClick={() => setIsMuted(!isMuted)} 
                   className="p-1 hover:bg-base-300 rounded text-base-content/60"
                   title={isMuted ? "Unmute alerts" : "Mute alerts"}
                 >
                   {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                 </button>
                 <button 
                   onClick={() => setIsDocked(true)} 
                   className="p-1 hover:bg-base-300 rounded text-base-content/60"
                   title="Dock (Non-Intrusive Mode)"
                 >
                   <Minimize2 size={16} />
                 </button>
                 <button onClick={() => setMinimized(true)} className="p-1 hover:bg-base-300 rounded text-base-content/60">
                   <span className="text-xs">_</span>
                 </button>
                 <button onClick={() => setIsActive(false)} className="p-1 hover:bg-base-300 rounded text-base-content/60">
                   <X size={16} />
                 </button>
              </div>
            </div>

            {/* Issue #31: Circular progress indicator */}
            <div className="text-center mb-4 relative">
              <div className="relative inline-block">
                {/* Circular progress SVG */}
                <svg className="transform -rotate-90 w-32 h-32" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-base-300"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - Math.max(0, Math.min(1, seconds / initialSeconds)))}`}
                    className={
                      seconds < 0 
                        ? 'text-error' 
                        : seconds === 0 
                          ? 'text-warning' 
                          : 'text-primary'
                    }
                    style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                  />
                </svg>
                {/* Time display in center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`text-2xl font-mono font-bold ${
                    seconds < 0 
                      ? 'text-error'  // Red when in overrun (negative)
                      : seconds === 0 
                        ? 'text-warning'  // Amber when exactly at zero
                        : 'text-base-content'  // Primary text during countdown
                  }`}>
                    {formatTime(seconds)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 mb-4">
               <button onClick={() => subTime(10)} className="px-2 py-1 bg-base-300 hover:bg-base-300/80 rounded text-xs text-base-content">-10s</button>
               <button onClick={() => addTime(10)} className="px-2 py-1 bg-base-300 hover:bg-base-300/80 rounded text-xs text-base-content">+10s</button>
            </div>

            <div className="space-y-2">
              {/* Issue #31: Prominent restart button */}
              <button
                onClick={() => {
                  setIsActive(false);
                  setSeconds(initialSeconds);
                  hasTriggeredOnCompleteRef.current = false;
                  lastIntervalAlertRef.current = null;
                }}
                className="w-full py-2.5 bg-primary hover:bg-primary/80 text-primary-content rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
                title="Restart timer to full duration"
              >
                <RotateCcw size={18} />
                Restart
              </button>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsActive(!isActive)}
                  className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-2 ${isActive ? 'bg-warning hover:bg-warning/80 text-warning-content' : 'bg-success hover:bg-success/80 text-success-content'}`}
                >
                  {isActive ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Resume</>}
                </button>
                <button 
                  onClick={() => { 
                    setIsActive(false); 
                    setSeconds(initialSeconds);
                    hasTriggeredOnCompleteRef.current = false; // Reset onComplete flag on reset
                    lastIntervalAlertRef.current = null; // Reset interval alert tracking
                  }}
                  className="px-3 bg-base-300 hover:bg-base-300/80 rounded-lg"
                  title="Reset"
                >
                  <RefreshCw size={18} className="text-base-content" />
                </button>
              </div>
              <button
                onClick={() => setEnableIntervalAlerts(!enableIntervalAlerts)}
                className={`w-full py-1.5 text-xs rounded-lg font-medium transition-colors ${
                  enableIntervalAlerts
                    ? 'bg-primary hover:bg-primary/80 text-primary-content'
                    : 'bg-base-200 hover:bg-base-300 text-base-content/70'
                }`}
                title="Play beep every 30 seconds"
              >
                {enableIntervalAlerts ? '✓ Interval Alerts On' : 'Interval Alerts Off'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
