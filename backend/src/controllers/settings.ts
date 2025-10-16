import { Request, Response } from 'express';
import User from '../models/User';

export async function updateLanguage(req: Request, res: Response) {
  try {
    const { userId, language } = req.body;
    const user = await User.findByIdAndUpdate(userId, { language }, { new: true });
    return res.json(user);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to update language' });
  }
}

export async function updateKartStatus(_req: Request, res: Response) {
  // Placeholder for admin open/close control
  return res.json({ status: 'ok' });
}





