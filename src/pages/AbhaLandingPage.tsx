import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import './AbhaLandingPage.css';
import aadhaarLogo from '../assets/aadhaar_logo.png';

const AbhaLandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="abha-landing-page">
            <Header />
            
            <div className="abha-landing-container">
                <motion.div 
                    className="abha-landing-hero"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="abha-landing-title">Create ABHA Number</h1>
                    <p className="abha-landing-subtitle">
                        Please choose one of the below option to start with the creation of your ABHA
                    </p>
                </motion.div>

                <div className="abha-landing-cards">
                    {/* Aadhaar Card */}
                    <motion.div
                        className="abha-simple-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        onClick={() => navigate('/abha/signup')}
                    >
                        <img src={aadhaarLogo} alt="Aadhaar" className="abha-card-logo" />
                        <p className="abha-card-text">
                            Create your ABHA number using
                        </p>
                        <span className="abha-card-method">Aadhaar</span>
                    </motion.div>

                    {/* Driving Licence Card - Disabled for now */}
                    <motion.div
                        className="abha-simple-card abha-card-disabled"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        title="Coming soon"
                    >
                        <div className="abha-ribbon-badge">Coming Soon</div>
                        <div className="abha-dl-icon">🪪</div>
                        <p className="abha-card-text">
                            Create your ABHA number using
                        </p>
                        <span className="abha-card-method">Driving Licence</span>
                    </motion.div>
                </div>

                <motion.div 
                    className="abha-login-link"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <p>
                        Already have ABHA number?{' '}
                        <span className="abha-link" onClick={() => navigate('/abha/login')}>
                            Login
                        </span>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default AbhaLandingPage;
