'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface FloatingEmoji {
  id: string;
  emoji: string;
  x: number;
  y: number;
  startTime: number;
}

interface FloatingEmojiManagerProps {
  containerRef?: React.RefObject<HTMLElement>;
  duration?: number;
  floatHeight?: number;
}

export function FloatingEmojiManager({ 
  containerRef, 
  duration = 3000, 
  floatHeight = 200 
}: FloatingEmojiManagerProps) {
  const [emojis, setEmojis] = useState<FloatingEmoji[]>([]);

  // Clean up expired emojis
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setEmojis(prev => prev.filter(emoji => now - emoji.startTime < duration));
    }, 100);

    return () => clearInterval(interval);
  }, [duration]);

  // Global event listener for emoji reactions
  useEffect(() => {
    const handleEmojiReaction = (event: CustomEvent<{ emoji: string; x?: number; y?: number }>) => {
      const container = containerRef?.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = event.detail.x ?? rect.left + rect.width / 2;
      const y = event.detail.y ?? rect.top + rect.height - 100;

      const newEmoji: FloatingEmoji = {
        id: `${Date.now()}-${Math.random()}`,
        emoji: event.detail.emoji,
        x: x - rect.left,
        y: y - rect.top,
        startTime: Date.now()
      };

      setEmojis(prev => [...prev, newEmoji]);
    };

    window.addEventListener('emoji-reaction' as any, handleEmojiReaction);
    return () => window.removeEventListener('emoji-reaction' as any, handleEmojiReaction);
  }, [containerRef]);

  if (!containerRef?.current) return null;

  return createPortal(
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {emojis.map(emoji => (
        <FloatingEmojiItem
          key={emoji.id}
          emoji={emoji}
          duration={duration}
          floatHeight={floatHeight}
        />
      ))}
    </div>,
    containerRef.current
  );
}

interface FloatingEmojiItemProps {
  emoji: FloatingEmoji;
  duration: number;
  floatHeight: number;
}

function FloatingEmojiItem({ emoji, duration, floatHeight }: FloatingEmojiItemProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const progress = Math.min((Date.now() - emoji.startTime) / duration, 1);
  const opacity = 1 - Math.pow(progress, 3); // Fade out near the end
  const scale = 1 + progress * 0.5; // Grow slightly
  const wobble = Math.sin(progress * Math.PI * 4) * 10; // Wobble effect

  return (
    <div
      className={cn(
        "absolute text-4xl transition-all duration-[3000ms] ease-out",
        !mounted && "scale-0"
      )}
      style={{
        left: `${emoji.x}px`,
        top: `${emoji.y}px`,
        transform: `
          translate(-50%, -50%)
          translateY(${mounted ? -floatHeight : 0}px)
          translateX(${wobble}px)
          scale(${mounted ? scale : 0})
          rotate(${wobble * 2}deg)
        `,
        opacity: mounted ? opacity : 0,
      }}
    >
      {emoji.emoji}
    </div>
  );
}

// Helper function to trigger emoji reactions
export function triggerEmojiReaction(emoji: string, x?: number, y?: number) {
  const event = new CustomEvent('emoji-reaction', {
    detail: { emoji, x, y }
  });
  window.dispatchEvent(event);
}