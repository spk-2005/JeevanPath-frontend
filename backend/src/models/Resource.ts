import { Schema, model, Document } from 'mongoose';

export interface ResourceDocument extends Document {
  name: string;
  type: 'clinic' | 'pharmacy' | 'blood_bank' | 'other';
  address?: string;
  contact?: string;
  alternateContact?: string;
  location: { type: 'Point'; coordinates: [number, number] }; // [lng, lat]
  openTime?: string;
  closeTime?: string;
  operatingDays?: string[];
  is24Hours?: boolean;
  rating?: number;
  reviewCount?: number;
  services?: string[];
  languages?: string[];
  insuranceAccepted?: string[];
  transportation?: string[]; // e.g., walking_distance, public_transit, car_accessible, free_parking
  wheelchairAccessible?: boolean;
  parkingAvailable?: boolean;
  description?: string;
  websiteUrl?: string;
  isVerified?: boolean;
  submittedBy?: {
    name: string;
    phone: string;
    email?: string;
  };
  distanceFromUser?: number; // Distance in kilometers (calculated field)
}

const resourceSchema = new Schema<ResourceDocument>({
  name: { type: String, required: true },
  type: { type: String, enum: ['clinic', 'pharmacy', 'blood_bank', 'other'], required: true },
  address: String,
  contact: String,
  alternateContact: String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  openTime: String,
  closeTime: String,
  operatingDays: [String],
  is24Hours: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  services: { type: [String], default: [] },
  languages: { type: [String], default: [] },
  insuranceAccepted: { type: [String], default: [] },
  transportation: { type: [String], default: [] },
  wheelchairAccessible: { type: Boolean, default: false },
  parkingAvailable: { type: Boolean, default: false },
  description: String,
  websiteUrl: String,
  isVerified: { type: Boolean, default: false },
  submittedBy: {
    name: String,
    phone: String,
    email: String
  },
  distanceFromUser: { type: Number } // Distance in kilometers (calculated field)
});

resourceSchema.index({ location: '2dsphere' });

export default model<ResourceDocument>('Resource', resourceSchema);




