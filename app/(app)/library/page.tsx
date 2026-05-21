'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Plus, Search, Filter, BookOpen, Grid2x2 as Grid, List } from 'lucide-react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { db } from '@/lib/db';
import { Book } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BookCard from '@/components/bookwave/BookCard';
import { cn } from '@/lib/utils';

const STATUSES = [
  { value: '', label: 'Tous' },
  { value: 'to_read', label: 'À lire' },
  { value: 'reading', label: 'En cours' },
  { value: 'finished', label: 'Terminé' },
];

const GENRES = ['Roman', 'Science-fiction', 'Fantaisie', 'Policier', 'Biographie', 'Histoire', 'Développement personnel', 'Science', 'Poésie', 'Autre'];

function LibraryContent() {
  const { user } = useUnifiedAuth();
  const searchParams = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [genreFilter, setGenreFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (!user) return;
    fetchBooks();
  }, [user]);

  const fetchBooks = async () => {
    if (!user) return;
    const { data } = await db.books.getAll(user);
    setBooks(data || []);
    setLoading(false);
  };

  const filtered = books.filter(b => {
    const matchSearch = !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || b.status === statusFilter;
    const matchGenre = !genreFilter || b.genre === genreFilter;
    return matchSearch && matchStatus && matchGenre;
  });

  const genreSet = new Set(books.map(b => b.genre).filter(Boolean));
  const genres = Array.from(genreSet);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Ma bibliothèque</h1>
          <p className="text-muted-foreground mt-1">{books.length} livre{books.length !== 1 ? 's' : ''} au total</p>
        </div>
        <Link href="/books/new">
          <Button className="gap-2 btn-press shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
            <Plus className="w-4 h-4" />
            Ajouter un livre
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-4 animate-fade-in stagger-1">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre ou auteur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Tous les genres</option>
            {genres.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <div className="flex items-center gap-1 border border-border rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn('p-1.5 rounded', viewMode === 'grid' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground')}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn('p-1.5 rounded', viewMode === 'list' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex flex-wrap gap-2">
          {STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                statusFilter === s.value
                  ? 'bg-primary text-white'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              {s.label}
              <span className="ml-1.5 text-xs opacity-70">
                ({s.value ? books.filter(b => b.status === s.value).length : books.length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border animate-scale-in">
          <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {books.length === 0 ? 'Aucun livre dans votre bibliothèque' : 'Aucun résultat'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {books.length === 0
              ? 'Ajoutez votre premier livre pour commencer'
              : 'Essayez de modifier vos filtres de recherche'}
          </p>
          {books.length === 0 && (
            <Link href="/books/new">
              <Button className="gap-2"><Plus className="w-4 h-4" />Ajouter un livre</Button>
            </Link>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((book, i) => (
            <div key={book.id} className={`animate-fade-in stagger-${Math.min(i + 1, 8)}`}>
              <BookCard book={book} />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((book, i) => (
            <div key={book.id} className={`animate-fade-in stagger-${Math.min(i + 1, 8)}`}>
              <BookListRow book={book} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BookListRow({ book }: { book: Book }) {
  const progress = book.total_pages > 0 ? Math.round((book.current_page / book.total_pages) * 100) : 0;
  const STATUS_COLORS: Record<string, string> = {
    to_read: 'bg-secondary text-muted-foreground',
    reading: 'bg-orange-100 text-orange-700',
    finished: 'bg-green-100 text-green-700',
  };
  const STATUS_LABELS: Record<string, string> = {
    to_read: 'À lire', reading: 'En cours', finished: 'Terminé',
  };

  return (
    <Link href={`/books/${book.id}`} className="block">
      <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 hover:border-primary/30 transition-colors">
        <div className="w-12 h-16 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
          {book.cover_url ? (
            <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-muted-foreground/40" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{book.title}</h3>
          <p className="text-sm text-muted-foreground">{book.author}</p>
          {book.status === 'reading' && book.total_pages > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-secondary rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs text-muted-foreground">{progress}%</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {book.genre && <span className="text-xs text-muted-foreground hidden sm:block">{book.genre}</span>}
          <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', STATUS_COLORS[book.status])}>
            {STATUS_LABELS[book.status]}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <LibraryContent />
    </Suspense>
  );
}
