import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, User, Mail, ArrowRight, Loader2 } from 'lucide-react';
import './LoginPage.css'; 

const DummySignupPage = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!phone || phone.length < 10 || !name || !dateOfBirth) {
            setError('Please fill in all required fields correctly');
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            navigate('/login');
        }, 1000);
    };

    return (
        <div className="login-page" data-theme="user">
            <div className="login-container">
                <div className="login-logo-section">
                    <img src="/images/logo.png" alt="Helo Med" className="login-logo" />
                    <h1>Create Account</h1>
                    <p>Join Helo Med to get started</p>
                </div>

                <form className="login-form" onSubmit={handleSignup}>
                        <div className="form-group">
                            <label htmlFor="name"><User size={16} /> Full Name</label>
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahul Kumar" required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone"><Phone size={16} /> Phone Number</label>
                            <div className="phone-input-wrapper">
                                <span className="country-code">+91</span>
                                <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter mobile number" required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email"><Mail size={16} /> Email Address (Optional)</label>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. rahul@example.com" />
                        </div>

                        <div className="form-group">
                            <label>Date of Birth</label>
                            <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
                        </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 size={24} className="spin" />
                                <span>Creating Account...</span>
                            </>
                        ) : (
                            <>
                                <span>Sign Up</span>
                                <ArrowRight size={22} />
                            </>
                        )}
                    </button>

                    <div className="login-footer">
                        <p>Already have an account? <Link to="/login" className="link">Login</Link></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DummySignupPage;
