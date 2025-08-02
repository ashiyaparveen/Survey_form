import { NextResponse } from 'next/server';

let surveys = [];
let nextId = 1;

export async function GET() {
  console.log('GET /api/surveys/local called');
  console.log('Current surveys:', surveys);
  return NextResponse.json(surveys);
}
export async function POST(request) {
  console.log('POST /api/surveys/local called');
  
  try {
    const body = await request.json();
    console.log('Received survey data:', body);
    
    const { title, description, questions, createdBy } = body;
    
    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Survey title is required' }, { status: 400 });
    }
    
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'At least one question is required' }, { status: 400 });
    }
    
    const survey = {
      _id: nextId.toString(),
      title: title.trim(),
      description: description || '',
      questions: questions || [],
      createdBy: createdBy || 'anonymous',
      createdAt: new Date(),
      isActive: true,
      responses: []
    };
    
    surveys.push(survey);
    nextId++;
    
    console.log('Survey created successfully:', survey);
    console.log('Total surveys now:', surveys.length);
    
    return NextResponse.json({ success: true, id: survey._id });
  } catch (error) {
    console.error('Error creating survey:', error);
    return NextResponse.json({ error: 'Failed to create survey: ' + error.message }, { status: 500 });
  }
}