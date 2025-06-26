'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InteractionManager, useInteractionManager } from '@/components/overlays/InteractionManager';
import { 
  MessageSquare,
  BarChart3,
  Star,
  Smile,
  Play,
  Pause
} from 'lucide-react';
import { 
  Poll, 
  Quiz, 
  EmojiReaction, 
  EmojiType,
  QuizResults,
  PollResults
} from '@/lib/types';

export function InteractiveVideoExample() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [recentReactions, setRecentReactions] = useState<EmojiReaction[]>([]);
  const [userRating, setUserRating] = useState(0);
  
  const {
    interactions,
    removeInteraction,
    showPoll,
    showQuiz,
    showEmojiReactions,
    showRating,
  } = useInteractionManager();

  // Simulate video progress
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Simulate triggered interactions at specific timestamps
  useEffect(() => {
    // Show poll at 30 seconds
    if (currentTime === 30 && isPlaying) {
      handleShowPoll();
    }
    
    // Show quiz at 90 seconds
    if (currentTime === 90 && isPlaying) {
      handleShowQuiz();
    }
  }, [currentTime, isPlaying]);

  // Example poll data
  const handleShowPoll = () => {
    const poll: Poll = {
      id: 'poll-1',
      question: 'What do you think about this topic?',
      options: [
        { id: 'opt1', text: 'Very interesting!' },
        { id: 'opt2', text: 'Somewhat useful' },
        { id: 'opt3', text: 'Could be better' },
        { id: 'opt4', text: 'Not relevant' },
      ],
      expiresAt: new Date(Date.now() + 30000), // 30 seconds from now
      createdAt: new Date(),
      isActive: true,
      allowMultipleVotes: false,
      results: {
        totalVotes: 142,
        options: [
          { id: 'opt1', votes: 67 },
          { id: 'opt2', votes: 45 },
          { id: 'opt3', votes: 20 },
          { id: 'opt4', votes: 10 },
        ]
      }
    };

    showPoll(poll);
  };

  // Example quiz data
  const handleShowQuiz = () => {
    const quiz: Quiz = {
      id: 'quiz-1',
      title: 'Quick Knowledge Check',
      description: 'Test your understanding of the material',
      questions: [
        {
          id: 'q1',
          question: 'What is the main benefit of this approach?',
          answers: [
            { id: 'a1', text: 'Improved efficiency' },
            { id: 'a2', text: 'Cost reduction' },
            { id: 'a3', text: 'Better user experience' },
            { id: 'a4', text: 'All of the above' },
          ],
          correctAnswer: 'a4',
          points: 10,
          explanation: 'This approach provides multiple benefits including efficiency, cost savings, and improved user experience.'
        },
        {
          id: 'q2',
          question: 'Which factor is most important for success?',
          answers: [
            { id: 'b1', text: 'Planning' },
            { id: 'b2', text: 'Execution' },
            { id: 'b3', text: 'Monitoring' },
            { id: 'b4', text: 'Adaptation' },
          ],
          correctAnswer: 'b1',
          points: 10,
          explanation: 'While all factors are important, proper planning sets the foundation for success.'
        }
      ],
      timeLimit: 120, // 2 minutes
      passingScore: 15,
      createdAt: new Date(),
      isActive: true
    };

    showQuiz(quiz);
  };

  // Handle poll vote
  const handlePollVote = (pollId: string, optionId: string) => {
    console.log('Poll vote:', { pollId, optionId });
    // In a real app, send to backend
  };

  // Handle quiz answer
  const handleQuizAnswer = (quizId: string, questionId: string, answerId: string) => {
    console.log('Quiz answer:', { quizId, questionId, answerId });
    // In a real app, send to backend
  };

  // Handle quiz completion
  const handleQuizComplete = (quizId: string, results: QuizResults) => {
    console.log('Quiz completed:', { quizId, results });
    // In a real app, send results to backend
    alert(`Quiz completed! Score: ${results.score}/${results.totalScore}`);
  };

  // Handle emoji reaction
  const handleEmojiReact = (emoji: EmojiType) => {
    const reaction: EmojiReaction = {
      id: Math.random().toString(36).substr(2, 9),
      emoji,
      timestamp: new Date(),
      userId: 'current-user',
    };
    
    setRecentReactions(prev => [...prev.slice(-9), reaction]);
    console.log('Emoji reaction:', reaction);
    // In a real app, send to backend
  };

  // Handle rating
  const handleRating = (rating: number) => {
    setUserRating(rating);
    console.log('Rating submitted:', rating);
    // In a real app, send to backend
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="glass border-white/10 shadow-strong">
        <CardHeader>
          <CardTitle className="gradient-text">Interactive Video Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mock Video Player */}
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/20 to-brand-blue/20 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">🎬</div>
                <div className="text-xl font-semibold mb-2">Sample Video Content</div>
                <div className="text-sm opacity-75">
                  Interactive features will appear during playback
                </div>
              </div>
            </div>
            
            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                
                <div className="text-white text-sm">
                  {formatTime(currentTime)} / 2:30
                </div>
                
                <div className="flex-1 bg-white/20 rounded-full h-1">
                  <div 
                    className="bg-brand-gradient h-1 rounded-full transition-all duration-300"
                    style={{ width: `${(currentTime / 150) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Manual Interaction Triggers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={handleShowPoll}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <BarChart3 className="h-4 w-4" />
              Show Poll
            </Button>
            
            <Button
              onClick={handleShowQuiz}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              <MessageSquare className="h-4 w-4" />
              Show Quiz
            </Button>
            
            <Button
              onClick={() => showEmojiReactions()}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
            >
              <Smile className="h-4 w-4" />
              React
            </Button>
            
            <Button
              onClick={() => showRating()}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <Star className="h-4 w-4" />
              Rate
            </Button>
          </div>

          {/* Status Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="glass rounded-lg p-3 border-white/10">
              <div className="text-muted-foreground">Active Interactions</div>
              <div className="text-lg font-semibold text-foreground">
                {interactions.length}
              </div>
            </div>
            
            <div className="glass rounded-lg p-3 border-white/10">
              <div className="text-muted-foreground">Recent Reactions</div>
              <div className="text-lg font-semibold text-foreground">
                {recentReactions.length}
              </div>
            </div>
            
            <div className="glass rounded-lg p-3 border-white/10">
              <div className="text-muted-foreground">Your Rating</div>
              <div className="text-lg font-semibold text-foreground">
                {userRating > 0 ? `${userRating}/5 ⭐` : 'Not rated'}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Press play to start the demo. Interactive elements will appear automatically,
              or use the buttons above to trigger them manually.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Interaction Manager */}
      <InteractionManager
        activeInteractions={interactions}
        onPollVote={handlePollVote}
        onQuizAnswer={handleQuizAnswer}
        onQuizComplete={handleQuizComplete}
        onEmojiReact={handleEmojiReact}
        onRating={handleRating}
        onInteractionClose={removeInteraction}
        recentReactions={recentReactions}
        currentRating={userRating}
        averageRating={4.2}
        totalRatings={89}
        maxConcurrentInteractions={3}
      />
    </div>
  );
}