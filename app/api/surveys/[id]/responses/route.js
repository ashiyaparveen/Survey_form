import { NextResponse } from 'next/server';
import { submitSurveyResponse } from '@/models/Survey';

export async function POST(request, { params }) {
  try {
    const body = await request.json();
    const { responses, respondentEmail } = body;

    const responseData = {
      surveyId: params.id,
      responses,
      respondentEmail: respondentEmail || 'anonymous',
      submittedAt: new Date()
    };
    const result = await submitSurveyResponse(params.id, responseData);
    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit response' }, { status: 500 });
  }
}