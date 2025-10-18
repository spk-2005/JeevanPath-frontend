const mongoose = require('mongoose');

// Define Resource schema directly in the script
const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['clinic', 'pharmacy', 'blood'], required: true },
  address: String,
  contact: String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  openTime: String,
  closeTime: String,
  rating: { type: Number, default: 0 },
  services: { type: [String], default: [] },
  languages: { type: [String], default: [] },
  insuranceAccepted: { type: [String], default: [] },
  transportation: { type: [String], default: [] },
  wheelchairAccessible: { type: Boolean, default: false },
  distanceFromUser: { type: Number } // New field
});

const Resource = mongoose.model('Resource', resourceSchema);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/jeevanpath');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Add random distances to all resources
const addRandomDistances = async () => {
  try {
    console.log('🔄 Adding random distances to resources...');
    
    // Get all resources
    const resources = await Resource.find({});
    console.log(`📊 Found ${resources.length} resources`);
    
    // Distance options: 3km, 10km, 15km, 25km
    const distanceOptions = [3, 10, 15, 25];
    
    let updatedCount = 0;
    
    for (const resource of resources) {
      // Pick a random distance
      const randomDistance = distanceOptions[Math.floor(Math.random() * distanceOptions.length)];
      
      // Update the resource
      await Resource.findByIdAndUpdate(resource._id, {
        distanceFromUser: randomDistance
      });
      
      console.log(`✅ Updated ${resource.name}: ${randomDistance}km`);
      updatedCount++;
    }
    
    console.log(`🎉 Successfully updated ${updatedCount} resources with random distances`);
    
    // Display summary
    const summary = await Resource.aggregate([
      {
        $group: {
          _id: '$distanceFromUser',
          count: { $sum: 1 },
          resources: { $push: '$name' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\n📈 Distance Distribution:');
    summary.forEach(group => {
      console.log(`${group._id}km: ${group.count} resources`);
      group.resources.forEach(name => console.log(`  - ${name}`));
    });
    
  } catch (error) {
    console.error('❌ Error adding distances:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the script
const main = async () => {
  await connectDB();
  await addRandomDistances();
};

main().catch(console.error);