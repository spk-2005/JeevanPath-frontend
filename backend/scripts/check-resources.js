const mongoose = require('mongoose');

// Define Resource schema directly in JavaScript
const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['clinic', 'pharmacy', 'blood_bank', 'other'], required: true },
  address: String,
  contact: String,
  alternateContact: String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  openTime: String,
  closeTime: String,
  operatingDays: [String],
  is24Hours: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  services: { type: [String], default: [] },
  languages: { type: [String], default: [] },
  insuranceAccepted: { type: [String], default: [] },
  transportation: { type: [String], default: [] },
  wheelchairAccessible: { type: Boolean, default: false },
  parkingAvailable: { type: Boolean, default: false },
  description: String,
  websiteUrl: String,
  isVerified: { type: Boolean, default: false },
  submittedBy: {
    name: String,
    phone: String,
    email: String
  },
  distanceFromUser: { type: Number }
});

resourceSchema.index({ location: '2dsphere' });

const Resource = mongoose.model('Resource', resourceSchema);

async function checkResources() {
  try {
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://prasannasimha5002_db_user:prasanna@cluster0.p6esyqh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Count total resources
    const totalResources = await Resource.countDocuments({});
    console.log(`📊 Total resources in database: ${totalResources}`);

    if (totalResources === 0) {
      console.log('❌ No resources found! Please run the add-jntuh-resources.js script first.');
      return;
    }

    // Count by type
    const clinics = await Resource.countDocuments({ type: 'clinic' });
    const pharmacies = await Resource.countDocuments({ type: 'pharmacy' });
    const bloodBanks = await Resource.countDocuments({ type: 'blood_bank' });
    
    console.log(`🏥 Clinics: ${clinics}`);
    console.log(`💊 Pharmacies: ${pharmacies}`);
    console.log(`🩸 Blood Banks: ${bloodBanks}`);

    // Show sample resources
    console.log('\n📋 Sample resources:');
    const sampleResources = await Resource.find({}).limit(5);
    sampleResources.forEach((resource, index) => {
      console.log(`${index + 1}. ${resource.name} (${resource.type}) - ${resource.address}`);
      console.log(`   Coordinates: [${resource.location.coordinates[0]}, ${resource.location.coordinates[1]}]`);
    });

    // Test geospatial query around JNTUH
    const JNTUH_LAT = 17.5449;
    const JNTUH_LNG = 78.5718;
    
    console.log('\n🎯 Testing geospatial query around JNTUH...');
    const nearbyResources = await Resource.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [JNTUH_LNG, JNTUH_LAT] },
          $maxDistance: 10000 // 10km
        }
      }
    }).limit(10);

    console.log(`📍 Found ${nearbyResources.length} resources within 10km of JNTUH`);
    nearbyResources.forEach((resource, index) => {
      console.log(`${index + 1}. ${resource.name} (${resource.type})`);
    });

  } catch (error) {
    console.error('❌ Error checking resources:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
checkResources();