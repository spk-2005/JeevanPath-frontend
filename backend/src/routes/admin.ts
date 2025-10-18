import { Router } from 'express';
import Resource from '../models/Resource';

const router = Router();

/**
 * Add random distances to all resources
 * POST /api/admin/add-distances
 */
router.post('/add-distances', async (req, res) => {
  try {
    // Distance options: 3km, 10km, 15km, 25km
    const distanceOptions = [3, 10, 15, 25];
    
    // Get all resources
    const resources = await Resource.find({});
    console.log(`📊 Found ${resources.length} resources`);
    
    let updatedCount = 0;
    const updates = [];
    
    for (const resource of resources) {
      // Pick a random distance
      const randomDistance = distanceOptions[Math.floor(Math.random() * distanceOptions.length)];
      
      // Update the resource
      await Resource.findByIdAndUpdate(resource._id, {
        distanceFromUser: randomDistance
      });
      
      updates.push({
        name: resource.name,
        distance: randomDistance
      });
      
      console.log(`✅ Updated ${resource.name}: ${randomDistance}km`);
      updatedCount++;
    }
    
    // Get summary
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
    
    return res.json({
      success: true,
      message: `Successfully updated ${updatedCount} resources with random distances`,
      data: {
        updatedCount,
        updates,
        summary
      }
    });
    
  } catch (error: any) {
    console.error('❌ Error adding distances:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to add distances',
      message: error.message
    });
  }
});

/**
 * Check current distances
 * GET /api/admin/check-distances
 */
router.get('/check-distances', async (req, res) => {
  try {
    const resources = await Resource.find({}, 'name distanceFromUser').sort({ name: 1 });
    
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
    
    return res.json({
      success: true,
      data: {
        resources,
        summary,
        totalResources: resources.length,
        resourcesWithDistance: resources.filter(r => r.distanceFromUser).length
      }
    });
    
  } catch (error: any) {
    console.error('❌ Error checking distances:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to check distances',
      message: error.message
    });
  }
});

export default router;