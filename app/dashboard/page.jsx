'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const [surveys, setSurveys] = useState([]);
  const [user, setUser] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSurvey, setNewSurvey] = useState({
    title: '',
    description: '',
    questions: [{ type: 'text', question: '', required: true }]
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log('Dashboard useEffect running...'); // Debug log
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userData = localStorage.getItem('user');
    
    console.log('isLoggedIn:', isLoggedIn); // Debug log
    console.log('userData:', userData); // Debug log
    
    if (isLoggedIn !== 'true' || !userData) {
      console.log('Not authenticated, redirecting to login...'); // Debug log
      router.push('/login');
      return;
    }
    
    console.log('User authenticated, setting user data...'); // Debug log
    setUser(JSON.parse(userData));
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      // Try MongoDB first, fallback to local storage
      let res = await fetch('/api/surveys');
      let data = await res.json();
      
      // If MongoDB fails, try local storage
      if (!res.ok || !Array.isArray(data)) {
        console.log('MongoDB failed, trying local storage...');
        res = await fetch('/api/surveys/local');
        data = await res.json();
      }
      
      // Ensure data is an array before setting surveys
      if (Array.isArray(data)) {
        setSurveys(data);
        console.log('Surveys loaded successfully:', data.length, 'surveys');
      } else {
        console.error('API returned non-array data:', data);
        setSurveys([]); // Set empty array as fallback
      }
    } catch (error) {
      console.error('Failed to fetch surveys:', error);
      setSurveys([]); // Set empty array on error
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    router.push('/');
  };

  const addQuestion = () => {
    setNewSurvey({
      ...newSurvey,
      questions: [...newSurvey.questions, { type: 'text', question: '', required: true }]
    });
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = newSurvey.questions.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    );
    setNewSurvey({ ...newSurvey, questions: updatedQuestions });
  };

  const removeQuestion = (index) => {
    if (newSurvey.questions.length > 1) {
      const updatedQuestions = newSurvey.questions.filter((_, i) => i !== index);
      setNewSurvey({ ...newSurvey, questions: updatedQuestions });
    }
  };

  const createSurvey = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    console.log('Creating survey with data:', newSurvey);
    console.log('User:', user);
    
    try {
      const surveyPayload = {
        ...newSurvey,
        createdBy: user?.email || 'anonymous'
      };
      
      console.log('Survey payload:', surveyPayload);
      
      // Try MongoDB first, fallback to local storage
      let res = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(surveyPayload)
      });
      
      // If MongoDB fails, try local storage
      if (!res.ok) {
        console.log('MongoDB failed, trying local storage...');
        res = await fetch('/api/surveys/local', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(surveyPayload)
        });
      }
      
      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);
      
      let data;
      let responseText = '';
      
      try {
        // First get the raw response text
        responseText = await res.text();
        console.log('Raw response text:', responseText);
        
        // Try to parse as JSON
        if (responseText) {
          data = JSON.parse(responseText);
          console.log('Parsed response data:', data);
        } else {
          console.error('Empty response received');
          data = { error: 'Empty response from server' };
        }
      } catch (parseError) {
        console.error('Failed to parse response JSON:', parseError);
        console.error('Raw response was:', responseText);
        data = { error: `Invalid response from server: ${responseText}` };
      }
      
      if (res.ok && data && data.success) {
        setNewSurvey({
          title: '',
          description: '',
          questions: [{ type: 'text', question: '', required: true }]
        });
        setShowCreateForm(false);
        fetchSurveys();
        alert('Survey created successfully!');
      } else {
        const errorMessage = data?.error || `Server returned status ${res.status}. Response: ${responseText}`;
        console.error('Failed to create survey. Status:', res.status);
        console.error('Response data:', data);
        console.error('Raw response:', responseText);
        alert(`Failed to create survey: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Failed to create survey:', error);
      alert('Failed to create survey. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteSurvey = async (id) => {
    if (confirm('Are you sure you want to delete this survey?')) {
      try {
        await fetch(`/api/surveys/${id}`, { method: 'DELETE' });
        fetchSurveys();
      } catch (error) {
        console.error('Failed to delete survey:', error);
      }
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-left">
          <h1>Survey Form Manager</h1>
        </div>
        <div className="nav-right">
          <span>Welcome, {user.name || user.email}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>Your Surveys</h2>
          <button 
            onClick={() => setShowCreateForm(true)} 
            className="create-btn"
          >
            + Create New Survey
          </button>
        </div>

        {showCreateForm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Create New Survey</h3>
                <button 
                  onClick={() => setShowCreateForm(false)}
                  className="close-btn"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={createSurvey} className="survey-form">
                <div className="form-group">
                  <label>Survey Title</label>
                  <input
                    type="text"
                    value={newSurvey.title}
                    onChange={(e) => setNewSurvey({...newSurvey, title: e.target.value})}
                    placeholder="Enter survey title"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newSurvey.description}
                    onChange={(e) => setNewSurvey({...newSurvey, description: e.target.value})}
                    placeholder="Enter survey description"
                    rows="3"
                  />
                </div>
                
                <div className="questions-section">
                  <h4>Questions</h4>
                  {newSurvey.questions.map((question, index) => (
                    <div key={index} className="question-item">
                      <div className="question-header">
                        <span>Question {index + 1}</span>
                        {newSurvey.questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(index)}
                            className="remove-question-btn"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      <div className="form-group">
                        <select
                          value={question.type}
                          onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                        >
                          <option value="text">Text</option>
                          <option value="textarea">Long Text</option>
                          <option value="radio">Multiple Choice</option>
                          <option value="checkbox">Checkboxes</option>
                          <option value="email">Email</option>
                          <option value="number">Number</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <input
                          type="text"
                          value={question.question}
                          onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                          placeholder="Enter your question"
                          required
                        />
                      </div>
                      
                      {(question.type === 'radio' || question.type === 'checkbox') && (
                        <div className="form-group">
                          <input
                            type="text"
                            value={question.options || ''}
                            onChange={(e) => updateQuestion(index, 'options', e.target.value)}
                            placeholder="Enter options separated by commas"
                          />
                        </div>
                      )}
                      
                      <div className="form-group">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={question.required}
                            onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                          />
                          Required
                        </label>
                      </div>
                    </div>
                  ))}
                  
                  <button type="button" onClick={addQuestion} className="add-question-btn">
                    + Add Question
                  </button>
                </div>
                
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowCreateForm(false)} className="cancel-btn">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="submit-btn">
                    {loading ? 'Creating...' : 'Create Survey'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="surveys-grid">
          {(surveys || []).length === 0 ? (
            <div className="empty-state">
              <p>No surveys created yet. Create your first survey!</p>
            </div>
          ) : (
            (surveys || []).map((survey) => (
              <div key={survey._id} className="survey-card">
                <div className="survey-header">
                  <h3>{survey.title}</h3>
                  <div className="survey-actions">
                    <Link href={`/survey/${survey._id}`} className="view-btn">
                      View
                    </Link>
                    <button 
                      onClick={() => deleteSurvey(survey._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="survey-description">{survey.description}</p>
                <div className="survey-meta">
                  <span>{survey.questions?.length || 0} questions</span>
                  <span>Created: {new Date(survey.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          background: #f5f5f5;
          font-family: 'Times New Roman', Times, serif;
        }
        
        .dashboard-nav {
          background: white;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .nav-left h1 {
          margin: 0;
          color: #333;
        }
        
        .nav-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        
        .logout-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .logout-btn:hover {
          background: #c82333;
        }
        
        .dashboard-content {
          padding: 30px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        
        .create-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }
        
        .create-btn:hover {
          background: #218838;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #999;
        }
        
        .survey-form {
          padding: 20px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          color: #333;
        }
        
        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 10px;
          border: 2px solid #e1e5e9;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #667eea;
        }
        
        .questions-section {
          border: 1px solid #eee;
          border-radius: 6px;
          padding: 20px;
          margin: 20px 0;
        }
        
        .question-item {
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 15px;
          margin-bottom: 15px;
          background: #f9f9f9;
        }
        
        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .remove-question-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        
        .add-question-btn {
          background: #17a2b8;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: normal;
        }
        
        .modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          padding: 20px;
          border-top: 1px solid #eee;
        }
        
        .cancel-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .submit-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .surveys-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .survey-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .survey-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }
        
        .survey-header h3 {
          margin: 0;
          color: #333;
        }
        
        .survey-actions {
          display: flex;
          gap: 8px;
        }
        
        .view-btn {
          background: #007bff;
          color: white;
          text-decoration: none;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        
        .delete-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        
        .survey-description {
          color: #666;
          margin: 10px 0;
        }
        
        .survey-meta {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #999;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }
        
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }
      `}</style>
    </div>
  );
}
