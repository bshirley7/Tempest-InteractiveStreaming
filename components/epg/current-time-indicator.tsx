'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CurrentTimeIndicatorProps {
  startTime: Date;
  endTime: Date;
  className?: string;
}

export function CurrentTimeIndicator({ startTime, endTime, className }: CurrentTimeIndicatorProps) {
  const [position, setPosition] = useState(0);
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updatePosition = () => {
      const now = new Date();
      const minutesSinceStart = (now.getTime() - startTime.getTime()) / (1000 * 60);
      // Calculate pixel position (each 30 min block is 128px wide)
      const pixelPosition = (minutesSinceStart / 30) * 128;
      setPosition(Math.max(0, pixelPosition));
      
      // Update time string
      setTimeString(now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }));
    };

    updatePosition();
    const timer = setInterval(updatePosition, 30000); // Update every 30 seconds

    return () => clearInterval(timer);
  }, [startTime, endTime]);

  return (
    <motion.div
      className={cn("absolute top-0 bottom-0 w-0.5 z-20 pointer-events-none", className)}
      style={{ left: `${position}px` }}
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: 1, scaleY: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {/* Time label */}
      <motion.div 
        className={cn(
          "absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap",
          "bg-gradient-to-r from-purple-600 to-indigo-600",
          "text-white text-xs font-bold px-3 py-1 rounded-full",
          "shadow-lg shadow-purple-500/25"
        )}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {timeString}
      </motion.div>
      
      {/* Vertical line with gradient */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-purple-500 via-indigo-500 to-blue-500"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 0.1 }}
      />
      
      {/* Glow effect */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-purple-500 via-indigo-500 to-blue-500 blur-sm"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Arrow at top */}
      <motion.div 
        className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 
          border-l-[4px] border-l-transparent
          border-t-[6px] border-t-purple-500
          border-r-[4px] border-r-transparent"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3 }}
      />
    </motion.div>
  );
}