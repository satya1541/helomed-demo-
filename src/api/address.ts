import api from './client';

const unwrapData = (payload: any) => payload?.data?.data ?? payload?.data ?? payload;

export const getAddresses = async () => {
    const response = await api.get('/user-address/address');
    return unwrapData(response);
};

export const addAddress = async (addressData: any) => {
    const response = await api.post('/user-address/address', addressData);
    return unwrapData(response);
};

export const deleteAddress = async (id: number | string) => {
    const response = await api.delete(`/user-address/address/${id}`);
    return unwrapData(response);
};

export const updateAddress = async (id: number | string, addressData: any) => {
    const response = await api.put(`/user-address/address/${id}`, addressData);
    return unwrapData(response);
};
