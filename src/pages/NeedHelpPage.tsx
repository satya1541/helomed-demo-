import { useState } from 'react';
import { HelpCircle, Phone, Mail, MessageCircle, ChevronDown, ChevronUp, ChevronRight, Headphones, ShieldCheck, Package, CreditCard, Truck, Clock, FileText, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './NeedHelpPage.css';

const faqs = [
    {
        q: 'How do I place an order on Helo Med?',
        a: 'Simply search for your medicine, add it to your cart, select your delivery address, and proceed to checkout. You can pay online or choose Cash on Delivery.'
    },
    {
        q: 'Do I need a prescription to buy medicines?',
        a: 'For prescription medicines, yes — you will need to upload a valid prescription from a licensed doctor. OTC (over-the-counter) products do not require a prescription.'
    },
    {
        q: 'How fast is the delivery?',
        a: 'We deliver from your nearest pharmacy, so most orders arrive within 30–60 minutes. Delivery times may vary based on your location and pharmacy availability.'
    },
    {
        q: 'What payment methods are accepted?',
        a: 'We accept UPI, Debit/Credit Cards, Net Banking, Wallets via Razorpay, and Cash on Delivery (COD). COD orders have a small additional fee of ₹10.'
    },
    {
        q: 'How can I track my order?',
        a: 'After placing your order, go to "My Orders" in your profile. You\'ll see live status updates from preparation to delivery, with real-time notifications.'
    },
    {
        q: 'Can I cancel or modify my order?',
        a: 'You can cancel your order before it is accepted by the pharmacy. Once accepted and being prepared, cancellations may not be possible. Contact support for assistance.'
    },
    {
        q: 'What is ABHA and how does it help?',
        a: 'ABHA (Ayushman Bharat Health Account) is a national digital health ID. Linking it with Helo Med allows seamless health record management and easier prescription verification.'
    },
    {
        q: 'How do I return or get a refund?',
        a: 'Due to the nature of pharmaceutical products, returns are handled on a case-by-case basis. If you received a wrong or damaged product, contact our support team immediately.'
    }
];

const NeedHelpPage = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <>
            <Header />
            <div className="hlp-page">
                <div className="hlp-wrapper">
                    {/* Page Title */}
                    <div className="hlp-page-title">
                        <HelpCircle size={28} />
                        <h1>Need Help?</h1>
                    </div>
                    <p className="hlp-subtitle">We're here for you. Choose how you'd like to reach us or find answers below.</p>

                    <div className="hlp-layout">
                        {/* Left: Support Options */}
                        <motion.div
                            className="hlp-cards"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <a href="tel:+18001219102" className="hlp-card clickable" style={{ textDecoration: 'none' }}>
                                <div className="hc-icon" style={{ background: '#E3F2FD', color: '#1565C0' }}>
                                    <Phone size={20} />
                                </div>
                                <div className="hc-info">
                                    <h3>Call Us (Toll Free)</h3>
                                    <p>+1800-121-9102 · Available 9 AM – 8 PM</p>
                                </div>
                                <ChevronRight size={16} className="hc-arrow" />
                            </a>

                            <a href="mailto:support@helomed.in" className="hlp-card clickable" style={{ textDecoration: 'none' }}>
                                <div className="hc-icon" style={{ background: '#E8F5E9', color: '#2E7D32' }}>
                                    <Mail size={20} />
                                </div>
                                <div className="hc-info">
                                    <h3>Email Support</h3>
                                    <p>support@helomed.in · We reply within 24 hours</p>
                                </div>
                                <ChevronRight size={16} className="hc-arrow" />
                            </a>

                            <a href="https://wa.me/18001219102" target="_blank" rel="noopener noreferrer" className="hlp-card clickable" style={{ textDecoration: 'none' }}>
                                <div className="hc-icon" style={{ background: '#E8F5E9', color: '#25D366' }}>
                                    <MessageCircle size={20} />
                                </div>
                                <div className="hc-info">
                                    <h3>WhatsApp</h3>
                                    <p>Chat with us on WhatsApp for quick help</p>
                                </div>
                                <ChevronRight size={16} className="hc-arrow" />
                            </a>

                            <div className="hlp-card">
                                <div className="hc-icon" style={{ background: '#FFF3E0', color: '#E65100' }}>
                                    <Headphones size={20} />
                                </div>
                                <div className="hc-info">
                                    <h3>Live Support</h3>
                                    <p>In-app chat support coming soon!</p>
                                </div>
                            </div>

                            <div className="hlp-card">
                                <div className="hc-icon" style={{ background: '#F3E5F5', color: '#7B1FA2' }}>
                                    <MapPin size={20} />
                                </div>
                                <div className="hc-info">
                                    <h3>Our Office</h3>
                                    <p>Plot No-9429, Elegance Society, NH-316, Puri Bypass Road, Unit-35, Near SR Valley Mandap, Bhubaneswar, Odisha — 751018</p>
                                </div>
                            </div>

                            {/* Quick Help Topics */}
                            <motion.div
                                className="hlp-faq-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="hfq-header">
                                    <Package size={16} />
                                    <h3>Quick Help Topics</h3>
                                </div>
                                <div className="hfq-list">
                                    <div className="at-item" style={{ padding: '0.75rem 1.15rem', borderBottom: '1px solid #f5f5f5' }}>
                                        <div className="at-icon" style={{ background: '#E3F2FD' }}><Truck size={14} style={{ color: '#1565C0' }} /></div>
                                        <div className="at-content">
                                            <h4 style={{ fontSize: '0.85rem' }}>Order & Delivery</h4>
                                            <p style={{ fontSize: '0.75rem' }}>Track orders, delivery issues, delays</p>
                                        </div>
                                    </div>
                                    <div className="at-item" style={{ padding: '0.75rem 1.15rem', borderBottom: '1px solid #f5f5f5' }}>
                                        <div className="at-icon" style={{ background: '#E8F5E9' }}><CreditCard size={14} style={{ color: '#2E7D32' }} /></div>
                                        <div className="at-content">
                                            <h4 style={{ fontSize: '0.85rem' }}>Payments & Refunds</h4>
                                            <p style={{ fontSize: '0.75rem' }}>Payment failures, refund status, COD issues</p>
                                        </div>
                                    </div>
                                    <div className="at-item" style={{ padding: '0.75rem 1.15rem', borderBottom: '1px solid #f5f5f5' }}>
                                        <div className="at-icon" style={{ background: '#FFF3E0' }}><FileText size={14} style={{ color: '#E65100' }} /></div>
                                        <div className="at-content">
                                            <h4 style={{ fontSize: '0.85rem' }}>Prescriptions</h4>
                                            <p style={{ fontSize: '0.75rem' }}>Upload issues, verification, requirements</p>
                                        </div>
                                    </div>
                                    <div className="at-item" style={{ padding: '0.75rem 1.15rem' }}>
                                        <div className="at-icon" style={{ background: '#F3E5F5' }}><ShieldCheck size={14} style={{ color: '#7B1FA2' }} /></div>
                                        <div className="at-content">
                                            <h4 style={{ fontSize: '0.85rem' }}>Account & ABHA</h4>
                                            <p style={{ fontSize: '0.75rem' }}>Profile, ABHA linking, verification</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Right: FAQ */}
                        <motion.div
                            className="hlp-faq-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                        >
                            <div className="hfq-header">
                                <Clock size={16} />
                                <h3>Frequently Asked Questions</h3>
                            </div>
                            <div className="hfq-list">
                                {faqs.map((faq, index) => (
                                    <div key={index} className={`hfq-item ${openFaq === index ? 'open' : ''}`}>
                                        <button className="hfq-question" onClick={() => toggleFaq(index)}>
                                            <span>{faq.q}</span>
                                            {openFaq === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                        {openFaq === index && (
                                            <motion.div
                                                className="hfq-answer"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <p>{faq.a}</p>
                                            </motion.div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default NeedHelpPage;
