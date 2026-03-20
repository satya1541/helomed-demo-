# ABHA Milestone 1 — Complete API Documentation

> **Base Path:** `/abha`  
> **Auth:** All routes require `auth.authenticateUser` middleware (JWT Bearer token).  
> **Common Header:** Every request body includes `customerId` (string) — the Customer ID used to fetch ABHA credentials.

---

## Table of Contents

| # | Section | APIs |
|---|---------|------|
| 1 | [ABHA Creation (Registration)](#1-abha-creation-registration) | 6 endpoints |
| 2 | [Login via Aadhaar](#2-login-via-aadhaar) | 2 endpoints |
| 3 | [Login via Mobile Number](#3-login-via-mobile-number-multi-account) | 3 endpoints |
| 4 | [Login via ABHA Number](#4-login-via-abha-number) | 2 endpoints |
| 5 | [Login via ABHA Address (PHR)](#5-login-via-abha-address-phr-flow) | 4 endpoints |
| 6 | [User Profile & Card Download](#6-user-profile--card-download) | 2 endpoints |
| 7 | [UI Rules (OTP & Resend Logic)](#7-ui-rules-otp--resend-logic) | — |
| 8 | [ABDM Official Profile APIs (Reference)](#8-abdm-official-profile-apis-reference) | Reference only |

---

## 1. ABHA Creation (Registration)

Flow: Aadhaar OTP → Verify → (Optional Mobile Verify) → Get Address Suggestions → Set Address → Get User Details → Download Card

---

### 1.1 `POST /abha/generateAadhaarOtp`

**Summary:** Generate OTP on Aadhaar-registered mobile number for ABHA enrollment.

**Request Body:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `loginId` | string | ✅ | 12-digit Aadhaar number (`^[0-9]{12}$`) | `"123456789123"` |
| `customerId` | string | ✅ | Customer ID | `"2"` |

**Responses:**

| Status | Description |
|--------|-------------|
| `200` | OTP sent successfully |
| `400` | Invalid Aadhaar Number or missing parameters |
| `500` | Internal server error |

**200 Response Example:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "response received Successfully",
  "data": {
    "response": {
      "txnId": "bbb3be5a-2ca8-451f-beb6-191726070d51",
      "message": "OTP sent to Aadhaar registered mobile number ending with ******5708"
    }
  },
  "timestamp": "2026-03-07T05:18:37.612Z"
}
```

**400 Response Example:**
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Invalid Aadhaar Number.",
  "data": null,
  "timestamp": "2026-03-07T06:40:36.992Z"
}
```

---

### 1.2 `POST /abha/verifyAadharOtp`

**Summary:** Verify the Aadhaar OTP and fetch ABHA profile details.

**⚠️ Important Flow Logic:**
- If `mobileVerified` is **true** → skip to `POST /getAbhaAddressSuggestion`
- If `mobileVerified` is **false** → call `POST /generateMobileOtp` then `POST /verifyMobileOtp` first

**Request Body:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `customerId` | string | ✅ | Customer ID | `"2"` |
| `otp` | string | ✅ | OTP received on Aadhaar mobile | `"378167"` |
| `mobileNumber` | string | ✅ | Mobile number for ABHA registration (Aadhaar-linked recommended) | `"9556745708"` |

**Responses:**

| Status | Description |
|--------|-------------|
| `200` | OTP verified, ABHA profile fetched |
| `422` | OTP validation failed |
| `400` | Bad request or invalid input |
| `500` | Internal server error |

**200 Response Example:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Response received successfully",
  "data": {
    "message": "This account already exist",
    "txnId": "2d32709e-131d-4108-8dd9-3085b21da701",
    "tokens": {
      "token": "JWT_ACCESS_TOKEN",
      "expiresIn": 1800,
      "refreshToken": "JWT_REFRESH_TOKEN",
      "refreshExpiresIn": 1296000
    },
    "ABHAProfile": {
      "preferredAddress": "sahoo424_249@sbx",
      "firstName": "Deepak",
      "middleName": "Kumar",
      "lastName": "Sahoo",
      "dob": "24-04-2002",
      "gender": "M",
      "photo": "BASE64_ENCODED_IMAGE",
      "mobile": "9556745708",
      "mobileVerified": true,
      "email": null,
      "phrAddress": ["sahoo424_249@sbx", "sahoo424_24@sbx", "sahoo_04244@sbx"],
      "address": "Kissan Nagar, Satya Vihar, Rasulgarh, Bhubaneswar, Khorda, Odisha",
      "districtCode": "362",
      "stateCode": "21",
      "pinCode": "751010",
      "abhaType": "STANDARD",
      "stateName": "ODISHA",
      "districtName": "KHORDHA",
      "communicationMobile": null,
      "ABHANumber": "91-3616-8374-7832",
      "abhaStatus": "ACTIVE"
    },
    "isNew": false
  },
  "timestamp": "2026-03-07T07:14:11.608Z"
}
```

**422 Response Example:**
```json
{
  "statusCode": 422,
  "success": false,
  "message": "UIDAI Error code : 400 : OTP validation failed",
  "data": null,
  "timestamp": "2026-03-07T07:13:17.650Z"
}
```

---

### 1.3 `POST /abha/generateMobileOtp`

**Summary:** Generate OTP on a mobile number for mobile verification (when mobile is not Aadhaar-linked).

**Request Body:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `customerId` | string | ✅ | Customer ID | `"2"` |
| `mobile` | string | ✅ | 10-digit mobile number (`^[0-9]{10}$`) | `"9556745708"` |

**Responses:**

| Status | Description |
|--------|-------------|
| `200` | Mobile OTP sent successfully |
| `400` | Missing or invalid parameters |
| `500` | Internal server error |

**200 Response Example:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "txnId": "0e84b9c5-0b73-43ae-9c63-e9666acb1081",
    "message": "OTP sent to mobile number ending with ******5708"
  },
  "timestamp": "2026-03-09T06:07:08.368Z"
}
```

---

### 1.4 `POST /abha/verifyMobileOtp`

**Summary:** Verify the OTP sent to the mobile number, linking it with the ABHA account.

**Request Body:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `customerId` | string | ✅ | Customer ID | `"2"` |
| `otp` | string | ✅ | 6-digit OTP (`^[0-9]{6}$`) | `"483921"` |

**Responses:**

| Status | Description |
|--------|-------------|
| `200` | Mobile OTP verified, number linked |
| `400` | OTP verification failed or invalid OTP |
| `500` | Internal server error |

**200 Response Example:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "txnId": "68aec623-ad6b-410b-9840-314047a65157",
    "authResult": "success",
    "message": "Mobile number is now successfully linked to your Account",
    "accounts": [
      { "ABHANumber": "91-3616-8374-7832" }
    ]
  },
  "timestamp": "2026-03-09T06:16:34.180Z"
}
```

**400 Response Example:**
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Please enter a valid OTP. Entered OTP is either expired or incorrect.",
  "data": null,
  "timestamp": "2026-03-09T06:17:28.207Z"
}
```

---

### 1.5 `POST /abha/getAbhaAddressSuggestion`

**Summary:** Get suggested ABHA addresses based on user profile during enrollment.

**Request Body:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `customerId` | string | ✅ | Customer ID | `"2"` |

**Responses:**

| Status | Description |
|--------|-------------|
| `200` | Suggestions retrieved |
| `400` | Missing or invalid parameters |
| `500` | Internal server error |

**200 Response Example:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Address suggestions retrieved successfully",
  "data": {
    "txnId": "35ce141a-7a03-4495-92bc-17e767c1b187",
    "abhaAddressList": [
      "sahoo_24242002",
      "sahoo_24200204",
      "sahoo_2002044",
      "sahoo_20020424",
      "sahoo_040424",
      "sahoo4_242002",
      "sahoo4_200224",
      "sahoo4_200204",
      "sahoo4_042002",
      "sahoo424_2002"
    ]
  },
  "timestamp": "2026-03-09T06:30:24.925Z"
}
```

---

### 1.6 `POST /abha/setAbhaAddress`

**Summary:** Set the final ABHA address (username) from suggestions or a custom value.

**Request Body:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `customerId` | string | ✅ | Customer ID | `"2"` |
| `abhaAddress` | string | ✅ | Desired ABHA address (without domain) | `"sahoo424_2002"` |

**Responses:**

| Status | Description |
|--------|-------------|
| `200` | ABHA Address set successfully |
| `400` | Already taken or not allowed |
| `500` | Internal server error |

**200 Response Example:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "ABHA Address set successfully",
  "data": {
    "txnId": "79ec5523-2265-4de5-a258-eb705c7ccbf8",
    "healthIdNumber": "91-3616-8374-7832",
    "preferredAbhaAddress": "sahoo424_2002@sbx"
  },
  "timestamp": "2026-03-09T06:58:14.547Z"
}
```

---

## 2. Login via Aadhaar

Flow: Send Aadhaar → OTP sent → Verify OTP → Get User Details → Download Card

---

### 2.1 `POST /abha/getUserByAadhar`

**Summary:** Initiate ABHA login using Aadhaar number. OTP is sent to Aadhaar-registered mobile.

**Request Body:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `customerId` | string | ✅ | Customer ID | `"2"` |
| `aadharNumber` | string | ✅ | 12-digit Aadhaar number | `"123412341234"` |

**Responses:**

| Status | Description |
|--------|-------------|
| `200` | OTP sent to Aadhaar-registered mobile |
| `400` | Invalid Aadhaar or loginId |
| `500` | Internal server error |

**200 Response Example:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "ABHA login OTP sent successfully",
  "data": {
    "txnId": "4667ea9f-dd2d-4eb8-adfc-7c00f77426fa",
    "message": "OTP sent to Aadhaar registered mobile number ending with ******5708"
  },
  "timestamp": "2026-03-09T09:42:18.156Z"
}
```

**400 Response Example:**
```json
{
  "statusCode": 400,
  "success": false,
  "message": "ABHA API Error",
  "data": {
    "loginId": "Invalid LoginId",
    "timestamp": "2026-03-09 15:12:34"
  },
  "timestamp": "2026-03-09T09:42:34.698Z"
}
```

---

### 2.2 `POST /abha/verifyGetByAadhar`

**Summary:** Verify Aadhaar login OTP. Returns auth tokens and ABHA account details.

**Request Body:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `customerId` | string | ✅ | Customer ID | `"2"` |
| `otpValue` | string | ✅ | OTP received on Aadhaar mobile | `"123456"` |

**Responses:**

| Status | Description |
|--------|-------------|
| `200` | OTP verification response (check `authResult`) |
| `400` | Missing parameters |
| `500` | Internal server error |

**200 Response — Success:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "API response received successfully",
  "data": {
    "txnId": "4db25396-93fa-4ffc-9585-88cbab533abd",
    "authResult": "success",
    "message": "OTP verified successfully",
    "token": "eyJhbGciOiJSUzUxMiJ9...",
    "expiresIn": 1800,
    "refreshToken": "eyJhbGciOiJSUzUxMiJ9...",
    "refreshExpiresIn": 1296000,
    "accounts": [
      {
        "ABHANumber": "91-3616-8374-7832",
        "preferredAbhaAddress": "sahoo424_04@sbx",
        "name": "Deepak Kumar Sahoo",
        "status": "ACTIVE",
        "mobileVerified": false
      }
    ]
  },
  "timestamp": "2026-03-09T09:49:13.035Z"
}
```

**200 Response — OTP Failed:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "API response received successfully",
  "data": {
    "txnId": "4db25396-93fa-4ffc-9585-88cbab533abd",
    "authResult": "failed",
    "message": "Please enter a valid OTP. Entered OTP is either expired or incorrect.",
    "accounts": []
  },
  "timestamp": "2026-03-09T09:48:48.450Z"
}
```

---

## 3. Login via Mobile Number (Multi-Account)

Flow: Send Mobile → OTP sent → Verify OTP → **Show Account List** → User selects account → Verify User → Get Details → Download Card

---

### 3.1 `POST /abha/getUserByNumber`

**Summary:** Send OTP to mobile number registered with ABHA for login.

**Request Body:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `customerId` | string | ✅ | Customer ID | `"2"` |
| `phone` | string | ✅ | ABHA-registered mobile number | `"9876545708"` |

**Responses:**

| Status | Description |
|--------|-------------|
| `200` | OTP sent successfully |
| `404` | Mobile number not registered with ABHA |
| `400` | Missing required parameters |
| `500` | Internal server error |

**200 Response Example:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "ABHA login OTP sent successfully",
  "data": {
    "txnId": "31baf5c1-853e-47f1-bc40-bb049d0ff37c",
    "message": "OTP sent to mobile number ending with ******5708"
  },
  "timestamp": "2026-03-09T10:08:06.699Z"
}
```

**404 Response Example:**
```json
{
  "statusCode": 404,
  "success": false,
  "message": "This mobile number is not registered with ABHA.",
  "data": null,
  "timestamp": "2026-03-09T10:08:25.250Z"
}
```

---

### 3.2 `POST /abha/verifyGetByNumber`

**Summary:** Verify mobile login OTP. Returns all ABHA accounts linked to that mobile number.

**⚠️ UI must show an "Account List" from the `accounts` array for user selection.**

**Request Body:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `customerId` | string | ✅ | Customer ID | `"2"` |
| `otp` | string | ✅ | OTP received on mobile | `"123456"` |

**Responses:**

| Status | Description |
|--------|-------------|
| `200` | OTP verified, accounts list returned |
| `400` | Invalid or expired OTP |
| `500` | Internal server error |

**200 Response Example:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "API response received successfully",
  "data": {
    "txnId": "451b5778-7257-49c1-a49c-223ae4cff605",
    "authResult": "success",
    "message": "OTP verified successfully",
    "token": "eyJhbGciOiJSUzUxMiJ9...",
    "expiresIn": 300,
    "accounts": [
      {
        "ABHANumber": "91-3616-8374-7832",
        "preferredAbhaAddress": "sahoo424_04@sbx",
        "name": "Deepak Kumar Sahoo",
        "gender": "M",
        "dob": "24-04-2002",
        "verifiedStatus": "VERIFIED",
        "verificationType": "AADHAAR",
        "status": "ACTIVE",
        "kycVerified": true,
        "mobileVerified": true
      }
    ]
  },
  "timestamp": "2026-03-09T10:13:01.452Z"
}
```

**400 Response Example:**
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Please enter a valid OTP. Entered OTP is either expired or incorrect.",
  "data": {
    "txnId": "451b5778-7257-49c1-a49c-223ae4cff605",
    "authResult": "failed",
    "message": "Please enter a valid OTP. Entered OTP is either expired or incorrect.",
    "accounts": []
  },
  "timestamp": "2026-03-09T10:13:01.452Z"
}
```

---

### 3.3 `POST /abha/verifyGetByNumberUser`

**Summary:** Verify user account using the selected ABHA Number. Returns user data token and refresh token.

**⚠️ This API can be called only once per login transaction.**

**Request Body:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `customerId` | string | ✅ | Customer ID | `"2"` |
| `abhaNumber` | string | ✅ | Selected ABHA Number from accounts list | `"91-3455-0140-3728"` |

**Responses:**

| Status | Description |
|--------|-------------|
| `200` | User verified, tokens generated |
| `401` | Invalid ABHA number or session expired |
| `400` | Missing required parameters |
| `500` | Internal server error |

**200 Response Example:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "API response received successfully",
  "data": {
    "token": "eyJhbGciOiJSUzUxMiJ9...",
    "expiresIn": 1800,
    "refreshToken": "eyJhbGciOiJSUzUxMiJ9...",
    "refreshExpiresIn": 1296000
  },
  "timestamp": "2026-03-09T10:37:57.258Z"
}
```

**401 Response Example:**
```json
{
  "statusCode": 401,
  "success": false,
  "message": "Invalid ABHA number for this account or Session Expired.",
  "data": null,
  "timestamp": "2026-03-09T10:37:03.268Z"
}
```

---

## 4. Login via ABHA Number

Flow: Send ABHA Number → OTP sent → Verify OTP → Get User Details → Download Card

---

### 4.1 `POST /abha/getAbhaUserByAbhaNumber`

**Summary:** Send OTP using ABHA Number with configurable scope and OTP system.

**Request Body:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `customerId` | string | ✅ | Customer ID | `"2"` |
| `loginId` | string | ✅ | ABHA Number | `"91-3455-0140-3728"` |
| `scopeType` | string | ✅ | Enum: `mobile-verify`, `aadhaar-verify` | `"mobile-verify"` |
| `otpSystem` | string | ✅ | Enum: `abdm`, `aadhaar` | `"abdm"` |

**Responses:**

| Status | Description |
|--------|-------------|
| `200` | OTP sent to linked mobile |
| `404` | Invalid ABHA Number |
| `400` | Invalid request parameters |
| `500` | Internal server error |

**200 Response Example:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "API response received successfully",
  "data": {
    "txnId": "7ab2b389-f226-457a-ba8b-b7cdf4450644",
    "message": "OTP sent to mobile number ending with ******5708"
  },
  "timestamp": "2026-03-09T11:32:47.497Z"
}
```

**404 Response Example:**
```json
{
  "statusCode": 404,
  "success": false,
  "message": "Invalid ABHA number. Please verify and try again.",
  "data": null,
  "timestamp": "2026-03-09T11:33:05.425Z"
}
```

---

### 4.2 `POST /abha/verifyGetByAbhaNumber`

**Summary:** Verify OTP for ABHA Number login. Returns auth tokens and account details.

**Request Body:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `customerId` | string | ✅ | Customer ID | `"2"` |
| `otp` | string | ✅ | OTP received on mobile | `"866076"` |
| `scopeType` | string | ✅ | Enum: `mobile-verify`, `aadhaar-verify` | `"mobile-verify"` |

**Responses:**

| Status | Description |
|--------|-------------|
| `200` | OTP verification response (check `authResult`) |
| `400` | Invalid request parameters |
| `500` | Internal server error |

**200 Response — Success:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "API response received successfully",
  "data": {
    "txnId": "85bb2299-2697-46ac-aa26-f85a4c553cf9",
    "authResult": "success",
    "message": "OTP verified successfully",
    "token": "eyJhbGciOiJSUzUxMiJ9...",
    "expiresIn": 1800,
    "refreshToken": "eyJhbGciOiJSUzUxMiJ9...",
    "refreshExpiresIn": 1296000,
    "accounts": [
      {
        "ABHANumber": "91-3455-0140-3728",
        "preferredAbhaAddress": "happy.happy01@sbx",
        "name": "Happy Swain",
        "status": "ACTIVE",
        "mobileVerified": false
      }
    ]
  },
  "timestamp": "2026-03-09T11:42:09.684Z"
}
```

**200 Response — OTP Failed:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "API response received successfully",
  "data": {
    "txnId": "85bb2299-2697-46ac-aa26-f85a4c553cf9",
    "authResult": "failed",
    "message": "OTP expired, please try again",
    "accounts": []
  },
  "timestamp": "2026-03-09T11:42:25.284Z"
}
```

---

## 5. Login via ABHA Address (PHR Flow)

Flow: Send ABHA Address → OTP sent → Verify OTP → Fetch PHR Profile → Download PHR Card

---

### 5.1 `POST /abha/getAbhaUserByAbhaAddress`

**Summary:** Send OTP to mobile linked with a given ABHA Address.

**Request Body:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `customerId` | string | ✅ | Customer ID | `"2"` |
| `abhaAddress` | string | ✅ | Full ABHA Address (with domain) | `"sahoo424_249@sbx"` |
| `scopeType` | string | ✅ | Enum: `mobile-verify`, `aadhaar-verify` | `"mobile-verify"` |
| `otpSystem` | string | ✅ | Enum: `abdm`, `aadhaar` | `"abdm"` |

**Responses:**

| Status | Description |
|--------|-------------|
| `200` | OTP sent successfully |
| `400` | Invalid ABHA Address / Multiple OTP attempts exceeded |
| `500` | Internal server error |

**200 Response Example:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "API response received successfully",
  "data": "OTP is sent to Mobile number ending with ******5708",
  "timestamp": "2026-03-10T05:06:00.453Z"
}
```

**400 Response — Invalid Address:**
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Invalid ABHA address. Please check and try again.",
  "data": {
    "code": "ABDM-9999",
    "message": "User not found"
  },
  "timestamp": "2026-03-10T05:06:33.343Z"
}
```

**400 Response — Rate Limited:**
```json
{
  "statusCode": 400,
  "success": false,
  "message": "You have requested multiple OTPs Or Exceeded maximum number of attempts for OTP match in this transaction. Please try again in 30 minutes.",
  "data": {
    "code": "ABDM-1100",
    "message": "You have requested multiple OTPs Or Exceeded maximum number of attempts for OTP match in this transaction. Please try again in 30 minutes."
  },
  "timestamp": "2026-03-10T05:20:37.531Z"
}
```

---

### 5.2 `POST /abha/verifyGetByAbhaAddress`

**Summary:** Verify OTP for ABHA Address login. Returns user tokens.

**Request Body:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `customerId` | string | ✅ | Customer ID | `"2"` |
| `otp` | string | ✅ | OTP received on mobile | `"417606"` |
| `scopeType` | string | ✅ | Enum: `mobile-verify`, `aadhaar-verify` | `"aadhaar-verify"` |

**Responses:**

| Status | Description |
|--------|-------------|
| `200` | OTP verified, tokens returned |
| `400` | Invalid or expired OTP |
| `500` | Internal server error |

**200 Response Example:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "API response received successfully",
  "data": {
    "txnId": "fbbf3f1b-12c4-4e6e-bc41-xxxxx",
    "authResult": "success",
    "message": "OTP verified successfully",
    "tokens": {
      "token": "eyJhbGciOiJSUzUxMiJ9...",
      "expiresIn": 1800
    }
  },
  "timestamp": "2026-03-10T05:17:10.601Z"
}
```

**400 Response Example:**
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Invalid or Expired OTP. Please try again.",
  "data": {
    "code": "ABDM-9999",
    "message": "Transaction is not found for UUID."
  },
  "timestamp": "2026-03-10T05:17:17.601Z"
}
```

---

### 5.3 `POST /abha/abhaAddressUserDetails`

**Summary:** Fetch ABHA user profile via ABHA Address (PHR) session and sync to local database.

**Request Body:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `customerId` | string | ✅ | Customer ID | `"2"` |

**Responses:**

| Status | Description |
|--------|-------------|
| `200` | Profile fetched and synced |
| `400` | Missing or invalid parameters |
| `401` | Invalid or expired session tokens |
| `500` | Internal server error |

**200 Response Example:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "ABHA Address Profile synced successfully",
  "data": {
    "customer_id": "2",
    "abha_number": "91-3455-0140-3728",
    "abha_address": "happy.happy01@sbx",
    "mobile": "9556745708",
    "first_name": "Happy",
    "middle_name": null,
    "last_name": "Swain",
    "full_name": "Happy Swain",
    "gender": "M",
    "year_of_birth": "1996",
    "month_of_birth": "04",
    "day_of_birth": "12",
    "pincode": "751001",
    "address": "Bhubaneswar",
    "state_name": "Odisha",
    "district_name": "Khordha",
    "profile_photo": null,
    "kyc_verified": true,
    "verification_status": "VERIFIED",
    "abha_status": "ACTIVE",
    "abha_created_at": "1996-04-12"
  },
  "timestamp": "2026-03-10T06:10:10.453Z"
}
```

---

### 5.4 `POST /abha/getPhrAbhaCard`

**Summary:** Download ABHA PHR card as Base64 image and store in local database.

**Request Body:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `customerId` | string | ✅ | Customer ID | `"2"` |

**Responses:**

| Status | Description |
|--------|-------------|
| `200` | Card downloaded and saved |
| `400` | Missing customerId or session tokens |
| `401` | Unauthorized or expired ABHA session |
| `500` | Internal server error |

**200 Response Example:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "ABHA card downloaded and saved successfully",
  "data": {
    "base64Card": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  },
  "timestamp": "2026-03-10T07:10:22.453Z"
}
```

---

## 6. User Profile & Card Download

These APIs are shared across all login flows.

---

### 6.1 `POST /abha/getUserDetails`

**Summary:** Fetch ABHA user profile from ABDM and sync into local database.

**Request Body:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `customerId` | string | ✅ | Customer ID | `"2"` |

**Responses:**

| Status | Description |
|--------|-------------|
| `200` | User details retrieved and synced |
| `400` | Data token missing or expired |
| `500` | Internal server error |

**200 Response Example:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User details synced successfully",
  "data": {
    "ABHANumber": "91-3616-8374-7832",
    "preferredAbhaAddress": "sahoo424_04@sbx",
    "mobile": "9556745708",
    "mobileVerified": true,
    "name": "Deepak Kumar Sahoo",
    "firstName": "Deepak",
    "middleName": "Kumar",
    "lastName": "Sahoo",
    "gender": "M",
    "yearOfBirth": "2002",
    "monthOfBirth": "04",
    "dayOfBirth": "24",
    "pincode": "751010",
    "stateName": "ODISHA",
    "districtName": "KHORDHA",
    "townName": "Rasulgarh",
    "kycVerified": true,
    "verificationStatus": "VERIFIED",
    "source": "OTP",
    "status": "ACTIVE",
    "createdDate": "11-08-2025"
  },
  "timestamp": "2026-03-09T09:09:57.340Z"
}
```

---

### 6.2 `POST /abha/downloadAbhaCard`

**Summary:** Download ABHA card as Base64 encoded image and store in local database.

**Request Body:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `customerId` | string | ✅ | Customer ID | `"2"` |

**Responses:**

| Status | Description |
|--------|-------------|
| `200` | Card downloaded and saved |
| `400` | Data token missing or expired |
| `500` | Internal server error |

**200 Response Example:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "ABHA card downloaded and saved successfully",
  "data": {
    "base64Card": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  },
  "timestamp": "2026-03-09T09:17:22.723Z"
}
```

---

## 7. UI Rules (OTP & Resend Logic)

| Rule | Value |
|------|-------|
| **OTP Timer** | 60-second (1 min) countdown on every OTP screen |
| **Max Attempts** | 3 total (1 initial + 2 resends) |
| **Lockout Message** | `"Maximum attempts reached. Please try again after 30 minutes."` |
| **ABDM Rate Limit** | `ABDM-1100` error if exceeded |

---

## 8. ABDM Official Profile APIs (Reference)

These endpoints are from the official ABDM documentation and are **not yet implemented** in the backend route file. They are listed here for reference.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `v1/account/profile` | GET | Get ABHA user profile (auth token in header) |
| `v1/account/qrCode` | GET | Get QR code as byte array (auth token in header) |
| `/v2/account/email/verification/send/otp` | POST | Send email verification OTP (email in body, auth token in header) |
| `/v2/account/email/verification/verify/otp` | POST | Verify email OTP (txnId + encrypted OTP in body) |
| Update Mobile via Aadhaar OTP | — | Generate Mobile OTP → Verify → Generate Aadhaar OTP → Verify → Mobile updated |

---

## Quick Reference — All 16 Endpoints

| # | Method | Endpoint | Flow | Purpose |
|---|--------|----------|------|---------|
| 1 | POST | `/abha/generateAadhaarOtp` | Registration | Generate Aadhaar OTP |
| 2 | POST | `/abha/verifyAadharOtp` | Registration | Verify Aadhaar OTP |
| 3 | POST | `/abha/generateMobileOtp` | Registration | Generate Mobile OTP (if needed) |
| 4 | POST | `/abha/verifyMobileOtp` | Registration | Verify Mobile OTP |
| 5 | POST | `/abha/getAbhaAddressSuggestion` | Registration | Get ABHA address suggestions |
| 6 | POST | `/abha/setAbhaAddress` | Registration | Set final ABHA address |
| 7 | POST | `/abha/getUserByAadhar` | Login (Aadhaar) | Send Aadhaar login OTP |
| 8 | POST | `/abha/verifyGetByAadhar` | Login (Aadhaar) | Verify Aadhaar login OTP |
| 9 | POST | `/abha/getUserByNumber` | Login (Mobile) | Send mobile login OTP |
| 10 | POST | `/abha/verifyGetByNumber` | Login (Mobile) | Verify mobile login OTP |
| 11 | POST | `/abha/verifyGetByNumberUser` | Login (Mobile) | Select account from list |
| 12 | POST | `/abha/getAbhaUserByAbhaNumber` | Login (ABHA#) | Send ABHA Number login OTP |
| 13 | POST | `/abha/verifyGetByAbhaNumber` | Login (ABHA#) | Verify ABHA Number login OTP |
| 14 | POST | `/abha/getAbhaUserByAbhaAddress` | Login (PHR) | Send ABHA Address login OTP |
| 15 | POST | `/abha/verifyGetByAbhaAddress` | Login (PHR) | Verify ABHA Address login OTP |
| 16 | POST | `/abha/abhaAddressUserDetails` | Login (PHR) | Fetch PHR user profile |
| 17 | POST | `/abha/getPhrAbhaCard` | Login (PHR) | Download PHR card |
| 18 | POST | `/abha/getUserDetails` | Shared | Get ABHA user profile |
| 19 | POST | `/abha/downloadAbhaCard` | Shared | Download ABHA card |
