"use client";
import React from 'react';
import { FaTimes, FaStar, FaMapMarkerAlt, FaCalendarAlt, FaUtensils, FaMap } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const ReviewDetailModal = ({ review, isOpen, onClose }) => {
  const router = useRouter();

  if (!isOpen || !review) return null;

  // Calculate relative time
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    const now = new Date();
    const reviewTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffInSeconds = Math.floor((now - reviewTime) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} sec ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} min ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hr ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }
  };

  // Format full date
  const formatFullDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Calculate average rating
  const getAverageRating = (ratings) => {
    const total = ratings.food + ratings.cleanliness + ratings.service + 
                  ratings.valueForMoney + ratings.wouldReturn;
    return total / 5;
  };

  // Render stars for modal (larger)
  const renderModalStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-2">({rating.toFixed(1)})</span>
      </div>
    );
  };

  // Handle browse to map
  const handleBrowseToMap = (place) => {
    if (place && place.lat && place.lng) {
      router.push(`/map/all?lat=${place.lat}&lng=${place.lng}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center space-x-2">
            <FaStar className="text-yellow-500" />
            <span>Review Details</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Place Information */}
          {review.place && review.place.venueName ? (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center space-x-2">
                <FaUtensils className="text-red-600" />
                <span>Place Information</span>
              </h4>
              <div className="space-y-2">
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Name:</span> {review.place.venueName}
                </p>
                {review.place.lat && review.place.lng && (
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Location:</span> 
                    Lat: {review.place.lat.toFixed(6)}, Lng: {review.place.lng.toFixed(6)}
                  </p>
                )}
                {review.place.createdAt && (
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Added:</span> {formatFullDate(review.place.createdAt)}
                  </p>
                )}
              </div>
              
              {/* Browse to Map Button */}
              {review.place.lat && review.place.lng && (
                <div className="mt-4">
                  <button
                    onClick={() => handleBrowseToMap(review.place)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <FaMap className="w-4 h-4" />
                    <span>Browse to Map</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center space-x-2">
                <FaUtensils className="text-red-600" />
                <span>Place Information</span>
              </h4>
              <p className="text-gray-700 dark:text-gray-300">
                Place information not available. 
                {review.placeId ? ` Place ID: ${review.placeId}` : ' No placeId found.'}
              </p>
            </div>
          )}

          {/* User Information */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <FaStar className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  {review.userId}
                </h3>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 mb-2">
                  <FaCalendarAlt className="w-4 h-4" />
                  <span className="text-sm">
                    {formatFullDate(review.createdAt)}
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {getRelativeTime(review.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Overall Rating */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Overall Rating</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {renderModalStars(getAverageRating(review.ratings))}
                <span className="text-2xl font-bold text-gray-800 dark:text-white">
                  {getAverageRating(review.ratings).toFixed(1)}/5.0
                </span>
              </div>
            </div>
          </div>

          {/* Individual Ratings */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Detailed Ratings</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Food</div>
                {renderModalStars(review.ratings.food)}
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Cleanliness</div>
                {renderModalStars(review.ratings.cleanliness)}
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Service</div>
                {renderModalStars(review.ratings.service)}
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Value</div>
                {renderModalStars(review.ratings.valueForMoney)}
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Would Return</div>
                {renderModalStars(review.ratings.wouldReturn)}
              </div>
            </div>
          </div>

          {/* Comment */}
          {review.comment && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Comment</h4>
              <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
            </div>
          )}

          {/* Photos */}
          {review.photos && review.photos.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Photos</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {review.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Review photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Visit Date */}
          {review.visitDate && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Visit Date</h4>
              <p className="text-gray-700 dark:text-gray-300">
                {review.visitDate.toDate ? 
                  review.visitDate.toDate().toLocaleDateString() : 
                  new Date(review.visitDate).toLocaleDateString()
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewDetailModal; 