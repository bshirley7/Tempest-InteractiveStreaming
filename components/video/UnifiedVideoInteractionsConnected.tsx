'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
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
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useInteractions } from '@/lib/hooks/useInteractions';
import { useChat } from '@/lib/hooks/useChat';
import type { Interaction, ChatMessage } from '@/lib/types';

interface UnifiedVideoInteractionsConnectedProps {
  channelId?: string;
  contentId?: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  position?: 'right' | 'left';
  mode?: 'overlay' | 'sidebar';
  viewerCount?: number;
  enabledFeatures?: {
    chat?: boolean;
    reactions?: boolean;
    polls?: boolean;
    quiz?: boolean;
    rating?: boolean;
    updates?: boolean;
  };
}

export function UnifiedVideoInteractionsConnected({
  channelId,
  contentId,
  isOpen,
  onToggle,
  onClose,
  position = 'right',
  mode = 'sidebar',
  viewerCount = 0,
  enabledFeatures = {
    chat: true,
    reactions: true,
    polls: true,
    quiz: true,
    rating: true,
    updates: true
  }
}: UnifiedVideoInteractionsConnectedProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'chat' | 'reactions' | 'polls' | 'quiz' | 'rating' | 'updates'>('chat');
  const [newMessage, setNewMessage] = useState('');
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Real-time hooks
  const { interactions, loading: interactionsLoading, submitResponse } = useInteractions({
    channelId,
    contentId,
    isActive: true
  });

  const { messages, loading: chatLoading, sendMessage, isConnected } = useChat({
    channelId,
    contentId,
    limit: 100
  });

  // Filter interactions by type
  const activePolls = interactions.filter(i => i.type === 'poll' && i.is_active);
  const activeQuizzes = interactions.filter(i => i.type === 'quiz' && i.is_active);
  const activeRatings = interactions.filter(i => i.type === 'rating' && i.is_active);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending chat messages
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.id) return;

    try {
      await sendMessage(user.id, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Handle poll voting
  const handlePollVote = async (pollId: string, optionId: string) => {
    if (!user?.id) return;

    try {
      await submitResponse(pollId, user.id, optionId);
    } catch (error) {
      console.error('Failed to submit poll vote:', error);
    }
  };

  // Handle quiz answer
  const handleQuizAnswer = async (quizId: string, answer: string) => {
    if (!user?.id) return;

    try {
      await submitResponse(quizId, user.id, answer);
    } catch (error) {
      console.error('Failed to submit quiz answer:', error);
    }
  };

  // Handle reaction
  const handleReaction = async (emoji: string) => {
    if (!user?.id) return;

    try {
      // Find or create a reaction interaction
      let reactionInteraction = interactions.find(i => i.type === 'reaction' && i.is_active);
      
      if (reactionInteraction) {
        await submitResponse(reactionInteraction.id, user.id, emoji);
        setSelectedReaction(emoji);
        
        // Auto-clear reaction after animation
        setTimeout(() => setSelectedReaction(null), 2000);
      }
    } catch (error) {
      console.error('Failed to send reaction:', error);
    }
  };

  // Handle rating
  const handleRating = async (ratingId: string, rating: number) => {
    if (!user?.id) return;

    try {
      await submitResponse(ratingId, user.id, rating.toString());
    } catch (error) {
      console.error('Failed to submit rating:', error);
    }
  };

  // Tab configuration
  const tabs = [
    {
      id: 'chat' as const,
      label: 'Chat',
      icon: MessageCircle,
      enabled: enabledFeatures.chat,
      badge: messages.length > 0 ? messages.length : undefined,
      color: 'text-blue-400'
    },
    {
      id: 'reactions' as const,
      label: 'Reactions',
      icon: Heart,
      enabled: enabledFeatures.reactions,
      badge: selectedReaction ? '!' : undefined,
      color: 'text-red-400'
    },
    {
      id: 'polls' as const,
      label: 'Polls',
      icon: BarChart3,
      enabled: enabledFeatures.polls,
      badge: activePolls.length > 0 ? activePolls.length : undefined,
      color: 'text-green-400'
    },
    {
      id: 'quiz' as const,
      label: 'Quiz',
      icon: HelpCircle,
      enabled: enabledFeatures.quiz,
      badge: activeQuizzes.length > 0 ? activeQuizzes.length : undefined,
      color: 'text-purple-400'
    },
    {
      id: 'rating' as const,
      label: 'Rating',
      icon: Star,
      enabled: enabledFeatures.rating,
      badge: activeRatings.length > 0 ? activeRatings.length : undefined,
      color: 'text-yellow-400'
    },
    {
      id: 'updates' as const,
      label: 'Updates',
      icon: Bell,
      enabled: enabledFeatures.updates,
      badge: undefined,
      color: 'text-indigo-400'
    }
  ].filter(tab => tab.enabled);

  if (!isOpen) return null;

  return (
    <TooltipProvider>
      <div className={cn(
        "fixed inset-y-0 z-50 flex flex-col bg-black/95 backdrop-blur-md border-l border-white/10",
        position === 'right' ? 'right-0' : 'left-0',
        mode === 'sidebar' ? 'w-80' : 'w-72'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Interactions</h2>
          <div className="flex items-center gap-2">
            {isConnected && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 p-2 border-b border-white/10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "relative flex items-center gap-1 text-xs px-2 py-1 h-8",
                      activeTab === tab.id 
                        ? "bg-white/20 text-white" 
                        : "text-gray-400 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <Icon className={cn("w-3 h-3", activeTab === tab.id ? "text-white" : tab.color)} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {tab.badge && (
                      <Badge variant="secondary" className="text-xs px-1 py-0 h-4 min-w-4">
                        {tab.badge}
                      </Badge>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tab.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-xs">Be the first to say hello!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="text-sm">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                          {message.user_id?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-white text-xs truncate">
                              User {message.user_id?.slice(-4) || 'Unknown'}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {new Date(message.created_at).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm break-words">{message.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={!user}
                    maxLength={500}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || !user}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                {!user && (
                  <p className="text-xs text-gray-500 mt-2">Sign in to chat</p>
                )}
              </div>
            </div>
          )}

          {/* Reactions Tab */}
          {activeTab === 'reactions' && (
            <div className="p-4">
              <h3 className="font-semibold text-white mb-4">Quick Reactions</h3>
              <div className="grid grid-cols-4 gap-3">
                {['❤️', '👍', '👏', '😂', '😮', '🔥', '⭐', '💯'].map((emoji) => (
                  <Button
                    key={emoji}
                    variant="outline"
                    className={cn(
                      "aspect-square text-xl border-white/10 hover:border-white/30",
                      selectedReaction === emoji && "bg-white/20 border-white/50"
                    )}
                    onClick={() => handleReaction(emoji)}
                    disabled={!user}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
              {!user && (
                <p className="text-xs text-gray-500 mt-4">Sign in to react</p>
              )}
            </div>
          )}

          {/* Polls Tab */}
          {activeTab === 'polls' && (
            <div className="p-4">
              <h3 className="font-semibold text-white mb-4">Active Polls</h3>
              {interactionsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : activePolls.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No active polls</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activePolls.map((poll) => (
                    <div key={poll.id} className="bg-white/5 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-3">{poll.title}</h4>
                      <div className="space-y-2">
                        {poll.options.map((option, index) => {
                          const votes = poll.results?.response_counts?.[option] || 0;
                          const totalVotes = poll.results?.total_responses || 0;
                          const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                          
                          return (
                            <Button
                              key={index}
                              variant="outline"
                              className="w-full justify-between border-white/10 hover:border-white/30"
                              onClick={() => handlePollVote(poll.id, option)}
                              disabled={!user}
                            >
                              <span>{option}</span>
                              <span className="text-xs text-gray-400">
                                {votes} ({percentage.toFixed(0)}%)
                              </span>
                            </Button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Total votes: {poll.results?.total_responses || 0}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {!user && (
                <p className="text-xs text-gray-500 mt-4">Sign in to vote</p>
              )}
            </div>
          )}

          {/* Quiz Tab */}
          {activeTab === 'quiz' && (
            <div className="p-4">
              <h3 className="font-semibold text-white mb-4">Active Quizzes</h3>
              {interactionsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : activeQuizzes.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No active quizzes</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeQuizzes.map((quiz) => (
                    <div key={quiz.id} className="bg-white/5 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-3">{quiz.title}</h4>
                      <div className="space-y-2">
                        {quiz.options.map((option, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="w-full justify-start border-white/10 hover:border-white/30"
                            onClick={() => handleQuizAnswer(quiz.id, option)}
                            disabled={!user}
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                      <div className="mt-3 text-xs text-gray-400">
                        <p>Responses: {quiz.results?.total_responses || 0}</p>
                        {quiz.results?.accuracy_rate && (
                          <p>Accuracy: {quiz.results.accuracy_rate.toFixed(1)}%</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!user && (
                <p className="text-xs text-gray-500 mt-4">Sign in to participate</p>
              )}
            </div>
          )}

          {/* Rating Tab */}
          {activeTab === 'rating' && (
            <div className="p-4">
              <h3 className="font-semibold text-white mb-4">Rate Content</h3>
              {activeRatings.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No rating available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeRatings.map((rating) => (
                    <div key={rating.id} className="bg-white/5 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-3">{rating.title}</h4>
                      <div className="flex justify-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Button
                            key={star}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRating(rating.id, star)}
                            disabled={!user}
                            className="p-1"
                          >
                            <Star className="w-6 h-6 text-yellow-400 hover:fill-current" />
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!user && (
                <p className="text-xs text-gray-500 mt-4">Sign in to rate</p>
              )}
            </div>
          )}

          {/* Updates Tab */}
          {activeTab === 'updates' && (
            <div className="p-4">
              <h3 className="font-semibold text-white mb-4">Live Updates</h3>
              <div className="text-center text-gray-500 py-8">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No updates</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}