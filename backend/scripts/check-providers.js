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

async function checkProviders() {
  try {
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://prasannasimha5002_db_user:prasanna@cluster0.p6esyqh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Count service providers
    const totalProviders = await User.countDocuments({ isServiceProvider: true });
    console.log(`👥 Total service providers: ${totalProviders}`);

    const activeProviders = await User.countDocuments({ 
      isServiceProvider: true, 
      emergencyNotificationsEnabled: true 
    });
    console.log(`🔔 Active providers (notifications enabled): ${activeProviders}`);

    if (totalProviders === 0) {
      console.log('❌ No service providers found! Please run the add-service-providers.js script.');
      return;
    }

    // Show sample providers
    console.log('\n👨‍⚕️ Sample service providers:');
    const sampleProviders = await User.find({ isServiceProvider: true }).limit(5);
    sampleProviders.forEach((provider, index) => {
      console.log(`${index + 1}. ${provider.name} (${provider.role}) - Resource: ${provider.assignedResourceId}`);
      console.log(`   Phone: ${provider.phone}, Notifications: ${provider.emergencyNotificationsEnabled}`);
    });

  } catch (error) {
    console.error('❌ Error checking providers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
checkProviders();