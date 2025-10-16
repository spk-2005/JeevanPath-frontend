import { Router } from 'express';
import { addResource, listResources, resourceDetails, nearbyResources } from '../controllers/resources';
import { verifyFirebaseToken } from '../middleware/auth';

const router = Router();

router.post('/', verifyFirebaseToken, addResource);
router.get('/', listResources);
router.get('/nearby', nearbyResources);
router.get('/:id', resourceDetails);

export default router;


