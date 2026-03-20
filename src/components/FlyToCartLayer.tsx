import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimation } from '../context/AnimationContext';
import './FlyToCartLayer.css';

const FlyToCartLayer = () => {
    const { flyingItem, onAnimationComplete } = useAnimation();
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        if (flyingItem) {
            const targetId = flyingItem.targetType === 'cart' ? 'header-cart-icon' : 'header-wishlist-icon';
            const element = document.getElementById(targetId);
            if (element) {
                const rect = element.getBoundingClientRect();
                setTargetRect(rect);
            }
        }
    }, [flyingItem]);

    return (
        <AnimatePresence onExitComplete={onAnimationComplete}>
            {flyingItem && targetRect && (
                <motion.img
                    key={flyingItem.id}
                    src={flyingItem.image}
                    className="flying-image"
                    initial={{
                        position: 'fixed',
                        top: flyingItem.startRect.top,
                        left: flyingItem.startRect.left,
                        width: flyingItem.startRect.width,
                        height: flyingItem.startRect.height,
                        opacity: 1,
                        zIndex: 99999,
                        borderRadius: '12px',
                    }}
                    animate={{
                        top: targetRect.top + targetRect.height / 2 - 20, // Center on target
                        left: targetRect.left + targetRect.width / 2 - 20,
                        width: 40,
                        height: 40,
                        opacity: 0.5,
                        borderRadius: '50%'
                    }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    onAnimationComplete={onAnimationComplete} // Directly call handler
                    style={{ pointerEvents: 'none', objectFit: 'cover' }}
                />
            )}
        </AnimatePresence>
    );
};

export default FlyToCartLayer;
