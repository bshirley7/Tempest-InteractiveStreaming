'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BarChart3, 
  Users, 
  Clock, 
  CheckCircle2,
  X,
  TrendingUp,
  Award
} from 'lucide-react';
import { Poll, PollOption, PollResults } from '@/lib/types';
import { DEFAULTS } from '@/lib/constants';

interface PollOverlayProps {
  poll: Poll;
  onVote: (optionId: string) => void;
  onClose: () => void;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  showResults?: boolean;
  allowChangeVote?: boolean;
  animated?: boolean;
  className?: string;
}

export function PollOverlay({
  poll,
  onVote,
  onClose,
  position = 'top-right',
  showResults = false,
  allowChangeVote = false,
  animated = true,
  className = '',
}: PollOverlayProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [showResultsState, setShowResultsState] = useState(showResults);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [animatedVotes, setAnimatedVotes] = useState<Record<string, number>>({});

  // Calculate time remaining
  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = new Date().getTime();
      const expires = poll.expiresAt.getTime();
      const remaining = Math.max(0, expires - now);
      setTimeRemaining(Math.floor(remaining / 1000));
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [poll.expiresAt]);

  // Animate vote counts
  useEffect(() => {
    if (showResultsState && poll.results) {
      const animationDuration = 1000;
      const steps = 20;
      const stepDuration = animationDuration / steps;

      poll.options.forEach((option) => {
        const targetVotes = poll.results?.options.find(o => o.id === option.id)?.votes || 0;
        let currentVotes = 0;
        const increment = targetVotes / steps;

        const interval = setInterval(() => {
          currentVotes = Math.min(currentVotes + increment, targetVotes);
          setAnimatedVotes(prev => ({ ...prev, [option.id]: Math.floor(currentVotes) }));
          
          if (currentVotes >= targetVotes) {
            clearInterval(interval);
          }
        }, stepDuration);
      });
    }
  }, [showResultsState, poll.results, poll.options]);

  // Handle voting
  const handleVote = useCallback((optionId: string) => {
    if (!hasVoted || allowChangeVote) {
      setSelectedOption(optionId);
      setHasVoted(true);
      onVote(optionId);
      
      // Show results after voting
      setTimeout(() => {
        setShowResultsState(true);
      }, 500);
    }
  }, [hasVoted, allowChangeVote, onVote]);

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
        return 'top-4 right-4';
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate vote percentage
  const getVotePercentage = (optionId: string) => {
    if (!poll.results || poll.results.totalVotes === 0) return 0;
    const option = poll.results.options.find(o => o.id === optionId);
    return option ? (option.votes / poll.results.totalVotes) * 100 : 0;
  };

  // Get winning option
  const getWinningOption = () => {
    if (!poll.results || poll.results.totalVotes === 0) return null;
    return poll.results.options.reduce((prev, current) => 
      (current.votes > prev.votes) ? current : prev
    );
  };

  const winningOption = getWinningOption();
  const isExpired = timeRemaining === 0;

  const overlayVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: position.includes('top') ? -20 : 20 
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      y: position.includes('top') ? -20 : 20,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed z-50 ${getPositionClasses()} ${className}`}
        initial={animated ? 'hidden' : false}
        animate="visible"
        exit="exit"
        variants={animated ? overlayVariants : undefined}
      >
        <Card className="w-80 shadow-2xl border-2">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Live Poll
                </CardTitle>
                <CardDescription className="text-sm">
                  {poll.question}
                </CardDescription>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className={isExpired ? 'text-red-500' : ''}>
                  {isExpired ? 'Ended' : formatTime(timeRemaining)}
                </span>
              </div>
              
              {poll.results && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{poll.results.totalVotes} votes</span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Options */}
            {poll.options.map((option, index) => {
              const votePercentage = getVotePercentage(option.id);
              const isWinning = winningOption?.id === option.id && showResultsState;
              const isSelected = selectedOption === option.id;

              return (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    variant={isSelected ? 'default' : 'outline'}
                    className={`w-full justify-start h-auto p-3 relative overflow-hidden transition-all ${
                      hasVoted && !isSelected && !allowChangeVote ? 'opacity-60' : ''
                    } ${isWinning ? 'ring-2 ring-green-500' : ''}`}
                    onClick={() => handleVote(option.id)}
                    disabled={(hasVoted && !allowChangeVote) || isExpired}
                  >
                    {/* Progress background */}
                    {showResultsState && (
                      <motion.div
                        className="absolute inset-0 bg-primary/10"
                        initial={{ width: '0%' }}
                        animate={{ width: `${votePercentage}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    )}

                    <div className="relative z-10 flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                        {isWinning && (
                          <Award className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className="text-sm font-medium">{option.text}</span>
                      </div>

                      {showResultsState && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            {animatedVotes[option.id] || 0}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({votePercentage.toFixed(1)}%)
                          </span>
                        </div>
                      )}
                    </div>
                  </Button>
                </motion.div>
              );
            })}

            {/* Results Summary */}
            {showResultsState && poll.results && poll.results.totalVotes > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-2 border-t"
              >
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Leading:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{winningOption?.text}</span>
                    <Badge variant="secondary" className="text-xs">
                      {getVotePercentage(winningOption?.id || '').toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Vote prompt */}
            {!hasVoted && !isExpired && (
              <div className="text-center text-sm text-muted-foreground">
                Tap an option to vote
              </div>
            )}

            {/* Allow change vote */}
            {hasVoted && allowChangeVote && !isExpired && (
              <div className="text-center text-xs text-muted-foreground">
                You can change your vote
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}