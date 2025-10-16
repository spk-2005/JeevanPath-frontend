import { Router } from 'express';
import { createUser, getUser, updateUser } from '../controllers/users';
import { verifyFirebaseToken } from '../middleware/auth';

const router = Router();

router.post('/', verifyFirebaseToken, createUser);
router.get('/:id', verifyFirebaseToken, getUser);
router.patch('/:id', verifyFirebaseToken, updateUser);

export default router;






