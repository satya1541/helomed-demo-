import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GoogleAddressInput from './GoogleAddressInput';
import GoogleMapPicker from './GoogleMapPicker';
import type { Address } from '../context/CartContext';
import './AddressModal.css';

interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (address: Address) => void;
    initialData?: Address | null;
}

const AddressModal = ({ isOpen, onClose, onSave, initialData }: AddressModalProps) => {
    const [type, setType] = useState<'Home' | 'Work' | 'Other'>('Home');
    const [fullAddress, setFullAddress] = useState('');
    const [pincode, setPincode] = useState('');
    const [landmark, setLandmark] = useState('');
    const [phone, setPhone] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [isDefault, setIsDefault] = useState(false);

    useEffect(() => {
        if (initialData) {
            setType(initialData.type);
            setFullAddress(initialData.full_address || initialData.text || '');
            setPincode(initialData.pincode || '');
            setLandmark(initialData.landmark || '');
            setPhone(initialData.phone || '');
            setLatitude(initialData.latitude?.toString() || '');
            setLongitude(initialData.longitude?.toString() || '');
            setIsDefault(initialData.is_default || false);
        } else {
            setType('Home');
            setFullAddress('');
            setPincode('');
            setLandmark('');
            setPhone('');
            setLatitude('');
            setLongitude('');
            setIsDefault(false);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullAddress.trim()) return;

        onSave({
            id: initialData?.id || `new-${Date.now()}`,

            type,
            text: fullAddress,
            full_address: fullAddress,
            pincode: pincode || undefined,
            landmark: landmark || undefined,
            phone: phone || undefined,
            latitude: latitude ? parseFloat(latitude) : undefined,
            longitude: longitude ? parseFloat(longitude) : undefined,
            is_default: isDefault
        });
        onClose();
    };

    return (
        <AnimatePresence>
            <div className="address-modal-overlay" onClick={onClose}>
                <motion.div
                    className="address-modal"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="address-modal-header">
                        <h2>{initialData ? 'Edit Address' : 'Add New Address'}</h2>
                        <button onClick={onClose} className="close-btn">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="type-selector">
                            {(['Home', 'Work', 'Other'] as const).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    className={`type-btn ${type === t ? 'active' : ''}`}
                                    onClick={() => setType(t)}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        <div className="form-group-addr">
                            <label>Full Address *</label>
                            <GoogleAddressInput
                                value={fullAddress}
                                onChange={setFullAddress}
                                onPlaceSelected={handlePlaceSelected}
                                className="address-textarea"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group-addr">
                                <label>Pincode</label>
                                <input
                                    type="text"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                    placeholder="e.g. 751002 (Bhubaneswar)"
                                    maxLength={6}
                                />
                            </div>
                            <div className="form-group-addr">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="e.g. 9876543210"
                                    maxLength={10}
                                />
                            </div>
                        </div>

                        <div className="form-group-addr">
                            <label>Landmark</label>
                            <input
                                type="text"
                                value={landmark}
                                onChange={(e) => setLandmark(e.target.value)}
                                placeholder="e.g. Near City Hospital"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group-addr">
                                <label>Latitude</label>
                                <input
                                    type="text"
                                    value={latitude}
                                    placeholder="e.g. 20.2961"
                                    readOnly
                                />
                            </div>
                            <div className="form-group-addr">
                                <label>Longitude</label>
                                <input
                                    type="text"
                                    value={longitude}
                                    placeholder="e.g. 85.8245"
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className="map-picker-section">
                            <label className="map-label">Adjust location accurately on map</label>
                            <GoogleMapPicker
                                lat={latitude ? parseFloat(latitude) : undefined}
                                lng={longitude ? parseFloat(longitude) : undefined}
                                onLocationChange={handleMapLocationChange}
                            />
                        </div>


                        <div className="default-toggle">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    checked={isDefault}
                                    onChange={(e) => setIsDefault(e.target.checked)}
                                />
                                <span className="toggle-text">Set as default address</span>
                            </label>
                        </div>

                        <button type="submit" className="save-address-btn">
                            {initialData ? 'Update Address' : 'Save Address'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AddressModal;
