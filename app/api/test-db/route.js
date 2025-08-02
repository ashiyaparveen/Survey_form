import { NextResponse } from 'next/server';
import getClient from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('=== MongoDB Connection Test Started ===');
    const connectionTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection test timeout after 10 seconds')), 10000);
    });
    
    const connectionTest = async () => {
      console.log('Testing MongoDB connection...');
      const client = await getClient();
      console.log('✓ Client connected successfully');
      const db = client.db('surveyform');
      console.log('✓ Database accessed successfully');
      await db.command({ ping: 1 });
      console.log('✓ Database ping successful');
      
      const collections = await db.listCollections().toArray();
      console.log('✓ Collections retrieved:', collections.map(c => c.name));
      
      const testCollection = db.collection('connection_test');
      const testDoc = { test: true, timestamp: new Date(), ip: 'test' };
      const insertResult = await testCollection.insertOne(testDoc);
      console.log('✓ Test document inserted:', insertResult.insertedId);
      
      await testCollection.deleteOne({ _id: insertResult.insertedId });
      console.log('✓ Test document cleaned up');
      
      return {
        success: true,
        message: 'All MongoDB operations successful',
        collections: collections.map(c => c.name),
        timestamp: new Date().toISOString()
      };
    };
    
    const result = await Promise.race([connectionTest(), connectionTimeout]);
    console.log('=== MongoDB Connection Test Completed Successfully ===');
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('=== MongoDB Connection Test Failed ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    let errorType = 'Unknown error';
    let suggestions = [];
    
    if (error.message.includes('ETIMEDOUT')) {
      errorType = 'Connection Timeout';
      suggestions = [
        'Check if your IP address is whitelisted in MongoDB Atlas',
        'Verify your network connection',
        'Check if firewall is blocking the connection',
        'Try connecting from a different network'
      ];
    } else if (error.message.includes('authentication failed')) {
      errorType = 'Authentication Error';
      suggestions = [
        'Verify username and password in connection string',
        'Check database user permissions in MongoDB Atlas',
        'Ensure the user has access to the surveyform database'
      ];
    } else if (error.message.includes('ENOTFOUND')) {
      errorType = 'DNS Resolution Error';
      suggestions = [
        'Check the cluster URL in your connection string',
        'Verify the cluster is running in MongoDB Atlas',
        'Check your internet connection'
      ];
    }
    
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      errorType,
      suggestions,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}