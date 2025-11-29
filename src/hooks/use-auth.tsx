"use client";

import React, { useState, useContext, createContext, useEffect } from 'react';
import type { User } from '@/types';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for a logged-in user
    const sessionUser = sessionStorage.getItem('user');
    if (sessionUser) {
      setUser(JSON.parse(sessionUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (email === 'admin@beautifulsoupandfoods.com' && pass === 'admin123') {
        const adminUser: User = { uid: 'admin-uid', email, firstName: 'Admin', lastName: 'User', displayName: 'Admin User', photoURL: 'https://picsum.photos/seed/admin/40/40', isAdmin: true };
        setUser(adminUser);
        sessionStorage.setItem('user', JSON.stringify(adminUser));
    } else if (email && pass) {
        const mockUser: User = { uid: 'mock-uid-123', email, firstName: email.split('@')[0], lastName: '', displayName: email.split('@')[0], photoURL: 'https://picsum.photos/seed/user/40/40' };
        setUser(mockUser);
        sessionStorage.setItem('user', JSON.stringify(mockUser));
    } else {
        throw new Error("Invalid credentials");
    }
    setLoading(false);
  };

  const signup = async (email: string, pass: string, firstName: string, lastName: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (email && pass) {
        const mockUser: User = { uid: 'mock-uid-123', email, firstName, lastName, displayName: `${firstName} ${lastName}`, photoURL: null };
        setUser(mockUser);
        sessionStorage.setItem('user', JSON.stringify(mockUser));
    } else {
        throw new Error("Invalid details");
    }
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser(null);
    sessionStorage.removeItem('user');
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
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
