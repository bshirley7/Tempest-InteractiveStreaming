'use client';

import React, { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PauseAd {
  id: string;
  title: string;
  message: string;
  cta_text: string;
  cta_link: string;
  image_url: string;
  company_logo_url?: string;
}

interface PauseScreenAdProps {
  isVisible: boolean;
  onClose: () => void;
  onAdClick?: (adId: string) => void;
  onAdImpression?: (adId: string) => void;
  className?: string;
}

export function PauseScreenAd({
  isVisible,
  onClose,
  onAdClick,
  onAdImpression,
  className = ''
}: PauseScreenAdProps) {
  const [currentAd, setCurrentAd] = useState<PauseAd | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Fetch active pause screen ad
  useEffect(() => {
    if (!isVisible) return;

    const fetchAd = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/ads/pause-screen');
        const result = await response.json();
        
        if (result.success && result.data) {
          setCurrentAd(result.data);
          // Track impression
          if (onAdImpression) {
            onAdImpression(result.data.id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch pause screen ad:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [isVisible, onAdImpression]);

  // Handle CTA click
  const handleCtaClick = () => {
    if (currentAd) {
      // Track click
      if (onAdClick) {
        onAdClick(currentAd.id);
      }
      // Open link
      window.open(currentAd.cta_link, '_blank', 'noopener,noreferrer');
    }
  };

  if (!isVisible || !currentAd) {
    return null;
  }

  return (
    <div className={cn(
      "absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm",
      className
    )}>
      <div className="relative w-full h-full max-w-6xl max-h-4xl mx-auto">
        {/* Background Image */}
        <div className="relative w-full h-full overflow-hidden rounded-lg">
          <img
            src={currentAd.image_url}
            alt={currentAd.title}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-500",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Left-aligned dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
          
          {/* Content Container */}
          <div className="absolute inset-0 flex items-center">
            <div className="w-full max-w-md p-8 ml-8">
              {/* Company Logo */}
              {currentAd.company_logo_url && (
                <div className="mb-6">
                  <img
                    src={currentAd.company_logo_url}
                    alt="Company Logo"
                    className="h-12 w-auto object-contain"
                  />
                </div>
              )}
              
              {/* Title */}
              <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                {currentAd.title}
              </h2>
              
              {/* Message */}
              <p className="text-lg text-gray-200 mb-8 leading-relaxed">
                {currentAd.message}
              </p>
              
              {/* CTA Button */}
              <Button
                onClick={handleCtaClick}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold transition-all duration-200 hover:scale-105"
              >
                {currentAd.cta_text}
                <ExternalLink className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full"
        >
          <X className="w-6 h-6" />
        </Button>
        
        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}
      </div>
      
      {/* Easy exit on background click */}
      <div 
        className="absolute inset-0 -z-10"
        onClick={onClose}
        role="button"
        aria-label="Close ad"
      />
    </div>
  );
}