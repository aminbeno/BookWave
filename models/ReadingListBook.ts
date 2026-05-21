import mongoose, { Schema, Document } from 'mongoose';

export interface IReadingListBook extends Document {
  list_id: mongoose.Types.ObjectId;
  book_id: mongoose.Types.ObjectId;
  added_at: Date;
}

const ReadingListBookSchema = new Schema<IReadingListBook>({
  list_id: { type: Schema.Types.ObjectId, ref: 'ReadingList', required: true, index: true },
  book_id: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
}, { timestamps: { createdAt: 'added_at', updatedAt: false } });

ReadingListBookSchema.index({ list_id: 1, book_id: 1 }, { unique: true });

export default mongoose.models.ReadingListBook || mongoose.model<IReadingListBook>('ReadingListBook', ReadingListBookSchema);
