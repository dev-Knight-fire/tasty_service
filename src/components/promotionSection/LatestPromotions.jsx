"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView, useAnimation } from "framer-motion";
import { MapPin, Clock, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { useLang } from "@/contexts/LangContext";
import { collection, getDocs, getDoc, doc, query, where } from "firebase/firestore";
import { db } from "../../firebase/firestore";
import PromotionDetailModal from "./PromotionDetailModal";

const LatestPromotions = () => {
  const { messages } = useLang();
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.2 });
  
  // State management
  const [userLocation, setUserLocation] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in meters
  };

  // Get user location via IP address
  const getUserLocationByIP = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        return {
          lat: data.latitude,
          lng: data.longitude,
          city: data.city,
          country: data.country_name
        };
      } else {
        throw new Error('Unable to get location from IP');
      }
    } catch (error) {
      console.error('Error getting location by IP:', error);
      return getCurrentPosition();
    }
  };

  // Fallback to browser geolocation
  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            city: 'Current Location',
            country: ''
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  };

  // Fetch nearby promotions
  const fetchNearbyPromotions = async (userLat, userLng) => {
    try {
      setLoading(true);
      const now = new Date();
      
      // Get all active promotions that haven't ended yet
      const promotionsRef = collection(db, "promotions");
      const promotionsQuery = query(
        promotionsRef,
        where("status", "==", "active")
      );
      
      const promotionsSnapshot = await getDocs(promotionsQuery);
      const nearbyPromotions = [];

      for (const promotionDoc of promotionsSnapshot.docs) {
        const promotionData = {
          id: promotionDoc.id,
          ...promotionDoc.data()
        };

        // Check if promotion hasn't ended yet
        const endDateTime = promotionData.endDateTime?.toDate?.() || new Date(promotionData.endDateTime);
        if (endDateTime < now) continue;

        // Get place data
        try {
          const placeDoc = await getDoc(doc(db, "places", promotionData.placeId));
          if (!placeDoc.exists()) continue;

          const placeData = {
            id: placeDoc.id,
            ...placeDoc.data()
          };

          // Calculate distance
          const distance = calculateDistance(
            userLat, userLng,
            placeData.lat, placeData.lng
          );

          // Only include promotions within 2000m radius
          if (distance <= 2000) {
            nearbyPromotions.push({
              ...promotionData,
              place: placeData,
              distance: Math.round(distance)
            });
          }
        } catch (placeError) {
          console.error("Error fetching place data:", placeError);
        }
      }

      // Sort by distance (closest first)
      nearbyPromotions.sort((a, b) => a.distance - b.distance);
      
      setPromotions(nearbyPromotions);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      setError("Failed to load nearby promotions");
    } finally {
      setLoading(false);
    }
  };

  // Format relative time
  const formatRelativeTime = (startDateTime, endDateTime) => {
    const now = new Date();
    const start = startDateTime?.toDate?.() || new Date(startDateTime);
    const end = endDateTime?.toDate?.() || new Date(endDateTime);

    if (now < start) {
      // Promotion hasn't started yet
      const timeDiff = start - now;
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      
      if (days > 0) {
        return `in ${days} day${days > 1 ? 's' : ''}`;
      } else if (hours > 0) {
        return `in ${hours} hour${hours > 1 ? 's' : ''}`;
      } else {
        const minutes = Math.floor(timeDiff / (1000 * 60));
        return `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
      }
    } else if (now >= start && now < end) {
      // Promotion is active
      const timeDiff = end - now;
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      
      if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} left`;
      } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} left`;
      } else {
        const minutes = Math.floor(timeDiff / (1000 * 60));
        return `${minutes} minute${minutes > 1 ? 's' : ''} left`;
      }
    }
    
    return "Expired";
  };

  // Handle promotion card click
  const handlePromotionClick = (promotion) => {
    setSelectedPromotion(promotion);
    setShowModal(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowModal(false);
    setSelectedPromotion(null);
  };

  // Initialize location and fetch promotions
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLocationLoading(true);
        const location = await getUserLocationByIP();
        setUserLocation(location);
        await fetchNearbyPromotions(location.lat, location.lng);
      } catch (error) {
        console.error("Error initializing data:", error);
        setError("Unable to detect your location. Please enable location services.");
      } finally {
        setLocationLoading(false);
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  return (
    <>
      <section
        id="latest-promotions"
        ref={ref}
        className="py-24 bg-gradient-to-b from-white to-[#f6f5f1] dark:from-gray-800 dark:to-gray-900 dark:text-white overflow-hidden"
      >
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
            }}
            className="text-center mb-12"
          >
            <motion.h2 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              className="text-3xl sm:text-4xl font-bold mb-6 text-[#206645] dark:text-green-400"
            >
              Promotions near you Today
            </motion.h2>
            
            {userLocation && (
              <motion.p 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 } },
                }}
                className="text-lg text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2"
              >
                <MapPin className="h-5 w-5" />
                {userLocation.city}, {userLocation.country}
              </motion.p>
            )}
          </motion.div>

          {/* Loading State */}
          {(loading || locationLoading) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-12"
            >
              <Loader2 className="h-8 w-8 animate-spin text-[#206645] mr-3" />
              <span className="text-gray-600 dark:text-gray-300">
                {locationLoading ? "Detecting your location..." : "Finding nearby promotions..."}
              </span>
            </motion.div>
          )}

          {/* Error State */}
          {error && !loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-12 text-red-600 dark:text-red-400"
            >
              <AlertCircle className="h-6 w-6 mr-2" />
              {error}
            </motion.div>
          )}

          {/* Promotions Grid */}
          {!loading && !locationLoading && !error && (
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {promotions.length > 0 ? (
                promotions.map((promotion, index) => (
                  <motion.div
                    key={promotion.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                    }}
                    onClick={() => handlePromotionClick(promotion)}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
                  >
                    {/* Image */}
                    {promotion.photos && promotion.photos[0] && (
                      <div className="relative h-48 w-full">
                        <Image
                          src={promotion.photos[0]}
                          alt={promotion.place.venueName}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-md text-sm">
                          {promotion.distance}m away
                        </div>
                      </div>
                    )}

                    <div className="p-6">
                      {/* Place Name */}
                      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                        {promotion.place.venueName}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                        {promotion.description}
                      </p>

                      {/* Time Info */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-[#206645] dark:text-green-400">
                          <Clock className="h-4 w-4" />
                          {formatRelativeTime(promotion.startDateTime, promotion.endDateTime)}
                        </div>
                        
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <Calendar className="h-4 w-4" />
                          {new Date(promotion.endDateTime?.toDate?.() || promotion.endDateTime).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Click hint */}
                      <div className="mt-4 text-xs text-gray-400 text-center">
                        Click to view details
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                  }}
                  className="col-span-full text-center py-12"
                >
                  <div className="text-gray-500 dark:text-gray-400">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-medium mb-2">No promotions nearby</h3>
                    <p>There are currently no active promotions within 2km of your location.</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Modal */}
      {showModal && selectedPromotion && (
        <PromotionDetailModal 
          promotion={selectedPromotion} 
          onClose={handleModalClose} 
        />
      )}
    </>
  );
};

export default LatestPromotions;
