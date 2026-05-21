'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Eye, EyeOff, ArrowRight, CircleCheck as CheckCircle, Sparkles } from 'lucide-react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useUnifiedAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres.');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, username);
    if (error) {
      setError(error.message || 'Une erreur est survenue.');
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 p-12 flex-col justify-between relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/10 animate-float"
              style={{
                width: `${60 + i * 40}px`,
                height: `${60 + i * 40}px`,
                bottom: `${10 + i * 12}%`,
                right: `${5 + i * 8}%`,
                animationDelay: `${i * 0.7}s`,
              }}
            />
          ))}
        </div>

        <div className="flex items-center gap-3 relative z-10 animate-fade-in">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">BookWave</span>
        </div>
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl font-bold text-white leading-tight animate-fade-in-up">
            Commencez votre aventure litteraire
          </h2>
          <ul className="space-y-3">
            {[
              'Gerez votre collection de livres',
              'Suivez votre progression de lecture',
              'Tenez un journal de vos lectures',
              'Relevez des defis de lecture',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-white/90 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-white/40 text-sm relative z-10 animate-fade-in">Gratuit et sans carte bancaire</p>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2.5 mb-8 lg:hidden animate-fade-in">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">BookWave</span>
          </div>

          <div className="mb-2 animate-fade-in stagger-1">
            <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
              <Sparkles className="w-3 h-3" />
              Inscription
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2 animate-fade-in stagger-2">Creer un compte</h1>
          <p className="text-muted-foreground mb-8 animate-fade-in stagger-3">Rejoignez votre bibliotheque personnelle</p>

          <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in stagger-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Nom d&apos;utilisateur</Label>
              <Input
                id="username"
                type="text"
                placeholder="lecteur42"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="6 caracteres minimum"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg border border-destructive/20 animate-scale-in">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 btn-press shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow group" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creation du compte...
                </div>
              ) : (
                <>
                  Creer mon compte
                  <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6 animate-fade-in stagger-5">
            Deja un compte ?{' '}
            <Link href="/auth/login" className="text-primary font-medium hover:underline transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
