import { NextResponse } from 'next/server';
import { getAllSurveys, createSurvey } from '@/models/Survey';

export async function GET() {
  try {
    const surveys = await getAllSurveys();
    return NextResponse.json(Array.isArray(surveys) ? surveys : []);
  } catch (error) {
    console.error('Error fetching surveys:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request) {
  console.log('=== POST /api/surveys called ===');
  console.log('Request method:', request.method);
  console.log('Request URL:', request.url);
  
  try {
    console.log('Testing MongoDB connection...');
    const testSurveys = await getAllSurveys();
    console.log('MongoDB connection test successful, existing surveys count:', testSurveys.length);
    
    const body = await request.json();
    console.log('Received survey data:', body);
    
    const { title, description, questions, createdBy } = body;
    if (!title || !title.trim()) {
      console.log('Validation failed: missing title');
      return NextResponse.json({ error: 'Survey title is required' }, { status: 400 });
    }
    
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      console.log('Validation failed: missing or invalid questions');
      return NextResponse.json({ error: 'At least one question is required' }, { status: 400 });
    }
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.question || !question.question.trim()) {
        console.log(`Validation failed: question ${i + 1} is empty`);
        return NextResponse.json({ error: `Question ${i + 1} text is required` }, { status: 400 });
      }
    }
    
    console.log('All validations passed');
    const surveyData = {
      title: title.trim(),
      description: description || '',
      questions: questions || [],
      createdBy: createdBy || 'anonymous',
      createdAt: new Date(),
      isActive: true,
      responses: []
    };
    
    console.log('Creating survey with data:', surveyData);
    const result = await createSurvey(surveyData);
    console.log('Survey creation result:', result);
    
    if (result && result.insertedId) {
      console.log('Survey created successfully with ID:', result.insertedId);
      return NextResponse.json({ success: true, id: result.insertedId });
    } else {
      console.log('Survey creation failed - no insertedId returned');
      return NextResponse.json({ error: 'Failed to create survey - database operation failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating survey:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ error: 'Failed to create survey: ' + error.message }, { status: 500 });
  }
}