'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Calendar, Eye, TrendingUp, Image as ImageIcon, Utensils, Star, Clock, Crown } from 'lucide-react';
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
  name: 'Outwest Steakhouse',
  tagline: 'All Meat. No Veg.',
  description: 'A playful parody of Outback Steakhouse, bringing the American frontier spirit to fine dining. No rules, just right... on the range! Saddle up for hand-cut steaks and signature bourbon cocktails.',
  logoPath: '/company-logos/outwest-steakhouse-logo.svg',
  brandColor: '#FF5C4D',
  accentColor: '#FF5C4D20'
};

const heroContent = [
  {
    id: 1,
    title: "Prime Cut Excellence",
    description: "Hand-selected, aged beef grilled to perfection with Western tradition",
    thumbnail: "https://pub-d9c4b95565b6412297d31adfcf35620b.r2.dev/Outwest_21.png",
    category: "Premium Steaks",
    useAdImage: true,
    adIndex: 0
  },
  {
    id: 2,
    title: "Western Atmosphere",
    description: "Authentic frontier dining experience with live country music",
    thumbnail: "https://pub-d9c4b95565b6412297d31adfcf35620b.r2.dev/Outwest_17.png",
    category: "Dining Experience",
    useAdImage: true,
    adIndex: 1
  },
  {
    id: 3,
    title: "Signature Cocktails",
    description: "Craft bourbon and whiskey cocktails with frontier flair",
    thumbnail: "https://pub-d9c4b95565b6412297d31adfcf35620b.r2.dev/OutWest_AdImage_04.jpg",
    category: "Beverages",
    useAdImage: true,
    adIndex: 2
  }
];

const features = [
  {
    icon: Utensils,
    title: "Prime Cut Steaks",
    description: "Hand-selected, aged beef grilled to perfection with authentic Western seasoning"
  },
  {
    icon: Star,
    title: "Five-Star Service",
    description: "Exceptional hospitality with the warmth of frontier tradition"
  },
  {
    icon: Clock,
    title: "Historic Ambiance",
    description: "Authentic Western atmosphere with rustic decor and live country music"
  },
  {
    icon: Crown,
    title: "Premium Experience",
    description: "Where fine dining meets the spirit of the American frontier"
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
        title: 'Outwest Steakhouse - Where the Wild West Meets Fine Dining',
        description: 'Experience the perfect blend of frontier spirit and culinary excellence',
        duration: '0:45',
        views: 32800,
        thumbnail: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=225&fit=crop',
        videoUrl: '#',
        category: 'AI Generated Advertisement',
        createdAt: '2024-06-15'
      },
      {
        id: '2',
        title: 'Outwest Steakhouse - Sunday Rodeo Special',
        description: 'Weekly special featuring live country music and dancing',
        duration: '0:30',
        views: 19400,
        thumbnail: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=400&h=225&fit=crop',
        videoUrl: '#',
        category: 'Weekly Events',
        createdAt: '2024-06-10'
      },
      {
        id: '3',
        title: 'Outwest Steakhouse - Signature Bourbon Collection',
        description: 'Explore our premium bourbon and whiskey selection',
        duration: '0:35',
        views: 24700,
        thumbnail: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=225&fit=crop',
        videoUrl: '#',
        category: 'Premium Beverages',
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
        title: 'Outwest Steakhouse - Prime Ribeye Special',
        description: 'Our signature 16oz ribeye with garlic butter and seasonal vegetables',
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=400&fit=crop',
        category: 'Premium Steaks',
        clicks: 1540,
        impressions: 28900,
        createdAt: '2024-06-22'
      },
      {
        id: '2',
        title: 'Outwest Steakhouse - Sunday Rodeo Special',
        description: 'Weekly special featuring live country music and line dancing',
        imageUrl: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=600&h=400&fit=crop',
        category: 'Events',
        clicks: 892,
        impressions: 16700,
        createdAt: '2024-06-18'
      },
      {
        id: '3',
        title: 'Outwest Steakhouse - Signature Cocktails',
        description: 'Craft cocktails with premium bourbon and whiskey selection',
        imageUrl: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&h=400&fit=crop',
        category: 'Beverages',
        clicks: 634,
        impressions: 12400,
        createdAt: '2024-06-15'
      }
    ]
  }
];

export default function OutwestSteakhouseCampaignPage() {
  const [selectedContent, setSelectedContent] = useState(0);
  const [selectedAdCategory, setSelectedAdCategory] = useState(0);
  const [companyVideos, setCompanyVideos] = useState([]);
  const [companyImages, setCompanyImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auto-fetch videos for this company
  useEffect(() => {
    const companyKey = COMPANY_INFO.name.replace(/\s+/g, ''); // "OutwestSteakhouse"
    
    // Fetch videos from API
    fetch(`/api/content/company?company=${companyKey}`)
      .then(res => res.json())
      .then(videos => {
        // Mark videos as AI-generated and add structured process info
        const aiVideos = videos.map(video => ({
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

    // Load images from localStorage (from advertising overlays)
    const savedImages = localStorage.getItem('r2AdImages');
    if (savedImages) {
      const allImages = JSON.parse(savedImages);
      const outwestImages = allImages.filter(img => img.company === companyKey);
      
      // Transform to match ad format
      const transformedImages = outwestImages.map(img => ({
        id: img.id,
        title: img.title,
        description: img.description,
        imageUrl: `https://pub-d9c4b95565b6412297d31adfcf35620b.r2.dev/${img.filename}`,
        category: 'AI Generated Advertisement',
        generatedBy: 'AI',
        process: 'Structured Prompting & AI Generation',
        createdAt: img.createdAt.split('T')[0]
      }));
      
      setCompanyImages(transformedImages);
    }
  }, []);

  // Handle video play - navigate to watch page
  const handleVideoPlay = (video) => {
    // Navigate to the watch page for this video
    window.location.href = video.videoUrl;
  };

  // Dynamic ad categories using fetched videos and images
  const dynamicAdCategories = [
    {
      name: "Video Ads",
      title: "AI-Generated Video Content",
      description: "AI-powered video advertisements created through structured prompting and automated generation",
      ads: Array.isArray(companyVideos) ? companyVideos : []
    },
    {
      name: "Image Ads", 
      title: "AI-Generated Visuals",
      description: "AI-powered advertisement images showcasing innovative creative technology",
      ads: Array.isArray(companyImages) ? companyImages : []
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
                    e.currentTarget.nextElementSibling!.style.display = 'flex';
                  }}
                />
                <div 
                  className="w-52 h-52 flex items-center justify-center text-white font-bold text-6xl drop-shadow-2xl"
                  style={{ display: 'none' }}
                >
                  OW
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
                  A playful parody of Outback Steakhouse, bringing the American frontier spirit to fine dining. No rules, just right... on the range! Saddle up for hand-cut steaks and signature bourbon cocktails.
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
                    ? "bg-red-500 w-24" 
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
                Marketing content showcasing Outwest Steakhouse's frontier dining experience
              </p>
            </motion.div>

            {/* Ad Category Tabs */}
            <div className="flex justify-center mb-12">
              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-full p-1 flex gap-2">
                {dynamicAdCategories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAdCategory(index)}
                    className={cn(
                      "px-6 py-3 rounded-full transition-all duration-300 flex items-center gap-2",
                      selectedAdCategory === index
                        ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg font-bold"
                        : "text-gray-400 hover:text-white"
                    )}
                  >
                    {index === 0 ? <Play className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Ad Campaign Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedAdCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center mb-12">
                  <h3 className="text-3xl font-bold mb-4 text-white">
                    {dynamicAdCategories[selectedAdCategory].title}
                  </h3>
                  <p className="text-gray-400 text-lg">
                    {dynamicAdCategories[selectedAdCategory].description}
                  </p>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-lg">Loading company videos...</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {(dynamicAdCategories[selectedAdCategory]?.ads || []).map((ad, index) => (
                    <motion.div
                      key={ad.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="bg-zinc-900/80 border-zinc-700/50 backdrop-blur-sm overflow-hidden hover:bg-zinc-800/80 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-red-500/20">
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
                              className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold"
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
                                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                                  <span className="text-red-400 font-medium">AI Generated</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(ad.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <Badge variant="outline" className="border-red-400 text-red-400">
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
                    {dynamicAdCategories[selectedAdCategory]?.ads?.length === 0 && (
                      <div className="col-span-full text-center py-12">
                        <div className="text-gray-400 text-lg">
                          No {dynamicAdCategories[selectedAdCategory]?.name.toLowerCase()} found for {COMPANY_INFO.name}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

      </div>

    </>
  );
}