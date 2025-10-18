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
  // Service provider fields (assigned by admin)
  assignedResourceId?: string; // Resource they are assigned to manage
  isServiceProvider?: boolean; // Whether this user is a service provider
  emergencyNotificationsEnabled?: boolean; // Whether they want emergency notifications
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
  // Service provider fields (assigned by admin)
  assignedResourceId: String, // Resource they are assigned to manage
  isServiceProvider: { type: Boolean, default: false }, // Whether this user is a service provider
  emergencyNotificationsEnabled: { type: Boolean, default: true }, // Whether they want emergency notifications
  createdAt: { type: Date, default: Date.now }
});

export default model<UserDocument>('User', userSchema);






