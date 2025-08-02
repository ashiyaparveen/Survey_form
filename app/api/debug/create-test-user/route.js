import { NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    const testName = 'Test User';
    
    console.log('=== Creating test user ===');
    
    // Check if user already exists
    const existingUser = await getUserByEmail(testEmail);
    
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'Test user already exists',
        user: {
          email: existingUser.email,
          name: existingUser.name,
          id: existingUser._id
        }
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    
    // Create user
    const userData = {
      name: testName,
      email: testEmail,
      password: hashedPassword,
      createdAt: new Date(),
      isActive: true
    };
    
    const result = await createUser(userData);
    
    if (result.insertedId) {
      return NextResponse.json({
        success: true,
        message: 'Test user created successfully',
        user: {
          id: result.insertedId,
          email: testEmail,
          name: testName
        },
        loginCredentials: {
          email: testEmail,
          password: testPassword,
          note: "Use these credentials to test login functionality"
        }
      });
    } else {
      throw new Error('Failed to create test user');
    }
    
  } catch (error) {
    console.error('Error creating test user:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}