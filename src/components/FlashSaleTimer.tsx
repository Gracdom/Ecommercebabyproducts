import { useState, useEffect, useMemo } from 'react';
import { Clock, Flame } from 'lucide-react';

interface FlashSaleTimerProps {
  endTime?: Date;
}

export function FlashSaleTimer({ endTime }: FlashSaleTimerProps) {
  // Default: 2 hours 45 minutes from now - memoize to prevent recalculation
  const targetTime = useMemo(() => {
    return endTime || new Date(Date.now() + 2 * 60 * 60 * 1000 + 45 * 60 * 1000);
  }, [endTime]);

  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetTime.getTime() - Date.now();

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetTime]);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 rounded-lg mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 animate-pulse" />
          <span className="text-sm">Flash Sale - Limited Time Offer!</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <div className="flex gap-1 text-sm">
            <span className="bg-white/20 px-2 py-1 rounded">{formatNumber(timeLeft.hours)}</span>
            <span>:</span>
            <span className="bg-white/20 px-2 py-1 rounded">{formatNumber(timeLeft.minutes)}</span>
            <span>:</span>
            <span className="bg-white/20 px-2 py-1 rounded">{formatNumber(timeLeft.seconds)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}