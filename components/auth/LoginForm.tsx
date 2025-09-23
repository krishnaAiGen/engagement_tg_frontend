// File: frontend/components/auth/LoginForm.tsx
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';

// We can keep a simple api helper here for now
async function apiRequest(endpoint: string, method: 'POST', body: object) {
  const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'An unknown error occurred');
  }
  return data;
}

export default function LoginForm() {
  const { login } = useAuth();

  // --- State (Memory) ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');

  // FIXED: Separate loading states for each button
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  // --- Logic for Handling Login ---
  const handleLogin = async () => {
    if (!email || !password) {
      setMessage('Email and password are required.');
      setMessageType('error');
      return;
    }
    setLoginLoading(true);
    setMessage('');

    try {
      const data = await apiRequest('/auth/login', 'POST', { email, password });
      login(data.idToken, data.email); 
    } catch (err) {
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage('An unexpected error occurred during login.');
      }
      setMessageType('error');
    } finally {
      setLoginLoading(false);
    }
  };

  // --- Logic for Handling Registration ---
  const handleRegister = async () => {
    if (!email || !password) {
      setMessage('Email and password are required.');
      setMessageType('error');
      return;
    }
    setRegisterLoading(true);
    setMessage('');

    try {
      const data = await apiRequest('/auth/register', 'POST', { email, password });
      setMessage(data.message || 'Registration successful! Please log in.');
      setMessageType('success');
      setPassword('');
    } catch (err) {
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage('An unexpected error occurred during registration.');
      }
      setMessageType('error');
    } finally {
      setRegisterLoading(false);
    }
  };

  // --- The Visual Part (JSX) ---
  return (
    <div className="auth-container">
      <h1>AI Persona Dashboard</h1>

      {message && (
        <p style={{
          minHeight: '20px', fontWeight: 500, marginBottom: '1rem',
          color: messageType === 'success' ? 'var(--success-color)' : 'var(--danger-color)'
        }}>
          {message}
        </p>
      )}

      <div className="form-group" style={{ textAlign: 'left' }}>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>

      <div className="form-group" style={{ textAlign: 'left' }}>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button onClick={handleLogin} className="btn btn-primary" style={{ flexGrow: 1 }} disabled={loginLoading || registerLoading}>
          {loginLoading ? 'Processing...' : 'Login'}
        </button>
        <button onClick={handleRegister} className="btn btn-secondary" style={{ flexGrow: 1 }} disabled={loginLoading || registerLoading}>
          {registerLoading ? 'Processing...' : 'Register'}
        </button>
      </div>
    </div>
  );
}