"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Send, MessageSquare, Users, Smile } from "lucide-react"
import { cn } from "@/lib/utils"
import { overlayDesign } from "@/lib/overlay-design"

interface ChatMessage {
  id: string
  username: string
  message: string
  timestamp: number
  isCommand?: boolean
  emoji?: string
}

interface ChatSidebarProps {
  messages?: ChatMessage[]
  onSendMessage?: (message: string) => void
  onClose?: () => void
  currentUser?: string
  viewerCount?: number
  className?: string
}

export function ChatSidebar({ 
  messages = [], 
  onSendMessage, 
  onClose, 
  currentUser = "You",
  viewerCount = 1247,
  className 
}: ChatSidebarProps) {
  const [messageInput, setMessageInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!messageInput.trim() || !onSendMessage) return
    
    onSendMessage(messageInput.trim())
    setMessageInput("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const isCommandMessage = (message: string) => {
    return message.startsWith('!') || message.includes('voted') || message.includes('rated')
  }

  const getMessageColor = (username: string) => {
    const colors = [
      'text-blue-400', 'text-green-400', 'text-yellow-400', 
      'text-purple-400', 'text-pink-400', 'text-indigo-400',
      'text-red-400', 'text-orange-400', 'text-cyan-400'
    ]
    
    let hash = 0
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={overlayDesign.animation.smooth}
        className={cn("h-full flex flex-col", className)}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 shadow-lg shadow-purple-500/30">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Live Chat</h3>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Users className="w-3 h-3" />
                <span>{viewerCount.toLocaleString()} viewers</span>
              </div>
            </div>
          </div>
          {onClose && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={onClose}
              className="rounded-full p-1 hover:bg-white/10 transition-colors"
            >
              <X className="w-3 h-3 text-gray-300" />
            </Button>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "group",
                    msg.isCommand && "bg-blue-500/10 rounded-lg p-2 border border-blue-500/20"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "text-xs font-medium",
                          msg.username === currentUser ? "text-green-400" : getMessageColor(msg.username)
                        )}>
                          {msg.username}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(msg.timestamp)}
                        </span>
                      </div>
                      <p className={cn(
                        "text-sm break-words",
                        msg.isCommand ? "text-blue-300 font-medium" : "text-gray-200"
                      )}>
                        {msg.emoji && <span className="mr-1">{msg.emoji}</span>}
                        {msg.message}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No messages yet</p>
                <p className="text-xs text-gray-600 mt-1">Be the first to say hello!</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chat Commands Help */}
        <div className="px-4 py-2 border-t border-white/10 bg-gray-900/50">
          <p className="text-xs text-gray-500 mb-1">Chat Commands:</p>
          <div className="flex flex-wrap gap-2">
            {['!poll', '!quiz', '!rate', '!react 👍'].map((command) => (
              <span
                key={command}
                className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded"
              >
                {command}
              </span>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type a message..."
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 pr-10"
                maxLength={200}
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700"
                onClick={() => {
                  // Add emoji picker functionality here
                }}
              >
                <Smile className="w-4 h-4 text-gray-400" />
              </Button>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Character count */}
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              {currentUser} • Online
            </p>
            <span className={cn(
              "text-xs",
              messageInput.length > 180 ? "text-red-400" : "text-gray-500"
            )}>
              {messageInput.length}/200
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}