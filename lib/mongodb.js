import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  serverSelectionTimeoutMS: 5000, // Shorter timeout for local connection
  socketTimeoutMS: 10000,
  connectTimeoutMS: 5000,
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
  // Local MongoDB doesn't need retryWrites/retryReads
};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

async function createConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('URI format check:', uri ? 'URI is set' : 'URI is missing');
    
    const client = new MongoClient(uri, options);
    await client.connect();
    
    // Test the connection
    await client.db('admin').command({ ping: 1 });
    console.log('MongoDB connected and ping successful');
    
    return client;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    
    // Provide specific error messages for common issues
    if (error.message.includes('ETIMEDOUT') || error.message.includes('ECONNREFUSED')) {
      console.error('Connection failed - possible causes:');
      console.error('1. MongoDB is not running locally');
      console.error('2. MongoDB is running on a different port (check if it\'s 27017)');
      console.error('3. MongoDB Compass is connected but MongoDB service is not running');
      console.error('4. Check MongoDB service status');
    } else if (error.message.includes('authentication failed')) {
      console.error('Authentication failed - check username/password');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('DNS resolution failed - check connection string');
    }
    
    throw error;
  }
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    console.log('Creating new MongoDB client for development');
    global._mongoClientPromise = createConnection();
  }
  clientPromise = global._mongoClientPromise;
} else {
  console.log('Creating new MongoDB client for production');
  clientPromise = createConnection();
}

export default clientPromise;
