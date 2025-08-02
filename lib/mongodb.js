import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 10000,
  connectTimeoutMS: 5000,
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
};

let client;
let clientPromise;

// Detect if we're in a build/static generation phase
const isBuildPhase = process.env.NODE_ENV === 'production' && 
                    (process.env.NEXT_PHASE === 'phase-production-build' || 
                     process.env.CI === 'true' || 
                     !process.env.MONGODB_URI);

console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('Build phase detected:', isBuildPhase);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('CI:', process.env.CI);

async function createConnection() {
  // If we're in build phase, return a mock client to prevent connection attempts
  if (isBuildPhase || !uri) {
    console.log('Build phase or missing URI detected, returning mock client');
    // Return a mock client that satisfies the interface but doesn't connect
    return {
      db: (dbName) => ({
        collection: (collectionName) => ({
          findOne: async (query) => {
            console.log(`Mock findOne called on ${collectionName}:`, query);
            return null;
          },
          find: (query) => ({
            toArray: async () => {
              console.log(`Mock find called on ${collectionName}:`, query);
              return [];
            }
          }),
          insertOne: async (doc) => {
            console.log(`Mock insertOne called on ${collectionName}:`, doc);
            return { insertedId: 'mock-id-' + Date.now() };
          },
          updateOne: async (filter, update) => {
            console.log(`Mock updateOne called on ${collectionName}:`, filter, update);
            return { modifiedCount: 1 };
          },
          deleteOne: async (filter) => {
            console.log(`Mock deleteOne called on ${collectionName}:`, filter);
            return { deletedCount: 1 };
          }
        })
      })
    };
  }
  
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

// Only create the connection promise when it's actually needed
function getClientPromise() {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      console.log('Creating new MongoDB client for development');
      global._mongoClientPromise = createConnection();
    }
    return global._mongoClientPromise;
  } else {
    if (!clientPromise) {
      console.log('Creating new MongoDB client for production');
      clientPromise = createConnection();
    }
    return clientPromise;
  }
}

// Export a function that returns the client promise
export default function getClient() {
  return getClientPromise();
}