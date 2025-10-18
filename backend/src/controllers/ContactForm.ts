import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import ContactForm from '../models/ContactForm';
import Resource from '../models/Resource';

// POST /api/contact-form - Submit new contact form
export async function submitContactForm(req: Request, res: Response) {

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const contactFormData = {
      ...req.body,
      location: {
        type: 'Point',
        coordinates: req.body.location.coordinates // [longitude, latitude]
      },
      // Ensure all array fields are handled correctly (as done in your original route logic)
      services: Array.isArray(req.body.services) ? req.body.services : req.body.services ? [req.body.services] : [],
      languages: Array.isArray(req.body.languages) ? req.body.languages : req.body.languages ? [req.body.languages] : [],
      operatingDays: Array.isArray(req.body.operatingDays) ? req.body.operatingDays : req.body.operatingDays ? [req.body.operatingDays] : [],
      // Default fields
      status: 'pending',
      isVerified: false,
      emailVerified: false,
      phoneVerified: false
    };

    const contactForm = new ContactForm(contactFormData);
    await contactForm.save();

    // Automatically create a resource from the contact form data
    const resourceData = {
      name: contactFormData.resourceName,
      type: contactFormData.resourceType,
      address: contactFormData.resourceAddress,
      contact: contactFormData.contactNumber,
      alternateContact: contactFormData.alternateContact,
      location: contactFormData.location,
      openTime: contactFormData.openTime,
      closeTime: contactFormData.closeTime,
      operatingDays: contactFormData.operatingDays,
      is24Hours: contactFormData.is24Hours,
      services: contactFormData.services,
      languages: contactFormData.languages,
      wheelchairAccessible: contactFormData.wheelchairAccessible,
      parkingAvailable: contactFormData.parkingAvailable,
      description: contactFormData.description,
      websiteUrl: contactFormData.websiteUrl,
      rating: 0, // Default rating for new resources
      reviewCount: 0,
      isVerified: true,
      submittedBy: {
        name: contactFormData.userName,
        phone: contactFormData.phoneNumber,
        email: contactFormData.email
      }
    };

    // Create the resource
    const resource = new Resource(resourceData);
    await resource.save();

    // Update contact form status to approved since we're auto-creating the resource
    contactForm.status = 'approved';
    contactForm.approvedAt = new Date();
    contactForm.isVerified = true;
    await contactForm.save();

    return res.status(201).json({
      success: true,
      message: 'Resource submitted and created successfully. It is now visible in the app.',
      data: {
        contactForm,
        resource
      }
    });
  } catch (error: any) {
    console.error('Error submitting contact form:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit contact form',
      error: error.message
    });
  }
}

// GET /api/contact-form - Get all contact forms (Admin)
export async function getAllContactForms(req: Request, res: Response) {
  try {
    const { status, resourceType, page = 1, limit = 10 } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (resourceType) query.resourceType = resourceType;

    const skip = (Number(page) - 1) * Number(limit);

    const contactForms = await ContactForm.find(query)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await ContactForm.countDocuments(query);

    return res.json({
      success: true,
      data: contactForms,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch contact forms',
      error: error.message
    });
  }
}

// GET /api/contact-form/:id - Get single contact form
export async function getContactFormById(req: Request, res: Response) {
  try {
    const contactForm = await ContactForm.findById(req.params.id);

    if (!contactForm) {
      return res.status(404).json({
        success: false,
        message: 'Contact form not found'
      });
    }

    return res.json({
      success: true,
      data: contactForm
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch contact form',
      error: error.message
    });
  }
}

// PUT /api/contact-form/:id/approve - Approve contact form and create resource
export async function approveContactForm(req: Request, res: Response) {
  try {
    const contactForm = await ContactForm.findById(req.params.id);

    if (!contactForm) {
      return res.status(404).json({
        success: false,
        message: 'Contact form not found'
      });
    }

    if (contactForm.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Contact form is not in pending status'
      });
    }

    // Import Resource model
    const Resource = require('../models/Resource').default;

    // Create resource from contact form data
    const resourceData = {
      name: contactForm.resourceName,
      type: contactForm.resourceType,
      address: contactForm.resourceAddress,
      contact: contactForm.contactNumber,
      alternateContact: contactForm.alternateContact,
      location: contactForm.location,
      openTime: contactForm.openTime,
      closeTime: contactForm.closeTime,
      operatingDays: contactForm.operatingDays,
      is24Hours: contactForm.is24Hours,
      services: contactForm.services,
      languages: contactForm.languages,
      wheelchairAccessible: contactForm.wheelchairAccessible,
      parkingAvailable: contactForm.parkingAvailable,
      description: contactForm.description,
      websiteUrl: contactForm.websiteUrl,
      rating: 0, // Default rating for new resources
      reviewCount: 0,
      isVerified: true,
      submittedBy: {
        name: contactForm.userName,
        phone: contactForm.phoneNumber,
        email: contactForm.email
      }
    };

    // Create the resource
    const resource = new Resource(resourceData);
    await resource.save();

    // Update contact form status
    contactForm.status = 'approved';
    contactForm.approvedAt = new Date();
    contactForm.isVerified = true;
    await contactForm.save();

    return res.json({
      success: true,
      message: 'Contact form approved and resource created successfully',
      data: {
        contactForm,
        resource
      }
    });
  } catch (error: any) {
    console.error('Error approving contact form:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve contact form',
      error: error.message
    });
  }
}

// PUT /api/contact-form/:id/reject - Reject contact form
export async function rejectContactForm(req: Request, res: Response) {
  try {
    const { rejectionReason } = req.body;
    
    const contactForm = await ContactForm.findById(req.params.id);

    if (!contactForm) {
      return res.status(404).json({
        success: false,
        message: 'Contact form not found'
      });
    }

    if (contactForm.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Contact form is not in pending status'
      });
    }

    contactForm.status = 'rejected';
    contactForm.rejectedAt = new Date();
    contactForm.rejectionReason = rejectionReason || 'No reason provided';
    await contactForm.save();

    return res.json({
      success: true,
      message: 'Contact form rejected successfully',
      data: contactForm
    });
  } catch (error: any) {
    console.error('Error rejecting contact form:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reject contact form',
      error: error.message
    });
  }
}