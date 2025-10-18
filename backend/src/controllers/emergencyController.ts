import { Request, Response } from 'express';
import EmergencyContact from '../models/EmergencyContact';
import EmergencyService from '../models/EmergencyService';
import EmergencyNotification from '../models/EmergencyNotification';
import Resource from '../models/Resource';
import User from '../models/User';
import UserEmergencyAlert from '../models/UserEmergencyAlert';

/**
 * Enable/Disable Emergency Service
 * POST /api/emergency/toggle
 */
export async function toggleEmergencyService(req: Request, res: Response) {
  try {
    const { userId, isEnabled, maxDistance, location, emergencyTypes } = req.body;
    
    if (!userId || !location) {
      return res.status(400).json({
        success: false,
        error: 'User ID and location are required'
      });
    }
    
    const emergencyService = await EmergencyService.findOneAndUpdate(
      { userId },
      {
        userId,
        isEnabled: isEnabled ?? true,
        maxDistance: maxDistance || 10,
        location: {
          type: 'Point',
          coordinates: [location.lng, location.lat]
        },
        emergencyTypes: emergencyTypes || ['medical', 'blood'],
        lastLocationUpdate: new Date()
      },
      { upsert: true, new: true }
    );
    
    // If enabling, find nearby resources and create notifications
    if (isEnabled) {
      await findAndNotifyNearbyResources(userId, location, maxDistance || 10);
    }
    
    return res.json({
      success: true,
      data: emergencyService
    });
    
  } catch (error: any) {
    console.error('Emergency service toggle error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to toggle emergency service',
      message: error.message
    });
  }
}

/**
 * Add Emergency Contact
 * POST /api/emergency/contacts
 */
export async function addEmergencyContact(req: Request, res: Response) {
  try {
    const { userId, name, phone, email, relationship, isPrimary } = req.body;
    
    if (!userId || !name || !phone) {
      return res.status(400).json({
        success: false,
        error: 'User ID, name, and phone are required'
      });
    }
    
    // If setting as primary, remove primary from other contacts
    if (isPrimary) {
      await EmergencyContact.updateMany(
        { userId, isPrimary: true },
        { isPrimary: false }
      );
    }
    
    const contact = new EmergencyContact({
      userId,
      name,
      phone,
      email,
      relationship: relationship || 'family',
      isPrimary: isPrimary || false
    });
    
    await contact.save();
    
    return res.json({
      success: true,
      data: contact
    });
    
  } catch (error: any) {
    console.error('Add emergency contact error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to add emergency contact',
      message: error.message
    });
  }
}

/**
 * Get Emergency Contacts
 * GET /api/emergency/contacts/:userId
 */
export async function getEmergencyContacts(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    
    const contacts = await EmergencyContact.find({ userId, isActive: true })
      .sort({ isPrimary: -1, createdAt: -1 });
    
    return res.json({
      success: true,
      data: contacts
    });
    
  } catch (error: any) {
    console.error('Get emergency contacts error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get emergency contacts',
      message: error.message
    });
  }
}

/**
 * Get Emergency Notifications
 * GET /api/emergency/notifications/:userId
 */
export async function getEmergencyNotifications(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;
    
    const notifications = await EmergencyNotification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    
    return res.json({
      success: true,
      data: notifications
    });
    
  } catch (error: any) {
    console.error('Get emergency notifications error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get emergency notifications',
      message: error.message
    });
  }
}

/**
 * Mark Notification as Read
 * PUT /api/emergency/notifications/:notificationId/read
 */
export async function markNotificationRead(req: Request, res: Response) {
  try {
    const { notificationId } = req.params;
    
    const notification = await EmergencyNotification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }
    
    return res.json({
      success: true,
      data: notification
    });
    
  } catch (error: any) {
    console.error('Mark notification read error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read',
      message: error.message
    });
  }
}

/**
 * Register Service Provider
 * POST /api/emergency/providers
 */
export async function registerServiceProvider(req: Request, res: Response) {
  try {
    const {
      resourceId,
      providerName,
      contactPerson,
      phone,
      email,
      emergencyPhone,
      responseRadius,
      availableServices,
      location,
      operatingHours
    } = req.body;
    
    if (!resourceId || !providerName || !contactPerson || !phone || !location) {
      return res.status(400).json({
        success: false,
        error: 'Required fields: resourceId, providerName, contactPerson, phone, location'
      });
    }
    
    const provider = new ServiceProvider({
      resourceId,
      providerName,
      contactPerson,
      phone,
      email,
      emergencyPhone,
      responseRadius: responseRadius || 5,
      availableServices: availableServices || ['emergency_care'],
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      },
      operatingHours: operatingHours || {
        start: '00:00',
        end: '23:59',
        is24Hours: true
      }
    });
    
    await provider.save();
    
    return res.json({
      success: true,
      data: provider
    });
    
  } catch (error: any) {
    console.error('Register provider error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to register service provider',
      message: error.message
    });
  }
}

/**
 * Get Provider Alerts
 * GET /api/emergency/providers/:providerId/alerts
 */
export async function getProviderAlerts(req: Request, res: Response) {
  try {
    const { providerId } = req.params;
    const { status = 'sent', limit = 20 } = req.query;
    
    const alerts = await ProviderAlert.find({
      providerId,
      ...(status !== 'all' && { status })
    })
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    
    return res.json({
      success: true,
      data: alerts
    });
    
  } catch (error: any) {
    console.error('Get provider alerts error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get provider alerts',
      message: error.message
    });
  }
}

/**
 * Get Emergency Alerts for Service Provider User
 * GET /api/emergency/user-alerts/:userId
 */
/**
 * Check if a phone number belongs to a service provider
 * GET /api/emergency/check-provider/:phone
 */
export async function checkServiceProvider(req: Request, res: Response) {
  try {
    const { phone } = req.params;
    
    const serviceProvider = await User.findOne({ 
      phone: phone, 
      isServiceProvider: true 
    });
    
    if (serviceProvider) {
      return res.json({
        success: true,
        isServiceProvider: true,
        data: {
          name: serviceProvider.name,
          role: serviceProvider.role,
          assignedResourceId: serviceProvider.assignedResourceId
        }
      });
    } else {
      return res.json({
        success: true,
        isServiceProvider: false
      });
    }
    
  } catch (error: any) {
    console.error('Check service provider error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to check service provider status',
      message: error.message
    });
  }
}

export async function getUserEmergencyAlerts(req: Request, res: Response) {
  try {
    const { userId } = req.params; // This could be phone number or Firebase UID
    const { status, limit = 20 } = req.query;
    
    console.log(`📱 Getting emergency alerts for user: ${userId}`);
    
    // First, try to find user by phone number (for service providers logging in with phone)
    let serviceProviderUser = await User.findOne({ 
      phone: userId, 
      isServiceProvider: true 
    });
    
    // If not found by phone, try by Firebase UID
    if (!serviceProviderUser) {
      serviceProviderUser = await User.findOne({ 
        firebaseUid: userId, 
        isServiceProvider: true 
      });
    }
    
    if (!serviceProviderUser) {
      console.log(`❌ No service provider found for identifier: ${userId}`);
      return res.json({
        success: true,
        data: {
          alerts: [],
          unreadCount: 0,
          totalCount: 0
        }
      });
    }
    
    console.log(`✅ Found service provider: ${serviceProviderUser.name} (${serviceProviderUser.phone})`);
    
    const query: any = { serviceProviderUserId: serviceProviderUser.firebaseUid };
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const alerts = await UserEmergencyAlert.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    
    // Count unread alerts
    const unreadCount = await UserEmergencyAlert.countDocuments({
      serviceProviderUserId: serviceProviderUser.firebaseUid,
      isRead: false
    });
    
    console.log(`📋 Found ${alerts.length} alerts for ${serviceProviderUser.name}, ${unreadCount} unread`);
    
    return res.json({
      success: true,
      data: {
        alerts,
        unreadCount,
        totalCount: alerts.length
      }
    });
    
  } catch (error: any) {
    console.error('Get user emergency alerts error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get emergency alerts',
      message: error.message
    });
  }
}

/**
 * Mark Alert as Read/Viewed
 * PUT /api/emergency/user-alerts/:alertId/read
 */
export async function markAlertAsRead(req: Request, res: Response) {
  try {
    const { alertId } = req.params;
    
    const alert = await UserEmergencyAlert.findByIdAndUpdate(
      alertId,
      { 
        isRead: true,
        status: 'viewed',
        'providerResponse.viewedAt': new Date()
      },
      { new: true }
    );
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }
    
    return res.json({
      success: true,
      data: alert
    });
    
  } catch (error: any) {
    console.error('Mark alert as read error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to mark alert as read',
      message: error.message
    });
  }
}

/**
 * Respond to Emergency Alert
 * PUT /api/emergency/user-alerts/:alertId/respond
 */
export async function respondToUserAlert(req: Request, res: Response) {
  try {
    const { alertId } = req.params;
    const { canRespond, estimatedArrival, responseMessage } = req.body;
    
    const alert = await UserEmergencyAlert.findByIdAndUpdate(
      alertId,
      {
        status: canRespond ? 'acknowledged' : 'declined',
        'providerResponse.acknowledgedAt': new Date(),
        'providerResponse.canRespond': canRespond,
        'providerResponse.estimatedArrival': estimatedArrival ? new Date(estimatedArrival) : undefined,
        'providerResponse.responseMessage': responseMessage,
        isRead: true
      },
      { new: true }
    );
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }
    
    // Notify emergency user about provider response
    const notification = new EmergencyNotification({
      userId: alert.emergencyUserId,
      type: 'contact_notified',
      title: canRespond ? '✅ Help is Coming!' : '❌ Provider Cannot Respond',
      message: canRespond 
        ? `${alert.resourceInfo.resourceName} is responding to your emergency. ${responseMessage || ''}`
        : `${alert.resourceInfo.resourceName} cannot respond: ${responseMessage || 'Looking for alternative help.'}`,
      data: {
        alertId: alert._id,
        resourceName: alert.resourceInfo.resourceName,
        canRespond,
        estimatedArrival,
        distance: alert.resourceInfo.distance
      },
      priority: 'high'
    });
    
    await notification.save();
    
    return res.json({
      success: true,
      data: alert
    });
    
  } catch (error: any) {
    console.error('Respond to user alert error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to respond to alert',
      message: error.message
    });
  }
}

/**
 * Trigger Emergency Alert
 * POST /api/emergency/alert
 */
export async function triggerEmergencyAlert(req: Request, res: Response) {
  try {
    const { userId, emergencyType, location, message } = req.body;
    
    if (!userId || !emergencyType || !location) {
      return res.status(400).json({
        success: false,
        error: 'User ID, emergency type, and location are required'
      });
    }
    
    // Get user's emergency service settings or create one if it doesn't exist
    let emergencyService = await EmergencyService.findOne({ userId });
    
    if (!emergencyService) {
      // Auto-enable emergency service for first-time users
      emergencyService = new EmergencyService({
        userId,
        isEnabled: true,
        maxDistance: 10, // Default 10km radius
        location: {
          type: 'Point',
          coordinates: [location.lng, location.lat]
        },
        emergencyTypes: ['medical', 'blood', 'accident', 'pharmacy'],
        lastLocationUpdate: new Date()
      });
      await emergencyService.save();
      console.log(`✅ Auto-enabled emergency service for user: ${userId}`);
    } else if (!emergencyService.isEnabled) {
      // Auto-enable if disabled
      emergencyService.isEnabled = true;
      emergencyService.location = {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      };
      emergencyService.lastLocationUpdate = new Date();
      await emergencyService.save();
      console.log(`✅ Auto-enabled emergency service for user: ${userId}`);
    }
    
    // Find nearby resources
    const nearbyResources = await findNearbyResources(location, emergencyService.maxDistance);
    console.log(`🏥 Found ${nearbyResources.length} nearby resources within ${emergencyService.maxDistance}km`);
    
    // Get emergency contacts
    const contacts = await EmergencyContact.find({ userId, isActive: true });
    console.log(`📞 Found ${contacts.length} emergency contacts for user`);
    
    console.log(`📍 Emergency location: ${location.lat}, ${location.lng}`);
    
    // Create emergency notification
    const notification = new EmergencyNotification({
      userId,
      type: 'emergency_alert',
      title: `🚨 Emergency Alert - ${emergencyType}`,
      message: message || `Emergency assistance needed. ${nearbyResources.length} nearby resources found.`,
      data: {
        emergencyType,
        location,
        resourceCount: nearbyResources.length
      },
      priority: 'critical',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
    
    await notification.save();
    
    // Create notifications for each nearby resource
    for (const resource of nearbyResources.slice(0, 5)) { // Top 5 closest
      const resourceNotification = new EmergencyNotification({
        userId,
        type: 'resource_found',
        title: `🏥 Nearby ${resource.type}: ${resource.name}`,
        message: `${resource.name} is ${resource.distanceFromUser}km away. Contact: ${resource.contact}`,
        data: {
          emergencyType,
          resourceId: resource._id,
          resourceName: resource.name,
          distance: resource.distanceFromUser,
          location: {
            lat: resource.location.coordinates[1],
            lng: resource.location.coordinates[0]
          }
        },
        priority: 'high',
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours
      });
      
      await resourceNotification.save();
    }
    
    // Get emergency user info
    const emergencyUser = await User.findOne({ firebaseUid: userId });
    
    // Notify nearby service provider users (start with 15km radius)
    const providersNotified = await notifyServiceProviderUsers({
      emergencyUserId: userId,
      emergencyUserInfo: {
        name: emergencyUser?.name,
        phone: emergencyUser?.phone,
        location
      },
      emergencyType,
      message: message || 'Emergency assistance needed',
      urgencyLevel: 'critical'
    }, 15000); // 15km radius
    
    // Ensure at least 2 providers are notified
    if (providersNotified.length < 2) {
      console.log(`⚠️ Only ${providersNotified.length} providers notified, expanding search radius...`);
      
      // Try with larger radius (25km) if less than 2 providers found
      const additionalProviders = await notifyServiceProviderUsers({
        emergencyUserId: userId,
        emergencyUserInfo: {
          name: emergencyUser?.name,
          phone: emergencyUser?.phone,
          location
        },
        emergencyType,
        message: message || 'Emergency assistance needed',
        urgencyLevel: 'critical'
      }, 25000); // 25km radius
      
      providersNotified.push(...additionalProviders);
    }
    
    // TODO: Send SMS/Email to emergency contacts
    // TODO: Send push notifications
    
    return res.json({
      success: true,
      data: {
        alertId: notification._id,
        nearbyResourcesCount: nearbyResources.length,
        contactsNotified: contacts.length,
        providersNotified: providersNotified.length,
        providersContacted: providersNotified.map(alert => ({
          name: alert.serviceProviderUserId,
          resourceName: alert.resourceInfo.resourceName,
          distance: alert.resourceInfo.distance
        })),
        message: `Emergency calls initiated to ${providersNotified.length} service providers`
      }
    });
    
  } catch (error: any) {
    console.error('Trigger emergency alert error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to trigger emergency alert',
      message: error.message
    });
  }
}

/**
 * Helper function to find nearby resources
 */
async function findNearbyResources(location: { lat: number; lng: number }, maxDistance: number) {
  return await Resource.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [location.lng, location.lat]
        },
        $maxDistance: maxDistance * 1000 // Convert km to meters
      }
    }
  }).limit(10);
}

/**
 * Helper function to find and notify about nearby resources
 */
async function findAndNotifyNearbyResources(userId: string, location: { lat: number; lng: number }, maxDistance: number) {
  const nearbyResources = await findNearbyResources(location, maxDistance);
  
  if (nearbyResources.length > 0) {
    const notification = new EmergencyNotification({
      userId,
      type: 'resource_found',
      title: `🏥 ${nearbyResources.length} Healthcare Resources Nearby`,
      message: `Emergency service activated. Found ${nearbyResources.length} healthcare facilities within ${maxDistance}km.`,
      data: {
        location,
        resourceCount: nearbyResources.length
      },
      priority: 'medium',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
    
    await notification.save();
  }
}

/**
 * Helper function to notify service provider users
 */
async function notifyServiceProviderUsers(emergencyData: {
  emergencyUserId: string;
  emergencyUserInfo: {
    name?: string;
    phone?: string;
    location: { lat: number; lng: number; address?: string };
  };
  emergencyType: 'medical' | 'accident' | 'blood' | 'pharmacy';
  message: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}, radiusMeters: number = 5000) {
  try {
    // Find nearby resources within specified radius
    const nearbyResources = await Resource.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [emergencyData.emergencyUserInfo.location.lng, emergencyData.emergencyUserInfo.location.lat]
          },
          $maxDistance: radiusMeters
        }
      }
    }).limit(15); // Increased limit to find more providers

    console.log(`🚨 Found ${nearbyResources.length} nearby resources for emergency`);

    // Find service provider users assigned to these resources
    const resourceIds = nearbyResources.map(r => r._id.toString());
    const serviceProviderUsers = await User.find({
      assignedResourceId: { $in: resourceIds },
      isServiceProvider: true,
      emergencyNotificationsEnabled: true
    });

    console.log(`📋 Resource IDs: ${resourceIds.join(', ')}`);
    console.log(`👥 Service provider users found: ${serviceProviderUsers.map(u => `${u.name} (${u.phone})`).join(', ')}`);

    console.log(`👥 Found ${serviceProviderUsers.length} service provider users to notify`);

    const alertsCreated = [];

    for (const providerUser of serviceProviderUsers) {
      // Find the resource this user is assigned to
      const assignedResource = nearbyResources.find(r => r._id.toString() === providerUser.assignedResourceId);
      
      if (assignedResource) {
        // Calculate distance
        const distance = calculateDistance(
          emergencyData.emergencyUserInfo.location.lat,
          emergencyData.emergencyUserInfo.location.lng,
          assignedResource.location.coordinates[1],
          assignedResource.location.coordinates[0]
        );

        // Create alert for service provider user
        const userAlert = new UserEmergencyAlert({
          emergencyUserId: emergencyData.emergencyUserId,
          serviceProviderUserId: providerUser.firebaseUid,
          emergencyType: emergencyData.emergencyType,
          urgencyLevel: emergencyData.urgencyLevel,
          emergencyUserInfo: emergencyData.emergencyUserInfo,
          resourceInfo: {
            resourceId: assignedResource._id.toString(),
            resourceName: assignedResource.name,
            distance: distance
          },
          message: `🚨 EMERGENCY ALERT: ${emergencyData.message}. Patient located ${distance.toFixed(1)}km from ${assignedResource.name}.`,
          priority: 'critical',
          expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours
        });

        await userAlert.save();
        alertsCreated.push(userAlert);

        // Make emergency call and send SMS to service provider
        console.log(`📞 CONTACTING SERVICE PROVIDER: ${providerUser.name || 'Provider'}`);
        console.log(`   📱 Phone: ${providerUser.phone}`);
        console.log(`   🏥 Resource: ${assignedResource.name}`);
        console.log(`   📍 Distance: ${distance.toFixed(1)}km`);
        
        // Attempt to call and send SMS
        const callSuccess = await makeEmergencyCall(providerUser.phone, emergencyData);
        const smsSuccess = await sendEmergencySMS(providerUser.phone, emergencyData);
        
        if (callSuccess || smsSuccess) {
          console.log(`✅ Successfully contacted ${providerUser.name || providerUser.phone} at ${assignedResource.name}`);
        } else {
          console.log(`⚠️ Failed to contact ${providerUser.name || providerUser.phone} - trying next provider`);
        }
      }
    }

    return alertsCreated;
  } catch (error) {
    console.error('❌ Error notifying service provider users:', error);
    return [];
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Simulate emergency call to service provider
 * In production, integrate with Twilio or similar service
 */
async function makeEmergencyCall(phoneNumber: string, emergencyData: any): Promise<boolean> {
  try {
    // TODO: Integrate with actual calling service (Twilio Voice API)
    console.log(`🔄 Initiating emergency call to ${phoneNumber}...`);
    
    // Simulate call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`✅ Emergency call connected to ${phoneNumber}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to call ${phoneNumber}:`, error);
    return false;
  }
}

/**
 * Send emergency SMS to service provider
 * In production, integrate with Twilio SMS API
 */
async function sendEmergencySMS(phoneNumber: string, emergencyData: any): Promise<boolean> {
  try {
    // TODO: Integrate with actual SMS service (Twilio SMS API)
    const message = `🚨 EMERGENCY ALERT: Medical assistance needed at location ${emergencyData.emergencyUserInfo.location.lat}, ${emergencyData.emergencyUserInfo.location.lng}. Please respond immediately. - JeevanPath Emergency System`;
    
    console.log(`📱 Sending emergency SMS to ${phoneNumber}: ${message}`);
    
    // Simulate SMS delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`✅ Emergency SMS sent to ${phoneNumber}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send SMS to ${phoneNumber}:`, error);
    return false;
  }
}