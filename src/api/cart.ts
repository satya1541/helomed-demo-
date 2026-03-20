import api from './client';

const unwrapData = (payload: any) => payload?.data?.data ?? payload?.data ?? payload;

export const addToCart = async (retailerId: number | undefined, retailerProductId: number, quantity: number) => {
    const payload: Record<string, any> = {
        retailer_product_id: retailerProductId,
        quantity,
    };

    if (retailerId) {
        payload.retailer_id = retailerId;
    }

    const response = await api.post('/user-cart/cart', payload);
    return unwrapData(response);
};

export const fetchCart = async () => {
    const response = await api.get('/user-cart/cart');
    return unwrapData(response);
};

export const updateCartItem = async (itemId: number, quantity: number) => {
    const response = await api.put(`/user-cart/cart/item/${itemId}`, { quantity });
    return unwrapData(response);
};

export const incrementCartItem = async (itemId: number) => {
    const response = await api.put(`/user-cart/cart/item/${itemId}/increment`);
    return unwrapData(response);
};

export const decrementCartItem = async (itemId: number) => {
    const response = await api.put(`/user-cart/cart/item/${itemId}/decrement`);
    return unwrapData(response);
};

export const removeFromCart = async (itemId: number) => {
    const response = await api.delete(`/user-cart/cart/item/${itemId}`);
    return unwrapData(response);
};

export const clearCart = async () => {
    const response = await api.delete('/user-cart/cart');
    return unwrapData(response);
};

export const getCartSummary = async (addressId?: number | string) => {
    const response = await api.get('/user-cart/cart/summary', { params: { address_id: addressId } });
    return unwrapData(response);
};

export const getCartCount = async () => {
    const response = await api.get('/user-cart/cart/count');
    return unwrapData(response);
};
