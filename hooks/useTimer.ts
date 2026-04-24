import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerOptions {
  onComplete?: () => void;
  onTick?: (timeLeft: number) => void;
}

interface UseTimerReturn {
  timeLeft: number;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: (newDuration?: number) => void;
  addTime: (seconds: number) => void;
  percentage: number;
}

interface UseCountdownReturn {
  timeLeft: number;
  isExpired: boolean;
  reset: () => void;
  percentage: number;
}

export function useTimer(
  duration: number = 30,
  options: UseTimerOptions = {}
): UseTimerReturn {
  const { onComplete, onTick } = options;
  
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const reset = useCallback((newDuration: number = duration) => {
    setTimeLeft(newDuration);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [duration]);

  const addTime = useCallback((seconds: number) => {
    setTimeLeft(prev => Math.min(duration, prev + seconds));
  }, [duration]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          
          if (onTick) {
            onTick(newTime);
          }
          
          if (newTime <= 0) {
            setIsRunning(false);
            if (onComplete) {
              onComplete();
            }
          }
          
          return newTime;
        });
      }, 1000);
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
  }, [isRunning, timeLeft, duration, onComplete, onTick]);

  return {
    timeLeft,
    isRunning,
    start,
    stop,
    reset,
    addTime,
    percentage: (timeLeft / duration) * 100,
  };
}

export function useCountdown(
  duration: number = 30,
  onComplete?: () => void
): UseCountdownReturn {
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
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
    percentage: (timeLeft / duration) * 100,
  };
}
