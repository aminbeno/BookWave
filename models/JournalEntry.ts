import mongoose, { Schema, Document } from 'mongoose';

export interface IJournalEntry extends Document {
  book_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  entry_type: 'note' | 'quote' | 'reflection';
  content: string;
  page_number: number | null;
  created_at: Date;
  updated_at: Date;
}

const JournalEntrySchema = new Schema<IJournalEntry>({
  book_id: { type: Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  entry_type: { type: String, enum: ['note', 'quote', 'reflection'], default: 'note' },
  content: { type: String, required: true },
  page_number: { type: Number, default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.models.JournalEntry || mongoose.model<IJournalEntry>('JournalEntry', JournalEntrySchema);
