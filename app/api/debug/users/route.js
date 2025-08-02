import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('=== Debug: Listing all users ===');
    
    const client = await clientPromise;
    const db = client.db('surveyform');
    const users = db.collection('users');
    
    // Get all users (without passwords for security)
    const allUsers = await users.find({}, { 
      projection: { 
        password: 0  // Exclude password field
      } 
    }).toArray();
    
    console.log('Found users:', allUsers.length);
    
    return NextResponse.json({
      success: true,
      count: allUsers.length,
      users: allUsers.map(user => ({
        id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        isActive: user.isActive
      }))
    });
    
  } catch (error) {
    console.error('Error listing users:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}