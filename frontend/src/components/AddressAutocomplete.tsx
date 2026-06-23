'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, X, Loader2, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    google: any;
    initGoogleMaps?: () => void;
  }
}

interface GoogleAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GoogleGeometry {
  location: {
    lat: () => number;
    lng: () => number;
  };
}

interface GooglePlaceResult {
  address_components: GoogleAddressComponent[];
  formatted_address: string;
  geometry: GoogleGeometry;
  place_id: string;
}

interface AddressResult {
  street: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  formattedAddress: string;
  placeId: string;
  latitude: number;
  longitude: number;
  addressVerified: boolean;
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressResult) => void;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

let googleMapsLoaded = false;
let googleMapsLoading = false;

function loadGoogleMaps(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (googleMapsLoaded) {
      resolve();
      return;
    }
    if (googleMapsLoading) {
      const check = setInterval(() => {
        if (googleMapsLoaded) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      reject(new Error('Google Maps API key not configured'));
      return;
    }

    googleMapsLoading = true;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    window.initGoogleMaps = () => {
      googleMapsLoaded = true;
      googleMapsLoading = false;
      resolve();
    };

    script.onerror = () => {
      googleMapsLoading = false;
      reject(new Error('Failed to load Google Maps'));
    };

    document.head.appendChild(script);
  });
}

export function AddressAutocomplete({
  onAddressSelect,
  defaultValue = '',
  placeholder = 'Start typing your address...',
  className = '',
  disabled = false,
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [mapsAvailable, setMapsAvailable] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const autocompleteServiceRef = useRef<any>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (defaultValue !== undefined && defaultValue !== inputValue) {
      setInputValue(defaultValue);
    }
  }, [defaultValue]);

  useEffect(() => {
    let mounted = true;

    loadGoogleMaps()
      .then(() => {
        if (!mounted) return;
        setMapsAvailable(true);
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      })
      .catch(() => {
        if (mounted) {
          setMapsAvailable(false);
          setShowManual(true);
        }
      });

    return () => { mounted = false; };
  }, []);

  // Fetch suggestions when user types (after 3 characters)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!inputValue || inputValue.length < 3 || !mapsAvailable || !autocompleteServiceRef.current) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(() => {
      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: inputValue,
          componentRestrictions: { country: 'za' },
          types: ['address'],
        },
        (predictions: any[], status: string) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
            // Calculate dropdown position
            if (inputRef.current) {
              const rect = inputRef.current.getBoundingClientRect();
              setDropdownPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
              });
              setShowSuggestions(true);
            }
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
          setIsLoading(false);
        }
      );
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputValue, mapsAvailable]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPlaceDetails = useCallback(async (placeId: string): Promise<GooglePlaceResult | null> => {
    if (!window.google?.maps?.places) return null;

    const service = new window.google.maps.places.PlacesService(document.createElement('div'));

    return new Promise((resolve) => {
      service.getDetails(
        { placeId, fields: ['address_components', 'formatted_address', 'geometry', 'place_id'] },
        (place: GooglePlaceResult | null, status: string) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            resolve(place);
          } else {
            resolve(null);
          }
        }
      );
    });
  }, []);

  const handleSuggestionClick = useCallback(async (suggestion: any) => {
    setInputValue(suggestion.description);
    setShowSuggestions(false);
    setIsLoading(true);

    try {
      const place = await fetchPlaceDetails(suggestion.place_id);
      if (!place?.address_components) {
        setError('Could not get address details. Please try again.');
        setIsLoading(false);
        return;
      }

      setError('');
      const components = place.address_components;

      const getComponent = (types: string[]): string => {
        const comp = components.find((c: any) => types.some((t: string) => c.types.includes(t)));
        return comp?.long_name || '';
      };

      const streetNumber = getComponent(['street_number']);
      const route = getComponent(['route']);
      const street = streetNumber ? `${streetNumber} ${route}` : route;
      const suburb = getComponent(['sublocality', 'sublocality_level_1', 'neighborhood']);
      const city = getComponent(['locality', 'administrative_area_level_2']);
      const province = getComponent(['administrative_area_level_1']);
      const postalCode = getComponent(['postal_code']);
      const country = getComponent(['country']) || 'South Africa';

      const result: AddressResult = {
        street,
        suburb,
        city,
        province,
        postalCode,
        country,
        formattedAddress: place.formatted_address || '',
        placeId: place.place_id || '',
        latitude: place.geometry?.location?.lat() || 0,
        longitude: place.geometry?.location?.lng() || 0,
        addressVerified: true,
      };

      onAddressSelect(result);
    } catch (err) {
      setError('Failed to load address details');
    } finally {
      setIsLoading(false);
    }
  }, [fetchPlaceDetails, onAddressSelect]);

  const handleClear = () => {
    setInputValue('');
    setError('');
    setSuggestions([]);
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  const handleManualFallback = () => {
    setShowManual(true);
    setError('');
    setShowSuggestions(false);
  };

  if (showManual || !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return null; // Parent will show manual fields
  }

  const input = (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className={`w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#003d7a] focus:bg-white transition-colors ${className}`}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
        {inputValue && !isLoading && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {error && (
        <div className="mt-1.5 flex items-start gap-1.5 text-amber-600">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <p className="text-[11px]">{error}</p>
        </div>
      )}
    </div>
  );

  // Render suggestions dropdown via portal to prevent focus loss
  if (showSuggestions && suggestions.length > 0) {
    return (
      <>
        {input}
        {createPortal(
          <div
            ref={suggestionsRef}
            className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.place_id}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-start gap-2"
              >
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span className="break-words">{suggestion.description}</span>
              </button>
            ))}
          </div>,
          document.body
        )}
      </>
    );
  }

  return input;
}
