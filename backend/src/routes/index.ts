import { Router } from 'express';
import users from './users';
import resources from './resources';
import feedback from './feedback';
import settings from './settings';

const router = Router();
router.use('/users', users);
router.use('/resources', resources);
router.use('/feedback', feedback);
router.use('/settings', settings);

export default router;





