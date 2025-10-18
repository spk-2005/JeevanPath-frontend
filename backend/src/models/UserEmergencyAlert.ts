import { Schema, model, Document } from 'mongoose';

export interface UserEmergencyAlertDocument extends Document {
  emergencyUserId: string; // User who needs help
  serviceProviderUserId: string; // Service provider user who gets notified
  emergencyType: 'medical' | 'accident' | 'blood' | 'pharmacy';
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  emergencyUserInfo: {
    name?: string;
    phone?: string;
    location: {
      lat: number;
      lng: number;
      address?: string;
    };
  };
  resourceInfo: {
    resourceId: string;
    resourceName: string;
    distance: number; // Distance in km
  };
  message: string;
  emergencyDetails?: {
    symptoms?: string;
    bloodType?: string;
    medications?: string[];
    allergies?: string[];
    medicalHistory?: string;
  };
  status: 'sent' | 'viewed' | 'acknowledged' | 'responding' | 'completed' | 'declined';
  providerResponse?: {
    viewedAt?: Date;
    acknowledgedAt?: Date;
    estimatedArrival?: Date;
    responseMessage?: string;
    canRespond: boolean;
  };
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  sentAt: Date;
  expiresAt: Date;
  createdAt: Date;
}

const userEmergencyAlertSchema = new Schema<UserEmergencyAlertDocument>({
  emergencyUserId: { type: String, required: true },
  serviceProviderUserId: { type: String, required: true },
  emergencyType: { 
    type: String, 
    enum: ['medical', 'accident', 'blood', 'pharmacy'],
    required: true 
  },
  urgencyLevel: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'high' 
  },
  emergencyUserInfo: {
    name: String,
    phone: String,
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: String
    }
  },
  resourceInfo: {
    resourceId: { type: String, required: true },
    resourceName: { type: String, required: true },
    distance: { type: Number, required: true }
  },
  message: { type: String, required: true },
  emergencyDetails: {
    symptoms: String,
    bloodType: String,
    medications: [String],
    allergies: [String],
    medicalHistory: String
  },
  status: { 
    type: String, 
    enum: ['sent', 'viewed', 'acknowledged', 'responding', 'completed', 'declined'],
    default: 'sent' 
  },
  providerResponse: {
    viewedAt: Date,
    acknowledgedAt: Date,
    estimatedArrival: Date,
    responseMessage: String,
    canRespond: { type: Boolean, default: false }
  },
  isRead: { type: Boolean, default: false },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'high' 
  },
  sentAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
}, {
  timestamps: true
});

// Indexes for efficient querying
userEmergencyAlertSchema.index({ serviceProviderUserId: 1, isRead: 1, createdAt: -1 });
userEmergencyAlertSchema.index({ emergencyUserId: 1 });
userEmergencyAlertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model<UserEmergencyAlertDocument>('UserEmergencyAlert', userEmergencyAlertSchema);