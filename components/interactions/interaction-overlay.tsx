'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  MessageSquare, 
  Users, 
  Trophy,
  Clock,
  Zap,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface InteractionOverlayProps {
  channelId: string;
}

interface Poll {
  id: string;
  question: string;
  options: { text: string; votes: number }[];
  totalVotes: number;
  timeLeft: number;
  userVoted: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  timeLeft: number;
  participants: number;
}

export function InteractionOverlay({ channelId }: InteractionOverlayProps) {
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<QuizQuestion | null>(null);
  const [reactionCount, setReactionCount] = useState({ likes: 847, dislikes: 23 });
  const [showReactionBurst, setShowReactionBurst] = useState(false);

  useEffect(() => {
    // Simulate periodic interactions
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        // Show a poll
        setActivePoll({
          id: '1',
          question: 'How well do you understand today\'s topic?',
          options: [
            { text: 'Very well', votes: 234 },
            { text: 'Somewhat', votes: 567 },
            { text: 'Need review', votes: 123 },
            { text: 'Confused', votes: 45 }
          ],
          totalVotes: 969,
          timeLeft: 30,
          userVoted: false
        });
      } else if (Math.random() > 0.8) {
        // Show a quiz
        setActiveQuiz({
          id: '1',
          question: 'What is the atomic number of Carbon?',
          options: ['6', '12', '14', '16'],
          correctAnswer: 0,
          timeLeft: 15,
          participants: 234
        });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [channelId]);

  useEffect(() => {
    // Update poll timer
    if (activePoll && activePoll.timeLeft > 0) {
      const timer = setTimeout(() => {
        setActivePoll(prev => prev ? { ...prev, timeLeft: prev.timeLeft - 1 } : null);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (activePoll && activePoll.timeLeft === 0) {
      // Auto-hide poll after it ends
      setTimeout(() => setActivePoll(null), 3000);
    }
  }, [activePoll?.timeLeft]);

  useEffect(() => {
    // Update quiz timer
    if (activeQuiz && activeQuiz.timeLeft > 0) {
      const timer = setTimeout(() => {
        setActiveQuiz(prev => prev ? { ...prev, timeLeft: prev.timeLeft - 1 } : null);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (activeQuiz && activeQuiz.timeLeft === 0) {
      // Auto-hide quiz after it ends
      setTimeout(() => setActiveQuiz(null), 3000);
    }
  }, [activeQuiz?.timeLeft]);

  const handlePollVote = (optionIndex: number) => {
    if (!activePoll || activePoll.userVoted) return;
    
    setActivePoll(prev => {
      if (!prev) return null;
      const newOptions = [...prev.options];
      newOptions[optionIndex].votes += 1;
      return {
        ...prev,
        options: newOptions,
        totalVotes: prev.totalVotes + 1,
        userVoted: true
      };
    });
  };

  const handleQuizAnswer = (answerIndex: number) => {
    if (!activeQuiz) return;
    
    // Show result briefly then hide
    setTimeout(() => setActiveQuiz(null), 2000);
  };

  const handleReaction = (type: 'like' | 'dislike') => {
    setReactionCount(prev => ({
      ...prev,
      [type === 'like' ? 'likes' : 'dislikes']: prev[type === 'like' ? 'likes' : 'dislikes'] + 1
    }));
    
    setShowReactionBurst(true);
    setTimeout(() => setShowReactionBurst(false), 1000);
  };

  return (
    <div className="space-y-4">
      {/* Real-time Reactions */}
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Live Reactions
            </span>
            <Badge variant="secondary" className="animate-pulse">
              Live
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction('like')}
                className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                {reactionCount.likes}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction('dislike')}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                {reactionCount.dislikes}
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round((reactionCount.likes / (reactionCount.likes + reactionCount.dislikes)) * 100)}% positive
            </div>
          </div>
          
          {showReactionBurst && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="animate-ping">
                  <ThumbsUp className="h-8 w-8 text-green-500" />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Poll */}
      {activePoll && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Live Poll
              </span>
              <div className="flex items-center space-x-2">
                <Clock className="h-3 w-3" />
                <span className="text-sm font-mono">{activePoll.timeLeft}s</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium mb-4">{activePoll.question}</p>
            <div className="space-y-2">
              {activePoll.options.map((option, index) => {
                const percentage = activePoll.totalVotes > 0 ? (option.votes / activePoll.totalVotes) * 100 : 0;
                return (
                  <Button
                    key={index}
                    variant={activePoll.userVoted ? "ghost" : "outline"}
                    className="w-full justify-between p-3 h-auto"
                    onClick={() => handlePollVote(index)}
                    disabled={activePoll.userVoted || activePoll.timeLeft === 0}
                  >
                    <span>{option.text}</span>
                    {activePoll.userVoted && (
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(percentage)}%
                        </span>
                      </div>
                    )}
                  </Button>
                );
              })}
            </div>
            <div className="mt-3 text-sm text-muted-foreground text-center">
              <Users className="h-4 w-4 inline mr-1" />
              {activePoll.totalVotes} votes
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Quiz */}
      {activeQuiz && (
        <Card className="border-orange-500/50 bg-orange-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center">
                <Trophy className="h-4 w-4 mr-2" />
                Quick Quiz
              </span>
              <div className="flex items-center space-x-2">
                <Clock className="h-3 w-3" />
                <span className="text-sm font-mono">{activeQuiz.timeLeft}s</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium mb-4">{activeQuiz.question}</p>
            <div className="grid grid-cols-2 gap-2">
              {activeQuiz.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="p-3"
                  onClick={() => handleQuizAnswer(index)}
                  disabled={activeQuiz.timeLeft === 0}
                >
                  {option}
                </Button>
              ))}
            </div>
            <div className="mt-3 text-sm text-muted-foreground text-center">
              <Users className="h-4 w-4 inline mr-1" />
              {activeQuiz.participants} participating
            </div>
          </CardContent>
        </Card>
      )}

      {/* Engagement Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-base">
            <MessageSquare className="h-4 w-4 mr-2" />
            Engagement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">89%</div>
              <div className="text-muted-foreground">Active viewers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">7.2</div>
              <div className="text-muted-foreground">Avg. rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">156</div>
              <div className="text-muted-foreground">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">23</div>
              <div className="text-muted-foreground">Polls</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}