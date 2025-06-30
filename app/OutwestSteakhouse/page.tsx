'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Calendar, Clock, Eye, TrendingUp, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { Header } from '@/components/layout/header';

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
  tagline: 'Where the Wild West Meets Fine Dining',
  description: 'Premium steakhouse experience with authentic Western atmosphere. From hand-cut steaks to signature bourbon cocktails, we bring the frontier spirit to fine dining.',
  logoPath: '/company-logos/outwest-steakhouse-logo.svg',
  brandColor: '#FF5C4D', // Red from SVG
  accentColor: '#FF5C4D20'
};

const SAMPLE_VIDEO_ADS: AdVideo[] = [
  {
    id: '1',
    title: 'Outwest Steakhouse - Prime Cut Excellence',
    description: 'Hand-selected, aged beef grilled to perfection',
    duration: '0:30',
    views: 18700,
    thumbnail: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=225&fit=crop',
    videoUrl: '#',
    category: 'Premium Steaks',
    createdAt: '2024-06-20'
  }
];

const SAMPLE_IMAGE_ADS: ImageAd[] = [
  {
    id: '1',
    title: 'Outwest Steakhouse - Sunday Rodeo Special',
    description: 'Weekly special featuring live country music',
    imageUrl: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=600&h=400&fit=crop',
    category: 'Events',
    clicks: 756,
    impressions: 13200,
    createdAt: '2024-06-18'
  },
  {
    id: '2',
    title: 'Outwest Steakhouse - Signature Cocktails',
    description: 'Craft cocktails with premium bourbon and whiskey',
    imageUrl: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&h=400&fit=crop',
    category: 'Beverages',
    clicks: 423,
    impressions: 8900,
    createdAt: '2024-06-15'
  }
];

export default function OutwestSteakhouseCampaignPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [videoAds, setVideoAds] = useState<AdVideo[]>(SAMPLE_VIDEO_ADS);
  const [imageAds, setImageAds] = useState<ImageAd[]>(SAMPLE_IMAGE_ADS);
  const [activeTab, setActiveTab] = useState<'video' | 'image'>('image');

  const videoCategories = ['All', ...Array.from(new Set(SAMPLE_VIDEO_ADS.map(ad => ad.category)))];
  const imageCategories = ['All', ...Array.from(new Set(SAMPLE_IMAGE_ADS.map(ad => ad.category)))];
  
  const filteredVideoAds = selectedCategory === 'All' 
    ? videoAds 
    : videoAds.filter(ad => ad.category === selectedCategory);
    
  const filteredImageAds = selectedCategory === 'All' 
    ? imageAds 
    : imageAds.filter(ad => ad.category === selectedCategory);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-900 text-white pt-[68px]">
      {/* Hero Section */}
      <div 
        className="relative py-16 px-6"
        style={{ 
          background: `linear-gradient(135deg, ${COMPANY_INFO.brandColor}CC, ${COMPANY_INFO.brandColor}88)`
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center p-2">
              <Image
                src={COMPANY_INFO.logoPath}
                alt={`${COMPANY_INFO.name} Logo`}
                width={80}
                height={80}
                className="object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling!.style.display = 'flex';
                }}
              />
              <div 
                className="w-full h-full bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-2xl"
                style={{ display: 'none' }}
              >
                OW
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2 text-white">{COMPANY_INFO.name}</h1>
              <p className="text-xl text-red-100 mb-4">{COMPANY_INFO.tagline}</p>
              <p className="text-red-100 max-w-2xl">{COMPANY_INFO.description}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/20 border-white/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Play className="w-8 h-8 text-white" />
                  <div>
                    <div className="text-2xl font-bold text-white">{videoAds.length}</div>
                    <div className="text-red-100 text-sm">Video Campaigns</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/20 border-white/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-8 h-8 text-white" />
                  <div>
                    <div className="text-2xl font-bold text-white">{imageAds.length}</div>
                    <div className="text-red-100 text-sm">Image Campaigns</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/20 border-white/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-white" />
                  <div>
                    <div className="text-2xl font-bold text-white">Active</div>
                    <div className="text-red-100 text-sm">Campaign Status</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex gap-4 mb-4">
            <Button
              variant={activeTab === 'video' ? "default" : "outline"}
              onClick={() => {
                setActiveTab('video');
                setSelectedCategory('All');
              }}
              style={{ backgroundColor: activeTab === 'video' ? COMPANY_INFO.brandColor : 'transparent', color: activeTab === 'video' ? '#fff' : '#fff' }}
            >
              <Play className="w-4 h-4 mr-2" />
              Video Ads ({videoAds.length})
            </Button>
            <Button
              variant={activeTab === 'image' ? "default" : "outline"}
              onClick={() => {
                setActiveTab('image');
                setSelectedCategory('All');
              }}
              style={{ backgroundColor: activeTab === 'image' ? COMPANY_INFO.brandColor : 'transparent', color: activeTab === 'image' ? '#fff' : '#fff' }}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Image Ads ({imageAds.length})
            </Button>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-2">
            {(activeTab === 'video' ? videoCategories : imageCategories).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                style={{ 
                  backgroundColor: selectedCategory === category ? COMPANY_INFO.brandColor : 'transparent',
                  color: selectedCategory === category ? '#fff' : '#fff'
                }}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Ad Grid */}
        {activeTab === 'video' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideoAds.map((ad) => (
              <Card key={ad.id} className="bg-gray-800 border-gray-700 overflow-hidden hover:bg-gray-750 transition-colors">
                <div className="relative">
                  <Image
                    src={ad.thumbnail}
                    alt={ad.title}
                    width={400}
                    height={225}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button
                      onClick={() => console.log('Playing ad:', ad.title)}
                      style={{ backgroundColor: COMPANY_INFO.brandColor, color: '#fff' }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Play Ad
                    </Button>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary">{ad.duration}</Badge>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-lg leading-tight">{ad.title}</CardTitle>
                  <CardDescription className="mt-2">{ad.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {ad.views.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(ad.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant="outline" style={{ borderColor: COMPANY_INFO.brandColor, color: COMPANY_INFO.brandColor }}>
                      {ad.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImageAds.map((ad) => (
              <Card key={ad.id} className="bg-gray-800 border-gray-700 overflow-hidden hover:bg-gray-750 transition-colors">
                <div className="relative cursor-pointer" onClick={() => console.log('Viewing image ad:', ad.title)}>
                  <Image
                    src={ad.imageUrl}
                    alt={ad.title}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 hover:bg-black/40 transition-colors" />
                </div>
                
                <CardHeader>
                  <CardTitle className="text-lg leading-tight">{ad.title}</CardTitle>
                  <CardDescription className="mt-2">{ad.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {ad.impressions.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(ad.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant="outline" style={{ borderColor: COMPANY_INFO.brandColor, color: COMPANY_INFO.brandColor }}>
                      {ad.category}
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {ad.clicks} clicks • {((ad.clicks / ad.impressions) * 100).toFixed(1)}% CTR
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {((activeTab === 'video' && filteredVideoAds.length === 0) || (activeTab === 'image' && filteredImageAds.length === 0)) && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No {activeTab} ads found for "{selectedCategory}"</div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}