import { Schema, model, Document, Types } from 'mongoose';

export interface FeedbackDocument extends Document {
  userId: Types.ObjectId;
  resourceId: Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
}

const feedbackSchema = new Schema<FeedbackDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  resourceId: { type: Schema.Types.ObjectId, ref: 'Resource', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

export default model<FeedbackDocument>('Feedback', feedbackSchema);





