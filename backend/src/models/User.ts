import { Schema, model, Document } from 'mongoose';

export interface DeviceInfo {
  deviceId: string;
  deviceName?: string;
  platform: string;
  registeredAt: Date;
  lastLoginAt: Date;
}

export interface UserDocument extends Document {
  firebaseUid: string;
  name?: string;
  phone?: string;
  language?: string;
  devices: DeviceInfo[];
  createdAt: Date;
}

const deviceInfoSchema = new Schema<DeviceInfo>({
  deviceId: { type: String, required: true },
  deviceName: String,
  platform: { type: String, required: true },
  registeredAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date, default: Date.now }
});

const userSchema = new Schema<UserDocument>({
  firebaseUid: { type: String, required: true, unique: true },
  name: String,
  phone: String,
  language: { type: String, default: 'en' },
  devices: [deviceInfoSchema],
  createdAt: { type: Date, default: Date.now }
});

export default model<UserDocument>('User', userSchema);






