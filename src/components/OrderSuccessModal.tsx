import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import './OrderSuccessModal.css';

interface OrderSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const OrderSuccessModal = ({ isOpen, onClose }: OrderSuccessModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="success-modal-overlay">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="success-modal"
                    >
                        <div className="success-icon-wrapper">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.1 }}
                            >
                                <CheckCircle size={48} />
                            </motion.div>
                        </div>

                        <h2>Order Placed Successfully!</h2>
                        <p>Thank you for shopping with Helo Med. Your health is our priority.</p>

                        <button className="btn-success-action" onClick={onClose}>
                            <span>View My Orders</span>
                            <ArrowRight size={18} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default OrderSuccessModal;
