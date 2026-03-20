import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './MobileHero.css';

const MobileHero = () => {
    const navigate = useNavigate();

    return (
        <section className="mobile-hero">
            {/* Decorative floating shapes */}
            <div className="mobile-hero-shapes">
                <div className="shape shape-1" />
                <div className="shape shape-2" />
                <div className="shape shape-3" />
                <div className="shape shape-4" />
                <div className="shape shape-5" />
            </div>

            <div className="mobile-hero-inner">
                {/* Badge */}
                <motion.span
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mobile-hero-badge"
                >
                    ✦ HeloMed
                </motion.span>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mobile-hero-title"
                >
                    Your Health,<br />Delivered.
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.25 }}
                    className="mobile-hero-subtitle"
                >
                    Medicines, wellness & expert advice — right at your fingertips.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
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

                {/* Trust badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mobile-hero-trust"
                >
                    <span>🚚 Fast Delivery</span>
                    <span>✅ 100% Genuine</span>
                    <span>💊 Rx Support</span>
                </motion.div>
            </div>
        </section>
    );
};

export default MobileHero;
