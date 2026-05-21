'use client';

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('bookwave_token');
};

const headers = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

const api = {
  // Books
  getBooks: async () => {
    const res = await fetch('/api/books', { headers: headers() });
    return res.json();
  },
  getBook: async (id: string) => {
    const res = await fetch(`/api/books/${id}`, { headers: headers() });
    return res.json();
  },
  createBook: async (data: any) => {
    const res = await fetch('/api/books', { method: 'POST', headers: headers(), body: JSON.stringify(data) });
    return res.json();
  },
  updateBook: async (id: string, data: any) => {
    const res = await fetch(`/api/books/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(data) });
    return res.json();
  },
  deleteBook: async (id: string) => {
    const res = await fetch(`/api/books/${id}`, { method: 'DELETE', headers: headers() });
    return res.json();
  },

  // Reading Logs
  getReadingLogs: async (bookId?: string) => {
    const url = bookId ? `/api/reading-logs?book_id=${bookId}` : '/api/reading-logs';
    const res = await fetch(url, { headers: headers() });
    return res.json();
  },
  createReadingLog: async (data: any) => {
    const res = await fetch('/api/reading-logs', { method: 'POST', headers: headers(), body: JSON.stringify(data) });
    return res.json();
  },

  // Journal Entries
  getJournalEntries: async (bookId?: string) => {
    const url = bookId ? `/api/journal-entries?book_id=${bookId}` : '/api/journal-entries';
    const res = await fetch(url, { headers: headers() });
    return res.json();
  },
  createJournalEntry: async (data: any) => {
    const res = await fetch('/api/journal-entries', { method: 'POST', headers: headers(), body: JSON.stringify(data) });
    return res.json();
  },
  deleteJournalEntry: async (id: string) => {
    const res = await fetch(`/api/journal-entries/${id}`, { method: 'DELETE', headers: headers() });
    return res.json();
  },

  // Reading Lists
  getReadingLists: async () => {
    const res = await fetch('/api/reading-lists', { headers: headers() });
    return res.json();
  },
  createReadingList: async (data: any) => {
    const res = await fetch('/api/reading-lists', { method: 'POST', headers: headers(), body: JSON.stringify(data) });
    return res.json();
  },
  deleteReadingList: async (id: string) => {
    const res = await fetch(`/api/reading-lists/${id}`, { method: 'DELETE', headers: headers() });
    return res.json();
  },

  // Reading List Books
  getListBooks: async (listId: string) => {
    const res = await fetch(`/api/reading-lists/${listId}/books`, { headers: headers() });
    return res.json();
  },
  addBookToList: async (listId: string, bookId: string) => {
    const res = await fetch(`/api/reading-lists/${listId}/books`, { method: 'POST', headers: headers(), body: JSON.stringify({ book_id: bookId }) });
    return res.json();
  },
  removeBookFromList: async (listId: string, bookId: string) => {
    const res = await fetch(`/api/reading-lists/${listId}/books`, { method: 'DELETE', headers: headers(), body: JSON.stringify({ book_id: bookId }) });
    return res.json();
  },

  // Book Tags
  getBookTags: async (bookId?: string) => {
    const url = bookId ? `/api/book-tags?book_id=${bookId}` : '/api/book-tags';
    const res = await fetch(url, { headers: headers() });
    return res.json();
  },
  createBookTag: async (data: any) => {
    const res = await fetch('/api/book-tags', { method: 'POST', headers: headers(), body: JSON.stringify(data) });
    return res.json();
  },
  deleteBookTag: async (id: string) => {
    const res = await fetch(`/api/book-tags/${id}`, { method: 'DELETE', headers: headers() });
    return res.json();
  },

  // Reading Challenges
  getReadingChallenges: async () => {
    const res = await fetch('/api/reading-challenges', { headers: headers() });
    return res.json();
  },
  createReadingChallenge: async (data: any) => {
    const res = await fetch('/api/reading-challenges', { method: 'POST', headers: headers(), body: JSON.stringify(data) });
    return res.json();
  },
  deleteReadingChallenge: async (id: string) => {
    const res = await fetch(`/api/reading-challenges/${id}`, { method: 'DELETE', headers: headers() });
    return res.json();
  },
};

export default api;
