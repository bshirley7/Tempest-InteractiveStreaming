'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Heart,
  Smile,
  Zap,
  Flame,
  X,
  ThumbsUp,
  Laugh,
  Frown,
  ShockIcon as Shock,
  Star
} from 'lucide-react';
import { EmojiReaction, EmojiType } from '@/lib/types';
import { DEFAULTS } from '@/lib/constants';

interface EmojiReactionOverlayProps {
  onReact: (emoji: EmojiType) => void;
  onClose: () => void;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  recentReactions?: EmojiReaction[];
  animated?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
  className?: string;
}

export function EmojiReactionOverlay({
  onReact,
  onClose,
  position = 'bottom-left',
  recentReactions = [],
  animated = true,
  autoHide = true,
  autoHideDelay = 5000,
  className = '',
}: EmojiReactionOverlayProps) {
  const [selectedEmoji, setSelectedEmoji] = useState<EmojiType | null>(null);
  const [floatingEmojis, setFloatingEmojis] = useState<Array<{ id: string; emoji: EmojiType; x: number; y: number }>>([]);

  // Available emoji reactions
  const emojiOptions: Array<{ emoji: EmojiType; icon: React.ComponentType<any>; label: string; color: string }> = [
    { emoji: 'heart', icon: Heart, label: 'Love', color: 'text-red-500' },
    { emoji: 'thumbs_up', icon: ThumbsUp, label: 'Like', color: 'text-blue-500' },
    { emoji: 'laugh', icon: Laugh, label: 'Funny', color: 'text-yellow-500' },
    { emoji: 'surprise', icon: Shock, label: 'Wow', color: 'text-orange-500' },
    { emoji: 'fire', icon: Flame, label: 'Fire', color: 'text-red-600' },
    { emoji: 'star', icon: Star, label: 'Amazing', color: 'text-yellow-400' },
    { emoji: 'zap', icon: Zap, label: 'Exciting', color: 'text-purple-500' },
    { emoji: 'sad', icon: Frown, label: 'Sad', color: 'text-gray-500' },
  ];

  // Auto-hide effect
  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(onClose, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, onClose]);

  // Handle emoji reaction
  const handleReact = useCallback((emoji: EmojiType) => {
    setSelectedEmoji(emoji);
    onReact(emoji);

    // Create floating emoji effect
    const floatingEmoji = {
      id: Math.random().toString(36).substr(2, 9),
      emoji,
      x: Math.random() * 200 - 100,
      y: Math.random() * 100 - 50,
    };

    setFloatingEmojis(prev => [...prev, floatingEmoji]);

    // Remove floating emoji after animation
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== floatingEmoji.id));
    }, 2000);

    // Reset selection after a short delay
    setTimeout(() => {
      setSelectedEmoji(null);
    }, 300);
  }, [onReact]);

  // Get position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'center':
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      default:
        return 'bottom-4 left-4';
    }
  };

  // Get recent reaction counts
  const getReactionCount = (emoji: EmojiType) => {
    return recentReactions.filter(r => r.emoji === emoji).length;
  };

  const overlayVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: position.includes('bottom') ? 20 : -20 
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      y: position.includes('bottom') ? 20 : -20,
      transition: {
        duration: 0.2
      }
    }
  };

  const emojiVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.05,
        type: 'spring',
        stiffness: 400,
        damping: 15
      }
    }),
    tap: { 
      scale: 1.2,
      transition: { duration: 0.1 }
    }
  };

  const floatingEmojiVariants = {
    hidden: { opacity: 0, scale: 0, y: 0 },
    visible: { 
      opacity: [0, 1, 0],
      scale: [0, 1.5, 0],
      y: -100,
      transition: {
        duration: 2,
        ease: 'easeOut'
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          className={`fixed z-50 ${getPositionClasses()} ${className}`}
          initial={animated ? 'hidden' : false}
          animate="visible"
          exit="exit"
          variants={animated ? overlayVariants : undefined}
        >
          <Card className="glass border-2 border-white/10 shadow-strong backdrop-blur-xl overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-brand-purple to-brand-indigo rounded-full flex items-center justify-center">
                    <Smile className="h-3 w-3 text-white" />
                  </div>
                  <span className="gradient-text">React</span>
                </CardTitle>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-6 w-6 p-0 hover:bg-white/10"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pb-4">
              <div className="grid grid-cols-4 gap-2">
                {emojiOptions.map((option, index) => {
                  const IconComponent = option.icon;
                  const reactionCount = getReactionCount(option.emoji);
                  const isSelected = selectedEmoji === option.emoji;

                  return (
                    <motion.div
                      key={option.emoji}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      variants={emojiVariants}
                      whileTap="tap"
                      className="relative"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReact(option.emoji)}
                        className={cn(
                          "h-12 w-12 rounded-xl relative glass border-white/10 transition-all duration-300",
                          "hover:scale-110 hover:shadow-medium hover:border-white/20",
                          isSelected && "scale-110 shadow-glow-brand border-brand-purple/50"
                        )}
                      >
                        <IconComponent className={cn("h-5 w-5", option.color)} />
                        
                        {reactionCount > 0 && (
                          <Badge 
                            variant="secondary" 
                            className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-brand-gradient text-white border-0"
                          >
                            {reactionCount > 99 ? '99+' : reactionCount}
                          </Badge>
                        )}
                      </Button>

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="glass rounded-lg px-2 py-1 text-xs text-foreground whitespace-nowrap">
                          {option.label}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Recent reactions indicator */}
              {recentReactions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-center"
                >
                  <div className="text-xs text-muted-foreground">
                    {recentReactions.length} recent reaction{recentReactions.length !== 1 ? 's' : ''}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Floating emoji animations */}
      <AnimatePresence>
        {floatingEmojis.map((floatingEmoji) => {
          const emojiOption = emojiOptions.find(e => e.emoji === floatingEmoji.emoji);
          if (!emojiOption) return null;
          
          const IconComponent = emojiOption.icon;

          return (
            <motion.div
              key={floatingEmoji.id}
              className="fixed z-60 pointer-events-none"
              style={{
                left: `calc(50% + ${floatingEmoji.x}px)`,
                top: `calc(50% + ${floatingEmoji.y}px)`,
              }}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={floatingEmojiVariants}
            >
              <IconComponent className={cn("h-8 w-8", emojiOption.color)} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </>
  );
}