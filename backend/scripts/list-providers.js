const mongoose = require('mongoose');

// Define User schema directly in JavaScript
const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  name: String,
  phone: String,
  email: String,
  isServiceProvider: { type: Boolean, default: false },
  assignedResourceId: String,
  emergencyNotificationsEnabled: { type: Boolean, default: true },
  role: String,
  isActive: { type: Boolean, default: true },
  lastLoginAt: Date,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Define Resource schema
const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['clinic', 'pharmacy', 'blood_bank', 'other'], required: true },
  address: String,
  contact: String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  }
});

const Resource = mongoose.model('Resource', resourceSchema);

async function listProviders() {
  try {
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://prasannasimha5002_db_user:prasanna@cluster0.p6esyqh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all service providers with their assigned resources
    const providers = await User.find({ isServiceProvider: true });
    const resources = await Resource.find({});

    console.log(`\n📋 SERVICE PROVIDERS DIRECTORY`);
    console.log(`═══════════════════════════════════════════════════════════════`);

    for (const provider of providers) {
      const assignedResource = resources.find(r => r._id.toString() === provider.assignedResourceId);
      
      console.log(`\n👨‍⚕️ ${provider.name || 'Unknown Provider'}`);
      console.log(`   📱 Phone: ${provider.phone}`);
      console.log(`   📧 Email: ${provider.email || 'Not provided'}`);
      console.log(`   🏥 Resource: ${assignedResource?.name || 'Not assigned'}`);
      console.log(`   🏷️ Role: ${provider.role || 'Not specified'}`);
      console.log(`   🔔 Notifications: ${provider.emergencyNotificationsEnabled ? '✅ Enabled' : '❌ Disabled'}`);
      console.log(`   📍 Location: ${assignedResource?.address || 'Not available'}`);
      console.log(`   ─────────────────────────────────────────────────────────────`);
    }

    console.log(`\n📊 SUMMARY:`);
    console.log(`   👥 Total Providers: ${providers.length}`);
    console.log(`   🔔 Notifications Enabled: ${providers.filter(p => p.emergencyNotificationsEnabled).length}`);
    console.log(`   🏥 Clinics: ${providers.filter(p => {
      const resource = resources.find(r => r._id.toString() === p.assignedResourceId);
      return resource?.type === 'clinic';
    }).length}`);
    console.log(`   💊 Pharmacies: ${providers.filter(p => {
      const resource = resources.find(r => r._id.toString() === p.assignedResourceId);
      return resource?.type === 'pharmacy';
    }).length}`);
    console.log(`   🩸 Blood Banks: ${providers.filter(p => {
      const resource = resources.find(r => r._id.toString() === p.assignedResourceId);
      return resource?.type === 'blood_bank';
    }).length}`);

  } catch (error) {
    console.error('❌ Error listing providers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
listProviders();