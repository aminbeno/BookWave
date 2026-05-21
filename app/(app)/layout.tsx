'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import Navbar from '@/components/bookwave/Navbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUnifiedAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-primary/20 rounded-full" />
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin absolute inset-0" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
