import { Schema, model, Document } from 'mongoose';

export interface UserDocument extends Document {
  firebaseUid: string;
  name?: string;
  phone?: string;
  language?: string;
  createdAt: Date;
}

const userSchema = new Schema<UserDocument>({
  firebaseUid: { type: String, required: true, unique: true },
  name: String,
  phone: String,
  language: { type: String, default: 'en' },
  createdAt: { type: Date, default: Date.now }
});

export default model<UserDocument>('User', userSchema);





