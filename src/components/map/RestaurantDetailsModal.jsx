"use client";
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import { FaTimes, FaStar, FaMapMarkerAlt, FaUtensils, FaPlus, FaUser, FaCalendarAlt } from 'react-icons/fa';

const RestaurantDetailsModal = ({ restaurant, onClose, onAddReview }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [debugInfo, setDebugInfo] = useState('');

  // Fetch reviews for this restaurant
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        console.log('=== DEBUGGING REVIEW FETCH ===');
        console.log('Restaurant ID:', restaurant.id);
        console.log('Restaurant data:', restaurant);
        
        setDebugInfo(`Searching for reviews with placeId: ${restaurant.id}`);
        
        // First, let's try to get all reviews to see what's in the database
        const allReviewsRef = collection(db, "reviews");
        const allReviewsSnapshot = await getDocs(allReviewsRef);
        
        console.log('Total reviews in database:', allReviewsSnapshot.size);
        
        const allReviews = allReviewsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('All reviews in database:', allReviews);
        
        // Now try the specific query - REMOVED orderBy to avoid index requirement
        const reviewsRef = collection(db, "reviews");
        const q = query(
          reviewsRef, 
          where("placeId", "==", restaurant.id)
        );
        
        const querySnapshot = await getDocs(q);
        console.log('Query result size:', querySnapshot.size);
        
        const reviewsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort by createdAt manually after fetching
        reviewsData.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB - dateA; // Sort by newest first
        });
        
        console.log('Fetched reviews for this place:', reviewsData);
        
        // If no reviews found with placeId, try alternative approaches
        if (reviewsData.length === 0) {
          console.log('No reviews found with placeId, trying alternative approaches...');
          
          // Try searching by venue name
          const qByName = query(
            reviewsRef,
            where("venueName", "==", restaurant.venueName)
          );
          const nameSnapshot = await getDocs(qByName);
          console.log('Reviews found by venue name:', nameSnapshot.size);
          
          if (nameSnapshot.size > 0) {
            const nameReviews = nameSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            console.log('Reviews by venue name:', nameReviews);
            setReviews(nameReviews);
            setDebugInfo(`Found ${nameReviews.length} reviews by venue name instead of placeId`);
          } else {
            // Try searching by coordinates (approximate match)
            const qByCoords = query(
              reviewsRef,
              where("lat", ">=", restaurant.lat - 0.001),
              where("lat", "<=", restaurant.lat + 0.001)
            );
            const coordsSnapshot = await getDocs(qByCoords);
            console.log('Reviews found by coordinates:', coordsSnapshot.size);
            
            if (coordsSnapshot.size > 0) {
              const coordsReviews = coordsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              console.log('Reviews by coordinates:', coordsReviews);
              setReviews(coordsReviews);
              setDebugInfo(`Found ${coordsReviews.length} reviews by coordinates instead of placeId`);
            } else {
              setReviews([]);
              setDebugInfo(`No reviews found. Searched by placeId: ${restaurant.id}, venueName: ${restaurant.venueName}, and coordinates.`);
            }
          }
        } else {
          setReviews(reviewsData);
          setDebugInfo(`Found ${reviewsData.length} reviews with placeId: ${restaurant.id}`);
        }
        
        // Calculate average rating
        if (reviewsData.length > 0) {
          const totalRatings = reviewsData.reduce((sum, review) => {
            const ratings = review.ratings;
            const avgRating = (ratings.food + ratings.cleanliness + ratings.service + 
                             ratings.valueForMoney + ratings.wouldReturn) / 5;
            return sum + avgRating;
          }, 0);
          setAverageRating(totalRatings / reviewsData.length);
        } else {
          setAverageRating(0);
        }
        
      } catch (error) {
        console.error("Error fetching reviews:", error);
        console.error("Error details:", error.message);
        setDebugInfo(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (restaurant?.id) {
      fetchReviews();
    } else {
      console.log('No restaurant ID provided');
      setLoading(false);
      setDebugInfo('No restaurant ID provided');
    }
  }, [restaurant?.id]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const getCategoryRating = (category, reviews) => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + (review.ratings[category] || 0), 0);
    return total / reviews.length;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
            <FaUtensils className="text-red-600" />
            <span>{restaurant.venueName}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Restaurant Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                  <FaUtensils className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {restaurant.venueName}
                </h3>
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <FaMapMarkerAlt className="w-4 h-4" />
                  <span className="text-sm">
                    Lat: {restaurant.lat?.toFixed(6)}, Lng: {restaurant.lng?.toFixed(6)}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <FaCalendarAlt className="w-4 h-4" />
                  <span className="text-sm">
                    Added: {formatDate(restaurant.createdAt)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Place ID: {restaurant.id}
                </div>
              </div>
            </div>
          </div>

          {/* Average Rating */}
          {reviews.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Overall Rating</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {renderStars(averageRating)}
                  <span className="text-2xl font-bold text-gray-800">
                    {averageRating.toFixed(1)}/5.0
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {/* Category Ratings */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Food</div>
                  {renderStars(getCategoryRating('food', reviews))}
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Cleanliness</div>
                  {renderStars(getCategoryRating('cleanliness', reviews))}
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Service</div>
                  {renderStars(getCategoryRating('service', reviews))}
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Value</div>
                  {renderStars(getCategoryRating('valueForMoney', reviews))}
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Would Return</div>
                  {renderStars(getCategoryRating('wouldReturn', reviews))}
                </div>
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">
                Reviews ({reviews.length})
              </h4>
              <button
                onClick={() => onAddReview(restaurant)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus className="w-4 h-4" />
                <span>Add Review</span>
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FaUtensils className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No reviews yet. Be the first to review this place!</p>
                <p className="text-xs text-gray-400 mt-2">
                  Looking for reviews with placeId: {restaurant.id}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Debug: Check console for more details
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {reviews.map((review) => {
                  const reviewAvgRating = (review.ratings.food + review.ratings.cleanliness + 
                                          review.ratings.service + review.ratings.valueForMoney + 
                                          review.ratings.wouldReturn) / 5;
                  
                  return (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <FaUser className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">User {review.userId?.slice(-6)}</div>
                            <div className="text-sm text-gray-500">
                              {formatDate(review.visitDate)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {renderStars(reviewAvgRating)}
                        </div>
                      </div>

                      {review.comment && (
                        <p className="text-gray-700 mb-3">{review.comment}</p>
                      )}

                      {/* Review Photos */}
                      {review.photos && review.photos.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          {review.photos.map((photo, index) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`Review photo ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}

                      {/* Individual Ratings */}
                      <div className="grid grid-cols-5 gap-2 text-xs">
                        <div className="text-center">
                          <div className="text-gray-600">Food</div>
                          <div className="font-medium">{review.ratings.food}/5</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600">Clean</div>
                          <div className="font-medium">{review.ratings.cleanliness}/5</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600">Service</div>
                          <div className="font-medium">{review.ratings.service}/5</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600">Value</div>
                          <div className="font-medium">{review.ratings.valueForMoney}/5</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600">Return</div>
                          <div className="font-medium">{review.ratings.wouldReturn}/5</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetailsModal;