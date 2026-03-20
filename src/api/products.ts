import api from './client';

export type NormalizedProduct = {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    weight?: string;
    pack_size?: string;
    image?: string;
    category?: string;
    retailer_id?: number;
    retailer_product_id?: number;
    shop_name?: string;
    retailer_phone?: string;
    full_address?: string; // from retailer object
    stock?: number;
    requires_prescription?: boolean;
    product_category?: number;
    categoryId?: number;
    salt_composition?: string;
    brand_name?: string;
    description?: string;
    tags?: string; // can be string or null
    dosage_form?: number;
    age_group?: number;
};

export const PRODUCT_CATEGORY = {
    MEDICINE_SUPPLEMENTS: 1,
    FOOD_NUTRITION: 2,
    BABY_PERSONAL_HYGIENE: 3,
    MEDICAL_DEVICE: 4,
    PERSONAL_CARE: 5,
    OTHER: 6
};

const unwrapData = (payload: any) => payload?.data?.data ?? payload?.data ?? payload;
const s3BaseUrl = 'https://helomed.s3.ap-south-2.amazonaws.com/';

export const resolveImageUrl = (value?: string | null) => {
    if (!value) return undefined; // Return undefined if null/empty
    if (value.startsWith('http') || value.startsWith('/')) return value;
    return `${s3BaseUrl}${value}`;
};

const tryEndpoints = async <T>(requests: Array<() => Promise<T>>, defaultValue: T) => {
    for (const request of requests) {
        try {
            return await request();
        } catch (error: any) {
            if (error?.response?.status === 404 || error?.response?.status === 401 || error?.response?.status === 500) {
                continue;
            }
            throw error;
        }
    }
    return defaultValue;
};

const normalizeProduct = (product: any): NormalizedProduct => {
    const price = Number(product?.price ?? product?.selling_price ?? product?.mrp ?? 0);
    const mrp = product?.mrp ?? product?.original_price;
    const discount = product?.discount_percentage ??
        (mrp && price ? Math.round(((Number(mrp) - price) / Number(mrp)) * 100) : undefined);

    // Retailer info might be nested in `retailer` object
    const retailer = product?.retailer || {};
    const shopName = retailer.shop_name ?? product?.shop_name ?? product?.retailer_name;
    const retailerAddress = retailer.full_address ?? retailer.address ?? product?.full_address;

    // Handle both `id` and `product_id` from different endpoints
    const productId = Number(product?.product_id ?? product?.id ?? 0);

    return {
        id: productId,
        name: product?.product_name ?? product?.name ?? 'Product',
        price,
        originalPrice: mrp ? Number(mrp) : undefined,
        discount,
        weight: product?.pack_size ?? 'Standard',
        pack_size: product?.pack_size,
        image: resolveImageUrl(product?.product_image ?? product?.image_url),
        category: product?.category?.name || String(product?.category ?? 'Wellness'),
        retailer_id: product?.retailer_id ?? retailer?.id,
        retailer_product_id: productId, // Use the resolved product ID
        shop_name: shopName,
        full_address: retailerAddress,
        stock: product?.stock,
        requires_prescription: product?.requires_prescription,
        categoryId: product?.product_category_id ?? (typeof product?.category === 'object' ? product?.category?.id : product?.category),
        salt_composition: product?.salt_composition,
        brand_name: product?.brand_name,
        description: product?.description,
        tags: product?.tags,
        dosage_form: product?.dosage_form,
        age_group: product?.age_group
    };
};

const normalizeProductList = (data: any): NormalizedProduct[] => {
    if (Array.isArray(data)) return data.map(normalizeProduct);
    if (Array.isArray(data?.products)) return data.products.map(normalizeProduct);
    if (Array.isArray(data?.data)) return data.data.map(normalizeProduct);
    return [];
};

export const getCategories = async () => {
    const response = await api.get('/product-category');
    // response.data.data is the array of categories
    return unwrapData(response) || [];
};

// Updated to use the new endpoint structure
export const getProductsByCategory = async (categoryId: number, page = 1, limit = 10) => {
    const response = await api.get(`/user-products/categories/${categoryId}/products`, {
        params: { page, limit }
    });

    // The response structure is data: { category: {...}, products: [...], pagination: {...} }
    const responseData = response.data?.data;

    return {
        products: normalizeProductList(responseData?.products || []),
        total: responseData?.pagination?.total || 0,
        page: responseData?.pagination?.page || page,
        limit: responseData?.pagination?.limit || limit,
        categoryName: responseData?.category?.name
    };
};

// Keeping this for backward compatibility or general search if needed
export const getAllProducts = async () => {
    // Falls back to fetching from a default category or search if no master list endpoint
    // For now, let's fetch from category 1 (Medicine & Supplements) as default
    return (await getProductsByCategory(1)).products;
};

export const searchProducts = async (query: string, page = 1, limit = 10) => {
    try {
        const response = await api.get('/user-search/search', { params: { q: query, page, limit } });
        const data = unwrapData(response);
        // Response structure: { results: { type: 'PRODUCT', data: [...] } }
        const products = data?.results?.data || [];
        return normalizeProductList(products);
    } catch (e) {
        return [];
    }
};

export const getProductById = async (id: string | number) => {
    try {
        const response = await api.get(`/user-search/products/${id}`);
        const data = unwrapData(response);
        const product = data?.product || data;
        const retailer = data?.retailer;

        // Merge retailer info into product for normalization if present
        const mergedProduct = retailer ? { ...product, retailer } : product;
        return normalizeProduct(mergedProduct);
    } catch (e) {
        return null;
    }
};

export const getSearchSuggestions = async (query: string) => {
    const response = await tryEndpoints(
        [
            () => api.get('/user-search/search-suggestions', { params: { q: query } }),
            () => api.get('/master-products/suggestions', { params: { q: query } })
        ],
        [] as any
    );
    return unwrapData(response) || [];
};

export const getRetailerProducts = async (retailerId: number | string, page = 1, limit = 10) => {
    const response = await api.get(`/user-search/retailers/${retailerId}/products`, { params: { page, limit } });
    const data = unwrapData(response);
    return normalizeProductList(data);
};

export const getRetailerSearchSuggestions = async (retailerId: number | string, query: string) => {
    const response = await api.get(`/user-search/retailers/${retailerId}/search-suggestions`, { params: { q: query } });
    return unwrapData(response) || [];
};

export const searchRetailerProducts = async (retailerId: number | string, query: string, page = 1, limit = 10) => {
    const response = await api.get(`/user-search/retailers/${retailerId}/search-products`, { params: { q: query, page, limit } });
    const data = unwrapData(response);
    return normalizeProductList(data);
};

// New endpoint for retailer products (from user request)
export const getAllRetailerProducts = async (page = 1, limit = 20) => {
    const response = await api.get('/retailerProduct/products', { params: { page, limit } });
    const data = unwrapData(response);
    // data structure: { page, limit, total, products: [] }
    return {
        products: normalizeProductList(data?.products || []),
        total: data?.total || 0,
        page: data?.page || page,
        limit: data?.limit || limit
    };
};
