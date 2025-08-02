'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [surveys, setSurveys] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSurveys();
    checkUser();
  }, []);

  const fetchSurveys = async () => {
    try {
      // Try to fetch real surveys first
      let res = await fetch('/api/surveys');
      let data = [];
      
      if (res.ok) {
        data = await res.json();
      }
      
      // If no real surveys or API failed, try local storage
      if (!Array.isArray(data) || data.length === 0) {
        console.log('No real surveys found, trying local storage...');
        res = await fetch('/api/surveys/local');
        if (res.ok) {
          const localData = await res.json();
          if (Array.isArray(localData) && localData.length > 0) {
            data = localData;
          }
        }
      }
      
      // If still no surveys, show sample surveys
      if (!Array.isArray(data) || data.length === 0) {
        console.log('No surveys found, loading sample surveys...');
        res = await fetch('/api/surveys/samples');
        if (res.ok) {
          const sampleData = await res.json();
          if (Array.isArray(sampleData)) {
            data = sampleData;
          }
        }
      }
      
      setSurveys(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch surveys:', error);
      // Load sample surveys as fallback
      try {
        const res = await fetch('/api/surveys/samples');
        if (res.ok) {
          const sampleData = await res.json();
          setSurveys(Array.isArray(sampleData) ? sampleData : []);
        }
      } catch (sampleError) {
        console.error('Failed to load sample surveys:', sampleError);
        setSurveys([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkUser = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="home">
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-left">
            <h1>Survey Form Manager</h1>
          </div>
          <div className="nav-right">
            {user ? (
              <div className="user-menu">
                <span className="welcome-text">Welcome, {user.name || user.email}</span>
                <Link href="/dashboard" className="dashboard-link">Dashboard</Link>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </div>
            ) : (
              <div className="auth-links">
                <Link href="/login" className="login-link">Login</Link>
                <Link href="/login" className="signup-link">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="hero-section">
          <div className="hero-content">
            <h2>Available Surveys</h2>
            <p>share your valuable feedback</p>
          </div>
        </div>

        <div className="surveys-section">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading surveys...</p>
            </div>
          ) : surveys.length === 0 ? (
            <div className="empty-state">
              <h3>No Surveys Available</h3>
              {user && (
                <Link href="/dashboard" className="create-survey-link">
                  Create Your First Survey
                </Link>
              )}
            </div>
          ) : (
            <div className="surveys-grid">
              {surveys.map((survey) => (
                <div key={survey._id} className="survey-card">
                  <div className="survey-icon">📋</div>
                  <div className="survey-content">
                    <h3>{survey.title}</h3>
                    <p className="survey-description">
                      {survey.description || 'No description available'}
                    </p>
                    <div className="survey-meta">
                      <span className="question-count">
                        {survey.questions?.length || 0} questions
                      </span>
                      <span className="survey-date">
                        Created {new Date(survey.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="survey-actions">
                    <Link href={`/survey/${survey._id}`} className="start-button">
                      Start Survey
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 Survey Form Manager..</p>
        </div>
      </footer>

      <style jsx>{`
        .home {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: 'Times New Roman', Times, serif;
        }
        
        .navbar {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 20px 0;
          box-shadow: 0 2px 20px rgba(0,0,0,0.1);
        }
        
        .nav-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .nav-left h1 {
          margin: 0 0 5px 0;
          color: #333;
          font-size: 28px;
          font-weight: 700;
        }
        
        .nav-left p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }
        
        .nav-right {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .user-menu {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .welcome-text {
          color: #333;
          font-weight: 600;
        }
        
        .dashboard-link {
          background: #667eea;
          color: white;
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 600;
          transition: background-color 0.3s;
        }
        
        .dashboard-link:hover {
          background: #5a6fd8;
        }
        
        .logout-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.3s;
        }
        
        .logout-btn:hover {
          background: #c82333;
        }
        
        .auth-links {
          display: flex;
          gap: 10px;
        }
        
        .login-link {
          color: #333;
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 600;
          transition: background-color 0.3s;
        }
        
        .login-link:hover {
          background: #f8f9fa;
        }
        
        .signup-link {
          background: #28a745;
          color: white;
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 600;
          transition: background-color 0.3s;
        }
        
        .signup-link:hover {
          background: #218838;
        }
        
        .main-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        
        .hero-section {
          text-align: center;
          margin-bottom: 50px;
        }
        
        .hero-content h2 {
          color: white;
          font-size: 36px;
          margin: 0 0 10px 0;
          font-weight: 700;
        }
        
        .hero-content p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 18px;
          margin: 0;
        }
        
        .surveys-section {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 15px;
          padding: 40px;
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .loading-state {
          text-align: center;
          padding: 60px 20px;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e1e5e9;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }
        
        .empty-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        
        .empty-state h3 {
          color: #333;
          margin: 0 0 10px 0;
          font-size: 24px;
        }
        
        .empty-state p {
          color: #666;
          margin: 0 0 30px 0;
          font-size: 16px;
        }
        
        .create-survey-link {
          background: #28a745;
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 600;
          display: inline-block;
          transition: background-color 0.3s;
        }
        
        .create-survey-link:hover {
          background: #218838;
        }
        
        .surveys-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 25px;
        }
        
        .survey-card {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          transition: transform 0.3s, box-shadow 0.3s;
          border: 1px solid #e1e5e9;
        }
        
        .survey-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .survey-icon {
          font-size: 32px;
          margin-bottom: 15px;
        }
        
        .survey-content h3 {
          color: #333;
          margin: 0 0 10px 0;
          font-size: 20px;
          font-weight: 600;
        }
        
        .survey-description {
          color: #666;
          margin: 0 0 15px 0;
          font-size: 14px;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .survey-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          font-size: 12px;
          color: #999;
        }
        
        .survey-actions {
          text-align: center;
        }
        
        .start-button {
          background: #667eea;
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 600;
          display: inline-block;
          transition: background-color 0.3s;
          width: 100%;
          text-align: center;
          box-sizing: border-box;
        }
        
        .start-button:hover {
          background: #5a6fd8;
        }
        
        .footer {
          background: rgba(0, 0, 0, 0.1);
          padding: 20px 0;
          margin-top: 50px;
        }
        
        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          text-align: center;
        }
        
        .footer-content p {
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
          font-size: 14px;
        }
        
        @media (max-width: 768px) {
          .nav-content {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }
          
          .nav-left h1 {
            font-size: 24px;
          }
          
          .hero-content h2 {
            font-size: 28px;
          }
          
          .surveys-grid {
            grid-template-columns: 1fr;
          }
          
          .main-content {
            padding: 20px 10px;
          }
          
          .surveys-section {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}