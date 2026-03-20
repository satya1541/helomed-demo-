/// <reference types="google.maps" />
import { useEffect, useRef } from 'react';

interface GoogleMapPickerProps {
    lat?: number;
    lng?: number;
    onLocationChange: (details: {
        address: string;
        pincode?: string;
        landmark?: string;
        lat: number;
        lng: number;
    }) => void;
    className?: string;
}

const BHUBANESWAR_CENTER = { lat: 20.2961, lng: 85.8245 };
const ODISHA_BOUNDS = {
    north: 22.57,
    south: 17.78,
    east: 87.48,
    west: 81.37,
};

const GoogleMapPicker = ({
    lat,
    lng,
    onLocationChange,
    className = ""
}: GoogleMapPickerProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);
    const geocoderRef = useRef<google.maps.Geocoder | null>(null);

    useEffect(() => {
        if (!mapRef.current || !window.google) return;

        const initialPos = (lat && lng) ? { lat, lng } : BHUBANESWAR_CENTER;

        geocoderRef.current = new google.maps.Geocoder();

        googleMapRef.current = new google.maps.Map(mapRef.current, {
            center: initialPos,
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            // Restrict map to Odisha
            restriction: {
                latLngBounds: ODISHA_BOUNDS,
                strictBounds: false,
            },
        });

        markerRef.current = new google.maps.Marker({
            position: initialPos,
            map: googleMapRef.current,
            draggable: true,
            animation: google.maps.Animation.DROP,
        });

        const handleMarkerDragEnd = () => {
            const position = markerRef.current?.getPosition();
            if (!position) return;

            const newLat = position.lat();
            const newLng = position.lng();

            // Reverse geocode
            geocoderRef.current?.geocode({ location: { lat: newLat, lng: newLng } }, (results, status) => {
                if (status === "OK" && results?.[0]) {
                    const result = results[0];
                    let pincode = "";
                    let landmark = "";
                    let isOdisha = false;

                    for (const component of result.address_components) {
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

                    if (!isOdisha) {
                        alert("Please select a location within Odisha state.");
                        // Reset marker to previous position or center
                        markerRef.current?.setPosition(initialPos);
                        googleMapRef.current?.setCenter(initialPos);
                        return;
                    }

                    onLocationChange({
                        address: result.formatted_address,
                        pincode,
                        landmark,
                        lat: newLat,
                        lng: newLng,
                    });
                }
            });
        };

        markerRef.current.addListener("dragend", handleMarkerDragEnd);

        // Also allow clicking map to move marker
        googleMapRef.current.addListener("click", (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
                markerRef.current?.setPosition(e.latLng);
                handleMarkerDragEnd();
            }
        });

        return () => {
            if (google.maps.event) {
                google.maps.event.clearInstanceListeners(markerRef.current!);
                google.maps.event.clearInstanceListeners(googleMapRef.current!);
            }
        };
    }, []);

    // Update map/marker when lat/lng props change (e.g. from Autocomplete)
    useEffect(() => {
        if (lat && lng && googleMapRef.current && markerRef.current) {
            const newPos = { lat, lng };
            const currentPos = markerRef.current.getPosition();
            
            // Avoid unnecessary updates if positions matched
            if (currentPos && Math.abs(currentPos.lat() - lat) < 0.0001 && Math.abs(currentPos.lng() - lng) < 0.0001) {
                return;
            }

            markerRef.current.setPosition(newPos);
            googleMapRef.current.panTo(newPos);
            googleMapRef.current.setZoom(17); // Zoom in closer when an address is selected
        }
    }, [lat, lng]);


    return (
        <div 
            ref={mapRef} 
            className={`map-picker-container ${className}`}
            style={{ width: '100%', height: '250px', borderRadius: '8px', marginTop: '1rem', border: '1px solid #e0e0e0' }}
        />
    );
};

export default GoogleMapPicker;
