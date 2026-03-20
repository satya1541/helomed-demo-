import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../api/products';
import './Categories.css';

const Categories = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const s3BaseUrl = 'https://helomed.s3.ap-south-2.amazonaws.com/';

    const resolveImageUrl = (value?: string) => {
        if (!value) return '/images/categories/others.png';
        if (value.startsWith('http') || value.startsWith('/')) return value;
        return `${s3BaseUrl}${value}`;
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                if (Array.isArray(data)) {
                    const mapped = data.slice(0, 6).map((cat: any) => {
                        return {
                            id: cat.id,
                            name: cat.name.charAt(0).toUpperCase() + cat.name.slice(1),
                            image: resolveImageUrl(cat.icon_url),
                        };
                    });
                    setCategories(mapped);
                }
            } catch (error) {
                console.error("Failed to fetch categories", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    return (
        <section className="categories-section-modern">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="category-header-row"
            >
                <div className="section-title-group">
                    <span className="section-tag-new">Browse</span>
                    <h2 className="section-title-modern">Shop by Category</h2>
                </div>
                <button className="view-all-text-btn" onClick={() => navigate('/categories')}>View All Categories</button>
            </motion.div>

            <div className="categories-list-premium">
                {loading ? (
                    <div className="loading-state">
                        <Loader2 size={32} className="spin" />
                    </div>
                ) : categories.map((cat, index) => (
                    <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -4 }}
                        className="cat-card-premium"
                        onClick={() => navigate(`/medicines?category=${cat.id}`)}
                    >
                        <div className="cat-image-wrapper">
                            <img src={cat.image} alt={cat.name} className="cat-image" />
                        </div>
                        <p className="cat-name-modern">{cat.name}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Categories;
