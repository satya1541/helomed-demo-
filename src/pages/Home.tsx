import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import HeroCanvasAnimation from '../components/HeroCanvasAnimation';
const MobileHeroCanvas = lazy(() => import('../components/MobileHeroCanvas'));
import Categories from '../components/Categories';
import ProductSection from '../components/ProductSection';
import ProductCard from '../components/ProductCard';
import HealthArticles from '../components/HealthArticles';
import Reviews from '../components/Reviews';
import Footer from '../components/Footer';

import { getAllProducts } from '../api/products';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getAllProducts();
                if (Array.isArray(data)) {
                    setProducts(data);
                }
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const getFeaturedProducts = (start: number, end: number) => {
        return products.slice(start, end);
    };

    return (
        <div className="home-page">
            <Header />

            <main className="main-content">
                <div className="desktop-hero">
                    <HeroCanvasAnimation />
                </div>
                <div className="mobile-hero">
                    <Suspense fallback={
                        <div style={{
                            height: '100vh',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <div style={{ color: 'white', fontSize: '1.2rem' }}>Loading...</div>
                        </div>
                    }>
                        <MobileHeroCanvas />
                    </Suspense>
                </div>

                <div className="home-sections-container">
                    <Categories />

                    <ProductSection
                        title="Diabetic Essential"
                        subtitle="Trusted products to manage your diabetes care."
                        theme="mint"
                        onViewAll={() => navigate('/medicines?category=1')}
                    >
                        {loading ? <p>Loading...</p> : getFeaturedProducts(0, 5).map((p: any) => (
                            <ProductCard key={p.id} {...p} />
                        ))}
                    </ProductSection>

                    {/* Skincare Banner */}
                    <motion.section
                        initial={{ opacity: 0, scale: 0.97 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="skin-banner-section"
                    >
                        <div className="skin-banner-card">
                            <div className="sbc-content">
                                <span className="sbc-tag"><Sparkles size={14} /> Personal Care</span>
                                <button className="sbc-cta" onClick={() => navigate('/medicines?category=5')}>
                                    Discover All <ArrowRight size={16} />
                                </button>
                            </div>
                            <div className="sbc-bg"></div>
                        </div>
                    </motion.section>

                    <ProductSection
                        title="Best Picks For You"
                        subtitle="Handpicked recommendations just for you."
                        theme="mint"
                        onViewAll={() => navigate('/medicines')}
                    >
                        {loading ? <p>Loading...</p> : getFeaturedProducts(5, 10).map((p: any) => (
                            <ProductCard key={p.id} {...p} />
                        ))}
                    </ProductSection>

                    <ProductSection
                        title="Hair Care Essential"
                        subtitle="Nourish and strengthen your hair naturally."
                        theme="mint"
                        onViewAll={() => navigate('/medicines?category=3')}
                    >
                        {loading ? <p>Loading...</p> : getFeaturedProducts(10, 15).map((p: any) => (
                            <ProductCard key={p.id} {...p} />
                        ))}
                    </ProductSection>

                    <HealthArticles />
                    <Reviews />
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Home;
