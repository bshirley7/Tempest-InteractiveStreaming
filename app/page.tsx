'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { WelcomeSection } from '@/components/layout/welcome-section';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { 
  Play, 
  Users, 
  Tv, 
  BarChart3, 
  Globe,
  Check,
  ChevronRight,
  Shield,
  Zap,
  Building2,
  GraduationCap,
  Gamepad2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const heroContent = [
  {
    id: 1,
    title: "Global Tech Conference",
    description: "Interactive keynotes with real-time Q&A and audience engagement",
    thumbnail: "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080",
    category: "Business",
    viewers: "Live Demo Available"
  },
  {
    id: 2,
    title: "University Lecture Series",
    description: "Transform passive lectures into interactive learning experiences",
    thumbnail: "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080",
    category: "Education",
    viewers: "Interactive Features"
  },
  {
    id: 3,
    title: "Gaming Championship Live",
    description: "Engage viewers with polls, chat, and real-time interactions",
    thumbnail: "https://images.pexels.com/photos/7915437/pexels-photo-7915437.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080",
    category: "Entertainment",
    new: true
  }
]

const features = [
  {
    icon: BarChart3,
    title: "Interactive Data Collection",
    description: "Capture viewer engagement through polls, Q&A, and real-time interactions"
  },
  {
    icon: Zap,
    title: "Enhanced AVOD Targeting",
    description: "Leverage viewer insights and engagement data for more effective ad placement"
  },
  {
    icon: Users,
    title: "Enterprise Scale",
    description: "Built to support 5,000+ concurrent viewers with sub-500ms latency"
  },
  {
    icon: Shield,
    title: "Privacy-First Architecture",
    description: "Secure data collection with privacy considerations built into the foundation"
  }
]

const industries = [
  {
    icon: GraduationCap,
    name: "Universities",
    title: "Interactive Learning",
    description: "Engage students through interactive streaming",
    benefits: [
      "Real-time polls and Q&A",
      "Video overlay capabilities",
      "Student engagement insights",
      "Privacy-focused data collection"
    ],
    cta: "Explore Education",
    color: "from-purple-600 to-indigo-600"
  },
  {
    icon: Building2,
    name: "Businesses",
    title: "Corporate Communications",
    description: "Transform internal meetings and training",
    benefits: [
      "Interactive presentation features",
      "Secure streaming platform", 
      "Employee engagement tracking",
      "Scalable infrastructure"
    ],
    cta: "Explore Business",
    color: "from-blue-600 to-cyan-600"
  },
  {
    icon: Gamepad2,
    name: "Entertainment",
    title: "Content Creator Platform",
    description: "Build deeper connections with your audience",
    benefits: [
      "Audience participation tools",
      "Real-time polling system",
      "Viewer engagement features",
      "Multi-platform compatibility"
    ],
    cta: "Explore Entertainment",
    color: "from-pink-600 to-rose-600"
  }
]

function HomePageContent() {
  const { isLoaded, isSignedIn, user } = useUser();
  const searchParams = useSearchParams();
  
  const [mounted, setMounted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [selectedContent, setSelectedContent] = useState(0);
  const [selectedIndustry, setSelectedIndustry] = useState(0);

  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isClerkConfigured = publishableKey && publishableKey.trim() !== '';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-rotate hero content
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedContent((prev) => (prev + 1) % heroContent.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-purple"></div>
      </div>
    );
  }

  if (isClerkConfigured && !isSignedIn) {
    return <WelcomeSection />;
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        {/* Background Video/Image */}
        <div className="absolute inset-0">
          <img 
            src={heroContent[selectedContent].thumbnail}
            alt="Hero background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
        </div>

        {/* Logo in top right - positioned below header */}
        <div className="absolute top-24 right-8 z-20">
          <img 
            src="/white_circle_360x360.png"
            alt="Tempest Logo"
            className="w-24 h-24 md:w-32 md:h-32 opacity-90 hover:opacity-100 transition-opacity duration-300"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                First-Party Data
                <span className="text-transparent bg-clip-text bg-brand-gradient">
                  {" "}Meets AVOD
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8">
                Interactive streaming that captures valuable viewer insights through polls, 
                Q&A, and engagement features. Maximize your AVOD revenue with contextual 
                first-party data that advertisers trust.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/sign-up">
                  <Button size="lg" className="bg-brand-gradient hover:shadow-glow-brand text-white px-8 py-6 text-lg transition-all duration-300">
                    Start Free Trial
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="https://youtu.be/DU5wovu2nJM?si=o2mcOInWtaK4JQp3">
                  <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/10 text-white px-8 py-6 text-lg backdrop-blur-sm">
                    <Play className="mr-2 w-5 h-5" />
                    See Demo
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>5K+ Concurrent Viewers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>&lt;500ms Latency</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Enterprise Security</span>
                </div>
              </div>
            </motion.div>
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
                  ? "bg-white w-24" 
                  : "bg-white/30 hover:bg-white/50"
              )}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Interactive Streaming Platform
            </h2>
            <p className="text-xl text-gray-400">
              Collect first-party data through viewer engagement to enhance your AVOD performance
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-zinc-900 border-zinc-800 p-6 h-full hover:border-brand-purple/50 transition-all hover:shadow-lg hover:shadow-brand-purple/10">
                  <div className="w-12 h-12 bg-brand-gradient rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Solutions */}
      <section className="py-24 bg-gradient-to-r from-brand-purple/10 to-brand-blue/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built for Your Industry
            </h2>
            <p className="text-xl text-gray-400">
              Interactive streaming solutions across different sectors
            </p>
          </motion.div>

          {/* Industry Tabs */}
          <div className="flex justify-center mb-12">
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-full p-1 flex gap-2">
              {industries.map((industry, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedIndustry(index)}
                  className={cn(
                    "px-6 py-3 rounded-full transition-all duration-300 flex items-center gap-2",
                    selectedIndustry === index
                      ? "bg-brand-gradient text-white shadow-lg"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  <industry.icon className="w-4 h-4" />
                  {industry.name}
                </button>
              ))}
            </div>
          </div>

          {/* Industry Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedIndustry}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className={cn(
                    "w-16 h-16 rounded-lg flex items-center justify-center mb-6",
                    `bg-gradient-to-r ${industries[selectedIndustry].color}`
                  )}>
                    {React.createElement(industries[selectedIndustry].icon, { className: "w-8 h-8 text-white" })}
                  </div>
                  <h3 className="text-3xl font-bold mb-4">
                    {industries[selectedIndustry].title}
                  </h3>
                  <p className="text-xl text-gray-300 mb-6">
                    {industries[selectedIndustry].description}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {industries[selectedIndustry].benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/sign-up">
                    <Button className={cn(
                      "bg-gradient-to-r text-white hover:shadow-lg transition-all duration-300",
                      industries[selectedIndustry].color
                    )}>
                      {industries[selectedIndustry].cta}
                      <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
                <div className="relative">
                  <img 
                    src={heroContent[selectedIndustry].thumbnail}
                    alt={industries[selectedIndustry].name}
                    className="rounded-lg shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg" />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Use Cases
            </h2>
            <p className="text-xl text-gray-400">
              Interactive streaming applications across different content types
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {heroContent.map((content, index) => (
              <motion.div
                key={content.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onHoverStart={() => setHoveredCard(content.id)}
                onHoverEnd={() => setHoveredCard(null)}
                className="relative group cursor-pointer"
              >
                <div className="relative aspect-video overflow-hidden rounded-lg">
                  <img 
                    src={content.thumbnail}
                    alt={content.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Play button */}
                  <AnimatePresence>
                    {hoveredCard === content.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                          <Play className="w-8 h-8 text-black ml-1" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {content.category && (
                      <span className="px-3 py-1 bg-brand-purple/90 backdrop-blur text-xs font-semibold rounded-full">
                        {content.category}
                      </span>
                    )}
                    {content.new && (
                      <span className="px-3 py-1 bg-brand-pink/90 backdrop-blur text-xs font-semibold rounded-full">
                        NEW
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-lg font-semibold mb-1">{content.title}</h3>
                    <p className="text-sm text-gray-300 line-clamp-1">{content.description}</p>
                    {content.viewers && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-xs text-gray-300">{content.viewers}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Technical Specs Section */}
      <section className="py-24 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built for Scale and Performance
            </h2>
            <p className="text-xl text-gray-400">
              Enterprise-grade infrastructure ready for your needs
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, value: "5,000+", label: "Concurrent Viewers", detail: "Seamlessly supported" },
              { icon: Zap, value: "< 500ms", label: "Ultra-Low Latency", detail: "Real-time interactions" },
              { icon: Shield, value: "Enterprise", label: "Grade Security", detail: "Bank-level encryption" },
              { icon: Globe, value: "99.9%", label: "Uptime SLA", detail: "Reliable streaming" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 hover:border-brand-purple/50 transition-all">
                  <stat.icon className="w-10 h-10 text-brand-purple mx-auto mb-4" />
                  <div className="text-3xl font-bold mb-1 bg-gradient-to-r from-brand-purple to-purple-950 bg-clip-text text-transparent">
                    {stat.value === "< 500ms" ? (
                      <>{"<"}500ms</>
                    ) : (
                      stat.value
                    )}
                  </div>
                  <div className="text-white font-medium mb-2">{stat.label}</div>
                  <div className="text-sm text-gray-500">{stat.detail}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-t from-brand-purple/20 to-zinc-950">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Boost Your AVOD Revenue?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Start collecting first-party data through interactive streaming today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="bg-brand-gradient hover:shadow-glow-brand text-white px-8 py-6 text-lg transition-all duration-300">
                  <Zap className="mr-2 w-5 h-5" />
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/live">
                <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/10 text-white px-8 py-6 text-lg">
                  Request Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-purple"></div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}