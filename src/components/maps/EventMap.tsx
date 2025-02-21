"use client"; // Only if using Next.js 13 App Router and want client rendering

import React, { useMemo, useRef, useEffect, useState } from "react";
import { GoogleMap } from "@react-google-maps/api";
import { useGoogleMapsContext } from "@/providers/GoogleMapsProvider"; // <-- Import the hook here
import { IEvent } from "@/types/event.types";

interface EventMapProps {
  events: IEvent[];
  selectedEventId?: string | null;
  onMarkerClick?: (eventId: string) => void;
}

const mapContainerStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
};

export default function EventMap({
  events,
  selectedEventId,
  onMarkerClick,
}: Readonly<EventMapProps>) {
  const [mapReady, setMapReady] = useState(false);

  // Instead of calling useLoadScript, we consume from the context
  const { isLoaded, loadError } = useGoogleMapsContext();

  // Keep a ref to the raw Map instance
  const mapRef = useRef<google.maps.Map | null>(null);

  // Keep a ref to the markers so we can clean them up between renders
  const advancedMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>(
    []
  );

  // Choose a default center if we have events; otherwise fallback to NYC
  const defaultCenter = useMemo(() => {
    if (events.length > 0) {
      return {
        lat: events[0].location.lat,
        lng: events[0].location.lng,
      };
    }
    return { lat: 40.7128, lng: -74.006 };
  }, [events]);

  // Runs once when the map is fully instantiated; store the map in a ref
  function handleMapLoad(map: google.maps.Map) {
    mapRef.current = map;
    setMapReady(true);
  }

  // Create AdvancedMarkerElements whenever events or selection changes
  useEffect(() => {
    if (!isLoaded || !mapReady) return;

    const { current: map } = mapRef;

    // If the map isn't loaded or advanced markers are undefined, bail out
    if (!map || !google?.maps?.marker?.AdvancedMarkerElement) return;

    // Remove existing markers
    advancedMarkersRef.current.forEach((marker) => {
      marker.map = null;
    });
    advancedMarkersRef.current = [];

    // Create a marker for each event
    events.forEach((event) => {
      const isSelected = selectedEventId === event._id;

      // Create the advanced marker
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: {
          lat: event.location.lat,
          lng: event.location.lng,
        },
      });

      // Build custom HTML for the marker
      const div = document.createElement("div");
      div.style.padding = "4px 8px";
      div.style.borderRadius = "4px";
      div.style.background = isSelected ? "#1976D2" : "#E53935";
      div.style.color = "red";
      div.style.fontWeight = "bold";
      div.textContent = event.title ?? "Event advanced marker";

      marker.content = div;

      marker.addListener("gmp-click", () => {
        onMarkerClick?.(event._id);
      });

      advancedMarkersRef.current.push(marker);

    });

    console.log("Advanced markers created:", advancedMarkersRef.current);
  }, [isLoaded, mapReady, events, selectedEventId, onMarkerClick]);

  if (loadError) {
    console.error("Google Maps API could not be loaded:", loadError);
    return <div>Map cannot be loaded right now. Please try again later.</div>;
  }

  if (!isLoaded) {
    return <div>Loading Map...</div>;
  }

  return (
    <GoogleMap
      onLoad={handleMapLoad}
      mapContainerStyle={mapContainerStyle}
      center={defaultCenter}
      zoom={10}
    >
      {/* No <Marker> since we do AdvancedMarkerElement in the effect */}
    </GoogleMap>
  );
}
