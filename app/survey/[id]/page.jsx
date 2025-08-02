'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SurveyPage() {
  const { id } = useParams();
  const router = useRouter();
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState({});
  const [respondentEmail, setRespondentEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchSurvey();
  }, [id]);

  const fetchSurvey = async () => {
    try {
      // Try to fetch from regular API first
      let res = await fetch(`/api/surveys/${id}`);
      let data = null;
      
      if (res.ok) {
        data = await res.json();
      } else if (id.startsWith('sample-')) {
        // If it's a sample survey, fetch from samples API
        console.log('Fetching sample survey...');
        res = await fetch('/api/surveys/samples');
        if (res.ok) {
          const samples = await res.json();
          data = samples.find(survey => survey._id === id);
        }
      }
      
      if (data) {
        setSurvey(data);
        const initialResponses = {};
        data.questions?.forEach((_, index) => {
          initialResponses[index] = '';
        });
        setResponses(initialResponses);
      } else {
        console.error('Survey not found');
      }
    } catch (error) {
      console.error('Failed to fetch survey:', error);
    }
  };
  const handleResponseChange = (questionIndex, value) => {
    setResponses({
      ...responses,
      [questionIndex]: value
    });
    if (errors[questionIndex]) {
      setErrors({
        ...errors,
        [questionIndex]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    survey.questions?.forEach((question, index) => {
      if (question.required && (!responses[index] || responses[index].trim() === '')) {
        newErrors[index] = 'This field is required';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // If it's a sample survey, just simulate submission
      if (survey.isSample) {
        console.log('Sample survey submission:', { responses, respondentEmail });
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSubmitted(true);
        return;
      }
      
      // For real surveys, submit to API
      const res = await fetch(`/api/surveys/${id}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses,
          respondentEmail
        })
      });
      
      if (res.ok) {
        setSubmitted(true);
      } else {
        alert('Failed to submit survey. Please try again.');
      }
    } catch (error) {
      console.error('Failed to submit survey:', error);
      alert('Failed to submit survey. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderQuestion = (question, index) => {
    const value = responses[index] || '';
    const hasError = errors[index];

    switch (question.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            type={question.type}
            value={value}
            onChange={(e) => handleResponseChange(index, e.target.value)}
            className={hasError ? 'error' : ''}
            placeholder={`Enter your ${question.type === 'email' ? 'email' : 'answer'}`}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleResponseChange(index, e.target.value)}
            className={hasError ? 'error' : ''}
            placeholder="Enter your detailed response"
            rows="4"
          />
        );
      
      case 'radio':
        const radioOptions = question.options ? question.options.split(',').map(opt => opt.trim()) : [];
        return (
          <div className="radio-group">
            {radioOptions.map((option, optIndex) => (
              <label key={optIndex} className="radio-label">
                <input
                  type="radio"
                  name={`question_${index}`}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleResponseChange(index, e.target.value)}
                />
                {option}
              </label>
            ))}
          </div>
        );
      
      case 'checkbox':
        const checkboxOptions = question.options ? question.options.split(',').map(opt => opt.trim()) : [];
        const selectedValues = value ? value.split(',') : [];
        
        return (
          <div className="checkbox-group">
            {checkboxOptions.map((option, optIndex) => (
              <label key={optIndex} className="checkbox-label">
                <input
                  type="checkbox"
                  value={option}
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    let newValues;
                    if (e.target.checked) {
                      newValues = [...selectedValues, option];
                    } else {
                      newValues = selectedValues.filter(val => val !== option);
                    }
                    handleResponseChange(index, newValues.join(','));
                  }}
                />
                {option}
              </label>
            ))}
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleResponseChange(index, e.target.value)}
            className={hasError ? 'error' : ''}
            placeholder="Enter your answer"
          />
        );
    }
  };

  if (!survey) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading survey...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="success-container">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h2>Thank You</h2>
          <p>Submitted successfully.</p>
          <Link href="/" className="home-link">
            Back to Home
          </Link>
        </div>
        
        <style jsx>{`
          .success-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            font-family: 'Times New Roman', Times, serif;
          }
          
          .success-card {
            background: white;
            border-radius: 10px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            max-width: 400px;
          }
          
          .success-icon {
            width: 80px;
            height: 80px;
            background: #28a745;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            color: white;
            margin: 0 auto 20px;
          }
          
          .success-card h2 {
            color: #333;
            margin-bottom: 10px;
          }
          
          .success-card p {
            color: #666;
            margin-bottom: 30px;
          }
          
          .home-link {
            background: #667eea;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            display: inline-block;
            transition: background-color 0.3s;
          }
          
          .home-link:hover {
            background: #5a6fd8;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="survey-container">
      <div className="survey-header">
        <Link href="/" className="back-link">← Back to Home</Link>
        <h1>{survey.title}</h1>
        {survey.description && <p className="survey-description">{survey.description}</p>}
      </div>

      <form onSubmit={handleSubmit} className="survey-form">
        <div className="form-group">
          <label>Your Email (Optional)</label>
          <input
            type="email"
            value={respondentEmail}
            onChange={(e) => setRespondentEmail(e.target.value)}
            placeholder="Enter your email address"
          />
        </div>

        {survey.questions?.map((question, index) => (
          <div key={index} className="question-container">
            <label className="question-label">
              {index + 1}. {question.question}
              {question.required && <span className="required">*</span>}
            </label>
            
            {renderQuestion(question, index)}
            
            {errors[index] && (
              <div className="error-message">{errors[index]}</div>
            )}
          </div>
        ))}

        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Submitting...' : 'Submit Survey'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .survey-container {
          min-height: 100vh;
          background: #f8f9fa;
          padding: 20px;
          font-family: 'Times New Roman', Times, serif;
        }
        
        .survey-header {
          max-width: 800px;
          margin: 0 auto 40px;
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .back-link {
          color: #667eea;
          text-decoration: none;
          font-size: 14px;
          margin-bottom: 20px;
          display: inline-block;
        }
        
        .back-link:hover {
          text-decoration: underline;
        }
        

        
        .survey-header h1 {
          color: #333;
          margin: 0 0 10px 0;
          font-size: 28px;
        }
        
        .survey-description {
          color: #666;
          font-size: 16px;
          line-height: 1.5;
          margin: 0;
        }
        
        .survey-form {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .form-group {
          margin-bottom: 25px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
        }
        
        .question-container {
          margin-bottom: 30px;
          padding-bottom: 25px;
          border-bottom: 1px solid #eee;
        }
        
        .question-container:last-of-type {
          border-bottom: none;
        }
        
        .question-label {
          display: block;
          margin-bottom: 15px;
          font-weight: 600;
          color: #333;
          font-size: 16px;
          line-height: 1.4;
        }
        
        .required {
          color: #dc3545;
          margin-left: 4px;
        }
        
        .form-group input,
        .form-group textarea,
        .question-container input[type="text"],
        .question-container input[type="email"],
        .question-container input[type="number"],
        .question-container textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e1e5e9;
          border-radius: 6px;
          font-size: 16px;
          transition: border-color 0.3s;
          box-sizing: border-box;
        }
        
        .form-group input:focus,
        .form-group textarea:focus,
        .question-container input:focus,
        .question-container textarea:focus {
          outline: none;
          border-color: #667eea;
        }
        
        .form-group input.error,
        .question-container input.error,
        .question-container textarea.error {
          border-color: #dc3545;
        }
        
        .radio-group,
        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .radio-label,
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: normal;
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }
        
        .radio-label:hover,
        .checkbox-label:hover {
          background-color: #f8f9fa;
        }
        
        .radio-label input,
        .checkbox-label input {
          width: auto;
          margin: 0;
        }
        
        .error-message {
          color: #dc3545;
          font-size: 14px;
          margin-top: 5px;
        }
        
        .form-actions {
          margin-top: 40px;
          text-align: center;
          padding-top: 25px;
          border-top: 1px solid #eee;
        }
        
        .submit-button {
          background: #28a745;
          color: white;
          border: none;
          padding: 15px 40px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .submit-button:hover:not(:disabled) {
          background: #218838;
        }
        
        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .loading-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e1e5e9;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .survey-container {
            padding: 10px;
          }
          
          .survey-header,
          .survey-form {
            padding: 20px;
          }
          
          .survey-header h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}
