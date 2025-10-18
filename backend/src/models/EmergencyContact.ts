import { Schema, model, Document } from 'mongoose';

export interface EmergencyContactDocument extends Document {
  userId: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string; // e.g., 'family', 'friend', 'doctor', 'caregiver'
  isPrimary: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const emergencyContactSchema = new Schema<EmergencyContactDocument>({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  relationship: { 
    type: String, 
    enum: ['family', 'friend', 'doctor', 'caregiver', 'other'], 
    default: 'family' 
  },
  isPrimary: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Ensure only one primary contact per user
emergencyContactSchema.index({ userId: 1, isPrimary: 1 }, { 
  unique: true, 
  partialFilterExpression: { isPrimary: true } 
});

export default model<EmergencyContactDocument>('EmergencyContact', emergencyContactSchema);