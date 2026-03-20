import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Download, User, Calendar, MapPin, Phone, Mail, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    generateAadhaarOtp,
    verifyAadharOtp,
    generateMobileOtp,
    verifyMobileOtp,
    getAbhaAddressSuggestion as getAddressSuggestions,
    setAbhaAddress as setAddress,
    getUserByAadhar,
    verifyGetByAadhar,
    getUserByNumber,
    verifyGetByNumber,
    verifyGetByNumberUser,
    getAbhaUserByAbhaNumber,
    verifyGetByAbhaNumber,
    getAbhaUserByAbhaAddress,
    verifyGetByAbhaAddress,
    abhaAddressUserDetails,
    getPhrAbhaCard,
    getUserDetails,
    downloadAbhaCard,
    type AbhaProfile,
    type AbhaAccount
} from '../api/abha';
import { useToast } from '../components/Toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './AbhaWizardPage.css';
import aadhaarLogo from '../assets/aadhaar_logo.png';

// Flow modes
type AbhaMode = 'home' | 'login' | 'create-aadhaar' | 'success';
type LoginMethod = 'mobile' | 'aadhaar' | 'abha-number' | 'abha-address';
type LoginStep = 'input' | 'otp' | 'account-selection' | 'profile-fetch' | 'card-download';

// Creating via Aadhaar
const AADHAAR_STEPS = [
    { key: 'aadhaar_entry', label: 'Aadhaar Number' },
    { key: 'aadhaar_otp', label: 'OTP Verification' },
    { key: 'address_suggestion', label: 'Choose Address' },
    { key: 'set_address', label: 'Confirm Address' },
    { key: 'profile', label: 'User Details' },
    { key: 'card', label: 'ABHA Card' }
];

// OTP Timer Hook
const useOtpTimer = (initialSeconds = 60) => {
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [attemptsLeft, setAttemptsLeft] = useState(3);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startTimer = () => {
        setSecondsLeft(initialSeconds);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const resendOtp = () => {
        if (attemptsLeft > 1) {
            setAttemptsLeft(prev => prev - 1);
            startTimer();
            return true;
        }
        return false;
    };

    const resetTimer = () => {
        setSecondsLeft(0);
        setAttemptsLeft(3);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    useEffect(() => {
        if (secondsLeft <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }
        timerRef.current = setInterval(() => {
            setSecondsLeft(s => s > 0 ? s - 1 : 0);
        }, 1000);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [secondsLeft]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    };

    return { secondsLeft, attemptsLeft, startTimer, resendOtp, resetTimer, formatTime };
};

// Reusable OTP Input Component
interface OtpInputProps {
    otp: string[];
    setOtp: (otp: string[]) => void;
    onComplete?: () => void;
}

const OtpInput = ({ otp, setOtp, onComplete }: OtpInputProps) => {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleOtpChange = (val: string, idx: number) => {
        if (!/^\d*$/.test(val)) return;
        const updated = [...otp];
        updated[idx] = val.slice(-1);
        setOtp(updated);
        if (val && idx < 5) {
            inputRefs.current[idx + 1]?.focus();
        }
        if (val && idx === 5 && updated.every(d => d)) {
            onComplete?.();
        }
    };

    const handleOtpKeyDown = (e: React.KeyboardEvent, idx: number) => {
        if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
            inputRefs.current[idx - 1]?.focus();
        }
    };

    return (
        <div className="otp-boxes">
            {otp.map((digit, idx) => (
                <input
                    key={idx}
                    ref={el => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    className="otp-box"
                    onChange={e => handleOtpChange(e.target.value, idx)}
                    onKeyDown={e => handleOtpKeyDown(e, idx)}
                />
            ))}
        </div>
    );
};


const AbhaWizardPage = () => {
    const { user } = useAuth();
    const customerId = user?.id || '';
    const navigate = useNavigate();
    const { showToast } = useToast();

    // ========== WIZARD STATE ==========
    const [mode, setMode] = useState<AbhaMode>('home');
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [consentChecked, setConsentChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // ========== REGISTRATION STATE ==========
    const [aadhaarParts, setAadhaarParts] = useState(['', '', '']);
    const [regOtp, setRegOtp] = useState<string[]>(Array(6).fill(''));
    const [mobileNumber, setMobileNumber] = useState('');
    const [mobileOtp, setMobileOtp] = useState<string[]>(Array(6).fill(''));
    const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [customAddress, setCustomAddress] = useState('');
    const [abhaProfile, setAbhaProfile] = useState<AbhaProfile | null>(null);
    const [abhaCardBase64, setAbhaCardBase64] = useState('');
    const [mobileVerificationRequired, setMobileVerificationRequired] = useState(false);
    const regOtpTimer = useOtpTimer(60);
    const mobileOtpTimer = useOtpTimer(60);

    // ========== LOGIN STATE ==========
    const [loginMethod, setLoginMethod] = useState<LoginMethod>('mobile');
    const [loginStep, setLoginStep] = useState<LoginStep>('input');
    const [loginInput, setLoginInput] = useState(''); // mobile/aadhaar/abha number/address
    const [loginOtp, setLoginOtp] = useState<string[]>(Array(6).fill(''));
    const [accounts, setAccounts] = useState<AbhaAccount[]>([]);
    const loginOtpTimer = useOtpTimer(60);

    // Aadhaar auto-advance refs
    const aadhaarRefs = useRef<(HTMLInputElement | null)[]>([]);

    // ========== HELPER FUNCTIONS ==========
    
    const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
        const updated = [...aadhaarParts];
        updated[idx] = val;
        setAadhaarParts(updated);
        if (val.length === 4 && idx < 2) {
            aadhaarRefs.current[idx + 1]?.focus();
        }
    };

    const handleAadhaarKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
        if (e.key === 'Backspace' && !aadhaarParts[idx] && idx > 0) {
            aadhaarRefs.current[idx - 1]?.focus();
        }
    };

    // ========== REGISTRATION HANDLERS ==========
    
    const startAadhaarRegistration = async () => {
        const fullAadhaar = aadhaarParts.join('');
        if (fullAadhaar.length !== 12) {
            setError('Please enter a valid 12-digit Aadhaar number');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await generateAadhaarOtp(fullAadhaar, customerId);
            alert('OTP sent to your Aadhaar-registered mobile number');
            nextStep();
            regOtpTimer.startTimer();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading (false);
        }
    };

    const verifyAadhaarOtpStep = async () => {
        if (regOtp.some(d => !d)) {
            setError('Please enter complete OTP');
            return;
        }
        if (!mobileNumber || mobileNumber.length !== 10) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await verifyAadharOtp(customerId, regOtp.join(''), mobileNumber);
            
            if (response.message === "This account already exist" || response.data?.message === "This account already exist") {
                showToast("This account already exists. Redirecting to Login...");
                setTimeout(() => navigate('/abha'), 3000);
                return;
            }

            if (response.mobileVerified === false || response.ABHAProfile?.mobileVerified === false) {
                // Need mobile OTP
                await generateMobileOtp(customerId, mobileNumber);
                alert('OTP sent to mobile number');
                setMobileVerificationRequired(true);
                mobileOtpTimer.startTimer();
            } else {
                // Skip to address selection
                await fetchAddressSuggestions();
                nextStep(); // Goes to Index 2 (Address Suggestion)
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'OTP verification failed');
        } finally {
            setLoading(false);
        }
    };

    const verifyMobileOtpStep = async () => {
        if (mobileOtp.some(d => !d)) {
            setError('Please enter complete OTP');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await verifyMobileOtp(customerId, mobileOtp.join(''));
            setMobileVerificationRequired(false);
            await fetchAddressSuggestions();
            nextStep(); // Goes to Index 2 (Address Suggestion)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Mobile verification failed');
        } finally {
            setLoading(false);
        }
    };

    const fetchAddressSuggestions = async () => {
        setLoading(true);
        try {
            const response = await getAddressSuggestions(customerId);
            setAddressSuggestions(response.suggestions || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch address suggestions');
        } finally {
            setLoading(false);
        }
    };

    const submitAbhaAddress = async () => {
        const finalAddress = selectedAddress || customAddress;
        if (!finalAddress) {
            setError('Please select or enter an ABHA address');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await setAddress(customerId, finalAddress);
            alert('ABHA address set successfully!');
            await fetchProfileData();
            nextStep(); // Goes to Index 4 (Profile Details)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to set ABHA address');
        } finally {
            setLoading(false);
        }
    };

    const confirmAddressSelection = () => {
        const finalAddress = selectedAddress || customAddress;
        if (!finalAddress) {
            setError('Please select or enter an ABHA address');
            return;
        }
        nextStep(); // Goes to Index 3 (Confirm Address)
    };

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            const profile = await getUserDetails(customerId);
            setAbhaProfile(profile);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchCardData = async () => {
        setLoading(true);
        try {
            const card = await downloadAbhaCard(customerId);
            setAbhaCardBase64(card.base64Card || '');
            nextStep(); // Goes to Index 5 (Card)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to download card');
        } finally {
            setLoading(false);
        }
    };

    const fetchProfileAndCard = async () => {
        setLoading(true);
        try {
            const profile = await getUserDetails(customerId);
            setAbhaProfile(profile);
            const card = await downloadAbhaCard(customerId);
            setAbhaCardBase64(card.base64Card || '');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch profile');
        } finally {
            setLoading(false);
        }
    };

    // ========== LOGIN HANDLERS ==========
    
    const startLoginFlow = async () => {
        if (!loginInput) {
            setError('Please enter your details');
            return;
        }
        setLoading(true);
        setError('');
        try {
            if (loginMethod === 'mobile') {
                await getUserByNumber(customerId, loginInput);
            } else if (loginMethod === 'aadhaar') {
                await getUserByAadhar(customerId, loginInput);
            } else if (loginMethod === 'abha-number') {
                await getAbhaUserByAbhaNumber(customerId, loginInput, 'mobile-verify', 'abdm');
            } else if (loginMethod === 'abha-address') {
                await getAbhaUserByAbhaAddress(customerId, loginInput, 'mobile-verify', 'abdm');
            }
            alert('OTP sent successfully');
            setLoginStep('otp');
            loginOtpTimer.startTimer();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const verifyLoginOtp = async () => {
        if (loginOtp.some(d => !d)) {
            setError('Please enter complete OTP');
            return;
        }
        setLoading(true);
        setError('');
        try {
            if (loginMethod === 'mobile') {
                const response = await verifyGetByNumber(customerId, loginOtp.join(''));
                if (response.accounts && response.accounts.length > 1) {
                    setAccounts(response.accounts);
                    setLoginStep('account-selection');
                } else if (response.accounts && response.accounts.length === 1) {
                    await verifyGetByNumberUser(customerId, response.accounts[0].ABHANumber);
                    setLoginStep('profile-fetch');
                    await fetchProfileAndCard();
                    setMode('success');
                } else {
                    setError('No accounts found');
                }
            } else if (loginMethod === 'aadhaar') {
                await verifyGetByAadhar(customerId, loginOtp.join(''));
                setLoginStep('profile-fetch');
                await fetchProfileAndCard();
                setMode('success');
            } else if (loginMethod === 'abha-number') {
                await verifyGetByAbhaNumber(customerId, loginOtp.join(''), 'mobile-verify');
                setLoginStep('profile-fetch');
                await fetchProfileAndCard();
                setMode('success');
            } else if (loginMethod === 'abha-address') {
                await verifyGetByAbhaAddress(customerId, loginOtp.join(''), 'mobile-verify');
                await abhaAddressUserDetails(customerId);
                const card = await getPhrAbhaCard(customerId);
                setAbhaCardBase64(card.base64Card || '');
                setLoginStep('profile-fetch');
                const profile = await getUserDetails(customerId);
                setAbhaProfile(profile);
                setMode('success');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'OTP verification failed');
        } finally {
            setLoading(false);
        }
    };

    const selectAccountAndVerify = async (account: AbhaAccount) => {
        setLoading(true);
        setError('');
        try {
            await verifyGetByNumberUser(customerId, account.ABHANumber);
            await fetchProfileAndCard();
            setMode('success');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to verify account');
        } finally {
            setLoading(false);
        }
    };

    // Common Reset
    const resetFlow = () => {
        setMode('home');
        setCurrentStepIndex(0);
        setLoginStep('input');
        setLoginInput('');
        setLoginOtp(Array(6).fill(''));
        setRegOtp(Array(6).fill(''));
        setMobileOtp(Array(6).fill(''));
        setAadhaarParts(['', '', '']);
        setMobileNumber('');
        setError('');
        setAccounts([]);
        setAbhaProfile(null);
        setAbhaCardBase64('');
        setMobileVerificationRequired(false);
        regOtpTimer.resetTimer();
        mobileOtpTimer.resetTimer();
        loginOtpTimer.resetTimer();
    };

    const nextStep = () => {
        setCurrentStepIndex(prev => prev + 1);
        setError('');
    };

    const prevStep = () => {
        setCurrentStepIndex(prev => prev - 1);
        setError('');
    };

    return (
        <div className="abha-page">
            <Header />
            <div className="abha-wrapper wide-wrapper">
                <AnimatePresence mode="wait">

                    {/* -- HOME: Split Layout -- */}
                    {mode === 'home' && (
                        <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="abha-home-split">
                            <h2 className="abha-page-title-centered">ABHA - Your Digital Health Account</h2>
                            
                            <div className="abha-split-container">
                                {/* LEFT SIDE - Registration */}
                                <div className="abha-split-section abha-register-section">
                                    <div className="abha-split-header">
                                        <h3>New to ABHA?</h3>
                                        <p>Create your health account in minutes</p>
                                    </div>
                                    
                                    <div className="abha-compact-card" onClick={() => { setMode('create-aadhaar'); setCurrentStepIndex(0); }}>
                                        <img src={aadhaarLogo} alt="Aadhaar Logo" className="abha-compact-logo" />
                                        <p className="abha-card-text">Create your ABHA number using</p>
                                        <span className="abha-card-highlight">Aadhaar</span>
                                    </div>
                                    
                                    <button 
                                        className="abha-btn-primary-split"
                                        onClick={() => { setMode('create-aadhaar'); setCurrentStepIndex(0); }}
                                    >
                                        Get Started →
                                    </button>
                                </div>

                                {/* DIVIDER */}
                                <div className="abha-split-divider">
                                    <span>OR</span>
                                </div>

                                {/* RIGHT SIDE - Login */}
                                <div className="abha-split-section abha-login-section">
                                    <div className="abha-split-header">
                                        <h3>Already have ABHA?</h3>
                                        <p>Login using any of these methods</p>
                                    </div>
                                    
                                    <div className="abha-login-options">
                                        <div 
                                            className="abha-login-option"
                                            onClick={() => { setLoginMethod('mobile'); setMode('login'); }}
                                        >
                                            <div className="abha-login-icon">📱</div>
                                            <span>Mobile Number</span>
                                        </div>
                                        
                                        <div 
                                            className="abha-login-option"
                                            onClick={() => { setLoginMethod('aadhaar'); setMode('login'); }}
                                        >
                                            <div className="abha-login-icon">🆔</div>
                                            <span>Aadhaar Number</span>
                                        </div>
                                        
                                        <div 
                                            className="abha-login-option"
                                            onClick={() => { setLoginMethod('abha-number'); setMode('login'); }}
                                        >
                                            <div className="abha-login-icon">🏥</div>
                                            <span>ABHA Number</span>
                                        </div>
                                        
                                        <div 
                                            className="abha-login-option"
                                            onClick={() => { setLoginMethod('abha-address'); setMode('login'); }}
                                        >
                                            <div className="abha-login-icon">✉️</div>
                                            <span>ABHA Address</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* -- LOGIN PAGE -- */}
                    {mode === 'login' && (
                        <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="abha-login-container">
                            <h2 className="abha-section-title">Login To Your ABHA</h2>

                            {loginStep === 'input' && (
                                <>
                                    <div className="abha-tabs">
                                        <button 
                                            className={`abha-tab ${loginMethod === 'mobile' ? 'active' : ''}`} 
                                            onClick={() => setLoginMethod('mobile')}
                                        >
                                            Mobile Number
                                        </button>
                                        <button 
                                            className={`abha-tab ${loginMethod === 'aadhaar' ? 'active' : ''}`} 
                                            onClick={() => setLoginMethod('aadhaar')}
                                        >
                                            Aadhaar Number
                                        </button>
                                        <button 
                                            className={`abha-tab ${loginMethod === 'abha-number' ? 'active' : ''}`} 
                                            onClick={() => setLoginMethod('abha-number')}
                                        >
                                            ABHA Number
                                        </button>
                                        <button 
                                            className={`abha-tab ${loginMethod === 'abha-address' ? 'active' : ''}`} 
                                            onClick={() => setLoginMethod('abha-address')}
                                        >
                                            ABHA Address
                                        </button>
                                    </div>

                                    <form 
                                        className="abha-tab-content"
                                        onSubmit={(e) => { e.preventDefault(); startLoginFlow(); }}
                                    >
                                        <div className="abha-form-row">
                                            <label>
                                                {loginMethod === 'mobile' && 'Mobile number*'}
                                                {loginMethod === 'aadhaar' && 'Aadhaar number*'}
                                                {loginMethod === 'abha-number' && 'ABHA number*'}
                                                {loginMethod === 'abha-address' && 'ABHA address*'}
                                            </label>
                                            <div className="abha-input-with-prefix">
                                                {loginMethod === 'mobile' && <span className="abha-prefix">+91</span>}
                                                <input 
                                                    type="text" 
                                                    inputMode={loginMethod === 'abha-address' ? 'text' : 'numeric'}
                                                    maxLength={loginMethod === 'mobile' ? 10 : loginMethod === 'aadhaar' ? 12 : loginMethod === 'abha-number' ? 14 : undefined}
                                                    placeholder={`Enter ${loginMethod === 'abha-address' ? 'yourname@abdm' : loginMethod.replace('-', ' ')}`}
                                                    value={loginInput}
                                                    onChange={e => setLoginInput(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {error && <p className="abha-error-text" style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

                                        <div className="abha-form-actions-right">
                                            <button 
                                                type="submit"
                                                className="abha-btn-orange" 
                                                disabled={!loginInput || loading}
                                            >
                                                {loading ? 'Sending OTP...' : 'Next'}
                                            </button>
                                        </div>
                                    </form>

                                    <div className="abha-footer-links">
                                        <button className="abha-text-btn orange">Forgot your ABHA number?</button> | <button className="abha-text-btn orange">Retrieve your Enrolment number</button>
                                    </div>
                                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                        <button className="abha-text-btn" onClick={resetFlow}>Back to Home</button>
                                    </div>
                                </>
                            )}

                            {loginStep === 'otp' && (
                                <form 
                                    className="abha-tab-content"
                                    onSubmit={(e) => { e.preventDefault(); verifyLoginOtp(); }}
                                >
                                    <h3 className="otp-title">Confirm OTP</h3>
                                    <p className="otp-subtitle">OTP sent to your registered mobile number</p>

                                    <OtpInput otp={loginOtp} setOtp={setLoginOtp} />

                                    <div className="otp-resend-row">
                                        <span className="otp-didnt">Didn't receive OTP? </span>
                                        <button
                                            type="button"
                                            className={`otp-resend-btn ${loginOtpTimer.secondsLeft > 0 || loginOtpTimer.attemptsLeft <= 1 ? 'disabled' : ''}`}
                                            disabled={loginOtpTimer.secondsLeft > 0 || loginOtpTimer.attemptsLeft <= 1}
                                            onClick={() => { if (loginOtpTimer.resendOtp()) startLoginFlow(); }}
                                        >
                                            Resend OTP
                                        </button>
                                        {loginOtpTimer.secondsLeft > 0 && (
                                            <span className="otp-timer">{loginOtpTimer.formatTime(loginOtpTimer.secondsLeft)} remaining</span>
                                        )}
                                    </div>

                                    {error && <p className="abha-error-text" style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

                                    <div className="abha-form-actions-split" style={{ marginTop: '2rem' }}>
                                        <button type="button" className="abha-btn-gray" onClick={() => { setLoginStep('input'); loginOtpTimer.resetTimer(); }}>Back</button>
                                        <button
                                            type="submit"
                                            className="abha-btn-orange"
                                            disabled={loginOtp.some(d => !d) || loading}
                                        >
                                            {loading ? 'Verifying...' : 'Verify'}
                                        </button>
                                    </div>

                                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                        <button type="button" className="abha-text-btn" onClick={resetFlow}>Back to Home</button>
                                    </div>
                                </form>
                            )}

                            {loginStep === 'account-selection' && (
                                <div className="abha-tab-content">
                                    <h3>Select ABHA Account</h3>
                                    <p className="abha-subtitle">Multiple accounts found. Please select one:</p>

                                    <div className="abha-account-list">
                                        {accounts.map((account, idx) => (
                                            <div 
                                                key={idx} 
                                                className="abha-account-card"
                                                onClick={() => selectAccountAndVerify(account)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div>
                                                    <h4>{account.name}</h4>
                                                    <p>ABHA: {account.ABHANumber}</p>
                                                    <p>DOB: {account.dayOfBirth}/{account.monthOfBirth}/{account.yearOfBirth}</p>
                                                    {account.districtName && <p>Location: {account.districtName}, {account.stateName}</p>}
                                                    <span className={`abha-status-badge ${account.status.toLowerCase()}`}>{account.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {error && <p className="abha-error-text" style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

                                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                        <button className="abha-btn-gray" onClick={() => setLoginStep('input')}>Back</button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* -- SUCCESS PAGE -- */}
                    {mode === 'success' && abhaProfile && (
                        <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="abha-success-container">
                            <div className="abha-success-header">
                                <CheckCircle size={64} color="#22c55e" />
                                <h2>ABHA Created Successfully!</h2>
                            </div>

                            <div className="abha-profile-card">
                                <h3>ABHA Profile</h3>
                                <div className="abha-profile-info">
                                    <div className="abha-info-row">
                                        <span className="label"><User size={18} /> Name:</span>
                                        <span className="value">{abhaProfile.name}</span>
                                    </div>
                                    <div className="abha-info-row">
                                        <span className="label"><CreditCard size={18} /> ABHA Number:</span>
                                        <span className="value">{abhaProfile.ABHANumber}</span>
                                    </div>
                                    <div className="abha-info-row">
                                        <span className="label"><Calendar size={18} /> Date of Birth:</span>
                                        <span className="value">{abhaProfile.dateOfBirth}</span>
                                    </div>
                                    <div className="abha-info-row">
                                        <span className="label"><Phone size={18} /> Mobile:</span>
                                        <span className="value">{abhaProfile.mobile}</span>
                                    </div>
                                    {abhaProfile.email && (
                                        <div className="abha-info-row">
                                            <span className="label"><Mail size={18} /> Email:</span>
                                            <span className="value">{abhaProfile.email}</span>
                                        </div>
                                    )}
                                    {abhaProfile.address && (
                                        <div className="abha-info-row">
                                            <span className="label"><MapPin size={18} /> Address:</span>
                                            <span className="value">{abhaProfile.address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {abhaCardBase64 && (
                                <div className="abha-card-preview">
                                    <h3>ABHA Card</h3>
                                    <img src={abhaCardBase64.startsWith('data:') ? abhaCardBase64 : `data:image/png;base64,${abhaCardBase64}`} alt="ABHA Card" />
                                    <a
                                        href={abhaCardBase64.startsWith('data:') ? abhaCardBase64 : `data:image/png;base64,${abhaCardBase64}`}
                                        download={`ABHA_Card_${abhaProfile.ABHANumber}.png`}
                                        className="abha-btn-download"
                                    >
                                        <Download size={18} /> Download Card
                                    </a>
                                </div>
                            )}

                            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                                <button className="abha-btn-orange" onClick={resetFlow}>Create Another ABHA</button>
                            </div>
                        </motion.div>
                    )}


                    {/* -- CREATE VIA AADHAAR -- */}
                    {mode === 'create-aadhaar' && (
                        <motion.div key="aadhaar-flow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="abha-flow-container">
                            <div className="abha-flow-header">
                                <h2>Create ABHA Number Using Aadhaar</h2>
                                <span className="abha-step-counter">{currentStepIndex + 1}/{AADHAAR_STEPS.length}</span>
                            </div>

                            <div className="abha-flow-stepper">
                                {AADHAAR_STEPS.map((step, idx) => (
                                    <div key={step.key} className={`abha-flow-step ${idx === currentStepIndex ? 'active' : ''} ${idx < currentStepIndex ? 'completed' : ''}`}>
                                        <span className="step-num">{idx + 1}</span> {step.label}
                                    </div>
                                ))}
                            </div>

                            <div className="abha-flow-content">
                                {/* Step 0: Consent */}
                                {currentStepIndex === 0 && (
                                    <form 
                                        className="abha-step-pane"
                                        onSubmit={(e) => { e.preventDefault(); startAadhaarRegistration(); }}
                                    >
                                        <div className="abha-form-row">
                                            <label>Aadhaar number*</label>
                                            <div className="abha-aadhaar-inputs">
                                                <input
                                                    ref={el => { aadhaarRefs.current[0] = el; }}
                                                    type="text" inputMode="numeric" maxLength={4} placeholder="0000"
                                                    autoComplete="one-time-code"
                                                    onChange={e => handleAadhaarChange(e, 0)}
                                                    onKeyDown={e => handleAadhaarKeyDown(e, 0)}
                                                /> -
                                                <input
                                                    ref={el => { aadhaarRefs.current[1] = el; }}
                                                    type="text" inputMode="numeric" maxLength={4} placeholder="0000"
                                                    autoComplete="one-time-code"
                                                    onChange={e => handleAadhaarChange(e, 1)}
                                                    onKeyDown={e => handleAadhaarKeyDown(e, 1)}
                                                /> -
                                                <input
                                                    ref={el => { aadhaarRefs.current[2] = el; }}
                                                    type="text" inputMode="numeric" maxLength={4} placeholder="0000"
                                                    autoComplete="one-time-code"
                                                    onChange={e => handleAadhaarChange(e, 2)}
                                                    onKeyDown={e => handleAadhaarKeyDown(e, 2)}
                                                />
                                            </div>
                                            <p className="abha-info-text text-purple">
                                                ⓘ Please ensure that mobile number is linked with Aadhaar as it will be required for OTP authentication.<br />
                                                <span className="text-secondary">If you do not have a mobile number linked, visit the nearest <span className="text-orange">ABDM participating facility</span> and seek assistance.</span>
                                            </p>
                                        </div>

                                        <div className="abha-terms-box">
                                            <h4>Terms and Conditions</h4>
                                            <div className="abha-terms-text">
                                                I, hereby declare that I am voluntarily sharing my Aadhaar number and demographic information issued by UIDAI, with National Health Authority (NHA) for the sole purpose of creation of ABHA number. I understand that my ABHA number can be used and shared for purposes as may be notified by ABDM from time to time including provision of healthcare services. Further, I am aware that my personal identifiable information (Name, Address, Age, Date of Birth, Gender and Photograph) may be made available to the entities working in the National Digital Health Ecosystem (NDHE) which inter alia includes stakeholders and entities such as healthcare professionals (e.g. doctors), facilities (e.g. hospitals, laboratories) and data fiduciaries (e.g. health programmes), which are registered with or linked to the Ayushman Bharat Digital Mission (ABDM), and various processes there under. I authorize NHA to use my Aadhaar number for performing Aadhaar based authentication with UIDAI as per the provisions of the Aadhaar (Targeted Delivery of Financial and other Subsidies, Benefits and Services) Act, 2016 for the aforesaid purpose. I understand that UIDAI will share my e-KYC details, or response of "Yes" with NHA upon successful authentication. I have been duly informed about the option of using other IDs apart from Aadhaar; however, I consciously choose to use Aadhaar number for the purpose of availing benefits across the NDHE. I am aware that my personal identifiable information excluding Aadhaar number / VID number can be used and shared for purposes as mentioned above. I reserve the right to revoke the given consent at any point of time as per provisions of Aadhaar Act and Regulations.
                                            </div>
                                            <label className="abha-agree-label">
                                                <input type="checkbox" checked={consentChecked} onChange={(e) => setConsentChecked(e.target.checked)} /> I agree
                                            </label>
                                        </div>

                                        <div className="abha-form-row">
                                            <label>Authentication type*</label>
                                            <select className="abha-select">
                                                <option>Aadhaar OTP</option>
                                            </select>
                                        </div>

                                        {error && <p className="abha-error-text" style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

                                        <div className="abha-form-actions-split">
                                            <button type="button" className="abha-btn-gray" onClick={resetFlow}>Cancel</button>
                                            <button type="submit" className="abha-btn-orange" disabled={!consentChecked || loading}>
                                                {loading ? 'Sending OTP...' : 'Next'}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* Step 1: Verify OTPs */}
                                {currentStepIndex === 1 && (
                                    <form 
                                        className="abha-step-pane otp-step-pane"
                                        onSubmit={(e) => { 
                                            e.preventDefault(); 
                                            if (!mobileVerificationRequired) verifyAadhaarOtpStep();
                                            else verifyMobileOtpStep();
                                        }}
                                    >
                                        {!mobileVerificationRequired ? (
                                            <>
                                                <h3 className="otp-title">Confirm Aadhaar OTP</h3>
                                                <p className="otp-subtitle">OTP sent to your Aadhaar-linked mobile number</p>

                                                <OtpInput otp={regOtp} setOtp={setRegOtp} />

                                                <div className="otp-resend-row">
                                                    <span className="otp-didnt">Didn't receive OTP? </span>
                                                    <button
                                                        type="button"
                                                        className={`otp-resend-btn ${regOtpTimer.secondsLeft > 0 || regOtpTimer.attemptsLeft <= 1 ? 'disabled' : ''}`}
                                                        disabled={regOtpTimer.secondsLeft > 0 || regOtpTimer.attemptsLeft <= 1}
                                                        onClick={() => { if (regOtpTimer.resendOtp()) startAadhaarRegistration(); }}
                                                    >
                                                        Resend OTP
                                                    </button>
                                                    {regOtpTimer.secondsLeft > 0 && (
                                                        <span className="otp-timer">{regOtpTimer.formatTime(regOtpTimer.secondsLeft)} remaining</span>
                                                    )}
                                                    {regOtpTimer.attemptsLeft <= 1 && regOtpTimer.secondsLeft === 0 && (
                                                        <span className="otp-max-attempts">Max attempts reached</span>
                                                    )}
                                                </div>

                                                <div className="abha-form-row" style={{ marginTop: '1.5rem' }}>
                                                    <label className="otp-mobile-label">Mobile number*</label>
                                                    <div className="abha-input-with-prefix" style={{ maxWidth: 350 }}>
                                                        <span className="abha-prefix">+91</span>
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            maxLength={10}
                                                            placeholder="Mobile number"
                                                            value={mobileNumber}
                                                            onChange={e => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                                                            style={{ flex: 1, border: 'none', padding: '0.75rem 1rem', outline: 'none' }}
                                                        />
                                                        {mobileNumber.length === 10 && (
                                                            <span style={{ padding: '0.75rem', color: '#22c55e' }}>
                                                                <CheckCircle size={18} />
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="abha-info-text" style={{ color: '#6366f1', marginTop: '0.5rem', fontSize: '0.82rem' }}>
                                                        ⓘ It is preferable to use your Aadhaar-linked mobile number. If you choose to use a different mobile number, it will need to be validated again.
                                                    </p>
                                                </div>

                                                {error && <p className="abha-error-text" style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

                                                <div className="abha-form-actions-split" style={{ marginTop: '2rem' }}>
                                                    <button type="button" className="abha-btn-gray" onClick={() => { setCurrentStepIndex(0); regOtpTimer.resetTimer(); }}>Back</button>
                                                    <button
                                                        type="submit"
                                                        className="abha-btn-orange"
                                                        disabled={regOtp.some(d => !d) || mobileNumber.length < 10 || loading}
                                                    >
                                                        {loading ? 'Verifying...' : 'Next'}
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <h3 className="otp-title">Verify Mobile OTP</h3>
                                                <p className="otp-subtitle">OTP sent to mobile number ending with ****{mobileNumber.slice(-4)}</p>

                                                <OtpInput otp={mobileOtp} setOtp={setMobileOtp} />

                                                <div className="otp-resend-row">
                                                    <span className="otp-didnt">Didn't receive OTP? </span>
                                                    <button
                                                        type="button"
                                                        className={`otp-resend-btn ${mobileOtpTimer.secondsLeft > 0 || mobileOtpTimer.attemptsLeft <= 1 ? 'disabled' : ''}`}
                                                        disabled={mobileOtpTimer.secondsLeft > 0 || mobileOtpTimer.attemptsLeft <= 1}
                                                        onClick={async () => {
                                                            if (mobileOtpTimer.resendOtp()) {
                                                                try {
                                                                    await generateMobileOtp(customerId, mobileNumber);
                                                                    alert('OTP resent successfully');
                                                                } catch (err: any) {
                                                                    setError('Failed to resend OTP');
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        Resend OTP
                                                    </button>
                                                    {mobileOtpTimer.secondsLeft > 0 && (
                                                        <span className="otp-timer">{mobileOtpTimer.formatTime(mobileOtpTimer.secondsLeft)} remaining</span>
                                                    )}
                                                </div>

                                                {error && <p className="abha-error-text" style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

                                                <div className="abha-form-actions-split" style={{ marginTop: '2rem' }}>
                                                    <button type="button" className="abha-btn-gray" onClick={() => { setMobileVerificationRequired(false); mobileOtpTimer.resetTimer(); }}>Back</button>
                                                    <button
                                                        type="submit"
                                                        className="abha-btn-orange"
                                                        disabled={mobileOtp.some(d => !d) || loading}
                                                    >
                                                        {loading ? 'Verifying...' : 'Next'}
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </form>
                                )}

                                {/* Step 2: Select ABHA Address */}
                                {currentStepIndex === 2 && (
                                    <form 
                                        className="abha-step-pane"
                                        onSubmit={(e) => { e.preventDefault(); confirmAddressSelection(); }}
                                    >
                                        <h3>Select ABHA Address</h3>
                                        <p className="abha-subtitle">Choose from suggestions or create your own</p>

                                        {addressSuggestions.length > 0 && (
                                            <div className="abha-address-suggestions">
                                                {addressSuggestions.map((addr, idx) => (
                                                    <label key={idx} className="abha-address-option">
                                                        <input
                                                            type="radio"
                                                            name="abha-address"
                                                            checked={selectedAddress === addr}
                                                            onChange={() => { setSelectedAddress(addr); setCustomAddress(''); }}
                                                        />
                                                        <span>{addr}@abdm</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}

                                        <div className="abha-form-row" style={{ marginTop: '1rem' }}>
                                            <label>Or enter custom address</label>
                                            <div className="abha-input-with-prefix">
                                                <input
                                                    type="text"
                                                    placeholder="yourname"
                                                    value={customAddress}
                                                    onChange={e => { setCustomAddress(e.target.value); setSelectedAddress(''); }}
                                                    style={{ flex: 1, padding: '0.75rem 1rem' }}
                                                />
                                                <span className="abha-prefix">@abdm</span>
                                            </div>
                                        </div>

                                        {error && <p className="abha-error-text" style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

                                        <div className="abha-form-actions-split" style={{ marginTop: '2rem' }}>
                                            <button type="button" className="abha-btn-gray" onClick={prevStep}>Back</button>
                                            <button
                                                type="submit"
                                                className="abha-btn-orange"
                                                disabled={!selectedAddress && !customAddress || loading}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* Step 3: Confirm ABHA Address */}
                                {currentStepIndex === 3 && (
                                    <form 
                                        className="abha-step-pane"
                                        onSubmit={(e) => { e.preventDefault(); submitAbhaAddress(); }}
                                    >
                                        <h3>Confirm Your ABHA Address</h3>
                                        <p className="abha-subtitle">Review the address you are about to create</p>

                                        <div className="abha-profile-card">
                                            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                                <h2 style={{ fontSize: '1.5rem', color: '#16a34a', margin: '0' }}>
                                                    {(selectedAddress || customAddress)}<span style={{ color: '#4b5563' }}>@abdm</span>
                                                </h2>
                                                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
                                                    This will be your universal health identifier address.
                                                </p>
                                            </div>
                                        </div>

                                        {error && <p className="abha-error-text" style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

                                        <div className="abha-form-actions-split" style={{ marginTop: '2rem' }}>
                                            <button type="button" className="abha-btn-gray" onClick={prevStep}>Edit</button>
                                            <button
                                                type="submit"
                                                className="abha-btn-orange"
                                                disabled={loading}
                                            >
                                                {loading ? 'Creating...' : 'Confirm & Create'}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* Step 4: Profile Details */}
                                {currentStepIndex === 4 && abhaProfile && (
                                    <div className="abha-step-pane">
                                        <h3>ABHA Created Successfully!</h3>
                                        <div className="abha-profile-card">
                                            <h3>Your Details</h3>
                                            <div className="abha-profile-info">
                                                <div className="abha-info-row">
                                                    <span className="label"><User size={18} /> Name:</span>
                                                    <span className="value">{abhaProfile.name}</span>
                                                </div>
                                                <div className="abha-info-row">
                                                    <span className="label"><CreditCard size={18} /> ABHA Number:</span>
                                                    <span className="value">{abhaProfile.ABHANumber}</span>
                                                </div>
                                                <div className="abha-info-row">
                                                    <span className="label"><Calendar size={18} /> Date of Birth:</span>
                                                    <span className="value">{abhaProfile.dateOfBirth}</span>
                                                </div>
                                                <div className="abha-info-row">
                                                    <span className="label"><Phone size={18} /> Mobile:</span>
                                                    <span className="value">{abhaProfile.mobile}</span>
                                                </div>
                                                {abhaProfile.address && (
                                                    <div className="abha-info-row">
                                                        <span className="label"><MapPin size={18} /> Address:</span>
                                                        <span className="value">{abhaProfile.address}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {error && <p className="abha-error-text" style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

                                        <div className="abha-form-actions-split" style={{ marginTop: '2rem' }}>
                                            <span /> {/* Empty spacer */}
                                            <button
                                                className="abha-btn-orange"
                                                onClick={fetchCardData}
                                                disabled={loading}
                                            >
                                                {loading ? 'Fetching Details...' : 'View ABHA Card'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 5: ABHA Card Download */}
                                {currentStepIndex === 5 && abhaCardBase64 && (
                                    <div className="abha-step-pane">
                                        <h3>Your Official ABHA Card</h3>
                                        
                                        <div className="abha-card-preview" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                                            <img src={abhaCardBase64.startsWith('data:') ? abhaCardBase64 : `data:image/png;base64,${abhaCardBase64}`} alt="ABHA Card" />
                                            <a
                                                href={abhaCardBase64.startsWith('data:') ? abhaCardBase64 : `data:image/png;base64,${abhaCardBase64}`}
                                                download={`ABHA_Card.png`}
                                                className="abha-btn-download"
                                            >
                                                <Download size={18} /> Download
                                            </a>
                                        </div>

                                        <div className="abha-form-actions-split" style={{ marginTop: '2rem', justifyContent: 'center' }}>
                                            <button className="abha-btn-orange" onClick={resetFlow}>Back to Home</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
            <Footer />
        </div>
    );
};

export default AbhaWizardPage;
