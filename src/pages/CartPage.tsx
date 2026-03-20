import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ChevronRight, Sparkles, MapPin, Store, Truck, Clock, ShoppingCart, Tag, Package, Receipt, UploadCloud, CheckCircle, FileText, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart, type Address } from '../context/CartContext';
import PaymentSelectionModal from '../components/PaymentSelectionModal';
import OrderSuccessModal from '../components/OrderSuccessModal';
import AddressSelectionModal from '../components/AddressSelectionModal';
import AddressModal from '../components/AddressModal';
import { resolveImageUrl } from '../api/products';
import './CartPage.css';

declare const Razorpay: any;

const loadRazorpay = () => {
    return new Promise((resolve) => {
        if (typeof window !== 'undefined' && 'Razorpay' in window) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const CartPage = () => {
    const navigate = useNavigate();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isAddrSelectionOpen, setIsAddrSelectionOpen] = useState(false);
    const [isAddrModalOpen, setIsAddrModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
    const [isUploadingRx, setIsUploadingRx] = useState(false);
    const [uploadedRxUrl, setUploadedRxUrl] = useState<string | null>(null);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);

    const { cartItems, removeFromCart, updateQuantity, cartTotal, placeOrder, processPayment, addresses, selectedAddressId, cartSummary, clearCart, upsertAddress, uploadPrescription } = useCart();

    const requiresPrescription = cartItems.some(item => item.requires_prescription);

    const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];

    // Extract checkout summary data
    const summaryData = cartSummary;
    const totals = summaryData?.totals;
    const deliveryFees = summaryData?.delivery_fees || [];
    const addressFromSummary = summaryData?.address;
    // Try to ensure Pay Online comes first if it exists in the array
    const paymentModes = (summaryData?.payment_modes || []).sort((a: any, b: any) => {
        if (a.name.toLowerCase().includes('online')) return -1;
        if (b.name.toLowerCase().includes('online')) return 1;
        return 0;
    });

    const totalMrp = Number(totals?.total_mrp ?? 0);
    const subtotal = Number(totals?.subtotal ?? cartTotal);
    const discount = Number(totals?.discount ?? 0);
    const totalDeliveryFee = Number(totals?.total_delivery_fee ?? 0);
    const taxesAndFee = Number(totals?.taxes_and_fee ?? 0);
    // Correct calculation: MRP After Discount + Delivery Fee + Taxes & Fee
    const totalAmount = subtotal + totalDeliveryFee + taxesAndFee;
    const estimatedPayable = totalAmount;

    const displayAddress = addressFromSummary || selectedAddress;

    const cartData = summaryData?.cart;
    const itemsByRetailer = cartData?.items_by_retailer;

    const groupedItems = itemsByRetailer
        ? Object.entries(itemsByRetailer).reduce((acc: any, [retailerId, retailerData]: [string, any]) => {
            const retailer = retailerData.retailer || {};
            const items = (retailerData.items || []).map((item: any) => {
                const product = item.product || {};
                return {
                    id: item.id,
                    product_id: product.id,
                    name: product.product_name || 'Product',
                    price: Number(item.price),
                    originalPrice: product.mrp ? Number(product.mrp) : undefined,
                    discount: product.discount_percentage ? Number(product.discount_percentage) : undefined,
                    quantity: item.quantity,
                    subtotal: item.subtotal,
                    image: product.product_image ? resolveImageUrl(product.product_image) : '',
                    weight: product.pack_size,
                    brand_name: product.brand_name,
                    pack_size: product.pack_size,
                    requires_prescription: product.requires_prescription,
                    salt_composition: product.salt_composition,
                    shop_name: retailer.shop_name,
                    retailer_id: retailer.id,
                };
            });
            acc[retailerId] = { retailer, items };
            return acc;
        }, {})
        : cartItems.reduce((acc: any, item) => {
            const retailerId = item.retailer_id || 'unknown';
            if (!acc[retailerId]) acc[retailerId] = { retailer: { shop_name: item.shop_name }, items: [] };
            acc[retailerId].items.push(item);
            return acc;
        }, {});

    const handlePrescriptionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPrescriptionFile(file);
        setIsUploadingRx(true);
        try {
            const response = await uploadPrescription(file);
            // Updated to use response.data.prescription as per developer feedback
            const prescriptionPath = response?.data?.prescription || response?.prescription;
            setUploadedRxUrl(prescriptionPath || 'uploaded');
            setCheckoutError(null);
        } catch (error) {
            console.error("Prescription upload error", error);
            alert('Failed to upload prescription. Please try again.');
            setPrescriptionFile(null);
        } finally {
            setIsUploadingRx(false);
        }
    };

    const handleCheckout = () => {
        setCheckoutError(null);
        if (cartItems.length === 0) return;
        if (requiresPrescription && !uploadedRxUrl) {
            setCheckoutError('Please upload a valid prescription to continue.');
            return;
        }
        setIsPaymentModalOpen(true);
    };

    const handleRazorpayPayment = async (orderData: any) => {
        const rzpData = orderData.razorpay_order;
        if (!rzpData) return;

        const isLoaded = await loadRazorpay();
        if (!isLoaded) {
            alert('Razorpay SDK failed to load. Please check your connection.');
            return;
        }

        const options = {
            key: rzpData.key_id,
            amount: rzpData.amount,
            currency: rzpData.currency,
            name: "Helo Med",
            description: `Order #${orderData.order_number}`,
            order_id: rzpData.razorpay_order_id,
            handler: async (response: any) => {
                try {
                    // response = { razorpay_payment_id, razorpay_order_id, razorpay_signature }
                    await processPayment(
                        orderData.id,
                        response.razorpay_order_id,
                        response.razorpay_payment_id,
                        response.razorpay_signature
                    );
                    setIsSuccessModalOpen(true);
                } catch (error) {
                    console.error("Razorpay verification failed", error);
                    alert("Payment verification failed. Please contact support.");
                }
            },
            prefill: {
                name: "", // Can add user name if available
                email: "",
                contact: ""
            },
            theme: {
                color: "#1e4e79"
            }
        };

        const rzp = new Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
            console.error("Payment failed", response.error);
            alert(`Payment failed: ${response.error.description}`);
        });
        rzp.open();
    };

const onPaymentSelectionConfirm = async (mode: number, method: number) => {
        try {
            const response = await placeOrder(mode, method, uploadedRxUrl || undefined);

            // Handle array response from placeOrder (based on user info)
            const orderData = Array.isArray(response) ? response[0] : response;

            setIsPaymentModalOpen(false); // Close selection modal upon successful checkout creation

            if (mode === 2 && orderData?.razorpay_order) {
                // Online Payment Path
                handleRazorpayPayment(orderData);
            } else {
                // COD Path
                setIsSuccessModalOpen(true);
            }
        } catch (error) {
            console.error("Checkout failed", error);
            setIsPaymentModalOpen(false);
            alert("Checkout failed. Please try again.");
        }
    };

    const handleOrderComplete = () => {
        setIsSuccessModalOpen(false);
        navigate('/orders');
    };

    const handleSaveAddress = (addr: Address) => {
        upsertAddress(addr);
        setEditingAddress(null);
    };

    const handleEditAddress = (addr: Address) => {
        setIsAddrSelectionOpen(false);
        setEditingAddress(addr);
        setIsAddrModalOpen(true);
    };

    const handleAddNewAddress = () => {
        setIsAddrSelectionOpen(false);
        setEditingAddress(null);
        setIsAddrModalOpen(true);
    };

    const itemCount = cartItems.length;

    return (
        <div className="cart-page">
            <Header />

            <div className="cart-page-wrapper">
                {/* Page Title */}
                <div className="cart-page-title">
                    <ShoppingCart size={28} />
                    <h1>My Cart</h1>
                    {itemCount > 0 && (
                        <span className="cart-item-count">{itemCount} item{itemCount > 1 ? 's' : ''}</span>
                    )}
                    {itemCount > 0 && (
                        <button className="clear-all-btn" onClick={() => clearCart()}>
                            <Trash2 size={14} />
                            Clear All
                        </button>
                    )}
                </div>

                {cartItems.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="cart-empty-state"
                    >
                        <div className="empty-icon">🛒</div>
                        <h2>Your cart is empty</h2>
                        <p>Looks like you haven't added any medicines yet.</p>
                        <button className="shop-now-btn" onClick={() => navigate('/medicines')}>
                            Start Shopping
                        </button>
                    </motion.div>
                ) : (
                    <div className="cart-layout">
                        {/* Left Column — Items */}
                        <div className="cart-items-col">
                            {/* Address Bar */}
                            <div className="cart-address-bar">
                                <div className="addr-bar-left">
                                    <MapPin size={16} />
                                    <div className="addr-bar-info">
                                        <span className="addr-bar-label">Deliver to</span>
                                        <span className="addr-bar-text">
                                            {displayAddress
                                                ? `${displayAddress.address_type || displayAddress.type || 'Address'} — ${(displayAddress.full_address || displayAddress.text || '').slice(0, 60)}...`
                                                : 'No address selected'
                                            }
                                        </span>
                                    </div>
                                </div>
                                <button className="addr-change-btn" onClick={() => setIsAddrSelectionOpen(true)}>Change</button>
                            </div>

                            {/* Item Groups by Retailer */}
                            {Object.entries(groupedItems).map(([retailerId, group]: [string, any], groupIndex) => {
                                const retailer = group.retailer || {};
                                const items = group.items || group;
                                const deliveryInfo = deliveryFees.find((d: any) => String(d.retailer_id) === String(retailerId));

                                return (
                                    <div key={retailerId} className="cart-retailer-card">
                                        {/* Retailer Header */}
                                        <div className="retailer-header">
                                            <div className="retailer-name">
                                                <Store size={16} />
                                                <h3>{retailer.shop_name || deliveryInfo?.retailer_name || 'HeloStore'}</h3>
                                            </div>
                                            {deliveryInfo && (
                                                <div className="retailer-delivery-badges">
                                                    <span className="delivery-badge time">
                                                        <Clock size={12} />
                                                        {deliveryInfo.estimated_time}
                                                    </span>
                                                    <span className="delivery-badge distance">{deliveryInfo.distance_km} km</span>
                                                    <span className="delivery-badge fee">₹{deliveryInfo.delivery_fee}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Items */}
                                        <div className="cart-items-list">
                                            {(Array.isArray(items) ? items : []).map((item: any, index: number) => (
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: (groupIndex * 0.15) + (index * 0.05) }}
                                                    className="cart-item-card"
                                                >
                                                    <div className="ci-image" onClick={() => navigate(`/product/${item.product_id || item.id}`)}>
                                                        {item.image ? (
                                                            <img src={item.image} alt={item.name} />
                                                        ) : (
                                                            <div className="ci-placeholder"><Package size={22} /></div>
                                                        )}
                                                        {item.requires_prescription && (
                                                            <span className="ci-rx">Rx</span>
                                                        )}
                                                    </div>

                                                    <div className="ci-details">
                                                        <h4 className="ci-name" onClick={() => navigate(`/product/${item.product_id || item.id}`)}>{item.name}</h4>
                                                        {item.brand_name && <span className="ci-brand">{item.brand_name}</span>}
                                                        <span className="ci-meta">
                                                            {item.pack_size ? `Pack of ${item.pack_size}` : (item.weight || 'Standard Pack')}
                                                            {item.salt_composition && ` · ${item.salt_composition}`}
                                                        </span>

                                                        <div className="ci-actions">
                                                            <div className="ci-qty">
                                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={14} /></button>
                                                                <span>{item.quantity}</span>
                                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={14} /></button>
                                                            </div>
                                                            <button className="ci-remove" onClick={() => removeFromCart(item.id)}>
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="ci-price">
                                                        <span className="ci-price-now">₹{(item.subtotal || item.price * item.quantity).toFixed(0)}</span>
                                                        {item.originalPrice && item.originalPrice > item.price && (
                                                            <span className="ci-price-mrp">₹{(item.originalPrice * item.quantity).toFixed(0)}</span>
                                                        )}
                                                        {item.discount && item.discount > 0 && (
                                                            <span className="ci-discount">{item.discount}% off</span>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Add More */}
                            <button className="add-more-btn" onClick={() => navigate('/medicines')}>
                                <Plus size={18} />
                                <span>Add more items</span>
                            </button>
                        </div>

                        {/* Right Column — Summary */}
                        <div className="cart-summary-col">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="summary-card"
                            >
                                <div className="sc-header">
                                    <Receipt size={18} />
                                    <h3>Order Summary</h3>
                                </div>

                                {/* Delivery Info */}
                                {deliveryFees.length > 0 && (
                                    <div className="sc-delivery-section">
                                        {deliveryFees.map((df: any) => (
                                            <div key={df.retailer_id} className="sc-delivery-row">
                                                <div className="sc-del-left">
                                                    <Truck size={14} />
                                                    <span>{df.retailer_name}</span>
                                                </div>
                                                <div className="sc-del-right">
                                                    <span className="sc-del-time"><Clock size={11} /> {df.estimated_time}</span>
                                                    <span className="sc-del-dist">{df.distance_km} km</span>
                                                    <span className="sc-del-fee">₹{df.delivery_fee}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Free delivery banner */}
                                <div className="sc-promo-banner">
                                    <Sparkles size={14} />
                                    <span>Free Delivery on orders above ₹800</span>
                                </div>

                                {/* Price Breakdown — matching Orders page style */}
                                <div className="sc-breakdown">
                                    {totalMrp > 0 && (
                                        <div className="sc-row">
                                            <span>Total MRP</span>
                                            <span>₹{totalMrp.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {discount > 0 && (
                                        <div className="sc-row sc-discount">
                                            <span><Tag size={12} /> Discount</span>
                                            <span className="sc-val-green">-₹{discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="sc-row">
                                        <span>MRP After Discount</span>
                                        <span>₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="sc-row">
                                        <span><Truck size={12} /> Delivery Fee</span>
                                        {totalDeliveryFee > 0 ? (
                                            <span>₹{totalDeliveryFee.toFixed(2)}</span>
                                        ) : (
                                            <span className="sc-val-free">FREE</span>
                                        )}
                                    </div>
                                    {taxesAndFee > 0 && (
                                        <div className="sc-row">
                                            <span>Taxes & Fee</span>
                                            <span>₹{taxesAndFee.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Prescription Section */}
                                {requiresPrescription && (
                                    <div className="sc-prescription-section">
                                        <div className="sc-rx-header">
                                            <FileText size={16} className="sc-rx-icon" />
                                            <span>Prescription Required</span>
                                        </div>
                                        <p className="sc-rx-desc">One or more items in your cart require a valid prescription.</p>
                                        
                                        {!uploadedRxUrl ? (
                                            <div className="sc-rx-upload-area">
                                                <input 
                                                    type="file" 
                                                    id="rx-upload" 
                                                    accept="image/jpeg, image/jpg, image/png, image/webp" 
                                                    onChange={handlePrescriptionUpload}
                                                    disabled={isUploadingRx}
                                                    style={{ display: 'none' }}
                                                />
                                                <label htmlFor="rx-upload" className={`sc-rx-upload-btn ${isUploadingRx ? 'uploading' : ''}`}>
                                                    {isUploadingRx ? (
                                                        <span>Uploading...</span>
                                                    ) : (
                                                        <>
                                                            <UploadCloud size={16} />
                                                            <span>Upload Prescription</span>
                                                        </>
                                                    )}
                                                </label>
                                            </div>
                                        ) : (
                                            <div className="sc-rx-success">
                                                <div className="sc-rx-success-left">
                                                    <CheckCircle size={16} />
                                                    <span className="sc-rx-filename">{prescriptionFile?.name || 'Prescription Uploaded'}</span>
                                                </div>
                                                <button className="sc-rx-remove" onClick={() => { setUploadedRxUrl(null); setPrescriptionFile(null); }}>
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Total */}
                                <div className="sc-total-section">
                                    <div className="sc-total-row">
                                        <span>Total Amount</span>
                                        <span>₹{totalAmount.toFixed(2)}</span>
                                    </div>
                                    
                                    {/* Payment Options */}
                                    <div className="sc-payment-option">
                                        <span>You Pay (Pay Online)</span>
                                        <span className="sc-payment-amount">₹{estimatedPayable.toFixed(2)}</span>
                                    </div>
                                    <div className="sc-payment-option sc-payment-cod">
                                        <span>You Pay (Pay On Delivery) <span className="sc-cod-fee">+₹10</span></span>
                                        <span className="sc-payment-amount">₹{(estimatedPayable + 10).toFixed(2)}</span>
                                    </div>

                                    {discount > 0 && (
                                        <div className="sc-savings-tag">
                                            <Tag size={12} />
                                            <span>You save ₹{discount.toFixed(0)} on this order</span>
                                        </div>
                                    )}
                                </div>

                                {checkoutError && (
                                    <div className="sc-checkout-error">
                                        <AlertCircle size={14} />
                                        <span>{checkoutError}</span>
                                    </div>
                                )}

                                <button
                                    className="sc-checkout-btn"
                                    onClick={handleCheckout}
                                    disabled={cartItems.length === 0}
                                >
                                    <span>Continue to Payment</span>
                                    <ChevronRight size={18} />
                                </button>
                            </motion.div>
                        </div>
                    </div>
                )}
            </div>

            {/* Sticky Mobile Footer */}
            {cartItems.length > 0 && (
                <div className="cart-mobile-footer">
                    <div className="mobile-footer-info">
                        <span className="footer-label">Total Amount</span>
                        <span className="footer-amount">₹{estimatedPayable.toFixed(2)}</span>
                    </div>
                    <button
                        className="mobile-footer-btn"
                        onClick={handleCheckout}
                    >
                        <span>Continue</span>
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}

            <PaymentSelectionModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onConfirm={onPaymentSelectionConfirm}
                amount={estimatedPayable}
                subtotal={subtotal}
                deliveryFee={totalDeliveryFee}
                paymentModes={paymentModes}
                cashHandlingFee={10}
                taxesAndFee={taxesAndFee}
                discount={discount}
            />

            <AddressSelectionModal
                isOpen={isAddrSelectionOpen}
                onClose={() => setIsAddrSelectionOpen(false)}
                onAddNew={handleAddNewAddress}
                onEdit={handleEditAddress}
            />

            <AddressModal
                isOpen={isAddrModalOpen}
                onClose={() => {
                    setIsAddrModalOpen(false);
                    setEditingAddress(null);
                }}
                onSave={handleSaveAddress}
                initialData={editingAddress}
            />

            <OrderSuccessModal
                isOpen={isSuccessModalOpen}
                onClose={handleOrderComplete}
            />
            <Footer />
        </div >
    );
};

export default CartPage;
