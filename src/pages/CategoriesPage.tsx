import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid3X3, ChevronRight, TrendingUp, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { getCategories, getProductsByCategory } from '../api/products';
import './CategoriesPage.css';

const s3BaseUrl = 'https://helomed.s3.ap-south-2.amazonaws.com/';

const resolveIcon = (url?: string) => {
    if (!url) return '/images/categories/others.png';
    if (url.startsWith('http') || url.startsWith('/')) return url;
    return `${s3BaseUrl}${url}`;
};

const CategoriesPage = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<any[]>([]);
    const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [prodLoading, setProdLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const catData = await getCategories();
                if (Array.isArray(catData)) {
                    setCategories(catData.filter((c: any) => c.is_active));
                }
            } catch (err) {
                console.error('Failed to fetch categories', err);
            } finally {
                setLoading(false);
            }

            try {
                const res = await getProductsByCategory(1, 1, 6);
                setFeaturedProducts(res.products || []);
            } catch (err) {
                console.error('Failed to fetch featured products', err);
            } finally {
                setProdLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCategoryClick = (categoryId: number) => {
        navigate(`/medicines?category=${categoryId}`);
    };

    return (
        <div className="cat-page">
            <Header />
            <div className="cat-page-wrapper">
                {/* Page Title */}
                <div className="cat-page-title">
                    <Grid3X3 size={28} />
                    <h1>Browse Categories</h1>
                    <span className="cat-count-badge">{categories.length} categories</span>
                </div>

                {/* Categories Grid */}
                <div className="cat-section">
                    {loading ? (
                        <div className="cat-loading">
                            <div className="loader"></div>
                            <p>Loading categories...</p>
                        </div>
                    ) : (
                        <div className="cat-grid">
                            {categories.map((cat, index) => (
                                <motion.div
                                    key={cat.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                    whileHover={{ y: -4 }}
                                    className="cat-card"
                                    onClick={() => handleCategoryClick(cat.id)}
                                >
                                    <div className="cat-card-image">
                                        <img src={resolveIcon(cat.icon_url)} alt={cat.name} />
                                    </div>
                                    <div className="cat-card-info">
                                        <span className="cat-card-name">{cat.name}</span>
                                        <ChevronRight size={14} className="cat-card-arrow" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Featured Products */}
                <div className="cat-featured-section">
                    <div className="cat-featured-header">
                        <div className="cfh-left">
                            <TrendingUp size={18} />
                            <h2>Popular in Medicine & Supplements</h2>
                        </div>
                        <button className="cfh-view-all" onClick={() => navigate('/medicines?category=1')}>
                            View All
                            <ChevronRight size={14} />
                        </button>
                    </div>

                    {prodLoading ? (
                        <div className="cat-loading">
                            <div className="loader"></div>
                        </div>
                    ) : featuredProducts.length > 0 ? (
                        <div className="cat-products-grid">
                            {featuredProducts.map((p: any) => (
                                <ProductCard key={p.id} {...p} />
                            ))}
                        </div>
                    ) : (
                        <div className="cat-empty-products">
                            <Search size={32} />
                            <p>No products available yet.</p>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CategoriesPage;
