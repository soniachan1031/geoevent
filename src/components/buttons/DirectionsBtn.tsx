import { TLocation } from "@/types/location.types";
import { FC } from "react";
import { Button } from "@/components/ui/button";
import { FaShare } from "react-icons/fa";

const DirectionsBtn: FC<{ location: TLocation }> = ({ location }) => {
  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
    window.open(url, "_blank");
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
