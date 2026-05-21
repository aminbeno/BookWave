/*
  # BookWave Schema

  ## Tables
  - `profiles` - User profile with reading stats and goals
  - `books` - Books in a user's collection
  - `reading_logs` - Progress entries for books
  - `journal_entries` - Notes and quotes per book
  - `reading_lists` - Custom lists created by users
  - `reading_list_books` - Join table for lists and books
  - `book_tags` - Tags per book
  - `reading_challenges` - Annual/monthly reading goals

  ## Security
  All tables have RLS enabled with owner-only access.
*/

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  avatar_url text,
  bio text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Books
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  author text NOT NULL,
  genre text DEFAULT '',
  published_year integer,
  description text DEFAULT '',
  cover_url text DEFAULT '',
  total_pages integer DEFAULT 0,
  current_page integer DEFAULT 0,
  status text DEFAULT 'to_read' CHECK (status IN ('to_read', 'reading', 'finished')),
  rating integer CHECK (rating BETWEEN 1 AND 5),
  started_at date,
  finished_at date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own books"
  ON books FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own books"
  ON books FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own books"
  ON books FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own books"
  ON books FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Reading logs (progress tracking)
CREATE TABLE IF NOT EXISTS reading_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pages_read integer NOT NULL DEFAULT 0,
  current_page integer NOT NULL DEFAULT 0,
  logged_at date NOT NULL DEFAULT CURRENT_DATE,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reading_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reading logs"
  ON reading_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reading logs"
  ON reading_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reading logs"
  ON reading_logs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reading logs"
  ON reading_logs FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Journal entries (notes, quotes, reflections)
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_type text DEFAULT 'note' CHECK (entry_type IN ('note', 'quote', 'reflection')),
  content text NOT NULL,
  page_number integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journal entries"
  ON journal_entries FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries"
  ON journal_entries FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
  ON journal_entries FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
  ON journal_entries FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Reading lists
CREATE TABLE IF NOT EXISTS reading_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reading_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reading lists"
  ON reading_lists FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reading lists"
  ON reading_lists FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reading lists"
  ON reading_lists FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reading lists"
  ON reading_lists FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Reading list books (join table)
CREATE TABLE IF NOT EXISTS reading_list_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES reading_lists(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  UNIQUE(list_id, book_id)
);

ALTER TABLE reading_list_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own list books"
  ON reading_list_books FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reading_lists
      WHERE reading_lists.id = reading_list_books.list_id
      AND reading_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own list books"
  ON reading_list_books FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reading_lists
      WHERE reading_lists.id = reading_list_books.list_id
      AND reading_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own list books"
  ON reading_list_books FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reading_lists
      WHERE reading_lists.id = reading_list_books.list_id
      AND reading_lists.user_id = auth.uid()
    )
  );

-- Book tags
CREATE TABLE IF NOT EXISTS book_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(book_id, tag)
);

ALTER TABLE book_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own book tags"
  ON book_tags FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own book tags"
  ON book_tags FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own book tags"
  ON book_tags FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Reading challenges
CREATE TABLE IF NOT EXISTS reading_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  goal_books integer NOT NULL DEFAULT 12,
  year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reading_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenges"
  ON reading_challenges FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenges"
  ON reading_challenges FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges"
  ON reading_challenges FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own challenges"
  ON reading_challenges FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS books_user_id_idx ON books(user_id);
CREATE INDEX IF NOT EXISTS books_status_idx ON books(status);
CREATE INDEX IF NOT EXISTS reading_logs_book_id_idx ON reading_logs(book_id);
CREATE INDEX IF NOT EXISTS reading_logs_user_id_idx ON reading_logs(user_id);
CREATE INDEX IF NOT EXISTS journal_entries_book_id_idx ON journal_entries(book_id);
CREATE INDEX IF NOT EXISTS book_tags_book_id_idx ON book_tags(book_id);
