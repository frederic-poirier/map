import { createContext, useContext, createSignal } from 'solid-js';

const PlaceContext = createContext();

export function PlaceProvider(props) {
  const [selectedPlace, setSelectedPlace] = createSignal(null);
  
  const selectPlace = (place) => {
    setSelectedPlace(place);
  };
  
  const clearPlace = () => {
    setSelectedPlace(null);
  };
  
  return (
    <PlaceContext.Provider value={{ selectedPlace, selectPlace, clearPlace }}>
      {props.children}
    </PlaceContext.Provider>
  );
}

export function usePlace() {
  const context = useContext(PlaceContext);
  if (!context) {
    throw new Error('usePlace must be used within a PlaceProvider');
  }
  return context;
}
