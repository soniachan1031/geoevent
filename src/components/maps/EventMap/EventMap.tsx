import React, { useEffect, useMemo, useRef } from "react";
import { GoogleMap, useGoogleMap } from "@react-google-maps/api";
import { useGoogleMapsContext } from "@/providers/GoogleMapsProvider";
import { IEvent } from "@/types/event.types";
import { GOOGLE_MAPS_MAP_ID } from "@/lib/credentials";
import { FaMapMarker } from "react-icons/fa";
import ReactDOMServer from "react-dom/server";
import styles from "./eventMap.module.css";

interface EventMapProps {
  events: IEvent[];
  selectedEventId?: string | null;
  onMarkerClick?: (eventId: string) => void;
}

const mapContainerStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
};

export default function Index({
  events,
  selectedEventId,
  onMarkerClick,
}: Readonly<EventMapProps>) {
  const { isLoaded, loadError } = useGoogleMapsContext();
  const mapRef = useRef<google.maps.Map | null>(null);

  const defaultCenter = useMemo(() => {
    if (events.length > 0) {
      return {
        lat: events[0].location.lat,
        lng: events[0].location.lng,
      };
    }
    return { lat: 40.7128, lng: -74.006 }; // Default to NYC
  }, [events]);

  function handleMapLoad(map: google.maps.Map) {
    mapRef.current = map;
  }

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
      options={{
        mapId: GOOGLE_MAPS_MAP_ID,
        zoomControl: true,
        disableDefaultUI: true,
      }}
    >
      {events.map((event) => {
        return (
          <EventMarker
            key={event._id}
            event={event}
            selected={event._id === selectedEventId}
            onClick={onMarkerClick}
          />
        );
      })}
    </GoogleMap>
  );
}

interface EventMarkerProps {
  event: IEvent;
  selected: boolean;
  onClick?: (eventId: string) => void;
}

export function EventMarker({ event, selected, onClick }: EventMarkerProps) {
  const map = useGoogleMap();
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null
  );

  useEffect(() => {
    if (!map || !google?.maps?.marker?.AdvancedMarkerElement) return;

    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: {
        lat: event.location.lat,
        lng: event.location.lng,
      },
      title: event.title,
    });

    const div = document.createElement("div");
    div.className = styles.markerContainer;

    div.innerHTML = `
      <div class="${styles.iconWrapper}">
        ${ReactDOMServer.renderToString(
          <FaMapMarker
            size={selected ? 40 : 30}
            color={selected ? "red" : "black"}
            className={styles.markerIcon}
          />
        )}
        <div class="${styles.eventPreview}">
          <img src="${event.image}" alt="${event.title}" class="${
      styles.previewImage
    }" />
          <div class="${styles.previewContent}">
            <strong>${event.title}</strong>
            <p>${event.category}</p>
            <p>${new Date(event.date).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    `;

    marker.content = div;

    // Set initial zIndex
    marker.zIndex = selected ? 1000 : 0;

    // Boost zIndex on hover
    marker.content.addEventListener("mouseenter", () => {
      marker.zIndex = 9999;
    });

    marker.content.addEventListener("mouseleave", () => {
      marker.zIndex = selected ? 1000 : 0;
    });

    // Click handling
    marker.addListener("gmp-click", () => {
      onClick?.(event._id);
    });

    markerRef.current = marker;

    return () => {
      marker.map = null;
    };
  }, [map, event, selected, onClick]);

  return null;
}
