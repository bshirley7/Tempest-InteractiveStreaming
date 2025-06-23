"use client"

import { useState } from "react"
import { VODCard } from "./vod-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface VODContent {
  _id: string
  title: string
  description: string
  thumbnailUrl: string
  duration: number
  channel: string
  metadata?: {
    tags?: string[]
    rating?: number
    views?: number
  }
}

interface VODRowProps {
  title: string
  subtitle?: string
  content: VODContent[]
  variant?: "default" | "large" | "poster"
  aspectRatio?: "16:9" | "poster"
  showMetadata?: boolean
  className?: string
}

export function VODRow({ 
  title,
  subtitle,
  content, 
  variant = "default",
  aspectRatio = "16:9",
  showMetadata = true,
  className 
}: VODRowProps) {
  const [scrollPosition, setScrollPosition] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const scrollContainer = (direction: 'left' | 'right') => {
    const container = document.getElementById(`scroll-container-${title.replace(/\s+/g, '-')}`)
    if (!container) return

    const scrollAmount = container.clientWidth * 0.8
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : scrollPosition + scrollAmount

    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    })

    setScrollPosition(newPosition)
    setCanScrollLeft(newPosition > 0)
    setCanScrollRight(newPosition < container.scrollWidth - container.clientWidth)
  }

  const getCardWidth = () => {
    if (variant === "large") return "w-80"
    if (aspectRatio === "poster") return "w-48"
    return "w-64" // 16:9 default
  }

  if (content.length === 0) {
    return null
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        
        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => scrollContainer('left')}
            disabled={!canScrollLeft}
            className="rounded-full p-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => scrollContainer('right')}
            disabled={!canScrollRight}
            className="rounded-full p-2"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="relative">
        <div
          id={`scroll-container-${title.replace(/\s+/g, '-')}`}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          onScroll={(e) => {
            const target = e.target as HTMLDivElement
            setScrollPosition(target.scrollLeft)
            setCanScrollLeft(target.scrollLeft > 0)
            setCanScrollRight(target.scrollLeft < target.scrollWidth - target.clientWidth)
          }}
        >
          {content.map((item) => (
            <div key={item._id} className={cn("flex-shrink-0", getCardWidth())}>
              <VODCard
                content={item}
                variant={variant}
                aspectRatio={aspectRatio}
                showMetadata={showMetadata}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}