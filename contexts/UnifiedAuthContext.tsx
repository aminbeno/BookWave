'use client';

import React, { createContext, useContext } from 'react';
import { useMongoAuth } from '@/contexts/MongoAuthContext';

interface UnifiedUser {
  id: string;
  email: string;
  username: string;
  avatar_url: string | null;
  bio: string;
  user_metadata?: { username?: string };
}

interface UnifiedAuthContextType {
  user: UnifiedUser | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType>({
  user: null,
  loading: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

export function UnifiedAuthProvider({ children }: { children: React.ReactNode }) {
  const mongoAuth = useMongoAuth();

  const mongoUser = mongoAuth.user;
  const unifiedUser: UnifiedUser | null = mongoUser ? {
    id: mongoUser.id,
    email: mongoUser.email,
    username: mongoUser.username,
    avatar_url: mongoUser.avatar_url,
    bio: mongoUser.bio,
    user_metadata: { username: mongoUser.username },
  } : null;

  return (
    <UnifiedAuthContext.Provider value={{
      user: unifiedUser,
      loading: mongoAuth.loading,
      signUp: mongoAuth.signUp,
      signIn: mongoAuth.signIn,
      signOut: mongoAuth.signOut,
    }}>
      {children}
    </UnifiedAuthContext.Provider>
  );
}

export const useUnifiedAuth = () => useContext(UnifiedAuthContext);
