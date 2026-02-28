"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserData {
  id: string;
  username: string;
  role: 'admin' | 'user';
  displayName?: string;
}

interface AuthContextType {
  user: UserData | null;
  role: 'admin' | 'user' | null;
  loading: boolean;
  signIn: (user: UserData) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for existing session
    const savedUser = localStorage.getItem('ledger_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signIn = (userData: UserData) => {
    setUser(userData);
    localStorage.setItem('ledger_user', JSON.stringify(userData));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('ledger_user');
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role || null, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};