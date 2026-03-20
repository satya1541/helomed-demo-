import { Quote } from 'lucide-react';
import './Reviews.css';

const reviews = [
    {
        id: 1,
        text: "Excellent services of good doctors. Very easy app to use. I am using this app since last 3 years.",
        author: "Ankit Jain",
        date: "2 days ago"
    },
    {
        id: 2,
        text: "Excellent services of good doctors. Very easy app to use. I am using this app since last 3 years.",
        author: "Sneha Roy",
        date: "1 week ago"
    }
];

const Reviews = () => {
    return (
        <section className="reviews-section">
            <h2 className="section-title">From our happy customers</h2>
            <div className="reviews-grid">
                {reviews.map((review) => (
                    <div key={review.id} className="review-card">
                        <Quote size={32} className="quote-icon" />
                        <p className="review-text">{review.text}</p>
                        <div className="review-footer">
                            <span className="review-author">{review.author}</span>
                            <span className="review-date">{review.date}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Reviews;
