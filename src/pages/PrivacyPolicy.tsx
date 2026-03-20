import Header from '../components/Header';
import Footer from '../components/Footer';
import './LegalPage.css';

const PrivacyPolicy = () => {
    return (
        <div className="legal-page">
            <Header />
            <main className="legal-content container">
                <h1>Privacy Policy</h1>
                <p>Last updated: March 7, 2026</p>
                <p><strong>Operated By:</strong> Udi Digi Swasthyatech Private Limited</p>
                <p>Registered Office: Bhubaneswar, Odisha, India</p>

                <section>
                    <h2>Information Collected</h2>
                    <p>HeloMed may collect:</p>
                    <ul>
                        <li>Name</li>
                        <li>Contact number</li>
                        <li>Email address</li>
                        <li>Delivery address</li>
                        <li>Prescription images</li>
                        <li>Health data (if voluntarily provided)</li>
                        <li>ABHA registration information</li>
                    </ul>
                </section>

                <section>
                    <h2>Purpose of Data Use</h2>
                    <p>Information is used for:</p>
                    <ul>
                        <li>Order processing</li>
                        <li>Delivery coordination</li>
                        <li>Healthcare service facilitation</li>
                        <li>ABHA registration</li>
                        <li>Ambulance booking</li>
                        <li>Customer support</li>
                        <li>Fraud prevention</li>
                    </ul>
                </section>

                <section>
                    <h2>Data Protection</h2>
                    <p>
                        HeloMed uses industry-standard security measures including:
                    </p>
                    <ul>
                        <li>Secure servers</li>
                        <li>Encryption protocols</li>
                        <li>Access control</li>
                    </ul>
                    <p>to protect user information.</p>
                </section>

                <section>
                    <h2>Data Sharing</h2>
                    <p>Information may be shared with:</p>
                    <ul>
                        <li>Partner pharmacies</li>
                        <li>Delivery partners</li>
                        <li>Payment gateways</li>
                        <li>Government systems (for ABHA)</li>
                    </ul>
                    <p><strong>User data is not sold to third parties.</strong></p>
                </section>

                <section>
                    <h2>Your Rights</h2>
                    <p>
                        Users have the right to access, correct, or request deletion of their personal data in accordance 
                        with applicable Indian laws including the Digital Personal Data Protection Act, 2023.
                    </p>
                </section>

                <section>
                    <h2>Contact for Privacy Concerns</h2>
                    <p>
                        For privacy-related queries or requests, please contact us through the HeloMed application or website.
                    </p>
                    <p><strong>Company:</strong> Udi Digi Swasthyatech Private Limited</p>
                    <p><strong>Registered Office:</strong> Bhubaneswar, Odisha, India</p>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
