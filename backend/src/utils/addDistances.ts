import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Resource from '../models/Resource';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://prasannasimha5002_db_user:prasanna@cluster0.p6esyqh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function addDistancesToResources() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Distance options: 3km, 10km, 15km, 25km
    const distanceOptions = [3, 10, 15, 25];
    
    // Get all resources
    const resources = await Resource.find({});
    console.log(`📊 Found ${resources.length} resources`);
    
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
      group.resources.forEach((name: string) => console.log(`  - ${name}`));
    });
    
  } catch (error) {
    console.error('❌ Error adding distances:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
}

addDistancesToResources().catch(console.error);