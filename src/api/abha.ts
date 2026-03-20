import client from './client';

const unwrapData = (payload: any) => payload?.data?.data ?? payload?.data ?? payload;

// ============================================
// 1. ABHA CREATION (REGISTRATION) - 6 APIs
// ============================================

/**
 * 1.1 Generate OTP on Aadhaar-registered mobile for ABHA enrollment
 */
export const generateAadhaarOtp = async (loginId: string, customerId: string) => {
    const response = await client.post('/abha/generateAadhaarOtp', { loginId, customerId });
    return unwrapData(response);
};

/**
 * 1.2 Verify Aadhaar OTP and fetch ABHA profile
 * mobileVerified = true → skip to getAbhaAddressSuggestion
 * mobileVerified = false → call generateMobileOtp first
 */
export const verifyAadharOtp = async (customerId: string, otp: string, mobileNumber: string) => {
    const response = await client.post('/abha/verifyAadharOtp', { customerId, otp, mobileNumber });
    return unwrapData(response);
};

/**
 * 1.3 Generate OTP on mobile number (when not Aadhaar-linked)
 */
export const generateMobileOtp = async (customerId: string, mobile: string) => {
    const response = await client.post('/abha/generateMobileOtp', { customerId, mobile });
    return unwrapData(response);
};

/**
 * 1.4 Verify mobile OTP to link mobile number with ABHA
 */
export const verifyMobileOtp = async (customerId: string, otp: string) => {
    const response = await client.post('/abha/verifyMobileOtp', { customerId, otp });
    return unwrapData(response);
};

/**
 * 1.5 Get suggested ABHA addresses
 */
export const getAbhaAddressSuggestion = async (customerId: string) => {
    const response = await client.post('/abha/getAbhaAddressSuggestion', { customerId });
    return unwrapData(response);
};

/**
 * 1.6 Set final ABHA address from suggestions
 */
export const setAbhaAddress = async (customerId: string, abhaAddress: string) => {
    const response = await client.post('/abha/setAbhaAddress', { customerId, abhaAddress });
    return unwrapData(response);
};

// ============================================
// 2. LOGIN VIA AADHAAR - 2 APIs
// ============================================

/**
 * 2.1 Initiate login via Aadhaar (sends OTP to Aadhaar mobile)
 */
export const getUserByAadhar = async (customerId: string, aadharNumber: string) => {
    const response = await client.post('/abha/getUserByAadhar', { customerId, aadharNumber });
    return unwrapData(response);
};

/**
 * 2.2 Verify Aadhaar login OTP
 */
export const verifyGetByAadhar = async (customerId: string, otpValue: string) => {
    const response = await client.post('/abha/verifyGetByAadhar', { customerId, otpValue });
    return unwrapData(response);
};

// ============================================
// 3. LOGIN VIA MOBILE (MULTI-ACCOUNT) - 3 APIs
// ============================================

/**
 * 3.1 Send OTP to mobile for login
 */
export const getUserByNumber = async (customerId: string, phone: string) => {
    const response = await client.post('/abha/getUserByNumber', { customerId, phone });
    return unwrapData(response);
};

/**
 * 3.2 Verify mobile OTP - returns list of linked accounts
 * UI must show account selection
 */
export const verifyGetByNumber = async (customerId: string, otp: string) => {
    const response = await client.post('/abha/verifyGetByNumber', { customerId, otp });
    return unwrapData(response);
};

/**
 * 3.3 Verify selected ABHA account from list
 * Call ONLY ONCE per login transaction
 */
export const verifyGetByNumberUser = async (customerId: string, abhaNumber: string) => {
    const response = await client.post('/abha/verifyGetByNumberUser', { customerId, abhaNumber });
    return unwrapData(response);
};

// ============================================
// 4. LOGIN VIA ABHA NUMBER - 2 APIs
// ============================================

/**
 * 4.1 Send OTP using ABHA Number
 */
export const getAbhaUserByAbhaNumber = async (
    customerId: string,
    loginId: string,
    scopeType: 'mobile-verify' | 'aadhaar-verify',
    otpSystem: 'abdm' | 'aadhaar'
) => {
    const response = await client.post('/abha/getAbhaUserByAbhaNumber', { customerId, loginId, scopeType, otpSystem });
    return unwrapData(response);
};

/**
 * 4.2 Verify ABHA Number login OTP
 */
export const verifyGetByAbhaNumber = async (
    customerId: string,
    otp: string,
    scopeType: 'mobile-verify' | 'aadhaar-verify'
) => {
    const response = await client.post('/abha/verifyGetByAbhaNumber', { customerId, otp, scopeType });
    return unwrapData(response);
};

// ============================================
// 5. LOGIN VIA ABHA ADDRESS (PHR FLOW) - 4 APIs
// ============================================

/**
 * 5.1 Send OTP to mobile linked with ABHA Address
 */
export const getAbhaUserByAbhaAddress = async (
    customerId: string,
    abhaAddress: string,
    scopeType: 'mobile-verify' | 'aadhaar-verify',
    otpSystem: 'abdm' | 'aadhaar'
) => {
    const response = await client.post('/abha/getAbhaUserByAbhaAddress', { customerId, abhaAddress, scopeType, otpSystem });
    return unwrapData(response);
};

/**
 * 5.2 Verify ABHA Address login OTP
 */
export const verifyGetByAbhaAddress = async (
    customerId: string,
    otp: string,
    scopeType: 'mobile-verify' | 'aadhaar-verify'
) => {
    const response = await client.post('/abha/verifyGetByAbhaAddress', { customerId, otp, scopeType });
    return unwrapData(response);
};

/**
 * 5.3 Fetch and sync ABHA user profile via PHR session
 */
export const abhaAddressUserDetails = async (customerId: string) => {
    const response = await client.post('/abha/abhaAddressUserDetails', { customerId });
    return unwrapData(response);
};

/**
 * 5.4 Download PHR ABHA card as Base64
 */
export const getPhrAbhaCard = async (customerId: string) => {
    const response = await client.post('/abha/getPhrAbhaCard', { customerId });
    return unwrapData(response);
};

// ============================================
// 6. USER PROFILE & CARD DOWNLOAD - 2 APIs
// ============================================

/**
 * 6.1 Fetch ABHA user profile and sync to local DB
 * Used after all login methods except PHR flow
 */
export const getUserDetails = async (customerId: string) => {
    const response = await client.post('/abha/getUserDetails', { customerId });
    return unwrapData(response);
};

/**
 * 6.2 Download ABHA card as Base64 and store locally
 * Used after all login methods except PHR flow
 */
export const downloadAbhaCard = async (customerId: string) => {
    const response = await client.post('/abha/downloadAbhaCard', { customerId });
    return unwrapData(response);
};

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface AbhaProfile {
    ABHANumber: string;
    preferredAbhaAddress?: string;
    name: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    gender: string;
    dateOfBirth?: string;
    yearOfBirth?: string;
    dayOfBirth?: string;
    monthOfBirth?: string;
    email?: string;
    mobile: string;
    stateCode?: string;
    districtCode?: string;
    townCode?: string;
    pincode?: string;
    address?: string;
    profilePhoto?: string;
    mobileVerified?: boolean;
    emailVerified?: boolean;
    kycVerified?: boolean;
    authMethods?: string[];
    phrAddress?: string[];
    stateName?: string;
    districtName?: string;
    subdistrictName?: string;
    townName?: string;
    verificationStatus?: string;
    verificationType?: string;
    source?: string;
    createdDate?: string;
}

export interface AbhaAccount {
    ABHANumber: string;
    preferredAbhaAddress?: string;
    name: string;
    status: string;
    profilePhoto?: string;
    mobileVerified?: boolean;
    dayOfBirth?: string;
    monthOfBirth?: string;
    yearOfBirth?: string;
    districtName?: string;
    stateName?: string;
}

export interface OtpResponse {
    txnId?: string;
    message?: string;
    mobileNumber?: string;
}

export interface VerifyOtpResponse {
    txnId?: string;
    authResult?: string;
    message?: string;
    token?: string;
    refreshToken?: string;
    expiresIn?: number;
    refreshExpiresIn?: number;
    accounts?: AbhaAccount[];
}
