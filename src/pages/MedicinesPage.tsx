import { useState, useEffect } from 'react';
import { Search, Filter, ChevronRight, Trash2 } from 'lucide-react';

import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { getCategories, getAllProducts, getProductsByCategory } from '../api/products';
import './MedicinesPage.css';

const MedicinesPage = () => {
    const [searchParams] = useSearchParams();
    const initialCategory = searchParams.get('category') ? Number(searchParams.get('category')) : null;

    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(initialCategory);
    const [loading, setLoading] = useState(true);
    const [catLoading, setCatLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            setCatLoading(true);
            try {
                const catData = await getCategories();
                if (Array.isArray(catData)) {
                    setCategories(catData);
                }
            } catch (err) {
                console.error("Failed to fetch categories", err);
            } finally {
                setCatLoading(false);
            }

            setLoading(true);
            try {
                if (initialCategory) {
                    const res = await getProductsByCategory(initialCategory);
                    setProducts(res.products || []);
                } else {
                    const prodData = await getAllProducts();
                    if (Array.isArray(prodData)) {
                        setProducts(prodData);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch products", err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const handleCategorySelect = async (categoryId: number | null) => {
        setSelectedCategory(categoryId);
        setLoading(true);
        try {
            if (categoryId === null) {
                const all = await getAllProducts();
                setProducts(all || []);
            } else {
                const res = await getProductsByCategory(categoryId);
                setProducts(res.products || []);
            }
        } catch (err) {
            console.error("Category fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredBySearch = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedCatName = categories.find(c => c.id === selectedCategory)?.name;

    return (
        <div className="med-page">
            <Header />

            <div className="med-page-wrapper">
                {/* Page Title & Search */}
                <div className="med-page-header">
                    <div className="med-title-row">
                        <Search size={28} />
                        <h1>Medicines & Supplements</h1>
                        {selectedCatName && (
                            <span className="med-active-cat">
                                {selectedCatName}
                                <button onClick={() => handleCategorySelect(null)}><Trash2 size={12} /></button>
                            </span>
                        )}
                    </div>
                    <div className="med-search-bar">
                        <Search size={18} className="med-search-icon" />
                        <input
                            type="text"
                            placeholder="Search medicines, supplements..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="med-search-input"
                        />
                        {searchQuery && (
                            <button className="med-search-clear" onClick={() => setSearchQuery('')}>
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="med-layout">
                    {/* Sidebar */}
                    <aside className="med-sidebar">
                        <div className="ms-card">
                            <div className="ms-header">
                                <Filter size={16} />
                                <h3>Categories</h3>
                            </div>
                            <div className="ms-links">
                                <button
                                    className={`ms-link ${selectedCategory === null ? 'active' : ''}`}
                                    onClick={() => handleCategorySelect(null)}
                                >
                                    All Products
                                    <ChevronRight size={13} />
                                </button>
                                {catLoading ? (
                                    <div className="ms-loading">
                                        <div className="loader" style={{ width: 80, height: 12 }}></div>
                                    </div>
                                ) : categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        className={`ms-link ${selectedCategory === cat.id ? 'active' : ''}`}
                                        onClick={() => handleCategorySelect(cat.id)}
                                    >
                                        {cat.name}
                                        <ChevronRight size={13} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="med-content">
                        {/* Results count */}
                        {!loading && (
                            <div className="med-results-bar">
                                <span className="mr-count">{filteredBySearch.length} product{filteredBySearch.length !== 1 ? 's' : ''}</span>
                                {searchQuery && <span className="mr-query">for "{searchQuery}"</span>}
                            </div>
                        )}

                        {loading ? (
                            <div className="med-loading">
                                <div className="loader"></div>
                                <p>Loading products...</p>
                            </div>
                        ) : filteredBySearch.length > 0 ? (
                            <div className="med-grid">
                                {filteredBySearch.map((p) => (
                                    <ProductCard key={p.id} {...p} />
                                ))}
                            </div>
                        ) : (
                            <div className="med-no-results">
                                <Search size={36} />
                                <h3>No products found</h3>
                                <p>Try adjusting your search or category filter.</p>
                                <button className="mnr-clear" onClick={() => { setSearchQuery(''); handleCategorySelect(null); }}>
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default MedicinesPage;
