import { useState, useEffect, useRef, useCallback } from 'react';

interface UseBattleTimerOptions {
  duration?: number;
  onTick?: (timeLeft: number) => void;
  onComplete?: () => void;
  autoStart?: boolean;
}

export function useBattleTimer({
  duration = 30,
  onTick,
  onComplete,
  autoStart = false
}: UseBattleTimerOptions = {}) {
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  const start = useCallback(() => {
    if (isRunning && !isPaused) return;
    
    if (isPaused) {
      // Resume from pause
      startTimeRef.current = Date.now() - pausedTimeRef.current;
      setIsPaused(false);
    } else {
      // Start fresh
      setTimeLeft(duration);
      startTimeRef.current = Date.now();
      setIsRunning(true);
    }
  }, [duration, isRunning, isPaused]);

  const pause = useCallback(() => {
    if (!isRunning || isPaused) return;
    
    pausedTimeRef.current = Date.now() - startTimeRef.current;
    setIsPaused(true);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [isRunning, isPaused]);

  const stop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    pausedTimeRef.current = 0;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const reset = useCallback((newDuration?: number) => {
    const resetDuration = newDuration || duration;
    setTimeLeft(resetDuration);
    setIsRunning(false);
    setIsPaused(false);
    pausedTimeRef.current = 0;
    startTimeRef.current = 0;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [duration]);

  const getTimeUsed = useCallback((): number => {
    if (!isRunning) return 0;
    
    const elapsed = isPaused 
      ? pausedTimeRef.current 
      : Date.now() - startTimeRef.current;
    
    return Math.floor(elapsed / 1000);
  }, [isRunning, isPaused]);

  const getPercentage = useCallback((): number => {
    return (timeLeft / duration) * 100;
  }, [timeLeft, duration]);

  const getTimeColor = useCallback((): string => {
    const percentage = getPercentage();
    if (percentage > 66) return '#10b981';
    if (percentage > 33) return '#f59e0b';
    return '#ef4444';
  }, [getPercentage]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart) {
      start();
    }
  }, [autoStart, start]);

  // Timer effect
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, duration - Math.floor(elapsed / 1000));
        
        setTimeLeft(remaining);
        
        if (onTick) {
          onTick(remaining);
        }
        
        if (remaining === 0) {
          stop();
          if (onComplete) {
            onComplete();
          }
        }
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, duration, onTick, onComplete, stop]);

  return {
    timeLeft,
    isRunning,
    isPaused,
    start,
    pause,
    stop,
    reset,
    getTimeUsed,
    getPercentage,
    getTimeColor,
  };
}

export function useCountdownTimer(
  duration: number,
  onComplete?: () => void
) {
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        
        if (newTime <= 0) {
          setIsExpired(true);
          if (onComplete) {
            onComplete();
          }
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  const reset = useCallback(() => {
    setTimeLeft(duration);
    setIsExpired(false);
  }, [duration]);

  return {
    timeLeft,
    isExpired,
    reset,
    getPercentage: () => (timeLeft / duration) * 100,
  };
}
