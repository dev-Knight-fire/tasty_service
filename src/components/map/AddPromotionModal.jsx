"use client";
import { serverTimestamp, addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../../firebase/firestore";
import React, { useState } from "react";
import { FaTimes, FaCamera, FaMapMarkerAlt, FaPhone, FaCalendarAlt, FaClock } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";

const AddPromotionModal = ({ isOpen, onClose, location, restaurant, onSubmit }) => {
  const { user } = useAuth();
  const [venueName, setVenueName] = useState(restaurant?.venueName || "");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [description, setDescription] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Update venue name when restaurant prop changes
  React.useEffect(() => {
    if (restaurant?.venueName) {
      setVenueName(restaurant.venueName);
    }
  }, [restaurant]);

  const handlePhotoUpload = async (files) => {
    if (files.length === 0) return;
    
    setUploading(true);
    const uploadedPhotos = [];
    
    try {
      for (let i = 0; i < Math.min(files.length, 3); i++) {
        const file = files[i];
        const fileName = `promotions/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, fileName);
        
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        uploadedPhotos.push(downloadURL);
      }
      
      setPhotos(prev => [...prev, ...uploadedPhotos].slice(0, 3));
    } catch (error) {
      console.error("Error uploading photos:", error);
      alert("Error uploading photos. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber.trim() || !description.trim() || 
        !startDateTime || !endDateTime || photos.length === 0) {
      alert("Please fill in all fields and upload at least one photo.");
      return;
    }

    if (new Date(startDateTime) >= new Date(endDateTime)) {
      alert("End date must be after start date.");
      return;
    }

    setLoading(true);
    
    try {
      let placeData, placeDocRef;

      // If restaurant is provided, use existing place
      if (restaurant) {
        placeData = restaurant;
        placeDocRef = { id: restaurant.id };
        console.log("Using existing place:", restaurant.id);
      } else {
        // Create new place if no restaurant provided
        placeData = {
          venueName: venueName.trim(),
          lat: location.lat,
          lng: location.lng,
          createdAt: serverTimestamp(),
          owner: user?.email || "anonymous"
        };

        placeDocRef = await addDoc(collection(db, "places"), placeData);
        console.log("Place added with ID: ", placeDocRef.id);
      }

      // Save the promotion with placeId reference
      const promotionData = {
        placeId: placeDocRef.id, // Reference to the place document
        description: description.trim(),
        startDateTime: new Date(startDateTime), // Use actual datetime from form
        endDateTime: new Date(endDateTime), // Use actual datetime from form
        photos: photos,
        phoneNumber: phoneNumber.trim(),
        userId: user?.email || "anonymous", // Using user email as userId
        createdAt: serverTimestamp(),
        status: "active"
      };

      const promotionDocRef = await addDoc(collection(db, "promotions"), promotionData);
      console.log("Promotion added with ID: ", promotionDocRef.id);
      
      // Call onSubmit with both place and promotion data
      onSubmit({
        place: {
          id: placeDocRef.id,
          ...placeData
        },
        promotion: {
          id: promotionDocRef.id,
          ...promotionData
        }
      });
      
      // Reset form
      setPhoneNumber("");
      setDescription("");
      setStartDateTime("");
      setEndDateTime("");
      setPhotos([]);
      
    } catch (error) {
      console.error("Error adding promotion:", error);
      alert("Error adding promotion. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center space-x-2">
            <FaMapMarkerAlt className="text-blue-600" />
            <span>Add Promotion</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Location Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Location
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Lat: {restaurant?.lat?.toFixed(6) || location?.lat?.toFixed(6)}, 
              Lng: {restaurant?.lng?.toFixed(6) || location?.lng?.toFixed(6)}
            </p>
          </div>

          {/* Venue Name - Only show if not pre-selected */}
          {!restaurant && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Venue Name *
              </label>
              <input
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter venue name"
                required
              />
            </div>
          )}

          {/* Pre-selected Venue Name Display */}
          {restaurant && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Venue Name
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                {restaurant.venueName}
              </div>
            </div>
          )}

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FaPhone className="inline w-4 h-4 mr-1" />
              Phone Number *
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter phone number"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Describe your promotion..."
              required
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FaCalendarAlt className="inline w-4 h-4 mr-1" />
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FaClock className="inline w-4 h-4 mr-1" />
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                value={endDateTime}
                onChange={(e) => setEndDateTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FaCamera className="inline w-4 h-4 mr-1" />
              Photos (1-3 photos) *
            </label>
            
            {/* Upload Button */}
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handlePhotoUpload(e.target.files)}
                className="hidden"
                id="photo-upload"
                disabled={uploading || photos.length >= 3}
              />
              <label
                htmlFor="photo-upload"
                className={`inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer ${
                  uploading || photos.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FaCamera className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Photos'}
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {photos.length}/3 photos uploaded
              </p>
            </div>

            {/* Photo Preview */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo}
                      alt={`Promotion photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Adding Promotion...' : 'Add Promotion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPromotionModal; 