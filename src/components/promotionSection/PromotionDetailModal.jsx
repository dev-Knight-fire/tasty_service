"use client";
import React, { useState } from 'react';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { FaTimes, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaPhone, FaExternalLinkAlt } from 'react-icons/fa';
import { useLang } from '@/contexts/LangContext';

const PromotionDetailModal = ({ promotion, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();
  const { messages } = useLang();

  if (!promotion) return null;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatRelativeTime = (startDateTime, endDateTime) => {
    const now = new Date();
    const start = startDateTime?.toDate?.() || new Date(startDateTime);
    const end = endDateTime?.toDate?.() || new Date(endDateTime);

    if (now < start) {
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

  const handlePlaceOnMap = () => {
    // Navigate to map with the place coordinates
    const mapUrl = `/map/all?lat=${promotion.place.lat}&lng=${promotion.place.lng}`;
    router.push(mapUrl);
    onClose(); // Close modal after navigation
  };

  const nextImage = () => {
    if (promotion.photos && promotion.photos.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === promotion.photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (promotion.photos && promotion.photos.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? promotion.photos.length - 1 : prev - 1
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center space-x-2">
            <FaMapMarkerAlt className="text-green-600" />
            <span>{promotion.place.venueName}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Images Section */}
          {promotion.photos && promotion.photos.length > 0 && (
            <div className="relative">
              <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-lg">
                <Image
                  src={promotion.photos[currentImageIndex]}
                  alt={`${promotion.place.venueName} promotion image ${currentImageIndex + 1}`}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
                
                {/* Image Navigation */}
                {promotion.photos.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
                
                {/* Image Counter */}
                {promotion.photos.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-sm">
                    {currentImageIndex + 1} / {promotion.photos.length}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Promotion Details */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                    {messages['promotiondetailsTitle']}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {promotion.description}
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <FaMapMarkerAlt className="w-4 h-4" />
                  <span className="text-sm">
                    {promotion.distance}m away
                  </span>
                </div>

                {promotion.phoneNumber && (
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <FaPhone className="w-4 h-4" />
                    <span className="text-sm">{promotion.phoneNumber}</span>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-600 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
                    {messages['timeinformationTitle']}
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                      <FaClock className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {formatRelativeTime(promotion.startDateTime, promotion.endDateTime)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <FaCalendarAlt className="w-4 h-4" />
                      <span className="text-sm">
                        Started: {formatDate(promotion.startDateTime)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <FaCalendarAlt className="w-4 h-4" />
                      <span className="text-sm">
                        Ends: {formatDate(promotion.endDateTime)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Place Information */}
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
            <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
              {messages['placeinformationTitle']}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <span className="font-medium">{messages['coordinatesTitle']}:</span><br />
                Lat: {promotion.place.lat?.toFixed(6)}<br />
                Lng: {promotion.place.lng?.toFixed(6)}
              </div>
              <div>
                <span className="font-medium">{messages['addedTitle']}:</span><br />
                {formatDate(promotion.place.createdAt)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handlePlaceOnMap}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaMapMarkerAlt className="w-4 h-4" />
              <span>{messages['placeonmapTitle']}</span>
            </button>
            
            <button
              onClick={onClose}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span>{messages['closeTitle']}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionDetailModal; 