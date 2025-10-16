import { Request, Response } from 'express';
import Feedback from '../models/Feedback';

export async function submitFeedback(req: Request, res: Response) {
  try {
    const { userId, resourceId, rating, comment } = req.body;
    if (!userId || !resourceId || !rating) {
      return res.status(400).json({ error: 'userId, resourceId and rating are required' });
    }
    const doc = await Feedback.create({ userId, resourceId, rating, comment });
    return res.status(201).json(doc);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to submit feedback' });
  }
}



