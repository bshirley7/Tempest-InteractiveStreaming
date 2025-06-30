'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Calendar, Eye, TrendingUp, Image as ImageIcon, Zap, Gamepad2, Trophy, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface AdVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  views: number;
  thumbnail: string;
  videoUrl: string;
  category: string;
  createdAt: string;
}

interface ImageAd {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  clicks: number;
  impressions: number;
  createdAt: string;
}

const COMPANY_INFO = {
  name: 'Liquid Thunder',
  tagline: 'Strike Your Thirst Dead!',
  description: 'A hilarious parody of Liquid Death, celebrating their outrageous marketing with our own spin. Murder your thirst with this energy drink that&apos;s more metal than a concert in a thunderstorm!',
  logoPath: '/company-logos/liquid-thunder-logo.svg',
  brandColor: '#3B82F6',
  accentColor: '#3B82F620'
};

const heroContent = [
  {
    id: 1,
    title: "Strike Your Thirst Dead",
    description: "Murder your thirst with explosive energy that&apos;s more metal than your playlist",
    thumbnail: "https://pub-d9c4b95565b6412297d31adfcf35620b.r2.dev/LiquidThunder_AdImage_08.png",
    category: "Energy Boost",
    useAdImage: true,
    adIndex: 0
  },
  {
    id: 2,
    title: "Gaming Domination",
    description: "Destroy noobs with sustained energy that&apos;s deadlier than a headshot",
    thumbnail: "https://pub-d9c4b95565b6412297d31adfcf35620b.r2.dev/LiquidThunder_AdImage_07.png",
    category: "Gaming",
    useAdImage: true,
    adIndex: 1
  },
  {
    id: 3,
    title: "Athletic Annihilation",
    description: "Obliterate your competition with energy that strikes like thunder",
    thumbnail: "https://pub-d9c4b95565b6412297d31adfcf35620b.r2.dev/LiquidThunder_AdImage_06.png",
    category: "Sports",
    useAdImage: true,
    adIndex: 2
  }
];

const features = [
  {
    icon: Zap,
    title: "Natural Caffeine",
    description: "Clean energy from natural sources without the crash"
  },
  {
    icon: Trophy,
    title: "Athletic Performance",
    description: "Trusted by pro athletes for peak performance"
  },
  {
    icon: Gamepad2,
    title: "Gaming Endurance",
    description: "Sustained focus for competitive gaming sessions"
  },
  {
    icon: Eye,
    title: "Mental Clarity",
    description: "Enhanced focus and cognitive performance"
  }
];

const adCategories = [
  {
    name: "Video Ads",
    title: "Dynamic Campaigns",
    description: "High-impact video content showcasing our brand",
    ads: [
      {
        id: '1',
        title: 'Liquid Thunder - Strike Your Thirst Dead!',
        description: 'Explosive energy for extreme performance',
        duration: '0:30',
        views: 24500,
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=225&fit=crop',
        videoUrl: '#',
        category: 'AI Generated Advertisement',
        createdAt: '2024-06-15'
      },
      {
        id: '2',
        title: 'Liquid Thunder - Gaming Focus',
        description: 'Sustained energy for competitive gaming',
        duration: '0:45',
        views: 18700,
        thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=225&fit=crop',
        videoUrl: '#',
        category: 'Gaming Performance',
        createdAt: '2024-06-10'
      },
      {
        id: '3',
        title: 'Liquid Thunder - Athletic Performance',
        description: 'Natural energy for peak athletic performance',
        duration: '0:35',
        views: 31200,
        thumbnail: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=225&fit=crop',
        videoUrl: '#',
        category: 'Sports Performance',
        createdAt: '2024-06-08'
      }
    ]
  },
  {
    name: "Image Ads",
    title: "Visual Marketing",
    description: "Static campaigns optimized for social and display",
    ads: [
      {
        id: '1',
        title: 'Liquid Thunder - Extreme Sports Edition',
        description: 'Fuel your adrenaline with explosive energy',
        imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=400&fit=crop',
        category: 'Sports Performance',
        clicks: 1240,
        impressions: 25600,
        createdAt: '2024-06-22'
      },
      {
        id: '2',
        title: 'Liquid Thunder - Gaming Focus',
        description: 'Stay sharp through marathon gaming sessions',
        imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=400&fit=crop',
        category: 'Gaming',
        clicks: 1890,
        impressions: 31200,
        createdAt: '2024-06-16'
      },
      {
        id: '3',
        title: 'Liquid Thunder - Morning Power Boost',
        description: 'Start your day with thunderous energy',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
        category: 'Daily Energy',
        clicks: 756,
        impressions: 19400,
        createdAt: '2024-06-19'
      }
    ]
  }
];

export default function LiquidThunderCampaignPage() {
  const [selectedContent, setSelectedContent] = useState(0);
  const [companyVideos, setCompanyVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auto-fetch videos for this company
  useEffect(() => {
    const companyKey = COMPANY_INFO.name.replace(/\s+/g, ''); // "LiquidThunder"
    
    // Fetch videos from API
    fetch(`/api/content/company?company=${companyKey}`)
      .then(res => res.json())
      .then(videos => {
        // Mark videos as AI-generated and add structured process info
        const aiVideos = videos.map((video: any) => ({
          ...video,
          generatedBy: 'AI',
          category: 'AI Generated Advertisement',
          process: 'Structured Prompting & AI Generation'
        }));
        setCompanyVideos(aiVideos);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching company videos:', err);
        setLoading(false);
      });

  }, []);

  // Handle video play - navigate to watch page
  const handleVideoPlay = (video: any) => {
    // Navigate to the watch page for this video
    window.location.href = video.videoUrl;
  };

  // Dynamic ad categories using fetched videos only
  const dynamicAdCategories = [
    {
      name: "Video Ads",
      title: "AI-Generated Video Content",
      description: "AI-powered video advertisements created through structured prompting and automated generation",
      ads: Array.isArray(companyVideos) ? companyVideos : []
    }
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black text-white overflow-x-hidden">
        
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src={heroContent[selectedContent].thumbnail}
              alt="Hero background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex items-center gap-12">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Image
                  src={COMPANY_INFO.logoPath}
                  alt={`${COMPANY_INFO.name} Logo`}
                  width={200}
                  height={200}
                  className="object-contain opacity-90 hover:opacity-100 transition-opacity duration-300 drop-shadow-2xl"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
                  }}
                />
                <div 
                  className="w-52 h-52 flex items-center justify-center text-white font-bold text-6xl drop-shadow-2xl"
                  style={{ display: 'none' }}
                >
                  LT
                </div>
              </div>

              {/* Hero Text */}
              <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                  {COMPANY_INFO.name}
                </h1>
                <p className="text-2xl md:text-3xl font-bold mb-6" style={{ color: COMPANY_INFO.brandColor }}>
                  {COMPANY_INFO.tagline}
                </p>
                <p className="text-xl md:text-2xl text-gray-300 mb-8">
                  A hilarious parody of Liquid Death, celebrating their outrageous marketing with our own spin. Murder your thirst with this energy drink that&apos;s more metal than a concert in a thunderstorm!
                </p>
                
              </motion.div>
              </div>
            </div>
          </div>

          {/* Content Selector */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
            {heroContent.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedContent(index)}
                className={cn(
                  "w-16 h-1 rounded-full transition-all",
                  selectedContent === index 
                    ? "bg-blue-400 w-24" 
                    : "bg-white/30 hover:bg-white/50"
                )}
              />
            ))}
          </div>
        </section>

        {/* Ad Campaigns Section */}
        <section className="py-24 bg-zinc-950">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Our Ad Campaigns
              </h2>
              <p className="text-xl text-gray-400">
                Marketing content showcasing Liquid Thunder&apos;s explosive energy experience
              </p>
            </motion.div>

            {/* Video Ads Section */}
            <div className="flex justify-center mb-12">
              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-full p-1">
                <div className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 text-white shadow-lg font-bold flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Video Ads
                </div>
              </div>
            </div>

            {/* Ad Campaign Content */}
            <div>
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold mb-4 text-white">
                  {dynamicAdCategories[0].title}
                </h3>
                <p className="text-gray-400 text-lg">
                  {dynamicAdCategories[0].description}
                </p>
              </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-lg">Loading company videos...</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {(dynamicAdCategories[0]?.ads || []).map((ad: any, index) => (
                    <motion.div
                      key={ad.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="bg-zinc-900/80 border-zinc-700/50 backdrop-blur-sm overflow-hidden hover:bg-zinc-800/80 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20">
                        <div className="relative">
                          <Image
                            src={ad.thumbnail || ad.imageUrl}
                            alt={ad.title}
                            width={400}
                            height={225}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 hover:bg-black/40 transition-colors" />
                          {ad.duration && (
                            <div className="absolute top-3 right-3">
                              <Badge variant="secondary">{ad.duration}</Badge>
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Button
                              size="lg"
                              className="bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold"
                              onClick={() => handleVideoPlay(ad)}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              {ad.duration ? 'Play Ad' : 'View Ad'}
                            </Button>
                          </div>
                        </div>
                        
                        <CardHeader>
                          <CardTitle className="text-lg leading-tight">{ad.title}</CardTitle>
                          <CardDescription className="mt-2">{ad.description}</CardDescription>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-gray-400">
                            <div className="flex items-center gap-4">
                              {ad.generatedBy && (
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                  <span className="text-blue-400 font-medium">AI Generated</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(ad.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <Badge variant="outline" className="border-blue-400 text-blue-400">
                              {ad.category}
                            </Badge>
                          </div>
                          {ad.process && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 italic">{ad.process}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                    ))}
                    {dynamicAdCategories[0]?.ads?.length === 0 && (
                      <div className="col-span-full text-center py-12">
                        <div className="text-gray-400 text-lg">
                          No {dynamicAdCategories[0]?.name.toLowerCase()} found for {COMPANY_INFO.name}
                        </div>
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>
        </section>

      </div>

    </>
  );
}