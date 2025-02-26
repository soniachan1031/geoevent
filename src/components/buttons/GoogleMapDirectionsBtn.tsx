import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { IEvent } from "@/types/event.types";
import { FaCarSide, FaShare, FaWalking } from "react-icons/fa";
import { IoBicycleSharp, IoBusSharp } from "react-icons/io5";
import { LoadingSkeleton } from "../skeletons/LoadingSkeleton";
import {
  GoogleMap,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useGoogleMapsContext } from "@/providers/GoogleMapsProvider";
import Link from "next/link";

const GoogleMapDirectionBtn: React.FC<{
  event: IEvent;
}> = ({ event }) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <div className="flex gap-3 items-center">
            <FaShare /> <span>Get Directions</span>
          </div>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Directions to {event.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {/* <GoogleMapsEmbed destination={event.location} /> */}
            <DirectionsMap destination={event.location} />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel ref={closeBtnRef}>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default GoogleMapDirectionBtn;

// Container style for the map
const containerStyle = { width: "100%", height: "450px" };

const DirectionsMap: React.FC<{
  destination: { lat: number; lng: number };
}> = ({ destination }) => {
  const { isLoaded } = useGoogleMapsContext();
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [selectedMode, setSelectedMode] = useState<google.maps.TravelMode>(
    google.maps.TravelMode.DRIVING
  );
  const [travelDuration, setTravelDuration] = useState<string | null>(null);

  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const travelModes = [
    {
      label: "Driving",
      value: google.maps.TravelMode.DRIVING,
      icon: <FaCarSide />,
    },
    {
      label: "Walking",
      value: google.maps.TravelMode.WALKING,
      icon: <FaWalking />,
    },
    {
      label: "Bicycling",
      value: google.maps.TravelMode.BICYCLING,
      icon: <IoBicycleSharp />,
    },
    {
      label: "Transit",
      value: google.maps.TravelMode.TRANSIT,
      icon: <IoBusSharp />,
    },
  ];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error("Error getting location:", error)
      );
    }
  }, []);

  const handleDirectionsCallback = (
    result: google.maps.DirectionsResult | null,
    status: google.maps.DirectionsStatus
  ) => {
    if (status === "OK" && result) {
      setDirections(result);

      // Get the travel duration for the selected mode
      const duration = result.routes?.[0]?.legs?.[0]?.duration?.text;
      if (duration) setTravelDuration(duration);
    } else {
      console.error("Directions request failed:", status);
    }
  };

  if (!isLoaded || !currentLocation) return <LoadingSkeleton />;

  return (
    <div>
      {/* Travel Mode Icons */}
      <div className="flex gap-4 mb-4">
        {travelModes.map((mode) => (
          <Button
            title={mode.label}
            key={mode.value}
            variant={selectedMode === mode.value ? "default" : "secondary"}
            onClick={() => setSelectedMode(mode.value)}
          >
            <span className="text-xl">{mode.icon}</span>
          </Button>
        ))}
        <Button variant="link">
          <Link
            href={`https://www.google.com/maps/dir/?api=1&origin=${destination.lat},${destination.lng}&destination=${destination.lat},${destination.lng}`}
          >
            Open in Google Maps
          </Link>
        </Button>
      </div>

      {travelDuration && (
        <div className="mb-4">Estimated Duration: {travelDuration}</div>
      )}

      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentLocation}
        zoom={12}
      >
        <DirectionsService
          options={{
            origin: currentLocation,
            destination,
            travelMode: selectedMode,
          }}
          callback={handleDirectionsCallback}
        />
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </div>
  );
};
