import { useState, useRef, useEffect, Fragment } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Download, User, Calendar, MapPin, Phone, Mail, CreditCard, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    getUserByNumber,
    verifyGetByNumber,
    verifyGetByNumberUser,
    getUserByAadhar,
    verifyGetByAadhar,
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
import Header from '../components/Header';
import './AbhaLoginPage.css';

type LoginMethod = 'mobile' | 'aadhaar' | 'abha-number' | 'abha-address';
type LoginStep = 'input' | 'otp' | 'account-selection' | 'success';

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

// OTP Input Component
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

const AbhaLoginPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const customerId = user?.id || '';

    const [loginMethod, setLoginMethod] = useState<LoginMethod>('mobile');
    const [loginStep, setLoginStep] = useState<LoginStep>('input');
    const [loginInput, setLoginInput] = useState('');
    const [loginOtp, setLoginOtp] = useState<string[]>(Array(6).fill(''));
    const [accounts, setAccounts] = useState<AbhaAccount[]>([]);
    const [abhaProfile, setAbhaProfile] = useState<AbhaProfile | null>(null);
    const [abhaCardBase64, setAbhaCardBase64] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loginOtpTimer = useOtpTimer(60);

    const [aadhaarParts, setAadhaarParts] = useState<string[]>(['', '', '']);
    const [abhaParts, setAbhaParts] = useState<string[]>(['', '', '', '']);
    const [showAadhaar, setShowAadhaar] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const aadhaarRefs = useRef<(HTMLInputElement | null)[]>([]);
    const abhaNumRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleAadhaarChange = (value: string, idx: number) => {
        if (!/^\d*$/.test(value)) return;
        const parts = [...aadhaarParts];
        parts[idx] = value.slice(0, 4);
        setAadhaarParts(parts);
        if (value.length === 4 && idx < 2) aadhaarRefs.current[idx + 1]?.focus();
    };

    const handleAadhaarKeyDown = (e: React.KeyboardEvent, idx: number) => {
        if (e.key === 'Backspace' && !aadhaarParts[idx] && idx > 0) aadhaarRefs.current[idx - 1]?.focus();
    };

    const abhaNumMaxLengths = [2, 4, 4, 4];
    const abhaNumPlaceholders = ['00', '0000', '0000', '0000'];

    const handleAbhaNumChange = (value: string, idx: number) => {
        if (!/^\d*$/.test(value)) return;
        const parts = [...abhaParts];
        parts[idx] = value.slice(0, abhaNumMaxLengths[idx]);
        setAbhaParts(parts);
        if (value.length === abhaNumMaxLengths[idx] && idx < 3) abhaNumRefs.current[idx + 1]?.focus();
    };

    const handleAbhaNumKeyDown = (e: React.KeyboardEvent, idx: number) => {
        if (e.key === 'Backspace' && !abhaParts[idx] && idx > 0) abhaNumRefs.current[idx - 1]?.focus();
    };

    const getLoginValue = () => {
        switch (loginMethod) {
            case 'mobile': return loginInput;
            case 'aadhaar': return aadhaarParts.join('');
            case 'abha-number': return abhaParts.join('');
            case 'abha-address': return loginInput;
            default: return loginInput;
        }
    };

    const isInputComplete = () => {
        switch (loginMethod) {
            case 'mobile': return loginInput.length === 10;
            case 'aadhaar': return aadhaarParts.join('').length === 12 && agreeTerms;
            case 'abha-number': return abhaParts.join('').length === 14;
            case 'abha-address': return loginInput.length > 0;
            default: return false;
        }
    };

    const resetInputs = () => {
        setLoginInput('');
        setAadhaarParts(['', '', '']);
        setAbhaParts(['', '', '', '']);
        setAgreeTerms(false);
        setShowAadhaar(false);
        setError('');
    };

    const startLoginFlow = async () => {
        const value = getLoginValue();
        if (!value) {
            setError('Please enter your details');
            return;
        }
        setLoading(true);
        setError('');
        try {
            if (loginMethod === 'mobile') {
                await getUserByNumber(customerId, value);
            } else if (loginMethod === 'aadhaar') {
                await getUserByAadhar(customerId, value);
            } else if (loginMethod === 'abha-number') {
                await getAbhaUserByAbhaNumber(customerId, value, 'mobile-verify', 'abdm');
            } else if (loginMethod === 'abha-address') {
                await getAbhaUserByAbhaAddress(customerId, value, 'mobile-verify', 'abdm');
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
                    await fetchProfileAndCard();
                    setLoginStep('success');
                } else {
                    setError('No accounts found');
                }
            } else if (loginMethod === 'aadhaar') {
                await verifyGetByAadhar(customerId, loginOtp.join(''));
                await fetchProfileAndCard();
                setLoginStep('success');
            } else if (loginMethod === 'abha-number') {
                await verifyGetByAbhaNumber(customerId, loginOtp.join(''), 'mobile-verify');
                await fetchProfileAndCard();
                setLoginStep('success');
            } else if (loginMethod === 'abha-address') {
                await verifyGetByAbhaAddress(customerId, loginOtp.join(''), 'mobile-verify');
                await abhaAddressUserDetails(customerId);
                const card = await getPhrAbhaCard(customerId);
                setAbhaCardBase64(card.base64Card || '');
                const profile = await getUserDetails(customerId);
                setAbhaProfile(profile);
                setLoginStep('success');
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
            setLoginStep('success');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to verify account');
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

    const downloadCard = () => {
        if (!abhaCardBase64) return;
        const link = document.createElement('a');
        link.href = abhaCardBase64.startsWith('data:') ? abhaCardBase64 : `data:image/png;base64,${abhaCardBase64}`;
        link.download = 'ABHA-Card.png';
        link.click();
    };

    return (
        <div className="abha-login-page">
            <Header />

            <div className="abha-login-container">
                {loginStep !== 'success' ? (
                    <div className="abha-login-content">
                        <button className="abha-back-btn" onClick={() => navigate('/abha')}>
                            <ArrowLeft size={20} />
                            Back
                        </button>
                        
                        <div className="abha-login-inner">
                            <h1 className="abha-login-title">Login To Your ABHA</h1>

                            {error && (
                                <motion.div className="abha-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    {error}
                                </motion.div>
                            )}

                        {loginStep === 'input' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="abha-login-tabs">
                                    <button
                                        className={`abha-login-tab ${loginMethod === 'mobile' ? 'active' : ''}`}
                                        onClick={() => { setLoginMethod('mobile'); resetInputs(); }}
                                    >
                                        Mobile Number
                                    </button>
                                    <button
                                        className={`abha-login-tab ${loginMethod === 'aadhaar' ? 'active' : ''}`}
                                        onClick={() => { setLoginMethod('aadhaar'); resetInputs(); }}
                                    >
                                        Aadhaar Number
                                    </button>
                                    <button
                                        className={`abha-login-tab ${loginMethod === 'abha-number' ? 'active' : ''}`}
                                        onClick={() => { setLoginMethod('abha-number'); resetInputs(); }}
                                    >
                                        ABHA Number
                                    </button>
                                    <button
                                        className={`abha-login-tab ${loginMethod === 'abha-address' ? 'active' : ''}`}
                                        onClick={() => { setLoginMethod('abha-address'); resetInputs(); }}
                                    >
                                        ABHA Address
                                    </button>
                                </div>

                                <form 
                                    className="abha-input-card" 
                                    onSubmit={(e) => { e.preventDefault(); startLoginFlow(); }}
                                >
                                    {loginMethod === 'mobile' && (
                                        <div className="abha-input-section">
                                            <label className="abha-input-label">
                                                Mobile number<span className="required">*</span>
                                            </label>
                                            <div className="abha-mobile-input-wrapper">
                                                <div className="abha-country-code">+91</div>
                                                <div className="abha-input-with-icon">
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={loginInput}
                                                        onChange={e => setLoginInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                        placeholder="Mobile number"
                                                        className="abha-login-input"
                                                    />
                                                    {loginInput.length === 10 && (
                                                        <CheckCircle size={18} className="abha-input-check" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {loginMethod === 'aadhaar' && (
                                        <div className="abha-input-section">
                                            <label className="abha-input-label">
                                                Aadhaar number<span className="required">*</span>
                                            </label>
                                            <div className="abha-split-input-wrapper">
                                                {aadhaarParts.map((part, idx) => (
                                                    <Fragment key={idx}>
                                                        {idx > 0 && <span className="abha-input-dash">-</span>}
                                                        <input
                                                            ref={el => { aadhaarRefs.current[idx] = el; }}
                                                            type={showAadhaar ? 'text' : 'password'}
                                                            inputMode="numeric"
                                                            autoComplete="one-time-code"
                                                            maxLength={4}
                                                            value={part}
                                                            placeholder="0000"
                                                            className="abha-split-input"
                                                            onChange={e => handleAadhaarChange(e.target.value, idx)}
                                                            onKeyDown={e => handleAadhaarKeyDown(e, idx)}
                                                        />
                                                    </Fragment>
                                                ))}
                                                <button
                                                    type="button"
                                                    className="abha-eye-toggle"
                                                    onClick={() => setShowAadhaar(!showAadhaar)}
                                                >
                                                    {showAadhaar ? <Eye size={20} /> : <EyeOff size={20} />}
                                                </button>
                                            </div>
                                            <div className="abha-terms-section">
                                                <h4 className="abha-terms-title">Terms and Conditions</h4>
                                                <div className="abha-terms-text">
                                                    I, hereby declare that I am voluntarily sharing my Aadhaar number and demographic information issued by UIDAI, with National Health Authority (NHA) for the sole purpose of creation of ABHA number. I understand that my ABHA number can be used and shared for purposes as may be notified by ABDM from time to time including provision of healthcare services. Further, I am aware that my personal identifiable information (Name, Address, Age, Date of Birth, Gender and Photograph) may be made available to the entities working in the National Digital Health Ecosystem (NDHE) which inter alia includes stakeholders and entities such as healthcare professionals (e.g. doctors), facilities (e.g. hospitals, laboratories) and data fiduciaries (e.g. health programmes), which are registered with or linked to the Ayushman Bharat Digital Mission (ABDM), and various processes there under. I authorize NHA to use my Aadhaar number for performing Aadhaar based authentication with UIDAI as per the provisions of the Aadhaar (Targeted Delivery of Financial and other Subsidies, Benefits and Services) Act, 2016 for the aforesaid purpose. I understand that UIDAI will share my e-KYC details, or response of “Yes” with NHA upon successful authentication. I have been duly informed about the option of using other IDs apart from Aadhaar; however, I consciously choose to use Aadhaar number for the purpose of availing benefits across the NDHE. I am aware that my personal identifiable information excluding Aadhaar number / VID number can be used and shared for purposes as mentioned above. I reserve the right to revoke the given consent at any point of time as per provisions of Aadhaar Act and Regulations.
                                                </div>
                                                <label className="abha-agree-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={agreeTerms}
                                                        onChange={e => setAgreeTerms(e.target.checked)}
                                                    />
                                                    <span>I agree</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {loginMethod === 'abha-number' && (
                                        <div className="abha-input-section">
                                            <label className="abha-input-label">
                                                Enter ABHA number<span className="required">*</span>
                                            </label>
                                            <div className="abha-split-input-wrapper">
                                                {abhaParts.map((part, idx) => (
                                                    <Fragment key={idx}>
                                                        {idx > 0 && <span className="abha-input-dash">-</span>}
                                                        <input
                                                            ref={el => { abhaNumRefs.current[idx] = el; }}
                                                            type="text"
                                                            inputMode="numeric"
                                                            maxLength={abhaNumMaxLengths[idx]}
                                                            value={part}
                                                            placeholder={abhaNumPlaceholders[idx]}
                                                            className="abha-split-input"
                                                            style={{ maxWidth: idx === 0 ? '55px' : '75px' }}
                                                            onChange={e => handleAbhaNumChange(e.target.value, idx)}
                                                            onKeyDown={e => handleAbhaNumKeyDown(e, idx)}
                                                        />
                                                    </Fragment>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {loginMethod === 'abha-address' && (
                                        <div className="abha-input-section">
                                            <label className="abha-input-label">
                                                ABHA address<span className="required">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={loginInput}
                                                onChange={e => setLoginInput(e.target.value)}
                                                placeholder="Enter your ABHA address"
                                                className="abha-login-input abha-login-input-full"
                                            />
                                        </div>
                                    )}

                                    <div className="abha-button-row">
                                        <button
                                            type="submit"
                                            className="abha-btn-primary"
                                            disabled={loading || !isInputComplete()}
                                        >
                                            {loading ? 'Sending...' : 'Next'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {loginStep === 'otp' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <form 
                                    className="abha-otp-section"
                                    onSubmit={(e) => { e.preventDefault(); verifyLoginOtp(); }}
                                >
                                    <h3>Enter OTP</h3>
                                    <p>OTP sent to your registered mobile number</p>
                                    <OtpInput otp={loginOtp} setOtp={setLoginOtp} />
                                    <div className="abha-otp-timer">
                                        Time remaining: {loginOtpTimer.formatTime(loginOtpTimer.secondsLeft)}
                                    </div>
                                    <button type="submit" className="abha-btn-primary" disabled={loading}>
                                        {loading ? 'Verifying...' : 'Verify OTP'}
                                    </button>
                                    {loginOtpTimer.attemptsLeft > 1 && loginOtpTimer.secondsLeft === 0 && (
                                        <button
                                            type="button"
                                            className="abha-btn-link"
                                            onClick={() => { if (loginOtpTimer.resendOtp()) startLoginFlow(); }}
                                        >
                                            Resend OTP ({loginOtpTimer.attemptsLeft - 1} attempts left)
                                        </button>
                                    )}
                                </form>
                            </motion.div>
                        )}

                        {loginStep === 'account-selection' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="abha-account-selection">
                                    <h3>Select Your Account</h3>
                                    <p>Multiple ABHA accounts found with this mobile number</p>
                                    <div className="abha-accounts-list">
                                        {accounts.map((account, idx) => (
                                            <div
                                                key={idx}
                                                className="abha-account-card"
                                                onClick={() => selectAccountAndVerify(account)}
                                            >
                                                <div className="abha-account-info">
                                                    <User size={24} />
                                                    <div>
                                                        <div className="abha-account-name">{account.name}</div>
                                                        <div className="abha-account-number">ABHA: {account.ABHANumber}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        </div>
                    </div>
                ) : (
                    <motion.div
                        className="abha-success-screen"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <CheckCircle size={80} className="abha-success-icon" />
                        <h2>Login Successful!</h2>
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
                                    <span>{abhaProfile.address || abhaProfile.stateName || 'N/A'}</span>
                                </div>
                                {abhaProfile.preferredAbhaAddress && (
                                    <div className="abha-profile-row">
                                        <Mail size={20} />
                                        <span>{abhaProfile.preferredAbhaAddress}</span>
                                    </div>
                                )}
                            </div>
                        )}
                        {abhaCardBase64 && (
                            <div className="abha-card-preview">
                                <img src={abhaCardBase64.startsWith('data:') ? abhaCardBase64 : `data:image/png;base64,${abhaCardBase64}`} alt="ABHA Card" />
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

export default AbhaLoginPage;
