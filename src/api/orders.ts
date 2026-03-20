import api from './client';

const unwrapData = (payload: any) => payload?.data?.data ?? payload?.data ?? payload;

export const getOrderSummary = async (addressId?: number | string, paymentMode?: number, paymentMethod?: number) => {
    const params: any = {};
    if (addressId) params.address_id = addressId;
    if (paymentMode) params.payment_mode = paymentMode;
    if (paymentMethod) params.payment_method = paymentMethod;
    const response = await api.get('/order/checkout/summary', { params });
    return unwrapData(response);
};

export const calculateDeliveryFee = async (payload: { address_id?: number | string; latitude?: number; longitude?: number }) => {
    const response = await api.post('/order/calculate-delivery-fee', payload);
    return unwrapData(response);
};

export const placeOrder = async (orderData: { address_id: number | string; payment_mode: number; payment_method?: number; prescription?: string }) => {
    const response = await api.post('/order/checkout', orderData);
    return unwrapData(response);
};

export const processPayment = async (orderId: number | string, payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; }) => {
    // Exact payload explicitly required by API
    const finalPayload = {
        payment_id: payload.razorpay_payment_id,
        payment_signature: payload.razorpay_signature
    };
    const response = await api.post(`/order/${orderId}/payment`, finalPayload);
    return unwrapData(response);
};

export const updatePaymentStatus = async (
    orderId: number | string,
    payload: { payment_status: number; payment_id?: string; payment_signature?: string; failure_reason?: string | null }
) => {
    const response = await api.put(`/order/${orderId}/payment-status`, payload);
    return unwrapData(response);
};

export const trackOrder = async (orderId: number | string) => {
    const response = await api.get(`/order/${orderId}/track`);
    return unwrapData(response);
};

export const getInvoice = async (orderId: number | string) => {
    const response = await api.get(`/order/${orderId}/invoice`);
    return unwrapData(response);
};

// User Order History
const tryEndpoints = async <T>(requests: Array<() => Promise<T>>, defaultValue: T) => {
    for (const request of requests) {
        try {
            return await request();
        } catch (error: any) {
            if (error?.response?.status === 404) {
                continue;
            }
            throw error;
        }
    }
    return defaultValue;
};

export const getMyOrders = async () => {
    const response = await tryEndpoints(
        [
            () => api.get('/user-order/orders'),
            () => api.get('/order/orders')
        ],
        [] as any
    );
    return unwrapData(response);
};

export const getOrderDetails = async (orderId: number | string) => {
    const response = await tryEndpoints(
        [
            () => api.get(`/user-order/orders/${orderId}`),
            () => api.get(`/order/orders/${orderId}`)
        ],
        null as any
    );
    return unwrapData(response);
};

export const cancelOrder = async (orderId: number | string) => {
    const response = await tryEndpoints(
        [
            () => api.put(`/user-order/orders/${orderId}/cancel`),
            () => api.put(`/order/orders/${orderId}/cancel`)
        ],
        null as any
    );
    return unwrapData(response);
};

export const uploadPrescription = async (file: File) => {
    const formData = new FormData();
    formData.append('prescription', file);
    const response = await api.post('/order/upload-prescription', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return unwrapData(response);
};
