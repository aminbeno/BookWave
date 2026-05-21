import mongoose, { Schema, Document } from 'mongoose';

export interface IReadingList extends Document {
  user_id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  color: string;
  created_at: Date;
  updated_at: Date;
}

const ReadingListSchema = new Schema<IReadingList>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  color: { type: String, default: '#3B82F6' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.models.ReadingList || mongoose.model<IReadingList>('ReadingList', ReadingListSchema);
