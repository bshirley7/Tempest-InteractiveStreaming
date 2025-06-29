'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onQuickReaction?: (emoji: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Popular emojis for quick access
const POPULAR_EMOJIS = [
  '👍', '❤️', '😂', '😮', '😢', '😡', '🔥', '👏', 
  '🎉', '💯', '🙌', '👌', '💪', '🙏', '✨', '⭐'
];

// Emoji categories
const EMOJI_CATEGORIES = {
  popular: {
    name: 'Popular',
    emojis: POPULAR_EMOJIS
  },
  smileys: {
    name: 'Smileys',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
      '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
      '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
      '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
      '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
      '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢'
    ]
  },
  gestures: {
    name: 'Gestures',
    emojis: [
      '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙',
      '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚',
      '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏'
    ]
  },
  hearts: {
    name: 'Hearts',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
      '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
      '💘', '💝', '💟', '♥️', '💯', '🔥', '✨', '⭐'
    ]
  },
  objects: {
    name: 'Objects',
    emojis: [
      '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉',
      '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱',
      '📱', '💻', '🖥️', '⌨️', '🖱️', '🖨️', '📷', '📹'
    ]
  }
};

export function EmojiPicker({ onEmojiSelect, onQuickReaction, size = 'md', className }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('popular');

  const handleEmojiClick = (emoji: string, isQuickReaction = false) => {
    if (isQuickReaction && onQuickReaction) {
      onQuickReaction(emoji);
    } else {
      onEmojiSelect(emoji);
    }
    setIsOpen(false);
  };

  const buttonSizeClass = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-10 w-10'
  }[size];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(buttonSizeClass, 'text-gray-400 hover:text-white hover:bg-white/10', className)}
        >
          <Smile className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-black/95 border-white/10" side="top">
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-white/5">
              {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
                <TabsTrigger 
                  key={key} 
                  value={key}
                  className="text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
              <TabsContent key={key} value={key} className="mt-4">
                {key === 'popular' && onQuickReaction && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-2">Quick Reactions</p>
                    <div className="grid grid-cols-8 gap-1">
                      {POPULAR_EMOJIS.slice(0, 8).map((emoji) => (
                        <Button
                          key={emoji}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-white/10 text-lg"
                          onClick={() => handleEmojiClick(emoji, true)}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                    <div className="border-t border-white/10 mt-3 pt-3">
                      <p className="text-xs text-gray-400 mb-2">Add to Message</p>
                    </div>
                  </div>
                )}
                
                <ScrollArea className="h-48">
                  <div className="grid grid-cols-8 gap-1">
                    {category.emojis.map((emoji) => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-white/10 text-lg"
                        onClick={() => handleEmojiClick(emoji)}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  );
}