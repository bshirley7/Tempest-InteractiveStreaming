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
  const [showOverlay, setShowOverlay] = useState(true)

  // Always show overlay - Campus Pulse is only announcements
  useEffect(() => {
    setShowOverlay(true)
  }, [])

  // Campus Pulse doesn't close - it's always showing announcements
  const handleOverlayClose = () => {
    // Do nothing - Campus Pulse is always on
  }

  return (
    <div className={cn("relative bg-black", className)}>
      {/* Campus Pulse Overlay - Always Visible */}
      <CampusPulseOverlay 
        isVisible={true}
        onClose={handleOverlayClose}
        position={isFullscreen ? "fullscreen" : "center"}
        autoRotate={true}
        rotationInterval={10000}
        maxNotifications={5}
        showBackgrounds={true}
        backgroundOpacity={0.4}
        showCloseButton={false}
      />
    </div>
  )
}