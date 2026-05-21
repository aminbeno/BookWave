import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { MongoAuthProvider } from '@/contexts/MongoAuthContext';
import { UnifiedAuthProvider } from '@/contexts/UnifiedAuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BookWave - Votre Bibliothèque Personnelle',
  description: 'Gérez votre collection de livres, suivez votre progression et atteignez vos objectifs de lecture.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <MongoAuthProvider>
          <UnifiedAuthProvider>
            {children}
          </UnifiedAuthProvider>
        </MongoAuthProvider>
      </body>
    </html>
  );
}
