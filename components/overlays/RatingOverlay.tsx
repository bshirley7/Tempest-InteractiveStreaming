'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Star,
  X,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  Award,
  TrendingUp
} from 'lucide-react';
import { Rating, RatingType } from '@/lib/types';

interface RatingOverlayProps {
  onRate: (rating: number, type?: RatingType) => void;
  onClose: () => void;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  ratingType?: RatingType;
  currentRating?: number;
  averageRating?: number;
  totalRatings?: number;
  showAverage?: boolean;
  animated?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
  className?: string;
}

export function RatingOverlay({
  onRate,
  onClose,
  position = 'bottom-right',
  ratingType = 'stars',
  currentRating = 0,
  averageRating,
  totalRatings = 0,
  showAverage = true,
  animated = true,
  autoHide = false,
  autoHideDelay = 5000,
  className = '',
}: RatingOverlayProps) {
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [selectedRating, setSelectedRating] = useState<number>(currentRating);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Auto-hide effect
  useEffect(() => {
    if (autoHide && !selectedRating) {
      const timer = setTimeout(onClose, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, selectedRating, onClose]);

  // Handle rating selection
  const handleRate = useCallback((rating: number) => {
    setSelectedRating(rating);
    onRate(rating, ratingType);
    setShowConfirmation(true);

    // Auto-close after confirmation
    setTimeout(() => {
      onClose();
    }, 2000);
  }, [onRate, ratingType, onClose]);

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
        return 'bottom-4 right-4';
    }
  };

  // Get rating description
  const getRatingDescription = (rating: number) => {
    if (ratingType === 'thumbs') {
      return rating === 1 ? 'Thumbs Up' : 'Thumbs Down';
    }
    
    const descriptions = [
      '',
      'Poor',
      'Fair', 
      'Good',
      'Very Good',
      'Excellent'
    ];
    return descriptions[rating] || '';
  };

  // Format average rating
  const formatAverageRating = (avg: number) => {
    return avg.toFixed(1);
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

  const starVariants = {
    hidden: { opacity: 0, scale: 0, rotate: -180 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        delay: i * 0.1,
        type: 'spring',
        stiffness: 400,
        damping: 15
      }
    }),
    hover: { 
      scale: 1.2,
      rotate: 360,
      transition: { duration: 0.3 }
    }
  };

  // Render star rating
  const renderStarRating = () => {
    const maxStars = 5;
    const displayRating = hoveredRating || selectedRating;

    return (
      <div className="flex items-center gap-1">
        {[...Array(maxStars)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= displayRating;
          const isHovered = starValue <= hoveredRating;

          return (
            <motion.button
              key={index}
              custom={index}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              variants={starVariants}
              onClick={() => handleRate(starValue)}
              onMouseEnter={() => setHoveredRating(starValue)}
              onMouseLeave={() => setHoveredRating(0)}
              className={cn(
                "p-1 rounded-lg transition-all duration-200",
                "hover:bg-white/10",
                selectedRating === starValue && "bg-brand-purple/20"
              )}
              disabled={showConfirmation}
            >
              <Star 
                className={cn(
                  "h-6 w-6 transition-all duration-200",
                  isFilled || isHovered 
                    ? "text-yellow-400 fill-yellow-400" 
                    : "text-white/40"
                )}
              />
            </motion.button>
          );
        })}
      </div>
    );
  };

  // Render thumbs rating
  const renderThumbsRating = () => {
    return (
      <div className="flex items-center gap-3">
        <motion.button
          initial="hidden"
          animate="visible"
          whileHover="hover"
          variants={starVariants}
          onClick={() => handleRate(1)}
          className={cn(
            "p-3 rounded-xl glass border-white/10 transition-all duration-300",
            "hover:scale-110 hover:shadow-medium hover:border-green-400/50",
            selectedRating === 1 && "bg-green-500/20 border-green-400 shadow-glow-subtle"
          )}
          disabled={showConfirmation}
        >
          <ThumbsUp className="h-6 w-6 text-green-400" />
        </motion.button>

        <motion.button
          initial="hidden"
          animate="visible"
          whileHover="hover"
          variants={starVariants}
          onClick={() => handleRate(-1)}
          className={cn(
            "p-3 rounded-xl glass border-white/10 transition-all duration-300",
            "hover:scale-110 hover:shadow-medium hover:border-red-400/50",
            selectedRating === -1 && "bg-red-500/20 border-red-400 shadow-glow-subtle"
          )}
          disabled={showConfirmation}
        >
          <ThumbsDown className="h-6 w-6 text-red-400" />
        </motion.button>
      </div>
    );
  };

  // Show confirmation state
  if (showConfirmation) {
    return (
      <AnimatePresence>
        <motion.div
          className={`fixed z-50 ${getPositionClasses()} ${className}`}
          initial={animated ? 'hidden' : false}
          animate="visible"
          exit="exit"
          variants={animated ? overlayVariants : undefined}
        >
          <Card className="w-72 glass border-2 border-white/10 shadow-strong backdrop-blur-xl">
            <CardContent className="p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow-brand"
              >
                <Award className="h-8 w-8 text-white" />
              </motion.div>
              
              <CardTitle className="text-lg gradient-text mb-2">Thank you!</CardTitle>
              <CardDescription className="text-muted-foreground">
                Your rating has been submitted
              </CardDescription>
              
              {ratingType === 'stars' && (
                <div className="flex items-center justify-center gap-1 mt-3">
                  {[...Array(5)].map((_, index) => (
                    <Star 
                      key={index}
                      className={cn(
                        "h-4 w-4",
                        index < selectedRating 
                          ? "text-yellow-400 fill-yellow-400" 
                          : "text-white/30"
                      )}
                    />
                  ))}
                  <span className="ml-2 text-sm text-foreground font-medium">
                    {selectedRating}/5
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed z-50 ${getPositionClasses()} ${className}`}
        initial={animated ? 'hidden' : false}
        animate="visible"
        exit="exit"
        variants={animated ? overlayVariants : undefined}
      >
        <Card className="w-72 glass border-2 border-white/10 shadow-strong backdrop-blur-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-brand-purple to-brand-indigo rounded-full flex items-center justify-center">
                  <BarChart3 className="h-3 w-3 text-white" />
                </div>
                <span className="gradient-text">Rate this content</span>
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

          <CardContent className="space-y-4">
            {/* Rating Input */}
            <div className="text-center">
              {ratingType === 'stars' ? renderStarRating() : renderThumbsRating()}
              
              {/* Rating Description */}
              {(hoveredRating || selectedRating) > 0 && ratingType === 'stars' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2"
                >
                  <Badge variant="secondary" className="bg-white/10 text-foreground border-white/20">
                    {getRatingDescription(hoveredRating || selectedRating)}
                  </Badge>
                </motion.div>
              )}
            </div>

            {/* Average Rating Display */}
            {showAverage && averageRating !== undefined && totalRatings > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-3 border-t border-white/10"
              >
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-brand-indigo" />
                    <span className="text-muted-foreground">Average Rating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {ratingType === 'stars' ? (
                      <>
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium text-foreground">
                          {formatAverageRating(averageRating)}
                        </span>
                      </>
                    ) : (
                      <span className="font-medium text-foreground">
                        {averageRating > 0 ? 'Mostly Positive' : 'Mixed'}
                      </span>
                    )}
                    <span className="text-muted-foreground">
                      ({totalRatings})
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Instructions */}
            <div className="text-center text-xs text-muted-foreground">
              {ratingType === 'stars' 
                ? 'Click a star to rate this content'
                : 'Choose thumbs up or down'
              }
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}