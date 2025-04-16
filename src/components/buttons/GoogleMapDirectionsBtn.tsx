import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
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
import { TLocation } from "@/types/location.types";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";

const GoogleMapDirectionBtn: React.FC<{
  event: IEvent;
}> = ({ event }) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <div className="flex gap-3 items-center">
            <FaShare /> <span>Get Directions</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Directions to {event.title}</DialogTitle>
          <DialogDescription asChild>
            <div className="pt-2">
              <DirectionsMap destination={event.location} />
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button ref={closeBtnRef} variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GoogleMapDirectionBtn;

// Container style for the map
const containerStyle = { width: "100%", height: "450px" };

const DirectionsMap: React.FC<{ destination: TLocation }> = ({
  destination,
}) => {
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
  const [locationError, setLocationError] = useState<string | null>(null);

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

  const isValidCoordinates = destination.lat !== 0 && destination.lng !== 0;

  // Fallback destination string (e.g., "123 Main St, City, State, Country")
  const destinationAddress = `${destination.address}${
    destination.city ? `, ${destination.city}` : ""
  }${destination.state ? `, ${destination.state}` : ""}, ${
    destination.country
  }`;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError(
            "Unable to retrieve your location. Please ensure location permissions are granted."
          );
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  }, []);

  const handleDirectionsCallback = (
    result: google.maps.DirectionsResult | null,
    status: google.maps.DirectionsStatus
  ) => {
    if (status === "OK" && result) {
      setDirections(result);
      const duration = result.routes?.[0]?.legs?.[0]?.duration?.text;
      if (duration) setTravelDuration(duration);
    } else {
      console.error("Directions request failed:", status);
    }
  };

  if (!isLoaded || !currentLocation) {
    if (locationError) return <div>{locationError}</div>;
    return <LoadingSkeleton />;
  }

  return (
    <div>
      {/* Travel Mode Buttons */}
      <div className="flex gap-4 mb-4">
        {travelModes.map((mode) => (
          <Button
            key={mode.value}
            title={mode.label}
            variant={selectedMode === mode.value ? "default" : "secondary"}
            onClick={() => setSelectedMode(mode.value)}
          >
            <span className="text-xl">{mode.icon}</span>
          </Button>
        ))}

        {/* Open in Google Maps (dynamic destination string or coords) */}
        <Button variant="link">
          <Link
            href={`https://www.google.com/maps/dir/?api=1&origin=${
              currentLocation.lat
            },${currentLocation.lng}&destination=${
              isValidCoordinates
                ? `${destination.lat},${destination.lng}`
                : encodeURIComponent(destinationAddress)
            }`}
            target="_blank"
          >
            Open in Google Maps
          </Link>
        </Button>
      </div>

      {travelDuration && (
        <div className="mb-4">Estimated Duration: {travelDuration}</div>
      )}

      {/* Google Map Display */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentLocation}
        zoom={12}
      >
        <DirectionsService
          options={{
            origin: currentLocation,
            destination: isValidCoordinates ? destination : destinationAddress,
            travelMode: selectedMode,
          }}
          callback={handleDirectionsCallback}
        />
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </div>
  );
};
