import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { searchProducts } from '../api/products';
import './SearchPage.css';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (query) {
            handleSearch();
        }
    }, [query]);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const data = await searchProducts(query);
            setResults(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="srch-page">
            <Header />
            <div className="srch-wrapper">
                {/* Title Row */}
                <div className="srch-title-row">
                    <button className="srch-back" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} />
                    </button>
                    <div className="srch-title-info">
                        <h1>Search Results</h1>
                        <span className="srch-query">for "{query}"</span>
                    </div>
                    {!loading && (
                        <span className="srch-count">{results.length} product{results.length !== 1 ? 's' : ''} found</span>
                    )}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="srch-loading">
                        <div className="loader"></div>
                        <p>Searching...</p>
                    </div>
                ) : results.length > 0 ? (
                    <div className="srch-grid">
                        {results.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                            >
                                <ProductCard {...product} />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="srch-empty">
                        <Search size={48} strokeWidth={1} />
                        <h2>No results found</h2>
                        <p>Try searching for different keywords or browse our categories.</p>
                        <button className="srch-browse-btn" onClick={() => navigate('/categories')}>
                            Browse Categories
                        </button>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default SearchPage;
