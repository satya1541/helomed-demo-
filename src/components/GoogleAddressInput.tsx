/// <reference types="google.maps" />
import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';


interface GoogleAddressInputProps {
    value: string;
    onChange: (value: string) => void;
    onPlaceSelected: (details: {
        address: string;
        pincode?: string;
        landmark?: string;
        lat?: number;
        lng?: number;
    }) => void;
    placeholder?: string;
    className?: string;
    required?: boolean;
}

const GoogleAddressInput = ({
    value,
    onChange,
    onPlaceSelected,
    placeholder = "Search your delivery location...",
    className = "",
    required = false
}: GoogleAddressInputProps) => {

    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const [isFocused, setIsFocused] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClear = () => {
        onChange("");
        setError(null);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };


    useEffect(() => {
        if (!inputRef.current || !window.google) return;

        const autocompleteService = new google.maps.places.AutocompleteService();
        const placesService = new google.maps.places.PlacesService(document.createElement('div'));

        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {

            componentRestrictions: { country: "in" },
            fields: ["address_components", "geometry", "formatted_address", "name"],
            // Biasing and strictly restricting results towards Odisha bounds
            // Using 'as any' for broader compatibility with @types
            ...({
                locationRestriction: {
                    north: 22.57,
                    south: 17.78,
                    east: 87.48,
                    west: 81.37,
                },
                strictBounds: true
            } as any),
        });

        const processPlace = (place: google.maps.places.PlaceResult) => {
            if (!place || !place.formatted_address || !place.geometry?.location) return;

            let isOdisha = false;
            let pincode = "";
            let landmark = "";

            if (place.address_components) {
                for (const component of place.address_components) {
                    const types = component.types;
                    if (types.includes("administrative_area_level_1") && component.long_name === "Odisha") {
                        isOdisha = true;
                    }
                    if (types.includes("postal_code")) {
                        pincode = component.long_name;
                    }
                    if (types.includes("sublocality_level_1") || types.includes("neighborhood") || types.includes("point_of_interest")) {
                        if (!landmark) landmark = component.long_name;
                    }
                }
            }

            if (!landmark && place.name && place.formatted_address.includes(place.name)) {
                landmark = place.name;
            }

            if (!isOdisha) {
                setError("We currently only serve Odisha state. Please select an address within Odisha.");
                onChange("");
                return;
            }

            setError(null);

            // Update input text to the full address for better feedback
            onChange(place.formatted_address);

            onPlaceSelected({
                address: place.formatted_address,
                pincode,
                landmark,
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
            });

            // Blur input to hide the PAC container
            inputRef.current?.blur();
        };

        autocompleteRef.current.addListener("place_changed", () => {
            const place = autocompleteRef.current?.getPlace();
            if (place && place.geometry) {
                processPlace(place);
            }
        });

        const handleKeyDown = (e: any) => {
            if (e.key === "Enter") {
                // ALWAYS prevent default to stop form submission and jumping
                e.preventDefault();
                e.stopPropagation();

                const pacContainer = document.querySelector(".pac-container");
                const isPacVisible = pacContainer && window.getComputedStyle(pacContainer).display !== "none";

                if (isPacVisible) {
                    const pacItemSelected = pacContainer.querySelector(".pac-item-selected");
                    if (pacItemSelected) {
                        // User manual selection from list - let Google handle it via simulated enter
                        const enterEvent = new KeyboardEvent("keydown", { key: "Enter", keyCode: 13, bubbles: true });
                        (enterEvent as any)._isSimulated = true;
                        inputRef.current?.dispatchEvent(enterEvent);
                    } else if (value.trim().length > 0) {
                        // No item selected - Manually fetch the top prediction appending Odisha for context
                        const searchInput = value.toLowerCase().includes("odisha") ? value : `${value}, Odisha`;
                        autocompleteService.getPlacePredictions({
                            input: searchInput,
                            componentRestrictions: { country: "in" },
                            ...({
                                locationRestriction: {
                                    north: 22.57,
                                    south: 17.78,
                                    east: 87.48,
                                    west: 81.37,
                                },
                            } as any)
                        }, (predictions, status) => {
                            if (status === google.maps.places.PlacesServiceStatus.OK && predictions?.[0]) {
                                placesService.getDetails({
                                    placeId: predictions[0].place_id,
                                    fields: ["address_components", "geometry", "formatted_address", "name"]
                                }, (place, detailStatus) => {
                                    if (detailStatus === google.maps.places.PlacesServiceStatus.OK && place) {
                                        processPlace(place);
                                    }
                                });
                            }
                        });
                    }
                } else if (value.trim().length > 0) {
                    // PAC not visible but user hit enter - still try to resolve top result with state context
                    const searchInput = value.toLowerCase().includes("odisha") ? value : `${value}, Odisha`;
                    autocompleteService.getPlacePredictions({
                        input: searchInput,
                        componentRestrictions: { country: "in" }
                    }, (predictions, status) => {
                        if (status === google.maps.places.PlacesServiceStatus.OK && predictions?.[0]) {
                            placesService.getDetails({
                                placeId: predictions[0].place_id,
                                fields: ["address_components", "geometry", "formatted_address", "name"]
                            }, (place, detailStatus) => {
                                if (detailStatus === google.maps.places.PlacesServiceStatus.OK && place) {
                                    processPlace(place);
                                }
                            });
                        }
                    });
                }
            }
        };


        const currentInput = inputRef.current;
        currentInput?.addEventListener("keydown", handleKeyDown);


        return () => {
            google.maps.event?.clearInstanceListeners(autocompleteRef.current!);
            currentInput?.removeEventListener("keydown", handleKeyDown);
        };
    }, [onPlaceSelected, onChange]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
        if (error) setError(null);
    };

    return (
        <div className="google-address-search-container">
            <div className={`google-address-input-wrapper ${isFocused ? 'focused' : ''} ${error ? 'error' : ''} ${className}`}>
                <div className="search-icon-wrapper">
                    <Search size={18} />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    placeholder={placeholder}
                    className="address-textarea-inner"
                    required={required}
                    autoComplete="off"
                    name="address_input"
                />
                {value && (

                    <button
                        type="button"
                        className="clear-search-btn"
                        onClick={handleClear}
                        title="Clear search"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>
            {error && (
                <div className="address-error-message">
                    {error}
                </div>
            )}
        </div>
    );
};


export default GoogleAddressInput;
