import mongoose, { Schema, Document } from 'mongoose';

export interface IReadingChallenge extends Document {
  user_id: mongoose.Types.ObjectId;
  title: string;
  goal_books: number;
  year: number;
  created_at: Date;
  updated_at: Date;
}

const ReadingChallengeSchema = new Schema<IReadingChallenge>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  goal_books: { type: Number, required: true, min: 1 },
  year: { type: Number, required: true, index: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.models.ReadingChallenge || mongoose.model<IReadingChallenge>('ReadingChallenge', ReadingChallengeSchema);
