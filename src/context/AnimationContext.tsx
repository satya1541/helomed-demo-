import { createContext, useContext, useState, type ReactNode } from 'react';

interface FlyingItem {
    id: number;
    image: string;
    startRect: DOMRect;
    targetType: 'cart' | 'wishlist';
}

interface AnimationContextType {
    flyingItem: FlyingItem | null;
    triggerFlyAnimation: (data: { image: string, targetType: 'cart' | 'wishlist' }, startElement: HTMLElement) => void;
    onAnimationComplete: () => void;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export const AnimationProvider = ({ children }: { children: ReactNode }) => {
    const [flyingItem, setFlyingItem] = useState<FlyingItem | null>(null);

    const triggerFlyAnimation = (data: { image: string, targetType: 'cart' | 'wishlist' }, startElement: HTMLElement) => {
        const rect = startElement.getBoundingClientRect();
        setFlyingItem({
            id: Date.now(),
            image: data.image,
            startRect: rect,
            targetType: data.targetType
        });
    };

    const onAnimationComplete = () => {
        setFlyingItem(null);
    };

    return (
        <AnimationContext.Provider value={{ flyingItem, triggerFlyAnimation, onAnimationComplete }}>
            {children}
        </AnimationContext.Provider>
    );
};

export const useAnimation = () => {
    const context = useContext(AnimationContext);
    if (!context) {
        throw new Error('useAnimation must be used within an AnimationProvider');
    }
    return context;
};
