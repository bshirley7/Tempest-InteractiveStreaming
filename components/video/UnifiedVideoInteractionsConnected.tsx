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
import { EmojiPicker } from '@/components/ui/emoji-picker';
import { CommandMenu } from '@/components/ui/command-menu';
import { parseSlashCommand, isSlashCommand, canUseCommand } from '@/lib/utils/command-parser';
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
  isLive?: boolean; // For context-aware features
  currentVideoTime?: number; // Current time in seconds for time-based interactions
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
  isLive = false,
  currentVideoTime = 0,
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
  const [activeTab, setActiveTab] = useState<'chat' | 'polls' | 'quiz' | 'rating' | 'updates'>('chat');
  const [newMessage, setNewMessage] = useState('');
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, { answer: string; isCorrect: boolean; timestamp: number }>>({}); // Track user answers
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({}); // Track feedback display
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper function to parse time from MM:SS format to seconds
  const parseTimeToSeconds = (timeStr: string | number): number => {
    if (typeof timeStr === 'number') return timeStr;
    if (typeof timeStr !== 'string') return 0;
    
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10) || 0;
      const seconds = parseInt(parts[1], 10) || 0;
      return minutes * 60 + seconds;
    }
    return 0;
  };

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

  // Filter interactions by type and time-based triggering
  const activePolls = interactions.filter(i => i.type === 'poll' && i.is_active);
  const activeRatings = interactions.filter(i => i.type === 'rating' && i.is_active);
  
  // Time-based quiz filtering
  const activeQuizzes = interactions.filter(i => {
    if (i.type !== 'quiz' || !i.is_active) return false;
    
    // If no current video time, show all active quizzes (fallback)
    if (currentVideoTime === 0) return true;
    
    // Check if quiz should be triggered based on time
    const triggerTime = parseTimeToSeconds(i.metadata?.trigger_time || 0);
    const duration = parseTimeToSeconds(i.metadata?.duration || "0:30"); // Default 30 seconds
    
    return currentVideoTime >= triggerTime && currentVideoTime <= (triggerTime + duration);
  });
  
  // Get current quiz question (only show one at a time)
  const currentQuiz = activeQuizzes[currentQuizIndex] || null;

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle quiz progression - reset index when quizzes change
  useEffect(() => {
    if (activeQuizzes.length > 0 && currentQuizIndex >= activeQuizzes.length) {
      setCurrentQuizIndex(0);
    }
  }, [activeQuizzes.length, currentQuizIndex]);

  // Note: Removed auto-switch to quiz tab to allow manual navigation

  // Handle sending chat messages or commands
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.id) return;

    const messageText = newMessage.trim();

    // Check if it's a slash command
    if (isSlashCommand(messageText)) {
      await handleSlashCommand(messageText);
      return;
    }

    try {
      await sendMessage(user.id, messageText);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Handle slash commands
  const handleSlashCommand = async (commandText: string) => {
    const parsed = parseSlashCommand(commandText);
    
    if (!parsed) {
      console.error('Invalid command format');
      return;
    }

    if (!parsed.isValid) {
      console.error('Command error:', parsed.error);
      // TODO: Show error toast to user
      return;
    }

    // Check permissions
    if (!canUseCommand(`/${parsed.type}`, user?.publicMetadata?.role as string, isLive)) {
      console.error('Permission denied for command');
      // TODO: Show permission error to user
      return;
    }

    try {
      // Create interaction via API
      const interactionData = {
        type: parsed.type,
        title: parsed.question,
        description: parsed.question,
        options: parsed.options,
        correct_answer: parsed.correctAnswerIndex !== undefined ? parsed.options[parsed.correctAnswerIndex] : undefined,
        channel_id: channelId,
        content_id: contentId,
        is_active: true
      };

      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interactionData)
      });

      if (response.ok) {
        setNewMessage('');
        console.log(`${parsed.type} created successfully`);
        // TODO: Show success toast
      } else {
        console.error('Failed to create interaction');
        // TODO: Show error toast
      }
    } catch (error) {
      console.error('Error creating interaction:', error);
    }
  };

  // Handle emoji selection for messages
  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  // Handle quick reactions
  const handleQuickReaction = async (emoji: string) => {
    if (!user?.id) return;

    try {
      // Send as a reaction message
      await sendMessage(user.id, emoji, { message_type: 'reaction' });
      
      // Trigger floating emoji animation
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('emoji-reaction', {
          detail: { emoji }
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Failed to send reaction:', error);
    }
  };

  // Handle command selection from menu
  const handleCommandSelect = (command: string) => {
    setNewMessage(command);
  };

  // Handle poll voting
  const handlePollVote = async (pollId: string, optionId: string) => {
    if (!user?.id) return;

    try {
      await submitResponse(pollId, optionId);
    } catch (error) {
      console.error('Failed to submit poll vote:', error);
    }
  };

  // Handle quiz answer
  const handleQuizAnswer = async (quizId: string, answer: string) => {
    if (!user?.id) return;

    // Find the quiz to check correct answer
    const quiz = interactions.find(i => i.id === quizId);
    if (!quiz) return;

    const isCorrect = answer === quiz.correct_answer;
    
    // Store the answer and feedback
    setQuizAnswers(prev => ({
      ...prev,
      [quizId]: {
        answer,
        isCorrect,
        timestamp: Date.now()
      }
    }));

    // Show feedback immediately
    setShowFeedback(prev => ({ ...prev, [quizId]: true }));

    try {
      await submitResponse(quizId, answer);
      
      // Advance to next quiz question after showing feedback
      setTimeout(() => {
        setShowFeedback(prev => ({ ...prev, [quizId]: false }));
        if (currentQuizIndex < activeQuizzes.length - 1) {
          setCurrentQuizIndex(currentQuizIndex + 1);
        }
      }, 3000); // Show feedback for 3 seconds before moving to next question
    } catch (error) {
      console.error('Failed to submit quiz answer:', error);
    }
  };


  // Handle rating
  const handleRating = async (ratingId: string, rating: number) => {
    if (!user?.id) return;

    try {
      await submitResponse(ratingId, rating.toString());
    } catch (error) {
      console.error('Failed to submit rating:', error);
    }
  };

  // Tab configuration - context-aware labels
  const tabs = [
    {
      id: 'chat' as const,
      label: isLive ? 'Chat' : 'Comments',
      icon: MessageCircle,
      enabled: enabledFeatures.chat,
      badge: messages.length > 0 ? messages.length : undefined,
      color: 'text-blue-400'
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
      enabled: enabledFeatures.quiz && (canUseCommand('/quiz', user?.publicMetadata?.role as string, isLive)),
      badge: currentQuiz ? 'NEW' : (activeQuizzes.length > 1 ? activeQuizzes.length : undefined),
      color: 'text-purple-400'
    },
    {
      id: 'rating' as const,
      label: 'Rating',
      icon: Star,
      enabled: enabledFeatures.rating && !isLive, // Only available for VOD
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

  return (
    <TooltipProvider>
      <div className={cn(
        "fixed inset-y-0 z-50 flex flex-col bg-black/95 backdrop-blur-md border-l border-white/10 transition-transform duration-300 ease-out",
        position === 'right' ? 'right-0' : 'left-0',
        mode === 'sidebar' ? 'w-80' : 'w-72',
        isOpen ? 'translate-x-0' : position === 'right' ? 'translate-x-full' : '-translate-x-full'
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
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "text-xs px-1 py-0 h-4 min-w-4",
                          tab.id === 'quiz' && currentQuiz && activeTab !== 'quiz' 
                            ? "bg-purple-500 text-white animate-pulse" 
                            : ""
                        )}
                      >
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
            <div className="h-full flex flex-col animate-in fade-in duration-200">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No {isLive ? 'messages' : 'comments'} yet</p>
                    <p className="text-xs">
                      Be the first to {isLive ? 'say hello' : 'comment'}!
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    // Check if message is a single emoji reaction
                    const isEmojiReaction = message.message_type === 'reaction' || 
                      (message.message.length <= 2 && /^\p{Emoji}+$/u.test(message.message));
                    
                    return (
                      <div key={message.id} className="text-sm">
                        {isEmojiReaction ? (
                          // Emoji reaction display
                          <div className="flex items-center gap-2 py-1">
                            <span className="text-2xl animate-in zoom-in duration-300">
                              {message.message}
                            </span>
                            <span className="text-xs text-gray-500">
                              {message.user_id?.slice(-4) || 'User'}
                            </span>
                          </div>
                        ) : (
                          // Regular message display
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
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-1">
                  <EmojiPicker 
                    onEmojiSelect={handleEmojiSelect}
                    onQuickReaction={handleQuickReaction}
                    size="md"
                  />
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={isLive ? "Type a message..." : "Add a comment..."}
                    className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={!user}
                    maxLength={500}
                  />
                  <CommandMenu
                    onCommandSelect={handleCommandSelect}
                    isLive={isLive}
                    size="md"
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
                  <p className="text-xs text-gray-500 mt-2">
                    Sign in to {isLive ? 'chat' : 'comment'}
                  </p>
                )}
              </div>
            </div>
          )}


          {/* Polls Tab */}
          {activeTab === 'polls' && (
            <div className="p-4 animate-in fade-in duration-200">
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
                          const votes = poll.results?.response_counts?.[option.id || option] || 0;
                          const totalVotes = poll.results?.total_responses || 0;
                          const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                          
                          return (
                            <Button
                              key={index}
                              variant="outline"
                              className="w-full justify-between border-white/10 hover:border-white/30"
                              onClick={() => handlePollVote(poll.id, option.id || option)}
                              disabled={!user}
                            >
                              <span>{option.text || option}</span>
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
            <div className="p-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Quiz Question</h3>
                {activeQuizzes.length > 1 && (
                  <div className="text-xs text-gray-400">
                    {currentQuizIndex + 1} of {activeQuizzes.length}
                  </div>
                )}
              </div>
              
              {interactionsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : !currentQuiz ? (
                <div className="text-center text-gray-500 py-8">
                  <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No quiz questions at this time</p>
                  {currentVideoTime > 0 && (
                    <p className="text-xs mt-2">Quiz questions will appear at specific times in the video</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4 border-l-4 border-blue-500">
                    <h4 className="font-medium text-white mb-3">{currentQuiz.title}</h4>
                    <p className="text-gray-300 text-sm mb-4">{currentQuiz.question}</p>
                    
                    <div className="space-y-2">
                      {currentQuiz.options.map((option, index) => {
                        const userAnswer = quizAnswers[currentQuiz.id];
                        const isSelected = userAnswer?.answer === (option.id || option);
                        const isCorrect = (option.id || option) === currentQuiz.correct_answer;
                        const showingFeedback = showFeedback[currentQuiz.id];
                        
                        let buttonClass = "w-full justify-start border-white/10 hover:border-white/30 transition-colors";
                        let letterBgClass = "w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs mr-3";
                        
                        if (showingFeedback) {
                          if (isSelected) {
                            if (userAnswer?.isCorrect) {
                              buttonClass += " border-green-500 bg-green-500/20 text-green-200";
                              letterBgClass = "w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-xs mr-3 text-white";
                            } else {
                              buttonClass += " border-red-500 bg-red-500/20 text-red-200";
                              letterBgClass = "w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-xs mr-3 text-white";
                            }
                          } else if (isCorrect && !userAnswer?.isCorrect) {
                            buttonClass += " border-green-400 bg-green-400/10 text-green-300";
                            letterBgClass = "w-6 h-6 rounded-full bg-green-400 flex items-center justify-center text-xs mr-3 text-white";
                          }
                        } else {
                          buttonClass += " hover:bg-blue-600/20";
                        }
                        
                        return (
                          <Button
                            key={index}
                            variant="outline"
                            className={buttonClass}
                            onClick={() => handleQuizAnswer(currentQuiz.id, option.id || option)}
                            disabled={!user || showingFeedback}
                          >
                            <span className={letterBgClass}>
                              {showingFeedback && isSelected && userAnswer?.isCorrect ? '✓' : 
                               showingFeedback && isSelected && !userAnswer?.isCorrect ? '✗' :
                               showingFeedback && isCorrect && !userAnswer?.isCorrect ? '✓' :
                               String.fromCharCode(65 + index)}
                            </span>
                            {option.text || option}
                          </Button>
                        );
                      })}
                    </div>
                    
                    {/* Answer explanation */}
                    {showFeedback[currentQuiz.id] && currentQuiz.metadata?.explanation && (
                      <div className={cn(
                        "mt-4 p-3 rounded-lg border-l-4 animate-in slide-in-from-left duration-300",
                        quizAnswers[currentQuiz.id]?.isCorrect 
                          ? "bg-green-500/10 border-green-500 text-green-200" 
                          : "bg-blue-500/10 border-blue-500 text-blue-200"
                      )}>
                        <div className="flex items-start gap-2">
                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5",
                            quizAnswers[currentQuiz.id]?.isCorrect 
                              ? "bg-green-500 text-white" 
                              : "bg-blue-500 text-white"
                          )}>
                            {quizAnswers[currentQuiz.id]?.isCorrect ? '✓' : 'i'}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {quizAnswers[currentQuiz.id]?.isCorrect ? 'Correct!' : 'Explanation:'}
                            </p>
                            <p className="text-xs mt-1 opacity-90">
                              {currentQuiz.metadata.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                      <div>
                        <p>Responses: {currentQuiz.results?.total_responses || 0}</p>
                        {currentQuiz.results?.accuracy_rate && (
                          <p>Accuracy: {currentQuiz.results.accuracy_rate.toFixed(1)}%</p>
                        )}
                      </div>
                      
                      {currentQuiz.metadata?.trigger_time && (
                        <div className="text-right">
                          <p>Time: {typeof currentQuiz.metadata.trigger_time === 'string' ? currentQuiz.metadata.trigger_time : (() => {
                            const time = parseTimeToSeconds(currentQuiz.metadata.trigger_time);
                            const minutes = Math.floor(time / 60);
                            const seconds = time % 60;
                            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
                          })()}</p>
                        </div>
                      )}
                    </div>
                    
                    {activeQuizzes.length > 1 && currentQuizIndex < activeQuizzes.length - 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3 text-gray-400 hover:text-white"
                        onClick={() => setCurrentQuizIndex(currentQuizIndex + 1)}
                      >
                        Skip to next question <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
              {!user && (
                <p className="text-xs text-gray-500 mt-4">Sign in to participate</p>
              )}
            </div>
          )}

          {/* Rating Tab */}
          {activeTab === 'rating' && (
            <div className="p-4 animate-in fade-in duration-200">
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
            <div className="p-4 animate-in fade-in duration-200">
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