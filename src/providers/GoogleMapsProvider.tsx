// GoogleMapsProvider.tsx
import React, { createContext, useContext } from "react";
import { Libraries, useLoadScript } from "@react-google-maps/api";
import { GOOGLE_MAPS_API_KEY } from "@/lib/credentials";

const libraries: Libraries = ["places", "marker"];

const GoogleMapsContext = createContext<{
  isLoaded: boolean;
  loadError: Error | undefined;
}>({ isLoaded: false, loadError: undefined });

export const GoogleMapsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
    version: "beta",
  });

  const contextValue = React.useMemo(
    () => ({ isLoaded, loadError }),
    [isLoaded, loadError]
  );

  return (
    <GoogleMapsContext.Provider value={contextValue}>
      {children}
    </GoogleMapsContext.Provider>
  );
};

export function useGoogleMapsContext() {
  return useContext(GoogleMapsContext);
}
