import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './MobileHeroCanvas.css';

export default function MobileHeroCanvas() {
    const navigate = useNavigate();

    return (
        <section className="mobile-hero-container">
            {/* Static Hero Image */}
            <div className="mobile-hero-image-wrapper">
                <motion.img
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    src="/images/hero-capsule.jpg"
                    alt="HeloMed - Premium Healthcare"
                    className="mobile-hero-image"
                />
                
                {/* Gradient Overlay */}
                <div className="mobile-hero-overlay" />
            </div>

            {/* Content */}
            <div className="mobile-hero-content">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="mobile-hero-text"
                >
                    <span className="mobile-hero-badge">✦ HeloMed</span>
                    <h1 className="mobile-hero-title">
                        Your Health,<br />Delivered.
                    </h1>
                    <p className="mobile-hero-subtitle">
                        Premium medicines & wellness delivered to your doorstep
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mobile-hero-actions"
                >
                    <button
                        onClick={() => navigate('/medicines')}
                        className="mobile-hero-btn primary"
                    >
                        Shop Now
                    </button>
                    <button
                        onClick={() => navigate('/about')}
                        className="mobile-hero-btn secondary"
                    >
                        Learn More
                    </button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="mobile-hero-trust"
                >
                    <span>🚚 Fast Delivery</span>
                    <span>✅ 100% Genuine</span>
                    <span>💊 Rx Support</span>
                </motion.div>
            </div>
        </section>
    );
}
