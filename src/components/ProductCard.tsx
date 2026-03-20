import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAnimation } from '../context/AnimationContext';
import './ProductCard.css';

interface ProductCardProps {
    id: number;
    name: string;
    weight: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    image?: string;
    color?: string;
    category?: string;
    retailer_id?: number;
    retailer_product_id?: number;
    isWishlistPage?: boolean;
    stock?: number;
}

const ProductCard = ({ id, name, weight, price, originalPrice, discount, color, image, category, retailer_id, retailer_product_id, isWishlistPage, stock }: ProductCardProps) => {
    const navigate = useNavigate();
    const { addToCart, toggleWishlist, isInWishlist, cartItems, updateQuantity } = useCart();
    const { triggerFlyAnimation } = useAnimation();

    const effectiveId = retailer_product_id || id;
    const isWishlisted = isInWishlist(effectiveId);
    const cartItem = cartItems.find(item => (item.product_id ?? item.id) === id);
    const quantity = cartItem?.quantity || 0;
    const productImage = image || '';

    const handleWishlist = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleWishlist(effectiveId);
        if (!isWishlisted) {
            triggerFlyAnimation({ image: productImage, targetType: 'wishlist' }, e.currentTarget as HTMLElement);
        }
    };

    const handleAdd = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (stock !== undefined && stock <= 0) return;
        addToCart({
            id,
            name,
            price,
            originalPrice,
            weight,
            image: productImage,
            retailer_id,
            retailer_product_id
        });
        triggerFlyAnimation({ image: productImage, targetType: 'cart' }, e.currentTarget as HTMLElement);
    };

    return (
        <motion.div
            whileHover={{ y: -8 }}
            className="product-card"
            onClick={() => navigate(`/product/${id}`)}
            style={{ cursor: 'pointer' }}
        >
            <div className={`card-image-wrapper ${!productImage ? 'has-placeholder' : ''}`} style={{ backgroundColor: color || 'var(--surface-color)' }}>
                {discount && (
                    <div className="discount-tag">
                        -{discount}%
                    </div>
                )}
                <button
                    className={`wishlist-trigger ${isWishlisted ? 'active' : ''}`}
                    onClick={handleWishlist}
                >
                    <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
                </button>
                {productImage ? (
                    <img
                        src={productImage}
                        alt={name}
                        className="product-image"
                    />
                ) : (
                    <div className="product-placeholder">
                        <Plus size={32} className="placeholder-icon" />
                    </div>
                )}
            </div>

            <div className="card-info">
                <div className="card-category">{category || 'Wellness Essentials'}</div>
                <h3 className="card-title">{name}</h3>
                <p className="card-meta">{weight}</p>

                <div className="card-footer">
                    <div className="card-pricing">
                        <span className="current-price">₹{price}</span>
                        {originalPrice && (
                            <span className="old-price">₹{originalPrice}</span>
                        )}
                    </div>

                    {quantity === 0 ? (
                        <div className="card-actions-row">
                            {isWishlistPage && (
                                <button className="remove-wishlist-btn" onClick={handleWishlist}>
                                    REMOVE
                                </button>
                            )}
                            {stock !== undefined && stock <= 0 ? (
                                <button className="add-cart-circle disabled" disabled style={{ opacity: 0.5, cursor: 'not-allowed', background: '#ccc' }} onClick={(e) => e.stopPropagation()}>
                                    <Plus size={20} />
                                </button>
                            ) : (
                                <button className="add-cart-circle" onClick={handleAdd}>
                                    <Plus size={20} />
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="card-qty-selector" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => updateQuantity(cartItems.find(item => (item.product_id ?? item.id) === id)!.id, quantity - 1)}>
                                <Minus size={14} />
                            </button>
                            <span>{quantity}</span>
                            <button onClick={() => updateQuantity(cartItems.find(item => (item.product_id ?? item.id) === id)!.id, quantity + 1)}>
                                <Plus size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
