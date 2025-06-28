"use client"

import { useState } from "react"
import Link from "next/link"
import { Play, Clock, Info, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface VODCardProps {
  content: {
    _id: string
    title: string
    description: string
    thumbnailUrl: string
    duration: number
    channel: string
    metadata?: {
      tags?: string[]
      views?: number
    }
  }
  variant?: "default" | "large" | "hero" | "poster"
  aspectRatio?: "16:9" | "poster"
  showMetadata?: boolean
  className?: string
}

export function VODCard({ 
  content, 
  variant = "default", 
  aspectRatio = "16:9",
  showMetadata = true,
  className 
}: VODCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
  }

  // Extract YouTube thumbnail ID if it's a YouTube URL
  const getThumbnailUrl = () => {
    if (imageError) {
      return "/placeholder-video.svg"
    }
    
    if (content.thumbnailUrl?.includes('ytimg.com')) {
      return content.thumbnailUrl
    }
    
    // Fallback for local thumbnails
    return content.thumbnailUrl || "/placeholder-video.svg"
  }

  // Determine aspect ratio class
  const getAspectRatioClass = () => {
    if (variant === "hero") return "aspect-video"
    if (aspectRatio === "poster") return "aspect-[2/3]"
    if (aspectRatio === "16:9") return "aspect-video"
    return "aspect-video" // 16:9 default
  }

  // Hero variant (unchanged from your original)
  if (variant === "hero") {
    return (
      <div className={cn("relative h-[550px] group cursor-pointer overflow-hidden", className)}>
        <div className="absolute inset-0">
          <img
            src={getThumbnailUrl()}
            alt={content.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 p-8 lg:p-12 max-w-4xl">
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-md">
            {content.title}
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-gray-200 mb-6 line-clamp-2 max-w-3xl leading-relaxed">
            {content.description}
          </p>
          
          <div className="flex items-center gap-4 mb-8">
            <Link href={`/vod/watch/${content._id}`}>
              <Button size="lg" className="bg-white text-black hover:bg-gray-200 transition-colors">
                <Play className="w-5 h-5 mr-2" fill="currentColor" />
                Play
              </Button>
            </Link>
            <Link href={`/vod/details/${content._id}`}>
              <Button size="lg" variant="secondary" className="bg-white/20 backdrop-blur text-white hover:bg-white/30 transition-colors">
                <Info className="w-5 h-5 mr-2" />
                More Info
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDuration(content.duration)}
            </span>
            {content.metadata?.views && (
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {formatViews(content.metadata.views)} views
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Large variant with enhanced styling
  if (variant === "large") {
    return (
      <Link href={`/vod/details/${content._id}`} className={className}>
        <div 
          className="relative group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={cn("relative overflow-hidden rounded-xl shadow-lg", getAspectRatioClass())}>
            <img
              src={getThumbnailUrl()}
              alt={content.title}
              className={cn(
                "w-full h-full object-cover transition-all duration-500",
                isHovered && "scale-110 brightness-75"
              )}
              onError={() => setImageError(true)}
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Play button overlay */}
            <div className={cn(
              "absolute inset-0 flex items-center justify-center transition-all duration-300",
              isHovered ? "opacity-100 scale-100" : "opacity-0 scale-75"
            )}>
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 border border-white/30">
                <Play className="w-8 h-8 text-white" fill="white" />
              </div>
            </div>
            
            {/* Duration badge */}
            <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-medium">
              {formatDuration(content.duration)}
            </div>


            {/* Channel badge */}
            <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs px-2 py-1 rounded-md font-medium">
              {content.channel}
            </div>
          </div>
          
          {showMetadata && (
            <div className="mt-4 space-y-2">
              <h3 className="font-bold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {content.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {content.description}
              </p>
              
              {/* Metadata row */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  {content.metadata?.views && (
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatViews(content.metadata.views)}
                    </span>
                  )}
                  <span>{content.channel}</span>
                </div>
                {content.metadata?.tags && content.metadata.tags.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {content.metadata.tags[0]}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </Link>
    )
  }

  // Default card variant with improved styling
  return (
    <Link href={`/vod/details/${content._id}`} className={className}>
      <div 
        className="group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={cn("relative overflow-hidden rounded-lg shadow-md bg-card", getAspectRatioClass())}>
          <img
            src={getThumbnailUrl()}
            alt={content.title}
            className={cn(
              "w-full h-full object-cover transition-all duration-500",
              isHovered && "scale-110 brightness-75"
            )}
            onError={() => setImageError(true)}
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Play button overlay */}
          <div className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-300",
            isHovered ? "opacity-100 scale-100" : "opacity-0 scale-75"
          )}>
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30">
              <Play className="w-6 h-6 text-white" fill="white" />
            </div>
          </div>
          
          {/* Duration badge */}
          <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded font-medium">
            {formatDuration(content.duration)}
          </div>

        </div>
        
        {showMetadata && (
          <div className="mt-3 space-y-1">
            <h3 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {content.title}
            </h3>
            {aspectRatio === "16:9" && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {content.description}
              </p>
            )}
            
            {/* Metadata for poster format */}
            {aspectRatio === "poster" && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{content.channel}</span>
                  {content.metadata?.views && (
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatViews(content.metadata.views)}
                    </span>
                  )}
                </div>
                {content.metadata?.tags && content.metadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {content.metadata.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}