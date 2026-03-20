import { ShoppingBag, Bell, X, CreditCard, Tag, Info, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './NotificationModal.css';

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationModal = ({ isOpen, onClose }: NotificationModalProps) => {
    const { notifications, clearNotifications, markNotificationsAsRead } = useCart();

    if (!isOpen) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'order':
                return ShoppingBag;
            case 'payment':
                return CreditCard;
            case 'offer':
                return Tag;
            default:
                return Info;
        }
    };

    const getIconStyle = (type: string) => {
        switch (type) {
            case 'order':
                return { bg: '#e0f2f1', color: '#00897b' };
            case 'payment':
                return { bg: '#e8f5e9', color: '#2e7d32' };
            case 'offer':
                return { bg: '#e0f2f1', color: '#00796b' };
            default:
                return { bg: '#e3f2fd', color: '#1976d2' };
        }
    };

    const handleClearAll = () => {
        clearNotifications();
    };

    const handleClose = () => {
        markNotificationsAsRead();
        onClose();
    };

    return (
        <>
            <div className="notification-overlay" onClick={handleClose} />
            <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
                <div className="notification-modal-header">
                    <h2>Notifications</h2>
                    <div className="notification-header-actions">
                        {notifications.length > 0 && (
                            <button className="clear-all-btn" onClick={handleClearAll}>
                                <Trash2 size={16} />
                                Clear All
                            </button>
                        )}
                        <button className="close-modal-btn" onClick={handleClose}>
                            <X size={20} />
                        </button>
                    </div>
                </div>
                <div className="notification-modal-content">
                    {notifications.length === 0 ? (
                        <div className="notifications-empty">
                            <Bell size={48} strokeWidth={1} />
                            <p>No notifications yet</p>
                        </div>
                    ) : (
                        notifications.map((notification) => {
                            const IconComponent = getIcon(notification.type);
                            const iconStyle = getIconStyle(notification.type);
                            return (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                >
                                    <div
                                        className="notification-item-icon"
                                        style={{ backgroundColor: iconStyle.bg }}
                                    >
                                        <IconComponent size={20} color={iconStyle.color} />
                                    </div>
                                    <div className="notification-item-details">
                                        <div className="notification-item-header">
                                            <h3>{notification.title}</h3>
                                            <span className="notification-item-time">{notification.date}</span>
                                        </div>
                                        <p className="notification-item-message">{notification.message}</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationModal;
