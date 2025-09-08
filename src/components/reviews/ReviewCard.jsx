"use client";
import React from 'react';
import { FaStar, FaUser, FaCamera } from 'react-icons/fa';

const ReviewCard = ({ review }) => {
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

  // Calculate average rating
  const getAverageRating = (ratings) => {
    const total = ratings.food + ratings.cleanliness + ratings.service + 
                  ratings.valueForMoney + ratings.wouldReturn;
    return total / 5;
  };

  // Render stars
  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`w-3 h-3 ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-xs text-gray-600 ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const averageRating = getAverageRating(review.ratings);
  const relativeTime = getRelativeTime(review.createdAt);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-3">
        {/* User Avatar */}
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
          <FaUser className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </div>
        
        {/* Review Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {review.userId}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {relativeTime}
              </span>
            </div>
            {renderStars(averageRating)}
          </div>
          
          {/* Comment */}
          {review.comment && (
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 line-clamp-2">
              {review.comment}
            </p>
          )}
          
          {/* Photo */}
          {review.photos && review.photos.length > 0 && (
            <div className="mb-2">
              <img
                src={review.photos[0]}
                alt="Review photo"
                className="w-20 h-20 object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard; 