import { useEffect, useRef, useState } from "react";
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";

// Props: value {lat, lng}, onChange, mapKey
const MapTilerLocationPicker = ({ value, onChange, mapKey }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapDiv = useRef();
  maptilersdk.config.apiKey = mapKey;

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize map and marker
  useEffect(() => {
    if (!mapDiv.current) return;

    const map = new maptilersdk.Map({
      container: mapDiv.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [value?.lng || 21.017532, value?.lat || 52.237049],
      zoom: 14,
    });

    markerRef.current = new maptilersdk.Marker({ draggable: true })
      .setLngLat([value?.lng || 21.017532, value?.lat || 52.237049])
      .addTo(map);

    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      markerRef.current.setLngLat([lng, lat]);
      onChange({ lat, lng });
    });

    markerRef.current.on("dragend", () => {
      const { lng, lat } = markerRef.current.getLngLat();
      onChange({ lat, lng });
    });

    mapRef.current = map;
    return () => map.remove();
    // eslint-disable-next-line
  }, [mapKey]);

  // React to parent value change
  useEffect(() => {
    if (markerRef.current && value) {
      markerRef.current.setLngLat([value.lng, value.lat]);
      mapRef.current?.setCenter([value.lng, value.lat]);
    }
  }, [value]);

  // Search handler
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=${maptilersdk.config.apiKey}&limit=10`
      );
      const data = await response.json();
      setSearchResults(data.features || []);
    } catch (error) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (result) => {
    const [lng, lat] = result.center;
    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    }
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 16,
        essential: true,
      });
    }
    onChange({ lat, lng });
    setSearchResults([]);
    setSearchQuery(result.place_name);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Search Bar */}
      <div className="mb-2" style={{ maxWidth: 480 }}>
        <div className="flex items-center space-x-2 bg-white rounded-lg shadow p-2">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search address or place..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            style={{ minWidth: 0 }}
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            type="button"
          >
            {isSearching ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
          <div className="mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-20 relative">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleResultClick(result)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
                type="button"
              >
                <div className="text-sm font-medium text-gray-900">{result.text}</div>
                <div className="text-xs text-gray-500">{result.place_name}</div>
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Map */}
      <div
        ref={mapDiv}
        style={{
          width: "100%",
          height: 320,
          borderRadius: 10,
          overflow: "hidden",
          marginTop: 8,
        }}
      />
    </div>
  );
};

export default MapTilerLocationPicker;