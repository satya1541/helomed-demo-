import { ShoppingCart, Menu, X, Heart, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { getSearchSuggestions } from '../api/products';
import './Header.css';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartCount, wishlist } = useCart();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
    const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
    const searchRef = useRef<HTMLDivElement | null>(null);
    const mobileSearchRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!searchValue || searchValue.trim().length < 2) {
            setSuggestions([]);
            setIsSuggestionsOpen(false);
            return;
        }

        let isActive = true;
        setIsSuggestionsLoading(true);

        const debounce = setTimeout(async () => {
            try {
                const data = await getSearchSuggestions(searchValue.trim());
                if (!isActive) return;
                const items = Array.isArray(data)
                    ? data
                    : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.suggestions) ? data.suggestions : []));
                const normalized = items
                    .map((item: any) => item?.name || item?.product_name || item?.text || item)
                    .filter((item: any) => typeof item === 'string' && item.trim().length > 0);
                setSuggestions(normalized.slice(0, 8));
                setIsSuggestionsOpen(true);
            } catch (error) {
                if (!isActive) return;
                setSuggestions([]);
                setIsSuggestionsOpen(false);
            } finally {
                if (isActive) setIsSuggestionsLoading(false);
            }
        }, 350);

        return () => {
            isActive = false;
            clearTimeout(debounce);
        };
    }, [searchValue]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!searchRef.current) return;
            if (!searchRef.current.contains(event.target as Node)) {
                setIsSuggestionsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!mobileSearchRef.current) return;
            if (!mobileSearchRef.current.contains(event.target as Node)) {
                setIsMobileSearchOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Categories', path: '/categories' },
        { name: 'Medicines', path: '/medicines' },
        { name: 'Orders', path: '/orders' },
        { name: 'About Us', path: '/about' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <header className={`header ${isScrolled ? 'scrolled' : ''} ${location.pathname === '/' ? 'home-header' : ''}`}>
            {/* Top Row: Logo, Search, Actions */}
            <div className="header-top">
                <div className="header-container top-row-container">
                    <div className="logo-section" onClick={() => navigate('/')}>
                        <img src="/images/logo.png" alt="Helo-Med" className="header-logo" />
                    </div>

                    <div className="header-search-container" ref={searchRef}>
                        <form
                            className="search-bar"
                            onSubmit={(e) => {
                                e.preventDefault();
                                const query = searchValue.trim();
                                if (!query) return;
                                navigate(`/search?q=${encodeURIComponent(query)}`);
                                setSearchValue('');
                                setIsSuggestionsOpen(false);
                            }}
                        >
                            <div className="search-input-wrapper">
                                <input
                                    type="text"
                                    placeholder="Search for medicines and health products..."
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    onFocus={() => {
                                        if (suggestions.length > 0) setIsSuggestionsOpen(true);
                                    }}
                                />
                                <button type="submit" className="search-submit-btn">
                                    <Search size={20} />
                                </button>
                            </div>
                        </form>

                        <AnimatePresence>
                            {isSuggestionsOpen && (suggestions.length > 0 || isSuggestionsLoading) && (
                                <motion.div
                                    className="search-suggestions"
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                >
                                    {isSuggestionsLoading && (
                                        <div className="suggestion-item loading">Searching...</div>
                                    )}
                                    {suggestions.map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            className="suggestion-item"
                                            onClick={() => {
                                                navigate(`/search?q=${encodeURIComponent(item)}`);
                                                setSearchValue('');
                                                setIsSuggestionsOpen(false);
                                            }}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="header-actions">
                        <div className="action-links desktop-only">
                            <span className="action-link-text font-semibold" onClick={() => navigate('/login')}>Login / Sign Up</span>
                            <span className="action-link-text" onClick={() => navigate('/offers')}>Offers</span>
                            <span className="action-link-text" onClick={() => navigate('/need-help')}>Need Help?</span>
                        </div>

                        <button className="action-btn" onClick={() => navigate('/wishlist')} id="header-wishlist-icon">
                            <Heart size={20} className={wishlist.length > 0 ? 'text-primary' : ''} fill={wishlist.length > 0 ? 'currentColor' : 'none'} />
                            {wishlist.length > 0 && <span className="count-badge">{wishlist.length}</span>}
                        </button>

                        <button className="action-btn mobile-search-btn" onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}>
                            <Search size={20} />
                        </button>

                        <button className="action-btn cart-btn" onClick={() => navigate('/cart')} id="header-cart-icon">
                            <ShoppingCart size={20} />
                            {cartCount > 0 && <span className="count-badge">{cartCount}</span>}
                        </button>





                        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Navigation (Desktop only) */}
            <div className="header-bottom desktop-only">
                <div className="header-container">
                    <nav className="desktop-nav">
                        {navLinks.map((link) => (
                            <button
                                key={link.path}
                                className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                                onClick={() => navigate(link.path)}
                            >
                                {link.name}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Mobile Search Overlay */}
            <AnimatePresence>
                {isMobileSearchOpen && (
                    <motion.div
                        ref={mobileSearchRef}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mobile-search-overlay"
                    >
                        <form
                            className="mobile-search-form"
                            onSubmit={(e) => {
                                e.preventDefault();
                                const query = searchValue.trim();
                                if (!query) return;
                                navigate(`/search?q=${encodeURIComponent(query)}`);
                                setSearchValue('');
                                setIsMobileSearchOpen(false);
                            }}
                        >
                            <div className="mobile-search-input-wrapper">
                                <input
                                    type="text"
                                    placeholder="Search for medicines..."
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    autoFocus
                                />
                                <button type="submit" className="mobile-search-submit">
                                    <Search size={20} />
                                </button>
                            </div>
                        </form>
                        {suggestions.length > 0 && (
                            <div className="mobile-suggestions-list">
                                {suggestions.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        className="mobile-suggestion-item"
                                        onClick={() => {
                                            navigate(`/search?q=${encodeURIComponent(item)}`);
                                            setSearchValue('');
                                            setIsMobileSearchOpen(false);
                                        }}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mobile-menu"
                    >
                        {navLinks.map((link) => (
                            <button
                                key={link.path}
                                className="mobile-nav-link"
                                onClick={() => {
                                    navigate(link.path);
                                    setIsMobileMenuOpen(false);
                                }}
                            >
                                {link.name}
                            </button>
                        ))}
                        <div className="mobile-menu-divider"></div>
                        <button
                            className="mobile-nav-link font-semibold"
                            onClick={() => {
                                navigate('/login');
                                setIsMobileMenuOpen(false);
                            }}
                        >
                            Login / Sign Up
                        </button>
                        <button
                            className="mobile-nav-link"
                            onClick={() => {
                                navigate('/offers');
                                setIsMobileMenuOpen(false);
                            }}
                        >
                            Offers
                        </button>
                        <button
                            className="mobile-nav-link"
                            onClick={() => {
                                navigate('/need-help');
                                setIsMobileMenuOpen(false);
                            }}
                        >
                            Need Help?
                        </button>

                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
