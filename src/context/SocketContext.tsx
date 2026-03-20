import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface DeliveryPartner {
    id: number;
    name: string;
    phone: string;
    vehicle_number: string;
}

interface OrderPlacedPayload {
    order_id: number;
    order_number: string;
    retailer_id: number;
    total_amount: number;
    order_status: number;
    payment_status: number;
    payment_mode: number;
    created_at: string;
}

interface PaymentSuccessPayload {
    order_id: number;
    order_number: string;
    payment_status: number;
}

interface OrderStatusPayload {
    order_id: number;
    order_number: string;
    order_status: number;
    rejection_reason?: string;
    message?: string;
}

interface DeliveryAssignedPayload {
    order_id: number;
    order_number: string;
    delivery_partner: DeliveryPartner;
}

interface DeliveryArrivedPayload {
    order_id: number;
    order_number: string;
    message: string;
}

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    onOrderUpdate: (callback: (orderId: number) => void) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    // Return null if not within provider instead of throwing
    return context;
};

interface SocketProviderProps {
    children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user } = useAuth();
    const orderUpdateCallbacksRef = useRef<((orderId: number) => void)[]>([]);

    useEffect(() => {
        // Only connect if user is authenticated
        if (!user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        const token = localStorage.getItem('helo_med_token');
        if (!token) return;

        // Create socket connection with authentication
        const newSocket = io('https://helo.thynxai.cloud', {
            auth: {
                token: token
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        // Connection events
        newSocket.on('connect', () => {
            console.log('✅ Connected to Socket.io server:', newSocket.id);
            setIsConnected(true);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('❌ Disconnected from Socket.io:', reason);
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        // Order placed event
        newSocket.on('order_placed', (payload: OrderPlacedPayload) => {
            console.log('📦 Order Placed:', payload);
            orderUpdateCallbacksRef.current.forEach(cb => cb(payload.order_id));
        });

        // Payment success event
        newSocket.on('payment_success', (payload: PaymentSuccessPayload) => {
            console.log('💳 Payment Success:', payload);
            orderUpdateCallbacksRef.current.forEach(cb => cb(payload.order_id));
        });

        // Payment status updated event
        newSocket.on('payment_status_updated', (payload: PaymentSuccessPayload) => {
            console.log('💰 Payment Status Updated:', payload);
            orderUpdateCallbacksRef.current.forEach(cb => cb(payload.order_id));
        });

        // Order status updated event
        newSocket.on('order_status_updated', (payload: OrderStatusPayload) => {
            console.log('📊 Order Status Updated:', payload);
            orderUpdateCallbacksRef.current.forEach(cb => cb(payload.order_id));
        });

        // Delivery partner assigned event
        newSocket.on('order_assigned_to_delivery', (payload: DeliveryAssignedPayload) => {
            console.log('🚚 Delivery Partner Assigned:', payload);
            orderUpdateCallbacksRef.current.forEach(cb => cb(payload.order_id));
        });

        // Delivery partner arrived event
        newSocket.on('delivery_partner_arrived', (payload: DeliveryArrivedPayload) => {
            console.log('📍 Delivery Partner Arrived:', payload);
            orderUpdateCallbacksRef.current.forEach(cb => cb(payload.order_id));
        });

        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            newSocket.disconnect();
        };
    }, [user]); // Re-connect when user changes

    const onOrderUpdate = (callback: (orderId: number) => void) => {
        orderUpdateCallbacksRef.current.push(callback);
    };

    const value: SocketContextType = {
        socket,
        isConnected,
        onOrderUpdate
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
