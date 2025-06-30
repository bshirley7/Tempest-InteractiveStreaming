'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Calendar, Eye, TrendingUp, Image as ImageIcon, Clock, Truck, Star, MapPin, ChevronRight } from 'lucide-react';
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
  name: 'Hungry Hawk',
  tagline: 'Order Now. Or Go Hungry.',
  description: 'Food delivery with hawk mascot, 15-minute guarantee. When you&apos;re stuck in the library, HungryHawk swoops in with your favorite eats!',
  logoPath: '/company-logos/hungry-hawk-logo.svg',
  brandColor: '#FFF91A',
  accentColor: '#FFF91A20'
};

const heroContent = [
  {
    id: 1,
    title: "Wings That Soar",
    description: "Experience our signature spicy wings with our famous hawk sauce",
    thumbnail: "https://pub-d9c4b95565b6412297d31adfcf35620b.r2.dev/HungryHawkFood.png",
    category: "Product Spotlight"
  },
  {
    id: 2,
    title: "Speed Service",
    description: "15-minute delivery guarantee to dorms and campus locations",
    thumbnail: "https://pub-d9c4b95565b6412297d31adfcf35620b.r2.dev/HungryHawk_AdImage_Final_01.jpg",
    category: "Service Excellence"
  },
  {
    id: 3,
    title: "Late Night Fuel",
    description: "Open until 3 AM for those marathon study sessions",
    thumbnail: "https://pub-d9c4b95565b6412297d31adfcf35620b.r2.dev/3HungryHawk_12.jpg",
    category: "Late Night"
  }
];

const features = [
  {
    icon: Clock,
    title: "15-Minute Promise",
    description: "Fast delivery to dorms and campus locations with real-time tracking"
  },
  {
    icon: Truck,
    title: "Campus Coverage",
    description: "Delivering to all residence halls, library, and study areas"
  },
  {
    icon: Star,
    title: "Student Favorites",
    description: "Menu curated for broke college students with bold flavors"
  },
  {
    icon: MapPin,
    title: "GPS Precision",
    description: "Find you anywhere on campus, even in the darkest study corner"
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
        title: 'Hungry Hawk - Order Now. Or Go Hungry.',
        description: '',
        duration: '0:15',
        views: 1250,
        thumbnail: '',
        videoUrl: '#',
        category: 'AI Generated Advertisement',
        createdAt: '2024-06-15'
      },
      {
        id: '2',
        title: 'Hungry Hawk - Speed Service',
        description: 'Fast-casual dining that respects your time',
        duration: '0:45',
        views: 8900,
        thumbnail: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=225&fit=crop',
        videoUrl: '#',
        category: 'Service Excellence',
        createdAt: '2024-06-10'
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
        title: 'Hungry Hawk - Grand Opening Special',
        description: 'Limited time offer for our new location opening',
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop',
        category: 'Promotions',
        clicks: 892,
        impressions: 15400,
        createdAt: '2024-06-20'
      },
      {
        id: '2',
        title: 'Hungry Hawk - Family Pack Deal',
        description: 'Feed the whole family with our value pack',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop',
        category: 'Family Dining',
        clicks: 654,
        impressions: 12100,
        createdAt: '2024-06-18'
      }
    ]
  }
];

export default function HungryHawkCampaignPage() {
  const [selectedContent, setSelectedContent] = useState(0);
  const [companyVideos, setCompanyVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auto-fetch videos for this company
  useEffect(() => {
    const companyKey = COMPANY_INFO.name.replace(/\s+/g, ''); // "HungryHawk"
    
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

  }, []);

  // Handle video play - navigate to watch page
  const handleVideoPlay = (video) => {
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
                    e.currentTarget.nextElementSibling!.style.display = 'flex';
                  }}
                />
                <div 
                  className="w-52 h-52 flex items-center justify-center text-white font-bold text-6xl drop-shadow-2xl"
                  style={{ display: 'none' }}
                >
                  HH
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
                  A parody of food delivery services like DoorDash, Uber Eats, and GrubHub. HungryHawk swoops in with your favorite eats faster than you can say &quot;15-minute guarantee&quot;!
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
                    ? "bg-yellow-400 w-24" 
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
                Marketing content showcasing HungryHawk&apos;s campus delivery experience
              </p>
            </motion.div>

            {/* Video Ads Section */}
            <div className="flex justify-center mb-12">
              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-full p-1">
                <div className="px-6 py-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg font-bold flex items-center gap-2">
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
                    {(dynamicAdCategories[0]?.ads || []).map((ad, index) => (
                    <motion.div
                      key={ad.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="bg-zinc-900/80 border-zinc-700/50 backdrop-blur-sm overflow-hidden hover:bg-zinc-800/80 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-yellow-500/20">
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
                              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold"
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
                            <Badge variant="outline" className="border-yellow-400 text-yellow-400">
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