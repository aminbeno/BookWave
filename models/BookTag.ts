import mongoose, { Schema, Document } from 'mongoose';

export interface IBookTag extends Document {
  book_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  tag: string;
  created_at: Date;
}

const BookTagSchema = new Schema<IBookTag>({
  book_id: { type: Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tag: { type: String, required: true, lowercase: true, trim: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

BookTagSchema.index({ book_id: 1, tag: 1 }, { unique: true });

export default mongoose.models.BookTag || mongoose.model<IBookTag>('BookTag', BookTagSchema);
