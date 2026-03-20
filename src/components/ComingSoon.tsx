import { motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import './ComingSoon.css';

const ComingSoon = () => {
    return (
        <div className="cs-page">
            <Header />
            <div className="cs-wrapper">
                <motion.div
                    className="cs-content-box"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    <div className="cs-icon-wrapper">
                        <img src="/commingsoon.png" alt="Coming Soon" className="cs-image-logo" />
                    </div>

                </motion.div>
            </div>
            <Footer />
        </div>
    );
};

export default ComingSoon;
