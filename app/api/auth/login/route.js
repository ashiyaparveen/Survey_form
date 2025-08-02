import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    console.log('Login attempt for email:', email);
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email and password are required' 
      }, { status: 400 });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Please enter a valid email address' 
      }, { status: 400 });
    }
    
    // Try database authentication
    try {
      console.log('Attempting to find user in database...');
      const user = await getUserByEmail(email);
      
      if (!user) {
        console.log('User not found in database');
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid email or password' 
        }, { status: 401 });
      }
      
      console.log('User found, checking password...');
      // Check password (assuming it's hashed in database)
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        console.log('Password validation failed');
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid email or password' 
        }, { status: 401 });
      }
      
      console.log('Password validation successful');
      
      // Return success without JWT token - using simple session approach
      return NextResponse.json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        },
        message: 'Login successful'
      });
      
    } catch (dbError) {
      console.error('Database authentication failed:', dbError.message);
      
      // If database fails, show helpful message
      return NextResponse.json({ 
        success: false, 
        error: 'Database connection failed. Please check your connection and try again.' 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Login failed. Please try again.' 
    }, { status: 500 });
  }
}