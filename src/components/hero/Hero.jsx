"use client";
import PrimaryButton from "../primaryButton/PrimaryButton";
import styles from "./hero.module.css";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useLang } from "@/contexts/LangContext";
import { useRouter } from "next/navigation";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState({
    searchValue: "",
    locationValue: ""
  });
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const {messages} = useLang();
  const router = useRouter();

  // MapTiler API key
  const MAPTILER_API_KEY = 'GOq67Pre20jQoPdwn8zY';

  // Debounce location search
  useEffect(() => {
    if (!searchQuery.locationValue.trim()) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingLocation(true);
      try {
        const response = await fetch(
          `https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery.locationValue)}.json?key=${MAPTILER_API_KEY}&limit=5`
        );
        const data = await response.json();
        setLocationSuggestions(data.features || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Location search error:', error);
        setLocationSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 300); // 300ms delay for location suggestions

    return () => clearTimeout(timer);
  }, [searchQuery.locationValue]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchQuery((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationSelect = (suggestion) => {
    setSearchQuery((prev) => ({
      ...prev,
      locationValue: suggestion.place_name
    }));
    setShowSuggestions(false);
    setLocationSuggestions([]);
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    router.push(
      `/map/all?locationValue=${encodeURIComponent(searchQuery.locationValue)}`
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setShowSuggestions(false);
      handleSearch();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.location-input-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <section className={`${styles.bg} mt-16`}>
      <div className="container mx-auto px-4 py-20 flex flex-col-reverse md:flex-row items-center justify-between gap-10">
        {/* Content */}
        <div className="text-center md:text-left md:w-1/2 space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-slate-100 mb-10">
            {messages['heroTitle']}
          </h1>
          <div className="m-10">
            <Link href="/contact-us">
              <PrimaryButton>{messages['getintouchTitle']}</PrimaryButton>
            </Link>
          </div>
        </div>

        {/* Search Inputs */}
        <div className="w-full md:w-1/2 max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row items-stretch w-full gap-0">
            {/* Location Input */}
            <div className="relative flex-grow w-full location-input-container">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaMapMarkerAlt className="h-5 w-5" />
              </div>
              <input
                type="text"
                name="locationValue"
                placeholder={messages['locationPlaceholder']}
                value={searchQuery.locationValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (locationSuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                className="pl-10 pr-4 py-3 w-full rounded-l-lg rounded-r-none border border-gray-300 focus:ring-2 focus:ring-[#206645] focus:border-[#206645] outline-none bg-white"
                style={{ borderRight: "none" }}
                autoComplete="off"
              />
              
              {/* Loading indicator */}
              {isSearchingLocation && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                </div>
              )}

              {/* Location Suggestions Dropdown */}
              {showSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                  {locationSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleLocationSelect(suggestion)}
                      className="w-full text-left px-3 py-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-100 transition"
                    >
                      <div className="text-sm font-medium text-gray-900">{suggestion.text}</div>
                      <div className="text-xs text-gray-500">{suggestion.place_name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Add Review Button */}
            <button
              type="button"
              className="px-4 py-3 rounded-r-lg rounded-l-none border text-[#206645] bg-[#FFE5B4] hover:bg-[#206645] hover:text-white transition-colors duration-150 text-base font-medium shadow-sm"
              style={{ minWidth: "120px" }}
              onClick={handleSearch}
            >
              Add review
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
