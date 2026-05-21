import mongoose, { Schema, Document } from 'mongoose';

export interface IReadingLog extends Document {
  book_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  pages_read: number;
  current_page: number;
  logged_at: Date;
  notes: string;
  created_at: Date;
}

const ReadingLogSchema = new Schema<IReadingLog>({
  book_id: { type: Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  pages_read: { type: Number, default: 0 },
  current_page: { type: Number, default: 0 },
  logged_at: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export default mongoose.models.ReadingLog || mongoose.model<IReadingLog>('ReadingLog', ReadingLogSchema);
