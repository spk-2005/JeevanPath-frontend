import { Router } from 'express';
import { createUser, getUser, updateUser, checkDeviceRegistration, registerDevice, clearDeviceRegistration } from '../controllers/users';
import { verifyFirebaseToken } from '../middleware/auth';

const router = Router();

router.post('/', verifyFirebaseToken, createUser);
router.get('/:id', verifyFirebaseToken, getUser);
router.patch('/:id', verifyFirebaseToken, updateUser);
router.post('/check-device', checkDeviceRegistration);
router.post('/register-device', registerDevice);
router.post('/clear-device', clearDeviceRegistration);

export default router;






