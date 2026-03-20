import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getAllProducts, resolveImageUrl } from '../api/products';
import { getWishlist } from '../api/wishlist';
import './WishlistPage.css';

const WishlistPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { wishlist } = useCart();
    const [wishlistItems, setWishlistItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlistProducts = async () => {
            setLoading(true);
            try {
                if (isAuthenticated) {
                    const data = await getWishlist();
                    const productsList = data?.products || data?.data?.products || [];
                    if (Array.isArray(productsList)) {
                        const mappedItems = productsList.map((item: any) => ({
                            id: item.product.id,
                            retailer_product_id: item.product.id,
                            saved_product_id: item.saved_product_id,
                            name: item.product.product_name,
                            brand_name: item.product.brand_name,
                            salt_composition: item.product.salt_composition,
                            weight: item.product.pack_size,
                            price: Number(item.product.price),
                            originalPrice: Number(item.product.mrp),
                            discount: Number(item.product.discount_percentage),
                            stock: item.product.stock,
                            image: resolveImageUrl(item.product.product_image) || '/images/medicine-placeholder.png',
                            requires_prescription: item.product.requires_prescription,
                            description: item.product.description,
                            retailer_id: item.product.retailer?.id,
                            category: "Medicine",
                        }));
                        setWishlistItems(mappedItems);
                    }
                } else {
                    const allProducts = await getAllProducts();
                    if (Array.isArray(allProducts)) {
                        const items = allProducts.filter((p: any) => wishlist.includes(p.id));
                        setWishlistItems(items);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch wishlist products", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWishlistProducts();
    }, [wishlist, isAuthenticated]);

    return (
        <div className="wl-page">
            <Header />
            <div className="wl-wrapper">
                {/* Page Title */}
                <div className="wl-page-title">
                    <Heart size={28} />
                    <h1>My Wishlist</h1>
                    {!loading && wishlistItems.length > 0 && (
                        <span className="wl-count-badge">{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}</span>
                    )}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="wl-loading">
                        <div className="loader"></div>
                        <p>Loading wishlist...</p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {wishlistItems.length === 0 ? (
                            <motion.div
                                className="wl-empty"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                key="empty"
                            >
                                <div className="wl-empty-icon">
                                    <Heart size={52} strokeWidth={1} />
                                </div>
                                <h2>Your wishlist is empty</h2>
                                <p>Save your favorite health essentials here to find them easily later.</p>
                                <button className="wl-explore-btn" onClick={() => navigate('/medicines')}>
                                    <ShoppingBag size={16} />
                                    Explore Products
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                className="wl-grid"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                key="grid"
                            >
                                {wishlistItems.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        {...product}
                                        isWishlistPage={true}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default WishlistPage;
