"use client";
import React, { useRef, useEffect, useState } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import './map.css';
import { collection, getDocs, getDoc, query, where, doc } from "firebase/firestore";
import { db } from '../../firebase/firestore';
import AddReviewModal from './AddReviewModal';
import AddPromotionModal from './AddPromotionModal';
import AddOptionModal from './AddOptionModal';
import RestaurantDetailsModal from './RestaurantDetailsModal';
import { FaPlus, FaMapMarkerAlt, FaLocationArrow, FaUtensils } from 'react-icons/fa';
import { useLang } from '@/contexts/LangContext';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Category definitions for filtering and UI

export default function MapComponent({ category }) {
  const router = useRouter();
  const { user } = useAuth();
  const { messages } = useLang();
  const searchParams = useSearchParams();
  const locationValue = searchParams.get('locationValue');
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');
  
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markerRef = useRef(null); // Ref to store the marker instance for search
  const serviceMarkersRef = useRef([]); // Store service markers to clean up if needed
  const placeMarkersRef = useRef([]); // Store place markers to clean up if needed
  const reviewMarkerRef = useRef(null); // Ref for the review marker
  const userLocationMarkerRef = useRef(null); // Ref for the user location marker
  const warsaw = { lng: 21.017532, lat: 52.237049 };
  const zoom = 14;
  const [searchQuery, setSearchQuery] = useState(locationValue || '');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [preventSearch, setPreventSearch] = useState(false); // Flag to prevent search when result is clicked
  const [services, setServices] = useState([]);
  const [places, setPlaces] = useState([]); // State for places
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  
  // New state for review functionality
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [showAddPromotionModal, setShowAddPromotionModal] = useState(false);
  const [showAddOptionModal, setShowAddOptionModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Restaurant details modal state
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);

  // User location state
  const [userLocation, setUserLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(false);

  // Multi-select: array of selected category keys (except "all")
  const [selectedCategories, setSelectedCategories] = useState(
    category && Array.isArray(category) ? category : []
  );
  maptilersdk.config.apiKey = 'GOq67Pre20jQoPdwn8zY';

  // Get user location via IP address
  const getUserLocationByIP = async () => {
    setIsLoadingLocation(true);
    try {
      // Using ipapi.co for IP-based geolocation (free tier available)
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        const location = {
          lat: data.latitude,
          lng: data.longitude,
          city: data.city,
          country: data.country_name,
          ip: data.ip
        };
        setUserLocation(location);
        return location;
      } else {
        throw new Error('Unable to get location from IP');
      }
    } catch (error) {
      console.error('Error getting location by IP:', error);
      // Fallback to browser geolocation if IP method fails
      return getCurrentPosition();
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Fallback to browser geolocation
  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            city: 'Current Location',
            country: '',
            ip: 'Browser Geolocation'
          };
          setUserLocation(location);
          resolve(location);
        },
        (error) => {
          console.error('Geolocation error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };

  // Mark user location on map
  const markUserLocation = (location) => {
    if (!map.current || !location) return;

    // Remove previous user location marker if exists
    if (userLocationMarkerRef.current) {
      userLocationMarkerRef.current.remove();
      userLocationMarkerRef.current = null;
    }

    // Create a custom marker element
    const markerElement = document.createElement('div');
    markerElement.className = 'user-location-marker';
    markerElement.innerHTML = `
      <div class="relative">
        <div class="w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-lg"></div>
        <div class="absolute -top-1 -left-1 w-6 h-6 bg-blue-600 bg-opacity-30 rounded-full animate-ping"></div>
      </div>
    `;

    // Add marker to map
    userLocationMarkerRef.current = new maptilersdk.Marker({
      element: markerElement,
      anchor: 'center'
    })
      .setLngLat([location.lng, location.lat])
      .addTo(map.current);

    setShowUserLocation(true);
  };

  // Handle restaurant marker click
  const handleRestaurantClick = (place) => {
    console.log('Restaurant clicked:', place); // Debug log
    
    // Set selected restaurant
    setSelectedRestaurant(place);
    setShowRestaurantModal(true);
    
    // Zoom in on the restaurant location
    if (map.current) {
      console.log('Flying to location:', [place.lng, place.lat]); // Debug log
      map.current.flyTo({
        center: [place.lng, place.lat],
        zoom: 18, // Closer zoom level
        essential: true,
        duration: 1000 // Animation duration in milliseconds
      });
    }
  };

  // Create restaurant icon marker (smaller size)
  const createRestaurantMarker = (place) => {
    const markerElement = document.createElement('div');
    markerElement.className = 'restaurant-marker';
    markerElement.innerHTML = `
      <div class="relative cursor-pointer">
        <div class="w-5 h-5 bg-red-600 border border-white rounded-full shadow-md flex items-center justify-center">
          <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
          </svg>
        </div>
        <div class="absolute -top-0.5 -left-0.5 w-6 h-6 bg-red-600 bg-opacity-20 rounded-full"></div>
      </div>
    `;

    // Add click event to marker
    markerElement.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent map click event
      console.log('Marker clicked for place:', place.venueName); // Debug log
      handleRestaurantClick(place);
    });

    return new maptilersdk.Marker({
      element: markerElement,
      anchor: 'center'
    })
      .setLngLat([place.lng, place.lat])
      .addTo(map.current);
  };

  // Add place markers to map
  const addPlaceMarkers = (places) => {
    if (!map.current) return;

    console.log('Adding place markers:', places.length); // Debug log

    // Clear existing place markers
    placeMarkersRef.current.forEach(marker => marker.remove());
    placeMarkersRef.current = [];

    // Add new markers for each place
    places.forEach(place => {
      if (place.lat && place.lng) {
        console.log('Adding marker for place:', place.venueName, 'at:', place.lat, place.lng); // Debug log
        const marker = createRestaurantMarker(place);
        placeMarkersRef.current.push(marker);
      }
    });
  };

  // Toggle user location visibility
  const toggleUserLocation = async () => {
    if (showUserLocation) {
      // Hide user location
      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.remove();
        userLocationMarkerRef.current = null;
      }
      setShowUserLocation(false);
    } else {
      // Show user location
      if (userLocation) {
        markUserLocation(userLocation);
        // Center map on user location
        map.current.flyTo({
          center: [userLocation.lng, userLocation.lat],
          zoom: 15,
          essential: true
        });
      } else {
        // Get location first
        try {
          const location = await getUserLocationByIP();
          console.log('User location:', location);
          markUserLocation(location);
          // Center map on user location
          map.current.flyTo({
            center: [location.lng, location.lat],
            zoom: 15,
            essential: true
          });
        } catch (error) {
          console.error('Failed to get user location:', error);
          alert('Unable to get your location. Please try again.');
        }
      }
    }
  };

  // Handle map click for adding reviews/promotions
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
      
      // Show the option modal
      setShowAddOptionModal(true);
    }
  };

  // Toggle add review mode
  const toggleAddReviewMode = () => {
    if(!user.email) {
      router.push("/signin")
    }
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

  // Handle option selection
  const handleSelectReview = () => {
    setShowAddOptionModal(false);
    setShowAddReviewModal(true);
  };

  const handleSelectPromotion = () => {
    setShowAddOptionModal(false);
    setShowAddPromotionModal(true);
  };

  // Handle review submission
  const handleReviewSubmit = (reviewData) => {
    console.log("Review submitted successfully:", reviewData);
    
    // Show success message
    alert('Review submitted successfully!');
    
    // Reset states
    setIsAddingReview(false);
    setShowAddReviewModal(false);
    setSelectedLocation(null);
    
    // Remove the review marker
    if (reviewMarkerRef.current) {
      reviewMarkerRef.current.remove();
      reviewMarkerRef.current = null;
    }

    // Add a marker for the newly created place
    if (reviewData.place && map.current) {
      const placeMarker = createRestaurantMarker(reviewData.place);
      placeMarkersRef.current.push(placeMarker);
      
      // Update places state
      setPlaces(prev => [...prev, reviewData.place]);
    }
  };

  // Handle promotion submission
  const handlePromotionSubmit = (data) => {
    console.log("Promotion submitted successfully:", data);
    
    // Show success message
    alert('Promotion submitted successfully!');
    
    // Reset states
    setIsAddingReview(false);
    setShowAddPromotionModal(false);
    setSelectedLocation(null);
    
    // Remove the review marker
    if (reviewMarkerRef.current) {
      reviewMarkerRef.current.remove();
      reviewMarkerRef.current = null;
    }

    // Add a marker for the newly created place
    if (data.place && map.current) {
      const placeMarker = createRestaurantMarker(data.place);
      placeMarkersRef.current.push(placeMarker);
      
      // Update places state
      setPlaces(prev => [...prev, data.place]);
    }
  };

  // Handle add review from restaurant modal
  const handleAddReviewFromRestaurant = (place) => {
    if(!user.email) {
      router.push("/signin");
    }
    setShowRestaurantModal(false);
    setSelectedLocation({ lng: place.lng, lat: place.lat });
    setSelectedRestaurant(place); // Set the selected restaurant
    setShowAddReviewModal(true);
  };

  // Handle add promotion from restaurant modal
  const handleAddPromotionFromRestaurant = (place) => {
    if(!user.email) {
      router.push("/signin");
    }
    setShowRestaurantModal(false);
    setSelectedLocation({ lng: place.lng, lat: place.lat });
    setSelectedRestaurant(place); // Set the selected restaurant
    setShowAddPromotionModal(true);
  };

  // Initialize map
  useEffect(() => {
    if (map.current) return;
    
    // Ensure the container has dimensions before initializing the map
    if (mapContainer.current) {
      console.log('Initializing map...'); // Debug log
      map.current = new maptilersdk.Map({
        container: mapContainer.current,
        style: maptilersdk.MapStyle.STREETS,
        center: [warsaw.lng, warsaw.lat],
        zoom: zoom
      });
      
      // Wait for map to load before adding markers
      map.current.on('load', () => {
        console.log('Map loaded successfully'); // Debug log
      });
    }
  }, [warsaw.lng, warsaw.lat, zoom]);

  // Handle URL parameters for lat/lng
  useEffect(() => {
    if (map.current && latParam && lngParam) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      
      // Validate coordinates
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        console.log('Moving to coordinates from URL:', lat, lng);
        
        // Remove previous search marker if exists
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }
        
        // Add marker at the specified location
        markerRef.current = new maptilersdk.Marker({ color: "#2563eb" })
          .setLngLat([lng, lat])
          .addTo(map.current);
        
        // Fly to the location
        map.current.flyTo({
          center: [lng, lat],
          zoom: 18, // Closer zoom level for specific location
          essential: true,
          duration: 1500 // Animation duration
        });
        
        // Update search query to show the coordinates
        setSearchQuery(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      } else {
        console.error('Invalid coordinates in URL parameters:', latParam, lngParam);
      }
    }
  }, [map.current, latParam, lngParam]);

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
        
        // Show the option modal
        setShowAddOptionModal(true);
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

  // Fetch places from Firestore
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        console.log('Fetching places from Firestore...'); // Debug log
        const placesRef = collection(db, "places");
        const querySnapshot = await getDocs(placesRef);
        
        const placesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('Fetched places:', placesData); // Debug log
        setPlaces(placesData);
      } catch (error) {
        console.error("Error fetching places from Firestore:", error);
      }
    };

    fetchPlaces();
  }, []);

  // Add place markers when places data changes
  useEffect(() => {
    if (places.length > 0 && map.current) {
      console.log('Places data changed, adding markers...'); // Debug log
      addPlaceMarkers(places);
    }
  }, [places]);

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
    
    // Clear search results immediately
    setSearchResults([]);
    // Set flag to prevent search
    // setPreventSearch(false);
    // Update search query
    setSearchQuery(result.place_name);
    // Reset flag after a short delay
    setTimeout(() => setPreventSearch(false), 100);
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
    if (debouncedSearchQuery.trim() && !preventSearch) {
      handleSearch();
    }
  }, [preventSearch]);

  return (
    <div className="map-wrap relative w-full h-screen">
      {/* Add Option Modal */}
      <AddOptionModal
        isOpen={showAddOptionModal}
        onClose={() => {
          setShowAddOptionModal(false);
          setIsAddingReview(false);
          if (reviewMarkerRef.current) {
            reviewMarkerRef.current.remove();
            reviewMarkerRef.current = null;
          }
        }}
        onSelectReview={handleSelectReview}
        onSelectPromotion={handleSelectPromotion}
      />

      {/* Add Review Modal */}
      <AddReviewModal
        isOpen={showAddReviewModal}
        onClose={() => {
          setShowAddReviewModal(false);
          setIsAddingReview(false);
          setSelectedRestaurant(null); // Clear selected restaurant
          if (reviewMarkerRef.current) {
            reviewMarkerRef.current.remove();
            reviewMarkerRef.current = null;
          }
        }}
        location={selectedLocation}
        restaurant={selectedRestaurant} // Pass the selected restaurant data
        onSubmit={handleReviewSubmit}
      />

      {/* Add Promotion Modal */}
      <AddPromotionModal
        isOpen={showAddPromotionModal}
        onClose={() => {
          setShowAddPromotionModal(false);
          setIsAddingReview(false);
          if (reviewMarkerRef.current) {
            reviewMarkerRef.current.remove();
            reviewMarkerRef.current = null;
          }
        }}
        location={selectedLocation}
        restaurant={selectedRestaurant} // Pass the selected restaurant data
        onSubmit={handlePromotionSubmit}
      />

      {/* Restaurant Details Modal */}
      {showRestaurantModal && selectedRestaurant && (
        <RestaurantDetailsModal
          restaurant={selectedRestaurant}
          onClose={() => {
            setShowRestaurantModal(false);
            setSelectedRestaurant(null);
          }}
          onAddReview={handleAddReviewFromRestaurant}
          onAddPromotion={handleAddPromotionFromRestaurant}
        />
      )}

      {/* Search Bar & Action Buttons Container */}
      <div className="absolute top-4 left-4 z-10 w-96 max-w-full">
        <div className="bg-white rounded-lg shadow-lg p-4">
          {/* Search Input */}
          <div className="flex items-center space-x-2 mb-3">
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

          {/* Action Buttons Row */}
          <div className="flex space-x-2">
            {/* Add Place Button */}
            <button
              onClick={toggleAddReviewMode}
              className={`flex-1 px-4 py-2 rounded-lg shadow-md flex items-center justify-center space-x-2 transition-all duration-200 ${
                isAddingReview
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <FaPlus className="w-4 h-4" />
              <span className="text-sm">
                {isAddingReview ? "Cancel" : "Add Place"}
              </span>
            </button>

            {/* User Location Button */}
            <button
              onClick={toggleUserLocation}
              disabled={isLoadingLocation}
              className={`flex-1 px-4 py-2 rounded-lg shadow-md flex items-center justify-center space-x-2 transition-all duration-200 ${
                showUserLocation
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-600 text-white hover:bg-gray-700"
              } ${isLoadingLocation ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isLoadingLocation ? (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              ) : (
                <FaLocationArrow className="w-4 h-4" />
              )}
              <span className="text-sm">
                {isLoadingLocation ? "Loading..." : showUserLocation ? "Hide Location" : "My Location"}
              </span>
            </button>
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="mt-3 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
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
            <span>Click on the map to add a review or promotion for that location</span>
          </div>
        </div>
      )}

      {/* User location info */}
      {showUserLocation && userLocation && (
        <div className="absolute bottom-4 right-4 z-10">
          <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="text-sm font-medium">Your Location</div>
            <div className="text-xs opacity-90">
              {userLocation.city && userLocation.country 
                ? `${userLocation.city}, ${userLocation.country}`
                : 'Current Location'
              }
            </div>
          </div>
        </div>
      )}

      {/* Places count info */}
      {places.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <FaUtensils className="w-4 h-4" />
            <span className="text-sm font-medium">{places.length} Restaurant(s)</span>
          </div>
        </div>
      )}
      
      <div ref={mapContainer} className="map w-full h-full" />
    </div>
  );
}