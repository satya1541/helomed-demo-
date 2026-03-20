import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ShoppingCart, X, Heart } from 'lucide-react';
import './Toast.css';

interface ToastData {
    id: number;
    message: string;
    productName?: string;
}

interface ToastContextType {
    showToast: (message: string, productName?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const showToast = (message: string, productName?: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, productName }]);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container">
                <AnimatePresence mode="popLayout">
                    {toasts.map(toast => (
                        <ToastItem
                            key={toast.id}
                            toast={toast}
                            onRemove={() => removeToast(toast.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ toast, onRemove }: { toast: ToastData; onRemove: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onRemove, 3000); // Increased to 3 seconds
        return () => clearTimeout(timer);
    }, [onRemove]);

    const isWishlist = toast.message.toLowerCase().includes('wishlist');
    const isCart = toast.message.toLowerCase().includes('cart');

    return (
        <motion.div
            className="toast-item"
            initial={{ opacity: 0, y: 30, scale: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
                opacity: 0,
                y: -40,
                scale: 1.05,
                filter: 'blur(8px)',
                transition: { duration: 0.5, ease: "easeOut" }
            }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        >
            <div className="toast-icon">
                {isWishlist ? <Heart size={20} fill="white" /> : <ShoppingCart size={20} />}
            </div>
            <div className="toast-content">
                <span className="toast-title">
                    {isWishlist ? (
                        <Heart size={14} className="icon-wishlist" />
                    ) : isCart ? (
                        <ShoppingCart size={14} className="icon-cart" />
                    ) : (
                        <CheckCircle size={14} className="icon-success" />
                    )}
                    {toast.message}
                </span>
                {toast.productName && (
                    <span className="toast-product">{toast.productName}</span>
                )}
            </div>
            <button className="toast-close" onClick={onRemove}>
                <X size={18} />
            </button>
        </motion.div>
    );
};

export default ToastProvider;
