'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { publicApiRequest } from '@/lib/api';

export default function LoginForm() {
  const { login } = useAuth();

  // --- State (Memory) ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');

  // Separate loading states for each button
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  // --- Logic for Handling Login ---
  const handleLogin = async () => {
    // Basic validation
    if (!email || !password) {
      setMessage('Email and password are required.');
      setMessageType('error');
      return;
    }
    setLoginLoading(true);
    setMessage('');

    try {
      // Use the imported publicApiRequest function
      const data = await publicApiRequest('/auth/login', 'POST', { email, password });
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
    // Basic validation
    if (!email || !password) {
      setMessage('Email and password are required.');
      setMessageType('error');
      return;
    }
    setRegisterLoading(true);
    setMessage('');

    try {
      // Use the imported publicApiRequest function
      const data = await publicApiRequest('/auth/register', 'POST', { email, password });
      setMessage(data.message || 'Registration successful! Please log in.');
      setMessageType('success');
      setPassword(''); // Clear password field after successful registration
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
          minHeight: '20px',
          fontWeight: 500,
          marginBottom: '1rem',
          color: messageType === 'success' ? 'var(--success-color)' : 'var(--danger-color)'
        }}>
          {message}
        </p>
      )}

      <div className="form-group" style={{ textAlign: 'left' }}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="form-group" style={{ textAlign: 'left' }}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button
          onClick={handleLogin}
          className="btn btn-primary"
          style={{ flexGrow: 1 }}
          disabled={loginLoading || registerLoading}
        >
          {loginLoading ? 'Processing...' : 'Login'}
        </button>
        <button
          onClick={handleRegister}
          className="btn btn-secondary"
          style={{ flexGrow: 1 }}
          disabled={loginLoading || registerLoading}
        >
          {registerLoading ? 'Processing...' : 'Register'}
        </button>
      </div>
    </div>
  );
}