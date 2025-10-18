import { Router } from 'express';
import { body } from 'express-validator';
import { 
  submitContactForm, 
  getAllContactForms, 
  getContactFormById,
  approveContactForm,
  rejectContactForm
} from '../controllers/ContactForm';

const router = Router();

// Validation middleware
const validateContactForm = [
  body('userName').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
  body('phoneNumber').trim().notEmpty().withMessage('Phone number is required')
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/)
    .withMessage('Invalid phone number'),
  body('email').optional().trim().isEmail().withMessage('Invalid email'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('resourceType').isIn(['clinic', 'pharmacy', 'blood_bank', 'other']).withMessage('Invalid resource type'),
  body('resourceName').trim().notEmpty().withMessage('Resource name is required'),
  body('resourceAddress').trim().notEmpty().withMessage('Resource address is required'),
  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Location coordinates required'),
  body('contactNumber').trim().notEmpty().withMessage('Contact number is required'),
];

// Routes
router.post('/', validateContactForm, submitContactForm);
router.get('/', getAllContactForms);
router.get('/:id', getContactFormById);
router.put('/:id/approve', approveContactForm);
router.put('/:id/reject', rejectContactForm);

export default router;