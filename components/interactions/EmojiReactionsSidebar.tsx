"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X, Heart, Smile, ThumbsUp, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { overlayDesign } from "@/lib/overlay-design"

interface ReactionCount {
  emoji: string
  count: number
  users: string[]
}

interface EmojiReactionsSidebarProps {
  reactions: ReactionCount[]
  onReact: (emoji: string) => void
  onClose?: () => void
  className?: string
}

export function EmojiReactionsSidebar({ 
  reactions, 
  onReact, 
  onClose, 
  className 
}: EmojiReactionsSidebarProps) {
  const [recentReactions, setRecentReactions] = useState<Array<{id: string, emoji: string, timestamp: number}>>([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const popularEmojis = ["👍", "❤️", "😂", "😮", "👏", "🔥", "✨", "🎉"]
  const allEmojis = [
    "👍", "👎", "❤️", "💔", "😂", "😢", "😮", "😴", 
    "👏", "🙌", "🔥", "❄️", "✨", "💫", "🎉", "🎊",
    "💯", "💪", "👌", "✌️", "🤘", "🤞", "🙏", "👋"
  ]

  // Add animation for new reactions
  const addRecentReaction = (emoji: string) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newReaction = { id, emoji, timestamp: Date.now() }
    
    setRecentReactions(prev => [...prev, newReaction])
    
    // Remove after animation
    setTimeout(() => {
      setRecentReactions(prev => prev.filter(r => r.id !== id))
    }, 2000)
  }

  const handleReact = (emoji: string) => {
    onReact(emoji)
    addRecentReaction(emoji)
    
    // Auto-hide emoji picker after selection
    if (showEmojiPicker) {
      setShowEmojiPicker(false)
    }
  }

  const getTotalReactions = () => {
    return reactions.reduce((sum, reaction) => sum + reaction.count, 0)
  }

  const getTopReactions = () => {
    return reactions
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
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
            <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 shadow-lg shadow-yellow-500/30">
              <Smile className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Live Reactions</h3>
              <p className="text-xs text-gray-400">
                {getTotalReactions()} total reactions
              </p>
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

        {/* Quick Reactions */}
        <div className="p-4 border-b border-white/10">
          <h4 className="text-xs font-medium text-gray-400 mb-3">Quick React</h4>
          <div className="grid grid-cols-4 gap-2">
            {popularEmojis.map((emoji) => (
              <motion.button
                key={emoji}
                className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-xl"
                onClick={() => handleReact(emoji)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={overlayDesign.animation.spring}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
          
          {/* More Emojis Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="w-full mt-3 text-xs hover:bg-white/10"
          >
            <Plus className="w-3 h-3 mr-1" />
            {showEmojiPicker ? "Show Less" : "More Emojis"}
          </Button>
        </div>

        {/* Extended Emoji Picker */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={overlayDesign.animation.smooth}
              className="p-4 border-b border-white/10"
            >
              <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto">
                {allEmojis.map((emoji) => (
                  <motion.button
                    key={emoji}
                    className="p-2 rounded hover:bg-white/10 transition-all text-lg"
                    onClick={() => handleReact(emoji)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Reaction Feed */}
        <div className="flex-1 p-4 overflow-y-auto">
          <h4 className="text-xs font-medium text-gray-400 mb-3">Live Feed</h4>
          
          {/* Recent Animations */}
          <div className="relative mb-4 h-20">
            <AnimatePresence>
              {recentReactions.map((reaction) => (
                <motion.div
                  key={reaction.id}
                  className="absolute left-1/2 bottom-0 text-3xl"
                  initial={{ y: 0, x: "-50%", scale: 0, opacity: 0 }}
                  animate={{ 
                    y: -80, 
                    scale: [0, 1.5, 1],
                    opacity: [0, 1, 1, 0],
                    x: ["-50%", `${(Math.random() - 0.5) * 100}%`]
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                >
                  {reaction.emoji}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Top Reactions */}
          <div className="space-y-2">
            {getTopReactions().length > 0 ? (
              getTopReactions().map((reaction, index) => (
                <motion.div
                  key={reaction.emoji}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{reaction.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{reaction.count}</span>
                        <span className="text-xs text-gray-400">
                          {reaction.count === 1 ? 'reaction' : 'reactions'}
                        </span>
                      </div>
                      {reaction.users.length > 0 && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {reaction.users.slice(0, 3).join(", ")}
                          {reaction.users.length > 3 && ` +${reaction.users.length - 3} more`}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleReact(reaction.emoji)}
                    className="rounded-full p-2 hover:bg-white/10"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <Smile className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No reactions yet</p>
                <p className="text-xs text-gray-600 mt-1">Be the first to react!</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Reactions appear live for all viewers
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}