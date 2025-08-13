import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not set');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(uri);
    console.log('✅ Connected. DB:', conn.connection.name, 'Host:', conn.connection.host);
    await mongoose.connection.db.admin().ping();
    console.log('✅ Ping OK');
  } catch (err) {
    console.error('❌ Connection error:', (err as Error).message);
  } finally {
    await mongoose.disconnect();
  }
}

main();

