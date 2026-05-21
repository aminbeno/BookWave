// @ts-nocheck
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  username: string;
  avatar_url: string | null;
  bio: string;
  created_at: Date;
  updated_at: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  username: { type: String, required: true, trim: true },
  avatar_url: { type: String, default: null },
  bio: { type: String, default: '' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Correction ici : on retire 'next' car la fonction est async
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  try {
    this.password = await bcrypt.hash(this.password, 12);
  } catch (err) {
    throw err;
  }
});

UserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
