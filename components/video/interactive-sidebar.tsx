'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X,
  MessageCircle,
  Megaphone,
  Smile,
  BarChart3, 
  Trophy,
  ShoppingBag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { ChatSidebar } from '@/components/interactions/ChatSidebar';
import { EmojiReactionsSidebar } from '@/components/interactions/EmojiReactionsSidebar';
import { PollSidebar } from '@/components/interactions/PollSidebar';
import { QuizSidebar } from '@/components/interactions/QuizSidebar';
import { RatingSidebar } from '@/components/interactions/RatingSidebar';
import { UpdatesSidebar } from '@/components/interactions/UpdatesSidebar';

interface InteractiveSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  channelId: string;
  isLive?: boolean;
}

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
  isCommand?: boolean;
  emoji?: string;
}

interface ReactionCount {
  emoji: string;
  count: number;
  users: string[];
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  _id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  timeRemaining: number;
  isActive: boolean;
}

interface QuizOption {
  id: string;
  text: string;
}

interface Quiz {
  _id: string;
  question: string;
  options: QuizOption[];
  correctAnswer: string;
  timeLimit: number;
  timeRemaining: number;
  explanation?: string;
}

export function InteractiveSidebar({ isOpen, onClose, channelId, isLive }: InteractiveSidebarProps) {
  // Check if Clerk is properly configured
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isClerkConfigured = typeof publishableKey === 'string' && !publishableKey.includes('actual-bullfrog');
  
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeRating, setActiveRating] = useState(false);
  const [campusUpdates, setCampusUpdates] = useState<any[]>([]);
  const [onlineCount, setOnlineCount] = useState(2847);
  const [reactions, setReactions] = useState<ReactionCount[]>([
    { emoji: '👍', count: 234, users: ['Alex', 'Sarah', 'Mike'] },
    { emoji: '❤️', count: 189, users: ['Emma', 'John'] },
    { emoji: '😂', count: 156, users: ['Lisa', 'Tom', 'Anna', 'David'] },
    { emoji: '🔥', count: 98, users: ['Chris', 'Maya'] },
  ]);

  useEffect(() => {
    if (!isOpen) return;

    // Fetch campus updates for Campus Pulse Channel
    if (channelId === 'campus-pulse') {
      setCampusUpdates([
        {
          id: '1',
          title: 'Library Extended Hours',
          content: 'The main library will be open 24/7 during finals week to support student study needs.',
          category: 'announcement',
          priority: 'medium',
          location: 'Main Library',
          date: 'December 15, 2024',
          time: '12:00 AM',
          link: 'https://library.university.edu/hours',
          backgroundImage: 'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=800'
        },
        {
          id: '2',
          title: 'Campus Safety Alert',
          content: 'Please use alternate routes around the Science Building due to ongoing construction.',
          category: 'alert',
          priority: 'high',
          location: 'Science Building',
          backgroundImage: 'https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg?auto=compress&cs=tinysrgb&w=800'
        },
        {
          id: '3',
          title: 'Spring Registration Opens',
          content: 'Spring semester registration is now open for all students. Priority registration begins today.',
          category: 'academic',
          priority: 'medium',
          date: 'November 1, 2024',
          time: '9:00 AM',
          link: 'https://registration.university.edu',
          backgroundImage: 'https://images.pexels.com/photos/159490/yale-university-landscape-universities-schools-159490.jpeg?auto=compress&cs=tinysrgb&w=800'
        }
      ]);
    }

    // Simulate incoming messages
    const messageInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const mockMessage: ChatMessage = {
          id: Date.now().toString(),
          username: ['Alex Chen', 'Sarah Kim', 'Mike Johnson', 'Emma Davis'][Math.floor(Math.random() * 4)],
          message: [
            'Great content! 📚',
            'Can you explain that concept again?',
            'This is really helpful for my studies',
            'When will the recording be available?',
            'Love the interactive features! ⚡',
            'Question: How does this apply to real scenarios?'
          ][Math.floor(Math.random() * 6)],
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev.slice(-49), mockMessage]);
      }
    }, 3000);

    // Simulate polls and quizzes
    const interactionInterval = setInterval(() => {
      if (Math.random() > 0.8) {
        setActivePoll({
          _id: '1',
          question: 'How well do you understand today\'s topic?',
          options: [
            { id: 'a', text: 'Very well', votes: 234 },
            { id: 'b', text: 'Somewhat', votes: 567 },
            { id: 'c', text: 'Need review', votes: 123 },
            { id: 'd', text: 'Confused', votes: 45 }
          ],
          totalVotes: 969,
          timeRemaining: 30,
          isActive: true
        });
        setActiveTab('polls');
      } else if (Math.random() > 0.9) {
        setActiveQuiz({
          _id: '1',
          question: 'What is the primary function of mitochondria?',
          options: [
            { id: 'a', text: 'Energy production' },
            { id: 'b', text: 'Protein synthesis' },
            { id: 'c', text: 'DNA storage' },
            { id: 'd', text: 'Waste removal' }
          ],
          correctAnswer: 'a',
          timeLimit: 15,
          timeRemaining: 15,
          explanation: 'Mitochondria are known as the powerhouse of the cell because they produce ATP, the energy currency of cells.'
        });
        setActiveTab('quiz');
      }
    }, 15000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(interactionInterval);
    };
  }, [isOpen]);

  const handleSendMessage = (message: string) => {
    if (!message.trim() || !user) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      username: user.fullName || 'Anonymous',
      message: message,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const handlePollVote = (optionId: string) => {
    if (!activePoll) return;
    
    setActivePoll(prev => {
      if (!prev) return null;
      const newOptions = [...prev.options];
      const optionIndex = newOptions.findIndex(opt => opt.id === optionId);
      if (optionIndex !== -1) {
        newOptions[optionIndex].votes += 1;
      }
      return {
        ...prev,
        options: newOptions,
        totalVotes: prev.totalVotes + 1
      };
    });
  };

  const handleQuizAnswer = (answerId: string) => {
    // Handle quiz answer
    setTimeout(() => setActiveQuiz(null), 3000);
  };

  const handleReaction = (emoji: string) => {
    setReactions(prev => {
      const existingReaction = prev.find(r => r.emoji === emoji);
      if (existingReaction) {
        return prev.map(r => 
          r.emoji === emoji 
            ? { ...r, count: r.count + 1, users: [...r.users, user?.fullName || 'Anonymous'] }
            : r
        );
      } else {
        return [...prev, { emoji, count: 1, users: [user?.fullName || 'Anonymous'] }];
      }
    });
  };

  const handleRating = (rating: number, feedback?: string) => {
    console.log('Rating submitted:', rating, feedback);
    setActiveRating(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-background border-l border-border z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <img 
            src="/icon.svg" 
            alt="Tempest" 
            className="h-6 w-6"
          />
          <span className="font-semibold">Interactive Features</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-5 m-2">
            <TabsTrigger value="chat" className="text-xs">
              <MessageCircle className="h-3 w-3 mr-1" />
              Chat
            </TabsTrigger>
            {channelId === 'campus-pulse' && (
              <TabsTrigger value="updates" className="text-xs">
                <Megaphone className="h-3 w-3 mr-1" />
                Updates
              </TabsTrigger>
            )}
            <TabsTrigger value="reactions" className="text-xs">
              <Smile className="h-3 w-3 mr-1" />
              React
            </TabsTrigger>
            <TabsTrigger value="polls" className="text-xs relative">
              <BarChart3 className="h-3 w-3 mr-1" />
              Polls
              {activePoll && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </TabsTrigger>
            <TabsTrigger value="quiz" className="text-xs relative">
              <Trophy className="h-3 w-3 mr-1" />
              Quiz
              {activeQuiz && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              )}
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex flex-col m-0">
            <ChatSidebar
              messages={messages}
              onSendMessage={handleSendMessage}
              currentUser={user?.fullName || 'You'}
              viewerCount={onlineCount}
            />
          </TabsContent>

          {/* Campus Updates Tab (only for Campus Pulse Channel) */}
          {channelId === 'campus-pulse' && (
            <TabsContent value="updates" className="flex-1 flex flex-col m-0">
              <UpdatesSidebar
                updates={campusUpdates}
                autoRotate={true}
                rotationInterval={8000}
              />
            </TabsContent>
          )}

          {/* Reactions Tab */}
          <TabsContent value="reactions" className="flex-1 flex flex-col m-0">
            <EmojiReactionsSidebar
              reactions={reactions}
              onReact={handleReaction}
            />
          </TabsContent>

          {/* Polls Tab */}
          <TabsContent value="polls" className="flex-1 flex flex-col m-0">
            {activePoll ? (
              <PollSidebar
                poll={activePoll}
                onVote={handlePollVote}
              />
            ) : (
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No active polls</p>
                <p className="text-xs">Polls will appear here during the stream</p>
              </div>
            )}
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz" className="flex-1 flex flex-col m-0">
            {activeQuiz ? (
              <QuizSidebar
                quiz={activeQuiz}
                onAnswer={handleQuizAnswer}
                onClose={() => setActiveQuiz(null)}
              />
            ) : activeRating ? (
              <RatingSidebar
                onRate={handleRating}
                onClose={() => setActiveRating(false)}
                title="Rate this lecture"
              />
            ) : (
              <div className="text-center text-muted-foreground p-8">
                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No active quiz</p>
                <p className="text-xs mb-4">Quizzes will appear here during the stream</p>
                <Button 
                  onClick={() => setActiveRating(true)}
                  className="text-xs"
                  variant="outline"
                >
                  Rate Content
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}