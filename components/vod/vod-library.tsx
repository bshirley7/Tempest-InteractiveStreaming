'use client';

import { useState, useEffect } from 'react';
import { VODCard } from './vod-card';
import { VODGrid } from './vod-grid';
import { VODRow } from './vod-row';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Info } from 'lucide-react';
import Link from 'next/link';

interface VODContent {
  _id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: number;
  channel: string;
  metadata?: {
    tags?: string[];
    rating?: number;
    views?: number;
  };
}

export function VODLibrary() {
  const [heroContent, setHeroContent] = useState<VODContent[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [justAdded, setJustAdded] = useState<VODContent[]>([]);
  const [trending, setTrending] = useState<VODContent[]>([]);
  const [educational, setEducational] = useState<VODContent[]>([]);
  const [documentaries, setDocumentaries] = useState<VODContent[]>([]);

  useEffect(() => {
    // Mock hero content matching HBO Max style
    const mockHeroContent: VODContent[] = [
      {
        _id: 'hero-1',
        title: 'HARD KNOCKS',
        description: 'The Emmy-winning show returns for a new in-season edition.',
        thumbnailUrl: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=1920',
        duration: 3600,
        channel: 'ESPN University',
        metadata: {
          tags: ['sports', 'documentary'],
          rating: 4.8,
          views: 125000
        }
      },
      {
        _id: 'hero-2',
        title: 'QUANTUM PHYSICS',
        description: 'Explore the fascinating world of quantum mechanics and its real-world applications.',
        thumbnailUrl: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=1920',
        duration: 5400,
        channel: 'MIT',
        metadata: {
          tags: ['science', 'physics'],
          rating: 4.9,
          views: 89000
        }
      }
    ];

    // Mock content for different sections
    const mockJustAdded: VODContent[] = [
      {
        _id: '1',
        title: 'Advanced Machine Learning',
        description: 'Deep dive into neural networks and AI algorithms',
        thumbnailUrl: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=400',
        duration: 7200,
        channel: 'Computer Science Dept',
        metadata: {
          tags: ['AI', 'Machine Learning'],
          rating: 4.7,
          views: 45000
        }
      },
      {
        _id: '2',
        title: 'Organic Chemistry Lab',
        description: 'Hands-on laboratory techniques and procedures',
        thumbnailUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
        duration: 5400,
        channel: 'Chemistry Department',
        metadata: {
          tags: ['Chemistry', 'Laboratory'],
          rating: 4.5,
          views: 32000
        }
      },
      {
        _id: '3',
        title: 'Modern Art History',
        description: 'Exploring contemporary artistic movements',
        thumbnailUrl: 'https://images.pexels.com/photos/1193743/pexels-photo-1193743.jpeg?auto=compress&cs=tinysrgb&w=400',
        duration: 4800,
        channel: 'Art History',
        metadata: {
          tags: ['Art', 'History'],
          rating: 4.6,
          views: 28000
        }
      },
      {
        _id: '4',
        title: 'Calculus Fundamentals',
        description: 'Essential calculus concepts and applications',
        thumbnailUrl: 'https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg?auto=compress&cs=tinysrgb&w=400',
        duration: 6000,
        channel: 'Mathematics',
        metadata: {
          tags: ['Math', 'Calculus'],
          rating: 4.8,
          views: 67000
        }
      }
    ];

    setHeroContent(mockHeroContent);
    setJustAdded(mockJustAdded);
    setTrending(mockJustAdded.slice(0, 3));
    setEducational(mockJustAdded);
    setDocumentaries(mockJustAdded.slice(1, 4));
  }, []);

  // Auto-rotate hero content
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroContent.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [heroContent.length]);

  const currentHero = heroContent[currentHeroIndex];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      {currentHero && (
        <VODCard
          content={currentHero}
          variant="hero"
          className="mb-8"
        />
      )}

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-8">
        {/* Just Added - 16:9 Row */}
        <VODRow
          title="Just Added"
          subtitle="Latest content from our university partners"
          content={justAdded}
          variant="large"
          aspectRatio="16:9"
          className="mb-12"
        />

        {/* Trending - Poster Format Row */}
        <VODRow
          title="Trending Now"
          subtitle="Popular content this week"
          content={trending}
          variant="default"
          aspectRatio="poster"
          className="mb-12"
        />

        {/* Educational Content - Grid */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Educational Content</h2>
            <p className="text-gray-400">Comprehensive learning materials</p>
          </div>
          <VODGrid
            content={educational}
            variant="default"
            aspectRatio="16:9"
            columns={{ mobile: 2, tablet: 3, desktop: 4 }}
          />
        </div>

        {/* Documentaries - Poster Grid */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Documentaries</h2>
            <p className="text-gray-400">In-depth explorations and stories</p>
          </div>
          <VODGrid
            content={documentaries}
            variant="default"
            aspectRatio="poster"
            columns={{ mobile: 3, tablet: 4, desktop: 6 }}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/icon.svg" 
                alt="Tempest" 
                className="h-8 w-8"
              />
              <span className="text-white text-lg font-bold">Tempest University</span>
            </div>
            <div className="text-gray-400 text-sm">
              curated by University Partners
            </div>
          </div>
          
          <div className="mt-6 text-center text-gray-500 text-sm">
            © 2024 Tempest University. All rights reserved.
          </div>
          
          <div className="mt-4 flex justify-center space-x-6 text-gray-400 text-sm">
            <a href="#" className="hover:text-white">Audio Description</a>
            <a href="#" className="hover:text-white">Do Not Sell or Share My Personal Information</a>
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Help</a>
            <a href="#" className="hover:text-white">Devices</a>
          </div>
        </div>
      </footer>
    </div>
  );
}