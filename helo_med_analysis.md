# Helo-Med Project — Deep Analysis

## Overview

**Helo-Med** is a **medicine delivery web app** built with:
- **React 19 + TypeScript + Vite**
- **React Router DOM v7** for routing
- **Framer Motion** for animations
- **Lucide React** for icons
- **Axios** for API calls
- **Backend:** `https://helo.thynxai.cloud` (REST API)
- **Media Storage:** AWS S3 — `https://helomed.s3.ap-south-2.amazonaws.com/`
- **Maps:** Google Maps API key: `AIzaSyDpyclQV4dQAs4q2UcfnmZ2lwzXPmIVe7E`

---

## Architecture

```mermaid
graph TD
    A[App.tsx] --> B[AuthProvider]
    B --> C[AnimationProvider]
    C --> D[ToastProvider]
    D --> E[CartProvider]
    E --> F[FlyToCartLayer]
    E --> G[Router / Routes]
    G --> H[User Pages]
    G --> I[Admin Pages]
    G --> J["Retailer Pages (commented out)"]
    G --> K["Delivery Pages (commented out)"]
```

---

## Role Types

| Role | Value | Token Key |
|------|-------|-----------|
| RETAILER | 2 | `helo_med_retailer_token` |
| USER | 3 | `helo_med_token` |

---

## Route Map ([App.tsx](file:///d:/project/Helo-Med/src/App.tsx))

### Public Routes
| Path | Component | Notes |
|------|-----------|-------|
| `/login` | [LoginPage](file:///d:/project/Helo-Med/src/pages/LoginPage.tsx#15-323) | OTP-based login (user only currently) |
| `/signup` | [SignupPage](file:///d:/project/Helo-Med/src/pages/SignupPage.tsx#67-1161) | Supports user/retailer forms |

### User Protected Routes ([ProtectedRoute](file:///d:/project/Helo-Med/src/App.tsx#51-55) — requires `helo_med_token`)
| Path | Component | Purpose |
|------|-----------|---------|
| `/` | [Home](file:///d:/project/Helo-Med/src/pages/Home.tsx#18-119) | Landing with products, categories, hero animation |
| `/categories` | `CategoriesPage` | Product categories listing |
| `/cart` | [CartPage](file:///d:/project/Helo-Med/src/pages/CartPage.tsx#14-419) | Cart with grouped retailer items + checkout |
| `/profile` | [ProfilePage](file:///d:/project/Helo-Med/src/pages/ProfilePage.tsx#14-380) | User profile, addresses, recent orders |
| `/medicines` | `MedicinesPage` | Browse medicines with category/filter |
| `/orders` | [OrdersPage](file:///d:/project/Helo-Med/src/pages/OrdersPage.tsx#11-444) | Order history with timeline details |
| `/about` | `AboutPage` | About page |
| `/offers` | `OffersPage` | Offers (placeholder) |
| `/need-help` | `NeedHelpPage` | Help page (placeholder) |
| `/wishlist` | `WishlistPage` | Saved/wishlisted products |
| `/search` | `SearchPage` | Product search |
| `/our-story` | `OurStoryPage` | Company story (placeholder) |
| `/careers` | `CareersPage` | Careers page (placeholder) |
| `/product/:id` | `ProductDetailPage` | Product detail with add to cart |
| `/refund-policy` | `RefundPolicy` | Legal page |
| `/privacy-policy` | `PrivacyPolicy` | Legal page |
| `/terms-of-service` | `TermsOfService` | Legal page |
| `/shipping-policy` | `ShippingPolicy` | Legal page |

### Retailer Protected Routes (requires `helo_med_retailer_token`)
| Path | Component | Purpose |
|------|-----------|---------|
| `/retailer/dashboard` | `RetailerDashboardPage` | Retailer dashboard |
| `/retailer/all-products` | `RetailerAllProductsPage` | Browse all products |
| `/retailer/products` | `RetailerProductsPage` | Manage retailer products |
| `/retailer/orders` | `RetailerOrdersPage` | Manage orders |
| `/retailer/payments` | `RetailerPaymentsPage` | Payments & earnings |
| `/retailer/profile` | `RetailerProfilePage` | Retailer profile |

---

## API Layer (`src/api/`)

### API Clients

| File | Token | Base URL |
|------|-------|----------|
| `client.ts` | `helo_med_token` | `https://helo.thynxai.cloud` |
| `retailerClient.ts` | `helo_med_retailer_token` | Same |

All interceptors attach Bearer token automatically. Retailer client auto-clears token on 401.

---

### `auth.ts` — User Auth API
| Function | Method | Endpoint |
|----------|--------|----------|
| `sendOtp(phone)` | POST | `/user/send-otp` |
| `verifyOtp(phone, otp)` | POST | `/user/verify-otp` → returns `{token, user}` |
| `signup(userData)` | POST | `/user/signup` |
| `getProfile()` | GET | `/user/profile` |
| `updateProfile(data)` | PUT | `/user/profile` |

---

### `address.ts` — User Address API
| Function | Method | Endpoint |
|----------|--------|----------|
| `getAddresses()` | GET | `/user-address/address` |
| `addAddress(data)` | POST | `/user-address/address` |
| `deleteAddress(id)` | DELETE | `/user-address/address/:id` |
| `updateAddress(id, data)` | PUT | `/user-address/address/:id` |

Address fields: `full_address`, `latitude`, `longitude`, `pincode`, `landmark`, `address_type` (HOME/WORK/OTHER), `is_default`

---

### `cart.ts` — User Cart API
| Function | Method | Endpoint |
|----------|--------|----------|
| `addToCart(retailerId, productId, qty)` | POST | `/user-cart/cart` |
| `fetchCart()` | GET | `/user-cart/cart` |
| `updateCartItem(itemId, qty)` | PUT | `/user-cart/cart/item/:id` |
| `incrementCartItem(itemId)` | PUT | `/user-cart/cart/item/:id/increment` |
| `decrementCartItem(itemId)` | PUT | `/user-cart/cart/item/:id/decrement` |
| `removeFromCart(itemId)` | DELETE | `/user-cart/cart/item/:id` |
| `clearCart()` | DELETE | `/user-cart/cart` |
| `getCartSummary(addressId?)` | GET | `/user-cart/cart/summary` |
| `getCartCount()` | GET | `/user-cart/cart/count` |

---

### `orders.ts` — User Orders API
| Function | Method | Endpoint |
|----------|--------|----------|
| `getOrderSummary(addressId?, paymentMode?, paymentMethod?)` | GET | `/order/checkout/summary` |
| `calculateDeliveryFee(payload)` | POST | `/order/calculate-delivery-fee` |
| `placeOrder({address_id, payment_mode, payment_method?})` | POST | `/order/checkout` |
| `processPayment(orderId, payload)` | POST | `/order/:id/payment` |
| `updatePaymentStatus(orderId, payload)` | PUT | `/order/:id/payment-status` |
| `trackOrder(orderId)` | GET | `/order/:id/track` |
| `getInvoice(orderId)` | GET | `/order/:id/invoice` |
| `getMyOrders()` | GET | `/user-order/orders` (fallback: `/order/orders`) |
| `getOrderDetails(orderId)` | GET | `/user-order/orders/:id` |
| `cancelOrder(orderId)` | PUT | `/user-order/orders/:id/cancel` |

---

### `products.ts` — Product Catalog API
| Function | Method | Endpoint |
|----------|--------|----------|
| `getCategories()` | GET | `/product-category` |
| `getProductsByCategory(catId, page, limit)` | GET | `/user-products/categories/:id/products` |
| `searchProducts(query, page, limit)` | GET | `/user-search/search` |
| `getProductById(id)` | GET | `/user-search/products/:id` |
| `getSearchSuggestions(query)` | GET | `/user-search/search-suggestions` |
| `getRetailerProducts(retailerId, page, limit)` | GET | `/user-search/retailers/:id/products` |
| `searchRetailerProducts(retailerId, query, page, limit)` | GET | `/user-search/retailers/:id/search-products` |
| `getAllRetailerProducts(page, limit)` | GET | `/retailerProduct/products` |

`NormalizedProduct` type: `{id, name, price, originalPrice, discount, weight, pack_size, image, category, retailer_id, retailer_product_id, shop_name, full_address, stock, requires_prescription, product_category, categoryId, salt_composition, brand_name, description, tags, dosage_form, age_group}`

---

### `wishlist.ts` — User Wishlist API
| Function | Method | Endpoint |
|----------|--------|----------|
| `addToWishlist(retailerProductId)` | POST | `/user-saved-products/` |
| `getWishlist()` | GET | `/user-saved-products/` |
| `checkWishlist(retailerProductId)` | GET | `/user-saved-products/check?retailer_product_id=:id` |
| `removeFromWishlist(id)` | DELETE | `/user-saved-products/:id` |

---

### `retailerAuth.ts` — Retailer API
| Function | Method | Endpoint |
|----------|--------|----------|
| `retailerSendOtp(phone)` | POST | `/retailer/send-otp` |
| `retailerVerifyOtp(phone, otp)` | POST | `/retailer/verify-otp` |
| `retailerSignup(formData)` | POST | `/retailer/signup` (multipart) |
| `getRetailerProfile()` | GET | `/retailer/profile` |
| `updateRetailerProfile(formData)` | PUT | `/retailer/update-profile` |
| `updateRetailerLocation(payload)` | PUT | `/retailer/update-location` |
| `setRetailerOnlineStatus(bool)` | PUT | `/retailer/set-online-status` |
| `updateRetailerFcmToken(token)` | PUT | `/retailer/fcm-token` |
| `retailerLogout()` | POST | `/retailer/logout` |

---

### `retailerProducts.ts` — Retailer Product Management
| Function | Method | Endpoint |
|----------|--------|----------|
| `addRetailerProduct(formData)` | POST | `/retailerProduct/addProduct` |
| `addRetailerProductFromMaster(payload)` | POST | `/retailerProduct/addFromMaster` |
| `bulkUploadRetailerProducts(formData)` | POST | `/retailerProduct/bulk-upload` |
| `getRetailerProducts(page, limit, category?)` | GET | `/retailerProduct/products` |
| `searchRetailerProducts(query, page, limit)` | GET | `/retailerProduct/search` |
| `getRetailerSingleProduct(id)` | GET | `/retailerProduct/single-product?id=:id` |
| `updateRetailerProduct(id, payload)` | PUT | `/retailerProduct/update/:id` |
| `getAllMasterProducts(page, limit, starts_with?, cat?)` | GET | `/master-products/` |
| `searchMasterProducts(query, page, limit)` | GET | `/master-products/search` |
| `getMasterProductSuggestions(query, limit)` | GET | `/master-products/suggestions` |

---

### `retailerOrders.ts` — Retailer Order Management
| Function | Method | Endpoint |
|----------|--------|----------|
| `getRetailerOrders(params?)` | GET | `/retailer-order/orders` |
| `getRetailerOrderDetails(id)` | GET | `/retailer-order/orders/:id` |
| `updateRetailerOrderStatus(id, {order_status, rejection_reason?})` | PATCH | `/retailer-order/orders/:id/status` |

---

### `retailerPayments.ts` — Retailer Payments/Earnings
| Function | Method | Endpoint |
|----------|--------|----------|
| `getRetailerEarningsToday()` | GET | `/retailer-payment/earnings/today` |
| `getRetailerEarningsTotal()` | GET | `/retailer-payment/earnings/total` |
| `getRetailerEarningsMonthly(month?, year?)` | GET | `/retailer-payment/earnings/monthly` |
| `getRetailerEarningsByStatus()` | GET | `/retailer-payment/earnings/by-status` |
| `getRetailerTransactions(params?)` | GET | `/retailer-payment/transactions` |
| `requestRetailerPayout(payload)` | POST | `/retailer-payment/payout/request` |
| `getRetailerPayoutHistory(params?)` | GET | `/retailer-payment/payout/history` |

---

### `uploads.ts` — S3 Upload API (role-based)
| Function | Method | Endpoint |
|----------|--------|----------|
| `getImagePresignedUrl(role, payload)` | POST | `/upload/presigned-url/image` |
| `getExcelPresignedUrl(role, payload)` | POST | `/upload/presigned-url/excel` |
| `getBatchPresignedUrls(role, payload)` | POST | `/upload/presigned-url/batch` |
| `uploadToPresignedUrl(url, file)` | PUT | S3 presigned URL directly |

Roles: `'retailer' | 'user'`

---

## Context Layer (`src/context/`)

### `AuthContext.tsx`
- `isAuthenticated` — bool from `localStorage.getItem('helo_med_token')`
- `user` — cached in `localStorage.getItem('helo_med_user')`
- `login(token, userData)` — sets token + user in localStorage
- `logout()` — removes token + user
- `refreshProfile()` — calls `GET /user/profile` and updates user state

### `CartContext.tsx` (734 lines — mega global state)
Manages: cart, orders, addresses, wishlist, notifications, wallet balance, cart summary

**Key localStorage keys:**
| Key | Purpose |
|-----|---------|
| `helo_med_cart` | Guest cart |
| `helo_med_orders` | Guest orders |
| `helo_med_wallet_balance` | Wallet balance |
| `helo_med_transactions` | Transaction history |
| `helo_med_notifications` | Notifications |
| `helo_med_wishlist` | Guest wishlist |
| `helo_med_addresses` | Guest addresses |

**Key methods:**
- `addToCart(item)` — calls `POST /user-cart/cart` when authenticated
- `removeFromCart(id)` — calls `DELETE /user-cart/cart/item/:id`
- `updateQuantity(id, qty)` — smart: uses increment/decrement if ±1, else full update
- `clearCart()` — calls `DELETE /user-cart/cart`
- `placeOrder(paymentMode, paymentMethod)` — calls `POST /order/checkout`
- `toggleWishlist(productId)` — calls `/user-saved-products/` add/remove
- `upsertAddress(address)` — add or update depending on numeric id
- `loadCartSummary()` — calls `GET /order/checkout/summary` → fallback to `/user-cart/cart/summary`

**Cart response mapping:** handles two shapes: `cart_items[]` and `items_by_retailer` object

### `AnimationContext.tsx`
Simple context for shared animation state (FlyToCart animation trigger)

### `RetailerAuthContext.tsx`
Similar to AuthContext but for retailer — uses `helo_med_retailer_token`

---

## Pages Deep-Dive

### `Home.tsx`
- Header → HeroCanvasAnimation (desktop) / MobileHero (mobile)
- `getAllProducts()` → fetches from category 1 (Medicine & Supplements)
- 3 `ProductSection` blocks: "Diabetic Essential" (0-5), "Best Picks" (5-10), "Hair Care" (10-15)
- Skincare promo banner → navigates to `/medicines?category=5`
- HealthArticles + Reviews + Footer

### `LoginPage.tsx` (325 lines)
- Role: supports `'user'` and `'retailer'`
- Step 1: Phone input → `sendOtp()`
- Step 2: 4-digit OTP → `verifyOtp()` → calls `login(token, user)` → redirect to `/`
- Auto-submit on 4-digit OTP entry
- Resend OTP + Change Number options
- Unregistered user redirected to `/signup`

### `SignupPage.tsx` (1163 lines)
Supports **2 roles** (user/retailer) in one form:

**User fields:** name, phone, email, dateOfBirth (min age 18), gender (1=Male, 2=Female), address (GoogleAddressInput + GoogleMapPicker), pincode, landmark, lat/lng

**Retailer fields:** shopName, ownerName, phone, email, address, lat/lng, houseNumber, pincode, landmark, licenseNumber, GST, Aadhaar, PAN, accountHolder, accountNumber, IFSC, branchName, openingTime, closingTime, shopType, files (shop_photo, license_photo, aadhaar_photo, pan_photo, owner_photo)

Image compression: canvas-based JPEG compression, max 800px width, 0.7 quality (skips if <200KB)
Location detection: browser geolocation → Google Geocoding API → reverse geocode

### `CartPage.tsx` (421 lines)
- Items **grouped by retailer** (from `cartSummary.cart.items_by_retailer`)
- Address bar showing selected delivery address with "Change" button
- Each retailer group shows estimated time, distance_km, delivery_fee badges
- Order summary card: totalMrp, discount, subtotal, deliveryFee, taxes, cashHandlingFee, total, estimatedPayable
- Free delivery banner for orders > ₹500
- Modals: `PaymentSelectionModal`, `OrderSuccessModal`, `AddressSelectionModal`, `AddressModal`
- Checkout flow: Cart → PaymentSelectionModal → `placeOrder(mode, method)` → `OrderSuccessModal` → navigate to `/orders`

### `OrdersPage.tsx` (446 lines)
- Tabs: All / Active / Delivered / Cancelled / Returned
- Order card: order_number, date, status pill, items list with price, discount chips, delivery fee, payment mode pill, payment status badge
- "View Details" opens animated modal with:
  - **Progress timeline**: Placed → Accepted → Preparing → Ready for Pickup → Out for Delivery → Delivered
  - Full price breakdown (discount, subtotal, delivery fee, taxes, cash handling, total)
  - Payment info (mode + status)
  - Timestamps (placed, accepted, delivered)
  - Delivery address

### `ProfilePage.tsx` (382 lines)
- Quick actions: Orders count + Addresses count (wallet commented out)
- Profile Details card: name, phone, email, gender, DOB — editable via inline form (calls `PUT /user/profile`)
- Saved Addresses: list with edit/delete, Add New button → `AddressModal`
- Recent Orders: last 3 orders preview
- Notifications settings: Marketing Emails toggle, WhatsApp Updates toggle (UI only, no API)
- Logout button → clears token + navigate to `/login`

### `AdminLoginPage.tsx`
- Paste JWT token → stores as `helo_med_admin_token` → navigates to `/admin/categories`

---

## Components (`src/components/`)

| Component | Purpose |
|-----------|---------|
| `Header.tsx` | Nav bar with logo, menu, cart count badge, notifications |
| `Footer.tsx` | Links to about, legal pages, social |
| `HeroCanvasAnimation.tsx` | Desktop hero with canvas particle animation |
| `MobileHero.tsx` | Mobile hero section |
| `Categories.tsx` | Category pills/cards linking to /medicines |
| `ProductCard.tsx` | Card with image, name, price, discount, add-to-cart + wishlist |
| `ProductSection.tsx` | Horizontal scroll product row with title/subtitle |
| `HealthArticles.tsx` | Static health articles section |
| `Reviews.tsx` | Static customer reviews section |
| `Toast.tsx` | Toast notification system (ToastProvider + useToast) |
| `AddressModal.tsx` | Modal for add/edit address with Google Maps |
| `AddressSelectionModal.tsx` | Modal to select delivery address from saved list |
| `PaymentSelectionModal.tsx` | Modal to pick payment mode (Pay on Delivery / Pay Online) and method (COD/QR) |
| `OrderSuccessModal.tsx` | Post-order success celebration modal |
| `NotificationModal.tsx` | Notification bell dropdown |
| `FlyToCartLayer.tsx` | Animated product-to-cart fly animation |
| `GoogleAddressInput.tsx` | Google Places autocomplete input |
| `GoogleMapPicker.tsx` | Draggable map pin for precise location |
| `ScrollToTop.tsx` | Auto scroll to top on route change |
| `RetailerLayout.tsx` | Layout wrapper for retailer portal |
| `ComingSoon.tsx` | Coming soon placeholder page |

---

## Constants (`src/constants.ts`)

| Constant | Values |
|----------|--------|
| `CATEGORY` | ALLOPATHIC=1, AYURVEDIC=2, HOMEOPATHIC=3 |
| `PRODUCT_CATEGORY` | MEDICINE_SUPPLEMENTS=1, MEDICAL_DEVICE=2, PERSONAL_CARE=3, FOOD_NUTRITION=4, BABY_PERSONAL_HYGIENE=5, OTHER=6 |
| `DOSAGE_FORM` | SOLID=1, SEMISOLID=2, LIQUID=3 |
| `AGE_GROUP` | CHILD=1, ADULT=2, SENIOR=3, ALL=4 |
| `ORDER_STATUS` | PLACED=1, ACCEPTED=2, REJECTED=3, PREPARING=4, READY_FOR_PICKUP=5, OUT_FOR_DELIVERY=6, DELIVERED=7, CANCELLED=8 |
| `SHOP_TYPE` | ALLOPATHIC=1, AYURVEDIC=2, HOMEOPATHIC=3, HYBRID=4 |
| `PAYMENT_STATUS` | PENDING=1, PAID=2, FAILED=3, REFUNDED=4 |
| `PAYMENT_MODE` | PAY_ON_DELIVERY=1, PAY_ONLINE=2 |
| `PAYMENT_METHOD` | COD=1, ONLINE_QR=2 |
| `PAYOUT_STATUS` | PENDING=1, PROCESSING=2, COMPLETED=3, REJECTED=4 |

Each constant has a corresponding `_LABELS` record for display strings.

---

## Key Design Patterns

1. **`unwrapData` pattern**: Every API function uses `payload?.data?.data ?? payload?.data ?? payload` to handle nested response structures
2. **`tryEndpoints` pattern**: Some functions (orders, search suggestions) try multiple endpoint URLs, catching 404s, to handle API versioning
3. **Dual mode (guest vs authenticated)**: Cart, addresses, wishlist all work in localStorage for guests; switch to API when authenticated
4. **Image normalization**: `resolveImageUrl()` auto-prefixes S3 base URL for relative paths
5. **Product normalization**: `normalizeProduct()` handles many different response shapes from different endpoints
6. **Image compression**: Client-side JPEG compression via Canvas API before upload (max 800px, 0.7 quality)

---

## File Sizes (Notable)

| File | Size | Notes |
|------|------|-------|
| `SignupPage.tsx` | 63KB / 1163 lines | Largest page — 2-role signup |
| `RetailerProductsPage.tsx` | 37KB | Retailer's product management |
| `CartContext.tsx` | 30KB / 734 lines | Main global state |
| `CartPage.tsx` | 23KB / 421 lines |  |
| `RetailerDashboardPage.tsx` | 16KB | |
| `RetailerOrdersPage.tsx` | 15KB | |
| `ProfilePage.tsx` | 21KB / 382 lines | |
| `OrdersPage.tsx` | 26KB / 446 lines | |
| `HeroCanvasAnimation.tsx` | 13KB | Canvas particle system |

---

## What's Currently Enabled vs Disabled

### ✅ Enabled / Active
- User login/signup/OTP flow
- Home page with products from API
- Cart (full add/update/remove/checkout)
- Orders history + detail modal
- Profile edit + addresses
- Wishlist
- Product detail page
- Search page
- Categories + Medicines browse
- Retailer portal (dashboard, products, orders, payments, profile)

### 🚫 Commented Out / Disabled
- **Wallet/HeloCoins** feature (code exists but commented out in Profile/Cart)
