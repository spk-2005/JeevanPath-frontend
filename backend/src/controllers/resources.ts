import { Request, Response } from 'express';
import Resource from '../models/Resource';

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
    return res.json(docs);
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




