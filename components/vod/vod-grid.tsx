"use client"

import { VODCard } from "./vod-card"
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

interface VODGridProps {
  content: VODContent[]
  variant?: "default" | "large" | "poster"
  aspectRatio?: "16:9" | "poster"
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  showMetadata?: boolean
  className?: string
}

export function VODGrid({ 
  content, 
  variant = "default",
  aspectRatio = "16:9",
  columns = { mobile: 2, tablet: 3, desktop: 4 },
  showMetadata = true,
  className 
}: VODGridProps) {
  const getGridClasses = () => {
    const { mobile = 2, tablet = 3, desktop = 4 } = columns
    
    return cn(
      "grid gap-4",
      `grid-cols-${mobile}`,
      `md:grid-cols-${tablet}`,
      `lg:grid-cols-${desktop}`,
      className
    )
  }

  if (content.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No content available</p>
      </div>
    )
  }

  return (
    <div className={getGridClasses()}>
      {content.map((item) => (
        <VODCard
          key={item._id}
          content={item}
          variant={variant}
          aspectRatio={aspectRatio}
          showMetadata={showMetadata}
        />
      ))}
    </div>
  )
}