import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ServiceProvider from '../models/ServiceProvider';
import Resource from '../models/Resource';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://prasannasimha5002_db_user:prasanna@cluster0.p6esyqh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function seedServiceProviders() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get existing resources
    const resources = await Resource.find({});
    console.log(`📊 Found ${resources.length} resources`);

    // Clear existing providers
    await ServiceProvider.deleteMany({});
    console.log('🗑️ Cleared existing service providers');

    const providers = [];

    for (const resource of resources) {
      // Create a service provider for each resource
      const provider = {
        resourceId: resource._id.toString(),
        providerName: resource.name,
        contactPerson: `Dr. ${resource.name.split(' ')[0]} Manager`,
        phone: resource.contact || '+91 90000 00000',
        email: `emergency@${resource.name.toLowerCase().replace(/\s+/g, '')}.com`,
        emergencyPhone: resource.contact || '+91 90000 00000',
        isEmergencyEnabled: true,
        responseRadius: Math.floor(Math.random() * 3) + 3, // 3-5 km radius
        availableServices: getServicesForType(resource.type, resource.services),
        location: {
          type: 'Point',
          coordinates: resource.location.coordinates
        },
        operatingHours: {
          start: resource.openTime || '00:00',
          end: resource.closeTime || '23:59',
          is24Hours: resource.openTime === '00:00' && resource.closeTime === '23:59'
        },
        emergencyResponseTime: Math.floor(Math.random() * 20) + 10, // 10-30 minutes
        notificationPreferences: {
          sms: true,
          email: true,
          push: true
        }
      };

      providers.push(provider);
    }

    // Insert all providers
    await ServiceProvider.insertMany(providers);
    console.log(`✅ Created ${providers.length} service providers`);

    // Display summary
    const summary = await ServiceProvider.aggregate([
      {
        $lookup: {
          from: 'resources',
          localField: 'resourceId',
          foreignField: '_id',
          as: 'resource'
        }
      },
      {
        $unwind: '$resource'
      },
      {
        $group: {
          _id: '$resource.type',
          count: { $sum: 1 },
          avgResponseRadius: { $avg: '$responseRadius' },
          avgResponseTime: { $avg: '$emergencyResponseTime' }
        }
      }
    ]);

    console.log('\n📈 Service Provider Summary:');
    summary.forEach(group => {
      console.log(`${group._id}: ${group.count} providers`);
      console.log(`  - Avg Response Radius: ${group.avgResponseRadius.toFixed(1)}km`);
      console.log(`  - Avg Response Time: ${group.avgResponseTime.toFixed(1)} minutes`);
    });

  } catch (error) {
    console.error('❌ Error seeding service providers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
}

function getServicesForType(resourceType: string, resourceServices: string[] = []) {
  const baseServices = ['emergency_care'];
  
  switch (resourceType) {
    case 'clinic':
      return [...baseServices, 'ambulance', 'surgery', 'icu', 'lab_tests'];
    case 'pharmacy':
      return ['pharmacy'];
    case 'blood':
      return ['blood_bank'];
    default:
      return baseServices;
  }
}

seedServiceProviders().catch(console.error);