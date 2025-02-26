import { TLocation } from "@/types/location.types";
import { FC } from "react";
import { Button } from "@/components/ui/button";
import { FaShare } from "react-icons/fa";

const DirectionsBtn: FC<{ location: TLocation }> = ({ location }) => {
  const handleDirections = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const url = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${location.lat},${location.lng}`;
          window.open(url, "_blank");
        },
        () => {
          // If user denies permission or an error occurs, fallback to just the destination
          const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
          window.open(url, "_blank");
        }
      );
    } else {
      // Geolocation API not available
      const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
      window.open(url, "_blank");
    }
  };

  return (
    <Button variant="outline" onClick={handleDirections}>
      <div className="flex gap-3 items-center">
        <FaShare /> <span>Get Directions</span>
      </div>
    </Button>
  );
};

export default DirectionsBtn;


