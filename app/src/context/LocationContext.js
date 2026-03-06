import React, { createContext, useContext, useMemo, useState } from 'react';

const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const clearSelectedLocation = () => setSelectedLocation(null);

  const value = useMemo(
    () => ({
      selectedLocation,
      setSelectedLocation,
      clearSelectedLocation,
    }),
    [selectedLocation]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useLocationSelection = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocationSelection must be used within a LocationProvider');
  return ctx;
};
