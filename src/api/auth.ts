import api from './client';

const unwrapData = (payload: any) => payload?.data?.data ?? payload?.data ?? payload;

export const sendOtp = async (phone: string) => {
    const response = await api.post('/user/send-otp', { phone });
    return unwrapData(response);
};

export const verifyOtp = async (phone: string, otp: string) => {
    const response = await api.post('/user/verify-otp', { phone, otp });
    return unwrapData(response);
};

export const signup = async (userData: any) => {
    const response = await api.post('/user/signup', userData);
    return unwrapData(response);
};

export const getProfile = async () => {
    const response = await api.get('/user/profile');
    return unwrapData(response);
};

export const updateProfile = async (data: any) => {
    const config = data instanceof FormData ? {
        headers: { 'Content-Type': 'multipart/form-data' }
    } : undefined;
    const response = await api.put('/user/profile', data, config);
    return unwrapData(response);
};
