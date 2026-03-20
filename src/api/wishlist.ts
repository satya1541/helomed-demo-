import api from './client';

const unwrapData = (payload: any) => payload?.data?.data ?? payload?.data ?? payload;

// Add item to wishlist
export const addToWishlist = async (retailerProductId: number) => {
    const response = await api.post('/user-saved-products/', { retailer_product_id: retailerProductId });
    return unwrapData(response);
};

// Get all wishlist items
export const getWishlist = async () => {
    const response = await api.get('/user-saved-products/');
    return unwrapData(response);
};

// Check if a specific item is in wishlist
export const checkWishlist = async (retailerProductId: number) => {
    const response = await api.get(`/user-saved-products/check?retailer_product_id=${retailerProductId}`);
    return unwrapData(response);
};

// Remove item from wishlist
export const removeFromWishlist = async (id: number) => {
    const response = await api.delete(`/user-saved-products/${id}`);
    return unwrapData(response);
};
