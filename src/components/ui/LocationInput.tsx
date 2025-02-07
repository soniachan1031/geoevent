import { Autocomplete, Libraries, useLoadScript } from "@react-google-maps/api";
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { TLocation } from "@/types/location.types";
import { GOOGLE_MAPS_API_KEY } from "@/lib/credentials";

const libraries: Libraries = ["places"];

interface LocationInputProps {
  name: string;
  onChange: (location: TLocation) => void;
  value?: TLocation;
}

export default function LocationInput({
  name,
  onChange,
  value,
}: Readonly<LocationInputProps>) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(value?.address ?? "");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle Place Selection
  const onPlaceChanged = () => {
    if (!autocomplete) return;

    const place = autocomplete.getPlace();
    if (!place.geometry || !place.address_components) {
      clearInput();
      return;
    }

    // Extract address components
    const components: Record<string, string> = {};
    place.address_components.forEach((component) => {
      const type = component.types[0];
      components[type] = component.long_name;
    });

    // Structure location object
    const newLocation: TLocation = {
      address: place.formatted_address ?? "",
      city: components.locality ?? components.sublocality ?? "",
      state: components.administrative_area_level_1 ?? "",
      country: components.country ?? "",
      lat: place.geometry.location?.lat() ?? 0,
      lng: place.geometry.location?.lng() ?? 0,
    };

    onChange(newLocation);
    setInputValue(newLocation.address);
  };

  // Clears input if no valid place is selected
  const clearInput = () => {
    setInputValue("");
    onChange({
      address: "",
      city: "",
      state: "",
      country: "",
      lat: 0,
      lng: 0,
    });
  };

  // Handle manual input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      if (!autocomplete?.getPlace()?.geometry) {
        clearInput();
      }
    }, 1500); // Clear input if no selection after 1.5 seconds
  };

  // Prevent rendering if Google Maps API failed to load
  if (loadError) {
    console.error("Google Maps API failed to load:", loadError);
    return (
      <Input type="text" placeholder="Location search unavailable" disabled />
    );
  }

  return (
    <div>
      {isLoaded ? (
        <Autocomplete onLoad={setAutocomplete} onPlaceChanged={onPlaceChanged}>
          <Input
            type="text"
            name={name}
            placeholder="Enter event location"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={clearInput}
          />
        </Autocomplete>
      ) : (
        <Input type="text" placeholder="Loading location search..." disabled />
      )}
    </div>
  );
}
