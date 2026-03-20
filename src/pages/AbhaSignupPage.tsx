import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Download, User, Calendar, MapPin, Phone, Mail, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    generateAadhaarOtp,
    verifyAadharOtp,
    generateMobileOtp,
    verifyMobileOtp,
    getAbhaAddressSuggestion as getAddressSuggestions,
    setAbhaAddress as setAddress,
    getUserDetails,
    downloadAbhaCard,
    type AbhaProfile
} from '../api/abha';
import { useToast } from '../components/Toast';
import Header from '../components/Header';
import './AbhaSignupPage.css';
import aadhaarLogo from '../assets/aadhaar_logo.png';

const AADHAAR_STEPS = [
    { key: 'consent', label: 'Consent Collection' },
    { key: 'auth', label: 'Aadhaar Authentication' },
    { key: 'comm', label: 'Communication Details' },
    { key: 'abhacreate', label: 'ABHA Address Creation' }
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

const OtpInput: React.FC<OtpInputProps> = ({ otp, setOtp, onComplete }) => {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleOtpChange = (value: string, idx: number) => {
        if (!/^\d*$/.test(value)) return;
        const updated = [...otp];
        updated[idx] = value.slice(0, 1);
        setOtp(updated);
        if (value && idx < 5) {
            inputRefs.current[idx + 1]?.focus();
        }
        if (updated.every(d => d) && onComplete) {
            onComplete();
        }
    };

    const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
        if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
            inputRefs.current[idx - 1]?.focus();
        }
    };

    return (
        <div className="otp-container">
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

const AbhaSignupPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const customerId = user?.id || '';

    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [consentChecked, setConsentChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const { showToast } = useToast();

    const [aadhaarParts, setAadhaarParts] = useState(['', '', '']);
    const [regOtp, setRegOtp] = useState<string[]>(Array(6).fill(''));
    const [mobileNumber, setMobileNumber] = useState('');
    const [mobileOtp, setMobileOtp] = useState<string[]>(Array(6).fill(''));
    const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [customAddress, setCustomAddress] = useState('');
    const [abhaProfile, setAbhaProfile] = useState<AbhaProfile | null>(null);
    const [abhaCardBase64, setAbhaCardBase64] = useState('');
    const [isAadhaarOtpSent, setIsAadhaarOtpSent] = useState(false);

    const regOtpTimer = useOtpTimer(60);
    const mobileOtpTimer = useOtpTimer(60);
    const aadhaarRefs = useRef<(HTMLInputElement | null)[]>([]);

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
            setIsAadhaarOtpSent(true);
            regOtpTimer.startTimer();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
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

            if (response.mobileVerified === false || response.data?.ABHAProfile?.mobileVerified === false) {
                await generateMobileOtp(customerId, mobileNumber);
                alert('OTP sent to mobile number');
                setCurrentStepIndex(prev => prev + 1);
                mobileOtpTimer.startTimer();
            } else {
                await fetchAddressSuggestions();
                setCurrentStepIndex(3);
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
            await fetchAddressSuggestions();
            setCurrentStepIndex(prev => prev + 1);
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
            await fetchProfileAndCard();
            setShowSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to set ABHA address');
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
            setAbhaCardBase64(card.card || '');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch profile');
        } finally {
            setLoading(false);
        }
    };

    const downloadCard = () => {
        if (!abhaCardBase64) return;
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${abhaCardBase64}`;
        link.download = 'ABHA-Card.png';
        link.click();
    };

    return (
        <div className="abha-signup-page">
            <Header />
            
            <div className="abha-signup-container">
                {!showSuccess ? (
                    <div className="abha-signup-content">
                        <button className="abha-back-btn" onClick={() => navigate('/abha')}>
                            <ArrowLeft size={20} />
                            Back
                        </button>
                        
                        <div className="abha-signup-inner">
                            <h1 className="abha-signup-title">Create ABHA Account</h1>
                            <p className="abha-signup-subtitle">Follow the steps to create your digital health account</p>

                            {/* Progress Steps */}
                            <div className="abha-progress-steps">
                                {AADHAAR_STEPS.map((step, idx) => (
                                    <div key={step.key} className={`abha-step ${idx <= currentStepIndex ? 'active' : ''} ${idx < currentStepIndex ? 'completed' : ''}`}>
                                        <div className="abha-step-circle">{idx < currentStepIndex ? '✓' : idx + 1}</div>
                                        <span className="abha-step-label">{step.label}</span>
                                    </div>
                                ))}
                            </div>

                            {error && (
                                <motion.div className="abha-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    {error}
                                </motion.div>
                            )}

                            {/* Step Content */}
                            {currentStepIndex === 0 && (
                            <motion.div className="abha-step-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="abha-consent-box">
                                    <img src={aadhaarLogo} alt="Aadhaar" className="abha-aadhaar-logo" />
                                    <h3>Consent for Aadhaar Authentication</h3>
                                    <p>I hereby declare that I am voluntarily sharing my Aadhaar Number/ VID and demographic information issued by UIDAI, with National Health Authority (NHA) for the sole purpose of creation of ABHA number. I understand that my ABHA number can be used and shared for purposes as may be notified by ABDM (Ayushman Bharat Digital Mission) from time to time including provision of healthcare services. Further, I am aware that my personal identifiable information (Name, Address, Age, Date of Birth, Gender and Photograph) may be made available to the entities working in the National Digital Health Ecosystem (NDHE) which inter alia includes stakeholders and entities such as healthcare professionals (doctors), facilities (hospitals, laboratories) and data fiduciaries (NHA, Sandbox), which are registered with or linked to the Ayushman Bharat Digital Mission (ABDM), and various processes there under. I reserve the right to revoke the given consent at any point of time as per provisions of Aadhaar Act and Regulations.</p>
                                    <label className="abha-checkbox-label">
                                        <input type="checkbox" checked={consentChecked} onChange={e => setConsentChecked(e.target.checked)} />
                                        I agree to the terms and conditions
                                    </label>
                                    <button className="abha-btn-primary" disabled={!consentChecked || loading} onClick={() => setCurrentStepIndex(1)}>
                                        {loading ? 'Processing...' : 'Proceed'}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {currentStepIndex === 1 && (
                            <motion.div className="abha-step-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <h3>Enter Aadhaar Number</h3>
                                <div className="abha-aadhaar-input-group">
                                    {aadhaarParts.map((part, idx) => (
                                        <input
                                            key={idx}
                                            ref={el => { aadhaarRefs.current[idx] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={4}
                                            value={part}
                                            placeholder="XXXX"
                                            className="abha-aadhaar-input"
                                            onChange={e => handleAadhaarChange(e, idx)}
                                            onKeyDown={e => handleAadhaarKeyDown(e, idx)}
                                        />
                                    ))}
                                </div>
                                {!isAadhaarOtpSent ? (
                                    <button className="abha-btn-primary" onClick={startAadhaarRegistration} disabled={loading}>
                                        {loading ? 'Sending...' : 'Send OTP'}
                                    </button>
                                ) : (
                                    <>
                                        <h3>Enter OTP</h3>
                                        <p>OTP sent to your Aadhaar-registered mobile</p>
                                        <OtpInput otp={regOtp} setOtp={setRegOtp} />
                                        <div className="abha-otp-timer">
                                            {regOtpTimer.secondsLeft > 0 ? (
                                                `Time remaining: ${regOtpTimer.formatTime(regOtpTimer.secondsLeft)}`
                                            ) : (
                                                <span className="text-danger">Timer expired. You can resend the OTP.</span>
                                            )}
                                        </div>
                                        <div className="abha-mobile-input-group">
                                            <label>Mobile Number (for updates)</label>
                                            <input
                                                type="tel"
                                                inputMode="numeric"
                                                maxLength={10}
                                                value={mobileNumber}
                                                onChange={e => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                                                placeholder="10-digit mobile number"
                                                className="abha-mobile-input"
                                            />
                                        </div>
                                        <button className="abha-btn-primary" onClick={verifyAadhaarOtpStep} disabled={loading}>
                                            {loading ? 'Verifying...' : 'Verify OTP'}
                                        </button>
                                        {regOtpTimer.secondsLeft === 0 && regOtpTimer.attemptsLeft > 1 && (
                                            <button className="abha-btn-link" onClick={() => { if (regOtpTimer.resendOtp()) startAadhaarRegistration(); }}>
                                                Resend OTP ({regOtpTimer.attemptsLeft - 1} attempts left)
                                            </button>
                                        )}
                                        {regOtpTimer.secondsLeft === 0 && regOtpTimer.attemptsLeft <= 1 && (
                                            <p className="abha-error-text">No resend attempts left. Please refresh or try again later.</p>
                                        )}
                                    </>
                                )}
                            </motion.div>
                        )}

                        {currentStepIndex === 2 && (
                            <motion.div className="abha-step-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <h3>Verify Mobile Number</h3>
                                <p>OTP sent to {mobileNumber}</p>
                                <OtpInput otp={mobileOtp} setOtp={setMobileOtp} />
                                <div className="abha-otp-timer">Time remaining: {mobileOtpTimer.formatTime(mobileOtpTimer.secondsLeft)}</div>
                                <button className="abha-btn-primary" onClick={verifyMobileOtpStep} disabled={loading}>
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                            </motion.div>
                        )}

                        {currentStepIndex === 3 && (
                            <motion.div className="abha-step-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <h3>Choose Your ABHA Address</h3>
                                <p>Select from suggestions or create your own</p>
                                {addressSuggestions.length > 0 && (
                                    <div className="abha-address-suggestions">
                                        {addressSuggestions.map(addr => (
                                            <label key={addr} className="abha-address-option">
                                                <input
                                                    type="radio"
                                                    name="address"
                                                    value={addr}
                                                    checked={selectedAddress === addr}
                                                    onChange={() => { setSelectedAddress(addr); setCustomAddress(''); }}
                                                />
                                                {addr}
                                            </label>
                                        ))}
                                    </div>
                                )}
                                <div className="abha-custom-address">
                                    <label>Or create custom address:</label>
                                    <input
                                        type="text"
                                        value={customAddress}
                                        onChange={e => { setCustomAddress(e.target.value); setSelectedAddress(''); }}
                                        placeholder="yourname@abdm"
                                        className="abha-address-input"
                                    />
                                </div>
                                <button className="abha-btn-primary" onClick={submitAbhaAddress} disabled={loading}>
                                    {loading ? 'Creating...' : 'Create ABHA'}
                                </button>
                            </motion.div>
                        )}
                        </div>
                    </div>
                ) : (
                    <motion.div className="abha-success-screen" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <CheckCircle size={80} className="abha-success-icon" />
                        <h2>ABHA Account Created Successfully!</h2>
                        {abhaProfile && (
                            <div className="abha-profile-display">
                                <div className="abha-profile-row">
                                    <User size={20} />
                                    <span>{abhaProfile.name}</span>
                                </div>
                                <div className="abha-profile-row">
                                    <CreditCard size={20} />
                                    <span>ABHA: {abhaProfile.ABHANumber}</span>
                                </div>
                                <div className="abha-profile-row">
                                    <Mail size={20} />
                                    <span>{abhaProfile.email || 'N/A'}</span>
                                </div>
                                <div className="abha-profile-row">
                                    <Phone size={20} />
                                    <span>{abhaProfile.mobile}</span>
                                </div>
                                <div className="abha-profile-row">
                                    <Calendar size={20} />
                                    <span>{abhaProfile.dateOfBirth}</span>
                                </div>
                                <div className="abha-profile-row">
                                    <MapPin size={20} />
                                    <span>{abhaProfile.address}</span>
                                </div>
                            </div>
                        )}
                        {abhaCardBase64 && (
                            <div className="abha-card-preview">
                                <img src={`data:image/png;base64,${abhaCardBase64}`} alt="ABHA Card" />
                                <button className="abha-btn-download" onClick={downloadCard}>
                                    <Download size={20} />
                                    Download Card
                                </button>
                            </div>
                        )}
                        <button className="abha-btn-primary" onClick={() => navigate('/abha')}>
                            Return to ABHA Home
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AbhaSignupPage;
