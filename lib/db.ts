'use client';

import mongoApi from '@/lib/mongo-api';

function getUserId(user: any): string {
  return user?.id || '';
}

export const db = {
  // Books
  books: {
    getAll: async (user: any) => {
      const data = await mongoApi.getBooks();
      return { data, error: null };
    },
    getById: async (id: string, user: any) => {
      const data = await mongoApi.getBook(id);
      return { data: data.error ? null : data, error: data.error ? data : null };
    },
    create: async (data: any, user: any) => {
      const result = await mongoApi.createBook({ ...data, user_id: getUserId(user) });
      return { data: result, error: result.error ? result : null };
    },
    update: async (id: string, data: any) => {
      const result = await mongoApi.updateBook(id, data);
      return { data: result, error: result.error ? result : null };
    },
    delete: async (id: string) => {
      return mongoApi.deleteBook(id);
    },
  },

  // Reading Logs
  readingLogs: {
    getAll: async (user: any, bookId?: string) => {
      const data = await mongoApi.getReadingLogs(bookId);
      return { data, error: null };
    },
    create: async (data: any, user: any) => {
      const result = await mongoApi.createReadingLog({ ...data, user_id: getUserId(user) });
      return { data: result, error: null };
    },
  },

  // Journal Entries
  journalEntries: {
    getAll: async (bookId: string) => {
      const data = await mongoApi.getJournalEntries(bookId);
      return { data, error: null };
    },
    create: async (data: any, user: any) => {
      const result = await mongoApi.createJournalEntry({ ...data, user_id: getUserId(user) });
      return { data: result, error: null };
    },
    delete: async (id: string) => {
      return mongoApi.deleteJournalEntry(id);
    },
  },

  // Book Tags
  bookTags: {
    getAll: async (bookId: string) => {
      const data = await mongoApi.getBookTags(bookId);
      return { data, error: null };
    },
    create: async (data: any, user: any) => {
      const result = await mongoApi.createBookTag({ ...data, user_id: getUserId(user) });
      return { data: result, error: null };
    },
    delete: async (id: string) => {
      return mongoApi.deleteBookTag(id);
    },
  },

  // Reading Lists
  readingLists: {
    getAll: async (user: any) => {
      const data = await mongoApi.getReadingLists();
      return { data, error: null };
    },
    create: async (data: any, user: any) => {
      const result = await mongoApi.createReadingList({ ...data, user_id: getUserId(user) });
      return { data: result, error: null };
    },
    delete: async (id: string) => {
      return mongoApi.deleteReadingList(id);
    },
  },

  // Reading List Books
  readingListBooks: {
    getAll: async () => {
      const data = await mongoApi.getReadingLists();
      const allListBooks: any[] = [];
      for (const list of data) {
        const lbs = await mongoApi.getListBooks(list.id);
        allListBooks.push(...lbs);
      }
      return { data: allListBooks, error: null };
    },
    add: async (listId: string, bookId: string) => {
      return mongoApi.addBookToList(listId, bookId);
    },
    remove: async (listId: string, bookId: string) => {
      return mongoApi.removeBookFromList(listId, bookId);
    },
  },

  // Reading Challenges
  readingChallenges: {
    getAll: async (user: any) => {
      const data = await mongoApi.getReadingChallenges();
      return { data, error: null };
    },
    create: async (data: any, user: any) => {
      const result = await mongoApi.createReadingChallenge({ ...data, user_id: getUserId(user) });
      return { data: result, error: null };
    },
    delete: async (id: string) => {
      return mongoApi.deleteReadingChallenge(id);
    },
  },
};
