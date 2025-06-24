'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Radio,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Github,
  Heart,
  ExternalLink
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'Live TV', href: '/live' },
    { label: 'Library', href: '/library' },
    { label: 'Analytics', href: '/analytics' },
    { label: 'Admin', href: '/admin' },
  ];

  const helpLinks = [
    { label: 'Help Center', href: '/help' },
    { label: 'Contact Support', href: '/support' },
    { label: 'System Status', href: '/status' },
    { label: 'Accessibility', href: '/accessibility' },
  ];

  const legalLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Community Guidelines', href: '/guidelines' },
  ];

  const socialLinks = [
    { icon: Twitter, label: 'Twitter', href: 'https://twitter.com/tempest' },
    { icon: Facebook, label: 'Facebook', href: 'https://facebook.com/tempest' },
    { icon: Instagram, label: 'Instagram', href: 'https://instagram.com/tempest' },
    { icon: Youtube, label: 'YouTube', href: 'https://youtube.com/tempest' },
    { icon: Github, label: 'GitHub', href: 'https://github.com/tempest' },
  ];

  const channels = [
    'Campus Pulse',
    'RetireWise', 
    'MindFeed',
    'Career Compass',
    'QuizQuest',
    'StudyBreak',
    'Wellness Wave',
    'How-To Hub',
  ];

  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand & Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Radio className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Tempest
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              Revolutionary streaming platform for universities with real-time engagement, 
              interactive features, and comprehensive analytics.
            </p>
            <div className="flex items-center space-x-4">
              {socialLinks.map((social, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-8 w-8 p-0"
                >
                  <Link href={social.href} target="_blank" rel="noopener noreferrer">
                    <social.icon className="h-4 w-4" />
                    <span className="sr-only">{social.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Channels */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Channels</h3>
            <ul className="space-y-2">
              {channels.slice(0, 6).map((channel, index) => (
                <li key={index}>
                  <Link 
                    href={`/live?channel=${channel.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {channel}
                  </Link>
                </li>
              ))}
              {channels.length > 6 && (
                <li>
                  <Link 
                    href="/live"
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
                  >
                    View all channels
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Support & Legal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Support</h3>
            <ul className="space-y-2">
              {helpLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            
            <div className="pt-2">
              <h4 className="text-sm font-semibold text-foreground mb-2">Contact</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span>support@tempest.edu</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>1-800-TEMPEST</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Tempest. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              {legalLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>for education</span>
          </div>
        </div>

        {/* Technology Attribution */}
        <div className="mt-6 pt-6 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground space-y-2 md:space-y-0">
            <div className="flex items-center space-x-4">
              <span>Powered by Cloudflare Stream</span>
              <span>•</span>
              <span>Built with Next.js</span>
              <span>•</span>
              <span>Hosted on Vercel</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Version 2.0.0</span>
              <span>•</span>
              <Link 
                href="/system-status" 
                className="hover:text-foreground transition-colors flex items-center gap-1"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                All systems operational
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}