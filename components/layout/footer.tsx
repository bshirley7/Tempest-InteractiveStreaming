'use client';

import React from 'react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-zinc-800 mt-auto">
      <div className="container mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.svg" 
              alt="Tempest" 
              className="h-8 w-auto"
            />
          </div>

          {/* Essential Links */}
          <div className="flex items-center space-x-8 text-sm">
            <Link 
              href="/privacy" 
              className="text-gray-400 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms" 
              className="text-gray-400 hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>

        <Separator className="my-6 bg-zinc-800" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-gray-400">
            © {currentYear} Tempest. All rights reserved.
          </p>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>Interactive Streaming Platform</span>
            <span>•</span>
            <span>Built with Next.js</span>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-red-500 fill-current" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}