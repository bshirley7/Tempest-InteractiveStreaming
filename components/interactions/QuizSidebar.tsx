"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X, Clock, CheckCircle2, XCircle, Brain, Sparkles, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { overlayDesign, getTimerColor } from "@/lib/overlay-design"

interface QuizOption {
  id: string
  text: string
}

interface Quiz {
  _id: string
  question: string
  options: QuizOption[]
  correctAnswer: string
  timeLimit: number
  timeRemaining: number
  explanation?: string
}

interface QuizSidebarProps {
  quiz: Quiz
  onAnswer: (answerId: string) => void
  onClose: () => void
  className?: string
}

export function QuizSidebar({ quiz, onAnswer, onClose, className }: QuizSidebarProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [timeLeft, setTimeLeft] = useState(quiz.timeRemaining)
  const [isCorrect, setIsCorrect] = useState(false)

  // Timer countdown
  useEffect(() => {
    if (showResult) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [showResult])

  const handleTimeUp = () => {
    if (!selectedAnswer) {
      setShowResult(true)
    }
  }

  const handleAnswer = (answerId: string) => {
    if (showResult) return
    
    setSelectedAnswer(answerId)
    const correct = answerId === quiz.correctAnswer
    setIsCorrect(correct)
    setShowResult(true)
    onAnswer(answerId)
  }

  const formatTime = (seconds: number) => {
    return seconds.toString().padStart(2, '0')
  }

  const getTimerProgress = () => {
    return (timeLeft / quiz.timeLimit) * 100
  }

  if (showResult) {
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
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-orange-500/30">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white">Quiz Result</h3>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={onClose}
              className="rounded-full p-1 hover:bg-white/10 transition-colors"
            >
              <X className="w-3 h-3 text-gray-300" />
            </Button>
          </div>

          {/* Result Content */}
          <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ ...overlayDesign.animation.bounce, delay: 0.2 }}
              className={cn(
                "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center shadow-lg",
                selectedAnswer ? (
                  isCorrect ? "bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/30" :
                  "bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/30"
                ) : "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30"
              )}
            >
              {selectedAnswer ? (
                isCorrect ? <Trophy className="w-8 h-8 text-white" /> :
                <XCircle className="w-8 h-8 text-white" />
              ) : (
                <Clock className="w-8 h-8 text-white" />
              )}
            </motion.div>
            
            <motion.h3 
              className="text-xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {selectedAnswer ? (
                isCorrect ? "Correct!" : "Not quite"
              ) : "Time's Up!"}
            </motion.h3>
            
            {quiz.explanation && (
              <motion.p 
                className="text-sm text-gray-300 mb-6 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {quiz.explanation}
              </motion.p>
            )}
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button 
                onClick={onClose}
                className={cn(
                  overlayDesign.button.base,
                  overlayDesign.button.primary,
                  overlayDesign.button.sizes.sm,
                  "w-full"
                )}
              >
                Continue Watching
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    )
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
        {/* Header with timer */}
        <div className="border-b border-white/10">
          <div className="flex items-center justify-between p-4 pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-orange-500/30">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Quiz Time!
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <Clock className={cn("w-3 h-3", getTimerColor(getTimerProgress()))} />
                  <span className={cn("font-mono font-semibold text-xs tabular-nums", getTimerColor(getTimerProgress()))}>
                    {formatTime(timeLeft)}s
                  </span>
                </div>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={onClose}
              className="rounded-full p-1 hover:bg-white/10 transition-colors"
            >
              <X className="w-3 h-3 text-gray-300" />
            </Button>
          </div>
          
          {/* Timer bar */}
          <div className="px-4 pb-3">
            <div className="relative h-1 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className={cn("absolute left-0 top-0 h-full bg-gradient-to-r rounded-full", 
                  getTimerProgress() > 66 ? overlayDesign.colors.success.gradient :
                  getTimerProgress() > 33 ? overlayDesign.colors.warning.gradient :
                  overlayDesign.colors.danger.gradient
                )}
                initial={{ width: "100%" }}
                animate={{ width: `${getTimerProgress()}%` }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="p-4">
          <h2 className="text-base font-semibold text-white leading-relaxed mb-4">
            {quiz.question}
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Select your answer before time runs out!
          </p>
        </div>

        {/* Options */}
        <div className="flex-1 px-4 pb-4 space-y-3">
          {quiz.options.map((option, index) => {
            const isSelected = selectedAnswer === option.id
            const letter = String.fromCharCode(65 + index)
            
            return (
              <motion.button
                key={option.id}
                className={cn(
                  "relative w-full p-3 rounded-lg text-left transition-all flex items-center gap-3",
                  "bg-white/5 backdrop-blur-sm border border-white/10",
                  isSelected ? "bg-amber-500/20 border-amber-400" : "hover:bg-white/10 hover:scale-[1.01] active:scale-[0.99]"
                )}
                onClick={() => handleAnswer(option.id)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.1 }}
              >
                <div className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs transition-colors",
                  isSelected ? "bg-amber-500 text-white" : "bg-white/10 text-gray-300"
                )}>
                  {letter}
                </div>
                <span className="flex-1 font-medium text-white text-sm leading-relaxed">
                  {option.text}
                </span>
                
                {isSelected && (
                  <motion.div
                    className="w-2 h-2 bg-amber-400 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={overlayDesign.animation.bounce}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}