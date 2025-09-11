"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useInView, useAnimation } from "framer-motion";
import {
  ExternalLink,
  MapPin,
  Clock,
  Users,
  Heart,
  MessageCircle,
  Play,
  Instagram,
  Youtube,
  Globe,
  Rss,
  X
} from "lucide-react";
import { useLang } from "@/contexts/LangContext";

/**
 * InfluencersGrid.jsx
 * A polished, production-ready Influencer content grid for Next.js (App Router).
 * - Uses real image/video links (Unsplash + cc0 sample MP4s)
 * - Works out of the box with <Image unoptimized> for remote hosts
 * - Geolocation (browser-first with IP fallback) to sort by "Near Me"
 * - Video lightbox modal for items that include an mp4
 * - Accessible, keyboard-navigable UI with smooth Framer Motion animations
 */

const Influencers = () => {
  const { messages } = useLang?.() || { messages: {} };
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.2 });

  const [userLocation, setUserLocation] = useState(null);
  const [influencerContent, setInfluencerContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'location'
  const [videoOpen, setVideoOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);

  // ---- Realistic influencer profiles (fictional people, real avatar images) ----
  const influencerProfiles = [
    {
      id: "foodie_adventures",
      name: "Foodie Adventures",
      platform: "youtube",
      handle: "@foodie_adventures",
      avatar:
        "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=160&h=160&fit=crop&crop=faces",
      followers: "2.3M",
      location: { lat: 40.7128, lng: -74.006, city: "New York" },
      verified: true,
    },
    {
      id: "taste_traveler",
      name: "Taste Traveler",
      platform: "instagram",
      handle: "@taste_traveler",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=160&h=160&fit=crop&crop=faces",
      followers: "1.8M",
      location: { lat: 34.0522, lng: -118.2437, city: "Los Angeles" },
      verified: true,
    },
    {
      id: "street_food_king",
      name: "Street Food King",
      platform: "tiktok",
      handle: "@street_food_king",
      avatar:
        "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=160&h=160&fit=crop&crop=faces",
      followers: "3.1M",
      location: { lat: 25.7617, lng: -80.1918, city: "Miami" },
      verified: false,
    },
    {
      id: "chef_maria",
      name: "Chef Maria",
      platform: "blog",
      handle: "chefmaria.com",
      avatar:
        "https://images.unsplash.com/photo-1544717305-996b815c338c?q=80&w=160&h=160&fit=crop&crop=faces",
      followers: "850K",
      location: { lat: 41.8781, lng: -87.6298, city: "Chicago" },
      verified: true,
    },
    {
      id: "dessert_dreams",
      name: "Dessert Dreams",
      platform: "instagram",
      handle: "@dessert_dreams",
      avatar:
        "https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?q=80&w=160&h=160&fit=crop&crop=faces",
      followers: "1.2M",
      location: { lat: 37.7749, lng: -122.4194, city: "San Francisco" },
      verified: true,
    },
  ];

  // ---- Real content links (thumbnails + some direct mp4s) ----
  const mockContent = [
    // {
    //   id: "1",
    //   influencerId: "foodie_adventures",
    //   title: "Best Pizza in NYC - Hidden Gems Revealed!",
    //   description:
    //     "After trying 50+ pizza places in NYC, here are the absolute best hidden gems that locals don't want you to know about...",
    //   thumbnail:
    //     "https://images.unsplash.com/photo-1548365328-9f547fb0953c?q=80&w=1200&auto=format&fit=crop",
    //   type: "video",
    //   platform: "youtube",
    //   url: "https://www.youtube.com/results?search_query=best+pizza+in+nyc",
    //   // cc0 sample video for in-app preview
    //   videoUrl:
    //     "https://archive.org/download/BigBuckBunny_328/BigBuckBunny_512kb.mp4",
    //   publishedAt: new Date("2024-01-15T10:30:00Z"),
    //   location: {
    //     lat: 40.73061,
    //     lng: -73.935242,
    //     city: "New York",
    //     venue: "Joe's Pizza",
    //   },
    //   engagement: { views: "2.1M", likes: "45K", comments: "1.2K" },
    // },
    {
      id: "2",
      influencerId: "taste_traveler",
      title: "LA's Most Instagrammable Brunch Spots",
      description:
        "These brunch spots in LA are not only delicious but also perfect for your Instagram feed. Here's my complete guide...",
      thumbnail:
        "https://images.unsplash.com/photo-1516685018646-549198525c1b?q=80&w=1200&auto=format&fit=crop",
      type: "post",
      platform: "instagram",
      url: "https://www.instagram.com/explore/tags/labrunch/",
      publishedAt: new Date("2024-01-14T15:45:00Z"),
      location: {
        lat: 34.0736,
        lng: -118.4004,
        city: "Los Angeles",
        venue: "The Butcher's Daughter",
      },
      engagement: { views: "890K", likes: "32K", comments: "850" },
    },
    // {
    //   id: "3",
    //   influencerId: "street_food_king",
    //   title: "Miami Street Food Tour - $20 Challenge",
    //   description:
    //     "Can I eat amazing street food in Miami for just $20? Let's find out in this epic food tour!",
    //   thumbnail:
    //     "https://images.unsplash.com/photo-1541542684-4bf3abe3b0d7?q=80&w=1200&auto=format&fit=crop",
    //   type: "video",
    //   platform: "tiktok",
    //   url: "https://www.tiktok.com/tag/miamistreetfood",
    //   videoUrl:
    //     "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    //   publishedAt: new Date("2024-01-13T20:15:00Z"),
    //   location: {
    //     lat: 25.7907,
    //     lng: -80.13,
    //     city: "Miami",
    //     venue: "Wynwood Food Trucks",
    //   },
    //   engagement: { views: "4.2M", likes: "180K", comments: "8.5K" },
    // },
    {
      id: "4",
      influencerId: "chef_maria",
      title: "Chicago Deep Dish Pizza Recipe - Restaurant Secrets",
      description:
        "I spent 3 months learning from Chicago's best pizza chefs. Here's the authentic deep dish recipe with all the secrets...",
      thumbnail:
        "https://images.unsplash.com/photo-1541823709867-1b206113eafd?q=80&w=1200&auto=format&fit=crop",
      type: "article",
      platform: "blog",
      url: "https://www.seriouseats.com/chicago-style-deep-dish-pizza-recipe-6751291",
      publishedAt: new Date("2024-01-12T09:20:00Z"),
      location: { lat: 41.8781, lng: -87.6298, city: "Chicago", venue: "Lou Malnati's" },
      engagement: { views: "125K", likes: "8.2K", comments: "340" },
    },
    {
      id: "5",
      influencerId: "dessert_dreams",
      title: "SF's Most Decadent Desserts - Sweet Tooth Paradise",
      description:
        "San Francisco has some of the most incredible dessert spots. Here are my top picks for when you need something sweet...",
      thumbnail:
        "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=1200&auto=format&fit=crop",
      type: "post",
      platform: "instagram",
      url: "https://www.instagram.com/explore/tags/sanfranciscodesserts/",
      publishedAt: new Date("2024-01-11T14:30:00Z"),
      location: {
        lat: 37.7849,
        lng: -122.4094,
        city: "San Francisco",
        venue: "Tartine Bakery",
      },
      engagement: { views: "650K", likes: "28K", comments: "1.1K" },
    },
  ];

  // ---- Geolocation helpers ----
  const getUserLocation = async () => {
    // Try browser geolocation first
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      const getPosition = () =>
        new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 0,
          })
        );
      try {
        const pos = await getPosition();
        return {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          city: "Your area",
          country: "",
        };
      } catch (e) {
        // ignored; will fall back to IP lookup
      }
    }

    // Fallback: IP-based (best-effort)
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      if (data?.latitude && data?.longitude) {
        return {
          lat: data.latitude,
          lng: data.longitude,
          city: data.city,
          country: data.country_name,
        };
      }
    } catch (error) {
      console.error("Error getting location:", error);
    }
    return null;
  };

  // Haversine distance (meters)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const formatDistance = (m) => {
    if (!m && m !== 0) return null;
    if (m < 1000) return `${Math.round(m)} m`;
    const km = m / 1000;
    return `${km.toFixed(km < 10 ? 1 : 0)} km`;
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case "youtube":
        return <Youtube className="w-4 h-4" />;
      case "instagram":
        return <Instagram className="w-4 h-4" />;
      case "tiktok":
        return <Globe className="w-4 h-4" />; // TikTok icon alternative
      case "blog":
        return <Rss className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  };

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        const location = await getUserLocation();
        setUserLocation(location);
        const processed = mockContent.map((content) => {
          const influencer = influencerProfiles.find(
            (inf) => inf.id === content.influencerId
          );
          const distance =
            location && content.location
              ? calculateDistance(
                  location.lat,
                  location.lng,
                  content.location.lat,
                  content.location.lng
                )
              : null;
          return { ...content, influencer, distance: distance ? Math.round(distance) : null };
        });
        setInfluencerContent(processed);
      } catch (err) {
        console.error("Error initializing data:", err);
        setError("Failed to load influencer content");
      } finally {
        setLoading(false);
      }
    };
    initializeData();
  }, []);

  // Sorting
  const sortedContent = [...influencerContent].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    } else if (sortBy === "location") {
      if (!a.distance && !b.distance) return 0;
      if (!a.distance) return 1;
      if (!b.distance) return -1;
      return a.distance - b.distance;
    }
    return 0;
  });

  useEffect(() => {
    if (isInView) controls.start("visible");
  }, [controls, isInView]);

  const openVideo = (item) => {
    if (!item?.videoUrl) return;
    setActiveVideo(item);
    setVideoOpen(true);
  };

  const closeVideo = () => {
    setVideoOpen(false);
    setActiveVideo(null);
  };

  return (
    <section
      ref={ref}
      className="relative py-24 bg-gradient-to-b from-white to-[#f6f5f1] dark:from-gray-800 dark:to-gray-900 dark:text-white overflow-hidden"
    >
      {/* Fancy blurred orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-[#206645]/20 blur-3xl" />
        <div className="absolute bottom-0 right-10 h-72 w-72 rounded-full bg-[#a66c44]/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.18 } },
          }}
          className="text-center mb-10"
        >
          <motion.h2
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
            }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 text-[#206645] dark:text-green-400"
          >
            What influencers recommend
          </motion.h2>

          {userLocation && (
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.06 } },
              }}
              className="text-lg text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2 mb-6"
            >
              <MapPin className="h-5 w-5" />
              Showing content near {userLocation.city}
              {userLocation.country ? `, ${userLocation.country}` : ""}
            </motion.p>
          )}

          {/* Sort Bar */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.12 } },
            }}
            role="tablist"
            aria-label="Sort content"
            className="inline-flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 shadow-inner"
          >
            <button
              role="tab"
              aria-selected={sortBy === "newest"}
              onClick={() => setSortBy("newest")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                sortBy === "newest"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-700/60"
              }`}
            >
              <Clock className="w-4 h-4" /> Newest
            </button>
            <button
              role="tab"
              aria-selected={sortBy === "location"}
              onClick={() => setSortBy("location")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                sortBy === "location"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-700/60"
              }`}
            >
              <MapPin className="w-4 h-4" /> Near me
            </button>
          </motion.div>
        </motion.div>

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white/70 dark:bg-gray-800/70 rounded-xl overflow-hidden shadow"
              >
                <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                <div className="p-6 space-y-3">
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-center text-red-600 dark:text-red-400 mt-4">{error}</p>
        )}

        {/* Content Grid */}
        {!loading && !error && (
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
            }}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {sortedContent.map((content) => (
              <motion.article
                key={content.id}
                variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden ring-1 ring-black/5 dark:ring-white/5 hover:shadow-xl transition-shadow duration-300"
              >
                {/* Thumbnail */}
                <div className="relative h-52 w-full">
                  <Image
                    src={content.thumbnail}
                    alt={content.title}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {/* Platform Badge */}
                  <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
                    {getPlatformIcon(content.platform)}
                    {content.platform}
                  </div>

                  {/* Video Play Button */}
                  {content.type === "video" && (
                    <button
                      onClick={() => openVideo(content)}
                      aria-label="Play preview video"
                      className="absolute inset-0 flex items-center justify-center focus:outline-none"
                    >
                      <span className="bg-black/50 rounded-full p-4 group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-white" />
                      </span>
                    </button>
                  )}

                  {/* Distance Badge */}
                  {content.distance && (
                    <div className="absolute top-3 right-3 bg-[#206645] text-white px-2 py-1 rounded-md text-xs">
                      {formatDistance(content.distance)} away
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white line-clamp-2">
                    {content.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm line-clamp-3">
                    {content.description}
                  </p>

                  {/* Location */}
                  {content.location && (
                    <div className="flex flex-wrap items-center gap-2 text-gray-500 dark:text-gray-400 mb-4 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {content.location.venue}, {content.location.city}
                      </span>
                      <a
                        href={`https://www.google.com/maps?q=${content.location.lat},${content.location.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-dotted underline-offset-4 hover:text-[#206645]"
                      >
                        Open map
                      </a>
                    </div>
                  )}

                  {/* Engagement Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {content.engagement.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {content.engagement.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {content.engagement.comments}
                    </div>
                  </div>

                  {/* Influencer Info */}
                  {content.influencer && (
                    <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="relative">
                        <Image
                          src={content.influencer.avatar}
                          alt={content.influencer.name}
                          width={40}
                          height={40}
                          unoptimized
                          className="rounded-full object-cover"
                        />
                        {content.influencer.verified && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg
                              className="w-2.5 h-2.5 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {content.influencer.name}
                        </div>
                        <div className="text-gray-500 dark:text-gray-300 text-xs">
                          {content.influencer.handle} • {content.influencer.followers} followers
                        </div>
                      </div>
                    </div>
                  )}

                  {/* External Link */}
                  <div className="flex items-center gap-3">
                    <a
                      href={content.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#206645] hover:bg-[#1a5237] text-white font-medium rounded-lg transition-colors duration-300 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" /> View at creator
                    </a>
                    {content.type === "video" && content.videoUrl && (
                      <button
                        onClick={() => openVideo(content)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <Play className="w-4 h-4" /> Preview
                      </button>
                    )}
                  </div>

                  {/* Time */}
                  <div className="mt-3 text-xs text-gray-400">
                    {formatRelativeTime(content.publishedAt)}
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}

        {/* No Content State */}
        {!loading && !error && sortedContent.length === 0 && (
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
            initial="hidden"
            animate="visible"
            className="text-center py-12"
          >
            <div className="text-gray-600 dark:text-gray-300">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">No influencer content found</h3>
              <p>Check back later for new recommendations from food influencers.</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Video Lightbox */}
      {videoOpen && activeVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={closeVideo}
          role="dialog"
          aria-modal="true"
          aria-label="Video preview"
        >
          <div
            className="relative w-full max-w-3xl bg-black rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeVideo}
              aria-label="Close preview"
              className="absolute top-2 right-2 z-10 rounded-full bg-white/90 text-gray-900 p-1.5 hover:bg-white"
            >
              <X className="w-5 h-5" />
            </button>
            <video
              src={activeVideo.videoUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-[60vh] object-contain bg-black"
            />
            <div className="p-4 bg-gray-900 text-gray-100">
              <div className="font-semibold">{activeVideo.title}</div>
              <div className="text-sm text-gray-300 line-clamp-2">
                {activeVideo.description}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
};

export default Influencers;
