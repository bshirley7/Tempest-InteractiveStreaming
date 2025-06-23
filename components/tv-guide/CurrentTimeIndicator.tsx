'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface CurrentTimeIndicatorProps {
  timeSlots: Date[];
  currentTime: Date;
  slotWidth?: number;
  offsetLeft?: number;
  className?: string;
}

export function CurrentTimeIndicator({
  timeSlots,
  currentTime,
  slotWidth = 120,
  offsetLeft = 0,
  className = '',
}: CurrentTimeIndicatorProps) {
  const [position, setPosition] = useState(0);

  useEffect(() => {
    // Find the position based on current time and time slots
    const currentTimeMs = currentTime.getTime();
    
    // Find the slot that contains or is closest to current time
    let slotIndex = 0;
    let offsetWithinSlot = 0;
    
    for (let i = 0; i < timeSlots.length - 1; i++) {
      const slotStart = timeSlots[i].getTime();
      const slotEnd = timeSlots[i + 1].getTime();
      
      if (currentTimeMs >= slotStart && currentTimeMs <= slotEnd) {
        slotIndex = i;
        const slotDuration = slotEnd - slotStart;
        const timeIntoSlot = currentTimeMs - slotStart;
        offsetWithinSlot = (timeIntoSlot / slotDuration) * slotWidth;
        break;
      } else if (currentTimeMs < slotStart) {
        slotIndex = Math.max(0, i - 1);
        break;
      }
    }
    
    // If current time is after all slots, position at the end
    if (currentTimeMs > timeSlots[timeSlots.length - 1]?.getTime()) {
      slotIndex = timeSlots.length - 1;
      offsetWithinSlot = slotWidth;
    }
    
    const calculatedPosition = offsetLeft + (slotIndex * slotWidth) + offsetWithinSlot;
    setPosition(calculatedPosition);
  }, [currentTime, timeSlots, slotWidth, offsetLeft]);

  const formatCurrentTime = (time: Date) => {
    return format(time, 'HH:mm:ss');
  };

  return (
    <div
      className={`absolute top-0 bottom-0 z-20 pointer-events-none transition-all duration-1000 ${className}`}
      style={{ left: `${position}px` }}
    >
      {/* Vertical Line */}
      <div className="relative w-0.5 h-full bg-red-500">
        {/* Top Indicator */}
        <div className="absolute -top-3 -left-2 w-5 h-3 bg-red-500 rounded-t-sm flex items-center justify-center">
          <div className="w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-white" />
        </div>
        
        {/* Time Badge */}
        <div className="absolute -top-8 -left-8 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
          {formatCurrentTime(currentTime)}
        </div>
        
        {/* Bottom Indicator */}
        <div className="absolute -bottom-3 -left-2 w-5 h-3 bg-red-500 rounded-b-sm flex items-center justify-center">
          <div className="w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-white" />
        </div>
      </div>
      
      {/* Pulse Animation */}
      <div className="absolute top-1/2 -left-2 w-4 h-4 bg-red-500 rounded-full animate-pulse opacity-50 transform -translate-y-1/2" />
    </div>
  );
}