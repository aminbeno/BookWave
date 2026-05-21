'use client';

import { useEffect, useState } from 'react';
import { Plus, Trophy, Target, Trash2, Calendar, BookOpen, Star } from 'lucide-react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { db } from '@/lib/db';
import { ReadingChallenge, Book } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function ChallengesPage() {
  const { user } = useUnifiedAuth();
  const [challenges, setChallenges] = useState<ReadingChallenge[]>([]);
  const [finishedBooks, setFinishedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showDelete, setShowDelete] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const [form, setForm] = useState({ title: `Défi lecture ${currentYear}`, goal_books: '12', year: currentYear.toString() });

  useEffect(() => {
    if (!user) return;
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    if (!user) return;
    const [challengesRes, booksRes] = await Promise.all([
      db.readingChallenges.getAll(user),
      db.books.getAll(user),
    ]);
    setChallenges(challengesRes.data || []);
    setFinishedBooks((booksRes.data || []).filter((b: any) => b.status === 'finished'));
    setLoading(false);
  };

  const getBooksForYear = (year: number) =>
    finishedBooks.filter(b => {
      if (!b.finished_at) return false;
      return new Date(b.finished_at).getFullYear() === year;
    });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setFormLoading(true);
    await db.readingChallenges.create({
      title: form.title.trim(),
      goal_books: parseInt(form.goal_books),
      year: parseInt(form.year),
    }, user);
    setShowForm(false);
    setFormLoading(false);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    await db.readingChallenges.delete(id);
    setShowDelete(null);
    fetchAll();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalFinished = finishedBooks.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Défis de lecture</h1>
          <p className="text-muted-foreground mt-1">{totalFinished} livre{totalFinished !== 1 ? 's' : ''} terminé{totalFinished !== 1 ? 's' : ''} au total</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2 btn-press shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
          <Plus className="w-4 h-4" />
          Nouveau défi
        </Button>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Livres lus', value: totalFinished, icon: BookOpen, colorBg: 'bg-blue-50', colorText: 'text-blue-600' },
          { label: 'Cette année', value: getBooksForYear(currentYear).length, icon: Calendar, colorBg: 'bg-green-50', colorText: 'text-green-600' },
          { label: 'Défis actifs', value: challenges.filter(c => c.year === currentYear).length, icon: Target, colorBg: 'bg-orange-50', colorText: 'text-orange-600' },
          { label: 'Défis complétés', value: challenges.filter(c => getBooksForYear(c.year).length >= c.goal_books).length, icon: Trophy, colorBg: 'bg-yellow-50', colorText: 'text-yellow-600' },
        ].map((s, i) => (
          <div key={i} className={`bg-card rounded-xl p-5 border border-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in stagger-${i + 1}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <div className={`w-8 h-8 rounded-lg ${s.colorBg} ${s.colorText} flex items-center justify-center`}>
                <s.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground">{s.value}</div>
          </div>
        ))}
      </div>

      {/* New challenge form */}
      {showForm && (
        <div className="bg-card rounded-xl border border-border p-6 animate-scale-in">
          <h2 className="font-semibold text-foreground mb-4">Créer un défi de lecture</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1 space-y-1.5">
                <Label htmlFor="ch-year">Année</Label>
                <Input
                  id="ch-year"
                  type="number"
                  value={form.year}
                  onChange={(e) => setForm(f => ({ ...f, year: e.target.value }))}
                  min="2020"
                  max="2030"
                />
              </div>
              <div className="sm:col-span-1 space-y-1.5">
                <Label htmlFor="ch-goal">Objectif (livres)</Label>
                <Input
                  id="ch-goal"
                  type="number"
                  value={form.goal_books}
                  onChange={(e) => setForm(f => ({ ...f, goal_books: e.target.value }))}
                  min="1"
                  max="365"
                />
              </div>
              <div className="sm:col-span-1 space-y-1.5">
                <Label htmlFor="ch-title">Titre du défi</Label>
                <Input
                  id="ch-title"
                  value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Défi lecture 2026"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={formLoading} className="gap-2">
                <Trophy className="w-4 h-4" />
                {formLoading ? 'Création...' : 'Créer le défi'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            </div>
          </form>
        </div>
      )}

      {/* Challenges list */}
      {challenges.length === 0 && !showForm ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border animate-scale-in">
          <Trophy className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Aucun défi créé</h3>
          <p className="text-muted-foreground mb-6">Fixez-vous des objectifs pour booster votre lecture</p>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Créer mon premier défi
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {challenges.map((challenge, idx) => {
            const yearBooks = getBooksForYear(challenge.year);
            const count = yearBooks.length;
            const pct = Math.min(100, Math.round((count / challenge.goal_books) * 100));
            const isCompleted = count >= challenge.goal_books;
            const isCurrent = challenge.year === currentYear;

            return (
              <div
                key={challenge.id}
                className={cn(
                  `animate-fade-in stagger-${Math.min(idx + 1, 8)}`,
                  'bg-card rounded-xl border p-6',
                  isCompleted ? 'border-yellow-300' : 'border-border',
                  isCurrent && !isCompleted && 'border-primary/30'
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className={cn('w-4 h-4', isCompleted ? 'text-yellow-500' : 'text-muted-foreground')} />
                      <span className="text-xs font-medium text-muted-foreground">{challenge.year}</span>
                      {isCurrent && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Cette année</span>}
                      {isCompleted && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1"><Star className="w-2.5 h-2.5 fill-yellow-500" />Complété !</span>}
                    </div>
                    <h3 className="font-semibold text-foreground">{challenge.title}</h3>
                  </div>
                  <button
                    onClick={() => setShowDelete(challenge.id)}
                    className="text-muted-foreground/50 hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-center mb-5">
                  <div className="text-4xl font-bold text-foreground">{count}</div>
                  <div className="text-sm text-muted-foreground">/ {challenge.goal_books} livres</div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Progression</span>
                    <span className="font-medium">{pct}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div
                      className={cn('h-2.5 rounded-full progress-bar', isCompleted ? 'bg-yellow-400' : 'bg-primary')}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Books in this year */}
                {yearBooks.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Livres terminés cette année :</p>
                    <div className="flex flex-wrap gap-1">
                      {yearBooks.slice(0, 6).map(book => (
                        <div key={book.id} className="w-8 h-11 rounded bg-secondary overflow-hidden" title={book.title}>
                          {book.cover_url ? (
                            <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-3 h-3 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                      ))}
                      {yearBooks.length > 6 && (
                        <div className="w-8 h-11 rounded bg-secondary flex items-center justify-center text-xs text-muted-foreground">
                          +{yearBooks.length - 6}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {count === 0 && (
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    {challenge.year === currentYear
                      ? 'Commencez à lire pour progresser !'
                      : 'Aucun livre terminé cette année.'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirm */}
      {showDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card rounded-2xl border border-border p-6 max-w-sm w-full shadow-2xl animate-scale-in">
            <h3 className="text-lg font-semibold text-foreground mb-2">Supprimer ce défi ?</h3>
            <p className="text-sm text-muted-foreground mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <Button variant="destructive" onClick={() => handleDelete(showDelete)} className="flex-1">Supprimer</Button>
              <Button variant="outline" onClick={() => setShowDelete(null)} className="flex-1">Annuler</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
