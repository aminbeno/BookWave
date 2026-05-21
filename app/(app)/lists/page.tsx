'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, ListChecks, BookOpen, X, Pencil, Check, Trash2 } from 'lucide-react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { db } from '@/lib/db';
import { ReadingList, Book, ReadingListBook } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const LIST_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

export default function ListsPage() {
  const { user } = useUnifiedAuth();
  const [lists, setLists] = useState<ReadingList[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [listBooks, setListBooks] = useState<Record<string, Book[]>>({});
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [showAddBook, setShowAddBook] = useState(false);
  const [showDeleteList, setShowDeleteList] = useState<string | null>(null);

  const [form, setForm] = useState({ name: '', description: '', color: '#3B82F6' });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    if (!user) return;
    const [listsRes, booksRes, listBooksRes] = await Promise.all([
      db.readingLists.getAll(user),
      db.books.getAll(user),
      db.readingListBooks.getAll(),
    ]);

    const ls: any[] = listsRes.data || [];
    const bs: any[] = booksRes.data || [];
    const lbs: any[] = listBooksRes.data || [];

    setLists(ls);
    setBooks(bs);

    const bookMap: Record<string, any[]> = {};
    for (const list of ls) {
      const bookIds = lbs.filter((lb: any) => lb.list_id === list.id).map((lb: any) => lb.book_id);
      bookMap[list.id] = bs.filter((b: any) => bookIds.includes(b.id));
    }
    setListBooks(bookMap);
    setLoading(false);
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.name.trim()) return;
    setFormLoading(true);
    await db.readingLists.create({
      name: form.name.trim(),
      description: form.description.trim(),
      color: form.color,
    }, user);
    setForm({ name: '', description: '', color: '#3B82F6' });
    setShowNew(false);
    setFormLoading(false);
    fetchAll();
  };

  const handleAddBookToList = async (bookId: string) => {
    if (!selectedList) return;
    await db.readingListBooks.add(selectedList, bookId);
    setShowAddBook(false);
    fetchAll();
  };

  const handleRemoveBookFromList = async (listId: string, bookId: string) => {
    await db.readingListBooks.remove(listId, bookId);
    fetchAll();
  };

  const handleDeleteList = async (listId: string) => {
    await db.readingLists.delete(listId);
    setShowDeleteList(null);
    fetchAll();
  };

  const booksNotInList = (listId: string) => {
    const inList = new Set((listBooks[listId] || []).map(b => b.id));
    return books.filter(b => !inList.has(b.id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mes listes</h1>
          <p className="text-muted-foreground mt-1">{lists.length} liste{lists.length !== 1 ? 's' : ''} personnalisée{lists.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="gap-2 btn-press shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
          <Plus className="w-4 h-4" />
          Nouvelle liste
        </Button>
      </div>

      {/* Create list form */}
      {showNew && (
        <div className="bg-card rounded-xl border border-border p-6 animate-scale-in">
          <h2 className="font-semibold text-foreground mb-4">Créer une nouvelle liste</h2>
          <form onSubmit={handleCreateList} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="list-name">Nom de la liste *</Label>
                <Input
                  id="list-name"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Livres préférés"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Couleur</Label>
                <div className="flex gap-2 flex-wrap">
                  {LIST_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, color: c }))}
                      className={cn(
                        'w-7 h-7 rounded-full border-2 transition-transform',
                        form.color === c ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="list-desc">Description (optionnelle)</Label>
              <Textarea
                id="list-desc"
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Description de la liste..."
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={formLoading} className="gap-2">
                <Check className="w-4 h-4" />
                {formLoading ? 'Création...' : 'Créer'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Annuler</Button>
            </div>
          </form>
        </div>
      )}

      {/* Lists */}
      {lists.length === 0 && !showNew ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border animate-scale-in">
          <ListChecks className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Aucune liste créée</h3>
          <p className="text-muted-foreground mb-6">Créez des listes pour organiser votre bibliothèque</p>
          <Button onClick={() => setShowNew(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Créer ma première liste
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {lists.map((list, i) => (
            <div key={list.id} className={`bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 animate-fade-in stagger-${Math.min(i + 1, 8)}`}>
              {/* List header */}
              <div className="p-4 flex items-center justify-between" style={{ borderLeft: `4px solid ${list.color}` }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${list.color}20` }}>
                    <ListChecks className="w-4 h-4" style={{ color: list.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{list.name}</h3>
                    {list.description && <p className="text-xs text-muted-foreground mt-0.5">{list.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setSelectedList(list.id); setShowAddBook(true); }}
                    className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                    title="Ajouter un livre"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteList(list.id)}
                    className="p-1.5 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                    title="Supprimer la liste"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Books in list */}
              <div className="p-4 border-t border-border">
                {(listBooks[list.id] || []).length === 0 ? (
                  <div className="text-center py-6">
                    <BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">Aucun livre dans cette liste</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setSelectedList(list.id); setShowAddBook(true); }}
                      className="gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Ajouter un livre
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(listBooks[list.id] || []).map(book => (
                      <div key={book.id} className="flex items-center gap-3 group">
                        <div className="w-8 h-11 rounded bg-secondary overflow-hidden flex-shrink-0">
                          {book.cover_url ? (
                            <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-3 h-3 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/books/${book.id}`} className="text-sm font-medium text-foreground hover:text-primary truncate block">
                            {book.title}
                          </Link>
                          <p className="text-xs text-muted-foreground">{book.author}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveBookFromList(list.id, book.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => { setSelectedList(list.id); setShowAddBook(true); }}
                      className="w-full text-xs text-primary hover:underline pt-2 text-center"
                    >
                      + Ajouter un livre
                    </button>
                  </div>
                )}
              </div>

              <div className="px-4 pb-3">
                <span className="text-xs text-muted-foreground">
                  {(listBooks[list.id] || []).length} livre{(listBooks[list.id] || []).length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add book modal */}
      {showAddBook && selectedList && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl max-h-[80vh] flex flex-col animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Ajouter un livre à la liste</h3>
              <button onClick={() => setShowAddBook(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto space-y-2 flex-1">
              {booksNotInList(selectedList).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Tous vos livres sont déjà dans cette liste
                </p>
              ) : (
                booksNotInList(selectedList).map(book => (
                  <button
                    key={book.id}
                    onClick={() => handleAddBookToList(book.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors text-left"
                  >
                    <div className="w-9 h-12 rounded bg-secondary overflow-hidden flex-shrink-0">
                      {book.cover_url ? (
                        <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-3.5 h-3.5 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{book.title}</p>
                      <p className="text-xs text-muted-foreground">{book.author}</p>
                    </div>
                    <Plus className="w-4 h-4 text-primary flex-shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete list confirm */}
      {showDeleteList && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card rounded-2xl border border-border p-6 max-w-sm w-full shadow-2xl animate-scale-in">
            <h3 className="text-lg font-semibold text-foreground mb-2">Supprimer cette liste ?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Les livres ne seront pas supprimés, seulement la liste.
            </p>
            <div className="flex gap-3">
              <Button variant="destructive" onClick={() => handleDeleteList(showDeleteList)} className="flex-1">Supprimer</Button>
              <Button variant="outline" onClick={() => setShowDeleteList(null)} className="flex-1">Annuler</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
