"use client";

import React, { useState, useEffect, createContext, useContext } from 'react';

interface PasswordGateProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

interface AuthContextType {
  onLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a PasswordGate');
  }
  return context;
};

const STATIC_PASSWORD = 'sk';
const STORAGE_KEY = 'dashboard_unlocked';

export default function PasswordGate({ children, onLogout }: PasswordGateProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'true') setUnlocked(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (unlocked) {
        localStorage.setItem(STORAGE_KEY, 'true');
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [unlocked]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === STATIC_PASSWORD) {
      setUnlocked(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  const handleLogout = () => {
    setUnlocked(false);
    setInput('');
    setError('');
    if (onLogout) onLogout();
  };

  // If not authenticated, show only the password dialog
  if (!unlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-muted to-muted/50 transition-colors">
        <form onSubmit={handleSubmit} className="bg-card shadow-lg rounded-lg p-8 flex flex-col gap-4 animate-fade-in border border-border">
          <h2 className="text-2xl font-bold mb-2 text-center text-foreground">Enter Password</h2>
          <input
            type="password"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="border border-input rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring transition-all bg-background text-foreground placeholder:text-muted-foreground"
            placeholder="Password"
          />
          {error && <div className="text-destructive text-sm animate-shake">{error}</div>}
          <button type="submit" className="bg-primary text-primary-foreground rounded px-4 py-2 font-semibold hover:bg-primary/90 transition-colors">Unlock</button>
        </form>
      </div>
    );
  }

  // If authenticated, show children with auth context
  return (
    <AuthContext.Provider value={{ onLogout: handleLogout }}>
      <div className="animate-fade-in">
        {children}
      </div>
    </AuthContext.Provider>
  );
}

// Animations (add to globals.css):
// .animate-fade-in { animation: fadeIn 0.7s ease; }
// .animate-shake { animation: shake 0.3s; }
// @keyframes fadeIn { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: none; } }
// @keyframes shake { 0% { transform: translateX(0); } 25% { transform: translateX(-5px); } 50% { transform: translateX(5px); } 75% { transform: translateX(-5px); } 100% { transform: translateX(0); } } 