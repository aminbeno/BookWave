'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Save } from 'lucide-react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

const GENRES = [
  'Roman', 'Science-fiction', 'Fantaisie', 'Policier/Thriller', 'Biographie', 'Autobiographie',
  'Histoire', 'Développement personnel', 'Science', 'Philosophie', 'Poésie', 'Essai',
  'Humour', 'Romance', 'Jeunesse', 'Bande dessinée', 'Autre',
];

export default function NewBookPage() {
  const { user } = useUnifiedAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coverPreview, setCoverPreview] = useState('');

  const [form, setForm] = useState({
    title: '',
    author: '',
    genre: '',
    published_year: '',
    description: '',
    cover_url: '',
    total_pages: '',
    status: 'to_read',
    rating: '',
    started_at: '',
    finished_at: '',
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    if (key === 'cover_url') setCoverPreview(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setLoading(true);

    const { error: err } = await db.books.create({
      title: form.title.trim(),
      author: form.author.trim(),
      genre: form.genre,
      published_year: form.published_year ? parseInt(form.published_year) : null,
      description: form.description.trim(),
      cover_url: form.cover_url.trim(),
      total_pages: form.total_pages ? parseInt(form.total_pages) : 0,
      current_page: 0,
      status: form.status as 'to_read' | 'reading' | 'finished',
      rating: form.rating ? parseInt(form.rating) : null,
      started_at: form.started_at || null,
      finished_at: form.finished_at || null,
    }, user);

    if (err) {
      setError('Erreur lors de l\'ajout du livre.');
      setLoading(false);
    } else {
      router.push('/library');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6 animate-fade-in">
        <Link href="/library">
          <Button variant="ghost" size="sm" className="gap-1.5 btn-press">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ajouter un livre</h1>
          <p className="text-sm text-muted-foreground">Enrichissez votre bibliothèque</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cover preview */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border border-border p-5 sticky top-24 animate-fade-in stagger-1">
            <div className="aspect-[2/3] rounded-lg bg-secondary overflow-hidden mb-4">
              {coverPreview ? (
                <img src={coverPreview} alt="Couverture" className="w-full h-full object-cover" onError={() => setCoverPreview('')} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/40">
                  <BookOpen className="w-12 h-12 mb-2" />
                  <p className="text-xs text-center px-4">Aperçu de la couverture</p>
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cover_url">URL de la couverture</Label>
              <Input
                id="cover_url"
                placeholder="https://..."
                value={form.cover_url}
                onChange={set('cover_url')}
              />
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-5 animate-fade-in stagger-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="title">Titre *</Label>
                <Input id="title" value={form.title} onChange={set('title')} placeholder="Le nom du vent" required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="author">Auteur *</Label>
                <Input id="author" value={form.author} onChange={set('author')} placeholder="Patrick Rothfuss" required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="genre">Genre</Label>
                <select
                  id="genre"
                  value={form.genre}
                  onChange={set('genre')}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Sélectionner un genre</option>
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="published_year">Année de publication</Label>
                <Input
                  id="published_year"
                  type="number"
                  value={form.published_year}
                  onChange={set('published_year')}
                  placeholder="2007"
                  min="0"
                  max={new Date().getFullYear()}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="total_pages">Nombre de pages</Label>
                <Input
                  id="total_pages"
                  type="number"
                  value={form.total_pages}
                  onChange={set('total_pages')}
                  placeholder="662"
                  min="0"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={set('description')}
                  placeholder="Résumé ou notes personnelles..."
                  rows={3}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status">Statut de lecture</Label>
                <select
                  id="status"
                  value={form.status}
                  onChange={set('status')}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="to_read">À lire</option>
                  <option value="reading">En cours</option>
                  <option value="finished">Terminé</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rating">Note (1-5)</Label>
                <select
                  id="rating"
                  value={form.rating}
                  onChange={set('rating')}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Pas encore noté</option>
                  {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r} étoile{r > 1 ? 's' : ''}</option>)}
                </select>
              </div>

              {(form.status === 'reading' || form.status === 'finished') && (
                <div className="space-y-1.5">
                  <Label htmlFor="started_at">Date de début</Label>
                  <Input
                    id="started_at"
                    type="date"
                    value={form.started_at}
                    onChange={set('started_at')}
                  />
                </div>
              )}

              {form.status === 'finished' && (
                <div className="space-y-1.5">
                  <Label htmlFor="finished_at">Date de fin</Label>
                  <Input
                    id="finished_at"
                    type="date"
                    value={form.finished_at}
                    onChange={set('finished_at')}
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} className="gap-2 flex-1 sm:flex-none btn-press shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
                <Save className="w-4 h-4" />
                {loading ? 'Ajout en cours...' : 'Ajouter le livre'}
              </Button>
              <Link href="/library">
                <Button type="button" variant="outline">Annuler</Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
