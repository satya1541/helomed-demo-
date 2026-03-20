# ABHA Integration Implementation Guide

## ✅ Completed

### 1. ABHA API Client Created
**File**: `src/api/abha.ts`
- ✅ All 16 API endpoints implemented
- ✅ TypeScript types defined
- ✅ Response unwrapping pattern applied

### 2. API Endpoints Available

#### Registration Flow (6 APIs)
1. `generateAadhaarOtp` - Send OTP to Aadhaar mobile
2. `verifyAadharOtp` - Verify Aadhaar OTP
3. `generateMobileOtp` - Send OTP to non-Aadhaar mobile
4. `verifyMobileOtp` - Verify mobile OTP
5. `getAbhaAddressSuggestion` - Get address suggestions
6. `setAbhaAddress` - Set final ABHA address

#### Login Flows (10 APIs)
7. `getUserByAadhar` - Login via Aadhaar
8. `verifyGetByAadhar` - Verify Aadhaar login OTP
9. `getUserByNumber` - Login via Mobile
10. `verifyGetByNumber` - Verify mobile OTP (returns accounts)
11. `verifyGetByNumberUser` - Select account from list
12. `getAbhaUserByAbhaNumber` - Login via ABHA Number
13. `verifyGetByAbhaNumber` - Verify ABHA Number OTP
14. `getAbhaUserByAbhaAddress` - Login via ABHA Address
15. `verifyGetByAbhaAddress` - Verify ABHA Address OTP
16. PHR profile and card download APIs

## 📋 Implementation Steps

### Step 1: Complete AbhaWizardPage Component

The AbhaWizardPage needs these key features:

#### Features to Implement:
1. **OTP Timer Component** (60 seconds, 3 attempts max)
2. **Registration Flow**:
   - Aadhaar input → OTP verification
   - Conditional mobile verification
   - Address selection from suggestions
   - Profile fetch and card download
3. **4 Login Methods**:
   - Mobile (with account selection)
   - Aadhaar
   - ABHA Number
   - ABHA Address
4. **Success Screen** with profile display and card download

### Step 2: Update CSS

Add these classes to `AbhaWizardPage.css`:

```css
/* OTP Components */
.otp-max-attempts {
    color: #ef4444;
    font-size: 0.85rem;
    margin-top: 0.5rem;
}

/* Address Selection */
.abha-address-suggestions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin: 1.5rem 0;
}

.abha-address-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border: 2px solid var(--border-color, #e2e8f0);
    border-radius: var(--radius-md, 8px);
    cursor: pointer;
    transition: all 0.2s;
}

.abha-address-option:hover {
    border-color: var(--primary-color);
    background: var(--accent-color, #f0f9ff);
}

.abha-address-option input[type="radio"] {
    margin: 0;
}

/* Account Selection */
.abha-account-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin: 1.5rem 0;
}

.abha-account-option {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.25rem;
    border: 2px solid var(--border-color);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s;
}

.abha-account-option:hover {
    border-color: var(--primary-color);
    background: var(--accent-color);
}

.abha-account-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.abha-account-info strong {
    font-size: 1.05rem;
    color: var(--text-primary);
}

.abha-account-meta {
    font-size: 0.85rem;
    color: var(--text-secondary);
}

/* Loading Pane */
.abha-loading-pane {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    gap: 1.5rem;
}

.abha-loader {
    width: 48px;
    height: 48px;
    border: 4px solid var(--border-color);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Success Screen */
.abha-success-container {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    animation: fadeIn 0.3s ease;
}

.abha-success-header {
    text-align: center;
    margin-bottom: 2rem;
}

.abha-success-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 1rem;
    background: var(--primary-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

.abha-profile-card {
    background: white;
    border-radius: var(--radius-lg);
    padding: 2rem;
    margin-bottom: 2rem;
    border: 1px solid var(--border-color);
}

.abha-profile-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
}

.abha-profile-item {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
}

.abha-profile-item svg {
    color: var(--primary-color);
    flex-shrink: 0;
    margin-top: 0.25rem;
}

.abha-profile-item div {
    display: flex;
    flex-direction: column;
}

.abha-profile-item label {
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-weight: 500;
    margin-bottom: 0.25rem;
}

.abha-profile-item span {
    font-size: 1rem;
    color: var(--text-primary);
    font-weight: 600;
}

/* ABHA Card Preview */
.abha-card-preview {
    background: white;
    border-radius: var(--radius-lg);
    padding: 2rem;
    margin-bottom: 2rem;
    text-align: center;
    border: 1px solid var(--border-color);
}

.abha-card-image {
    max-width: 100%;
    height: auto;
    border-radius: var(--radius-md);
    margin: 1.5rem 0;
    box-shadow: var(--shadow-md);
}

.abha-btn-download {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: var(--primary-color);
    color: white;
    text-decoration: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    transition: all 0.2s;
}

.abha-btn-download:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

/* Back Button */
.abha-back-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 0.95rem;
    cursor: pointer;
    padding: 0.5rem 1rem;
    transition: color 0.2s;
}

.abha-back-btn:hover {
    color: var(--primary-color);
}

/* Option Icon for Login */
.abha-option-icon {
    color: var(--primary-color);
    margin-bottom: 1rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .abha-tabs {
        flex-wrap: wrap;
    }
    
    .abha-tab {
        flex: 1 1 45%;
        font-size: 0.85rem;
    }
    
    .abha-profile-grid {
        grid-template-columns: 1fr;
    }
}
```

### Step 3: Testing Checklist

#### Registration Flow Test:
1. ☐ Enter valid 12-digit Aadhaar number
2. ☐ Accept terms and conditions
3. ☐ Verify OTP timer (60 seconds)
4. ☐ Test resend OTP (max 3 attempts)
5. ☐ Enter valid mobile number
6. ☐ If mobile not Aadhaar-linked → verify mobile OTP
7. ☐ Select ABHA address from suggestions
8. ☐ Verify profile fetch
9. ☐ Verify card download
10. ☐ Check success screen displays correctly

#### Login Flow Tests:

**Mobile Login:**
1. ☐ Enter 10-digit mobile
2. ☐ Verify OTP
3. ☐ If multiple accounts → see account selection screen
4. ☐ Select account
5. ☐ Verify profile and card download

**Aadhaar Login:**
1. ☐ Enter 12-digit Aadhaar
2. ☐ Verify OTP
3. ☐ Direct profile fetch (no account selection)

**ABHA Number Login:**
1. ☐ Enter ABHA Number (e.g., 91-1234-5678-9012)
2. ☐ Verify OTP
3. ☐ Profile fetch

**ABHA Address Login:**
1. ☐ Enter ABHA Address (e.g., username@sbx)
2. ☐ Verify OTP
3. ☐ PHR profile fetch
4. ☐ PHR card download

### Step 4: Error Handling

Common errors to handle:
- Invalid Aadhaar/Mobile number format
- OTP expired (show timer)
- Maximum attempts reached (30-minute lockout message)
- Network errors (show retry button)
- ABDM rate limit exceeded (ABDM-1100 error)

### Step 5: UI/UX Enhancements

1. **Loading States**: Show spinners during API calls
2. **Toast Messages**: Success/error feedback
3. **Form Validation**: Real-time validation with visual feedback
4. **Mobile Responsiveness**: Test on mobile devices
5. **Accessibility**: Add ARIA labels

## 🔧 Quick Start

1. Import ABHA API in component:
```typescript
import {
    generateAadhaarOtp,
    verifyAadharOtp,
    // ... other imports
} from '../api/abha';
```

2. Get customer ID from auth context:
```typescript
const { user } = useAuth();
const customerId = user?.id?.toString() || '2';
```

3. Handle OTP flow with timer:
```typescript
const otpTimer = useOtpTimer(60); // 60 seconds
// Start timer after sending OTP
otpTimer.startTimer();
```

4. Show appropriate error messages via toast:
```typescript
try {
    await generateAadhaarOtp(aadhaar, customerId);
    showToast('OTP sent successfully');
} catch (error) {
    showToast(error.response?.data?.message || 'Failed');
}
```

## 📝 Notes

- **Customer ID**: Currently defaults to '2' for testing. Update with actual user ID from auth context in production.
- **OTP Limits**: 60-second timer, 3 total attempts (1 initial + 2 resends).
- **Mobile Verification**: Only triggered if `mobileVerified: false` in Aadhaar OTP response.
- **Account Selection**: Only for mobile login when multiple ABHA accounts linked.
- **PHR vs Standard Flow**: ABHA Address login uses PHR-specific endpoints.

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| OTP not received | Check mobile number is Aadhaar-linked |
| Max attempts error | Wait 30 minutes before retry |
| ABDM-1100 error | Rate limit exceeded, retry after delay |
| Invalid address | Use only suggested addresses or valid format |
| Card not downloading | Check backend returns Base64 string |

## 🚀 Deployment Checklist

- [ ] Remove default customerId fallback ('2')
- [ ] Add production API base URL
- [ ] Enable error logging/monitoring
- [ ] Test all 4 login methods
- [ ] Verify mobile responsiveness
- [ ] Check accessibility compliance
- [ ] Add analytics tracking
- [ ] Document user guide

## 📞 Support

For ABDM API issues, refer to:
- Official docs: https://abdm.gov.in
- Sandbox testing: https://sandbox.abdm.gov.in

---

**Implementation Status**: API client ✅ | UI Components 🚧 | Testing ⏳
