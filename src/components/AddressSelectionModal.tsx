import { MapPin, Plus, Check, X, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart, type Address } from '../context/CartContext';
import './AddressSelectionModal.css';

interface AddressSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddNew: () => void;
    onEdit?: (address: Address) => void;
}

const AddressSelectionModal = ({ isOpen, onClose, onAddNew, onEdit }: AddressSelectionModalProps) => {
    const { addresses, selectedAddressId, setSelectedAddressId } = useCart();

    if (!isOpen) return null;

    const handleSelect = (id: string) => {
        setSelectedAddressId(id);
        onClose();
    };

    return (
        <AnimatePresence>
            <div className="address-selection-overlay" onClick={onClose}>
                <motion.div
                    className="address-selection-modal"
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="selection-modal-header">
                        <h2>Select Delivery Address</h2>
                        <button onClick={onClose} className="close-btn">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="selection-modal-content">
                        <div className="address-grid">
                            {addresses.map((addr) => (
                                <div
                                    key={addr.id}
                                    className={`address-option-card ${selectedAddressId === addr.id ? 'active' : ''}`}
                                    onClick={() => handleSelect(addr.id)}
                                >
                                    <div className="option-header">
                                        <div className="type-tag">
                                            <MapPin size={14} />
                                            <span>{addr.type}</span>
                                            {addr.is_default && <span className="default-badge">Default</span>}
                                        </div>
                                        <div className="option-actions">
                                            {onEdit && (
                                                <button
                                                    className="edit-address-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEdit(addr);
                                                    }}
                                                    title="Edit address"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                            )}
                                            {selectedAddressId === addr.id && (
                                                <div className="selected-badge">
                                                    <Check size={14} />
                                                    <span>Selected</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="address-text">{addr.full_address || addr.text}</p>
                                    {(addr.landmark || addr.pincode) && (
                                        <p className="address-meta">
                                            {addr.landmark && <span>{addr.landmark}</span>}
                                            {addr.landmark && addr.pincode && <span> · </span>}
                                            {addr.pincode && <span>PIN: {addr.pincode}</span>}
                                        </p>
                                    )}
                                    <div className="selection-indicator">
                                        <div className="radio-circle"></div>
                                        <span>Select this address</span>
                                    </div>
                                </div>
                            ))}

                            <button className="add-new-address-option" onClick={onAddNew}>
                                <div className="add-icon-circle">
                                    <Plus size={24} />
                                </div>
                                <span>Add New Address</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AddressSelectionModal;
