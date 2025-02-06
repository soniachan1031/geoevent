import { Autocomplete, Libraries, useLoadScript } from "@react-google-maps/api";
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { GOOGLE_MAPS_API_KEY } from "@/lib/credentials";
import { TSearchLocation } from "@/types/location.types";

const libraries: Libraries = ["places"];

interface SearchbarLocationInputProps {
  onChange?: (location: TSearchLocation) => void;
  value?: TSearchLocation;
}

export default function SearchbarLocationInput({
  onChange,
  value,
}: Readonly<SearchbarLocationInputProps>) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(
    value?.city ?? value?.state ?? value?.country ?? ""
  );
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to handle place selection
  const onPlaceChanged = () => {
    if (!autocomplete) return;

    const place = autocomplete.getPlace();
    if (!place.geometry || !place.address_components) {
      clearInput();
      return;
    }

    // Extract relevant location details
    const components: Record<string, string> = {};
    place.address_components.forEach((component) => {
      const type = component.types[0];
      components[type] = component.long_name;
    });

    // Structure the location object
    const newLocation: TSearchLocation = {
      city: components.locality ?? components.sublocality ?? "",
      state: components.administrative_area_level_1 ?? "",
      country: components.country ?? "",
    };

    onChange?.(newLocation);
    setInputValue(newLocation.city ?? newLocation.state ?? newLocation.country);
  };

  const clearInput = () => {
    setInputValue("");
    onChange?.({ city: "", state: "", country: "" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      if (!autocomplete?.getPlace()?.geometry) {
        clearInput();
      }
    }, 1500);
  };

  // Prevent rendering if the Google Maps API failed to load
  if (loadError) {
    console.error("Google Maps API failed to load:", loadError);
    return (
      <Input type="text" placeholder="Location search unavailable" disabled />
    );
  }

  return (
    <div>
      {isLoaded ? (
        <Autocomplete
          onLoad={setAutocomplete}
          onPlaceChanged={onPlaceChanged}
          options={{
            types: ["(cities)"], // Prioritize city results
          }}
        >
          <Input
            type="text"
            name="location.city"
            placeholder="Search city"
            className="py-1 px-3 border-none"
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
