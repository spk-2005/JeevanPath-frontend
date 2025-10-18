import { Router } from 'express';
import { body } from 'express-validator';
import {
  toggleEmergencyService,
  addEmergencyContact,
  getEmergencyContacts,
  getEmergencyNotifications,
  markNotificationRead,
  triggerEmergencyAlert,
  getUserEmergencyAlerts,
  markAlertAsRead,
  respondToUserAlert,
  checkServiceProvider
} from '../controllers/emergencyController';

const router = Router();

// Validation middleware
const validateEmergencyService = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('location.lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('location.lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  body('maxDistance').optional().isInt({ min: 1, max: 100 }).withMessage('Max distance must be 1-100 km')
];

const validateEmergencyContact = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('relationship').optional().isIn(['family', 'friend', 'doctor', 'caregiver', 'other'])
];

const validateEmergencyAlert = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('emergencyType').isIn(['medical', 'accident', 'blood', 'pharmacy']).withMessage('Valid emergency type required'),
  body('location.lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('location.lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required')
];

// Routes
router.post('/toggle', validateEmergencyService, toggleEmergencyService);
router.post('/contacts', validateEmergencyContact, addEmergencyContact);
router.get('/contacts/:userId', getEmergencyContacts);
router.get('/notifications/:userId', getEmergencyNotifications);
router.put('/notifications/:notificationId/read', markNotificationRead);
router.post('/alert', validateEmergencyAlert, triggerEmergencyAlert);

// Service Provider User Routes (for existing users assigned to resources)
router.get('/check-provider/:phone', checkServiceProvider);
router.get('/user-alerts/:userId', getUserEmergencyAlerts);
router.put('/user-alerts/:alertId/read', markAlertAsRead);
router.put('/user-alerts/:alertId/respond', respondToUserAlert);

export default router;