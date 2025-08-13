import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Organization from '../models/Organization.js';
import MedicalImage from '../models/MedicalImage.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const seedTestData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Organization.deleteMany({});
    await MedicalImage.deleteMany({});
    console.log('Cleared existing data...');

    // Create test organization
    const organization = await Organization.create({
      name: 'City General Hospital',
      email: 'admin@citygeneral.com',
      password: 'admin123',
      type: 'hospital'
    });
    console.log('Created test organization...');

    // Create test doctor
    const doctor = await Doctor.create({
      fullName: 'Dr. John Smith',
      email: 'doctor@example.com',
      password: 'password123',
      specialty: 'Hepatology',
      organization: organization._id
    });
    console.log('Created test doctor...');

    // Create test patients
    const patients = await Patient.create([
      {
        fullName: 'Alice Johnson',
        email: 'alice@example.com',
        age: 45,
        gender: 'female',
        phone: '+1-234-567-8901',
        address: {
          street: '456 Patient St',
          city: 'Patient City',
          state: 'PC',
          zipCode: '54321',
          country: 'USA'
        },
        doctors: [doctor._id]
      },
      {
        fullName: 'Bob Williams',
        email: 'bob@example.com',
        age: 52,
        gender: 'male',
        phone: '+1-234-567-8902',
        address: {
          street: '789 Health Ave',
          city: 'Health City',
          state: 'HC',
          zipCode: '67890',
          country: 'USA'
        },
        doctors: [doctor._id]
      }
    ]);
    console.log('Created test patients...');

    // Update doctor with patients
    doctor.patients = patients.map(p => p._id as any);
    await doctor.save();

    // Create test medical images/records
    await MedicalImage.create([
      {
        patient: patients[0]._id,
        doctor: doctor._id,
        imageUrl: '/uploads/liver_scan_001.jpg',
        description: 'Liver ultrasound scan showing mild fibrosis markers',
        grade: 'F1',
        confidence: 85.5
      },
      {
        patient: patients[1]._id,
        doctor: doctor._id,
        imageUrl: '/uploads/liver_scan_002.jpg',
        description: 'Liver ultrasound scan showing moderate fibrosis with portal inflammation',
        grade: 'F2',
        confidence: 92.3
      }
    ]);
    console.log('Created test medical records...');

    console.log('\n✅ Test data seeded successfully!');
    console.log('\nTest Login Credentials:');
    console.log('Email: doctor@example.com');
    console.log('Password: password123');
    
    console.log('\nOrganization Login:');
    console.log('Email: admin@citygeneral.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seeder
seedTestData();
