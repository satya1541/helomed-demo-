import retailerApi from './retailerClient';
import api from './client'; // Fallback to user client if needed

const unwrapData = (payload: any) => payload?.data?.data ?? payload?.data ?? payload;

type UploadRole = 'retailer' | 'user';

const getClient = (role: UploadRole) => {
    switch (role) {
        case 'retailer':
            return retailerApi;
        case 'user':
        default:
            return api;
    }
};

export const getImagePresignedUrl = async (role: UploadRole, payload: { folder: string; fileName: string; contentType: string }) => {
    const response = await getClient(role).post('/upload/presigned-url/image', payload);
    return unwrapData(response);
};

export const getExcelPresignedUrl = async (role: UploadRole, payload: { fileName: string; contentType: string }) => {
    const response = await getClient(role).post('/upload/presigned-url/excel', payload);
    return unwrapData(response);
};

export const getBatchPresignedUrls = async (role: UploadRole, payload: { files: Array<{ folder: string; fileName: string; contentType: string }> }) => {
    const response = await getClient(role).post('/upload/presigned-url/batch', payload);
    return unwrapData(response);
};

export const uploadToPresignedUrl = async (presignedUrl: string, file: File) => {
    const response = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': file.type
        },
        body: file
    });

    if (!response.ok) {
        throw new Error('Upload failed');
    }

    return true;
};
