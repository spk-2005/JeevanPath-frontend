import { Request, Response } from 'express';
import Resource from '../models/Resource';

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

export async function addResource(req: Request, res: Response) {
  try {
    const { name, type, address, contact, location, openTime, closeTime, rating } = req.body;
    const doc = await Resource.create({ name, type, address, contact, location, openTime, closeTime, rating });
    return res.status(201).json(doc);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to add resource' });
  }
}

export async function listResources(req: Request, res: Response) {
  try {
    const { type, q, minRating, openNow, lat, lng, radiusMeters, services, languages, insurance, transportation, wheelchair, sortBy } = req.query as any;
    
    console.log('Resources API called with params:', {
      type, q, minRating, openNow, lat, lng, radiusMeters, services, languages, insurance, transportation, wheelchair, sortBy
    });
    
    const filter: any = {};
    if (type) filter.type = String(type);
    if (q) filter.name = { $regex: q, $options: 'i' };
    if (minRating) filter.rating = { $gte: Number(minRating) };

    const toArray = (val: any) => val === undefined ? undefined : Array.isArray(val) ? val : String(val).split(',').map((s: string) => s.trim()).filter(Boolean);
    const servicesArr = toArray(services);
    const languagesArr = toArray(languages);
    const insuranceArr = toArray(insurance);
    const transportArr = toArray(transportation);
    if (servicesArr && servicesArr.length) filter.services = { $all: servicesArr };
    if (languagesArr && languagesArr.length) filter.languages = { $all: languagesArr };
    if (insuranceArr && insuranceArr.length) filter.insuranceAccepted = { $all: insuranceArr };
    if (transportArr && transportArr.length) filter.transportation = { $all: transportArr };
    if (wheelchair === 'true') filter.wheelchairAccessible = true;

    // If openNow requested, compare current HH:mm against open/close time strings
    if (openNow === 'true') {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const cur = `${hh}:${mm}`;
      filter.$expr = {
        $and: [
          { $lte: ['$openTime', cur] },
          { $gte: ['$closeTime', cur] }
        ]
      };
    }

    // Geospatial filter inline if lat/lng provided
    let queryExec = Resource.find(filter).limit(100);
    if (sortBy === 'rating') queryExec = queryExec.sort({ rating: -1 });
    if (lat && lng) {
      console.log('Using geospatial query with coordinates:', Number(lng), Number(lat), 'radius:', Number(radiusMeters ?? 3000));
      const nearStage = {
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
            $maxDistance: Number(radiusMeters ?? 3000)
          }
        }
      } as any;
      queryExec = Resource.find({ ...filter, ...nearStage }).limit(100);
    }
    
    const docs = await queryExec;
    console.log(`Found ${docs.length} resources matching query`);
    
    // Calculate distances if location is provided
    let resourcesWithDistance = docs;
    if (lat && lng) {
      resourcesWithDistance = docs.map(resource => {
        const distance = calculateDistance(
          Number(lat),
          Number(lng),
          resource.location.coordinates[1], // latitude
          resource.location.coordinates[0]  // longitude
        );
        return {
          ...resource.toObject(),
          distanceFromUser: Math.round(distance * 10) / 10 // Round to 1 decimal place
        };
      });
      
      // Sort by distance if requested
      if (sortBy === 'distance') {
        resourcesWithDistance.sort((a, b) => (a.distanceFromUser || 0) - (b.distanceFromUser || 0));
      }
      
      console.log(`Calculated distances for ${resourcesWithDistance.length} resources`);
    }
    
    return res.json(resourcesWithDistance);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to list resources' });
  }
}

export async function resourceDetails(req: Request, res: Response) {
  try {
    const doc = await Resource.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    return res.json(doc);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to get resource' });
  }
}

export async function nearbyResources(req: Request, res: Response) {
  try {
    const { lat, lng, radiusMeters = 3000 } = req.query as any;
    const docs = await Resource.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(radiusMeters)
        }
      }
    }).limit(100);
    return res.json(docs);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to search nearby' });
  }
}




