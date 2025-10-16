import { Router } from 'express';
import { submitFeedback } from '../controllers/feedback';
import { verifyFirebaseToken } from '../middleware/auth';

const router = Router();
router.post('/', verifyFirebaseToken, submitFeedback);
export default router;






