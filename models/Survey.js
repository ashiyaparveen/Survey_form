import getClient from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function getAllSurveys() {
  try {
    const db = (await getClient()).db('surveyform');
    const surveys = await db.collection('surveys').find({}).toArray();
    return Array.isArray(surveys) ? surveys : [];
  } catch (error) {
    console.error('Error in getAllSurveys:', error);
    return [];
  }
}

export async function getSurveyById(id) {
  const db = (await getClient()).db('surveyform');
  return await db.collection('surveys').findOne({ _id: new ObjectId(id) });
}

export async function createSurvey(data) {
  try {
    const db = (await getClient()).db('surveyform');
    console.log('Inserting survey into database:', data);
    const result = await db.collection('surveys').insertOne(data);
    console.log('Database insert result:', result);
    return result;
  } catch (error) {
    console.error('Error in createSurvey model:', error);
    throw error;
  }
}

export async function updateSurvey(id, data) {
  const db = (await getClient()).db('surveyform');
  return await db.collection('surveys').updateOne({ _id: new ObjectId(id) }, { $set: data });
}

export async function deleteSurvey(id) {
  const db = (await getClient()).db('surveyform');
  return await db.collection('surveys').deleteOne({ _id: new ObjectId(id) });
}

export async function submitSurveyResponse(id, response) {
  const db = (await getClient()).db('surveyform');
  return await db.collection('responses').insertOne({ surveyId: id, response });
}
