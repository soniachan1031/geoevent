import { Autocomplete, LoadScript, Libraries } from "@react-google-maps/api";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { TLocation } from "@/types/location.types";
import { GOOGLE_MAPS_API_KEY } from "@/lib/credentials";

const libraries: Libraries = ["places"];

interface LocationInputProps {
  onChange: (location: TLocation) => void;
  value?: TLocation;
}

export default function LocationInput({
  onChange,
  value,
}: Readonly<LocationInputProps>) {
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);

  const onPlaceChanged = () => {
    if (!autocomplete) return;

    const place = autocomplete.getPlace();
    if (!place.geometry || !place.address_components) return;

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
  };

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={libraries}>
      <Autocomplete onLoad={setAutocomplete} onPlaceChanged={onPlaceChanged}>
        <Input
          type="text"
          name="location.address"
          placeholder="Enter event location"
          value={value?.address ?? ""}
          onChange={(e) =>
            onChange({
              address: e.target.value,
              city: "",
              state: "",
              country: "",
              lat: 0,
              lng: 0,
            })
          }
        />
      </Autocomplete>
    </LoadScript>
  );
}
