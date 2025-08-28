import React from "react";
const Help: React.FC = () => (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 24 , color: 'white' }}>
        <h1>How to Use the Website</h1>
        <ol>
            <li>
                <strong>Register or Login:</strong> Create an account or log in with your credentials.
            </li>
            <li>
                <strong>Explore Features:</strong> Navigate through the dashboard to access all available features.
            </li>
            <li>
                <strong>Get Help:</strong> Visit this Help page anytime for guidance.
            </li>
            <li>
                <strong>Contact Support:</strong> Use the contact section below if you need further assistance.
            </li>
        </ol>

        <h2>Contact Us</h2>
        <p>
            If you have any questions, feedback, or need support, please reach out:
        </p>
        <ul>
            <li>Email: <a href="mailto:aniketbhandwalkar83@gmail.com">aniketbhandwalkar83@gmail.com</a></li>
            <li>Phone: <a href="tel:+919356800576">+91 9356800576</a></li>
            <li>Contact Form: <a href="/contact">Click here</a> to fill out our contact form.</li>
        </ul>
    </div>
);

export default Help;
