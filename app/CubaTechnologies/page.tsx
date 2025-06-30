'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Calendar, Eye, TrendingUp, Image as ImageIcon, Code, Cpu } from 'lucide-react';
import Image from 'next/image';

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
  name: 'Cuba Technologies',
  tagline: 'Show Me the Money!',
  description: 'AI/GPU Tech recruiting for Computer Science, AI/ML, and Engineering students. Your CUDA skills are worth millions. We\'ll show you what you\'ve got, and we\'ll show you the money!',
  logoPath: '/company-logos/cuba-technologies-logo.svg',
  brandColor: '#10B981',
  accentColor: '#10B98120'
};

const SAMPLE_IMAGE_ADS: ImageAd[] = [
  {
    id: '1',
    title: 'Cuba Tech - CUDA Developers Wanted',
    description: 'Your parallel computing skills are worth millions',
    imageUrl: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=600&h=400&fit=crop',
    category: 'GPU Computing',
    clicks: 1890,
    impressions: 34500,
    createdAt: '2024-06-22'
  },
  {
    id: '2',
    title: 'Cuba Tech - AI/ML Engineer Roles',
    description: 'Join the neural network revolution',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop',
    category: 'Machine Learning',
    clicks: 1420,
    impressions: 28900,
    createdAt: '2024-06-18'
  },
  {
    id: '3',
    title: 'Cuba Tech - Entry Level Programs',
    description: 'New grads welcome - we\'ll train you to be elite',
    imageUrl: 'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=600&h=400&fit=crop',
    category: 'Entry Level',
    clicks: 756,
    impressions: 18200,
    createdAt: '2024-06-15'
  }
];

export default function CubaTechnologiesCampaignPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [imageAds] = useState<ImageAd[]>(SAMPLE_IMAGE_ADS);
  
  const categories = ['All', ...Array.from(new Set(SAMPLE_IMAGE_ADS.map(ad => ad.category)))];
  const filteredImageAds = selectedCategory === 'All' ? imageAds : imageAds.filter(ad => ad.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative py-16 px-6 bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
            <div className="w-32 h-32 bg-gray-700 rounded-2xl flex items-center justify-center p-4 border border-gray-600">
              <Image
                src={COMPANY_INFO.logoPath}
                alt={`${COMPANY_INFO.name} Logo`}
                width={96}
                height={96}
                className="object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling!.style.display = 'flex';
                }}
              />
              <div 
                className="w-full h-full bg-gray-600 rounded-xl flex items-center justify-center text-white font-bold text-3xl"
                style={{ display: 'none' }}
              >
                CT
              </div>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white">{COMPANY_INFO.name}</h1>
              <p className="text-xl mb-4" style={{ color: COMPANY_INFO.brandColor }}>{COMPANY_INFO.tagline}</p>
              <p className="text-gray-300 max-w-2xl leading-relaxed">{COMPANY_INFO.description}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Code className="w-8 h-8" style={{ color: COMPANY_INFO.brandColor }} />
                  <div>
                    <div className="text-2xl font-bold text-white">{imageAds.length}</div>
                    <div className="text-gray-300 text-sm">Open Positions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Cpu className="w-8 h-8" style={{ color: COMPANY_INFO.brandColor }} />
                  <div>
                    <div className="text-2xl font-bold text-white">GPU</div>
                    <div className="text-gray-300 text-sm">Architecture Focus</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8" style={{ color: COMPANY_INFO.brandColor }} />
                  <div>
                    <div className="text-2xl font-bold text-white">Hiring</div>
                    <div className="text-gray-300 text-sm">Status</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Recruitment Campaigns</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                style={{ 
                  backgroundColor: selectedCategory === category ? COMPANY_INFO.brandColor : 'transparent',
                  color: '#fff'
                }}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImageAds.map((ad) => (
            <Card key={ad.id} className="bg-gray-800 border-gray-700 overflow-hidden hover:bg-gray-750 transition-colors">
              <div className="relative cursor-pointer">
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
                  {ad.clicks} clicks " {((ad.clicks / ad.impressions) * 100).toFixed(1)}% CTR
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredImageAds.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No positions found for "{selectedCategory}"</div>
          </div>
        )}
      </div>
    </div>
  );
}