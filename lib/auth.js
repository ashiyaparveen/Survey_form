// Simple authentication without JWT tokens

export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const user = localStorage.getItem('user');
  
  return isLoggedIn === 'true' && user !== null;
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function logout() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('user');
  window.location.href = '/login';
}