import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Heart, ShieldCheck, Star, Store, MapPin, Package, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import { useAnimation } from '../context/AnimationContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductSection from '../components/ProductSection';
import ProductCard from '../components/ProductCard';
import { getProductById, getAllProducts } from '../api/products';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, toggleWishlist, isInWishlist, cartItems, updateQuantity } = useCart();
    const { showToast } = useToast();
    const { triggerFlyAnimation } = useAnimation();
    const [product, setProduct] = useState<any | null>(null);
    const [similarProducts, setSimilarProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProductData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                let productData = await getProductById(id);
                const allProducts = await getAllProducts();

                if (!productData && Array.isArray(allProducts)) {
                    productData = allProducts.find((p: any) => String(p.id) === String(id)) || null;
                }

                setProduct(productData);

                if (Array.isArray(allProducts) && productData) {
                    const similar = allProducts
                        .filter((p: any) => p.category === productData.category && p.id !== productData.id)
                        .slice(0, 4);
                    setSimilarProducts(similar);
                }
            } catch (error) {
                console.error("Failed to fetch product details", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return (
            <div className="pd-page">
                <Header />
                <div className="pd-loading"><div className="loader"></div></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="pd-page">
                <Header />
                <div className="pd-wrapper">
                    <div className="pd-not-found">
                        <Package size={48} />
                        <h2>Product Not Found</h2>
                        <p>This product may have been removed or the link is incorrect.</p>
                        <button className="pd-back-btn" onClick={() => navigate('/medicines')}>Back to Medicines</button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const effectiveId = product ? (product.retailer_product_id || product.id) : 0;
    const isWishlisted = isInWishlist(effectiveId);
    const cartItem = cartItems.find(item => (item.product_id ?? item.id) === product.id);
    const quantity = cartItem?.quantity || 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        if (product.stock <= 0) {
            showToast("This item is currently out of stock");
            return;
        }

        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice || product.price,
            discount: product.discount || 0,
            image: product.image,
            weight: product.weight || 'Standard Pack',
            retailer_id: product.retailer_id
        });
        triggerFlyAnimation({ image: product.image, targetType: 'cart' }, e.currentTarget as HTMLElement);
    };

    const handleWishlist = (e: React.MouseEvent) => {
        toggleWishlist(effectiveId);
        if (!isWishlisted) {
            triggerFlyAnimation({ image: product.image, targetType: 'wishlist' }, e.currentTarget as HTMLElement);
        } else {
            showToast('Removed from Wishlist', product.name);
        }
    };

    return (
        <div className="pd-page">
            <Header />

            <div className="pd-wrapper">
                {/* Breadcrumb */}
                <div className="pd-breadcrumb">
                    <button className="pd-back" onClick={() => navigate(-1)}>
                        <ArrowLeft size={16} />
                    </button>
                    <span className="pd-crumb">{product.category}</span>
                    <ChevronRight size={12} />
                    <span className="pd-crumb-current">{product.name}</span>
                </div>

                <div className="pd-main-grid">
                    {/* Image Card */}
                    <motion.div
                        className="pd-image-card"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        {product.discount > 0 && (
                            <span className="pd-discount-tag">-{product.discount}%</span>
                        )}
                        <button
                            className={`pd-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                            onClick={handleWishlist}
                        >
                            <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                        </button>
                        <div className="pd-image-area">
                            <img src={product.image} alt={product.name} />
                        </div>
                    </motion.div>

                    {/* Info Panel */}
                    <div className="pd-info-panel">
                        {/* Header */}
                        <div className="pd-info-card">
                            <div className="pd-badges-row">
                                <span className="pd-category-badge">{product.category}</span>
                                {product.requires_prescription && (
                                    <span className="pd-rx-badge"><ShieldCheck size={12} /> Rx Required</span>
                                )}
                            </div>
                            <h1 className="pd-product-name">{product.name}</h1>
                            {product.brand_name && <p className="pd-brand">By {product.brand_name}</p>}
                            {product.salt_composition && <p className="pd-salt">Composition: {product.salt_composition}</p>}
                            <div className="pd-rating">
                                <div className="pd-stars">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="#FFB800" color="#FFB800" />)}
                                </div>
                                <span>4.8 • 120 reviews</span>
                            </div>
                        </div>

                        {/* Price Card */}
                        <div className="pd-info-card pd-price-card">
                            <div className="pd-price-row">
                                <span className="pd-price">₹{product.price}</span>
                                {product.originalPrice && (
                                    <span className="pd-original">₹{product.originalPrice}</span>
                                )}
                                {product.discount > 0 && (
                                    <span className="pd-save-tag">{product.discount}% off</span>
                                )}
                            </div>
                            <div className="pd-meta-row">
                                {product.weight && <span className="pd-weight">{product.weight}</span>}
                                <span className={`pd-stock ${product.stock > 0 ? 'in' : 'out'}`}>
                                    {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                                </span>
                            </div>

                            {/* Add to Cart */}
                            <div className="pd-action-row">
                                {product.stock <= 0 ? (
                                    <button className="pd-add-cart disabled" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                                        <ShoppingCart size={18} />
                                        Out of Stock
                                    </button>
                                ) : quantity === 0 ? (
                                    <button className="pd-add-cart" onClick={handleAddToCart}>
                                        <ShoppingCart size={18} />
                                        Add to Cart
                                    </button>
                                ) : (
                                    <div className="pd-qty-control">
                                        <button onClick={() => updateQuantity(cartItem!.id, quantity - 1)}>−</button>
                                        <span>{quantity}</span>
                                        <button onClick={() => updateQuantity(cartItem!.id, quantity + 1)}>+</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="pd-info-card">
                                <h3 className="pd-section-title">Product Overview</h3>
                                <p className="pd-description">{product.description}</p>
                            </div>
                        )}

                        {/* Retailer */}
                        {product.shop_name && (
                            <div className="pd-info-card pd-retailer">
                                <div className="pd-retailer-row">
                                    <Store size={16} />
                                    <span className="pd-retailer-label">Sold by</span>
                                </div>
                                <h4 className="pd-shop-name">{product.shop_name}</h4>
                                {product.full_address && (
                                    <div className="pd-addr-row">
                                        <MapPin size={13} />
                                        <span>{product.full_address}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Similar Products */}
                {similarProducts.length > 0 && (
                    <ProductSection title="More from this category" subtitle="Explore similar wellness solutions.">
                        {similarProducts.map((p: any) => (
                            <ProductCard key={p.id} {...p} />
                        ))}
                    </ProductSection>
                )}
            </div>

            <Footer />

            {/* Sticky Mobile Footer */}
            <div className="pd-mobile-footer">
                <div className="pdmf-info">
                    <span className="pdmf-price">₹{product.price}</span>
                    <span className="pdmf-label">per {product.weight || 'unit'}</span>
                </div>
                <div className="pdmf-action">
                    {product.stock <= 0 ? (
                        <button className="pdmf-btn disabled" disabled style={{ background: '#d32f2f', color: 'white', opacity: 0.8, cursor: 'not-allowed' }}>
                            Out of Stock
                        </button>
                    ) : quantity === 0 ? (
                        <button className="pdmf-btn" onClick={handleAddToCart}>
                            <ShoppingCart size={18} />
                            Add
                        </button>
                    ) : (
                        <div className="pdmf-qty">
                            <button onClick={() => updateQuantity(cartItem!.id, quantity - 1)}>−</button>
                            <span>{quantity}</span>
                            <button onClick={() => updateQuantity(cartItem!.id, quantity + 1)}>+</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
