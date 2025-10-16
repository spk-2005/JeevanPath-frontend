import { Request, Response } from 'express';
import User from '../models/User';

export async function createUser(req: Request, res: Response) {
  const { firebaseUid, name, phone, language } = req.body;
  try {
    const existing = await User.findOne({ firebaseUid });
    if (existing) return res.json(existing);
    const user = await User.create({ firebaseUid, name, phone, language });
    return res.status(201).json(user);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to create user' });
  }
}

export async function getUser(req: Request, res: Response) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    return res.json(user);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to get user' });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json(user);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to update user' });
  }
}






