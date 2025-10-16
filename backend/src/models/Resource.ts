import { Schema, model, Document } from 'mongoose';

export interface ResourceDocument extends Document {
  name: string;
  type: 'clinic' | 'pharmacy' | 'blood';
  address?: string;
  contact?: string;
  location: { type: 'Point'; coordinates: [number, number] }; // [lng, lat]
  openTime?: string;
  closeTime?: string;
  rating?: number;
  services?: string[];
  languages?: string[];
  insuranceAccepted?: string[];
  transportation?: string[]; // e.g., walking_distance, public_transit, car_accessible, free_parking
  wheelchairAccessible?: boolean;
}

const resourceSchema = new Schema<ResourceDocument>({
  name: { type: String, required: true },
  type: { type: String, enum: ['clinic', 'pharmacy', 'blood'], required: true },
  address: String,
  contact: String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  openTime: String,
  closeTime: String,
  rating: { type: Number, default: 0 },
  services: { type: [String], default: [] },
  languages: { type: [String], default: [] },
  insuranceAccepted: { type: [String], default: [] },
  transportation: { type: [String], default: [] },
  wheelchairAccessible: { type: Boolean, default: false }
});

resourceSchema.index({ location: '2dsphere' });

export default model<ResourceDocument>('Resource', resourceSchema);




