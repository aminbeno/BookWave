'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CreditCard as Edit, Trash2, BookOpen, Star, Calendar, FileText, MessageSquare, Quote, Plus, X, TrendingUp, Hash } from 'lucide-react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { db } from '@/lib/db';
import { Book, JournalEntry, ReadingLog, BookTag } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  to_read: { label: 'À lire', color: 'bg-secondary text-muted-foreground', dot: 'bg-gray-400' },
  reading: { label: 'En cours', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  finished: { label: 'Terminé', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
};

const ENTRY_ICONS: Record<string, typeof FileText> = {
  note: FileText,
  quote: Quote,
  reflection: MessageSquare,
};

const ENTRY_LABELS: Record<string, string> = {
  note: 'Note', quote: 'Citation', reflection: 'Réflexion',
};

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useUnifiedAuth();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [logs, setLogs] = useState<ReadingLog[]>([]);
  const [tags, setTags] = useState<BookTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'info' | 'journal' | 'progress' | 'tags'>('info');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Progress form
  const [newPage, setNewPage] = useState('');
  const [logNotes, setLogNotes] = useState('');
  const [logLoading, setLogLoading] = useState(false);

  // Journal form
  const [journalType, setJournalType] = useState<'note' | 'quote' | 'reflection'>('note');
  const [journalContent, setJournalContent] = useState('');
  const [journalPage, setJournalPage] = useState('');
  const [journalLoading, setJournalLoading] = useState(false);

  // Tag form
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (!user || !id) return;
    fetchAll();
  }, [user, id]);

  const fetchAll = async () => {
    if (!user || !id) return;
    const [bookRes, journalRes, logRes, tagRes] = await Promise.all([
      db.books.getById(id, user),
      db.journalEntries.getAll(id),
      db.readingLogs.getAll(user, id),
      db.bookTags.getAll(id),
    ]);

    if (!bookRes.data) { router.push('/library'); return; }
    setBook(bookRes.data);
    setJournals(journalRes.data || []);
    setLogs(logRes.data || []);
    setTags(tagRes.data || []);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!book) return;
    await db.books.delete(book.id);
    router.push('/library');
  };

  const handleLogProgress = async () => {
    if (!user || !book || !newPage) return;
    setLogLoading(true);
    const page = parseInt(newPage);
    const prev = book.current_page;
    const pagesRead = Math.max(0, page - prev);

    await Promise.all([
      db.readingLogs.create({
        book_id: book.id,
        pages_read: pagesRead,
        current_page: page,
        logged_at: new Date().toISOString().split('T')[0],
        notes: logNotes,
      }, user),
      db.books.update(book.id, {
        current_page: page,
        status: page >= book.total_pages && book.total_pages > 0 ? 'finished' : 'reading',
        finished_at: page >= book.total_pages && book.total_pages > 0 ? new Date().toISOString().split('T')[0] : null,
      }),
    ]);

    setNewPage('');
    setLogNotes('');
    setLogLoading(false);
    fetchAll();
  };

  const handleAddJournal = async () => {
    if (!user || !book || !journalContent.trim()) return;
    setJournalLoading(true);
    await db.journalEntries.create({
      book_id: book.id,
      entry_type: journalType,
      content: journalContent.trim(),
      page_number: journalPage ? parseInt(journalPage) : null,
    }, user);
    setJournalContent('');
    setJournalPage('');
    setJournalLoading(false);
    fetchAll();
  };

  const handleDeleteJournal = async (entryId: string) => {
    await db.journalEntries.delete(entryId);
    setJournals(prev => prev.filter(j => j.id !== entryId));
  };

  const handleAddTag = async () => {
    if (!user || !book || !newTag.trim()) return;
    const tag = newTag.trim().toLowerCase();
    await db.bookTags.create({ book_id: book.id, tag }, user);
    setNewTag('');
    fetchAll();
  };

  const handleDeleteTag = async (tagId: string) => {
    await db.bookTags.delete(tagId);
    setTags(prev => prev.filter(t => t.id !== tagId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!book) return null;

  const progress = book.total_pages > 0 ? Math.round((book.current_page / book.total_pages) * 100) : 0;
  const status = STATUS_CONFIG[book.status];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 animate-fade-in">
        <Link href="/library">
          <Button variant="ghost" size="sm" className="gap-1.5 btn-press">
            <ArrowLeft className="w-4 h-4" />
            Bibliothèque
          </Button>
        </Link>
        <div className="flex-1" />
        <Link href={`/books/${book.id}/edit`}>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Edit className="w-4 h-4" />
            Modifier
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-destructive hover:bg-destructive hover:text-white border-destructive/30"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 className="w-4 h-4" />
          Supprimer
        </Button>
      </div>

      {/* Book hero */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-6 animate-fade-in stagger-1 hover:shadow-lg transition-shadow duration-300">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Cover */}
          <div className="w-32 sm:w-40 flex-shrink-0">
            <div className="aspect-[2/3] rounded-xl bg-secondary overflow-hidden shadow-lg">
              {book.cover_url ? (
                <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-muted-foreground/40" />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-2 mb-2">
              <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5', status.color)}>
                <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                {status.label}
              </span>
              {book.genre && (
                <span className="text-xs bg-secondary text-muted-foreground px-2.5 py-1 rounded-full">{book.genre}</span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-1">{book.title}</h1>
            <p className="text-lg text-muted-foreground mb-3">{book.author}</p>

            {book.rating && (
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map(r => (
                  <Star
                    key={r}
                    className={cn('w-5 h-5', r <= book.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30')}
                  />
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground mb-4">
              {book.total_pages > 0 && <span>{book.total_pages} pages</span>}
              {book.published_year && <span>Publié en {book.published_year}</span>}
              {book.started_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Début : {new Date(book.started_at).toLocaleDateString('fr-FR')}
                </span>
              )}
              {book.finished_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Fin : {new Date(book.finished_at).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>

            {book.status === 'reading' && book.total_pages > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-1.5">
                  <span>Progression</span>
                  <span className="font-medium">{book.current_page} / {book.total_pages} pages ({progress}%)</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full progress-bar" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {book.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{book.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6 overflow-x-auto animate-fade-in stagger-2">
        {[
          { key: 'info', label: 'Informations' },
          { key: 'progress', label: `Progression (${logs.length})` },
          { key: 'journal', label: `Journal (${journals.length})` },
          { key: 'tags', label: `Tags (${tags.length})` },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={cn(
              'px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200',
              tab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'info' && (
        <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
          <h2 className="font-semibold text-foreground mb-4">Details du livre</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {[
              { label: 'Titre', value: book.title },
              { label: 'Auteur', value: book.author },
              { label: 'Genre', value: book.genre || '—' },
              { label: 'Année', value: book.published_year?.toString() || '—' },
              { label: 'Pages totales', value: book.total_pages > 0 ? book.total_pages.toString() : '—' },
              { label: 'Page actuelle', value: book.current_page.toString() },
            ].map((item, i) => (
              <div key={i}>
                <dt className="text-muted-foreground mb-0.5">{item.label}</dt>
                <dd className="font-medium text-foreground">{item.value}</dd>
              </div>
            ))}
          </dl>
          {book.description && (
            <div className="mt-5 pt-5 border-t border-border">
              <dt className="text-sm text-muted-foreground mb-2">Description</dt>
              <dd className="text-sm text-foreground leading-relaxed">{book.description}</dd>
            </div>
          )}
        </div>
      )}

      {tab === 'progress' && (
        <div className="space-y-4 animate-fade-in">
          {/* Log progress form */}
          {book.status !== 'finished' && (
            <div className="bg-card rounded-xl border border-border p-5 animate-scale-in">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Enregistrer ma progression
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Page actuelle</label>
                  <Input
                    type="number"
                    value={newPage}
                    onChange={(e) => setNewPage(e.target.value)}
                    placeholder={`Actuellement : p. ${book.current_page}`}
                    min={book.current_page}
                    max={book.total_pages || undefined}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Notes (optionnel)</label>
                  <Input
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    placeholder="Notes de session..."
                  />
                </div>
              </div>
              <Button onClick={handleLogProgress} disabled={logLoading || !newPage} className="gap-2">
                <Plus className="w-4 h-4" />
                {logLoading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          )}

          {/* Log history */}
          {logs.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <TrendingUp className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Aucune session enregistrée</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map(log => (
                <div key={log.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      +{log.pages_read} pages — jusqu'à la page {log.current_page}
                    </p>
                    {log.notes && <p className="text-xs text-muted-foreground mt-0.5">{log.notes}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {new Date(log.logged_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'journal' && (
        <div className="space-y-4 animate-fade-in">
          {/* Add entry form */}
          <div className="bg-card rounded-xl border border-border p-5 animate-scale-in">
            <h3 className="font-semibold text-foreground mb-4">Ajouter une entrée</h3>
            <div className="flex gap-2 mb-4">
              {(['note', 'quote', 'reflection'] as const).map(type => {
                const Icon = ENTRY_ICONS[type];
                return (
                  <button
                    key={type}
                    onClick={() => setJournalType(type)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                      journalType === type ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {ENTRY_LABELS[type]}
                  </button>
                );
              })}
            </div>
            <Textarea
              value={journalContent}
              onChange={(e) => setJournalContent(e.target.value)}
              placeholder={
                journalType === 'quote' ? 'Saisir une citation du livre...' :
                journalType === 'reflection' ? 'Vos réflexions sur ce livre...' :
                'Votre note de lecture...'
              }
              rows={3}
              className="mb-3"
            />
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={journalPage}
                onChange={(e) => setJournalPage(e.target.value)}
                placeholder="Page (optionnel)"
                className="w-36"
              />
              <Button onClick={handleAddJournal} disabled={journalLoading || !journalContent.trim()} className="gap-2">
                <Plus className="w-4 h-4" />
                Ajouter
              </Button>
            </div>
          </div>

          {/* Journal list */}
          {journals.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Aucune entrée dans le journal</p>
            </div>
          ) : (
            <div className="space-y-3">
              {journals.map(entry => {
                const Icon = ENTRY_ICONS[entry.entry_type];
                return (
                  <div key={entry.id} className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-primary">{ENTRY_LABELS[entry.entry_type]}</span>
                            {entry.page_number && (
                              <span className="text-xs text-muted-foreground">p. {entry.page_number}</span>
                            )}
                            <span className="text-xs text-muted-foreground ml-auto">
                              {new Date(entry.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <p className={cn(
                            'text-sm text-foreground leading-relaxed',
                            entry.entry_type === 'quote' && 'italic border-l-2 border-primary pl-3'
                          )}>
                            {entry.content}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteJournal(entry.id)}
                        className="text-muted-foreground/50 hover:text-destructive transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'tags' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-card rounded-xl border border-border p-5 animate-scale-in">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Hash className="w-4 h-4 text-primary" />
              Tags personnalisés
            </h3>
            <div className="flex gap-2 mb-4 flex-wrap">
              {tags.map(t => (
                <span key={t.id} className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                  #{t.tag}
                  <button onClick={() => handleDeleteTag(t.id)} className="hover:text-destructive transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {tags.length === 0 && <p className="text-sm text-muted-foreground">Aucun tag</p>}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Ajouter un tag..."
                className="max-w-xs"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
              />
              <Button onClick={handleAddTag} disabled={!newTag.trim()} variant="outline" className="gap-1.5">
                <Plus className="w-4 h-4" />
                Ajouter
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card rounded-2xl border border-border p-6 max-w-sm w-full shadow-2xl animate-scale-in">
            <h3 className="text-lg font-semibold text-foreground mb-2">Supprimer ce livre ?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Cette action est irréversible. Le livre et toutes ses données seront définitivement supprimés.
            </p>
            <div className="flex gap-3">
              <Button variant="destructive" onClick={handleDelete} className="flex-1">
                Supprimer
              </Button>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
