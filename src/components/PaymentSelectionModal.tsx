import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Truck, Check, Loader2 } from 'lucide-react';
import { PAYMENT_MODE } from '../constants';
import './PaymentSelectionModal.css';

interface PaymentMethod {
    method: number;
    name: string;
    cash_handling_fee?: number;
}

interface PaymentModeOption {
    mode: number;
    name: string;
    methods?: PaymentMethod[];
}

interface PaymentSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (mode: number, method: number) => void;
    amount: number;
    subtotal: number;
    deliveryFee: number;
    paymentModes?: PaymentModeOption[];
    cashHandlingFee?: number;
    taxesAndFee?: number;
    discount?: number;
}

const PaymentSelectionModal = ({ isOpen, onClose, onConfirm, amount, subtotal, deliveryFee, paymentModes, cashHandlingFee, taxesAndFee, discount }: PaymentSelectionModalProps) => {
    const [selectedMode, setSelectedMode] = useState<number>(PAYMENT_MODE.PAY_ONLINE);
    const [selectedMethod, setSelectedMethod] = useState<number>(1);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleConfirm = async () => {
        setIsProcessing(true);
        try {
            await onConfirm(selectedMode, selectedMethod);
        } finally {
            setIsProcessing(false);
        }
    };

    // Calculate the actual payable amount based on selected mode
    // amount already excludes cash handling, so for COD we add it
    const handlingFee = cashHandlingFee || 0;
    const displayAmount = selectedMode === PAYMENT_MODE.PAY_ONLINE
        ? amount
        : amount + handlingFee;

    const handleModeSelect = (mode: number) => {
        setSelectedMode(mode);
        // Default to method 2 (ONLINE_QR) for PAY_ONLINE, 1 (COD) for PAY_ON_DELIVERY
        setSelectedMethod(mode === PAYMENT_MODE.PAY_ONLINE ? 2 : 1);
    };



    // Dynamic or fallback modes
    const displayModes: PaymentModeOption[] = paymentModes && paymentModes.length > 0
        ? paymentModes
        : [
            { mode: PAYMENT_MODE.PAY_ONLINE, name: 'Pay Online' },
            { mode: PAYMENT_MODE.PAY_ON_DELIVERY, name: 'Pay on Delivery' }
        ];

    const getModeIcon = (mode: number) => {
        if (mode === PAYMENT_MODE.PAY_ONLINE) return <CreditCard size={24} />;
        return <Truck size={24} />;
    };

    const getModeDescription = (mode: number) => {
        if (mode === PAYMENT_MODE.PAY_ONLINE) return 'Safe and secure online payment via Razorpay';
        return 'Pay with cash or QR code at your doorstep';
    };



    return (
        <AnimatePresence>
            {isOpen && (
                <div className="payment-selection-overlay">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="payment-selection-modal"
                    >
                        <div className="modal-header">
                            <h2>Select Payment Method</h2>
                            <button className="close-modal-btn" onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="price-summary-mini">
                                {discount !== undefined && discount > 0 && (
                                    <div className="price-row discount">
                                        <span>Discount</span>
                                        <span className="text-green">-₹{discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="price-row">
                                    <span>MRP After Discount</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="price-row">
                                    <span>Delivery Fee</span>
                                    <span>{deliveryFee > 0 ? `₹${deliveryFee.toFixed(2)}` : 'FREE'}</span>
                                </div>
                                {taxesAndFee !== undefined && taxesAndFee > 0 && (
                                    <div className="price-row">
                                        <span>Taxes & Fee</span>
                                        <span>₹{taxesAndFee.toFixed(2)}</span>
                                    </div>
                                )}
                                {cashHandlingFee !== undefined && cashHandlingFee > 0 && selectedMode === PAYMENT_MODE.PAY_ON_DELIVERY && (
                                    <div className="price-row">
                                        <span>Cash Handling Fee</span>
                                        <span>₹{cashHandlingFee.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="price-row total">
                                    <span>Amount to Pay</span>
                                    <span>₹{displayAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="payment-options">
                                {displayModes.map((pm) => (
                                    <div
                                        key={pm.mode}
                                        className={`payment-option-card ${selectedMode === pm.mode ? 'selected' : ''}`}
                                        onClick={() => handleModeSelect(pm.mode)}
                                    >
                                        {pm.mode === PAYMENT_MODE.PAY_ONLINE && (
                                            <div className="beta-ribbon">BETA</div>
                                        )}
                                        <div className="option-icon-box">
                                            {getModeIcon(pm.mode)}
                                        </div>
                                        <div className="option-details">
                                            <h4>{pm.name}</h4>
                                            <p>{getModeDescription(pm.mode)}</p>
                                        </div>
                                        <div className="selection-check">
                                            <Check size={14} />
                                        </div>
                                    </div>
                                ))}
                            </div>


                        </div>

                        <div className="modal-footer">
                            <button
                                className="confirm-payment-btn"
                                onClick={handleConfirm}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="spin" size={20} />
                                        Please wait...
                                    </>
                                ) : (
                                    <>
                                        {selectedMode === PAYMENT_MODE.PAY_ONLINE ? 'Pay & Place Order' : 'Confirm Order'}
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PaymentSelectionModal;
