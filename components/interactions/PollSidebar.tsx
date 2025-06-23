"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X, BarChart3, Users, Clock, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { overlayDesign, getProgressColor, getTimerColor } from "@/lib/overlay-design"

interface PollOption {
  id: string
  text: string
  votes: number
}

interface Poll {
  _id: string
  question: string
  options: PollOption[]
  totalVotes: number
  timeRemaining: number
  isActive: boolean
}

interface PollSidebarProps {
  poll: Poll
  onVote: (optionId: string) => void
  onClose?: () => void
  userVote?: string
  className?: string
}

export function PollSidebar({ poll, onVote, onClose, userVote, className }: PollSidebarProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(userVote || null)
  const [hasVoted, setHasVoted] = useState(!!userVote)
  const [timeLeft, setTimeLeft] = useState(poll.timeRemaining)

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleVote = (optionId: string) => {
    if (hasVoted || timeLeft === 0) return
    
    setSelectedOption(optionId)
    setHasVoted(true)
    onVote(optionId)
  }

  const getVotePercentage = (votes: number) => {
    return poll.totalVotes > 0 ? Math.round((votes / poll.totalVotes) * 100) : 0
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Live Poll</h3>
              <div className="flex items-center gap-3 text-xs mt-0.5">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-300">
                    {poll.totalVotes} {poll.totalVotes === 1 ? 'vote' : 'votes'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className={cn("w-3 h-3", getTimerColor((timeLeft / poll.timeRemaining) * 100))} />
                  <span className={cn(
                    "font-mono font-medium tabular-nums",
                    getTimerColor((timeLeft / poll.timeRemaining) * 100)
                  )}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
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

        {/* Question */}
        <div className="p-4">
          <h2 className="text-base font-semibold text-white leading-relaxed mb-4">
            {poll.question}
          </h2>
          
          {!hasVoted && !timeLeft && (
            <p className="text-xs text-gray-400 mb-4">
              Choose your answer:
            </p>
          )}
        </div>

        {/* Options */}
        <div className="flex-1 px-4 pb-4 space-y-3">
          {poll.options.map((option, index) => {
            const percentage = getVotePercentage(option.votes)
            const isSelected = selectedOption === option.id
            const isDisabled = hasVoted || timeLeft === 0
            const isWinning = hasVoted && option.votes === Math.max(...poll.options.map(o => o.votes))
            
            return (
              <motion.button
                key={option.id}
                className={cn(
                  "relative w-full p-3 rounded-lg transition-all overflow-hidden text-left",
                  "bg-white/5 backdrop-blur-sm border border-white/10",
                  isSelected && !hasVoted && "bg-blue-500/20 border-blue-400",
                  isWinning && hasVoted && "bg-green-500/10 border-green-400",
                  !isDisabled && "hover:bg-white/10 active:scale-[0.98]",
                  isDisabled && !hasVoted && "cursor-not-allowed opacity-50"
                )}
                onClick={() => handleVote(option.id)}
                disabled={isDisabled}
                whileHover={!isDisabled ? { scale: 1.01 } : {}}
                whileTap={!isDisabled ? { scale: 0.99 } : {}}
                transition={{ duration: 0.1 }}
              >
                {/* Progress bar background (shown after voting) */}
                {hasVoted && (
                  <motion.div
                    className={cn(
                      "absolute left-0 top-0 bottom-0 bg-gradient-to-r opacity-20 rounded-lg",
                      getProgressColor(percentage)
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                  />
                )}
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white text-sm">
                      {option.text}
                    </span>
                    {isSelected && !hasVoted && (
                      <motion.div
                        className="w-2 h-2 bg-blue-400 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={overlayDesign.animation.bounce}
                      />
                    )}
                  </div>
                  
                  {hasVoted && (
                    <motion.div 
                      className="flex items-center justify-between"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                    >
                      <span className="text-xs text-gray-400">
                        {option.votes} {option.votes === 1 ? 'vote' : 'votes'}
                      </span>
                      <span className={cn(
                        "text-lg font-bold tabular-nums",
                        "bg-gradient-to-r bg-clip-text text-transparent",
                        getProgressColor(percentage)
                      )}>
                        {percentage}%
                      </span>
                    </motion.div>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Footer status */}
        {(hasVoted || timeLeft === 0) && (
          <motion.div 
            className="px-4 pb-4 border-t border-white/10 pt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-center">
              {hasVoted ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-gray-400">
                    Thanks for voting! Results update live
                  </span>
                </div>
              ) : (
                <span className="text-xs font-medium text-red-400">
                  Poll has ended
                </span>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}