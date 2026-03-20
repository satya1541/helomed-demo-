import { useNavigate } from 'react-router-dom';
import { Heart, Shield, Truck, Clock, Users, Award, ChevronRight, Pill, Stethoscope, MapPin, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './AboutPage.css';

const AboutPage = () => {
    const navigate = useNavigate();

    return (
        <>
            <Header />
            <div className="abt-page">
                <div className="abt-wrapper">
                    {/* Page Title */}
                    <div className="abt-page-title">
                        <Heart size={28} />
                        <h1>About Helo Med</h1>
                    </div>

                    {/* Hero Card */}
                    <motion.div
                        className="abt-hero-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="ahc-text">
                            <h2>
                                Your Trusted Health Partner
                                <span>Delivering Wellness to Your Doorstep</span>
                            </h2>
                            <p>
                                Helo Med is India's emerging healthcare platform, making medicines and health products accessible, affordable, and convenient for everyone. We connect you with trusted local pharmacies for fast, reliable delivery.
                            </p>
                            <div className="ahc-actions">
                                <button className="ahc-primary" onClick={() => navigate('/')}>
                                    <ShoppingBag size={16} />
                                    Start Shopping
                                </button>
                                <button className="ahc-secondary" onClick={() => navigate('/need-help')}>
                                    <Stethoscope size={16} />
                                    Need Help?
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        className="abt-stats"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                    >
                        <div className="abt-stat-card">
                            <span className="as-value">5000+</span>
                            <span className="as-label">Products</span>
                            <span className="as-sub">Medicines & Health Essentials</span>
                        </div>
                        <div className="abt-stat-card">
                            <span className="as-value">100+</span>
                            <span className="as-label">Partner Pharmacies</span>
                            <span className="as-sub">Verified & Licensed Stores</span>
                        </div>
                        <div className="abt-stat-card">
                            <span className="as-value">1–2 Days</span>
                            <span className="as-label">Max Delivery</span>
                            <span className="as-sub">Same-Day Delivery Available</span>
                        </div>
                    </motion.div>

                    {/* Our Pillars */}
                    <motion.div
                        className="abt-section-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="asc-header">
                            <Award size={16} />
                            <h3>What We Stand For</h3>
                        </div>
                        <div className="abt-pillars-grid">
                            <div className="abt-pillar">
                                <div className="ap-icon" style={{ background: '#E3F2FD', color: '#1565C0' }}>
                                    <Shield size={22} />
                                </div>
                                <h4>Authenticity</h4>
                                <p>100% genuine medicines sourced from licensed pharmacies. Every product verified for quality and safety.</p>
                            </div>
                            <div className="abt-pillar">
                                <div className="ap-icon" style={{ background: '#E8F5E9', color: '#2E7D32' }}>
                                    <Truck size={22} />
                                </div>
                                <h4>Speed</h4>
                                <p>Lightning-fast delivery from your nearest pharmacy. Get essentials delivered when you need them most.</p>
                            </div>
                            <div className="abt-pillar">
                                <div className="ap-icon" style={{ background: '#FFF3E0', color: '#E65100' }}>
                                    <Heart size={22} />
                                </div>
                                <h4>Care</h4>
                                <p>Prescription management, health tracking, and personalized care — all in one place.</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* How It Works */}
                    <motion.div
                        className="abt-section-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                    >
                        <div className="asc-header">
                            <Clock size={16} />
                            <h3>How Helo Med Works</h3>
                        </div>
                        <div className="abt-timeline">
                            <div className="at-item">
                                <div className="at-number">1</div>
                                <div className="at-content">
                                    <h4>Search & Browse</h4>
                                    <p>Browse thousands of medicines and health products. Search by name, brand, or health concern.</p>
                                </div>
                            </div>
                            <div className="at-item">
                                <div className="at-number">2</div>
                                <div className="at-content">
                                    <h4>Upload Prescription</h4>
                                    <p>For prescription medicines, simply upload your doctor's prescription. We'll verify it securely.</p>
                                </div>
                            </div>
                            <div className="at-item">
                                <div className="at-number">3</div>
                                <div className="at-content">
                                    <h4>Place Your Order</h4>
                                    <p>Add to cart and checkout. Pay online or choose Cash on Delivery — whatever suits you best.</p>
                                </div>
                            </div>
                            <div className="at-item">
                                <div className="at-number">4</div>
                                <div className="at-content">
                                    <h4>Delivered to You</h4>
                                    <p>Your nearby pharmacy prepares the order and our delivery partner brings it to your doorstep.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Why Choose Us */}
                    <motion.div
                        className="abt-section-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="asc-header">
                            <Users size={16} />
                            <h3>Why Choose Helo Med</h3>
                        </div>
                        <div className="abt-timeline">
                            <div className="at-item">
                                <div className="at-icon"><Pill size={16} /></div>
                                <div className="at-content">
                                    <h4>Genuine Medicines</h4>
                                    <p>All medicines are sourced from licensed, government-authorized pharmacies near you.</p>
                                </div>
                            </div>
                            <div className="at-item">
                                <div className="at-icon"><MapPin size={16} /></div>
                                <div className="at-content">
                                    <h4>Hyperlocal Delivery</h4>
                                    <p>We connect you with local pharmacies for the fastest possible delivery experience.</p>
                                </div>
                            </div>
                            <div className="at-item">
                                <div className="at-icon"><Shield size={16} /></div>
                                <div className="at-content">
                                    <h4>ABHA Integration</h4>
                                    <p>Link your Ayushman Bharat Health Account for seamless digital health record management.</p>
                                </div>
                            </div>
                            <div className="at-item">
                                <div className="at-icon"><Clock size={16} /></div>
                                <div className="at-content">
                                    <h4>Real-Time Tracking</h4>
                                    <p>Track your order from pharmacy to doorstep with live updates and notifications.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* CTA */}
                    <motion.div
                        className="abt-cta-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                    >
                        <h2>Ready to Experience Better Healthcare?</h2>
                        <p>Join thousands of customers who trust Helo Med for their health needs. Order your medicines today!</p>
                        <div className="ahc-actions" style={{ justifyContent: 'center' }}>
                            <button className="ahc-primary" onClick={() => navigate('/')}>
                                <ShoppingBag size={16} />
                                Browse Medicines
                            </button>
                            <button className="ahc-secondary" onClick={() => navigate('/need-help')}>
                                <ChevronRight size={16} />
                                Get Support
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AboutPage;
