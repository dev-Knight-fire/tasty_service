"use client";
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import { FaStar, FaPlus, FaUser, FaCamera, FaUtensils } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ReviewDetailModal from './ReviewDetailModal';

const LatestReviews = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Fetch latest 5 reviews with place information
  useEffect(() => {
    const fetchLatestReviews = async () => {
      try {
        console.log('Starting to fetch reviews...');
        
        const reviewsRef = collection(db, "reviews");
        const q = query(
          reviewsRef,
          orderBy("createdAt", "desc"),
          limit(5)
        );
        
        const querySnapshot = await getDocs(q);
        console.log('Found reviews:', querySnapshot.size);
        
        const reviewsData = [];
        
        for (const docSnapshot of querySnapshot.docs) {
          const reviewData = {
            id: docSnapshot.id,
            ...docSnapshot.data()
          };
          
          console.log('Processing review:', reviewData.id, 'with placeId:', reviewData.placeId);
          
          // Fetch place information
          if (reviewData.placeId) {
            try {
              console.log('Fetching place data for placeId:', reviewData.placeId);
              const placeDoc = await getDoc(doc(db, "places", reviewData.placeId));
              
              if (placeDoc.exists()) {
                const placeData = {
                  id: placeDoc.id,
                  ...placeDoc.data()
                };
                reviewData.place = placeData;
                console.log('Place data loaded:', placeData);
              } else {
                console.log('Place document does not exist for placeId:', reviewData.placeId);
                reviewData.place = null;
              }
            } catch (error) {
              console.error("Error fetching place data for placeId", reviewData.placeId, ":", error);
              reviewData.place = null;
            }
          } else {
            console.log('No placeId found for review:', reviewData.id);
            reviewData.place = null;
          }
          
          reviewsData.push(reviewData);
        }
        
        console.log('Final reviews data:', reviewsData);
        setReviews(reviewsData);
      } catch (error) {
        console.error("Error fetching latest reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestReviews();
  }, []);

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

  // Truncate comment to 100 characters
  const truncateComment = (comment) => {
    if (!comment) return '';
    return comment.length > 100 ? comment.substring(0, 100) + '...' : comment;
  };

  // Handle review card click
  const handleReviewClick = (review) => {
    console.log('Review clicked:', review);
    console.log('Review place data:', review.place);
    setSelectedReview(review);
    setShowReviewModal(true);
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

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Latest Reviews
        </h3>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FaCamera className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No reviews yet. Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {/* Review Cards */}
          {reviews.map((review) => {
            const averageRating = getAverageRating(review.ratings);
            const relativeTime = getRelativeTime(review.createdAt);
            
            return (
              <div 
                key={review.id} 
                onClick={() => handleReviewClick(review)}
                className="aspect-square border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-800 cursor-pointer"
              >
                <div className="flex flex-col h-full">
                  {/* Place Info */}
                  {review.place && review.place.venueName && (
                    <div className="flex items-center space-x-2 mb-2">
                      <FaUtensils className="w-3 h-3 text-red-600" />
                      <p className="text-xs font-medium text-red-600 dark:text-red-400 truncate">
                        {review.place.venueName}
                      </p>
                    </div>
                  )}
                  
                  {/* User Info and Rating */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaUser className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {review.userId}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {relativeTime}
                        </p>
                      </div>
                    </div>
                    {renderStars(averageRating)}
                  </div>
                  
                  {/* Comment */}
                  {review.comment && (
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 flex-1">
                      {truncateComment(review.comment)}
                    </p>
                  )}
                  
                  {/* Photo */}
                  {review.photos && review.photos.length > 0 && (
                    <div className="mt-auto">
                      <img
                        src={review.photos[0]}
                        alt="Review photo"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Add Review Button */}
          <button
            onClick={() => router.push('/map/all')}
            className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-[#EAD7C2] hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 flex flex-col items-center justify-center text-center"
          >
            <FaPlus className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Add Review
            </span>
          </button>
        </div>
      )}

      {/* Review Detail Modal */}
      <ReviewDetailModal
        review={selectedReview}
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedReview(null);
        }}
      />

      {/* Add Review Modal would go here */}
      {showAddReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add Review
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              This would open the AddReviewModal component. You can integrate it here.
            </p>
            <button
              onClick={() => setShowAddReviewModal(false)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LatestReviews; 