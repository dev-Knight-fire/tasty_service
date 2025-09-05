"use client";
import React, { useRef, useEffect, useState } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import './map.css';
import { collection, getDocs, getDoc, query, where, doc } from "firebase/firestore";
import { db } from '../../firebase/firestore';
import ServiceDetailsModal from './serviceDetailsModal';
import AddReviewModal from './AddReviewModal';
import { FaPlus, FaMapMarkerAlt } from 'react-icons/fa';
import { useLang } from '@/contexts/LangContext';
import { useSearchParams } from 'next/navigation';

// Category definitions for filtering and UI

export default function MapComponent({ category }) {
  const { messages } = useLang();
  const searchParams = useSearchParams();
  const locationValue = searchParams.get('locationValue');
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markerRef = useRef(null); // Ref to store the marker instance for search
  const serviceMarkersRef = useRef([]); // Store service markers to clean up if needed
  const reviewMarkerRef = useRef(null); // Ref for the review marker
  const warsaw = { lng: 21.017532, lat: 52.237049 };
  const zoom = 14;
  const [searchQuery, setSearchQuery] = useState(locationValue || '');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  
  // New state for review functionality
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Multi-select: array of selected category keys (except "all")
  const [selectedCategories, setSelectedCategories] = useState(
    category && Array.isArray(category) ? category : []
  );
  maptilersdk.config.apiKey = 'GOq67Pre20jQoPdwn8zY';

  // Handle map click for adding reviews
  const handleMapClick = (e) => {
    if (isAddingReview) {
      const { lng, lat } = e.lngLat;
      setSelectedLocation({ lng, lat });
      
      // Remove previous review marker if exists
      if (reviewMarkerRef.current) {
        reviewMarkerRef.current.remove();
        reviewMarkerRef.current = null;
      }
      
      // Add new marker at clicked location
      reviewMarkerRef.current = new maptilersdk.Marker({ color: "#dc2626" })
        .setLngLat([lng, lat])
        .addTo(map.current);
      
      // Show the review modal
      setShowAddReviewModal(true);
    }
  };

  // Toggle add review mode
  const toggleAddReviewMode = () => {
    setIsAddingReview(!isAddingReview);
    if (isAddingReview) {
      // If turning off, remove review marker
      if (reviewMarkerRef.current) {
        reviewMarkerRef.current.remove();
        reviewMarkerRef.current = null;
      }
      setSelectedLocation(null);
    }
  };

  // Handle review submission
  const handleReviewSubmit = (reviewData) => {
    console.log("Review submitted:", reviewData);
    // Here you would typically save the review to your database
    // For now, we'll just log it
    setIsAddingReview(false);
    setShowAddReviewModal(false);
    setSelectedLocation(null);
    
    // Remove the review marker
    if (reviewMarkerRef.current) {
      reviewMarkerRef.current.remove();
      reviewMarkerRef.current = null;
    }
  };

  // Initialize map
  useEffect(() => {
    if (map.current) return;
    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [warsaw.lng, warsaw.lat],
      zoom: zoom
    });
  }, [warsaw.lng, warsaw.lat, zoom]);

  // Add/remove click event listener based on isAddingReview state
  useEffect(() => {
    if (!map.current) return;

    const handleClick = (e) => {
      if (isAddingReview) {
        const { lng, lat } = e.lngLat;
        setSelectedLocation({ lng, lat });
        
        // Remove previous review marker if exists
        if (reviewMarkerRef.current) {
          reviewMarkerRef.current.remove();
          reviewMarkerRef.current = null;
        }
        
        // Add new marker at clicked location
        reviewMarkerRef.current = new maptilersdk.Marker({ color: "#dc2626" })
          .setLngLat([lng, lat])
          .addTo(map.current);
        
        // Show the review modal
        setShowAddReviewModal(true);
      }
    };

    // Add the event listener
    map.current.on("click", handleClick);

    // Cleanup function to remove the event listener
    return () => {
      if (map.current) {
        map.current.off("click", handleClick);
      }
    };
  }, [isAddingReview]);

  // Fetch services from Firestore
  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const listsRef = collection(db, "lists");
        const q = query(listsRef, where("status", "==", "approved"));
        const querySnapshotUser = await getDocs(q);

        // Get document references for each approved user
        const docRefs = querySnapshotUser.docs.map((userdoc) =>
          doc(db, "lists", userdoc.id)
        );

        // Fetch all documents data
        const docSnaps = await Promise.all(
          docRefs.map((docRef) => getDoc(docRef))
        );

        const data = docSnaps
          .map((docSnap) => {
            if (!docSnap.exists()) return null;
            const docData = docSnap.data();
            return {
              id: docSnap.id,
              ...docData
            };
          })
          .filter((item) => item !== null);
        setServices(data);
      } catch (error) {
        console.error("Error fetching lists from Firestore:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [locationValue]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      // Using MapTiler Geocoding API
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=${maptilersdk.config.apiKey}&limit=10`
      );
      const data = await response.json();
      setSearchResults(data.features || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (result) => {
    const [lng, lat] = result.center;

    // Remove previous search marker if exists
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    // Add new marker at the selected location
    markerRef.current = new maptilersdk.Marker({ color: "#2563eb" })
      .setLngLat([lng, lat])
      .addTo(map.current);

    map.current.flyTo({
      center: [lng, lat],
      zoom: 16,
      essential: true
    });
    setSearchResults([]);
    setSearchQuery(result.place_name);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      handleSearch();
    }
  }, [debouncedSearchQuery]);

  return (
    <div className="map-wrap relative">
      {/* Service Details Modal */}
      {selectedService && (
        <ServiceDetailsModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
          services={services}
        />
      )}

      {/* Add Review Modal */}
      {showAddReviewModal && (
        <AddReviewModal
          isOpen={showAddReviewModal}
          onClose={() => {
            setShowAddReviewModal(false);
            setIsAddingReview(false);
            if (reviewMarkerRef.current) {
              reviewMarkerRef.current.remove();
              reviewMarkerRef.current = null;
            }
          }}
          location={selectedLocation}
          onSubmit={handleReviewSubmit}
        />
      )}

      {/* Add Review Button - Top Center */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <button
          onClick={toggleAddReviewMode}
          className={`px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 transition-all duration-200 ${
            isAddingReview
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          <FaPlus className="w-4 h-4" />
          <span>
            {isAddingReview ? "Cancel Adding Review" : "Add new place and review"}
          </span>
        </button>
      </div>

      {/* Search Bar & Category Filter */}
      <div className="absolute top-4 left-4 z-10 w-96 max-w-full">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search address..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className={`px-4 py-2 rounded-md bg-blue-600 text-white flex items-center justify-center transition
                ${isSearching ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"}
              `}
              type="button"
            >
              {isSearching ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>
          </div>
          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="mt-2 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left px-3 py-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-100 transition"
                  style={{ borderRadius: 0 }}
                >
                  <div className="text-sm font-medium text-gray-900">{result.text}</div>
                  <div className="text-xs text-gray-500">{result.place_name}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Instructions when in add review mode */}
      {isAddingReview && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <FaMapMarkerAlt className="w-4 h-4" />
            <span>Click on the map to add a review for that location</span>
          </div>
        </div>
      )}
      
      <div ref={mapContainer} className="map" />
    </div>
  );
}






