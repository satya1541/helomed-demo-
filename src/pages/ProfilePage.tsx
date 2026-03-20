import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { LogOut, Package, MapPin, Edit2, Trash2, ChevronRight, Phone, Mail, Calendar, User, Shield, Bell, Pencil, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/auth';
import { useCart } from '../context/CartContext';
import type { Address } from '../context/CartContext';
import AddressModal from '../components/AddressModal';
import { ORDER_STATUS } from '../constants';
import './ProfilePage.css';
import logoAbha from '../assets/logo-abha.png';
import { resolveImageUrl } from '../api/products';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { logout, user, refreshProfile } = useAuth();
    const { orders, addresses, upsertAddress, removeAddress } = useCart();

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<{
        name: string;
        email: string;
        date_of_birth: string;
        gender: string;
        profile_picture: File | null;
    }>({
        name: user?.name || '',
        email: user?.email || '',
        date_of_birth: user?.date_of_birth || '',
        gender: user?.gender || '',
        profile_picture: null
    });

    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [marketingEmails, setMarketingEmails] = useState(true);
    const [whatsappNotifs, setWhatsappNotifs] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', editForm.name);
            formData.append('email', editForm.email);
            formData.append('date_of_birth', editForm.date_of_birth);
            formData.append('gender', String(editForm.gender));
            if (editForm.profile_picture) {
                formData.append('profile_picture', editForm.profile_picture);
            }

            await updateProfile(formData);
            await refreshProfile();
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile. Please try again.");
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setEditForm({ ...editForm, profile_picture: file });
        }
    };

    const handleEditAddress = (addr: Address) => {
        setSelectedAddress(addr);
        setIsAddressModalOpen(true);
    };

    const handleAddNewAddress = () => {
        setSelectedAddress(null);
        setIsAddressModalOpen(true);
    };

    const handleSaveAddress = (addr: Address) => {
        upsertAddress(addr);
    };

    const getGenderLabel = (g: any) => {
        if (g === 1 || g === '1') return 'Male';
        if (g === 2 || g === '2') return 'Female';
        return g || 'Not set';
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Active': return 'status-active';
            case 'Delivered': return 'status-delivered';
            case 'Cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    // Calculate order statistics
    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(order => order.order_status_id === ORDER_STATUS.DELIVERED).length;

    const profileImageUrl = editForm.profile_picture 
        ? URL.createObjectURL(editForm.profile_picture) 
        : (user?.profile_picture ? resolveImageUrl(user.profile_picture) : null);

    return (
        <>
            <Header />
            <div className="profile-page">
                <div className="profile-wrapper">
                    {/* Page Title */}
                    <div className="profile-page-title">
                        <User size={28} />
                        <h1>My Account</h1>
                    </div>



                    <div className="profile-grid">
                        {/* LEFT COLUMN */}
                        <div className="profile-left">
                            {/* Profile Details Card */}
                            <motion.div
                                className="p-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="pc-header">
                                    <div className="pc-header-left">
                                        <Shield size={16} />
                                        <h3>Profile Details</h3>
                                    </div>
                                    {!isEditing && (
                                        <button className="pc-edit-btn" onClick={() => setIsEditing(true)}>
                                            <Pencil size={13} />
                                            Edit
                                        </button>
                                    )}
                                </div>

                                <div className="pc-avatar-section">
                                    <div className="pc-avatar-wrapper">
                                        <div className="pc-avatar">
                                            {profileImageUrl ? (
                                                <img src={profileImageUrl} alt="Profile" />
                                            ) : (
                                                <User size={40} className="pc-avatar-fallback" />
                                            )}
                                        </div>
                                        {isEditing && (
                                            <label htmlFor="profile-upload" className="pc-avatar-edit">
                                                <Camera size={14} />
                                                <input 
                                                    type="file" 
                                                    id="profile-upload" 
                                                    accept="image/jpeg, image/jpg, image/png, image/webp" 
                                                    onChange={handlePhotoChange}
                                                    style={{ display: 'none' }}
                                                />
                                            </label>
                                        )}
                                    </div>
                                    <div className="pc-avatar-info">
                                        <h2>{user?.name || 'Helo User'}</h2>
                                        <p>{user?.phone ? `+91 ${user.phone}` : ''}</p>
                                    </div>
                                </div>

                                {!isEditing ? (
                                    <div className="pc-info-list">
                                        <div className="pc-info-row">
                                            <div className="pc-info-icon"><User size={16} /></div>
                                            <div className="pc-info-data">
                                                <span className="pc-label">Full Name</span>
                                                <span className="pc-value">{user?.name || 'Helo User'}</span>
                                            </div>
                                        </div>
                                        <div className="pc-info-row">
                                            <div className="pc-info-icon"><Phone size={16} /></div>
                                            <div className="pc-info-data">
                                                <span className="pc-label">Mobile</span>
                                                <span className="pc-value">+91 {user?.phone}</span>
                                            </div>
                                        </div>
                                        <div className="pc-info-row">
                                            <div className="pc-info-icon"><Mail size={16} /></div>
                                            <div className="pc-info-data">
                                                <span className="pc-label">Email</span>
                                                <span className="pc-value">{user?.email || 'Not added'}</span>
                                            </div>
                                        </div>
                                        <div className="pc-info-row">
                                            <div className="pc-info-icon"><User size={16} /></div>
                                            <div className="pc-info-data">
                                                <span className="pc-label">Gender</span>
                                                <span className="pc-value">{getGenderLabel(user?.gender)}</span>
                                            </div>
                                        </div>
                                        <div className="pc-info-row">
                                            <div className="pc-info-icon"><Calendar size={16} /></div>
                                            <div className="pc-info-data">
                                                <span className="pc-label">Date of Birth</span>
                                                <span className="pc-value">{user?.date_of_birth || 'Not added'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <form className="pc-edit-form" onSubmit={handleUpdateProfile}>
                                        <div className="pf-group">
                                            <label>Name</label>
                                            <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                                        </div>
                                        <div className="pf-group">
                                            <label>Email</label>
                                            <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                                        </div>
                                        <div className="pf-row-2">
                                            <div className="pf-group">
                                                <label>Date of Birth</label>
                                                <input type="date" value={editForm.date_of_birth} onChange={e => setEditForm({ ...editForm, date_of_birth: e.target.value })} />
                                            </div>
                                            <div className="pf-group">
                                                <label>Gender</label>
                                                <select value={editForm.gender} onChange={e => setEditForm({ ...editForm, gender: e.target.value })}>
                                                    <option value="">Select</option>
                                                    <option value="1">Male</option>
                                                    <option value="2">Female</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="pf-actions">
                                            <button type="button" className="pf-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                                            <button type="submit" className="pf-save">Save Changes</button>
                                        </div>
                                    </form>
                                )}
                            </motion.div>

                            {/* Addresses Card */}
                            <motion.div
                                className="p-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                            >
                                <div className="pc-header">
                                    <div className="pc-header-left">
                                        <MapPin size={16} />
                                        <h3>Saved Addresses</h3>
                                    </div>
                                    <button className="pc-edit-btn" onClick={handleAddNewAddress}>+ Add New</button>
                                </div>
                                <div className="pc-addr-list">
                                    {addresses.length > 0 ? addresses.map(addr => (
                                        <div key={addr.id} className="pc-addr-row">
                                            <div className="pc-addr-icon"><MapPin size={15} /></div>
                                            <div className="pc-addr-info">
                                                <div className="pc-addr-top">
                                                    <span className="pc-addr-type">{addr.type}</span>
                                                    {addr.is_default && <span className="pc-addr-default">Default</span>}
                                                </div>
                                                <p className="pc-addr-text">{addr.full_address || addr.text}</p>
                                                {addr.pincode && <span className="pc-addr-meta">PIN: {addr.pincode}</span>}
                                            </div>
                                            <div className="pc-addr-actions">
                                                <button className="pa-btn edit" onClick={() => handleEditAddress(addr)}><Edit2 size={14} /></button>
                                                <button className="pa-btn delete" onClick={() => removeAddress(addr.id)}><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="pc-empty">No saved addresses. Add one to get started.</p>
                                    )}
                                </div>
                            </motion.div>

                            {/* Recent Orders */}
                            <motion.div
                                className="p-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="pc-header">
                                    <div className="pc-header-left">
                                        <Package size={16} />
                                        <h3>Recent Orders</h3>
                                    </div>
                                    {orders.length > 0 && (
                                        <button className="pc-edit-btn" onClick={() => navigate('/orders')}>View All</button>
                                    )}
                                </div>
                                <div className="pc-orders-list">
                                    {orders.slice(0, 3).map(order => (
                                        <div key={order.id} className="pc-order-row" onClick={() => navigate('/orders')}>
                                            <div className="pc-order-icon"><Package size={16} /></div>
                                            <div className="pc-order-info">
                                                <span className="pc-order-id">{order.order_number || `#${order.id}`}</span>
                                                <span className="pc-order-date">{order.date}</span>
                                            </div>
                                            <div className="pc-order-right">
                                                <span className="pc-order-total">₹{order.total.toFixed(0)}</span>
                                                <span className={`pc-order-status ${getStatusClass(order.status)}`}>{order.status}</span>
                                            </div>
                                            <ChevronRight size={14} className="pc-order-arrow" />
                                        </div>
                                    ))}
                                    {orders.length === 0 && <p className="pc-empty">No orders yet. Start shopping!</p>}
                                </div>
                            </motion.div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="profile-right">
                            {/* ABHA Special Card */}
                            <motion.div
                                className="abha-profile-card"
                                onClick={() => navigate('/abha')}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="abha-pc-left">
                                    <div className="abha-pc-icon">
                                        <img src={logoAbha} alt="ABHA Logo" />
                                    </div>
                                    <div className="abha-pc-info">
                                        <span className="abha-pc-label">ABHA ID</span>
                                        <span className="abha-pc-title">Create ABHA Number</span>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="abha-pc-arrow" />
                            </motion.div>

                            {/* Wallet Card */}
                            {/* 
                            <motion.div
                                className="p-card wallet-card-big"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="wc-top">
                                    <Award size={32} />
                                    <h3>HeloCoins</h3>
                                </div>
                                <div className="wc-balance">
                                    <span className="wc-amount">{walletBalance}</span>
                                    <span className="wc-label">Available Coins</span>
                                </div>
                                <p className="wc-note">Earn coins on every order. Use them for discounts!</p>
                            </motion.div>
                            */}

                            {/* Settings Card */}
                            <motion.div
                                className="p-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                            >
                                <div className="pc-header">
                                    <div className="pc-header-left">
                                        <Bell size={16} />
                                        <h3>Notifications</h3>
                                    </div>
                                </div>
                                
                                {/* Order Statistics */}
                                <div className="pc-order-stats">
                                    <div className="pc-stat-item">
                                        <Package size={18} className="pc-stat-icon" />
                                        <div className="pc-stat-info">
                                            <h4>{totalOrders}</h4>
                                            <p>Total Orders</p>
                                        </div>
                                    </div>
                                    <div className="pc-stat-item">
                                        <Package size={18} className="pc-stat-icon" style={{ color: '#27ae60' }} />
                                        <div className="pc-stat-info">
                                            <h4>{deliveredOrders}</h4>
                                            <p>Delivered</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pc-settings-list">
                                    <div className="pc-setting-row">
                                        <div className="ps-info">
                                            <h4>Marketing Emails</h4>
                                            <p>Offers and medical updates</p>
                                        </div>
                                        <label className="toggle-switch">
                                            <input type="checkbox" checked={marketingEmails} onChange={(e) => setMarketingEmails(e.target.checked)} />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                    <div className="pc-setting-row">
                                        <div className="ps-info">
                                            <h4>WhatsApp Updates</h4>
                                            <p>Order updates on WhatsApp</p>
                                        </div>
                                        <label className="toggle-switch">
                                            <input type="checkbox" checked={whatsappNotifs} onChange={(e) => setWhatsappNotifs(e.target.checked)} />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Logout */}
                            <button className="logout-btn" onClick={handleLogout}>
                                <LogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>

                <AddressModal
                    isOpen={isAddressModalOpen}
                    onClose={() => setIsAddressModalOpen(false)}
                    onSave={handleSaveAddress}
                    initialData={selectedAddress}
                />
            </div >
            <Footer />
        </>
    );
};

export default ProfilePage;
