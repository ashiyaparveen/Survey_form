import getClient from '@/lib/mongodb';

export async function getUserByEmail(email) {
  try {
    console.log('getUserByEmail: Connecting to database...');
    const client = await getClient();
    console.log('getUserByEmail: Connected to MongoDB client');
    
    const db = client.db('surveyform');
    console.log('getUserByEmail: Accessing surveyform database');
    
    const users = db.collection('users');
    console.log('getUserByEmail: Accessing users collection');
    
    console.log('getUserByEmail: Searching for user with email:', email);
    const user = await users.findOne({ email: email });
    
    if (user) {
      console.log('getUserByEmail: User found with ID:', user._id);
    } else {
      console.log('getUserByEmail: No user found with email:', email);
    }
    
    return user;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
}

export async function createUser(userData) {
  try {
    const client = await getClient();
    const db = client.db('surveyform');
    const users = db.collection('users');
    
    const result = await users.insertOne(userData);
    return result;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function getUserById(userId) {
  try {
    const client = await getClient();
    const db = client.db('surveyform');
    const users = db.collection('users');
    
    const { ObjectId } = require('mongodb');
    const user = await users.findOne({ _id: new ObjectId(userId) });
    return user;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
}