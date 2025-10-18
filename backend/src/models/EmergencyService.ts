import { Schema, model, Document } from 'mongoose';

export interface EmergencyServiceDocument extends Document {
  userId: string;
  isEnabled: boolean;
  maxDistance: number; // Maximum distance in km to search for resources
  notificationPreferences: {
    push: boolean;
    sms: boolean;
    email: boolean;
  };
  emergencyTypes: string[]; // Types of emergencies to monitor: ['medical', 'accident', 'blood', 'pharmacy']
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  lastLocationUpdate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const emergencyServiceSchema = new Schema<EmergencyServiceDocument>({
  userId: { type: String, required: true, unique: true },
  isEnabled: { type: Boolean, default: false },
  maxDistance: { type: Number, default: 10 }, // Default 10km radius
  notificationPreferences: {
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    email: { type: Boolean, default: false }
  },
  emergencyTypes: { 
    type: [String], 
    enum: ['medical', 'accident', 'blood', 'pharmacy'],
    default: ['medical', 'blood'] 
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  lastLocationUpdate: { type: Date, default: Date.now }
}, {
  timestamps: true
});

emergencyServiceSchema.index({ location: '2dsphere' });

export default model<EmergencyServiceDocument>('EmergencyService', emergencyServiceSchema);