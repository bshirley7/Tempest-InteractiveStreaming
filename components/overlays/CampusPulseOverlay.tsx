"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, ExternalLink, Clock, AlertTriangle, Image } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase-client"

export interface CampusPulseNotification {
  id: string
  title: string
  message: string
  category: 'academic' | 'event' | 'alert' | 'dining' | 'transport' | 'weather' | 'maintenance' | 'sports' | 'accolade' | 'announcement'
  priority: 'urgent' | 'high' | 'medium' | 'low'
  timestamp: number
  icon?: string
  actionText?: string
  actionUrl?: string
  backgroundImage?: string
  expiresAt?: number
}

interface CampusPulseOverlayProps {
  isVisible: boolean
  onClose: () => void
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'fullscreen'
  autoRotate?: boolean
  rotationInterval?: number
  maxNotifications?: number
  showBackgrounds?: boolean
  backgroundOpacity?: number
}

export function CampusPulseOverlay({
  isVisible,
  onClose,
  position = 'fullscreen',
  autoRotate = true,
  rotationInterval = 8000,
  maxNotifications = 3,
  showBackgrounds = true,
  backgroundOpacity = 0.3
}: CampusPulseOverlayProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [notifications, setNotifications] = useState<CampusPulseNotification[]>([])
  const [imageLoaded, setImageLoaded] = useState(false)

  // Fetch notifications from Supabase campus_updates table
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('campus_updates')
          .select('*')
          .order('priority', { ascending: true })
          .order('created_at', { ascending: false })
          .limit(maxNotifications)

        if (!error && data) {
          const formattedNotifications: CampusPulseNotification[] = data.map((update) => ({
            id: update.id,
            title: update.title,
            message: update.message,
            category: update.category || 'announcement',
            priority: update.priority || 'medium',
            timestamp: new Date(update.created_at).getTime(),
            icon: update.icon || '📢',
            actionText: update.action_text,
            actionUrl: update.action_url,
            backgroundImage: update.background_image || getBackgroundForCategory(update.category || 'announcement'),
            expiresAt: update.expires_at ? new Date(update.expires_at).getTime() : undefined
          }))

          // Filter out expired notifications
          const activeNotifications = formattedNotifications.filter(
            notif => !notif.expiresAt || notif.expiresAt > Date.now()
          )

          setNotifications(activeNotifications)
        }
      } catch (error) {
        console.error('Failed to fetch campus updates:', error)
      }
    }

    fetchNotifications()
    
    // Refresh notifications every minute
    const interval = setInterval(fetchNotifications, 60000)
    
    return () => clearInterval(interval)
  }, [maxNotifications])

  // Auto-rotation effect
  useEffect(() => {
    if (!autoRotate || !isVisible || notifications.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notifications.length)
      setImageLoaded(false)
    }, rotationInterval)

    return () => clearInterval(interval)
  }, [autoRotate, isVisible, notifications.length, rotationInterval])

  if (!isVisible || notifications.length === 0) return null

  const currentNotification = notifications[currentIndex]
  const backgroundImage = showBackgrounds ? currentNotification.backgroundImage : null

  const getPositionClasses = () => {
    if (position === 'fullscreen') {
      return 'inset-0'
    }
    
    switch (position) {
      case 'top-left':
        return 'top-4 left-4'
      case 'top-right':
        return 'top-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
      default:
        return 'top-4 right-4'
    }
  }

  const getSizeClasses = () => {
    if (position === 'fullscreen') {
      return 'w-full h-full'
    }
    return 'w-96 max-w-[calc(100vw-2rem)]'
  }

  const getPriorityColor = (priority: CampusPulseNotification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-600 border-red-500 text-white'
      case 'high':
        return 'bg-orange-600 border-orange-500 text-white'
      case 'medium':
        return 'bg-blue-600 border-blue-500 text-white'
      case 'low':
        return 'bg-gray-600 border-gray-500 text-white'
      default:
        return 'bg-blue-600 border-blue-500 text-white'
    }
  }

  const getCategoryColor = (category: CampusPulseNotification['category']) => {
    switch (category) {
      case 'academic':
        return 'text-blue-400 bg-blue-900/30'
      case 'event':
        return 'text-purple-400 bg-purple-900/30'
      case 'alert':
        return 'text-red-400 bg-red-900/30'
      case 'dining':
        return 'text-green-400 bg-green-900/30'
      case 'transport':
        return 'text-yellow-400 bg-yellow-900/30'
      case 'weather':
        return 'text-cyan-400 bg-cyan-900/30'
      case 'maintenance':
        return 'text-orange-400 bg-orange-900/30'
      case 'sports':
        return 'text-indigo-400 bg-indigo-900/30'
      case 'accolade':
        return 'text-amber-400 bg-amber-900/30 border border-amber-500/50'
      case 'announcement':
        return 'text-purple-400 bg-purple-900/30'
      default:
        return 'text-gray-400 bg-gray-900/30'
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (minutes < 60) {
      return `${minutes}m ago`
    } else if (hours < 24) {
      return `${hours}h ago`
    } else {
      return new Date(timestamp).toLocaleDateString()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      className={cn(
        "fixed z-50",
        getPositionClasses(),
        getSizeClasses()
      )}
    >
      <Card className={cn(
        "relative overflow-hidden backdrop-blur-lg border h-full",
        currentNotification.priority === 'urgent'
          ? "bg-red-950/90 border-red-700/50" 
          : currentNotification.category === 'accolade'
          ? "bg-gradient-to-br from-amber-950/90 to-yellow-950/90 border-amber-700/50"
          : "bg-zinc-950/90 border-zinc-700/50"
      )}>
        
        {/* Background Image */}
        {showBackgrounds && backgroundImage && (
          <div className="absolute inset-0 overflow-hidden">
            <motion.img
              key={backgroundImage}
              src={backgroundImage}
              alt="Background"
              className="w-full h-full object-cover"
              style={{ opacity: backgroundOpacity }}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ 
                scale: imageLoaded ? 1 : 1.1, 
                opacity: imageLoaded ? backgroundOpacity : 0 
              }}
              transition={{ duration: 0.8 }}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
          </div>
        )}

        {/* Priority stripe */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-1 z-10",
          getPriorityColor(currentNotification.priority).split(' ')[0]
        )} />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{currentNotification.icon}</div>
              <div>
                <h3 className="text-lg font-semibold text-white">Campus Pulse</h3>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", getCategoryColor(currentNotification.category))}
                  >
                    {currentNotification.category}
                  </Badge>
                  {currentNotification.priority === 'urgent' && (
                    <div className="flex items-center gap-1 text-red-400">
                      <AlertTriangle className="w-3 h-3" />
                      <span className="text-xs font-medium">URGENT</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Rotation indicator */}
              {notifications.length > 1 && (
                <div className="flex items-center gap-1">
                  {notifications.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentIndex(index)
                        setImageLoaded(false)
                      }}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        index === currentIndex 
                          ? "bg-white" 
                          : "bg-white/30 hover:bg-white/50"
                      )}
                    />
                  ))}
                </div>
              )}
              
              {position !== 'fullscreen' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Notification Content */}
          <div className="flex-1 flex items-center justify-center px-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentNotification.id}-${backgroundImage}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center max-w-3xl"
              >
                <h4 className={cn(
                  "font-semibold text-white mb-4",
                  position === 'fullscreen' ? 'text-4xl' : 'text-xl'
                )}>
                  {currentNotification.title}
                </h4>
                <p className={cn(
                  "text-zinc-300 mb-6 leading-relaxed",
                  position === 'fullscreen' ? 'text-xl' : 'text-sm'
                )}>
                  {currentNotification.message}
                </p>
                
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1 text-sm text-zinc-500">
                    <Clock className="w-4 h-4" />
                    <span>{formatTimeAgo(currentNotification.timestamp)}</span>
                  </div>
                  
                  {currentNotification.actionText && (
                    <Button
                      variant="outline"
                      size={position === 'fullscreen' ? 'default' : 'sm'}
                      className={cn(
                        "border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                      )}
                      onClick={() => {
                        if (currentNotification.actionUrl) {
                          window.open(currentNotification.actionUrl, '_blank')
                        }
                      }}
                    >
                      {currentNotification.actionText}
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress bar for auto-rotation */}
          {autoRotate && notifications.length > 1 && (
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-white/30 z-10"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ 
                duration: rotationInterval / 1000, 
                ease: 'linear',
                repeat: Infinity 
              }}
            />
          )}
        </div>
      </Card>
    </motion.div>
  )
}

// Helper function to get Pexels background images based on category
function getBackgroundForCategory(category: string): string {
  const categoryBackgrounds: Record<string, string[]> = {
    academic: [
      'https://images.pexels.com/photos/159775/library-la-trobe-study-students-159775.jpeg',
      'https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg',
      'https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg'
    ],
    event: [
      'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg',
      'https://images.pexels.com/photos/1157557/pexels-photo-1157557.jpeg',
      'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg'
    ],
    alert: [
      'https://images.pexels.com/photos/1494806/pexels-photo-1494806.jpeg',
      'https://images.pexels.com/photos/280221/pexels-photo-280221.jpeg',
      'https://images.pexels.com/photos/209251/pexels-photo-209251.jpeg'
    ],
    dining: [
      'https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg',
      'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg',
      'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg'
    ],
    transport: [
      'https://images.pexels.com/photos/1427541/pexels-photo-1427541.jpeg',
      'https://images.pexels.com/photos/210182/pexels-photo-210182.jpeg',
      'https://images.pexels.com/photos/385998/pexels-photo-385998.jpeg'
    ],
    weather: [
      'https://images.pexels.com/photos/1431822/pexels-photo-1431822.jpeg',
      'https://images.pexels.com/photos/209831/pexels-photo-209831.jpeg',
      'https://images.pexels.com/photos/1463530/pexels-photo-1463530.jpeg'
    ],
    maintenance: [
      'https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg',
      'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg',
      'https://images.pexels.com/photos/3862365/pexels-photo-3862365.jpeg'
    ],
    sports: [
      'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg',
      'https://images.pexels.com/photos/358042/pexels-photo-358042.jpeg',
      'https://images.pexels.com/photos/248547/pexels-photo-248547.jpeg'
    ],
    accolade: [
      'https://images.pexels.com/photos/8199562/pexels-photo-8199562.jpeg',
      'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg',
      'https://images.pexels.com/photos/7005618/pexels-photo-7005618.jpeg'
    ],
    announcement: [
      'https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg',
      'https://images.pexels.com/photos/207456/pexels-photo-207456.jpeg',
      'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg'
    ]
  }

  const backgrounds = categoryBackgrounds[category] || categoryBackgrounds.announcement
  return backgrounds[Math.floor(Math.random() * backgrounds.length)]
}