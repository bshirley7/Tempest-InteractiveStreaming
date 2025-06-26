'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PollOverlay } from './PollOverlay';
import { QuizOverlay } from './QuizOverlay';
import { EmojiReactionOverlay } from './EmojiReactionOverlay';
import { RatingOverlay } from './RatingOverlay';
import { 
  Poll, 
  Quiz, 
  EmojiReaction, 
  Rating, 
  EmojiType, 
  RatingType,
  QuizResults,
  PollResults
} from '@/lib/types';

export type InteractionType = 'poll' | 'quiz' | 'emoji' | 'rating';

export interface ActiveInteraction {
  id: string;
  type: InteractionType;
  data: Poll | Quiz | null;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  autoHide?: boolean;
  autoHideDelay?: number;
}

interface InteractionManagerProps {
  // Poll props
  onPollVote?: (pollId: string, optionId: string) => void;
  onPollComplete?: (pollId: string, results: PollResults) => void;
  
  // Quiz props  
  onQuizAnswer?: (quizId: string, questionId: string, answerId: string) => void;
  onQuizComplete?: (quizId: string, results: QuizResults) => void;
  
  // Emoji props
  onEmojiReact?: (emoji: EmojiType) => void;
  recentReactions?: EmojiReaction[];
  
  // Rating props
  onRating?: (rating: number, type?: RatingType) => void;
  currentRating?: number;
  averageRating?: number;
  totalRatings?: number;
  
  // General props
  activeInteractions?: ActiveInteraction[];
  maxConcurrentInteractions?: number;
  onInteractionClose?: (interactionId: string) => void;
  className?: string;
}

export function InteractionManager({
  onPollVote,
  onPollComplete,
  onQuizAnswer,
  onQuizComplete,
  onEmojiReact,
  recentReactions = [],
  onRating,
  currentRating = 0,
  averageRating,
  totalRatings = 0,
  activeInteractions = [],
  maxConcurrentInteractions = 3,
  onInteractionClose,
  className = '',
}: InteractionManagerProps) {
  const [interactions, setInteractions] = useState<ActiveInteraction[]>(activeInteractions);

  // Update interactions when props change
  useEffect(() => {
    setInteractions(activeInteractions);
  }, [activeInteractions]);

  // Handle closing interactions
  const handleClose = useCallback((interactionId: string) => {
    setInteractions(prev => prev.filter(interaction => interaction.id !== interactionId));
    onInteractionClose?.(interactionId);
  }, [onInteractionClose]);

  // Handle poll voting
  const handlePollVote = useCallback((optionId: string) => {
    const pollInteraction = interactions.find(i => i.type === 'poll');
    if (pollInteraction && pollInteraction.data) {
      onPollVote?.(pollInteraction.id, optionId);
    }
  }, [interactions, onPollVote]);

  // Handle quiz answers
  const handleQuizAnswer = useCallback((questionId: string, answerId: string) => {
    const quizInteraction = interactions.find(i => i.type === 'quiz');
    if (quizInteraction && quizInteraction.data) {
      onQuizAnswer?.(quizInteraction.id, questionId, answerId);
    }
  }, [interactions, onQuizAnswer]);

  // Handle quiz completion
  const handleQuizComplete = useCallback((results: QuizResults) => {
    const quizInteraction = interactions.find(i => i.type === 'quiz');
    if (quizInteraction) {
      onQuizComplete?.(quizInteraction.id, results);
    }
  }, [interactions, onQuizComplete]);

  // Position management for multiple overlays
  const getOptimalPosition = (type: InteractionType, index: number): ActiveInteraction['position'] => {
    const positions: ActiveInteraction['position'][] = [
      'bottom-right',
      'bottom-left', 
      'top-right',
      'top-left',
      'center'
    ];
    
    // Specific positioning logic
    switch (type) {
      case 'poll':
        return 'top-right';
      case 'quiz':
        return 'center';
      case 'emoji':
        return 'bottom-left';
      case 'rating':
        return 'bottom-right';
      default:
        return positions[index % positions.length];
    }
  };

  // Limit concurrent interactions
  const visibleInteractions = interactions.slice(0, maxConcurrentInteractions);

  return (
    <div className={`fixed inset-0 pointer-events-none z-40 ${className}`}>
      <AnimatePresence mode="multiple">
        {visibleInteractions.map((interaction, index) => {
          const position = interaction.position || getOptimalPosition(interaction.type, index);
          
          // Render appropriate overlay based on type
          switch (interaction.type) {
            case 'poll':
              if (!interaction.data || !('question' in interaction.data)) return null;
              return (
                <div key={interaction.id} className="pointer-events-auto">
                  <PollOverlay
                    poll={interaction.data as Poll}
                    onVote={handlePollVote}
                    onClose={() => handleClose(interaction.id)}
                    position={position}
                    animated={true}
                  />
                </div>
              );

            case 'quiz':
              if (!interaction.data || !('title' in interaction.data)) return null;
              return (
                <div key={interaction.id} className="pointer-events-auto">
                  <QuizOverlay
                    quiz={interaction.data as Quiz}
                    onAnswer={handleQuizAnswer}
                    onComplete={handleQuizComplete}
                    onClose={() => handleClose(interaction.id)}
                    position={position}
                    animated={true}
                  />
                </div>
              );

            case 'emoji':
              return (
                <div key={interaction.id} className="pointer-events-auto">
                  <EmojiReactionOverlay
                    onReact={(emoji) => onEmojiReact?.(emoji)}
                    onClose={() => handleClose(interaction.id)}
                    position={position}
                    recentReactions={recentReactions}
                    animated={true}
                    autoHide={interaction.autoHide}
                    autoHideDelay={interaction.autoHideDelay}
                  />
                </div>
              );

            case 'rating':
              return (
                <div key={interaction.id} className="pointer-events-auto">
                  <RatingOverlay
                    onRate={(rating, type) => onRating?.(rating, type)}
                    onClose={() => handleClose(interaction.id)}
                    position={position}
                    currentRating={currentRating}
                    averageRating={averageRating}
                    totalRatings={totalRatings}
                    animated={true}
                    autoHide={interaction.autoHide}
                    autoHideDelay={interaction.autoHideDelay}
                  />
                </div>
              );

            default:
              return null;
          }
        })}
      </AnimatePresence>

      {/* Overflow indicator */}
      {interactions.length > maxConcurrentInteractions && (
        <div className="fixed bottom-4 right-4 pointer-events-auto">
          <div className="glass rounded-lg p-2 border border-white/10 shadow-medium backdrop-blur-md">
            <div className="text-xs text-muted-foreground">
              +{interactions.length - maxConcurrentInteractions} more interaction{interactions.length - maxConcurrentInteractions !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Utility hooks for managing interactions
export function useInteractionManager() {
  const [interactions, setInteractions] = useState<ActiveInteraction[]>([]);

  const addInteraction = useCallback((interaction: Omit<ActiveInteraction, 'id'>) => {
    const newInteraction: ActiveInteraction = {
      ...interaction,
      id: Math.random().toString(36).substr(2, 9),
    };
    
    setInteractions(prev => [...prev, newInteraction]);
    return newInteraction.id;
  }, []);

  const removeInteraction = useCallback((id: string) => {
    setInteractions(prev => prev.filter(interaction => interaction.id !== id));
  }, []);

  const clearInteractions = useCallback(() => {
    setInteractions([]);
  }, []);

  const showPoll = useCallback((poll: Poll, options?: Partial<ActiveInteraction>) => {
    return addInteraction({
      type: 'poll',
      data: poll,
      position: 'top-right',
      ...options,
    });
  }, [addInteraction]);

  const showQuiz = useCallback((quiz: Quiz, options?: Partial<ActiveInteraction>) => {
    return addInteraction({
      type: 'quiz',
      data: quiz,
      position: 'center',
      ...options,
    });
  }, [addInteraction]);

  const showEmojiReactions = useCallback((options?: Partial<ActiveInteraction>) => {
    return addInteraction({
      type: 'emoji',
      data: null,
      position: 'bottom-left',
      autoHide: true,
      autoHideDelay: 5000,
      ...options,
    });
  }, [addInteraction]);

  const showRating = useCallback((options?: Partial<ActiveInteraction>) => {
    return addInteraction({
      type: 'rating',
      data: null,
      position: 'bottom-right',
      ...options,
    });
  }, [addInteraction]);

  return {
    interactions,
    addInteraction,
    removeInteraction,
    clearInteractions,
    showPoll,
    showQuiz,
    showEmojiReactions,
    showRating,
  };
}