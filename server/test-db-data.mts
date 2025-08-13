import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testDatabase() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('✅ Connected successfully');

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📊 Collections in database:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });

    // Check if we have any data
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`  ${collection.name}: ${count} documents`);
    }

    // Test a simple query
    console.log('\n🔍 Testing queries...');
    
    // Check if we can create a simple document (test collection)
    const testCollection = mongoose.connection.db.collection('test');
    await testCollection.insertOne({ test: 'data', timestamp: new Date() });
    console.log('✅ Insert test passed');
    
    await testCollection.deleteMany({ test: 'data' });
    console.log('✅ Delete test passed');

  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

testDatabase();
