import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Resource from '../models/Resource';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jeevanpath';

async function run() {
  await mongoose.connect(MONGO_URI);
  await Resource.deleteMany({});
  await Resource.insertMany([
    {
      name: 'Clinic A',
      type: 'clinic',
      address: 'MG Road',
      contact: '+91 90000 00001',
      location: { type: 'Point', coordinates: [77.6, 12.975] },
      openTime: '09:00',
      closeTime: '18:00',
      rating: 4.3
    },
    {
      name: 'Pharmacy B',
      type: 'pharmacy',
      address: 'Brigade Rd',
      contact: '+91 90000 00002',
      location: { type: 'Point', coordinates: [77.59, 12.969] },
      openTime: '08:00',
      closeTime: '22:00',
      rating: 4.6
    },
    {
      name: 'Blood Bank C',
      type: 'blood',
      address: 'Indiranagar',
      contact: '+91 90000 00003',
      location: { type: 'Point', coordinates: [77.62, 12.97] },
      openTime: '24x7',
      closeTime: '—',
      rating: 4.8
    }
  ]);
  console.log('Seeded');
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});





