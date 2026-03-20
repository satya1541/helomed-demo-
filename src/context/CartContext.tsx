import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { fetchCart, addToCart as apiAddToCart, updateCartItem, incrementCartItem, decrementCartItem, removeFromCart as apiRemoveFromCart, getCartSummary, clearCart as apiClearCart } from '../api/cart';
import { getAddresses, addAddress, deleteAddress as apiDeleteAddress, updateAddress as apiUpdateAddress } from '../api/address';
import { getMyOrders, placeOrder as apiPlaceOrder, getOrderSummary, processPayment as apiProcessPayment, uploadPrescription as apiUploadPrescription } from '../api/orders';
import { getWishlist, addToWishlist as apiAddToWishlist, removeFromWishlist as apiRemoveFromWishlist } from '../api/wishlist';
import { useToast } from '../components/Toast';
import { useSocket } from './SocketContext';

export interface CartItem {
    id: number;
    product_id?: number;
    name: string;
    price: number;
    mrp?: number;
    originalPrice?: number;
    weight?: string;
    image: string;
    quantity: number;
    discount?: number;
    retailer_id?: number;
    retailer_product_id?: number;
    brand_name?: string;
    pack_size?: string;
    requires_prescription?: boolean;
    description?: string;
    salt_composition?: string;
    shop_name?: string;
    full_address?: string;
    stock?: number;
    subtotal?: number;
}

export interface Address {
    id: string;
    type: 'Home' | 'Work' | 'Other';
    text: string; // Mapping full_address here for legacy compatibility
    full_address?: string;
    pincode?: string;
    landmark?: string;
    latitude?: number;
    longitude?: number;
    is_default?: boolean;
    phone?: string;
}

export interface Order {
    id: string;
    order_number?: string;
    date: string;
    items: CartItem[];
    total: number;
    status: 'Pending' | 'Active' | 'Delivered' | 'Cancelled' | 'Returned';
    order_status_id?: number; // Added to track granular status
    subtotal?: number;
    delivery_fee?: number;
    discount_amount?: number;
    taxes_and_fee?: number;
    cash_handling_fee?: number;
    payment_mode?: number;
    payment_method?: number;
    payment_status?: number;
    retailer_id?: number;
    address_id?: number;
    accepted_at?: string;
    delivered_at?: string;
    created_at?: string;
}

export interface Transaction {
    id: number;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    date: string;
}

export interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'order' | 'payment' | 'offer' | 'info';
    date: string;
    read: boolean;
}

interface CartContextType {
    cartItems: CartItem[];
    orders: Order[];
    walletBalance: number;
    transactions: Transaction[];
    notifications: Notification[];
    wishlist: number[];
    addresses: Address[];
    addToCart: (item: Omit<CartItem, 'quantity'>) => void;
    removeFromCart: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
    placeOrder: (paymentMode?: number, paymentMethod?: number, prescription?: string) => Promise<any>;
    processPayment: (orderId: number | string, razorpayOrderId: string, paymentId: string, signature: string) => Promise<any>;
    addMoney: (amount: number) => void;
    addNotification: (title: string, message: string, type: Notification['type']) => void;
    markNotificationsAsRead: () => void;
    clearNotifications: () => void;
    toggleWishlist: (productId: number) => void;
    isInWishlist: (productId: number) => boolean;
    upsertAddress: (address: Address) => void;
    removeAddress: (id: string) => void;
    selectedAddressId: string | null;
    setSelectedAddressId: (id: string | null) => void;
    cartTotal: number;
    cartCount: number;
    cartSummary: any | null;
    loadCartSummary: () => Promise<void>;
    refreshOrders: () => Promise<void>;
    uploadPrescription: (file: File) => Promise<any>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated } = useAuth();
    const toast = useToast();
    const socketContext = useSocket();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    // Verified S3 base URL
    const s3BaseUrl = 'https://helomed.s3.ap-south-2.amazonaws.com/';

    const resolveImageUrl = (value?: string) => {
        if (!value) return value;
        if (value.startsWith('http') || value.startsWith('/')) return value;
        return `${s3BaseUrl}${value}`;
    };

    // Load local cart/orders for guest or initial state
    useEffect(() => {
        if (!isAuthenticated) {
            const savedCart = localStorage.getItem('helo_med_cart');
            if (savedCart) setCartItems(JSON.parse(savedCart));

            const savedOrders = localStorage.getItem('helo_med_orders'); // Guest orders
            if (savedOrders) setOrders(JSON.parse(savedOrders));
        }
    }, [isAuthenticated]);

    const [orders, setOrders] = useState<Order[]>([]);

    const [walletBalance, setWalletBalance] = useState<number>(() => {
        const savedBalance = localStorage.getItem('helo_med_wallet_balance');
        return savedBalance ? JSON.parse(savedBalance) : 0;
    });

    const [transactions, setTransactions] = useState<Transaction[]>(() => {
        const savedTransactions = localStorage.getItem('helo_med_transactions');
        return savedTransactions ? JSON.parse(savedTransactions) : [];
    });

    const [notifications, setNotifications] = useState<Notification[]>(() => {
        const savedNotifications = localStorage.getItem('helo_med_notifications');
        return savedNotifications ? JSON.parse(savedNotifications) : [];
    });

    const [wishlist, setWishlist] = useState<number[]>(() => {
        const savedWishlist = localStorage.getItem('helo_med_wishlist');
        return savedWishlist ? JSON.parse(savedWishlist) : [];
    });
    // Map to store retailer_product_id -> saved_id (primary key for deletion)
    const [wishlistMap, setWishlistMap] = useState<Record<number, number>>({});

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [cartSummary, setCartSummary] = useState<any | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            loadCart();
            loadAddresses();
            loadOrders();
            loadWishlist();
        } else {
            // Guest mode: load from local storage
            const savedAddresses = localStorage.getItem('helo_med_addresses');
            if (savedAddresses) setAddresses(JSON.parse(savedAddresses));
            else setAddresses([{ id: '1', type: 'Home', text: 'Plot-9429, Cuttack - Puri Bypass Rd, B.B.Nagar, Baragarh, Bhubaneswar, Odisha 751002' }]);
        }
    }, [isAuthenticated]);

    // Register socket callback for real-time order updates
    useEffect(() => {
        if (socketContext && isAuthenticated) {
            socketContext.onOrderUpdate(() => {
                loadOrders();
            });
        }
    }, [isAuthenticated, socketContext]);

    const mapCartItems = (payload: any): CartItem[] => {
        if (!payload) return [];

        if (Array.isArray(payload.cart_items)) {
            return payload.cart_items.map((item: any) => {
                const product = item.product || {};
                const retailer = item.retailer || {};
                return {
                    id: Number(item.id ?? item.cart_item_id ?? 0),
                    product_id: Number(product.id ?? item.product_id ?? 0),
                    name: product.product_name ?? item.product_name ?? item.name ?? 'Product',
                    price: Number(item.price ?? product.mrp ?? 0),
                    originalPrice: product.mrp ? Number(product.mrp) : undefined,
                    discount: product.discount_percentage ? Number(product.discount_percentage) : undefined,
                    quantity: Number(item.quantity ?? 1),
                    subtotal: item.subtotal ? Number(item.subtotal) : undefined,
                    image: resolveImageUrl(product.product_image || item.product_image || item.image) || '/images/medicine-placeholder.png',
                    weight: product.pack_size ?? item.pack_size ?? item.weight,
                    brand_name: product.brand_name,
                    pack_size: product.pack_size,
                    requires_prescription: product.requires_prescription,
                    description: product.description,
                    salt_composition: product.salt_composition,
                    stock: product.stock,
                    retailer_id: retailer.id ?? item.retailer_id,
                    retailer_product_id: item.retailer_product_id ?? item.id,
                    shop_name: retailer.shop_name,
                    full_address: retailer.full_address,
                };
            });
        }

        if (payload.items_by_retailer) {
            return Object.values(payload.items_by_retailer).flatMap((retailerItems: any) => {
                const items = Array.isArray(retailerItems)
                    ? retailerItems
                    : (retailerItems?.items ?? []);

                return items.map((item: any) => {
                    const product = item.product || {};
                    const retailer = item.retailer || {};
                    return {
                        id: Number(item.id ?? item.cart_item_id ?? 0),
                        product_id: Number(product.id ?? item.product_id ?? 0),
                        name: product.product_name ?? item.product_name ?? item.name ?? 'Product',
                        price: Number(item.price ?? product.mrp ?? 0),
                        originalPrice: product.mrp ? Number(product.mrp) : undefined,
                        discount: product.discount_percentage ? Number(product.discount_percentage) : undefined,
                        quantity: Number(item.quantity ?? 1),
                        subtotal: item.subtotal ? Number(item.subtotal) : undefined,
                        image: resolveImageUrl(product.product_image || item.product_image || item.image) || '/images/medicine-placeholder.png',
                        weight: product.pack_size ?? item.pack_size ?? item.weight,
                        brand_name: product.brand_name,
                        pack_size: product.pack_size,
                        requires_prescription: product.requires_prescription,
                        description: product.description,
                        salt_composition: product.salt_composition,
                        stock: product.stock,
                        retailer_id: retailer.id ?? item.retailer_id,
                        retailer_product_id: item.retailer_product_id ?? item.id,
                        shop_name: retailer.shop_name,
                        full_address: retailer.full_address,
                    };
                });
            });
        }

        return [];
    };

    const loadCart = async () => {
        try {
            const data = await fetchCart();
            const items = mapCartItems(data);
            setCartItems(items);
        } catch (error) {
            console.error("Failed to load cart", error);
        }
    };

    const loadCartSummary = async () => {
        if (!isAuthenticated || cartItems.length === 0) {
            setCartSummary(null);
            return;
        }
        try {
            const addrId = selectedAddressId ? Number(selectedAddressId) : undefined;
            const summary = await getOrderSummary(addrId, 1, 1);
            setCartSummary(summary);
        } catch (error) {
            console.error('Failed to fetch checkout summary', error);
            // Fallback to cart summary if checkout summary fails
            try {
                const fallback = await getCartSummary(selectedAddressId ? Number(selectedAddressId) : undefined);
                setCartSummary(fallback);
            } catch {
                console.error('Cart summary fallback also failed');
            }
        }
    };

    const mapAddressType = (value: string): Address['type'] => {
        const normalized = (value || '').toUpperCase();
        if (normalized === 'WORK') return 'Work';
        if (normalized === 'OTHER') return 'Other';
        return 'Home';
    };

    const loadAddresses = async () => {
        try {
            const data = await getAddresses();
            const addressList = Array.isArray(data) ? data : data?.data || [];
            if (Array.isArray(addressList)) {
                setAddresses(addressList.map((addr: any) => ({
                    id: addr.id.toString(),
                    type: mapAddressType(addr.address_type),
                    text: addr.full_address,
                    full_address: addr.full_address,
                    pincode: addr.pincode,
                    landmark: addr.landmark,
                    latitude: Number(addr.latitude),
                    longitude: Number(addr.longitude),
                    is_default: addr.is_default
                })));

                if (addressList.length > 0) {
                    const defaultAddr = addressList.find((a: any) => a.is_default);
                    setSelectedAddressId(defaultAddr ? defaultAddr.id.toString() : addressList[0].id.toString());
                }
            }
        } catch (error) {
            console.error("Failed to load addresses", error);
        }
    };

    const mapOrderStatus = (status: number | string) => {
        if (typeof status === 'string') {
            if (status.toLowerCase() === 'pending') return 'Pending';
            return status as Order['status'];
        }

        switch (status) {
            case 0:
                return 'Pending';
            case 7:
                return 'Delivered';
            case 8:
            case 3:
                return 'Cancelled';
            default:
                return 'Active';
        }
    };

    const loadWishlist = async () => {
        try {
            const data = await getWishlist();

            // Handle potential response structures
            let products: any[] = [];
            if (Array.isArray(data)) {
                products = data;
            } else if (Array.isArray(data?.products)) {
                products = data.products;
            } else if (Array.isArray(data?.data?.products)) {
                products = data.data.products;
            } else if (Array.isArray(data?.data)) {
                products = data.data;
            }

            if (Array.isArray(products)) {
                // Map retailer_product_id (product.id) to saved_id (saved_product_id)
                const newMap: Record<number, number> = {};
                const ids: number[] = [];

                products.forEach((item: any) => {
                    const rId = Number(item.product?.id || item.product?.retailer_product_id);
                    const savedId = Number(item.saved_product_id);

                    if (rId && savedId) {
                        newMap[rId] = savedId;
                        ids.push(rId);
                    }
                });

                setWishlistMap(newMap);
                setWishlist(ids);
            }
        } catch (error) {
            console.error("Failed to load wishlist", error);
        }
    };

    const loadOrders = async () => {
        try {
            const data = await getMyOrders();
            // Handle multiple response structures: data.orders, data.data.orders, or direct array
            const ordersList = Array.isArray(data)
                ? data
                : (data?.orders || data?.data?.orders || data?.data || []);

            console.log('Fetched orders:', { original: data, extracted: ordersList });

            if (Array.isArray(ordersList)) {
                const mappedOrders = ordersList.map((order: any) => ({
                    id: (order.order_number ?? order.id ?? 'ORD').toString(),
                    order_number: order.order_number,
                    date: new Date(order.createdAt || order.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                    status: mapOrderStatus(order.order_status ?? order.status ?? 'Active'),
                    order_status_id: Number(order.order_status ?? order.status ?? 1),
                    total: Number(order.total_amount ?? order?.totals?.total_amount ?? order?.totals?.total ?? 0),
                    subtotal: order.subtotal != null ? Number(order.subtotal) : undefined,
                    delivery_fee: order.delivery_fee != null ? Number(order.delivery_fee) : undefined,
                    discount_amount: order.discount_amount != null ? Number(order.discount_amount) : undefined,
                    taxes_and_fee: order.taxes_and_fee != null ? Number(order.taxes_and_fee) : undefined,
                    cash_handling_fee: order.cash_handling_fee != null ? Number(order.cash_handling_fee) : undefined,
                    payment_mode: order.payment_mode,
                    payment_method: order.payment_method,
                    payment_status: order.payment_status,
                    retailer_id: order.retailer_id,
                    address_id: order.address_id,
                    accepted_at: order.accepted_at,
                    delivered_at: order.delivered_at,
                    created_at: order.createdAt || order.created_at,
                    items: (order.order_items || order.items || []).map((item: any) => ({
                        id: item.product_id || item.id || Math.random(),
                        retailer_product_id: item.retailer_product_id || item.product_id,
                        name: item.product_name || item.name || 'Product',
                        mrp: Number(item.mrp ?? 0),
                        price: Number(item.price ?? 0),
                        quantity: item.quantity || 1,
                        image: resolveImageUrl(item.product_image || item.image) || ''
                    }))
                }));
                setOrders(mappedOrders);
            }
        } catch (error) {
            console.error("Failed to load orders", error);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) localStorage.setItem('helo_med_cart', JSON.stringify(cartItems));
    }, [cartItems, isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated) localStorage.setItem('helo_med_orders', JSON.stringify(orders));
    }, [orders, isAuthenticated]);

    useEffect(() => {
        localStorage.setItem('helo_med_wallet_balance', JSON.stringify(walletBalance));
    }, [walletBalance]);

    useEffect(() => {
        localStorage.setItem('helo_med_transactions', JSON.stringify(transactions));
    }, [transactions]);

    useEffect(() => {
        localStorage.setItem('helo_med_notifications', JSON.stringify(notifications));
    }, [notifications]);

    useEffect(() => {
        if (!isAuthenticated) localStorage.setItem('helo_med_wishlist', JSON.stringify(wishlist));
    }, [wishlist, isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated) localStorage.setItem('helo_med_addresses', JSON.stringify(addresses));
    }, [addresses, isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated && cartItems.length > 0) {
            loadCartSummary();
        } else if (cartItems.length === 0) {
            setCartSummary(null);
        }
    }, [selectedAddressId, cartItems, isAuthenticated]);

    const addToCart = async (product: Omit<CartItem, 'quantity'>) => {
        if (isAuthenticated) {
            try {
                const retailerId = product.retailer_id;
                const productId = product.retailer_product_id || product.id;
                await apiAddToCart(retailerId, productId, 1);
                loadCart(); // Refresh
                toast.showToast('Added to cart');
            } catch (error: any) {
                console.error("Add to cart failed", error);
                const errorMessage = error?.response?.data?.message || error?.message || "Failed to add to cart";
                toast.showToast(errorMessage);
            }
        } else {
            setCartItems(prev => {
                const existing = prev.find(item => item.id === product.id);
                if (existing) {
                    return prev.map(item =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                }
                return [...prev, { ...product, product_id: product.id, quantity: 1 }];
            });
        }
    };

    const removeFromCart = async (id: number) => {
        if (isAuthenticated) {
            try {
                await apiRemoveFromCart(id);
                loadCart();
            } catch (error) {
                console.error("Remove from cart failed", error);
            }
        } else {
            setCartItems(prev => prev.filter(item => item.id !== id));
        }
    };

    const updateQuantity = async (id: number, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(id);
            return;
        }

        const currentItem = cartItems.find(item => item.id === id);
        const currentQuantity = currentItem ? currentItem.quantity : 0;

        if (isAuthenticated) {
            try {
                if (quantity === currentQuantity + 1) {
                    await incrementCartItem(id);
                } else if (quantity === currentQuantity - 1) {
                    await decrementCartItem(id);
                } else {
                    await updateCartItem(id, quantity);
                }
                loadCart();
            } catch (error: any) {
                console.error("Update quantity failed", error);
                const errorMessage = error?.response?.data?.message || error?.message || "Failed to update quantity";
                toast.showToast(errorMessage);
            }
        } else {
            setCartItems(prev =>
                prev.map(item =>
                    item.id === id ? { ...item, quantity } : item
                )
            );
        }
    };

    const clearCart = async () => {
        if (isAuthenticated) {
            try {
                await apiClearCart();
                loadCart();
            } catch (error) {
                console.error("Clear cart failed", error);
            }
        } else {
            setCartItems([]);
        }
    };

    const addNotification = (title: string, message: string, type: Notification['type']) => {
        const newNotification: Notification = {
            id: Date.now(),
            title,
            message,
            type,
            date: 'Just now',
            read: false
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const markNotificationsAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    const toggleWishlist = async (productId: number) => {
        if (isAuthenticated) {
            const isSaved = wishlist.includes(productId);
            try {
                if (isSaved) {
                    const savedId = wishlistMap[productId];
                    if (savedId) {
                        await apiRemoveFromWishlist(savedId);
                        setWishlist(prev => prev.filter(id => id !== productId));
                        setWishlistMap(prev => {
                            const newMap = { ...prev };
                            delete newMap[productId];
                            return newMap;
                        });
                    }
                } else {
                    const response = await apiAddToWishlist(productId);
                    const savedId = response?.id; // Assuming response contains the created record with id
                    if (savedId) {
                        setWishlist(prev => [...prev, productId]);
                        setWishlistMap(prev => ({ ...prev, [productId]: savedId }));
                    }
                }
            } catch (error) {
                console.error("Toggle wishlist failed", error);
            }
        } else {
            setWishlist(prev =>
                prev.includes(productId)
                    ? prev.filter(id => id !== productId)
                    : [...prev, productId]
            );
        }
    };

    const isInWishlist = (productId: number) => wishlist.includes(productId);

    const upsertAddress = async (address: Address) => {
        if (isAuthenticated) {
            try {
                const apiAddressType = address.type.toUpperCase();
                const payload = {
                    full_address: address.full_address || address.text,
                    address_type: apiAddressType,
                    latitude: address.latitude ?? 20.2961,
                    longitude: address.longitude ?? 85.8245,
                    pincode: address.pincode || '751002',
                    landmark: address.landmark || '',
                    phone: address.phone || '',
                    is_default: address.is_default || false
                };

                // If address has a numeric ID, it's an existing address → PUT update
                const numericId = Number(address.id);
                if (!isNaN(numericId) && numericId > 0) {
                    await apiUpdateAddress(numericId, payload);
                } else {
                    await addAddress(payload);
                }
                loadAddresses();
            } catch (error) {
                console.error("Address save failed", error);
            }
        } else {
            setAddresses(prev => {
                const existing = prev.find(a => a.id === address.id);
                if (existing) {
                    return prev.map(a => a.id === address.id ? address : a);
                }
                return [...prev, address];
            });
        }
    };

    const removeAddress = async (id: string) => {
        if (isAuthenticated) {
            try {
                await apiDeleteAddress(id);
                loadAddresses();
            } catch (error) {
                console.error("Delete address failed", error);
            }
        } else {
            setAddresses(prev => prev.filter(a => a.id !== id));
        }
    };

    const addMoney = (amount: number) => {
        setWalletBalance(prev => prev + amount);
        const newTransaction: Transaction = {
            id: Date.now(),
            type: 'credit',
            amount,
            description: 'Added to Wallet',
            date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
        };
        setTransactions(prev => [newTransaction, ...prev]);
        addNotification('Money Added', `₹${amount} added to your wallet successfully.`, 'payment');
    };

    const placeOrder = async (paymentMode: number = 1, paymentMethod: number = 1, prescription?: string) => {
        if (isAuthenticated) {
            try {
                const addressId = selectedAddressId ? Number(selectedAddressId) : (addresses.length > 0 ? Number(addresses[0].id) : 1);
                const orderData = {
                    address_id: addressId,
                    payment_mode: paymentMode,
                    payment_method: paymentMethod,
                    ...(prescription && { prescription })
                };

                const response = await apiPlaceOrder(orderData);
                // Refresh orders
                loadOrders();
                
                if (paymentMode !== 2) {
                    const firstOrder = Array.isArray(response?.orders) ? response.orders[0] : response?.orders;
                    const orderLabel = firstOrder?.order_number ?? firstOrder?.order_id ?? response?.order_id ?? 'new';
                    addNotification('Order Placed', `Your order #${orderLabel} has been placed successfully.`, 'order');
                    // Cart should be cleared on backend, but refresh cart too
                    loadCart();
                }
                
                return response;
            } catch (error) {
                console.error("Order placement failed", error);
                addNotification('Order Failed', 'Please try again later.', 'info');
                throw error;
            }
        } else {
            // Guest logic
            const newOrder: Order = {
                id: `ORD-${Date.now()}`,
                date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
                items: [...cartItems],
                total: cartTotal,
                status: 'Active'
            };
            setOrders(prev => [newOrder, ...prev]);
            addNotification('Order Placed', `Your order #${newOrder.id} has been placed successfully.`, 'order');
            clearCart();
        }
    };

    const processPayment = async (orderId: number | string, razorpayOrderId: string, paymentId: string, signature: string) => {
        try {
            const response = await apiProcessPayment(orderId, {
                razorpay_order_id: razorpayOrderId,
                razorpay_payment_id: paymentId,
                razorpay_signature: signature
            });
            // Reload cart since it should be cleared after successful payment
            loadCart();
            // Notify user
            addNotification('Payment Successful', `Your payment for order #${orderId} was successful.`, 'payment');
            return response;
        } catch (error) {
            console.error("Payment processing failed", error);
            throw error;
        }
    };

    const uploadPrescription = async (file: File) => {
        try {
            const response = await apiUploadPrescription(file);
            return response;
        } catch (error) {
            console.error("Prescription upload failed", error);
            throw error;
        }
    };

    const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            orders,
            walletBalance,
            transactions,
            notifications,
            wishlist,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            placeOrder,
            processPayment,
            addMoney,
            addNotification,
            markNotificationsAsRead,
            clearNotifications,
            toggleWishlist,
            isInWishlist,
            addresses,
            selectedAddressId,
            setSelectedAddressId,
            cartSummary,
            loadCartSummary,
            upsertAddress,
            removeAddress,
            cartTotal,
            cartCount,
            refreshOrders: loadOrders,
            uploadPrescription
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
