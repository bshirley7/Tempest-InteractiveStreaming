"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X, Megaphone, Clock, MapPin, Calendar, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
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

interface UpdatesSidebarProps {
  updates: CampusUpdate[]
  onClose?: () => void
  autoRotate?: boolean
  rotationInterval?: number
  className?: string
}

export function UpdatesSidebar({ 
  updates, 
  onClose, 
  autoRotate = true,
  rotationInterval = 8000,
  className 
}: UpdatesSidebarProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Auto-rotation effect
  useEffect(() => {
    if (!autoRotate || isPaused || updates.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % updates.length)
    }, rotationInterval)

    return () => clearInterval(interval)
  }, [autoRotate, isPaused, updates.length, rotationInterval])

  const nextUpdate = () => {
    setCurrentIndex(prev => (prev + 1) % updates.length)
  }

  const prevUpdate = () => {
    setCurrentIndex(prev => (prev - 1 + updates.length) % updates.length)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'news':
        return <Megaphone className="w-4 h-4" />
      case 'event':
        return <Calendar className="w-4 h-4" />
      case 'alert':
        return <span className="w-4 h-4 flex items-center justify-center text-red-500">⚠️</span>
      case 'announcement':
        return <Megaphone className="w-4 h-4" />
      case 'academic':
        return <span className="w-4 h-4 flex items-center justify-center">📚</span>
      default:
        return <Megaphone className="w-4 h-4" />
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

  if (updates.length === 0) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={overlayDesign.animation.smooth}
          className={cn("h-full flex flex-col", className)}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
                <Megaphone className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white">Campus Updates</h3>
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

          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <Megaphone className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No updates available</p>
              <p className="text-xs text-gray-600 mt-1">Check back later for campus news</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  const currentUpdate = updates[currentIndex]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={overlayDesign.animation.smooth}
        className={cn("h-full flex flex-col", className)}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg shadow-lg",
              `bg-gradient-to-br ${getCategoryColor(currentUpdate.category)}`
            )}>
              {getCategoryIcon(currentUpdate.category)}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Campus Updates</h3>
              <p className="text-xs text-gray-400">
                {currentIndex + 1} of {updates.length}
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

        {/* Update Content */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentUpdate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={overlayDesign.animation.smooth}
              className="absolute inset-0"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={currentUpdate.backgroundImage}
                  alt="Campus background"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
              </div>

              {/* Content Overlay */}
              <div className="relative h-full flex flex-col justify-end p-4">
                {/* Priority Indicator */}
                {currentUpdate.priority === 'urgent' && (
                  <motion.div
                    className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={overlayDesign.animation.bounce}
                  >
                    URGENT
                  </motion.div>
                )}

                {/* Update Content */}
                <div className={cn(
                  "bg-black/80 backdrop-blur-sm rounded-lg p-4 border-2 shadow-lg",
                  getPriorityBorder(currentUpdate.priority)
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium text-white",
                      `bg-gradient-to-r ${getCategoryColor(currentUpdate.category)}`
                    )}>
                      {currentUpdate.category.toUpperCase()}
                    </span>
                    {currentUpdate.priority === 'high' && (
                      <span className="text-orange-400 text-xs font-bold">HIGH PRIORITY</span>
                    )}
                  </div>

                  <h2 className="text-lg font-bold text-white mb-2 leading-tight">
                    {currentUpdate.title}
                  </h2>

                  <p className="text-sm text-gray-200 leading-relaxed mb-3">
                    {currentUpdate.content}
                  </p>

                  {/* Metadata */}
                  <div className="space-y-2">
                    {currentUpdate.location && (
                      <div className="flex items-center gap-2 text-xs text-gray-300">
                        <MapPin className="w-3 h-3" />
                        <span>{currentUpdate.location}</span>
                      </div>
                    )}
                    
                    {(currentUpdate.date || currentUpdate.time) && (
                      <div className="flex items-center gap-2 text-xs text-gray-300">
                        <Clock className="w-3 h-3" />
                        <span>
                          {currentUpdate.date && currentUpdate.time 
                            ? `${currentUpdate.date} at ${currentUpdate.time}`
                            : currentUpdate.date || currentUpdate.time
                          }
                        </span>
                      </div>
                    )}

                    {currentUpdate.link && (
                      <Button
                        size="sm"
                        className={cn(
                          "w-full mt-3 text-white",
                          `bg-gradient-to-r ${getCategoryColor(currentUpdate.category)}`,
                          "hover:opacity-90 transition-opacity"
                        )}
                        onClick={() => window.open(currentUpdate.link, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3 mr-2" />
                        Learn More
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Controls */}
        {updates.length > 1 && (
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <Button
                size="sm"
                variant="ghost"
                onClick={prevUpdate}
                className="rounded-full p-2 hover:bg-white/10"
              >
                <ChevronLeft className="w-4 h-4 text-gray-300" />
              </Button>

              {/* Dots Indicator */}
              <div className="flex items-center gap-2">
                {updates.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      index === currentIndex 
                        ? "bg-white scale-125" 
                        : "bg-white/40 hover:bg-white/60"
                    )}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={nextUpdate}
                className="rounded-full p-2 hover:bg-white/10"
              >
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Button>
            </div>

            {/* Auto-rotation indicator */}
            {autoRotate && !isPaused && (
              <div className="mt-3">
                <div className="w-full bg-white/20 rounded-full h-1 overflow-hidden">
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
                <p className="text-xs text-gray-400 text-center mt-1">
                  Auto-rotating • Hover to pause
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}