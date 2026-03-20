import Header from '../components/Header';
import Footer from '../components/Footer';
import './LegalPage.css';

const TermsOfService = () => {
    return (
        <div className="legal-page">
            <Header />
            <main className="legal-content container">
                <h1>Terms & Conditions</h1>
                <p>Last updated: March 7, 2026</p>
                <p><strong>Operated By:</strong> Udi Digi Swasthyatech Private Limited</p>
                <p>Registered under Ministry of Corporate Affairs (MCA), Government of India</p>
                <p>Registered Office: Bhubaneswar, Odisha, India</p>

                <section>
                    <h2>About HeloMed Platform</h2>
                    <p>
                        HeloMed is a digital healthcare facilitation platform providing:
                    </p>
                    <ul>
                        <li>Medicine delivery through licensed pharmacies</li>
                        <li>ABHA registration assistance</li>
                        <li>Ambulance booking services</li>
                    </ul>
                </section>

                <section>
                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using the HeloMed mobile application or web application, users agree to comply with these Terms and Conditions.
                        These terms govern the use of services provided by Udi Digi Swasthyatech Private Limited.
                        If users do not agree to these terms, they must discontinue the use of the platform.
                    </p>
                </section>

                <section>
                    <h2>2. Nature of Platform</h2>
                    <p><strong>HeloMed is a technology platform only.</strong></p>
                    <ul>
                        <li>HeloMed does not manufacture, sell, or dispense medicines directly.</li>
                        <li>Medicines are supplied by independent licensed pharmacies registered on the platform.</li>
                    </ul>
                    <p>HeloMed only facilitates:</p>
                    <ul>
                        <li>Order placement</li>
                        <li>Order routing to pharmacies</li>
                        <li>Delivery logistics</li>
                        <li>Payment processing</li>
                        <li>Healthcare service facilitation</li>
                    </ul>
                </section>

                <section>
                    <h2>3. Services Offered</h2>
                    <p>The platform currently offers:</p>
                    <ol>
                        <li>Medicine delivery</li>
                        <li>Healthcare essentials delivery</li>
                        <li>ABHA (Ayushman Bharat Health Account) registration assistance</li>
                        <li>Ambulance booking facilitation</li>
                        <li>Healthcare related service enablement</li>
                    </ol>
                    <p>Services may expand or change at any time.</p>
                </section>

                <section>
                    <h2>4. User Eligibility</h2>
                    <p>Users must:</p>
                    <ul>
                        <li>Be 18 years or older</li>
                        <li>Provide accurate personal details</li>
                        <li>Use the platform legally</li>
                        <li>Upload valid prescriptions when required</li>
                    </ul>
                    <p>Users are responsible for ensuring prescriptions are issued by registered medical practitioners.</p>
                </section>

                <section>
                    <h2>5. Prescription Medicines</h2>
                    <p>For prescription drugs:</p>
                    <ul>
                        <li>A valid prescription must be uploaded</li>
                        <li>Pharmacies may verify prescription authenticity</li>
                        <li>Orders may be rejected if prescription is invalid</li>
                    </ul>
                    <p>HeloMed reserves the right to cancel suspicious or non-compliant orders.</p>
                </section>

                <section>
                    <h2>6. Pricing and Charges</h2>
                    <ul>
                        <li>Medicine prices are determined by retail pharmacy partners.</li>
                        <li>HeloMed does not control medicine pricing.</li>
                    </ul>
                    <p>The platform charges only:</p>
                    <ul>
                        <li>Delivery Fees</li>
                        <li>Applicable taxes on delivery fees</li>
                    </ul>
                    <p>Taxes are charged in compliance with Indian tax laws.</p>
                </section>

                <section>
                    <h2>7. Payment</h2>
                    <p>Users may pay through:</p>
                    <ul>
                        <li>UPI</li>
                        <li>Debit/Credit Cards</li>
                        <li>Net Banking</li>
                        <li>Wallets</li>
                        <li>Payment Gateway providers</li>
                    </ul>
                    <p>Payment processing is handled by third-party payment gateways. HeloMed does not store full card details.</p>
                </section>

                <section>
                    <h2>8. Delivery</h2>
                    <p>Orders are delivered by independent delivery partners. Delivery time depends on:</p>
                    <ul>
                        <li>Pharmacy readiness</li>
                        <li>Distance</li>
                        <li>Traffic conditions</li>
                        <li>Delivery partner availability</li>
                    </ul>
                    <p>Delivery timelines shown on the platform are estimates only.</p>
                    <p>HeloMed is not liable for delays due to:</p>
                    <ul>
                        <li>Natural disasters</li>
                        <li>Traffic conditions</li>
                        <li>System outages</li>
                        <li>Pharmacy delays</li>
                    </ul>
                </section>

                <section>
                    <h2>9. Limitation of Liability</h2>
                    <p><strong>HeloMed is a technology facilitator only.</strong></p>
                    <p>The company is not responsible for:</p>
                    <ul>
                        <li>Medical advice</li>
                        <li>Medicine misuse</li>
                        <li>Pharmacy negligence</li>
                        <li>Ambulance service performance</li>
                    </ul>
                    <p>Users must consult registered medical professionals before consuming medicines.</p>
                </section>

                <section>
                    <h2>10. Governing Law</h2>
                    <p>
                        These policies are governed by the laws of India. Any disputes shall fall under the jurisdiction 
                        of courts located in <strong>Bhubaneswar, Odisha</strong>.
                    </p>
                </section>

                <section>
                    <h2>11. Contact Information</h2>
                    <p><strong>Company Name:</strong> Udi Digi Swasthyatech Private Limited</p>
                    <p><strong>Registered Office:</strong> Bhubaneswar, Odisha, India</p>
                    <p><strong>Support Contact:</strong> Through HeloMed mobile application or website.</p>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default TermsOfService;
