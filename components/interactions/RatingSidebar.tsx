"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X, Star, Heart, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { overlayDesign } from "@/lib/overlay-design"

interface RatingSidebarProps {
  onRate: (rating: number, feedback?: string) => void
  onClose: () => void
  title?: string
  className?: string
}

export function RatingSidebar({ 
  onRate, 
  onClose, 
  title = "Rate this content",
  className 
}: RatingSidebarProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [showThanks, setShowThanks] = useState(false)

  const handleSubmit = () => {
    if (rating === 0) return
    
    onRate(rating, feedback.trim() || undefined)
    setShowThanks(true)
    
    // Auto close after showing thanks
    setTimeout(() => {
      onClose()
    }, 2000)
  }

  const ratingLabels = [
    "", // 0
    "Poor",
    "Fair", 
    "Good",
    "Very Good",
    "Excellent"
  ]

  if (showThanks) {
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
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white">Thank You!</h3>
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

          {/* Thank You Content */}
          <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ ...overlayDesign.animation.bounce, delay: 0.2 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30 flex items-center justify-center"
            >
              <Heart className="w-8 h-8 text-white" />
            </motion.div>
            
            <motion.h3 
              className="text-lg font-bold text-white mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Thank you!
            </motion.h3>
            
            <motion.p 
              className="text-sm text-gray-300 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Your feedback helps us improve the content experience.
            </motion.p>
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
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 shadow-lg shadow-amber-500/30">
              <Star className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Rate Content</h3>
              <p className="text-xs text-gray-400">Share your experience</p>
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

        {/* Content */}
        <div className="flex-1 p-4">
          <h2 className="text-base font-semibold text-white mb-6 text-center leading-relaxed">
            {title}
          </h2>
          
          {/* Star Rating */}
          <div className="flex justify-center mb-4 gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={overlayDesign.animation.spring}
              >
                <Star
                  className={cn(
                    "w-8 h-8 transition-all duration-300",
                    (hoveredRating >= star || rating >= star)
                      ? "fill-amber-500 text-amber-500 drop-shadow-lg"
                      : "text-gray-400"
                  )}
                />
              </motion.button>
            ))}
          </div>

          {/* Rating Label */}
          <AnimatePresence mode="wait">
            {(hoveredRating || rating) > 0 && (
              <motion.div 
                className="text-center mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                key={hoveredRating || rating}
              >
                <span className={cn(
                  "font-medium text-base flex items-center justify-center gap-2",
                  overlayDesign.colors.warning.text
                )}>
                  {ratingLabels[hoveredRating || rating]}
                  {(hoveredRating || rating) >= 4 && <Sparkles className="w-4 h-4" />}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback Input */}
          {rating > 0 && (
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={overlayDesign.animation.smooth}
            >
              <label className="block mb-2 text-xs text-gray-400">
                Share your thoughts (optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="What did you think?"
                className={cn(
                  "w-full h-20 px-3 py-2 rounded-lg resize-none transition-all text-sm",
                  "bg-white/5 backdrop-blur-sm",
                  "border border-white/10",
                  "text-white placeholder-gray-400",
                  "focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                )}
                maxLength={200}
              />
              <div className="mt-1 text-right text-xs text-gray-400">
                {feedback.length}/200
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              className={cn(
                overlayDesign.button.base,
                overlayDesign.button.sizes.sm,
                "w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-white",
                "hover:from-amber-600 hover:to-yellow-700 shadow-lg shadow-amber-500/25",
                rating === 0 && "opacity-50 cursor-not-allowed saturate-0"
              )}
              onClick={handleSubmit}
              disabled={rating === 0}
            >
              Submit Rating
            </Button>
            
            <Button
              variant="ghost"
              onClick={onClose}
              className={cn(
                overlayDesign.button.base,
                overlayDesign.button.ghost,
                overlayDesign.button.sizes.sm,
                "w-full"
              )}
            >
              Skip for now
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}