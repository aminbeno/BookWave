'use client';

import Link from 'next/link';
import { Star, BookOpen } from 'lucide-react';
import { Book } from '@/lib/database.types';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  to_read: { label: 'À lire', color: 'bg-secondary text-muted-foreground' },
  reading: { label: 'En cours', color: 'bg-orange-100 text-orange-700' },
  finished: { label: 'Terminé', color: 'bg-green-100 text-green-700' },
};

interface BookCardProps {
  book: Book;
  className?: string;
}

export default function BookCard({ book, className }: BookCardProps) {
  const status = STATUS_LABELS[book.status] || STATUS_LABELS.to_read;
  const progress = book.total_pages > 0 ? Math.round((book.current_page / book.total_pages) * 100) : 0;

  return (
    <Link href={`/books/${book.id}`} className={cn('block book-card-hover group', className)}>
      <div className="bg-card rounded-xl border border-border overflow-hidden h-full flex flex-col group-hover:border-primary/30 transition-colors duration-300">
        {/* Cover */}
        <div className="relative aspect-[2/3] bg-gradient-to-br from-secondary to-muted overflow-hidden">
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              <BookOpen className="w-10 h-10 text-muted-foreground/40 mb-2" />
              <p className="text-xs text-muted-foreground text-center font-medium line-clamp-3">{book.title}</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-2 left-2">
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full backdrop-blur-sm', status.color)}>
              {status.label}
            </span>
          </div>
          {book.rating && (
            <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/60 text-yellow-400 text-xs px-1.5 py-0.5 rounded-full backdrop-blur-sm">
              <Star className="w-3 h-3 fill-yellow-400" />
              {book.rating}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col gap-1 flex-1">
          <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">{book.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>
          {book.genre && (
            <span className="text-xs text-muted-foreground/70">{book.genre}</span>
          )}

          {/* Progress bar for reading books */}
          {book.status === 'reading' && book.total_pages > 0 && (
            <div className="mt-2 pt-2 border-t border-border">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>p. {book.current_page}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full progress-bar"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
