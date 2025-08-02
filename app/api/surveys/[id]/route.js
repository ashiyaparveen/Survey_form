import { NextResponse } from 'next/server';
import { getSurveyById, updateSurvey, deleteSurvey } from '@/models/Survey';

export async function GET(request, { params }) {
  try {
    const survey = await getSurveyById(params.id);
    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }
    return NextResponse.json(survey);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch survey' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const result = await updateSurvey(params.id, body);
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update survey' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const result = await deleteSurvey(params.id);
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete survey' }, { status: 500 });
  }
}