"use client";
import React, { useState } from "react";
import { FaTimes, FaStar, FaCamera, FaMapMarkerAlt } from "react-icons/fa";

const AddReviewModal = ({ isOpen, onClose, location, onSubmit }) => {
  const [formData, setFormData] = useState({
    venueName: "",
    visitDate: new Date().toISOString().split("T")[0],
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

  const [errors, setErrors] = useState({});

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
    
    if (!formData.venueName.trim()) {
      newErrors.venueName = "Venue name is required";
    }
    
    if (!formData.visitDate) {
      newErrors.visitDate = "Visit date is required";
    }
    
    const hasRating = Object.values(formData.ratings).some(rating => rating > 0);
    if (!hasRating) {
      newErrors.ratings = "At least one rating is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        location: location
      });
      onClose();
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
          <h2 className="text-2xl font-bold text-gray-800">Add Review</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {location && (
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <FaMapMarkerAlt className="text-red-500" />
              <span className="text-sm text-gray-600">
                Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
              </span>
            </div>
          )}

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
            />
            {errors.venueName && (
              <p className="text-red-500 text-sm mt-1">{errors.venueName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visit Date *
            </label>
            <input
              type="date"
              name="visitDate"
              value={formData.visitDate}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.visitDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.visitDate && (
              <p className="text-red-500 text-sm mt-1">{errors.visitDate}</p>
            )}
          </div>

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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos (Optional, Max 3)
            </label>
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                <FaCamera className="text-gray-500" />
                <span className="text-sm text-gray-700">Choose Photos</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
              {formData.photos.length > 0 && (
                <span className="text-sm text-gray-500">
                  {formData.photos.length} photo(s) selected
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReviewModal;
