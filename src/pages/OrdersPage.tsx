import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { RotateCcw, Package, FileText } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart, type Order } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ORDER_STATUS, ORDER_STATUS_LABELS } from '../constants';
import { generateInvoice } from '../utils/invoiceGenerator';
import './OrdersPage.css';

const OrdersPage = () => {
    const navigate = useNavigate();
    const { orders, addresses } = useCart();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [timeFilter, setTimeFilter] = useState('all');
    const [customMonth, setCustomMonth] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const userName = user?.name || user?.first_name || 'Customer';

    const handleDownloadInvoice = async (order: Order) => {
        const orderAddress = addresses.find(addr => String(addr.id) === String(order.address_id));
        
        await generateInvoice({
            order,
            customerName: userName,
            address: orderAddress,
            companyInfo: {
                name: 'Udi Digi Swasthyatech Private Limited',
                address: 'Plot No-9429, Elegance Society, NH-316, Puri Bypass Road, Unit-35, Near SR Valley Mandap, Bhubaneswar, Odisha, 751018',
                email: 'support@helomed.in',
                phone: '+1800-121-9102'
            }
        });
    };

    const getPastMonths = () => {
        const months = [];
        for (let i = 0; i < 6; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const label = d.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
            const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            months.push({ label, value });
        }
        return months;
    };
    const pastMonths = useMemo(getPastMonths, []);

    const filteredOrders = useMemo(() => {
        let filtered = orders;
        if (activeTab !== 'All') {
            filtered = filtered.filter(order => order.status === activeTab);
        }

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        if (timeFilter === 'current') {
            filtered = filtered.filter(order => {
                const d = new Date(order.created_at || order.date || '');
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            });
        } else if (timeFilter === 'last') {
            filtered = filtered.filter(order => {
                const d = new Date(order.created_at || order.date || '');
                let lastMonth = currentMonth - 1;
                let refYear = currentYear;
                if (lastMonth < 0) { lastMonth = 11; refYear -= 1; }
                return d.getMonth() === lastMonth && d.getFullYear() === refYear;
            });
        } else if (timeFilter === 'custom' && customMonth) {
            const [y, m] = customMonth.split('-');
            filtered = filtered.filter(order => {
                const d = new Date(order.created_at || order.date || '');
                return d.getFullYear() === parseInt(y, 10) && (d.getMonth() + 1) === parseInt(m, 10);
            });
        } else if (timeFilter === 'all') {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            filtered = filtered.filter(order => {
                const d = new Date(order.created_at || order.date || '');
                return d >= sixMonthsAgo;
            });
        }
        return filtered;
    }, [orders, activeTab, timeFilter, customMonth]);

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredOrders, currentPage, itemsPerPage]);

    // Reset to page 1 when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [activeTab, timeFilter, customMonth]);

    const formatAmazonDate = (dateStr?: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const getPaymentModeLabel = (mode?: number) => {
        if (mode === 2) return 'Pay Online';
        return 'Pay on Delivery';
    };

    const renderOrderTimeline = (statusId?: number) => {
        const currentSid = statusId ?? 0;
        if ([3, 8].includes(currentSid)) return null;

        const steps = [0, 1, 2, 4, 5, 6, 7];
        let currentIndex = steps.findIndex(s => s >= currentSid);
        if (currentIndex === -1) currentIndex = steps.length - 1;

        const totalSegments = Math.max(1, steps.length - 1);
        const progress = Math.min(100, Math.max(0, (currentIndex / totalSegments) * 100));

        return (
            <div className="amz-timeline-container" style={{ '--progress': `${progress}%` } as React.CSSProperties}>
                <div className="amz-timeline-track">
                    <div className="amz-timeline-fill" style={{ height: `${progress}%`, width: `${progress}%` }}></div>
                </div>
                <div className="amz-timeline-steps">
                    {steps.map((stepId, idx) => {
                        const isCompleted = idx < currentIndex;
                        const isCurrent = idx === currentIndex;
                        return (
                            <div className="amz-timeline-step" key={stepId}>
                                <div className={`amz-timeline-dot ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}></div>
                                <div className={`amz-timeline-label ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                                    {ORDER_STATUS_LABELS[stepId] || 'Unknown'}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        );
    };

    const renderListView = () => (
        <>
            <div className="amz-breadcrumbs">
                <span className="amz-link" onClick={() => navigate('/profile')}>Your Account</span> › <span className="amz-current">Your Orders</span>
            </div>
            <div className="amz-header-row">
                <h1>Your Orders</h1>
            </div>
            
            <div className="amz-tabs">
                {['All', 'Pending', 'Active', 'Delivered', 'Cancelled', 'Returned'].map((tab) => (
                    <span 
                        key={tab} 
                        className={`amz-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'All' ? 'Orders' : `${tab} Orders`}
                    </span>
                ))}
            </div>

            <div className="amz-filter-row">
                <span><strong>{filteredOrders.length} orders</strong> placed in</span>
                <select 
                    value={timeFilter === 'custom' ? customMonth : timeFilter} 
                    onChange={(e) => {
                        const val = e.target.value;
                        if (['all', 'current', 'last'].includes(val)) {
                            setTimeFilter(val);
                            setCustomMonth('');
                        } else {
                            setTimeFilter('custom');
                            setCustomMonth(val);
                        }
                    }}
                >
                    <option value="all">past 6 months</option>
                    <option value="current">this month</option>
                    <option disabled>──────────</option>
                    {pastMonths.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                </select>
            </div>

            {filteredOrders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                paginatedOrders.map(order => (
                    <div className="amz-card" key={order.id}>
                        <div className="amz-card-header">
                            <div className="amz-header-left">
                                <div className="amz-hg">
                                    <span className="amz-hg-label">ORDER PLACED</span>
                                    <span className="amz-hg-value">{formatAmazonDate(order.created_at || order.date)}</span>
                                </div>
                                <div className="amz-hg">
                                    <span className="amz-hg-label">TOTAL</span>
                                    <span className="amz-hg-value">₹{order.total.toFixed(2)}</span>
                                </div>
                                <div className="amz-hg">
                                    <span className="amz-hg-label">SHIP TO</span>
                                    <span className="amz-link-text">{userName}</span>
                                </div>
                            </div>
                            <div className="amz-header-right">
                                <div className="amz-hg-label">ORDER # {order.order_number || order.id}</div>
                                <div className="amz-header-links">
                                    {order.order_status_id !== ORDER_STATUS.REJECTED && order.order_status_id !== ORDER_STATUS.CANCELLED && (
                                        <span className="amz-link" onClick={() => handleDownloadInvoice(order)} title="Invoice" style={{ cursor: 'pointer' }}>
                                            <FileText size={18} />
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="amz-card-body">
                            <div className="amz-card-body-wrapper">
                                <div className="amz-items-section">
                                    <div className={`amz-status-big ${order.order_status_id === ORDER_STATUS.REJECTED ? 'rejected' : order.order_status_id === ORDER_STATUS.CANCELLED ? 'cancelled' : ''}`}>
                                        {order.status === 'Delivered' && order.delivered_at 
                                            ? `Delivered ${formatAmazonDate(order.delivered_at)}` 
                                            : ORDER_STATUS_LABELS[order.order_status_id ?? 1] || order.status}
                                    </div>
                                    {order.status === 'Delivered' && <div className="amz-sub-status">Package was handed to resident</div>}
                                    
                                    {order.items.map((item, idx) => (
                                        <div className={`amz-item-row ${order.order_status_id === ORDER_STATUS.REJECTED ? 'rejected' : order.order_status_id === ORDER_STATUS.CANCELLED ? 'cancelled' : ''}`} key={idx}>
                                            <div className="amz-item-image" onClick={() => navigate(`/product/${item.retailer_product_id || item.id}`)}>
                                                {item.image ? <img src={item.image} alt={item.name} /> : <Package size={40} color="#d5d9d9"/>}
                                            </div>
                                            <div className="amz-item-details">
                                                <div className="amz-item-title" onClick={() => navigate(`/product/${item.retailer_product_id || item.id}`)}>{item.name}</div>
                                                <div className="amz-item-seller">Sold by: {item.shop_name || 'HeloMed Retailer'}</div>
                                                <div className="amz-item-price">₹{order.total?.toFixed(2) || '0.00'}</div>
                                                <div className="amz-item-inline-actions">
                                                    {(order.status === 'Delivered' || order.order_status_id === 3) && (
                                                        <button className="amz-btn-primary" onClick={() => navigate(`/product/${item.retailer_product_id || item.id}`)}>
                                                            <RotateCcw size={14}/> Buy it again
                                                        </button>
                                                    )}
                                                    <button className="amz-btn-secondary" onClick={() => setSelectedOrder(order)}>
                                                        View order details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="amz-timeline-section">
                                    {renderOrderTimeline(order.order_status_id)}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}

            {filteredOrders.length > itemsPerPage && (
                <div className="amz-pagination">
                    <button 
                        className="amz-page-btn" 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                    >
                        ‹ Previous
                    </button>
                    
                    <div className="amz-page-numbers">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                            // Show first page, last page, current page, and pages around current
                            if (
                                page === 1 || 
                                page === totalPages || 
                                (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                                return (
                                    <button
                                        key={page}
                                        className={`amz-page-number ${currentPage === page ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                );
                            } else if (page === currentPage - 2 || page === currentPage + 2) {
                                return <span key={page} className="amz-page-ellipsis">...</span>;
                            }
                            return null;
                        })}
                    </div>
                    
                    <button 
                        className="amz-page-btn" 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next ›
                    </button>
                </div>
            )}
        </>
    );

    const renderDetailView = () => {
        if (!selectedOrder) return null;
        const order = selectedOrder;
        const addr = addresses.find(a => String(a.id) === String(order.address_id));

        return (
            <>
                <div className="amz-breadcrumbs">
                    <span className="amz-link" onClick={() => navigate('/profile')}>Your Account</span> › 
                    <span className="amz-link" onClick={() => setSelectedOrder(null)}> Your Orders</span> › 
                    <span className="amz-current"> Order Details</span>
                </div>
                
                <div className="amz-header-row">
                    <h1>Order Details</h1>
                </div>

                <div className="amz-details-top-sub">
                    <div>
                        <span>Ordered on {formatAmazonDate(order.created_at || order.date)}</span>
                        <span className="amz-separator">|</span>
                        <span>Order# {order.order_number || order.id}</span>
                    </div>
                    <div>
                        {selectedOrder.order_status_id !== ORDER_STATUS.REJECTED && selectedOrder.order_status_id !== ORDER_STATUS.CANCELLED && (
                            <span className="amz-link" onClick={() => handleDownloadInvoice(order)} title="Invoice" style={{ cursor: 'pointer' }}>
                                <FileText size={18} />
                            </span>
                        )}
                    </div>
                </div>

                <div className="amz-details-box">
                    <div className="amz-d-col">
                        <h4>Ship to</h4>
                        <p>{userName}</p>
                        <p>{addr?.full_address || addr?.text || 'Address not available'}</p>
                    </div>
                    <div className="amz-d-col">
                        <h4>Payment method</h4>
                        <p>{getPaymentModeLabel(order.payment_mode)}</p>
                    </div>
                    <div className="amz-d-col" style={{flex: 1.2}}>
                        <h4>Order Summary</h4>
                        <div className="amz-sm-line">
                            <span>Item(s) Subtotal:</span> 
                            <span>₹{order.subtotal?.toFixed(2) || order.total.toFixed(2)}</span>
                        </div>
                        <div className="amz-sm-line">
                            <span>Shipping:</span> 
                            <span>₹{order.delivery_fee?.toFixed(2) || '0.00'}</span>
                        </div>
                        {order.taxes_and_fee != null && order.taxes_and_fee > 0 && (
                            <div className="amz-sm-line">
                                <span>Taxes & Fee:</span> 
                                <span>₹{order.taxes_and_fee.toFixed(2)}</span>
                            </div>
                        )}
                        {order.payment_mode !== 2 && (
                            <div className="amz-sm-line">
                                <span>Cash Handling:</span> 
                                <span>₹10.00</span>
                            </div>
                        )}
                        <div className="amz-sm-line bold" style={{marginTop: 8}}>
                            <span>Grand Total:</span> 
                            <span>₹{order.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="amz-card amz-details-items-card">
                    <div className="amz-card-body">
                        <div className={`amz-status-big ${selectedOrder.order_status_id === ORDER_STATUS.REJECTED ? 'rejected' : selectedOrder.order_status_id === ORDER_STATUS.CANCELLED ? 'cancelled' : ''}`}>
                            {order.status === 'Delivered' && order.delivered_at 
                                ? `Delivered ${formatAmazonDate(order.delivered_at)}` 
                                : ORDER_STATUS_LABELS[order.order_status_id ?? 1] || order.status}
                        </div>
                        {order.status === 'Delivered' && <div className="amz-sub-status">Package was handed to resident</div>}
                        
                        {order.items.map((item, idx) => (
                            <div className={`amz-item-row ${selectedOrder.order_status_id === ORDER_STATUS.REJECTED ? 'rejected' : selectedOrder.order_status_id === ORDER_STATUS.CANCELLED ? 'cancelled' : ''}`} key={idx}>
                                <div className="amz-item-image" onClick={() => navigate(`/product/${item.retailer_product_id || item.id}`)}>
                                    {item.image ? <img src={item.image} alt={item.name} /> : <Package size={40} color="#d5d9d9"/>}
                                </div>
                                <div className="amz-item-details">
                                    <div className="amz-item-title" onClick={() => navigate(`/product/${item.retailer_product_id || item.id}`)}>{item.name}</div>
                                    <div className="amz-item-seller">Sold by: {item.shop_name || 'HeloMed Retailer'}</div>
                                    <div className="amz-item-price">₹{order.total?.toFixed(2) || '0.00'}</div>
                                    <div className="amz-item-inline-actions">
                                        {(order.status === 'Delivered' || order.order_status_id === 3) && (
                                            <button className="amz-btn-primary" onClick={() => navigate(`/product/${item.retailer_product_id || item.id}`)}>
                                                <RotateCcw size={14}/> Buy it again
                                            </button>
                                        )}
                                        {/* View your item removed as per request, just use title/image click */}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className="amz-orders-container">
            <Header />
            <div className="amz-main-content">
                {selectedOrder ? renderDetailView() : renderListView()}
            </div>
            <Footer />
        </div>
    );
};

export default OrdersPage;
