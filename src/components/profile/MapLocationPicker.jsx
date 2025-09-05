"use client";
import { useEffect, useRef } from "react";
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";

export default function MapLocationPicker({ value, onChange }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    maptilersdk.config.apiKey = "CPbPF9KEBf1CDt78326q";
    const initialCenter = value || [21.0122, 52.2297]; // [lng, lat] (Warsaw)
    const map = new maptilersdk.Map({
      container: mapRef.current,
      style: maptilersdk.MapStyle.STREETS,
      center: initialCenter,
      zoom: 13,
    });

    let marker = new maptilersdk.Marker({ color: "#206645" })
      .setLngLat(initialCenter)
      .addTo(map);

    markerRef.current = marker;

    map.on("click", (e) => {
      const coords = [e.lngLat.lng, e.lngLat.lat];
      marker.setLngLat(coords);
      if (onChange) onChange({lng: coords[0], lat: coords[1]});
    });

    return () => {
      map.remove();
    };
    // eslint-disable-next-line
  }, []);

  // Update marker position when value changes externally
  useEffect(() => {
    if (markerRef.current && value) {
      markerRef.current.setLngLat(value);
    }
  }, [value]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: 320,
        borderRadius: 12,
        overflow: "hidden",
        marginTop: 16,
        marginBottom: 8,
      }}
    />
  );
}