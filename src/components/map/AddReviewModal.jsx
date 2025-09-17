"use client";
import { serverTimestamp, addDoc, collection, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../../firebase/firestore";
import React, { useState } from "react";
import { FaTimes, FaStar, FaCamera, FaMapMarkerAlt } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext"; // Assuming you have an auth context

const AddReviewModal = ({ isOpen, onClose, location, onSubmit, restaurant, mode = "add", initialReview = null, initialPlace = null }) => {
  const { user } = useAuth(); // Get current user
  
  // Determine if this is for an existing restaurant or a new place
  const isExistingRestaurant = !!(restaurant?.id || initialPlace?.id);
  
  const [formData, setFormData] = useState({
    venueName: initialPlace?.venueName || restaurant?.venueName || "", // Pre-fill with place name if available
    visitDate: initialReview?.visitDate ? (initialReview.visitDate.toDate ? initialReview.visitDate.toDate().toISOString().split('T')[0] : new Date(initialReview.visitDate).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
    ratings: initialReview?.ratings || {
      food: 0,
      cleanliness: 0,
      service: 0,
      valueForMoney: 0,
      wouldReturn: 0
    },
    comment: initialReview?.comment || "",
    photos: initialReview?.photos || []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when restaurant changes
  React.useEffect(() => {
    if (restaurant?.venueName && !initialPlace?.venueName) {
      setFormData(prev => ({
        ...prev,
        venueName: restaurant.venueName
      }));
    }
  }, [restaurant?.venueName, initialPlace?.venueName]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (category, rating) => {
    setFormData(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [category]: rating
      }
    }));
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      alert("Maximum 3 photos allowed");
      return;
    }
    setFormData(prev => ({
      ...prev,
      photos: files
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.venueName.trim() && !isExistingRestaurant) {
      newErrors.venueName = "Venue name is required";
    }
    
    if (!formData.visitDate) {
      newErrors.visitDate = "Visit date is required";
    }
    
    const hasRating = Object.values(formData.ratings).some(rating => Number(rating) > 0);
    if (!hasRating) {
      newErrors.ratings = "At least one rating is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Upload photos to Firebase Storage
  const uploadPhotos = async (photos) => {
    const uploadPromises = photos.map(async (photo, index) => {
      const timestamp = Date.now();
      const fileName = `reviews/${timestamp}_${index}_${photo.name}`;
      const storageRef = ref(storage, fileName);
      
      try {
        const snapshot = await uploadBytes(storageRef, photo);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
      } catch (error) {
        console.error('Error uploading photo:', error);
        throw error;
      }
    });
    
    return Promise.all(uploadPromises);
  };

  // Save place to Firestore
  const savePlace = async (placeData) => {
    try {
      const placeRef = await addDoc(collection(db, "places"), placeData);
      return placeRef.id;
    } catch (error) {
      console.error('Error saving place:', error);
      throw error;
    }
  };

  // Save review to Firestore
  const saveReview = async (reviewData) => {
    try {
      const reviewRef = await addDoc(collection(db, "reviews"), reviewData);
      return reviewRef.id;
    } catch (error) {
      console.error('Error saving review:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user) {
      alert("Please log in to submit a review");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "edit" && initialReview) {
        // Editing existing review
        let photoUrls = Array.isArray(formData.photos) && typeof formData.photos[0] === 'string' ? formData.photos : [];
        // If user selected new File objects, upload and replace
        if (Array.isArray(formData.photos) && formData.photos.length > 0 && formData.photos[0] instanceof File) {
          photoUrls = await uploadPhotos(formData.photos);
        }

        // Update place name if provided and we have an existing place
        const placeId = initialReview.placeId || restaurant?.id || initialPlace?.id;
        if (placeId && formData.venueName?.trim()) {
          try {
            await updateDoc(doc(db, "places", placeId), { venueName: formData.venueName.trim() });
          } catch (err) {
            console.error("Failed to update place name:", err);
          }
        }

        const reviewUpdate = {
          ratings: formData.ratings,
          comment: formData.comment.trim(),
          photos: photoUrls,
          visitDate: new Date(formData.visitDate),
          updatedAt: serverTimestamp(),
        };

        await updateDoc(doc(db, "reviews", initialReview.id), reviewUpdate);

        onSubmit({
          place: {
            id: placeId,
            ...(initialPlace || restaurant || {}),
            venueName: formData.venueName?.trim() || (initialPlace?.venueName || restaurant?.venueName) || "",
          },
          review: {
            id: initialReview.id,
            ...initialReview,
            ...reviewUpdate,
            placeId: placeId,
            userId: initialReview.userId || user?.username || user?.email || "anonymous",
          }
        });

        setIsSubmitting(false);
        onClose();
        return;
      }

      // 1. Upload photos to Firebase Storage
      let photoUrls = [];
      if (formData.photos.length > 0) {
        photoUrls = await uploadPhotos(formData.photos);
      }

      // 2. Save place to places collection (only if it's a new place)
      let placeId;
      if (isExistingRestaurant) {
        // If we have a restaurant ID, use it (existing place)
        placeId = restaurant?.id || initialPlace?.id;
      } else {
        // If no restaurant ID, create a new place
        const placeData = {
          lat: location.lat,
          lng: location.lng,
          venueName: formData.venueName.trim(),
          createdAt: serverTimestamp(),
          owner: ""
        };
        placeId = await savePlace(placeData);
      }

      // 3. Save review to reviews collection
      const reviewData = {
        userId: user.username || user.email,
        placeId: placeId,
        ratings: formData.ratings,
        comment: formData.comment.trim(),
        photos: photoUrls,
        visitDate: new Date(formData.visitDate),
        createdAt: serverTimestamp()
      };

      const reviewId = await saveReview(reviewData);

      // 4. Call the onSubmit callback with the saved data
      onSubmit({
        placeId,
        reviewId,
        place: isExistingRestaurant ? (restaurant || initialPlace) : { id: placeId, ...formData },
        review: reviewData
      });

      // 5. Reset form and close modal
      setFormData({
        venueName: "",
        visitDate: new Date().toISOString().split('T')[0],
        ratings: {
          food: 0,
          cleanliness: 0,
          service: 0,
          valueForMoney: 0,
          wouldReturn: 0
        },
        comment: "",
        photos: []
      });
      setErrors({});
      onClose();

    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ category, value, onChange }) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(category, star)}
          className={`text-2xl transition-colors ${
            star <= value ? "text-yellow-400" : "text-gray-300"
          } hover:text-yellow-400`}
        >
          <FaStar />
        </button>
      ))}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === 'edit' ? "Edit Review" : (isExistingRestaurant ? "Add Review" : "Add Place & Review")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Restaurant Name Display (for existing restaurants) */}
          {isExistingRestaurant && (restaurant?.venueName || initialPlace?.venueName) && (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <FaMapMarkerAlt className="text-blue-500" />
              <span className="text-sm font-medium text-blue-800">
                {restaurant?.venueName || initialPlace?.venueName}
              </span>
            </div>
          )}

          {/* Venue Name Input (for new places only) */}
          {!isExistingRestaurant && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venue Name *
              </label>
              <input
                type="text"
                name="venueName"
                value={formData.venueName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.venueName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter venue name"
                disabled={isSubmitting}
              />
              {errors.venueName && (
                <p className="text-red-500 text-sm mt-1">{errors.venueName}</p>
              )}
            </div>
          )}

          {location && (
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <FaMapMarkerAlt className="text-red-500" />
              <span className="text-sm text-gray-600">
                Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
              </span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Ratings *
            </label>
            {errors.ratings && (
              <p className="text-red-500 text-sm mb-3">{errors.ratings}</p>
            )}
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Food</span>
                <StarRating
                  category="food"
                  value={formData.ratings.food}
                  onChange={handleRatingChange}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Cleanliness</span>
                <StarRating
                  category="cleanliness"
                  value={formData.ratings.cleanliness}
                  onChange={handleRatingChange}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Service</span>
                <StarRating
                  category="service"
                  value={formData.ratings.service}
                  onChange={handleRatingChange}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Value for Money</span>
                <StarRating
                  category="valueForMoney"
                  value={formData.ratings.valueForMoney}
                  onChange={handleRatingChange}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Would I Return?</span>
                <StarRating
                  category="wouldReturn"
                  value={formData.ratings.wouldReturn}
                  onChange={handleRatingChange}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment (Optional)
            </label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Share your experience..."
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos (Optional, Max 3)
            </label>
            <div className="flex items-center space-x-2">
              <label className={`flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}>
                <FaCamera className="text-gray-500" />
                <span className="text-sm text-gray-700">Choose Photos</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
              </label>
              {formData.photos.length > 0 && (
                <span className="text-sm text-gray-500">
                  {Array.isArray(formData.photos) && formData.photos[0] instanceof File ? `${formData.photos.length} photo(s) selected` : `${formData.photos.length} photo(s)`}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Visit Date *</label>
              <input
                type="date"
                name="visitDate"
                value={formData.visitDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.visitDate ? 'border-red-500' : 'border-gray-300'}`}
                disabled={isSubmitting}
              />
              {errors.visitDate && (
                <p className="text-red-500 text-sm mt-1">{errors.visitDate}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  <span>{mode === 'edit' ? 'Saving...' : 'Submitting...'}</span>
                </>
              ) : (
                <span>{mode === 'edit' ? 'Save Changes' : 'Submit Review'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReviewModal;
