import { Schema, model, Document } from 'mongoose';

export interface EmergencyNotificationDocument extends Document {
  userId: string;
  type: 'emergency_alert' | 'resource_found' | 'contact_notified';
  title: string;
  message: string;
  data: {
    emergencyType?: string;
    resourceId?: string;
    resourceName?: string;
    distance?: number;
    contactId?: string;
    location?: {
      lat: number;
      lng: number;
    };
  };
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  expiresAt?: Date;
  createdAt: Date;
}

const emergencyNotificationSchema = new Schema<EmergencyNotificationDocument>({
  userId: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['emergency_alert', 'resource_found', 'contact_notified'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: {
    emergencyType: String,
    resourceId: String,
    resourceName: String,
    distance: Number,
    contactId: String,
    location: {
      lat: Number,
      lng: Number
    }
  },
  isRead: { type: Boolean, default: false },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium' 
  },
  expiresAt: Date
}, {
  timestamps: true
});

// Index for efficient querying
emergencyNotificationSchema.index({ userId: 1, createdAt: -1 });
emergencyNotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model<EmergencyNotificationDocument>('EmergencyNotification', emergencyNotificationSchema);