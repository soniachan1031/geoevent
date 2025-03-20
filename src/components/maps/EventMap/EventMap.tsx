import React, { useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, useGoogleMap } from "@react-google-maps/api";
import { useGoogleMapsContext } from "@/providers/GoogleMapsProvider";
import { IEvent } from "@/types/event.types";
import { GOOGLE_MAPS_MAP_ID } from "@/lib/credentials";
import { FaMapMarker } from "react-icons/fa";
import ReactDOMServer from "react-dom/server";
import styles from "./eventMap.module.css";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import Link from "next/link";
import Image from "next/image";

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
  const { isLoaded, loadError } = useGoogleMapsContext();
  const mapRef = useRef<google.maps.Map | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const [activeEvent, setActiveEvent] = useState<string | null>(null);

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
    clustererRef.current = new MarkerClusterer({ map, markers: [] });
  }

  function handleMarkerClick(eventId: string) {
    setActiveEvent(eventId === activeEvent ? null : eventId); // Toggle visibility
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
      onClick={() => setActiveEvent(null)} // Hide floating card when clicking anywhere else
    >
      {events.map((event) => (
        <EventMarker
          key={event._id}
          event={event}
          selected={event._id === selectedEventId}
          isActive={event._id === activeEvent}
          onClick={handleMarkerClick}
        />
      ))}

      {/* Floating Event Card */}
      {activeEvent && (
        <FloatingEventCard
          event={events.find((e) => e._id === activeEvent)!}
          onClose={() => setActiveEvent(null)}
        />
      )}
    </GoogleMap>
  );
}

interface EventMarkerProps {
  event: IEvent;
  selected: boolean;
  isActive: boolean;
  onClick?: (eventId: string) => void;
}

export function EventMarker({ event, selected, isActive, onClick }: EventMarkerProps) {
  const map = useGoogleMap();
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  useEffect(() => {
    if (!map || !google?.maps?.marker?.AdvancedMarkerElement) return;

    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: { lat: event.location.lat, lng: event.location.lng },
      title: event.title,
    });

    const div = document.createElement("div");
    div.className = styles.markerContainer;
    div.innerHTML = ReactDOMServer.renderToString(
      <FaMapMarker
        size={selected || isActive ? 45 : 30}
        color={selected || isActive ? "#ff4747" : "#222"}
        className={styles.markerIcon}
      />
    );

    marker.content = div;

    marker.addListener("gmp-click", () => onClick?.(event._id));

    markerRef.current = marker;

    return () => {
      marker.map = null;
    };
  }, [map, event, selected, isActive, onClick]);

  return null;
}

// Floating Card UI
interface FloatingEventCardProps {
  event: IEvent;
  onClose: () => void;
}

function FloatingEventCard({ event, onClose }: FloatingEventCardProps) {
  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-lg overflow-hidden max-w-xs w-full cursor-pointer transition hover:shadow-xl">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 bg-gray-800 text-white rounded-full p-1 text-sm hover:bg-gray-600"
      >
        ✕
      </button>

      {/* Clickable Link */}
      <Link href={`/events/${event._id}`} passHref>
        <div>
          {/* Event Image */}
          <div className="relative w-full h-40">
            <Image
              src={event.image || "/path/to/default/image.jpg"}
              alt={event.title}
              layout="fill"
              objectFit="cover"
              className="rounded-t-xl"
            />
          </div>

          {/* Event Details */}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 underline">{event.title}</h3>
            <p className="text-sm text-gray-500">{event.category}</p>
            <p className="text-sm text-gray-700 font-medium">
              {new Date(event.date).toLocaleDateString()} • {event.time}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
