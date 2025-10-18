import { Router } from 'express';
import users from './users';
import resources from './resources';
import feedback from './feedback';
import settings from './settings';
import contactForm from './ContactForm';
import nlp from './nlp';
import emergency from './emergency';
import admin from './admin';

const router = Router();
router.use('/users', users);
router.use('/resources', resources);
router.use('/feedback', feedback);
router.use('/settings', settings);
router.use('/contact-form', contactForm);
router.use('/nlp', nlp);
router.use('/emergency', emergency);
router.use('/admin', admin);

export default router;






