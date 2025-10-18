import { Schema, model, Document } from 'mongoose';

export interface ServiceProviderDocument extends Document {
  resourceId: string; // Reference to Resource
  providerName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  emergencyPhone?: string; // Special emergency contact number
  isEmergencyEnabled: boolean; // Whether they want to receive emergency notifications
  responseRadius: number; // Radius in km they can respond to emergencies
  availableServices: string[]; // Services they can provide in emergencies
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  operatingHours: {
    start: string;
    end: string;
    is24Hours: boolean;
  };
  emergencyResponseTime: number; // Average response time in minutes
  lastNotificationSent?: Date;
  notificationPreferences: {
    sms: boolean;
    email: boolean;
    push: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const serviceProviderSchema = new Schema<ServiceProviderDocument>({
  resourceId: { type: String, required: true, unique: true },
  providerName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  emergencyPhone: String,
  isEmergencyEnabled: { type: Boolean, default: true },
  responseRadius: { type: Number, default: 5 }, // Default 5km radius
  availableServices: { 
    type: [String], 
    enum: ['emergency_care', 'ambulance', 'blood_bank', 'pharmacy', 'surgery', 'icu', 'lab_tests'],
    default: ['emergency_care'] 
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  operatingHours: {
    start: { type: String, default: '00:00' },
    end: { type: String, default: '23:59' },
    is24Hours: { type: Boolean, default: false }
  },
  emergencyResponseTime: { type: Number, default: 15 }, // 15 minutes default
  lastNotificationSent: Date,
  notificationPreferences: {
    sms: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Index for geospatial queries
serviceProviderSchema.index({ location: '2dsphere' });

export default model<ServiceProviderDocument>('ServiceProvider', serviceProviderSchema);