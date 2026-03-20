import Header from '../components/Header';
import Footer from '../components/Footer';
import './LegalPage.css';

const RefundPolicy = () => {
    return (
        <div className="legal-page">
            <Header />
            <main className="legal-content container">
                <h1>Cancellation, Return & Refund Policy</h1>
                <p>Last updated: March 7, 2026</p>
                <p><strong>Operated By:</strong> Udi Digi Swasthyatech Private Limited</p>
                <p>Registered Office: Bhubaneswar, Odisha, India</p>

                <section>
                    <h2>Cancellation Policy</h2>
                    <p>Customers may cancel orders under the following conditions:</p>
                    
                    <h3>Before Pharmacy Acceptance</h3>
                    <p>
                        Orders may be cancelled without penalty if the pharmacy has not yet accepted the order.
                    </p>

                    <h3>After Pharmacy Acceptance</h3>
                    <p>
                        Once a pharmacy has accepted the order and started preparing the package, cancellation may not be allowed.
                    </p>

                    <h3>After Dispatch</h3>
                    <p>
                        If the order has already been picked up by the delivery partner, cancellation is not permitted. 
                        This is due to the sensitive nature of medicines.
                    </p>

                    <h3>Platform Cancellation</h3>
                    <p>HeloMed may cancel orders if:</p>
                    <ul>
                        <li>Medicine is unavailable</li>
                        <li>Prescription is invalid</li>
                        <li>Payment failure occurs</li>
                        <li>System errors occur</li>
                        <li>Regulatory compliance issues arise</li>
                    </ul>
                    <p>Refunds will be initiated where applicable.</p>
                </section>

                <section>
                    <h2>Return Policy</h2>
                    <p>
                        <strong>Due to the safety-sensitive nature of pharmaceutical products, HeloMed follows a strict No-Return Policy.</strong>
                    </p>
                    <p>
                        Medicines cannot be returned once delivered and accepted by the customer.
                    </p>
                    <p>This policy ensures:</p>
                    <ul>
                        <li>Patient safety</li>
                        <li>Prevention of tampering</li>
                        <li>Regulatory compliance</li>
                    </ul>

                    <h3>Exceptions</h3>
                    <p>Returns may only be accepted in the following cases:</p>
                    <ol>
                        <li>Damaged medicines during delivery</li>
                        <li>Expired medicines received</li>
                        <li>Incorrect medicines delivered</li>
                        <li>Packaging seal broken before delivery</li>
                    </ol>
                    <p><strong>Customers must report such issues within 24 hours of delivery.</strong></p>
                </section>

                <section>
                    <h2>Refund Processing</h2>
                    <p>After verification, refunds may be processed via:</p>
                    <ul>
                        <li>Original payment method</li>
                        <li>Wallet credit</li>
                        <li>Bank transfer</li>
                    </ul>
                    <p><strong>Refund timeline: 5-7 business days.</strong></p>
                </section>

                <section>
                    <h2>How to Report Issues</h2>
                    <p>
                        For cancellation requests or return claims, please contact us immediately through the HeloMed 
                        application or website with:
                    </p>
                    <ul>
                        <li>Order ID</li>
                        <li>Issue description</li>
                        <li>Supporting photos (for damaged/wrong items)</li>
                    </ul>
                </section>

                <section>
                    <h2>Contact Information</h2>
                    <p><strong>Company Name:</strong> Udi Digi Swasthyatech Private Limited</p>
                    <p><strong>Registered Office:</strong> Bhubaneswar, Odisha, India</p>
                    <p><strong>Support Contact:</strong> Through HeloMed mobile application or website.</p>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default RefundPolicy;
