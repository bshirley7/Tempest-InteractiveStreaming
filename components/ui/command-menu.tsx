'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BarChart3, HelpCircle, Star, Slash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandMenuProps {
  onCommandSelect: (command: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isLive?: boolean; // Different commands for live vs VOD
}

interface Command {
  name: string;
  icon: React.ReactNode;
  description: string;
  format: string;
  example: string;
  availableFor: 'all' | 'live' | 'vod';
}

const COMMANDS: Command[] = [
  {
    name: 'poll',
    icon: <BarChart3 className="w-4 h-4" />,
    description: 'Create a poll',
    format: '/poll Question? Option1, Option2, Option3',
    example: '/poll What should we learn next? React, Vue, Angular',
    availableFor: 'all'
  },
  {
    name: 'quiz',
    icon: <HelpCircle className="w-4 h-4" />,
    description: 'Create a quiz question',
    format: '/quiz Question? CorrectAnswer, WrongAnswer1, WrongAnswer2',
    example: '/quiz What hook manages state? useState, useEffect, useContext',
    availableFor: 'vod'
  },
  {
    name: 'rating',
    icon: <Star className="w-4 h-4" />,
    description: 'Create a rating prompt',
    format: '/rating Question or description',
    example: '/rating How would you rate this tutorial?',
    availableFor: 'vod'
  }
];

export function CommandMenu({ onCommandSelect, size = 'md', className, isLive = false }: CommandMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const availableCommands = COMMANDS.filter(cmd => 
    cmd.availableFor === 'all' || 
    (isLive && cmd.availableFor === 'live') || 
    (!isLive && cmd.availableFor === 'vod')
  );

  const handleCommandClick = (commandName: string) => {
    onCommandSelect(`/${commandName} `);
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
          <Slash className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 bg-black/95 border-white/10" side="top">
        <div className="p-4">
          <div className="mb-3">
            <h3 className="text-sm font-medium text-white mb-1">Slash Commands</h3>
            <p className="text-xs text-gray-400">
              Create interactive content with slash commands
            </p>
          </div>
          
          <div className="space-y-2">
            {availableCommands.map((command) => (
              <div
                key={command.name}
                className="group cursor-pointer rounded-lg p-3 hover:bg-white/5 transition-colors"
                onClick={() => handleCommandClick(command.name)}
              >
                <div className="flex items-start gap-3">
                  <div className="text-blue-400 mt-0.5">
                    {command.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium">/{command.name}</span>
                      <span className="text-xs text-gray-500">{command.description}</span>
                    </div>
                    <div className="text-xs text-gray-400 mb-1">
                      <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded">
                        {command.format}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Example: <span className="font-mono">{command.example}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 mt-4 pt-3">
            <div className="text-xs text-gray-500">
              <div className="mb-1">
                <strong>Tips:</strong>
              </div>
              <ul className="space-y-1 text-gray-400">
                <li>• Use commas to separate options</li>
                <li>• For quiz: first option is the correct answer</li>
                <li>• Commands won&apos;t appear in {isLive ? 'chat' : 'comments'}</li>
              </ul>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}