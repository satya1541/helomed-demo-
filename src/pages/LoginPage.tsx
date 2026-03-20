import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Shield, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sendOtp, verifyOtp } from '../api/auth';
import './LoginPage.css';

type Step = 'phone' | 'otp';

const LoginPage = () => {
    const [step, setStep] = useState<Step>('phone');
    const [userPhone, setUserPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState<React.ReactNode>('');
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const phone = userPhone;
    const setPhone = (val: string) => {
        const cleaned = val.replace(/\D/g, '').slice(0, 10);
        setUserPhone(cleaned);
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!phone || phone.length < 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        setLoading(true);
        try {
            const res = await sendOtp(phone);

            if (res?.message?.toLowerCase().includes('not registered')) {
                setError(
                    <span>
                        User not registered. Please <span className="link" onClick={() => navigate('/signup')}>Signup now</span>
                    </span>
                );
                return;
            }

            setStep('otp');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!otp || otp.length < 4) {
            setError('Please enter the OTP');
            return;
        }

        setLoading(true);
        try {
            const authData = await verifyOtp(phone, otp);
            if (authData?.token) {
                login(authData.token, authData.user);
                navigate('/');
            } else {
                setError('Verification failed. Invalid response from server.');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setError('');
        setLoading(true);
        try {
            const res = await sendOtp(phone);

            if (res?.message?.toLowerCase().includes('not registered')) {
                setError(
                    <span>
                        User not registered. Please <span className="link" onClick={() => navigate('/signup')}>Register/Signup</span>
                    </span>
                );
                return;
            }
            setError(''); 
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page" data-theme="user">
            <div className="login-container">
                <div className="login-logo-section">
                    <img src="/images/logo.png" alt="Helo Med" className="login-logo" />
                    <h1>{step === 'phone' ? 'Welcome' : 'Verify OTP'}</h1>
                    <p>
                        {step === 'phone'
                            ? 'Enter your phone number to continue'
                            : `We've sent a verification code to +91 ${phone}`}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {step === 'phone' ? (
                        <motion.form
                            key="phone-form"
                            className="login-form"
                            onSubmit={handleSendOtp}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <div className="form-group">
                                <label htmlFor="phone">
                                    <Phone size={16} />
                                    Phone Number
                                </label>
                                <div className="phone-input-wrapper">
                                    <span className="country-code">+91</span>
                                    <input
                                        type="tel"
                                        id="phone"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Enter your mobile number"
                                        maxLength={10}
                                        autoComplete="tel"
                                    />
                                </div>
                                <p className="helper-text">We'll send a secure OTP to verify your number.</p>
                            </div>

                            {error && <div className="error-message">{error}</div>}

                            <button type="submit" className="login-btn" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 size={24} className="spin" />
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Get OTP</span>
                                        <ArrowRight size={22} />
                                    </>
                                )}
                            </button>

                            <div className="login-footer">
                                <p>Don't have an account? <span className="link" onClick={() => navigate('/signup')}>Create Account</span></p>
                            </div>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="otp-form"
                            className="login-form"
                            onSubmit={handleVerifyOtp}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="form-group">
                                <label htmlFor="otp">
                                    <Shield size={16} />
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                        setOtp(value);
                                        if (value.length === 4) {
                                            setTimeout(() => {
                                                const form = e.target.form;
                                                if (form) form.requestSubmit();
                                            }, 100);
                                        }
                                    }}
                                    placeholder="e.g. 1234"
                                    maxLength={4}
                                    autoComplete="one-time-code"
                                    className="otp-input"
                                />
                            </div>

                            {error && <div className="error-message">{error}</div>}

                            <button type="submit" className="login-btn" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="spin" />
                                        <span>Verifying...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Verify & Login</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>

                            <div className="login-options">
                                <button
                                    type="button"
                                    className="resend-btn"
                                    onClick={handleResendOtp}
                                    disabled={loading}
                                >
                                    Resend OTP
                                </button>
                                <button
                                    type="button"
                                    className="change-number-btn"
                                    onClick={() => {
                                        setStep('phone');
                                        setOtp('');
                                        setError('');
                                    }}
                                >
                                    Change Number
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LoginPage;

