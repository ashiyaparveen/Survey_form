'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin 
      ? { email, password }
      : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      console.log('Login response:', data); // Debug log
      
      if (data.success) {
        if (isLogin) {
          // Store user info without token
          console.log('Storing user data:', data.user); // Debug log
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('isLoggedIn', 'true');
          console.log('Redirecting to dashboard...'); // Debug log
          router.push('/dashboard');
        } else {
          setError('Registration successful.');
          setIsLogin(true);
        }
      } else {
        console.error('Login failed:', data); // Debug log
        setError(data.error || 'Something went wrong');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link href="/" className="back-link">← Back to Home</Link>
          <h2>{isLogin ? 'Login' : 'Register'}</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
          )}
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>
        
        <div className="auth-switch">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="switch-button"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>

      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          font-family: 'Times New Roman', Times, serif;
        }
        
        .auth-card {
          background: white;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          padding: 40px;
          width: 100%;
          max-width: 400px;
        }
        
        .auth-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .back-link {
          color: #667eea;
          text-decoration: none;
          font-size: 14px;
          display: block;
          margin-bottom: 20px;
          text-align: left;
        }
        
        .back-link:hover {
          text-decoration: underline;
        }
        
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .form-group label {
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }
        
        .form-group input {
          padding: 12px;
          border: 2px solid #e1e5e9;
          border-radius: 6px;
          font-size: 16px;
          transition: border-color 0.3s;
        }
        
        .form-group input:focus {
          outline: none;
          border-color: #667eea;
        }
        
        .error-message {
          background: #fee;
          color: #c33;
          padding: 10px;
          border-radius: 6px;
          font-size: 14px;
          text-align: center;
        }
        
        .auth-button {
          background: #667eea;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .auth-button:hover:not(:disabled) {
          background: #5a6fd8;
        }
        
        .auth-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .auth-switch {
          text-align: center;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e1e5e9;
        }
        
        .switch-button {
          background: none;
          border: none;
          color: #667eea;
          cursor: pointer;
          font-weight: 600;
          text-decoration: underline;
        }
        
        .switch-button:hover {
          color: #5a6fd8;
        }
      `}</style>
    </div>
  );
}
