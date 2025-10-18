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

async function cleanDuplicates() {
  try {
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://prasannasimha5002_db_user:prasanna@cluster0.p6esyqh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find duplicates by name and address
    const duplicates = await Resource.aggregate([
      {
        $group: {
          _id: { name: "$name", address: "$address" },
          count: { $sum: 1 },
          docs: { $push: "$_id" }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    console.log(`🔍 Found ${duplicates.length} duplicate groups`);

    let removedCount = 0;
    for (const duplicate of duplicates) {
      // Keep the first document, remove the rest
      const docsToRemove = duplicate.docs.slice(1);
      await Resource.deleteMany({ _id: { $in: docsToRemove } });
      removedCount += docsToRemove.length;
      console.log(`🗑️ Removed ${docsToRemove.length} duplicates of "${duplicate._id.name}"`);
    }

    console.log(`✅ Cleaned up ${removedCount} duplicate resources`);

    // Show final count
    const finalCount = await Resource.countDocuments({});
    console.log(`📊 Final resource count: ${finalCount}`);

  } catch (error) {
    console.error('❌ Error cleaning duplicates:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
cleanDuplicates();