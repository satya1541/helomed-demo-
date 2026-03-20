# HeloMed Backend - API Documentation

> **Version:** 1.0.0  
> **Base URL:** `http://localhost:{PORT}`  
> **Swagger Docs:** `/api-docs`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Response Format](#response-format)
3. [Error Codes](#error-codes)
4. [Enums & Constants](#enums--constants)
5. [API Endpoints](#api-endpoints)
   - [Retailer APIs](#1-retailer-apis)
   - [User APIs](#2-user-apis)
   - [User Address APIs](#3-user-address-apis)
   - [User Cart APIs](#4-user-cart-apis)
   - [User Search APIs](#5-user-search-apis)
   - [Order APIs](#6-order-apis)
   - [Retailer Order APIs](#7-retailer-order-apis)
   - [Retailer Product APIs](#8-retailer-product-apis)
   - [Master Product APIs](#9-master-product-apis)
   - [Product Categories APIs](#10-product-categories-apis)
   - [Delivery Partner APIs](#11-delivery-partner-apis)
   - [Retailer Payment APIs](#12-retailer-payment-apis)
   - [13. Upload APIs](#13-upload-apis)
   - [14. ABHA APIs](#14-abha-apis)
   - [15. Wishlist APIs](#15-wishlist-apis)
   - [16. Test APIs](#16-test-apis)
   - [17. WebSocket Events](#websocket-events)

---

## Authentication

All protected routes require a **Bearer Token** in the Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

### Token Generation
- Tokens are generated upon successful OTP verification
- Token validity: **7 days**
- Token payload contains: `id`, `role_type`, `phone`

### Role Types
| Role | Value | Description |
|------|-------|-------------|
| ADMIN | 1 | Super Admin (internal team) |
| RETAILER | 2 | Medicine shop owner |
| USER | 3 | Customer / App user |
| DELIVERY_BOY | 4 | Delivery partner |

---

## Response Format

### Success Response
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2026-02-09T10:30:00.000Z"
}
```

### Error Response
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Error message here",
  "errors": []
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

---

## Enums & Constants

### Order Status
| Status | Value | Description |
|--------|-------|-------------|
| PLACED | 1 | Order placed by user |
| ACCEPTED | 2 | Accepted by retailer |
| REJECTED | 3 | Rejected by retailer |
| PREPARING | 4 | Being prepared |
| READY_FOR_PICKUP | 5 | Ready for delivery partner |
| OUT_FOR_DELIVERY | 6 | Out for delivery |
| DELIVERED | 7 | Successfully delivered |
| CANCELLED | 8 | Cancelled |

### Payment Status
| Status | Value |
|--------|-------|
| PENDING | 1 |
| PAID | 2 |
| FAILED | 3 |
| REFUNDED | 4 |

### Payment Mode
| Mode | Value | Description |
|------|-------|-------------|
| PAY_ON_DELIVERY | 1 | Payment at delivery time |
| PAY_ONLINE | 2 | Pre-payment before delivery |

### Payment Method (for PAY_ON_DELIVERY)
| Method | Value | Description |
|--------|-------|-------------|
| COD | 1 | Cash on Delivery (adds cash handling fee) |
| ONLINE_QR | 2 | QR code payment at delivery (no fee) |

### Category
| Category | Value |
|----------|-------|
| ALLOPATHIC | 1 |
| AYURVEDIC | 2 |
| HOMEOPATHIC | 3 |

### Product Category
| Category | Value |
|----------|-------|
| MEDICINE_SUPPLEMENTS | 1 |
| MEDICAL_DEVICE | 2 |
| PERSONAL_CARE | 3 |
| FOOD_NUTRITION | 4 |
| BABY_PERSONAL_HYGIENE | 5 |
| OTHER | 6 |

### Dosage Form
| Form | Value |
|------|-------|
| SOLID | 1 |
| SEMISOLID | 2 |
| LIQUID | 3 |

### Age Group
| Group | Value |
|-------|-------|
| CHILD | 1 |
| ADULT | 2 |
| SENIOR | 3 |
| ALL | 4 |

### Payout Status
| Status | Value |
|--------|-------|
| PENDING | 1 |
| PROCESSING | 2 |
| COMPLETED | 3 |
| REJECTED | 4 |

---

## API Endpoints

---

## 1. Retailer APIs

**Base Path:** `/retailer`

### 1.1 Signup (Registration)
Register a new retailer with documents.

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /retailer/signup` |
| **Auth** | ❌ None |
| **Content-Type** | `multipart/form-data` |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| phone | string | ✅ | Mobile number (10 digits) |
| shop_name | string | ❌ | Name of the shop |
| owner_name | string | ❌ | Owner's name |
| email | string | ❌ | Email address |
| full_address | string | ❌ | Complete address |
| latitude | decimal | ❌ | GPS latitude |
| longitude | decimal | ❌ | GPS longitude |
| pincode | string | ❌ | Postal code |
| house_number | string | ❌ | House/building number |
| landmark | string | ❌ | Nearby landmark |
| license_number | string | ❌ | Drug license number |
| gst_number | string | ❌ | GST number |
| shop_photo | file | ❌ | Shop image |
| license_photo | file | ❌ | Drug license image |
| aadhaar_photo | file | ❌ | Aadhaar card image |
| pan_photo | file | ❌ | PAN card image |
| owner_photo | file | ❌ | Owner's photo |

**Response:**
```json
{
  "success": true,
  "message": "Signup successful",
  "already_registered": false,
  "data": {
    "id": 1,
    "phone": "9876543210"
  }
}
```

---

### 1.2 Send OTP
Send OTP to retailer's mobile number.

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /retailer/send-otp` |
| **Auth** | ❌ None |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "phone": "9876543210"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "otp": "123456",
    "otp_expiry": "2026-02-09T10:35:00.000Z"
  }
}
```

---

### 1.3 Verify OTP
Verify OTP and login retailer.

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /retailer/verify-otp` |
| **Auth** | ❌ None |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "phone": "9876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "retailer": {
      "id": 1,
      "phone": "9876543210",
      "shop_name": "ABC Medical",
      "is_profile_complete": true,
      "is_approved": true
    }
  }
}
```

---

### 1.4 Get Profile
Fetch retailer profile details.

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /retailer/profile` |
| **Auth** | ✅ Bearer Token (Retailer) |

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "id": 1,
    "phone": "9876543210",
    "shop_name": "ABC Medical",
    "owner_name": "John Doe",
    "email": "john@example.com",
    "full_address": "123 Main St",
    "latitude": "28.7041000",
    "longitude": "77.1025000",
    "pincode": "110001",
    "shop_photo": "retailers/1234567890_shop.jpg",
    "license_photo": "retailers/1234567890_license.jpg",
    "is_online": true,
    "is_approved": true,
    "is_profile_complete": true
  }
}
```

---

### 1.5 Update Profile
Update retailer profile information.

| Property | Value |
|----------|-------|
| **Endpoint** | `PUT /retailer/update-profile` |
| **Auth** | ✅ Bearer Token (Retailer) |
| **Content-Type** | `multipart/form-data` |

**Request Body:**
| Field | Type | Required |
|-------|------|----------|
| shop_name | string | ❌ |
| owner_name | string | ❌ |
| email | string | ❌ |
| full_address | string | ❌ |
| latitude | decimal | ❌ |
| longitude | decimal | ❌ |
| opening_time | string | ❌ |
| closing_time | string | ❌ |
| shop_photo | file | ❌ |
| owner_photo | file | ❌ |

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... }
}
```

---

### 1.6 Update Location
Update retailer GPS location.

| Property | Value |
|----------|-------|
| **Endpoint** | `PUT /retailer/update-location` |
| **Auth** | ✅ Bearer Token (Retailer) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "latitude": 28.7041,
  "longitude": 77.1025,
  "full_address": "123 Main St, New Delhi",
  "pincode": "110001",
  "landmark": "Near Metro Station",
  "house_number": "B-42"
}
```

---

### 1.7 Set Online Status
Toggle retailer online/offline status.

| Property | Value |
|----------|-------|
| **Endpoint** | `PUT /retailer/set-online-status` |
| **Auth** | ✅ Bearer Token (Retailer) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "is_online": true
}
```

---

### 1.8 Update FCM Token
Update Firebase Cloud Messaging token for push notifications.

| Property | Value |
|----------|-------|
| **Endpoint** | `PUT /retailer/fcm-token` |
| **Auth** | ✅ Bearer Token |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "fcm_token": "dKjH8s9..."
}
```

---

### 1.9 Logout

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /retailer/logout` |
| **Auth** | ✅ Bearer Token (Retailer) |

---

## 2. User APIs

**Base Path:** `/user`

### 2.1 Signup

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /user/signup` |
| **Auth** | ❌ None |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "phone": "9876543210",
  "name": "John Doe"
}
```

---

### 2.2 Send OTP

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /user/send-otp` |
| **Auth** | ❌ None |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "phone": "9876543210"
}
```

---

### 2.3 Verify OTP

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /user/verify-otp` |
| **Auth** | ❌ None |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "phone": "9876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "phone": "9876543210",
      "name": "John Doe",
      "is_verified": true
    }
  }
}
```

---

### 2.4 Get Profile

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /user/profile` |
| **Auth** | ✅ Bearer Token |

---

### 2.5 Update Profile

| Property | Value |
|----------|-------|
| **Endpoint** | `PUT /user/profile` |
| **Auth** | ✅ Bearer Token |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "gender": "MALE",
  "age": 30
}
```

---

## 3. User Address APIs

**Base Path:** `/user-address`

### 3.1 Add/Update Address (Upsert)

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /user-address/address` |
| **Auth** | ✅ Bearer Token |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "address_id": null,
  "full_address": "123 Main St, New Delhi",
  "latitude": 28.7041,
  "longitude": 77.1025,
  "pincode": "110001",
  "landmark": "Near Metro Station",
  "address_type": "HOME",
  "is_default": true
}
```

> **Note:** If `address_id` is provided, it updates the existing address. Otherwise, creates a new one.

---

### 3.2 Get All Addresses

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /user-address/address` |
| **Auth** | ✅ Bearer Token |

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Addresses fetched successfully",
  "data": [
    {
      "id": 1,
      "full_address": "123 Main St",
      "latitude": "28.7041000",
      "longitude": "77.1025000",
      "pincode": "110001",
      "address_type": "HOME",
      "is_default": true
    }
  ]
}
```

---

### 3.3 Delete Address

| Property | Value |
|----------|-------|
| **Endpoint** | `DELETE /user-address/address/:id` |
| **Auth** | ✅ Bearer Token |

---

### 3.4 Update Address

| Property | Value |
|----------|-------|
| **Endpoint** | `PUT /user-address/address/:id` |
| **Auth** | ✅ Bearer Token |
| **Content-Type** | `application/json` |

---

## 4. User Cart APIs

**Base Path:** `/user-cart`

### 4.1 Add to Cart

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /user-cart/cart` |
| **Auth** | ✅ Bearer Token (User) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "retailer_product_id": 1,
  "quantity": 2
}
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Item added to cart successfully",
  "data": {
    "action": "CREATED",
    "cart_item_id": 1,
    "quantity": 2
  }
}
```

---

### 4.2 Get Cart

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /user-cart/cart` |
| **Auth** | ✅ Bearer Token (User) |

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Cart fetched successfully",
  "data": {
    "cart_id": 1,
    "items_by_retailer": {
      "1": {
        "retailer_id": 1,
        "retailer_name": "ABC Medical",
        "items": [
          {
            "cart_item_id": 1,
            "product_id": 10,
            "product_name": "Paracetamol 500mg",
            "quantity": 2,
            "price": 50.00,
            "subtotal": 100.00
          }
        ],
        "retailer_subtotal": 100.00
      }
    },
    "total_items": 2,
    "total_amount": 100.00
  }
}
```

---

### 4.3 Increment Quantity

| Property | Value |
|----------|-------|
| **Endpoint** | `PUT /user-cart/cart/item/:id/increment` |
| **Auth** | ✅ Bearer Token (User) |

---

### 4.4 Decrement Quantity

| Property | Value |
|----------|-------|
| **Endpoint** | `PUT /user-cart/cart/item/:id/decrement` |
| **Auth** | ✅ Bearer Token (User) |

> **Note:** If quantity becomes 0, item is removed from cart.

---

### 4.5 Update Cart Item Quantity

| Property | Value |
|----------|-------|
| **Endpoint** | `PUT /user-cart/cart/item/:id` |
| **Auth** | ✅ Bearer Token (User) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "quantity": 5
}
```

---

### 4.6 Remove Cart Item

| Property | Value |
|----------|-------|
| **Endpoint** | `DELETE /user-cart/cart/item/:id` |
| **Auth** | ✅ Bearer Token (User) |

---

### 4.7 Clear Entire Cart

| Property | Value |
|----------|-------|
| **Endpoint** | `DELETE /user-cart/cart` |
| **Auth** | ✅ Bearer Token (User) |

---

### 4.8 Get Cart Summary

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /user-cart/cart/summary` |
| **Auth** | ✅ Bearer Token (User) |

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| address_id | integer | ❌ | If provided, calculates distance-based delivery fee |

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Cart summary fetched successfully",
  "data": {
    "total_items": 5,
    "unique_products": 3,
    "subtotal": 500.00,
    "delivery_fee": 40.00,
    "estimated_total": 540.00,
    "breakdown_by_retailer": [
      {
        "retailer_id": 1,
        "retailer_name": "ABC Medical",
        "item_count": 3,
        "subtotal": 300.00,
        "delivery_fee": 40.00,
        "distance_km": 2.5,
        "estimated_time": "30-45 mins"
      }
    ]
  }
}
```

---

### 4.9 Get Cart Count

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /user-cart/cart/count` |
| **Auth** | ✅ Bearer Token (User) |

---

## 5. User Search APIs

**Base Path:** `/user-search`

### 5.1 Search Products

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /user-search/search` |
| **Auth** | ✅ Bearer Token |

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| q | string | ✅ | Search query |
| page | integer | ❌ | Page number (default: 1) |
| limit | integer | ❌ | Items per page (default: 10) |

---

### 5.2 Get Search Suggestions

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /user-search/search-suggestions` |
| **Auth** | ✅ Bearer Token |

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| q | string | ✅ | Search query (min 2 chars) |

---

### 5.3 Get Product Details

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /user-search/products/:id` |
| **Auth** | ❌ None |

---

### 5.4 Get Retailer Products

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /user-search/retailers/:id/products` |
| **Auth** | ❌ None |

**Query Parameters:**
| Param | Type | Required | Default |
|-------|------|----------|---------|
| page | integer | ❌ | 1 |
| limit | integer | ❌ | 10 |

---

### 5.5 Get Retailer Search Suggestions

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /user-search/retailers/:id/search-suggestions` |
| **Auth** | ❌ None |

**Query Parameters:**
| Param | Type | Required |
|-------|------|----------|
| q | string | ✅ |

---

### 5.6 Search Retailer Products

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /user-search/retailers/:id/search-products` |
| **Auth** | ❌ None |

**Query Parameters:**
| Param | Type | Required |
|-------|------|----------|
| q | string | ✅ |
| page | integer | ❌ |
| limit | integer | ❌ |

---

## 6. Order APIs

**Base Path:** `/order`

### 6.1 Get Checkout Summary

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /order/checkout/summary` |
| **Auth** | ✅ Bearer Token (User) |

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| address_id | integer | ❌ | If provided, calculates distance-based delivery fee |

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Checkout summary fetched successfully",
  "data": {
    "items_by_retailer": { ... },
    "address": { ... },
    "payment_options": {
      "modes": [
        { "id": 1, "name": "PAY_ON_DELIVERY" },
        { "id": 2, "name": "PAY_ONLINE" }
      ],
      "methods": [
        { "id": 1, "name": "COD", "has_fee": true },
        { "id": 2, "name": "ONLINE_QR", "has_fee": false }
      ]
    },
    "totals": {
      "subtotal": 500.00,
      "delivery_fee": 40.00,
      "cash_handling_fee": 0.00,
      "total": 540.00
    }
  }
}
```

---

### 6.2 Calculate Delivery Fee

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /order/calculate-delivery-fee` |
| **Auth** | ✅ Bearer Token (User) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "address_id": 1
}
```
OR
```json
{
  "latitude": 28.7041,
  "longitude": 77.1025
}
```

---

### 6.3 Checkout (Create Order)

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /order/checkout` |
| **Auth** | ✅ Bearer Token (User) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "address_id": 1,
  "payment_mode": 1,
  "payment_method": 2
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| address_id | integer | ✅ | Delivery address ID |
| payment_mode | integer | ✅ | 1=PAY_ON_DELIVERY, 2=PAY_ONLINE |
| payment_method | integer | ❌ | For PAY_ON_DELIVERY: 1=COD, 2=ONLINE_QR (default) |

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "orders": [
      {
        "order_id": 1,
        "order_number": "ORD-20260209-0001",
        "retailer_id": 1,
        "total_amount": 540.00,
        "order_status": 1,
        "payment_status": 1
      }
    ]
  }
}
```

---

### 6.4 Process Payment

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /order/:id/payment` |
| **Auth** | ✅ Bearer Token |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "payment_id": "pay_xyz123",
  "payment_signature": "sig_abc456",
  "payment_method": 2
}
```

---

### 6.5 Update Payment Status (Webhook/Admin)

| Property | Value |
|----------|-------|
| **Endpoint** | `PUT /order/:id/payment-status` |
| **Auth** | ✅ Bearer Token |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "payment_status": 2,
  "payment_id": "pay_xyz123",
  "payment_signature": "sig_abc456",
  "failure_reason": null
}
```

---

### 6.6 Get Order Tracking

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /order/:id/track` |
| **Auth** | ✅ Bearer Token |

---

### 6.7 Get Invoice

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /order/:id/invoice` |
| **Auth** | ✅ Bearer Token |

---

### 6.8 Get My Orders

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /user-order/orders` |
| **Auth** | ✅ Bearer Token |

---

### 6.9 Get Order Details

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /user-order/orders/:id` |
| **Auth** | ✅ Bearer Token |

---

### 6.10 Cancel Order

| Property | Value |
|----------|-------|
| **Endpoint** | `PUT /user-order/orders/:id/cancel` |
| **Auth** | ✅ Bearer Token |

---

## 7. Retailer Order APIs

**Base Path:** `/retailer-order`

### 7.1 Get All Orders

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /retailer-order/orders` |
| **Auth** | ✅ Bearer Token (Retailer) |

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| order_status | integer | Filter by status |
| payment_status | integer | Filter by payment status |
| page | integer | Page number |
| limit | integer | Items per page |
| from | string | Start date (YYYY-MM-DD) |
| to | string | End date (YYYY-MM-DD) |

---

### 7.2 Get Order Details

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /retailer-order/orders/:id` |
| **Auth** | ✅ Bearer Token (Retailer) |

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Order details fetched successfully",
  "data": {
    "id": 1,
    "order_number": "ORD-20260209-0001",
    "order_status": 1,
    "payment_status": 1,
    "items": [
      {
        "product_name": "Paracetamol 500mg",
        "quantity": 2,
        "price": 50.00,
        "subtotal": 100.00
      }
    ],
    "user": {
      "name": "John Doe",
      "phone": "9876543210"
    },
    "address": {
      "full_address": "123 Main St",
      "latitude": "28.7041000",
      "longitude": "77.1025000"
    },
    "totals": {
      "subtotal": 100.00,
      "delivery_fee": 40.00,
      "total_amount": 140.00
    }
  }
}
```

---

### 7.3 Update Order Status

| Property | Value |
|----------|-------|
| **Endpoint** | `PATCH /retailer-order/orders/:id/status` |
| **Auth** | ✅ Bearer Token (Retailer) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "order_status": 2,
  "rejection_reason": null
}
```

**Allowed Transitions (Retailer):**
- PLACED (1) → ACCEPTED (2) or REJECTED (3)
- ACCEPTED (2) → PREPARING (4)
- PREPARING (4) → READY_FOR_PICKUP (5)

---

## 8. Retailer Product APIs

**Base Path:** `/retailerProduct`

### 8.1 Add Product

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /retailerProduct/addProduct` |
| **Auth** | ✅ Bearer Token |
| **Content-Type** | `multipart/form-data` |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| product_name | string | ✅ | Product name |
| price | float | ✅ | Selling price |
| product_category_id | integer | ✅ | Category ID |
| stock | integer | ❌ | Stock quantity (default: 0) |
| mrp | float | ❌ | Maximum retail price |
| salt_composition | string | ❌ | Salt/composition info |
| brand_name | string | ❌ | Brand name |
| pack_size | string | ❌ | Pack size |
| description | string | ❌ | Product description |
| requires_prescription | boolean | ❌ | Prescription required |
| category | integer | ❌ | 1=Allopathic, 2=Ayurvedic, 3=Homeopathic |
| dosage_form | integer | ❌ | 1=Solid, 2=Semisolid, 3=Liquid |
| age_group | integer | ❌ | 1=Child, 2=Adult, 3=Senior, 4=All |
| discount_percentage | float | ❌ | Discount percentage |
| product_image | file | ❌ | Product image |

---

### 8.2 Add Product from Master Catalog

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /retailerProduct/addFromMaster` |
| **Auth** | ✅ Bearer Token (Retailer) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "master_product_id": 1,
  "price": 50.00,
  "mrp": 55.00,
  "stock": 100,
  "discount_percentage": 10
}
```

---

### 8.3 Bulk Upload Products

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /retailerProduct/bulk-upload` |
| **Auth** | ✅ Bearer Token |
| **Content-Type** | `multipart/form-data` |

**Request Body:**
| Field | Type | Required |
|-------|------|----------|
| file | Excel file | ✅ |

---

### 8.4 Get Product List

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /retailerProduct/products` |
| **Auth** | ✅ Bearer Token |

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| page | integer | 1 |
| limit | integer | 20 |
| product_category | string | MEDICINE_SUPPLEMENTS |

---

### 8.5 Search Products

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /retailerProduct/search` |
| **Auth** | ✅ Bearer Token |

**Query Parameters:**
| Param | Type | Required |
|-------|------|----------|
| q | string | ✅ |
| page | integer | ❌ |
| limit | integer | ❌ |

---

### 8.6 Get Single Product

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /retailerProduct/single-product` |
| **Auth** | ✅ Bearer Token |

**Query Parameters:**
| Param | Type | Required |
|-------|------|----------|
| id | integer | ✅ |

---

### 8.7 Update Product

| Property | Value |
|----------|-------|
| **Endpoint** | `PUT /retailerProduct/update/:id` |
| **Auth** | ✅ Bearer Token |
| **Content-Type** | `application/json` |

---

## 9. Master Product APIs

**Base Path:** `/master-products`

### 9.1 Add Master Product (Admin Only)

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /master-products` |
| **Auth** | ✅ Bearer Token (Admin) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "product_name": "Paracetamol 500mg",
  "brand_name": "Crocin",
  "salt_composition": "Paracetamol 500mg",
  "requires_prescription": false,
  "category": 1,
  "product_category": 1,
  "dosage_form": 1,
  "pack_size": "10 tablets",
  "age_group": 4
}
```

---

### 9.2 Bulk Upload Master Products

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /master-products/bulk-upload` |
| **Auth** | ✅ Bearer Token |
| **Content-Type** | `multipart/form-data` |

**Request Body:**
| Field | Type | Required |
|-------|------|----------|
| file | Excel/CSV file | ✅ |

---

### 9.3 Get Master Products

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /master-products` |
| **Auth** | ❌ None |

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 50 | Items per page |
| starts_with | string | - | Filter by starting letter |

---

### 9.4 Search Master Products

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /master-products/search` |
| **Auth** | ❌ None |

**Query Parameters:**
| Param | Type | Required |
|-------|------|----------|
| q | string | ✅ |
| page | integer | ❌ |
| limit | integer | ❌ |

---

### 9.5 Get Suggestions

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /master-products/suggestions` |
| **Auth** | ❌ None |

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| q | string | ✅ | Min 2 characters |
| limit | integer | ❌ | Max suggestions |

---

## 10. Product Categories APIs

**Base Path:** `/product-category`

### 10.1 Get All Categories

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /product-category` |
| **Auth** | ✅ Bearer Token |

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Categories fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "Medicine & Supplements",
      "icon_url": "category-icons/medicine.png",
      "display_order": 1,
      "is_active": true
    }
  ]
}
```

---

### 10.2 Create Category (Admin Only)

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /product-category/create` |
| **Auth** | ✅ Bearer Token (Admin) |
| **Content-Type** | `multipart/form-data` |

**Request Body:**
| Field | Type | Required |
|-------|------|----------|
| name | string | ✅ |
| display_order | integer | ❌ |
| icon | file | ❌ |

---

### 10.3 Update Category (Admin Only)

| Property | Value |
|----------|-------|
| **Endpoint** | `PUT /product-category/:id` |
| **Auth** | ✅ Bearer Token (Admin) |
| **Content-Type** | `multipart/form-data` |

---

## 11. Delivery Partner APIs

**Base Path:** `/delivery`

### 11.1 Signup

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /delivery/signup` |
| **Auth** | ❌ None |
| **Content-Type** | `multipart/form-data` |

**Request Body:**
| Field | Type | Required |
|-------|------|----------|
| phone | string | ✅ |
| name | string | ❌ |
| email | string | ❌ |
| vehicle_type | string | ❌ |
| vehicle_number | string | ❌ |
| license_number | string | ❌ |
| profile_photo | file | ❌ |
| license_photo | file | ❌ |
| aadhaar_photo | file | ❌ |
| pan_photo | file | ❌ |
| vehicle_rc_photo | file | ❌ |

---

### 11.2 Send OTP

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /delivery/send-otp` |
| **Auth** | ❌ None |

---

### 11.3 Verify OTP

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /delivery/verify-otp` |
| **Auth** | ❌ None |

---

### 11.4 Get Profile

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /delivery/profile` |
| **Auth** | ✅ Bearer Token (Delivery) |

---

### 11.5 Update Profile

| Property | Value |
|----------|-------|
| **Endpoint** | `PUT /delivery/profile` |
| **Auth** | ✅ Bearer Token (Delivery) |
| **Content-Type** | `multipart/form-data` |

---

### 11.6 Update Online Status

| Property | Value |
|----------|-------|
| **Endpoint** | `PUT /delivery/online-status` |
| **Auth** | ✅ Bearer Token (Delivery) |

**Request Body:**
```json
{
  "is_online": true
}
```

---

### 11.7 Get Assigned Orders

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /delivery/orders` |
| **Auth** | ✅ Bearer Token (Delivery) |

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| type | string | pending, assigned, in_transit, delivered, all |
| page | integer | Page number |
| limit | integer | Items per page |

---

### 11.8 Get Order Details

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /delivery/orders/:id` |
| **Auth** | ✅ Bearer Token (Delivery) |

---

### 11.9 Accept Order

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /delivery/orders/:id/accept` |
| **Auth** | ✅ Bearer Token (Delivery) |

---

### 11.10 Reject Order

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /delivery/orders/:id/reject` |
| **Auth** | ✅ Bearer Token (Delivery) |

---

### 11.11 Update Delivery Status

| Property | Value |
|----------|-------|
| **Endpoint** | `PATCH /delivery/orders/:id/status` |
| **Auth** | ✅ Bearer Token (Delivery) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "order_status": 6
}
```

**Allowed Transitions (Delivery Partner):**
- READY_FOR_PICKUP (5) → OUT_FOR_DELIVERY (6)
- OUT_FOR_DELIVERY (6) → DELIVERED (7)

---

### 11.12 Confirm Payment at Delivery

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /delivery/orders/:id/confirm-payment` |
| **Auth** | ✅ Bearer Token (Delivery) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "payment_method": 1,
  "payment_id": "pay_xyz123"
}
```

---

### 11.13 Update Location

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /delivery/location` |
| **Auth** | ✅ Bearer Token (Delivery) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "latitude": 28.7041,
  "longitude": 77.1025
}
```

---

### 11.14 Update Availability

| Property | Value |
|----------|-------|
| **Endpoint** | `PATCH /delivery/availability` |
| **Auth** | ✅ Bearer Token (Delivery) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "is_available": true
}
```

---

### 11.15 Get Order History

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /delivery/order-history` |
| **Auth** | ✅ Bearer Token (Delivery) |

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| status | string | delivered, etc. |
| page | integer | Page number |
| limit | integer | Items per page |
| start_date | string | YYYY-MM-DD |
| end_date | string | YYYY-MM-DD |

---

### 11.16 Get Earnings

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /delivery/earnings` |
| **Auth** | ✅ Bearer Token (Delivery) |

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| start_date | string | YYYY-MM-DD |
| end_date | string | YYYY-MM-DD |

---

## 12. Retailer Payment APIs

**Base Path:** `/retailer-payment`

### 12.1 Get Today's Earnings

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /retailer-payment/earnings/today` |
| **Auth** | ✅ Bearer Token (Retailer) |

---

### 12.2 Get Total Earnings

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /retailer-payment/earnings/total` |
| **Auth** | ✅ Bearer Token (Retailer) |

---

### 12.3 Get Monthly Earnings

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /retailer-payment/earnings/monthly` |
| **Auth** | ✅ Bearer Token (Retailer) |

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| month | integer | Current month |
| year | integer | Current year |

---

### 12.4 Get Earnings by Status

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /retailer-payment/earnings/by-status` |
| **Auth** | ✅ Bearer Token (Retailer) |

---

### 12.5 Get Transaction History

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /retailer-payment/transactions` |
| **Auth** | ✅ Bearer Token (Retailer) |

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| page | integer | Page number |
| limit | integer | Items per page |
| from | string | Start date (YYYY-MM-DD) |
| to | string | End date (YYYY-MM-DD) |
| order_status | integer | Filter by order status |
| payment_status | integer | Filter by payment status |

---

### 12.6 Request Payout

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /retailer-payment/payout/request` |
| **Auth** | ✅ Bearer Token (Retailer) |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "amount": 5000.00,
  "bank_details": {
    "account_number": "1234567890",
    "ifsc_code": "HDFC0001234",
    "account_holder_name": "John Doe"
  }
}
```

---

### 12.7 Get Payout History

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /retailer-payment/payout/history` |
| **Auth** | ✅ Bearer Token (Retailer) |

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| page | integer | Page number |
| limit | integer | Items per page |
| status | integer | 1=PENDING, 2=PROCESSING, 3=COMPLETED, 4=REJECTED |

---

## 13. Upload APIs

**Base Path:** `/upload`

### 13.1 Generate Image Presigned URL

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /upload/presigned-url/image` |
| **Auth** | ✅ Bearer Token |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "folder": "retailers",
  "fileName": "shop_photo.jpg",
  "contentType": "image/jpeg"
}
```

**Allowed Folders:** `retailers`, `retailer_products`, `category-icons`

**Allowed Content Types:** `image/jpeg`, `image/jpg`, `image/png`, `image/webp`

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Presigned URL generated successfully",
  "data": {
    "presigned_url": "https://s3.amazonaws.com/...",
    "key": "retailers/1234567890_shop_photo.jpg",
    "expires_in": 300
  }
}
```

---

### 13.2 Generate Excel Presigned URL

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /upload/presigned-url/excel` |
| **Auth** | ✅ Bearer Token |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "fileName": "master_bulk.xlsx",
  "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
}
```

**Allowed Content Types:**
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (.xlsx)
- `application/vnd.ms-excel` (.xls)
- `text/csv` (.csv)

---

### 13.3 Generate Batch Presigned URLs

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /upload/presigned-url/batch` |
| **Auth** | ✅ Bearer Token |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "files": [
    {
      "folder": "retailers",
      "fileName": "shop_photo.jpg",
      "contentType": "image/jpeg"
    },
    {
      "folder": "retailers",
      "fileName": "license_photo.jpg",
      "contentType": "image/jpeg"
    }
  ]
}
```

> **Note:** Maximum 10 files per batch request.

---

---

## 14. ABHA APIs

**Base Path:** `/abha`

### 14.1 Generate Aadhaar OTP
Generate OTP on Aadhaar-registered mobile for ABHA enrollment.

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /abha/generateAadhaarOtp` |
| **Auth** | ✅ Bearer Token |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "loginId": "aadhaar_number",
  "customerId": "user_id"
}
```

---

### 14.2 Verify Aadhaar OTP
Verify Aadhaar OTP and fetch ABHA profile.

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /abha/verifyAadharOtp` |
| **Auth** | ✅ Bearer Token |

**Request Body:**
```json
{
  "customerId": "user_id",
  "otp": "123456",
  "mobileNumber": "9876543210"
}
```

---

### 14.3 Generate Mobile OTP
Generate OTP on mobile number (when not Aadhaar-linked).

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /abha/generateMobileOtp` |
| **Auth** | ✅ Bearer Token |

---

### 14.4 Get Suggested ABHA Addresses
Fetch system-generated ABHA address suggestions.

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /abha/getAbhaAddressSuggestion` |
| **Auth** | ✅ Bearer Token |

---

### 14.5 Set ABHA Address
Set final ABHA address from suggestions.

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /abha/setAbhaAddress` |
| **Auth** | ✅ Bearer Token |

---

### 14.6 Login via Aadhaar
Initiate login via Aadhaar (sends OTP to Aadhaar mobile).

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /abha/getUserByAadhar` |
| **Auth** | ✅ Bearer Token |

---

### 14.7 Login via Mobile (Multi-Account)
Send OTP to mobile for login to list linked ABHA accounts.

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /abha/getUserByNumber` |
| **Auth** | ✅ Bearer Token |

---

### 14.8 Download ABHA Card
Download ABHA card as Base64.

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /abha/downloadAbhaCard` |
| **Auth** | ✅ Bearer Token |

---

### 14.9 Additional Verification & Login Methods

Detailed endpoints for specific login flows and mobile linking.

| Method | Endpoint | Description |
|--------|----------|-------------|
| Verify Mobile OTP | `POST /abha/verifyMobileOtp` | Links mobile with transaction |
| Verify Aadhaar Login | `POST /abha/verifyGetByAadhar` | Completes Aadhaar login |
| Verify Mobile Login | `POST /abha/verifyGetByNumber` | Returns linked accounts |
| Select Account | `POST /abha/verifyGetByNumberUser` | Confirms selected ABHA account |
| Login by ABHA Num | `POST /abha/getAbhaUserByAbhaNumber` | Initiates ABHA number login |
| Verify ABHA Num | `POST /abha/verifyGetByAbhaNumber` | Completes ABHA number login |
| PHR Auth (Address) | `POST /abha/getAbhaUserByAbhaAddress`| Initiates PHR flow |
| Verify PHR Auth | `POST /abha/verifyGetByAbhaAddress` | Completes PHR flow |
| PHR Profile Sync | `POST /abha/abhaAddressUserDetails` | Syncs profile via PHR session |
| Download PHR Card | `POST /abha/getPhrAbhaCard` | Downloads card in PHR flow |
| Sync Profile | `POST /abha/getUserDetails` | General profile sync after login |

---

## 15. Wishlist APIs

**Base Path:** `/user-saved-products`

### 15.1 Add to Wishlist

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /user-saved-products/` |
| **Auth** | ✅ Bearer Token |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "retailer_product_id": 1
}
```

---

### 15.2 Get Wishlist

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /user-saved-products/` |
| **Auth** | ✅ Bearer Token |

---

### 15.3 Check Wishlist Status

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /user-saved-products/check` |
| **Auth** | ✅ Bearer Token |

**Query Parameters:** `retailer_product_id`

---

### 15.4 Remove from Wishlist

| Property | Value |
|----------|-------|
| **Endpoint** | `DELETE /user-saved-products/:id` |
| **Auth** | ✅ Bearer Token |

---

## 16. Test APIs

**Base Path:** `/test`

### 16.1 Test Notifications

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /test/notifications` |
| **Auth** | ✅ Bearer Token |
| **Content-Type** | `application/json` |

**Request Body:**
```json
{
  "retailer_id": 1,
  "test_order_data": { ... }
}
```

> **Note:** This endpoint is for testing Socket.io and FCM push notifications.

---

## WebSocket Events

The application uses Socket.io for real-time communication.

### Connection
```javascript
const socket = io('http://localhost:PORT', {
  auth: {
    token: 'JWT_TOKEN'
  }
});
```

### Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join_retailer_room` | Client → Server | Retailer joins their room |
| `join_delivery_room` | Client → Server | Delivery partner joins their room |
| `order_placed` | Server → Client | New order notification (Success/Failure) |
| `payment_success` | Server → Client | Payment confirmation |
| `payment_status_updated` | Server → Client | General payment update |
| `order_status_updated` | Server → Client | Order status changed (Accepted, Prepared, etc.) |
| `order_assigned_to_delivery` | Server → Client | Delivery partner assigned to order |
| `delivery_partner_arrived` | Server → Client | Partner arrived at location |
| `new_order` | Server → Retailer | [Retailer Only] New order notification |
| `delivery_assigned` | Server → Delivery | [Delivery Only] New delivery assignment |

---

## File Storage

All files are stored in AWS S3. The API stores only the S3 key (path) in the database.

### S3 Key Format
```
{folder}/{timestamp}_{originalFilename}
```

Example: `retailers/1234567890_shop_photo.jpg`

### Constructing Full URL
```
https://{bucket}.s3.{region}.amazonaws.com/{key}
```

---

## Rate Limiting

Currently not implemented. Consider adding rate limiting for production.

---

## Changelog

### v1.0.0 (February 2026)
- Initial release
- User, Retailer, Delivery Partner authentication
- Product management
- Order flow
- Payment processing
- Real-time notifications

---

*Generated on: February 9, 2026*
