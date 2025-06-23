'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Send, 
  Users, 
  Smile, 
  Gift,
  Crown,
  Star
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface ChatMessage {
  id: string;
  user: {
    name: string;
    avatar: string;
    role: 'student' | 'faculty' | 'admin' | 'moderator';
  };
  message: string;
  timestamp: Date;
  type: 'message' | 'system' | 'poll' | 'gift';
}

interface ChatSidebarProps {
  channelId: string | null;
}

export function ChatSidebar({ channelId }: ChatSidebarProps) {
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineCount, setOnlineCount] = useState(2847);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate incoming messages
    const interval = setInterval(() => {
      if (channelId && Math.random() > 0.7) {
        const mockMessage: ChatMessage = {
          id: Date.now().toString(),
          user: {
            name: ['Alex Chen', 'Sarah Kim', 'Mike Johnson', 'Emma Davis'][Math.floor(Math.random() * 4)],
            avatar: `https://images.pexels.com/photos/${1000000 + Math.floor(Math.random() * 1000000)}/pexels-photo-${1000000 + Math.floor(Math.random() * 1000000)}.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop`,
            role: ['student', 'faculty', 'admin'][Math.floor(Math.random() * 3)] as any
          },
          message: [
            'Great presentation!',
            'Can you explain that formula again?',
            'This is really helpful, thanks!',
            'When will the recording be available?',
            'Love the interactive features',
            'Question: How does this apply to real-world scenarios?'
          ][Math.floor(Math.random() * 6)],
          timestamp: new Date(),
          type: 'message'
        };
        setMessages(prev => [...prev.slice(-49), mockMessage]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [channelId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      user: {
        name: user.fullName || 'Anonymous',
        avatar: user.imageUrl || '',
        role: 'student'
      },
      message: newMessage,
      timestamp: new Date(),
      type: 'message'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case 'faculty':
        return <Star className="h-3 w-3 text-blue-500" />;
      case 'moderator':
        return <Badge variant="secondary" className="text-xs px-1">MOD</Badge>;
      default:
        return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'faculty':
        return 'text-blue-600 dark:text-blue-400';
      case 'moderator':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-foreground';
    }
  };

  if (!channelId) {
    return (
      <Card className="h-[calc(100vh-8rem)]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Select a channel to join the chat</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[calc(100vh-8rem)] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center">
            <MessageCircle className="h-4 w-4 mr-2" />
            Live Chat
          </span>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{onlineCount.toLocaleString()}</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col">
        {/* Messages */}
        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
          <div className="space-y-3 pb-4">
            {messages.map((msg) => (
              <div key={msg.id} className="flex items-start space-x-2">
                <Avatar className="h-6 w-6 flex-shrink-0">
                  <AvatarImage src={msg.user.avatar} />
                  <AvatarFallback className="text-xs">
                    {msg.user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1 mb-1">
                    <span className={`text-xs font-medium truncate ${getRoleColor(msg.user.role)}`}>
                      {msg.user.name}
                    </span>
                    {getRoleIcon(msg.user.role)}
                    <span className="text-xs text-muted-foreground">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground break-words">
                    {msg.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Chat input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button size="sm" onClick={handleSendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Chat actions */}
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="h-6 px-2">
                <Smile className="h-3 w-3 mr-1" />
                Emojis
              </Button>
              <Button variant="ghost" size="sm" className="h-6 px-2">
                <Gift className="h-3 w-3 mr-1" />
                Gifts
              </Button>
            </div>
            <span>{onlineCount.toLocaleString()} online</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}