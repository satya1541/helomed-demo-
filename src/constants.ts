export const CATEGORY = {
    ALLOPATHIC: 1,
    AYURVEDIC: 2,
    HOMEOPATHIC: 3,
};

export const CATEGORY_LABELS: Record<number, string> = {
    [CATEGORY.ALLOPATHIC]: 'Allopathic',
    [CATEGORY.AYURVEDIC]: 'Ayurvedic',
    [CATEGORY.HOMEOPATHIC]: 'Homeopathic',
};

export const PRODUCT_CATEGORY = {
    MEDICINE_SUPPLEMENTS: 1,
    MEDICAL_DEVICE: 2,
    PERSONAL_CARE: 3,
    FOOD_NUTRITION: 4,
    BABY_PERSONAL_HYGIENE: 5,
    OTHER: 6
};

export const PRODUCT_CATEGORY_LABELS: Record<number, string> = {
    [PRODUCT_CATEGORY.MEDICINE_SUPPLEMENTS]: 'Medicine & Supplements',
    [PRODUCT_CATEGORY.MEDICAL_DEVICE]: 'Medical Device',
    [PRODUCT_CATEGORY.PERSONAL_CARE]: 'Personal Care',
    [PRODUCT_CATEGORY.FOOD_NUTRITION]: 'Food & Nutrition',
    [PRODUCT_CATEGORY.BABY_PERSONAL_HYGIENE]: 'Baby Personal Hygiene',
    [PRODUCT_CATEGORY.OTHER]: 'Other'
};

export const DOSAGE_FORM = {
    SOLID: 1,
    SEMISOLID: 2,
    LIQUID: 3
};

export const DOSAGE_FORM_LABELS: Record<number, string> = {
    [DOSAGE_FORM.SOLID]: 'Solid',
    [DOSAGE_FORM.SEMISOLID]: 'Semisolid',
    [DOSAGE_FORM.LIQUID]: 'Liquid'
};

export const AGE_GROUP = {
    CHILD: 1,
    ADULT: 2,
    SENIOR: 3,
    ALL: 4,
};

export const AGE_GROUP_LABELS: Record<number, string> = {
    [AGE_GROUP.CHILD]: 'Child',
    [AGE_GROUP.ADULT]: 'Adult',
    [AGE_GROUP.SENIOR]: 'Senior',
    [AGE_GROUP.ALL]: 'All'
};

export const ORDER_STATUS = {
    PENDING: 0,
    PLACED: 1,
    ACCEPTED: 2,
    REJECTED: 3,
    PREPARING: 4,
    READY_FOR_PICKUP: 5,
    OUT_FOR_DELIVERY: 6,
    DELIVERED: 7,
    CANCELLED: 8,
};

export const ORDER_STATUS_LABELS: Record<number, string> = {
    [ORDER_STATUS.PENDING]: 'Pending',
    [ORDER_STATUS.PLACED]: 'Placed',
    [ORDER_STATUS.ACCEPTED]: 'Accepted',
    [ORDER_STATUS.REJECTED]: 'Rejected',
    [ORDER_STATUS.PREPARING]: 'Preparing',
    [ORDER_STATUS.READY_FOR_PICKUP]: 'Ready for Pickup',
    [ORDER_STATUS.OUT_FOR_DELIVERY]: 'Out for Delivery',
    [ORDER_STATUS.DELIVERED]: 'Delivered',
    [ORDER_STATUS.CANCELLED]: 'Cancelled'
};

export const SHOP_TYPE = {
    ALLOPATHIC: 1,
    AYURVEDIC: 2,
    HOMEOPATHIC: 3,
    HYBRID: 4,
};

export const SHOP_TYPE_LABELS: Record<number, string> = {
    [SHOP_TYPE.ALLOPATHIC]: 'Allopathic',
    [SHOP_TYPE.AYURVEDIC]: 'Ayurvedic',
    [SHOP_TYPE.HOMEOPATHIC]: 'Homeopathic',
    [SHOP_TYPE.HYBRID]: 'Hybrid'
};

export const PAYMENT_STATUS = {
    PENDING: 1,
    PAID: 2,
    FAILED: 3,
    REFUNDED: 4,
};

export const PAYMENT_STATUS_LABELS: Record<number, string> = {
    [PAYMENT_STATUS.PENDING]: 'Pending',
    [PAYMENT_STATUS.PAID]: 'Paid',
    [PAYMENT_STATUS.FAILED]: 'Failed',
    [PAYMENT_STATUS.REFUNDED]: 'Refunded'
};

export const PAYMENT_MODE = {
    PAY_ON_DELIVERY: 1,  // Payment at delivery time
    PAY_ONLINE: 2,       // Payment before delivery (pre-payment)
};

export const PAYMENT_MODE_LABELS: Record<number, string> = {
    [PAYMENT_MODE.PAY_ON_DELIVERY]: 'Pay on Delivery',
    [PAYMENT_MODE.PAY_ONLINE]: 'Pay Online'
};

export const PAYMENT_METHOD = {
    COD: 1,        // Cash on Delivery
    ONLINE_QR: 2,  // Online payment via QR code at delivery
};

export const PAYMENT_METHOD_LABELS: Record<number, string> = {
    [PAYMENT_METHOD.COD]: 'Cash on Delivery',
    [PAYMENT_METHOD.ONLINE_QR]: 'Online QR'
};

export const PAYOUT_STATUS = {
    PENDING: 1,
    PROCESSING: 2,
    COMPLETED: 3,
    REJECTED: 4,
};

export const PAYOUT_STATUS_LABELS: Record<number, string> = {
    [PAYOUT_STATUS.PENDING]: 'Pending',
    [PAYOUT_STATUS.PROCESSING]: 'Processing',
    [PAYOUT_STATUS.COMPLETED]: 'Completed',
    [PAYOUT_STATUS.REJECTED]: 'Rejected'
};
// Fix PAYOUT_STATUS_LABELS keys usage
