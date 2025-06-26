'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Brain, 
  Clock, 
  CheckCircle2,
  XCircle,
  X,
  Award,
  Target,
  Zap,
  Trophy,
  Star
} from 'lucide-react';
import { Quiz, QuizQuestion, QuizResults } from '@/lib/types';

interface QuizOverlayProps {
  quiz: Quiz;
  onAnswer: (questionId: string, answerId: string) => void;
  onComplete: (results: QuizResults) => void;
  onClose: () => void;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  animated?: boolean;
  showTimer?: boolean;
  allowSkip?: boolean;
  className?: string;
}

export function QuizOverlay({
  quiz,
  onAnswer,
  onComplete,
  onClose,
  position = 'center',
  animated = true,
  showTimer = true,
  allowSkip = false,
  className = '',
}: QuizOverlayProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Calculate time remaining for timed quizzes
  useEffect(() => {
    if (quiz.timeLimit && showTimer) {
      const startTime = Date.now();
      const endTime = startTime + (quiz.timeLimit * 1000);

      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        setTimeRemaining(Math.floor(remaining / 1000));

        if (remaining === 0 && !isCompleted) {
          handleQuizComplete();
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);

      return () => clearInterval(interval);
    }
  }, [quiz.timeLimit, showTimer, isCompleted]);

  // Handle answer selection
  const handleAnswer = useCallback((answerId: string) => {
    if (showResult) return;

    setSelectedAnswer(answerId);
    setShowResult(true);

    const isCorrect = currentQuestion.correctAnswer === answerId;
    if (isCorrect) {
      setScore(prev => prev + (currentQuestion.points || 1));
    }

    const newAnswers = { ...answers, [currentQuestion.id]: answerId };
    setAnswers(newAnswers);
    onAnswer(currentQuestion.id, answerId);

    // Auto-advance after showing result
    setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        handleNextQuestion();
      } else {
        handleQuizComplete();
      }
    }, 2000);
  }, [currentQuestion, answers, currentQuestionIndex, totalQuestions, showResult, onAnswer]);

  // Handle next question
  const handleNextQuestion = useCallback(() => {
    setCurrentQuestionIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setShowResult(false);
  }, []);

  // Handle quiz completion
  const handleQuizComplete = useCallback(() => {
    if (isCompleted) return;

    const results: QuizResults = {
      quizId: quiz.id,
      score,
      totalScore: quiz.questions.reduce((acc, q) => acc + (q.points || 1), 0),
      correctAnswers: Object.entries(answers).filter(([questionId, answerId]) => {
        const question = quiz.questions.find(q => q.id === questionId);
        return question?.correctAnswer === answerId;
      }).length,
      totalQuestions,
      timeSpent: quiz.timeLimit ? quiz.timeLimit - timeRemaining : 0,
      answers,
    };

    setIsCompleted(true);
    onComplete(results);
  }, [quiz, score, answers, totalQuestions, timeRemaining, isCompleted, onComplete]);

  // Handle skip
  const handleSkip = useCallback(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      handleNextQuestion();
    } else {
      handleQuizComplete();
    }
  }, [currentQuestionIndex, totalQuestions, handleNextQuestion, handleQuizComplete]);

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
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get score percentage
  const getScorePercentage = () => {
    const totalPossible = quiz.questions.reduce((acc, q) => acc + (q.points || 1), 0);
    return (score / totalPossible) * 100;
  };

  // Get performance badge
  const getPerformanceBadge = () => {
    const percentage = getScorePercentage();
    if (percentage === 100) return { text: 'Perfect!', color: 'bg-green-500', icon: Trophy };
    if (percentage >= 80) return { text: 'Excellent!', color: 'bg-blue-500', icon: Star };
    if (percentage >= 60) return { text: 'Good Job!', color: 'bg-yellow-500', icon: Award };
    return { text: 'Keep Trying!', color: 'bg-orange-500', icon: Target };
  };

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

  // Render completed state
  if (isCompleted) {
    const performance = getPerformanceBadge();
    const PerformanceIcon = performance.icon;

    return (
      <AnimatePresence>
        <motion.div
          className={`fixed z-50 ${getPositionClasses()} ${className}`}
          initial={animated ? 'hidden' : false}
          animate="visible"
          exit="exit"
          variants={animated ? overlayVariants : undefined}
        >
          <Card className="w-96 glass border-2 border-white/10 shadow-strong backdrop-blur-xl">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="mx-auto mb-4"
              >
                <div className={`w-20 h-20 ${performance.color} rounded-full flex items-center justify-center shadow-glow-brand`}>
                  <PerformanceIcon className="h-10 w-10 text-white" />
                </div>
              </motion.div>
              <CardTitle className="text-2xl gradient-text">{performance.text}</CardTitle>
              <CardDescription className="text-muted-foreground">Quiz Completed!</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold gradient-text mb-2">
                  {score} / {quiz.questions.reduce((acc, q) => acc + (q.points || 1), 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {Object.entries(answers).filter(([questionId, answerId]) => {
                    const question = quiz.questions.find(q => q.id === questionId);
                    return question?.correctAnswer === answerId;
                  }).length} out of {totalQuestions} correct
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Accuracy</span>
                  <span className="font-medium text-foreground">{getScorePercentage().toFixed(0)}%</span>
                </div>
                <div className="relative">
                  <Progress value={getScorePercentage()} className="h-3 bg-white/10" />
                  <div 
                    className="absolute top-0 left-0 h-3 bg-gradient-to-r from-brand-purple to-brand-blue rounded-full transition-all duration-1000"
                    style={{ width: `${getScorePercentage()}%` }}
                  />
                </div>
              </div>

              {quiz.timeLimit && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Time spent: {formatTime(quiz.timeLimit - timeRemaining)}</span>
                </div>
              )}

              <Button 
                onClick={onClose} 
                className="w-full bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple-dark hover:to-brand-blue-dark shadow-medium hover:shadow-glow-brand transition-all duration-300"
              >
                Close
              </Button>
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
        <Card className="w-96 glass border-2 border-white/10 shadow-strong backdrop-blur-xl">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-brand-purple to-brand-indigo rounded-lg flex items-center justify-center">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <span className="gradient-text">{quiz.title}</span>
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </CardDescription>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress and Timer */}
            <div className="mt-3 space-y-2">
              <div className="relative">
                <Progress value={progress} className="h-2 bg-white/10" />
                <div 
                  className="absolute top-0 left-0 h-2 bg-gradient-to-r from-brand-purple to-brand-blue rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Zap className="h-2 w-2 text-white" />
                  </div>
                  <span className="text-foreground font-medium">{score} points</span>
                </div>
                
                {quiz.timeLimit && showTimer && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span className={cn(
                      "font-medium transition-colors",
                      timeRemaining < 30 ? 'text-red-400' : 'text-foreground'
                    )}>
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Question */}
            <div className="space-y-1">
              <h4 className="font-medium text-base">{currentQuestion.question}</h4>
              {currentQuestion.points && currentQuestion.points > 1 && (
                <Badge variant="secondary" className="text-xs">
                  {currentQuestion.points} points
                </Badge>
              )}
            </div>

            {/* Answers */}
            <div className="space-y-2">
              {currentQuestion.answers.map((answer, index) => {
                const isSelected = selectedAnswer === answer.id;
                const isCorrect = showResult && answer.id === currentQuestion.correctAnswer;
                const isWrong = showResult && isSelected && !isCorrect;

                return (
                  <motion.div
                    key={answer.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      variant={isSelected ? 'default' : 'outline'}
                      className={cn(
                        'w-full justify-start h-auto p-3 relative transition-all duration-300 glass',
                        'hover:scale-[1.02] hover:shadow-medium border-white/10',
                        {
                          'border-green-400 bg-green-500/20 shadow-glow-subtle': isCorrect,
                          'border-red-400 bg-red-500/20': isWrong,
                          'opacity-60': showResult && !isSelected && !isCorrect,
                          'bg-gradient-to-r from-brand-purple/20 to-brand-blue/20 border-brand-indigo/50': isSelected && !showResult,
                        }
                      )}
                      onClick={() => handleAnswer(answer.id)}
                      disabled={showResult}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm">{answer.text}</span>
                        {showResult && (
                          <>
                            {isCorrect && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                            {isWrong && <XCircle className="h-4 w-4 text-red-500" />}
                          </>
                        )}
                      </div>
                    </Button>
                  </motion.div>
                );
              })}
            </div>

            {/* Explanation */}
            {showResult && currentQuestion.explanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-muted rounded-lg"
              >
                <p className="text-sm">{currentQuestion.explanation}</p>
              </motion.div>
            )}

            {/* Skip button */}
            {allowSkip && !showResult && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="w-full"
              >
                Skip Question
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}