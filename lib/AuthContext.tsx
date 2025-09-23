// File: frontend/lib/AuthContext.tsx
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// CORRECTED: Added email to our global memory shape
interface AuthContextType {
  token: string | null;
  email: string | null;
  login: (token: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null); // State for email
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedEmail = localStorage.getItem('userEmail'); // Check for email too
      if (storedToken && storedEmail) {
        setToken(storedToken);
        setEmail(storedEmail);
      }
    } catch (error) {
        console.error("Could not access local storage", error)
    } finally {
        setLoading(false);
    }
  }, []);

  const login = (newToken: string, userEmail: string) => {
    setToken(newToken);
    setEmail(userEmail);
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('userEmail', userEmail); // Save email to storage
  };

  const logout = () => {
    setToken(null);
    setEmail(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail'); // Remove email from storage
  };
  
  if (loading) return null;

  return (
    <AuthContext.Provider value={{ token, email, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}