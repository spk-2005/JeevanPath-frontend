// models/ContactForm.ts
import { Schema, model, Document } from 'mongoose';

export interface ContactFormDocument extends Document {
  userName: string;
  phoneNumber: string;
  email?: string;
  address: string;
  licenseNumber?: string;
  licenseType: string;
  resourceType: string;
  resourceName: string;
  resourceAddress: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  contactNumber: string;
  alternateContact?: string;
  websiteUrl?: string;
  openTime?: string;
  closeTime?: string;
  operatingDays: string[];
  is24Hours: boolean;
  services: string[];
  languages: string[];
  wheelchairAccessible: boolean;
  parkingAvailable: boolean;
  description?: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  isVerified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  rejectionReason?: string;
  submittedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
}

const ContactFormSchema = new Schema<ContactFormDocument>(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    licenseNumber: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true
    },
    licenseType: {
      type: String,
      enum: ['medical', 'pharmacy', 'clinic', 'other'],
      default: 'medical'
    },
    resourceType: {
      type: String,
      enum: ['clinic', 'pharmacy', 'blood_bank', 'other'],
      required: true,
      index: true
    },
    resourceName: {
      type: String,
      required: true,
      trim: true
    },
    resourceAddress: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true,
        index: '2dsphere'
      }
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true
    },
    alternateContact: {
      type: String,
      trim: true,
      sparse: true
    },
    websiteUrl: {
      type: String,
      trim: true,
      sparse: true
    },
    openTime: String,
    closeTime: String,
    operatingDays: [
      {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      }
    ],
    is24Hours: {
      type: Boolean,
      default: false
    },
    services: [String],
    languages: [String],
    wheelchairAccessible: {
      type: Boolean,
      default: false
    },
    parkingAvailable: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      maxlength: 1000,
      sparse: true
    },
    message: {
      type: String,
      maxlength: 500,
      sparse: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    phoneVerified: {
      type: Boolean,
      default: false
    },
    rejectionReason: {
      type: String,
      sparse: true
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    approvedAt: {
      type: Date,
      sparse: true
    },
    rejectedAt: {
      type: Date,
      sparse: true
    }
  },
  {
    timestamps: true
  }
);

// Create 2dsphere index for geospatial queries
ContactFormSchema.index({ 'location': '2dsphere' });

export default model<ContactFormDocument>('ContactForm', ContactFormSchema);