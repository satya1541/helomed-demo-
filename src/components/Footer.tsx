import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-brand">
                    <div className="footer-logo-wrapper">
                        <img src="/images/logo.png" alt="HeloMed" className="footer-logo-img" />
                        <div className="footer-logo">Helo<span className="highlight">Med</span></div>
                    </div>
                    <p>Redefining pharmaceutical care with premium wellness solutions delivered to your doorstep. Your health, curated for your life.</p>
                </div>

                <div className="footer-links">
                    <div className="link-column">
                        <h4>Shop</h4>
                        <ul>
                            <li><Link to="/medicines">Medicines</Link></li>
                            <li><Link to="/categories">Categories</Link></li>
                        </ul>
                    </div>

                    <div className="link-column">
                        <h4>Company</h4>
                        <ul>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/our-story">Our Story</Link></li>
                            <li><Link to="/careers">Careers</Link></li>
                        </ul>
                    </div>

                    <div className="link-column">
                        <h4>Legal</h4>
                        <ul>
                            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                            <li><Link to="/terms-of-service">Terms of Service</Link></li>
                            <li><Link to="/shipping-policy">Shipping Policy</Link></li>
                            <li><Link to="/refund-policy">Refund Policy</Link></li>
                        </ul>
                    </div>

                    <div className="link-column">
                        <h4>Contact Us</h4>
                        <div className="footer-contact-info">
                            <p>Plot No-9429, Elegance Society, NH-316, Puri Bypass Road, Unit-35, Near SR Valley Mandap Bhubaneswar, Odisha, 751018</p>
                            <p className="footer-phone">📞 +1800-121-9102</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <p>© 2026 UDI DIGI SWASTHYATECH Pvt. Ltd.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
