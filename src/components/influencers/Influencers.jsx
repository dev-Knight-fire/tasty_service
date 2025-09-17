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
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();

  // ---- Realistic influencer profiles (fictional people, real avatar images) ----
  const influencerProfiles = [
    {
      id: "taste_traveler",
      name: "Wrocławskie Podróże Kulinarne",
      platform: "facebook",
      email: "wroclawskiejedzenie@wp.pl",
      handle: "@taste_traveler",
      avatar:
        "https://scontent-mad1-1.xx.fbcdn.net/v/t39.30808-1/347782622_2940399602763018_9217239028911356709_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=101&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=nYWKSwN2_UcQ7kNvwGdGoqI&_nc_oc=AdkZlk8kdxLtJ0p5ZkoTJ2VwSL21of9iKHFFevM503BB826_o5cHa6IFJJtsb6A2sv4&_nc_zt=24&_nc_ht=scontent-mad1-1.xx&_nc_gid=zhifa2skGrX3bVtFNlVDNg&oh=00_Afb0cysSAqLYdNXBjkOpy1qgs_EATyQ79FJeAu400IrnGQ&oe=68D02C83",
      followers: "864",
      location: { lat: 34.0522, lng: -118.2437, city: "Los Angeles" },
      verified: true,
    },
    {
      id: "chef_maria",
      name: "Karol Okrasa",
      platform: "facebook",
      email: "media@karolokrasa.pl",
      handle: "chefmaria.com",
      avatar:
        "https://scontent-ord5-1.xx.fbcdn.net/v/t39.30808-1/464323931_27259538276994727_6512463039352728143_n.jpg?stp=c0.0.467.467a_dst-jpg_s200x200_tt6&_nc_cat=101&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=XWgdQwm3Mo4Q7kNvwGIzVVF&_nc_oc=AdkNapYgs4CmBLTjxttzcFtVuNZR3hb2CmIhgXlb9djYtRhzQDDXnISkxCwpfGpYcsk&_nc_zt=24&_nc_ht=scontent-ord5-1.xx&_nc_gid=HbG-86kYMM32DaDnVa1gsw&oh=00_AfauAaUSENco15Tyd0-1IPItvZ_a2IsOqtoP2JW36aVUMg&oe=68D0503D",
      followers: "170",
      location: { lat: 41.8781, lng: -87.6298, city: "Chicago" },
      verified: true,
    },
    {
      id: "dessert_dreams",
      name: "Michel Moran",
      platform: "facebook",
      email: "doradcasmaku@doradcasmaku.pl",
      handle: "@dessert_dreams",
      avatar:
        "https://scontent.xx.fbcdn.net/v/t39.30808-1/340842473_735910868232539_3971283541904922713_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=108&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=20e-2FrUyYkQ7kNvwFXa5l9&_nc_oc=AdlM7H_RkWC-HEmJxw90BcpFywxDHY7A6eUFJlbFjmwo9ddanVZVhAvidzBkqvv_r2w&_nc_zt=24&_nc_ht=scontent.xx&_nc_gid=m98UPoUlRv3U_3ooLaeaQw&oh=00_AfaBojNW5WGQ7eSCyyhYo9WXSGe5jsbsSifL1bP-dP5J6A&oe=68D05A97",
      followers: "7",
      location: { lat: 37.7749, lng: -122.4194, city: "San Francisco" },
      verified: true,
    },
  ];

  // ---- Real content links (thumbnails + some direct mp4s) ----
  const mockContent = [
    {
      id: "2",
      influencerId: "taste_traveler",
      title: "Wrocławskie Podróże Kulinarne",
      description:
        "Największy wrocławski blog restauracyjno-podróżniczy. Od 2014 roku opisuję dla Was miejsca, w których warto jeść, a które lepiej omijać szerokim łukiem. Każda recenzja to szczera opinia oraz praktyczny przewodnik po kulinarnej mapie Wrocławia i najlepszych smakach, które oferuje to miasto.",
      thumbnail:
        "https://images.unsplash.com/photo-1516685018646-549198525c1b?q=80&w=1200&auto=format&fit=crop",
      type: "post",
      platform: "facebook",
      url: "https://www.facebook.com/share/16CwjNxWvH/?mibextid=wwXIfr",
      publishedAt: new Date("2025-09-17T15:45:00Z"),
      location: {
        lat: 51.108973,
        lng: 17.032672,
        city: "Wroclaw",
        venue: "",
      },
      website: "wroclawskiejedzenie.pl",
      engagement: { views: "890K", likes: "32K", comments: "850" },
    },
    {
      id: "4",
      influencerId: "chef_maria",
      title: "Udany posiłekto także przygoda",
      description:
        "Najzdolniejszy kucharz swojego pokolenia, odkrywca polskiej kuchni regionalnej. Jego Smaki czasu – kontynuacja kultowej Kuchni z Okrasą – już wkrótce znowu na antenie TVP2, zabierze widzów w pasjonującą kulinarną podróż pełną historii, tradycji oraz niezwykłych smaków polskich regionów.",
      thumbnail:
        "https://karolokrasa.pl/wp-content/uploads/section2.png",
      type: "article",
      platform: "facebook",
      url: "https://www.facebook.com/share/1EgQtAhjp1/?mibextid=wwXIfr",
      publishedAt: new Date("2025-09-17T09:20:00Z"),
      location: { lat: 52.232422, lng: 21.002222, city: "Warszawa", venue: "Hotel InterContinental, Emilii Platter 49, 00-125" },
      website: "karolokrasa.pl",
      engagement: { views: "125K", likes: "8.2K", comments: "340" },
    },
    {
      id: "5",
      influencerId: "dessert_dreams",
      title: "SPRAWDZONE PORADY KULINARNE",
      description:
        "DoradcaSmaku.pl to serwis dla miłośników gotowania, oferujący najlepsze, sprawdzone przepisy na wszystkie posiłki — od śniadań, przez obiady i kolacje, po desery, przekąski, ciasta i pieczywo. Znajdziesz tu także kulinarne porady, wideo przepisy oraz inspiracje na każdą okazję. Gotuj z nami i rozwijaj swoją pasję w przyjaznej społeczności pełnej smaków i nieskończonych pomysłów.",
      thumbnail:
        "https://ads.doradcasmaku.pl/www/images/2202284fd91cec57f65bdd85514e5643.jpg",
      type: "post",
      platform: "facebook",
      url: "https://www.facebook.com/share/1CSqPck6Gg/?mibextid=wwXIfr",
      publishedAt: new Date("2025-09-17T14:30:00Z"),
      location: {
        lat: 49.935154,
        lng: 18.581375,
        city: "Chlebowa 14, 44-337 Jastrzębie-Zdrój",
        venue: "Prymat sp. z o.o. ul.",
      },
      website: "doradcasmaku.pl",
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
  }, [user]);

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
                          {content.influencer.email} • {content.influencer.followers} followers
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
