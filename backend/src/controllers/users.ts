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

export async function checkDeviceRegistration(req: Request, res: Response) {
  const { phone, deviceId, platform } = req.body;
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.json({ isRegistered: false, requiresOTP: true });
    }

    const existingDevice = user.devices.find(device => device.deviceId === deviceId);
    if (existingDevice) {
      // Update last login time
      existingDevice.lastLoginAt = new Date();
      await user.save();
      return res.json({ isRegistered: true, requiresOTP: false, user });
    }

    return res.json({ isRegistered: true, requiresOTP: true, user });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to check device registration' });
  }
}

export async function registerDevice(req: Request, res: Response) {
  const { phone, deviceId, deviceName, platform } = req.body;
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingDevice = user.devices.find(device => device.deviceId === deviceId);
    if (existingDevice) {
      existingDevice.lastLoginAt = new Date();
      await user.save();
      return res.json({ message: 'Device already registered', user });
    }

    const newDevice = {
      deviceId,
      deviceName,
      platform,
      registeredAt: new Date(),
      lastLoginAt: new Date()
    };

    user.devices.push(newDevice);
    await user.save();

    return res.json({ message: 'Device registered successfully', user });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to register device' });
  }
}

export async function clearDeviceRegistration(req: Request, res: Response) {
  const { phone, deviceId } = req.body;
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.devices = user.devices.filter(device => device.deviceId !== deviceId);
    await user.save();

    return res.json({ message: 'Device registration cleared', user });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to clear device registration' });
  }
}






