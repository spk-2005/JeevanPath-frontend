import { Router } from 'express';
import { body } from 'express-validator';
import { processVoice, getAnalytics, testNLP } from '../controllers/nlpController';

const router = Router();

// Validation middleware for voice processing
const validateVoiceInput = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Text is required')
    .isLength({ min: 1, max: 500 })
    .withMessage('Text must be between 1 and 500 characters'),
  body('userContext.userId')
    .optional()
    .isString()
    .withMessage('User ID must be a string'),
  body('userContext.location.lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('userContext.location.lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180')
];

// Routes
router.post('/process', validateVoiceInput, processVoice);
router.get('/analytics', getAnalytics);
router.post('/test', testNLP);

export default router;