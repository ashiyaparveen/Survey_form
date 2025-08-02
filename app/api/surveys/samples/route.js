import { NextResponse } from 'next/server';
const sampleSurveys = [
  {
    _id: 'sample-1',
    title: 'Customer Satisfaction Survey',
    description: 'Help us improve our services by sharing your experience with our products and customer support.',
    questions: [
      {
        type: 'radio',
        question: 'How satisfied are you with our product?',
        options: 'Very Satisfied,Satisfied,Neutral,Dissatisfied,Very Dissatisfied',
        required: true
      },
      {
        type: 'radio',
        question: 'How would you rate our customer service?',
        options: 'Excellent,Good,Average,Poor,Very Poor',
        required: true
      },
      {
        type: 'textarea',
        question: 'What can we do to improve your experience?',
        required: false
      },
      {
        type: 'radio',
        question: 'Would you recommend us to others?',
        options: 'Definitely,Probably,Not Sure,Probably Not,Definitely Not',
        required: true
      }
    ],
    createdBy: 'Sample Admin',
    createdAt: new Date('2024-01-15'),
    isActive: true,
    isSample: true
  },
  {
    _id: 'sample-2',
    title: 'Product Feedback Survey',
    description: 'Share your thoughts about our new product features and help us prioritize future development.',
    questions: [
      {
        type: 'text',
        question: 'What is your primary use case for our product?',
        required: true
      },
      {
        type: 'radio',
        question: 'How easy is our product to use?',
        options: 'Very Easy,Easy,Moderate,Difficult,Very Difficult',
        required: true
      },
      {
        type: 'checkbox',
        question: 'Which features do you use most often?',
        options: 'Dashboard,Reports,Analytics,Integrations,Mobile App,API',
        required: false
      },
      {
        type: 'radio',
        question: 'How likely are you to continue using our product?',
        options: 'Very Likely,Likely,Neutral,Unlikely,Very Unlikely',
        required: true
      },
      {
        type: 'textarea',
        question: 'What new features would you like to see?',
        required: false
      }
    ],
    createdBy: 'Product Team',
    createdAt: new Date('2024-01-25'),
    isActive: true,
    isSample: true
  }
];
export async function GET() {
  try {
    console.log('Returning sample surveys');
    return NextResponse.json(sampleSurveys);
  } catch (error) {
    console.error('Error getting sample surveys:', error);
    return NextResponse.json({ error: 'Failed to get sample surveys' }, { status: 500 });
  }
}