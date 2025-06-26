'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Heart, 
  Star, 
  BarChart3, 
  HelpCircle, 
  Bell,
  X,
  Send,
  ThumbsUp,
  Smile,
  ChevronRight,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Unified types for all interactions
interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
  color?: string;
}

interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  totalVotes: number;
  userVote?: string;
  timeLeft?: number;
}

interface Quiz {
  id: string;
  question: string;
  options: { id: string; text: string; correct?: boolean }[];
  explanation?: string;
  userAnswer?: string;
  showResults?: boolean;
}

interface EmojiReaction {
  emoji: string;
  count: number;
  label: string;
}

interface Update {
  id: string;
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
}

interface UnifiedVideoInteractionsProps {
  isOpen: boolean;
  onToggle: () => void;
  position?: 'right' | 'left';
  mode?: 'overlay' | 'sidebar';
  enabledFeatures?: {
    chat?: boolean;
    reactions?: boolean;
    polls?: boolean;
    quiz?: boolean;
    rating?: boolean;
    updates?: boolean;
  };
  viewerCount?: number;
  onClose?: () => void;
}

type ActiveTab = 'chat' | 'reactions' | 'polls' | 'quiz' | 'rating' | 'updates';

export function UnifiedVideoInteractions({
  isOpen,
  onToggle,
  position = 'right',
  mode = 'sidebar',
  enabledFeatures = {
    chat: true,
    reactions: true,
    polls: true,
    quiz: true,
    rating: true,
    updates: true
  },
  viewerCount = 0,
  onClose
}: UnifiedVideoInteractionsProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [reactions, setReactions] = useState<EmojiReaction[]>([
    { emoji: '👍', count: 245, label: 'Like' },
    { emoji: '❤️', count: 189, label: 'Love' },
    { emoji: '😂', count: 156, label: 'Laugh' },
    { emoji: '🤔', count: 89, label: 'Think' },
    { emoji: '🔥', count: 267, label: 'Fire' },
    { emoji: '👏', count: 198, label: 'Clap' }
  ]);
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [rating, setRating] = useState(0);
  const [updates, setUpdates] = useState<Update[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize sample data
  useEffect(() => {
    // Sample chat messages
    setChatMessages([
      { id: '1', user: 'Alex Chen', message: 'Great explanation! Really helpful.', timestamp: new Date(), color: '#3B82F6' },
      { id: '2', user: 'Sarah Kim', message: 'Can you go over that concept again?', timestamp: new Date(), color: '#10B981' },
      { id: '3', user: 'Mike Johnson', message: 'This is exactly what I needed to learn', timestamp: new Date(), color: '#F59E0B' },
    ]);

    // Sample poll
    setCurrentPoll({
      id: 'poll1',
      question: 'Which topic should we cover next?',
      options: [
        { id: 'a', text: 'Advanced JavaScript', votes: 45 },
        { id: 'b', text: 'React Hooks', votes: 67 },
        { id: 'c', text: 'Node.js Basics', votes: 32 },
        { id: 'd', text: 'Database Design', votes: 28 }
      ],
      totalVotes: 172,
      timeLeft: 120
    });

    // Sample quiz
    setCurrentQuiz({
      id: 'quiz1',
      question: 'What is the correct way to handle state in React?',
      options: [
        { id: 'a', text: 'Using this.state directly', correct: false },
        { id: 'b', text: 'Using useState hook', correct: true },
        { id: 'c', text: 'Using global variables', correct: false },
        { id: 'd', text: 'Using localStorage', correct: false }
      ],
      explanation: 'The useState hook is the modern and recommended way to handle component state in React functional components.'
    });

    // Sample updates
    setUpdates([
      {
        id: '1',
        title: 'New Course Available',
        content: 'Advanced React Patterns course is now live!',
        priority: 'high',
        timestamp: new Date()
      },
      {
        id: '2',
        title: 'Office Hours',
        content: 'Join us every Friday at 3 PM for Q&A sessions.',
        priority: 'medium',
        timestamp: new Date()
      }
    ]);
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        user: 'You',
        message: newMessage.trim(),
        timestamp: new Date(),
        color: '#8B5CF6'
      };
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const handleReaction = (emoji: string) => {
    setReactions(prev => 
      prev.map(r => 
        r.emoji === emoji 
          ? { ...r, count: r.count + 1 }
          : r
      )
    );
  };

  const handlePollVote = (optionId: string) => {
    if (!currentPoll || currentPoll.userVote) return;
    
    setCurrentPoll(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        userVote: optionId,
        options: prev.options.map(opt => 
          opt.id === optionId 
            ? { ...opt, votes: opt.votes + 1 }
            : opt
        ),
        totalVotes: prev.totalVotes + 1
      };
    });
  };

  const handleQuizAnswer = (optionId: string) => {
    if (!currentQuiz || currentQuiz.userAnswer) return;
    
    setCurrentQuiz(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        userAnswer: optionId,
        showResults: true
      };
    });
  };

  const getEnabledTabs = () => {
    const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [];
    
    if (enabledFeatures.chat) {
      tabs.push({ 
        id: 'chat', 
        label: 'Chat', 
        icon: <MessageCircle className="w-4 h-4" />,
        badge: chatMessages.length 
      });
    }
    if (enabledFeatures.reactions) {
      tabs.push({ 
        id: 'reactions', 
        label: 'Reactions', 
        icon: <Heart className="w-4 h-4" />,
        badge: reactions.reduce((sum, r) => sum + r.count, 0)
      });
    }
    if (enabledFeatures.polls) {
      tabs.push({ 
        id: 'polls', 
        label: 'Polls', 
        icon: <BarChart3 className="w-4 h-4" /> 
      });
    }
    if (enabledFeatures.quiz) {
      tabs.push({ 
        id: 'quiz', 
        label: 'Quiz', 
        icon: <HelpCircle className="w-4 h-4" /> 
      });
    }
    if (enabledFeatures.rating) {
      tabs.push({ 
        id: 'rating', 
        label: 'Rating', 
        icon: <Star className="w-4 h-4" /> 
      });
    }
    if (enabledFeatures.updates) {
      tabs.push({ 
        id: 'updates', 
        label: 'Updates', 
        icon: <Bell className="w-4 h-4" />,
        badge: updates.filter(u => u.priority === 'high').length
      });
    }
    
    return tabs;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">{viewerCount} viewers</span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-xs font-medium"
                      style={{ color: msg.color }}
                    >
                      {msg.user}
                    </span>
                    <span className="text-xs text-gray-400">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{msg.message}</p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <Button onClick={handleSendMessage} size="sm">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        );

      case 'reactions':
        return (
          <div className="p-4 space-y-4">
            <h3 className="text-lg font-semibold">Live Reactions</h3>
            <div className="grid grid-cols-2 gap-3">
              {reactions.map((reaction) => (
                <button
                  key={reaction.emoji}
                  onClick={() => handleReaction(reaction.emoji)}
                  className="flex items-center gap-2 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <span className="text-2xl">{reaction.emoji}</span>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{reaction.label}</span>
                    <span className="text-xs text-gray-400">{reaction.count}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'polls':
        return (
          <div className="p-4 space-y-4">
            {currentPoll && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Live Poll</h3>
                  {currentPoll.timeLeft && (
                    <Badge variant="outline" className="text-xs">
                      {Math.floor(currentPoll.timeLeft / 60)}:{(currentPoll.timeLeft % 60).toString().padStart(2, '0')}
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-gray-300">{currentPoll.question}</p>
                
                <div className="space-y-2">
                  {currentPoll.options.map((option) => {
                    const percentage = currentPoll.totalVotes > 0 
                      ? (option.votes / currentPoll.totalVotes) * 100 
                      : 0;
                    const isSelected = currentPoll.userVote === option.id;
                    
                    return (
                      <button
                        key={option.id}
                        onClick={() => handlePollVote(option.id)}
                        disabled={!!currentPoll.userVote}
                        className={cn(
                          "w-full p-3 rounded-lg text-left transition-all relative overflow-hidden",
                          isSelected 
                            ? "bg-blue-500/30 border border-blue-400" 
                            : "bg-white/10 hover:bg-white/20",
                          currentPoll.userVote && "cursor-not-allowed"
                        )}
                      >
                        <div 
                          className="absolute inset-0 bg-blue-500/20 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                        <div className="relative flex justify-between items-center">
                          <span className="text-sm">{option.text}</span>
                          {currentPoll.userVote && (
                            <span className="text-xs text-gray-400">
                              {percentage.toFixed(1)}% ({option.votes})
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                <p className="text-xs text-gray-400 text-center">
                  {currentPoll.totalVotes} total votes
                </p>
              </>
            )}
          </div>
        );

      case 'quiz':
        return (
          <div className="p-4 space-y-4">
            {currentQuiz && (
              <>
                <h3 className="text-lg font-semibold">Quiz Question</h3>
                <p className="text-sm text-gray-300">{currentQuiz.question}</p>
                
                <div className="space-y-2">
                  {currentQuiz.options.map((option) => {
                    const isSelected = currentQuiz.userAnswer === option.id;
                    const isCorrect = option.correct;
                    const showResults = currentQuiz.showResults;
                    
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleQuizAnswer(option.id)}
                        disabled={!!currentQuiz.userAnswer}
                        className={cn(
                          "w-full p-3 rounded-lg text-left transition-all",
                          showResults && isCorrect && "bg-green-500/30 border border-green-400",
                          showResults && !isCorrect && isSelected && "bg-red-500/30 border border-red-400",
                          !showResults && "bg-white/10 hover:bg-white/20",
                          currentQuiz.userAnswer && "cursor-not-allowed"
                        )}
                      >
                        <span className="text-sm">{option.text}</span>
                        {showResults && isCorrect && (
                          <span className="ml-2 text-green-400">✓</span>
                        )}
                        {showResults && !isCorrect && isSelected && (
                          <span className="ml-2 text-red-400">✗</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {currentQuiz.showResults && currentQuiz.explanation && (
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <p className="text-sm text-blue-300">{currentQuiz.explanation}</p>
                  </div>
                )}
              </>
            )}
          </div>
        );

      case 'rating':
        return (
          <div className="p-4 space-y-4">
            <h3 className="text-lg font-semibold">Rate This Video</h3>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1"
                >
                  <Star 
                    className={cn(
                      "w-8 h-8 transition-colors",
                      star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
                    )}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-gray-300">
                You rated this video {rating} star{rating !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        );

      case 'updates':
        return (
          <div className="p-4 space-y-4">
            <h3 className="text-lg font-semibold">Updates</h3>
            <div className="space-y-3">
              {updates.map((update) => (
                <div 
                  key={update.id}
                  className={cn(
                    "p-3 rounded-lg border-l-4",
                    update.priority === 'high' && "bg-red-500/20 border-red-400",
                    update.priority === 'medium' && "bg-yellow-500/20 border-yellow-400",
                    update.priority === 'low' && "bg-blue-500/20 border-blue-400"
                  )}
                >
                  <h4 className="text-sm font-medium">{update.title}</h4>
                  <p className="text-xs text-gray-300 mt-1">{update.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {update.timestamp.toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-black/90 backdrop-blur-md border-l border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-xl font-bold text-white">Interactions</h2>
        <Button
          onClick={onClose || onToggle}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs - Icon Only with Tooltips */}
      <TooltipProvider>
        <div className="flex justify-center border-b border-white/10 px-2">
          {getEnabledTabs().map((tab) => (
            <Tooltip key={tab.id} delayDuration={300}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative flex items-center justify-center w-12 h-12 m-1 rounded-lg transition-all duration-200",
                    activeTab === tab.id
                      ? "bg-blue-500/30 text-white border border-blue-400"
                      : "text-gray-400 hover:text-white hover:bg-white/10"
                  )}
                >
                  {tab.icon}
                  {tab.badge && tab.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent 
                side="bottom" 
                className="bg-black/90 text-white border-white/20"
              >
                {tab.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      {/* Content */}
      <div className="flex-1 overflow-hidden text-white">
        {renderTabContent()}
      </div>
    </div>
  );

  if (mode === 'overlay') {
    return isOpen ? (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-black/90 backdrop-blur-md rounded-lg w-full max-w-md h-3/4 flex flex-col">
          {sidebarContent}
        </div>
      </div>
    ) : null;
  }

  return (
    <div 
      className={cn(
        "fixed top-0 h-full w-72 transition-transform duration-300 ease-out z-40",
        position === 'right' ? "right-0" : "left-0",
        isOpen ? "translate-x-0" : position === 'right' ? "translate-x-full" : "-translate-x-full"
      )}
    >
      {sidebarContent}
    </div>
  );
}