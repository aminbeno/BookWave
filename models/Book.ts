import mongoose, { Schema, Document } from 'mongoose';

export interface IBook extends Document {
  user_id: mongoose.Types.ObjectId;
  title: string;
  author: string;
  genre: string;
  published_year: number | null;
  description: string;
  cover_url: string;
  total_pages: number;
  current_page: number;
  status: 'to_read' | 'reading' | 'finished';
  rating: number | null;
  started_at: Date | null;
  finished_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

const BookSchema = new Schema<IBook>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  genre: { type: String, default: '' },
  published_year: { type: Number, default: null },
  description: { type: String, default: '' },
  cover_url: { type: String, default: '' },
  total_pages: { type: Number, default: 0 },
  current_page: { type: Number, default: 0 },
  status: { type: String, enum: ['to_read', 'reading', 'finished'], default: 'to_read', index: true },
  rating: { type: Number, default: null, min: 1, max: 5 },
  started_at: { type: Date, default: null },
  finished_at: { type: Date, default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.models.Book || mongoose.model<IBook>('Book', BookSchema);
