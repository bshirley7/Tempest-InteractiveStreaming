"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X, Megaphone, MapPin, Clock, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { overlayDesign } from "@/lib/overlay-design"

interface CampusUpdate {
  id: string
  title: string
  content: string
  category: 'news' | 'event' | 'alert' | 'announcement' | 'academic'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  location?: string
  date?: string
  time?: string
  link?: string
  backgroundImage: string
  expiresAt?: string
}

interface UpdatesOverlayProps {
  updates: CampusUpdate[]
  isVisible: boolean
  onDismiss?: () => void
  autoRotate?: boolean
  rotationInterval?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  className?: string
}

export function UpdatesOverlay({ 
  updates, 
  isVisible,
  onDismiss, 
  autoRotate = true,
  rotationInterval = 10000,
  position = 'top-right',
  className 
}: UpdatesOverlayProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Auto-rotation effect
  useEffect(() => {
    if (!autoRotate || isPaused || updates.length <= 1 || !isVisible) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % updates.length)
    }, rotationInterval)

    return () => clearInterval(interval)
  }, [autoRotate, isPaused, updates.length, rotationInterval, isVisible])

  // Auto-dismiss after showing all updates
  useEffect(() => {
    if (!isVisible || !autoRotate) return

    const totalTime = updates.length * rotationInterval + 2000 // Extra 2 seconds
    const timer = setTimeout(() => {
      onDismiss?.()
    }, totalTime)

    return () => clearTimeout(timer)
  }, [isVisible, autoRotate, updates.length, rotationInterval, onDismiss])

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4'
      case 'top-right':
        return 'top-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      default:
        return 'top-4 right-4'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'news':
        return 'from-blue-500 to-indigo-600'
      case 'event':
        return 'from-green-500 to-emerald-600'
      case 'alert':
        return 'from-red-500 to-rose-600'
      case 'announcement':
        return 'from-purple-500 to-violet-600'
      case 'academic':
        return 'from-amber-500 to-orange-600'
      default:
        return 'from-gray-500 to-slate-600'
    }
  }

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500 shadow-red-500/50'
      case 'high':
        return 'border-orange-500 shadow-orange-500/50'
      case 'medium':
        return 'border-yellow-500 shadow-yellow-500/50'
      case 'low':
        return 'border-blue-500 shadow-blue-500/50'
      default:
        return 'border-gray-500 shadow-gray-500/50'
    }
  }

  if (!isVisible || updates.length === 0) return null

  const currentUpdate = updates[currentIndex]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -20 }}
        transition={overlayDesign.animation.spring}
        className={cn(
          "fixed z-50 w-80 max-w-sm",
          getPositionClasses(),
          className
        )}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentUpdate.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={overlayDesign.animation.smooth}
            className={cn(
              "relative rounded-lg overflow-hidden shadow-2xl border-2 backdrop-blur-sm",
              getPriorityBorder(currentUpdate.priority)
            )}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={currentUpdate.backgroundImage}
                alt="Campus background"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
            </div>

            {/* Content */}
            <div className="relative p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-1.5 rounded-lg shadow-lg",
                    `bg-gradient-to-br ${getCategoryColor(currentUpdate.category)}`
                  )}>
                    <Megaphone className="w-3 h-3 text-white" />
                  </div>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium text-white",
                    `bg-gradient-to-r ${getCategoryColor(currentUpdate.category)}`
                  )}>
                    {currentUpdate.category.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {currentUpdate.priority === 'urgent' && (
                    <motion.span
                      className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold animate-pulse"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={overlayDesign.animation.bounce}
                    >
                      URGENT
                    </motion.span>
                  )}
                  
                  {onDismiss && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onDismiss}
                      className="rounded-full p-1 hover:bg-white/20 transition-colors"
                    >
                      <X className="w-3 h-3 text-white" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-white font-bold text-sm mb-2 leading-tight">
                {currentUpdate.title}
              </h3>

              {/* Content */}
              <p className="text-gray-200 text-xs leading-relaxed mb-3 line-clamp-3">
                {currentUpdate.content}
              </p>

              {/* Metadata */}
              <div className="space-y-1 mb-3">
                {currentUpdate.location && (
                  <div className="flex items-center gap-1 text-xs text-gray-300">
                    <MapPin className="w-3 h-3" />
                    <span>{currentUpdate.location}</span>
                  </div>
                )}
                
                {(currentUpdate.date || currentUpdate.time) && (
                  <div className="flex items-center gap-1 text-xs text-gray-300">
                    <Clock className="w-3 h-3" />
                    <span>
                      {currentUpdate.date && currentUpdate.time 
                        ? `${currentUpdate.date} at ${currentUpdate.time}`
                        : currentUpdate.date || currentUpdate.time
                      }
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {currentUpdate.link && (
                <Button
                  size="sm"
                  className={cn(
                    "w-full text-white text-xs",
                    `bg-gradient-to-r ${getCategoryColor(currentUpdate.category)}`,
                    "hover:opacity-90 transition-opacity"
                  )}
                  onClick={() => window.open(currentUpdate.link, '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Learn More
                </Button>
              )}

              {/* Progress Indicator */}
              {updates.length > 1 && (
                <div className="flex items-center justify-center gap-1 mt-3">
                  {updates.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all duration-300",
                        index === currentIndex 
                          ? "bg-white" 
                          : "bg-white/40"
                      )}
                    />
                  ))}
                </div>
              )}

              {/* Auto-rotation progress bar */}
              {autoRotate && !isPaused && updates.length > 1 && (
                <div className="mt-2">
                  <div className="w-full bg-white/20 rounded-full h-0.5 overflow-hidden">
                    <motion.div
                      className="h-full bg-white rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ 
                        duration: rotationInterval / 1000, 
                        ease: "linear",
                        repeat: Infinity 
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}