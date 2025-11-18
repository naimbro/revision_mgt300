import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  endTime: number;
  onExpire: () => void;
  isPaused?: boolean;
}

export default function Timer({ endTime, onExpire, isPaused }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [pausedTime, setPausedTime] = useState<number | null>(null);

  useEffect(() => {
    if (isPaused) {
      // Guardar tiempo al pausar
      if (pausedTime === null) {
        setPausedTime(timeLeft);
      }
      return;
    }

    // Restaurar tiempo al reanudar
    if (pausedTime !== null) {
      setTimeLeft(pausedTime);
      setPausedTime(null);
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, endTime - Date.now());
      setTimeLeft(remaining);

      if (remaining === 0) {
        onExpire();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, onExpire, isPaused, pausedTime, timeLeft]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <div className="dramatic-card px-6 py-3">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-gray-400" />
          <p className="text-sm text-gray-400">Tiempo restante</p>
        </div>
        <p className={`text-3xl font-bold ${timeLeft < 60000 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </p>
        {isPaused && (
          <p className="text-xs text-yellow-400 mt-1">⏸ PAUSADO</p>
        )}
      </div>
    </div>
  );
}
