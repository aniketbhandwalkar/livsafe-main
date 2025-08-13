const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
    try {
        console.log('Testing MongoDB connection...');
        console.log('Connection URI:', process.env.MONGO_URI ? 'URI is set' : 'URI is missing');
        
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Successfully connected to MongoDB!');
        console.log('Database:', conn.connection.name);
        console.log('Host:', conn.connection.host);
        console.log('Port:', conn.connection.port);
        
        // Test a simple operation
        await mongoose.connection.db.admin().ping();
        console.log('✅ Database ping successful!');
        
        await mongoose.disconnect();
        console.log('✅ Disconnected successfully');
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        if (error.message.includes('authentication')) {
            console.log('💡 Check your username and password in the connection string');
        }
        if (error.message.includes('network')) {
            console.log('💡 Check your internet connection and firewall settings');
        }
    }
}

testConnection();
