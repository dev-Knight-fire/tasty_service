"use client";
import React from 'react';
import { FaTimes, FaStar, FaGift, FaMapMarkerAlt } from 'react-icons/fa';

const AddOptionModal = ({ isOpen, onClose, onSelectReview, onSelectPromotion }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center space-x-2">
            <FaMapMarkerAlt className="text-blue-600" />
            <span>Add to Location</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
            What would you like to add to this location?
          </p>

          <div className="space-y-4">
            {/* Add Review Button */}
            <button
              onClick={onSelectReview}
              className="w-full p-4 border-2 border-yellow-300 dark:border-yellow-600 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/50 transition-colors">
                  <FaStar className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-800 dark:text-white">Add Review</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Share your experience and rate this place
                  </p>
                </div>
              </div>
            </button>

            {/* Add Promotion Button */}
            <button
              onClick={onSelectPromotion}
              className="w-full p-4 border-2 border-green-300 dark:border-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                  <FaGift className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-800 dark:text-white">Add Promotion</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Create a special offer or promotion for this location
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOptionModal; 