'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface MongoUser {
  id: string;
  email: string;
  username: string;
  avatar_url: string | null;
  bio: string;
}

interface MongoAuthContextType {
  user: MongoUser | null;
  token: string | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const MongoAuthContext = createContext<MongoAuthContextType>({
  user: null,
  token: null,
  loading: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

export function MongoAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MongoUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('bookwave_token');
    const storedUser = localStorage.getItem('bookwave_user');
    if (stored && storedUser) {
      setToken(stored);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('bookwave_token');
        localStorage.removeItem('bookwave_user');
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      });
      const data = await res.json();
      if (!res.ok) return { error: new Error(data.error || 'Erreur d\'inscription') };

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('bookwave_token', data.token);
      localStorage.setItem('bookwave_user', JSON.stringify(data.user));
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { error: new Error(data.error || 'Identifiants incorrects') };

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('bookwave_token', data.token);
      localStorage.setItem('bookwave_user', JSON.stringify(data.user));
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('bookwave_token');
    localStorage.removeItem('bookwave_user');
  };

  return (
    <MongoAuthContext.Provider value={{ user, token, loading, signUp, signIn, signOut }}>
      {children}
    </MongoAuthContext.Provider>
  );
}

export const useMongoAuth = () => useContext(MongoAuthContext);
