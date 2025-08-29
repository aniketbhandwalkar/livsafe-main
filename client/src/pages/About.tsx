import React from 'react';

const mission = "To empower individuals and communities to live safer, healthier lives through innovative technology and compassionate support.";
const vision = "To be the leading platform for proactive safety and well-being, fostering a world where everyone feels secure and cared for.";
const team="We are a team of students from Yeshwantrao Chavhan College of Engineering, Nagpur, Maharastra. This project was developed for  Final year project, the website is a blend of AI capibilities for solving the complex and very majorly faced liver fibrosis with a touch of modern web development to make your experince as professional and smooth as possible, Our team consists of Aditya Bhongade (Leader, developed AI grading model and LLM),  Aniket Bhandwalkar (Designed backend ), Akshay Bhongade (Designed Frontend), Aradhya Chilamwar (Designed UI?UX and functionalities of site), Dhiren Dahiwale (Designed Database Scehma and helped in intergrating)"

const About: React.FC = () => (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem', color : 'white'}}>
        <h1>About Us</h1>
        <section style={{ marginBottom: '2rem' }}>
            <h1>Our Mission</h1>
            <p>{mission}</p>
        </section>
        <section>
            <h2>Our Vision</h2>
            <p>{vision}</p>
        </section>
        <section style={{ marginBottom: '2rem' , marginTop: '2rem'}}>
            <h1><b>Meet Our Team</b></h1>
            <p>{team}</p>
        </section>
    </div>
);

export default About;