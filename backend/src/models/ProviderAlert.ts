import { Schema, model, Document } from 'mongoose';

export interface ProviderAlertDocument extends Document {
  emergencyId: string; // Reference to the emergency request
  providerId: string; // Reference to ServiceProvider
  userId: string; // User who needs help
  emergencyType: 'medical' | 'accident' | 'blood' | 'pharmacy';
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  userLocation: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  distanceFromProvider: number; // Distance in km
  message: string;
  userContact?: string;
  emergencyDetails?: {
    symptoms?: string;
    bloodType?: string;
    medications?: string[];
    allergies?: string[];
    medicalHistory?: string;
  };
  status: 'sent' | 'acknowledged' | 'responding' | 'completed' | 'declined';
  providerResponse?: {
    acknowledgedAt?: Date;
    estimatedArrival?: Date;
    responseMessage?: string;
    canRespond: boolean;
  };
  sentAt: Date;
  expiresAt: Date;
  createdAt: Date;
}

const providerAlertSchema = new Schema<ProviderAlertDocument>({
  emergencyId: { type: String, required: true },
  providerId: { type: String, required: true },
  userId: { type: String, required: true },
  emergencyType: { 
    type: String, 
    enum: ['medical', 'accident', 'blood', 'pharmacy'],
    required: true 
  },
  urgencyLevel: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium' 
  },
  userLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  distanceFromProvider: { type: Number, required: true },
  message: { type: String, required: true },
  userContact: String,
  emergencyDetails: {
    symptoms: String,
    bloodType: String,
    medications: [String],
    allergies: [String],
    medicalHistory: String
  },
  status: { 
    type: String, 
    enum: ['sent', 'acknowledged', 'responding', 'completed', 'declined'],
    default: 'sent' 
  },
  providerResponse: {
    acknowledgedAt: Date,
    estimatedArrival: Date,
    responseMessage: String,
    canRespond: { type: Boolean, default: false }
  },
  sentAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
}, {
  timestamps: true
});

// Indexes for efficient querying
providerAlertSchema.index({ providerId: 1, status: 1, createdAt: -1 });
providerAlertSchema.index({ emergencyId: 1 });
providerAlertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model<ProviderAlertDocument>('ProviderAlert', providerAlertSchema);