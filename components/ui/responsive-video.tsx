'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveVideoProps {
  src: string;
  title?: string;
  className?: string;
  allowFullScreen?: boolean;
  autoPlay?: boolean;
}

/**
 * Responsive video component that maintains aspect ratio
 * and always fits within its container without overscaling
 */
export function ResponsiveVideo({
  src,
  title = 'Video Player',
  className = '',
  allowFullScreen = true,
  autoPlay = false
}: ResponsiveVideoProps) {
  return (
    <div className={cn("video-container", className)}>
      <iframe
        src={src}
        title={title}
        className="video-player"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen={allowFullScreen}
        style={{
          border: 'none',
          maxWidth: '100%',
          maxHeight: '100%',
          width: 'auto',
          height: 'auto'
        }}
      />
    </div>
  );
}

interface ResponsiveVideoContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Container that ensures any video content maintains proper aspect ratio
 */
export function ResponsiveVideoContainer({
  children,
  className = ''
}: ResponsiveVideoContainerProps) {
  return (
    <div className={cn("video-container", className)}>
      {children}
    </div>
  );
}