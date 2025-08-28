import React from 'react';

const mission = "To empower individuals and communities to live safer, healthier lives through innovative technology and compassionate support.";
const vision = "To be the leading platform for proactive safety and well-being, fostering a world where everyone feels secure and cared for.";

const About: React.FC = () => (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem', color : 'white'}}>
        <h1>About Us</h1>
        <section style={{ marginBottom: '2rem' }}>
            <h2>Our Mission</h2>
            <p>{mission}</p>
        </section>
        <section>
            <h2>Our Vision</h2>
            <p>{vision}</p>
        </section>
    </div>
);

export default About;