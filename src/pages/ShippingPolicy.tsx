import Header from '../components/Header';
import Footer from '../components/Footer';
import './LegalPage.css';

const ShippingPolicy = () => {
    return (
        <div className="legal-page">
            <Header />
            <main className="legal-content container">
                <h1>Shipping & Delivery Policy</h1>
                <p>Last updated: March 7, 2026</p>
                <p><strong>Operated By:</strong> Udi Digi Swasthyatech Private Limited</p>
                <p>Registered Office: Bhubaneswar, Odisha, India</p>

                <section>
                    <h2>Overview</h2>
                    <p>
                        HeloMed provides medicine delivery through partner pharmacies and delivery partners.
                    </p>
                </section>

                <section>
                    <h2>Delivery Areas</h2>
                    <p>
                        Delivery availability depends on operational areas supported by pharmacies and logistics partners.
                    </p>
                </section>

                <section>
                    <h2>Delivery Time</h2>
                    <p>
                        <strong>Typical delivery window: 30 minutes to 2 hours</strong> depending on location.
                    </p>
                </section>

                <section>
                    <h2>Delivery Charges</h2>
                    <p>Delivery charges may vary based on:</p>
                    <ul>
                        <li>Distance</li>
                        <li>Time of delivery</li>
                        <li>Demand</li>
                        <li>Platform promotions</li>
                    </ul>
                    <p><strong>Taxes are applied only on delivery fees.</strong></p>
                </section>

                <section>
                    <h2>Delivery Partners</h2>
                    <p>
                        Orders are delivered by independent delivery partners who are responsible for maintaining package 
                        integrity and ensuring safe delivery of medicines.
                    </p>
                </section>

                <section>
                    <h2>Delivery Issues</h2>
                    <p>
                        If you experience any issues with delivery, please report them immediately through the HeloMed 
                        application or website with your order details.
                    </p>
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

export default ShippingPolicy;
