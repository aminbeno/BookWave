'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, ChartBar as BarChart2, ListChecks, Trophy, ChevronRight, Star, ArrowRight, Sparkles } from 'lucide-react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Button } from '@/components/ui/button';

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, isVisible };
}

export default function LandingPage() {
  const { user, loading } = useUnifiedAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const features = useInView();
  const preview = useInView();
  const cta = useInView();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 animate-fade-in">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">BookWave</span>
          </div>
          <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="btn-press">Se connecter</Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="btn-press shadow-lg shadow-primary/20">Commencer</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6 animate-fade-in stagger-1">
            <Sparkles className="w-3.5 h-3.5" />
            Votre bibliothèque intelligente
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-fade-in stagger-2">
            Gérez votre lecture avec{' '}
            <span className="text-primary relative">
              BookWave
              <span className="absolute -bottom-1 left-0 right-0 h-1 bg-primary/20 rounded-full" />
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in stagger-3">
            Suivez votre progression, tenez un journal de lecture, organisez votre collection et atteignez vos objectifs littéraires en toute simplicité.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in stagger-4">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto px-8 btn-press shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                Créer mon compte gratuit
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 btn-press">
                Se connecter
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Preview image */}
      <section className="px-4 sm:px-6 pb-20" ref={preview.ref}>
        <div className="max-w-5xl mx-auto">
          <div className={`rounded-2xl overflow-hidden border border-border shadow-2xl bg-card transition-all duration-700 ${preview.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1130980/pexels-photo-1130980.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="BookWave interface"
                className="w-full h-64 sm:h-96 object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 sm:px-6 py-20 bg-secondary/40 relative" ref={features.ref}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto relative">
          <div className={`text-center mb-14 transition-all duration-500 ${features.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <h2 className="text-3xl font-bold text-foreground mb-3">Tout ce dont vous avez besoin</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Une suite complète d'outils pour les passionnés de lecture</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BookOpen,
                title: 'Collection complète',
                desc: 'Ajoutez, organisez et retrouvez tous vos livres en un seul endroit.',
                colorBg: 'bg-blue-50',
                colorText: 'text-blue-600',
              },
              {
                icon: BarChart2,
                title: 'Suivi de progression',
                desc: 'Enregistrez vos pages lues et visualisez vos statistiques de lecture.',
                colorBg: 'bg-green-50',
                colorText: 'text-green-600',
              },
              {
                icon: ListChecks,
                title: 'Listes personnalisées',
                desc: "Créez des listes thématiques et organisez votre bibliothèque à votre façon.",
                colorBg: 'bg-orange-50',
                colorText: 'text-orange-600',
              },
              {
                icon: Trophy,
                title: 'Défis de lecture',
                desc: 'Fixez-vous des objectifs annuels et suivez votre progression vers la réussite.',
                colorBg: 'bg-yellow-50',
                colorText: 'text-yellow-600',
              },
            ].map((f, i) => (
              <div
                key={i}
                className={`bg-card rounded-xl p-6 border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 group ${features.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ transitionDelay: features.isVisible ? `${i * 80}ms` : '0ms' }}
              >
                <div className={`w-11 h-11 rounded-lg ${f.colorBg} ${f.colorText} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 py-20" ref={cta.ref}>
        <div className={`max-w-3xl mx-auto text-center transition-all duration-700 ${cta.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl font-bold text-foreground mb-4">Prêt à plonger dans vos livres ?</h2>
          <p className="text-muted-foreground mb-8">
            Rejoignez BookWave et transformez votre expérience de lecture dès aujourd'hui.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="px-10 btn-press shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-shadow">
              Commencer maintenant — c'est gratuit
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 sm:px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <BookOpen className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-foreground">BookWave</span>
          </div>
          <p className="text-sm text-muted-foreground">2026 BookWave. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
