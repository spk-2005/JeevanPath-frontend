import { Router } from 'express';
import { updateLanguage, updateKartStatus } from '../controllers/settings';
import { verifyFirebaseToken } from '../middleware/auth';

const router = Router();
router.patch('/language', verifyFirebaseToken, updateLanguage);
router.patch('/admin/kart-status', verifyFirebaseToken, updateKartStatus);
export default router;





