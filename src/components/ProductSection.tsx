import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import './ProductSection.css';

interface ProductSectionProps {
    title: string;
    subtitle?: React.ReactNode;
    children: React.ReactNode;
    theme?: 'light' | 'mint' | 'soft';
    onViewAll?: () => void;
}

const ProductSection = ({ title, subtitle, children, theme = 'light', onViewAll }: ProductSectionProps) => {
    return (
        <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={`product-section theme-${theme}`}
        >
            <div className="section-header">
                <div className="header-text">
                    <h2 className="section-title">{title}</h2>
                    {subtitle && <div className="section-subtitle">{subtitle}</div>}
                </div>
                <button className="view-all-btn" onClick={onViewAll}>
                    <span>View all products</span>
                    <ChevronRight size={18} />
                </button>
            </div>
            <div className="products-grid">
                {children}
            </div>
        </motion.section>
    );
};

export default ProductSection;
