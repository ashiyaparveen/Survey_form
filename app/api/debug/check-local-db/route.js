import { NextResponse } from 'next/server';
import getClient from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('=== Checking Local MongoDB Connection ===');
    
    const client = await getClient();
    console.log('✓ Connected to MongoDB');
    
    // List all databases
    const adminDb = client.db().admin();
    const databases = await adminDb.listDatabases();
    console.log('Available databases:', databases.databases.map(db => db.name));
    
    // Check the surveyform database specifically
    const db = client.db('surveyform');
    const collections = await db.listCollections().toArray();
    console.log('Collections in surveyform database:', collections.map(c => c.name));
    
    // Check users collection specifically
    const users = db.collection('users');
    const userCount = await users.countDocuments();
    console.log('Number of users in collection:', userCount);
    
    // Get sample users (without passwords)
    const sampleUsers = await users.find({}, { 
      projection: { password: 0 },
      limit: 5 
    }).toArray();
    
    return NextResponse.json({
      success: true,
      connection: 'Local MongoDB connected successfully',
      databases: databases.databases.map(db => ({
        name: db.name,
        sizeOnDisk: db.sizeOnDisk
      })),
      surveyformCollections: collections.map(c => c.name),
      userCount: userCount,
      sampleUsers: sampleUsers,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Local MongoDB connection test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}