import { Schema, model, Document } from 'mongoose';

export interface VoiceCommandDocument extends Document {
  originalText: string;
  detectedLanguage: string;
  processedAt: Date;
  intent: {
    type: 'search' | 'navigation' | 'filter' | 'sort' | 'emergency' | 'greeting' | 'thanks' | 'help' | 'conversation';
    confidence: number;
    entities: {
      resourceType?: 'clinic' | 'pharmacy' | 'blood' | 'hospital';
      location?: string;
      quality?: 'best' | 'top' | 'good' | 'high_rated';
      urgency?: 'emergency' | 'urgent' | 'immediate';
      availability?: 'open' | 'available' | 'now';
      action?: 'find' | 'show' | 'search' | 'locate' | 'get';
      target?: 'saved' | 'bookmarks' | 'favorites' | 'settings' | 'map';
      // New sorting and filtering entities
      needsSorting?: boolean;
      sortBy?: 'rating' | 'distance' | 'name';
      sortOrder?: 'asc' | 'desc';
      showAll?: boolean;
      openNow?: boolean;
      nearbyFilter?: boolean;
      ratingFilter?: boolean;
      minRating?: number;
    };
  };
  navigation: {
    targetScreen: 'Home' | 'Maps' | 'Saved' | 'Settings';
    filterParams: {
      type?: string;
      minRating?: number;
      openNow?: boolean;
      emergency?: boolean;
      searchQuery?: string;
      near?: boolean;
      // New sorting and filtering parameters
      sortBy?: 'rating' | 'distance' | 'name';
      sortOrder?: 'asc' | 'desc';
      showAll?: boolean;
    };
  };
  userContext?: {
    userId?: string;
    location?: {
      lat: number;
      lng: number;
    };
    previousQueries?: string[];
  };
}

const voiceCommandSchema = new Schema<VoiceCommandDocument>({
  originalText: { type: String, required: true },
  detectedLanguage: { type: String, required: true },
  processedAt: { type: Date, default: Date.now },
  intent: {
    type: { type: String, enum: ['search', 'navigation', 'filter', 'sort', 'emergency', 'greeting', 'thanks', 'help', 'conversation'], required: true },
    confidence: { type: Number, min: 0, max: 1, required: true },
    entities: {
      resourceType: { type: String, enum: ['clinic', 'pharmacy', 'blood', 'hospital'] },
      location: String,
      quality: { type: String, enum: ['best', 'top', 'good', 'high_rated'] },
      urgency: { type: String, enum: ['emergency', 'urgent', 'immediate'] },
      availability: { type: String, enum: ['open', 'available', 'now'] },
      action: { type: String, enum: ['find', 'show', 'search', 'locate', 'get'] },
      target: { type: String, enum: ['saved', 'bookmarks', 'favorites', 'settings', 'map'] },
      // New sorting and filtering entities
      needsSorting: Boolean,
      sortBy: { type: String, enum: ['rating', 'distance', 'name'] },
      sortOrder: { type: String, enum: ['asc', 'desc'] },
      showAll: Boolean,
      openNow: Boolean,
      nearbyFilter: Boolean,
      ratingFilter: Boolean,
      minRating: Number
    }
  },
  navigation: {
    targetScreen: { type: String, enum: ['Home', 'Maps', 'Saved', 'Settings'], required: true },
    filterParams: {
      type: {type: String},
      minRating: Number,
      openNow: Boolean,
      emergency: Boolean,
      searchQuery: String,
      near: Boolean,
      // New sorting and filtering parameters
      sortBy: { type: String, enum: ['rating', 'distance', 'name'] },
      sortOrder: { type: String, enum: ['asc', 'desc'] },
      showAll: Boolean
    }
  },
  userContext: {
    userId: String,
    location: {
      lat: Number,
      lng: Number
    },
    previousQueries: [String]
  }
});

export default model<VoiceCommandDocument>('VoiceCommand', voiceCommandSchema);