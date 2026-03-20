import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, User, Mail, ArrowRight, Loader2, MapPin, Hash } from 'lucide-react';
import GoogleAddressInput from '../components/GoogleAddressInput';
import GoogleMapPicker from '../components/GoogleMapPicker';

import { signup } from '../api/auth';
import './LoginPage.css'; 

/* 
// Compress image to reduce file size (max 800px width, 0.7 quality)
const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<File> => {
    return new Promise((resolve, reject) => {
        // ... (implementation omitted for brevity)
        // If file is already small (< 200KB), skip compression
        if (file.size < 200 * 1024) {
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;

                // Scale down if wider than maxWidth
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(file); // Fallback to original
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            resolve(compressedFile);
                        } else {
                            resolve(file);
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = () => resolve(file);
            img.src = event.target?.result as string;
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
};
*/

const SignupPage = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState<number | ''>('');
    const [addressType, setAddressType] = useState('home');
    const [fullAddress, setFullAddress] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [pincode, setPincode] = useState('');
    const [landmark, setLandmark] = useState('');
    const [locating, setLocating] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const getErrorMessage = (err: any) => {
        const data = err?.response?.data;
        if (typeof data === 'string') return data;
        if (data?.message) return data.message;
        if (data?.error?.message) return data.error.message;
        if (data?.errors) {
            const firstError = Array.isArray(data.errors)
                ? data.errors[0]
                : Object.values(data.errors)[0];
            if (typeof firstError === 'string') return firstError;
        }
        if (data) return `Signup failed: ${JSON.stringify(data)}`;
        if (err?.message) return err.message;
        return 'Signup failed. Please check your details and try again.';
    };

    const detectLocation = async () => {
        const setCoords = (lat: number, lng: number) => {
            setLatitude(lat.toFixed(6));
            setLongitude(lng.toFixed(6));
        };

        const reverseGeocode = async (lat: number, lng: number) => {
            try {
                const response = await fetch(
                    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyDpyclQV4dQAs4q2UcfnmZ2lwzXPmIVe7E`
                );
                const data = await response.json();
                if (response.ok && Array.isArray(data?.results) && data.results.length > 0) {
                    if (data.results[0]?.formatted_address) {
                        setFullAddress(data.results[0].formatted_address);
                    }
                    const postalComp = data.results
                        .flatMap((result: any) => result.address_components || [])
                        .find((c: any) => c.types?.includes('postal_code'));
                    if (postalComp?.long_name) {
                        setPincode(postalComp.long_name);
                    }

                    // Extract Landmark/Sublocality with even more types for better accuracy (including locality for rural areas)
                    const landmarkComp = data.results
                        .flatMap((result: any) => result.address_components || [])
                        .find((c: any) =>
                            c.types?.includes('sublocality_level_1') ||
                            c.types?.includes('sublocality_level_2') ||
                            c.types?.includes('sublocality') ||
                            c.types?.includes('neighborhood') ||
                            c.types?.includes('point_of_interest') ||
                            c.types?.includes('premise') ||
                            c.types?.includes('establishment') ||
                            c.types?.includes('locality') ||
                            c.types?.includes('administrative_area_level_3') ||
                            c.types?.includes('natural_feature')
                        );

                    let finalLandmark = '';
                    if (landmarkComp?.long_name) {
                        finalLandmark = landmarkComp.long_name;
                    } else if (data.results[0]?.formatted_address) {
                        // Fallback: Use the first descriptive part of the address (e.g. Village/Area name)
                        const parts = data.results[0].formatted_address.split(',');
                        let bestLandmark = parts[0].trim();
                        // If it's a plus code (contains +), try to get the name after it or use next part
                        if (bestLandmark.includes('+')) {
                            const subParts = bestLandmark.split(' ');
                            if (subParts.length > 1) bestLandmark = subParts.slice(1).join(' ');
                            else if (parts.length > 1) bestLandmark = parts[1].trim();
                        }
                        finalLandmark = bestLandmark;
                    }

                    if (finalLandmark) {
                        setLandmark(finalLandmark);
                    }
                }
            } catch (err) {
                // Keep manual entry if reverse geocode fails
            }
        };

        const fallbackToGoogle = async () => {
            try {
                const response = await fetch(
                    'https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyDpyclQV4dQAs4q2UcfnmZ2lwzXPmIVe7E',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data?.error?.message || 'Unable to detect location');
                }
                setCoords(data.location.lat, data.location.lng);
                await reverseGeocode(data.location.lat, data.location.lng);
            } catch (err) {
                setError('Unable to detect location. Please enter latitude and longitude manually.');
            } finally {
                setLocating(false);
            }
        };

        setError('');
        setLocating(true);

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setCoords(lat, lng);
                    await reverseGeocode(lat, lng);
                    setLocating(false);
                },
                () => {
                    void fallbackToGoogle();
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            await fallbackToGoogle();
        }
    };

    const handlePlaceSelected = (details: { address: string; pincode?: string; landmark?: string; lat?: number; lng?: number }) => {
        setFullAddress(details.address);
        if (details.pincode) setPincode(details.pincode);
        if (details.landmark) setLandmark(details.landmark);
        if (details.lat !== undefined) setLatitude(details.lat.toString());
        if (details.lng !== undefined) setLongitude(details.lng.toString());
    };

    const handleMapLocationChange = (details: { address: string; pincode?: string; landmark?: string; lat: number; lng: number }) => {
        setFullAddress(details.address);
        if (details.pincode) setPincode(details.pincode);
        if (details.landmark) setLandmark(details.landmark);
        setLatitude(details.lat.toString());
        setLongitude(details.lng.toString());
    };

    const validateAge = (dob: string) => {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 18;
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!phone || phone.length < 10) {
            setError('Please fill in all required fields correctly');
            return;
        }

        if (!name) {
            setError('Please enter your name');
            return;
        }
        if (!dateOfBirth) {
            setError('Please enter your date of birth');
            return;
        }
        if (!validateAge(dateOfBirth)) {
            setError('You must be at least 18 years old to register');
            return;
        }

        setLoading(true);
        try {
            await signup({
                name,
                phone,
                email,
                date_of_birth: dateOfBirth,
                gender: gender || undefined,
                full_address: fullAddress,
                latitude: latitude ? Number(latitude) : undefined,
                longitude: longitude ? Number(longitude) : undefined,
                pincode,
                landmark,
                address_type: addressType
            });

            navigate('/login');
        } catch (err: any) {
            console.error('Signup failed:', err?.response?.status, err?.response?.data || err);
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="login-page" data-theme="user">
            <div className="login-container">
                <div className="login-logo-section">
                    <img src="/images/logo.png" alt="Helo Med" className="login-logo" />
                    <h1>Create Account</h1>
                    <p>Join Helo Med to get started</p>
                </div>


                <form className="login-form" onSubmit={handleSignup}>
                        <div className="form-group">
                            <label htmlFor="name">
                                <User size={16} />
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Rahul Kumar"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">
                                <Phone size={16} />
                                Phone Number
                            </label>
                            <div className="phone-input-wrapper">
                                <span className="country-code">+91</span>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Enter mobile number"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">
                                <Mail size={16} />
                                Email Address (Optional)
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="e.g. rahul@example.com"
                            />
                        </div>

                        <div className="form-group">
                            <label>Date of Birth</label>
                            <input
                                type="date"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Gender</label>
                            <select value={gender} onChange={(e) => setGender(e.target.value ? Number(e.target.value) : '')}>
                                <option value="">Select gender</option>
                                <option value="1">Male</option>
                                <option value="2">Female</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <div className="form-label-row">
                                <label>
                                    <MapPin size={16} />
                                    Full Address
                                </label>
                                <button
                                    type="button"
                                    className="geo-btn compact"
                                    onClick={detectLocation}
                                    disabled={locating}
                                >
                                    {locating ? 'Detecting...' : 'Use current location'}
                                </button>
                            </div>
                            <GoogleAddressInput
                                value={fullAddress}
                                onChange={setFullAddress}
                                onPlaceSelected={handlePlaceSelected}
                                className="signup-address-input"
                                placeholder="e.g. B.B.Nagar, Bhubaneswar, Odisha"
                            />

                            <div className="map-picker-section" style={{ marginTop: '1rem' }}>
                                <label className="map-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
                                    Adjust location accurately on map
                                </label>
                                <GoogleMapPicker
                                    lat={latitude ? parseFloat(latitude) : undefined}
                                    lng={longitude ? parseFloat(longitude) : undefined}
                                    onLocationChange={handleMapLocationChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>
                                <Hash size={16} />
                                Pincode
                            </label>
                            <input
                                type="text"
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value)}
                                placeholder="e.g. 751002"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Landmark</label>
                            <input
                                type="text"
                                value={landmark}
                                onChange={(e) => setLandmark(e.target.value)}
                                placeholder="e.g. Near City Hospital"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Latitude</label>
                                <input
                                    type="text"
                                    value={latitude}
                                    placeholder="e.g. 20.2961"
                                    readOnly
                                />
                            </div>
                            <div className="form-group">
                                <label>Longitude</label>
                                <input
                                    type="text"
                                    value={longitude}
                                    placeholder="e.g. 85.8245"
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Address Type</label>
                            <select value={addressType} onChange={(e) => setAddressType(e.target.value)}>
                                <option value="home">Home</option>
                                <option value="work">Work</option>
                                <option value="other">Other</option>
                            </select>
                        </div>


                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 size={24} className="spin" />
                                <span>Creating Account...</span>
                            </>
                        ) : (
                            <>
                                <span>Sign Up</span>
                                <ArrowRight size={22} />
                            </>
                        )}
                    </button>

                    <div className="login-footer">
                        <p>Already have an account? <Link to="/login" className="link">Login</Link></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;
