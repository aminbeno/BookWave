'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, BookMarked, CircleCheck as CheckCircle, Plus, TrendingUp, Trophy, Target, Flame } from 'lucide-react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { db } from '@/lib/db';
import { Book, ReadingChallenge } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import BookCard from '@/components/bookwave/BookCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Stats {
  total: number;
  reading: number;
  finished: number;
  toRead: number;
  pagesThisMonth: number;
}

export default function DashboardPage() {
  const { user } = useUnifiedAuth();
  const [stats, setStats] = useState<Stats>({ total: 0, reading: 0, finished: 0, toRead: 0, pagesThisMonth: 0 });
  const [currentlyReading, setCurrentlyReading] = useState<Book[]>([]);
  const [recentlyFinished, setRecentlyFinished] = useState<Book[]>([]);
  const [challenges, setChallenges] = useState<ReadingChallenge[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ month: string; livres: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    const [booksRes, logsRes, challengesRes] = await Promise.all([
      db.books.getAll(user),
      db.readingLogs.getAll(user),
      db.readingChallenges.getAll(user),
    ]);

    const books: any[] = booksRes.data || [];
    const logs: any[] = logsRes.data || [];

    const total = books.length;
    const reading = books.filter((b: any) => b.status === 'reading').length;
    const finished = books.filter((b: any) => b.status === 'finished').length;
    const toRead = books.filter((b: any) => b.status === 'to_read').length;

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const pagesThisMonth = logs
      .filter((l: any) => {
        const d = new Date(l.logged_at);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      })
      .reduce((sum: number, l: any) => sum + (l.pages_read || 0), 0);

    setStats({ total, reading, finished, toRead, pagesThisMonth });
    setCurrentlyReading(books.filter((b: any) => b.status === 'reading').slice(0, 4));
    setRecentlyFinished(
      books
        .filter((b: any) => b.status === 'finished')
        .sort((a: any, b: any) => new Date(b.finished_at || b.updated_at).getTime() - new Date(a.finished_at || a.updated_at).getTime())
        .slice(0, 4)
    );
    setChallenges(challengesRes.data || []);

    // Build monthly chart data (last 6 months)
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const monthly: { month: string; livres: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(thisYear, thisMonth - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const count = books.filter((b: any) => {
        if (!b.finished_at) return false;
        const fd = new Date(b.finished_at);
        return fd.getMonth() === m && fd.getFullYear() === y;
      }).length;
      monthly.push({ month: monthNames[m], livres: count });
    }
    setMonthlyData(monthly);
    setLoading(false);
  };

  const username = user?.username || user?.email?.split('@')[0] || 'lecteur';
  const currentYear = new Date().getFullYear();
  const currentYearChallenge = challenges.find(c => c.year === currentYear);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Bonjour, {username} !
          </h1>
          <p className="text-muted-foreground mt-1">Voici un aperçu de votre activité de lecture</p>
        </div>
        <Link href="/books/new">
          <Button className="gap-2 btn-press shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
            <Plus className="w-4 h-4" />
            Ajouter un livre
          </Button>
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total livres', value: stats.total, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'En cours', value: stats.reading, icon: BookMarked, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Terminés', value: stats.finished, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Pages ce mois', value: stats.pagesThisMonth, icon: Flame, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((s, i) => (
          <div key={i} className={`bg-card rounded-xl p-5 border border-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in stagger-${i + 1}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <div className={`w-9 h-9 rounded-lg ${s.bg} ${s.color} flex items-center justify-center`}>
                <s.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly chart */}
        <div className="lg:col-span-2 bg-card rounded-xl p-6 border border-border animate-fade-in stagger-5">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Livres terminés (6 derniers mois)</h2>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Bar dataKey="livres" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Challenge widget */}
        <div className="bg-card rounded-xl p-6 border border-border flex flex-col animate-fade-in stagger-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h2 className="font-semibold text-foreground">Défi {currentYear}</h2>
          </div>
          {currentYearChallenge ? (
            <>
              <p className="text-sm text-muted-foreground mb-2">{currentYearChallenge.title}</p>
              <div className="text-center my-4">
                <div className="text-4xl font-bold text-foreground stat-value">{stats.finished}</div>
                <div className="text-sm text-muted-foreground">/ {currentYearChallenge.goal_books} livres</div>
              </div>
              <div className="mt-auto">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Progression</span>
                  <span>{Math.min(100, Math.round((stats.finished / currentYearChallenge.goal_books) * 100))}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full progress-bar"
                    style={{ width: `${Math.min(100, (stats.finished / currentYearChallenge.goal_books) * 100)}%` }}
                  />
                </div>
                {stats.finished >= currentYearChallenge.goal_books && (
                  <p className="text-sm text-green-600 font-medium mt-2 text-center">Objectif atteint !</p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <Target className="w-10 h-10 text-muted-foreground/40 mb-3 animate-float" />
              <p className="text-sm text-muted-foreground mb-4">Aucun défi cette année</p>
              <Link href="/challenges">
                <Button size="sm" variant="outline" className="btn-press">Créer un défi</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Currently reading */}
      {currentlyReading.length > 0 && (
        <div className="animate-fade-in stagger-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-orange-500" />
              En cours de lecture
            </h2>
            <Link href="/library?status=reading" className="text-sm text-primary hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentlyReading.map((book, i) => (
              <div key={book.id} className={`animate-fade-in stagger-${i + 1}`}>
                <BookCard book={book} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently finished */}
      {recentlyFinished.length > 0 && (
        <div className="animate-fade-in stagger-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Récemment terminés
            </h2>
            <Link href="/library?status=finished" className="text-sm text-primary hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentlyFinished.map((book, i) => (
              <div key={book.id} className={`animate-fade-in stagger-${i + 1}`}>
                <BookCard book={book} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {stats.total === 0 && (
        <div className="text-center py-20 bg-card rounded-2xl border border-border animate-scale-in">
          <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4 animate-float" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Votre bibliothèque est vide</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Commencez par ajouter vos premiers livres pour suivre votre progression de lecture.
          </p>
          <Link href="/books/new">
            <Button className="gap-2 btn-press">
              <Plus className="w-4 h-4" />
              Ajouter mon premier livre
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
