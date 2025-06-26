"use client"

import { useState, useEffect } from "react"
import { CampusPulseOverlay } from "@/components/overlays/CampusPulseOverlay"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, VolumeX, Maximize2, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface CampusPulsePlayerProps {
  className?: string
  onExpand?: () => void
  isFullscreen?: boolean
}

export function CampusPulsePlayer({ 
  className, 
  onExpand,
  isFullscreen = false 
}: CampusPulsePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)

  // Auto-show overlay when player starts
  useEffect(() => {
    setShowOverlay(true)
  }, [])

  const handleOverlayClose = () => {
    setShowOverlay(false)
    // Auto-restart overlay after 30 seconds
    setTimeout(() => {
      setShowOverlay(true)
    }, 30000)
  }

  return (
    <div className={cn("relative bg-black", className)}>
      {/* Background - Could be a subtle pattern or solid color */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-blue-900/20" />
      
      {/* Campus Pulse Overlay */}
      <CampusPulseOverlay 
        isVisible={showOverlay}
        onClose={handleOverlayClose}
        position={isFullscreen ? "fullscreen" : "center"}
        autoRotate={true}
        rotationInterval={10000}
        maxNotifications={5}
        showBackgrounds={true}
        backgroundOpacity={0.4}
      />

      {/* Video Controls (only visible when overlay is closed) */}
      {!showOverlay && (
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
              className="text-white hover:bg-white/20"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <span className="text-white text-sm ml-2">Campus Pulse Live</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOverlay(true)}
              className="text-white hover:bg-white/20"
            >
              Show Updates
            </Button>
            {onExpand && !isFullscreen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onExpand}
                className="text-white hover:bg-white/20"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Fallback content when no overlay */}
      {!showOverlay && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">📢</div>
            <h2 className="text-2xl font-bold mb-2">Campus Pulse</h2>
            <p className="text-white/70">Stay connected with campus announcements</p>
            <Button
              variant="outline"
              className="mt-4 text-white border-white/30 hover:bg-white/10"
              onClick={() => setShowOverlay(true)}
            >
              View Updates
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}