import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Resource from '../models/Resource';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://prasannasimha5002_db_user:prasanna@cluster0.p6esyqh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function run() {
  await mongoose.connect(MONGO_URI);
  await Resource.deleteMany({});
  await Resource.insertMany([
    {
      name: 'City General Hospital',
      type: 'clinic',
      address: 'MG Road, Bengaluru',
      contact: '+91 90000 00001',
      location: { type: 'Point', coordinates: [77.6, 12.975] },
      openTime: '09:00',
      closeTime: '18:00',
      rating: 4.5,
      services: ['Emergency Care','Surgery','ICU'],
      languages: ['English','Hindi'],
      insuranceAccepted: ['Medicare','Medicaid'],
      transportation: ['walking_distance','car_accessible','free_parking'],
      wheelchairAccessible: true
    },
    {
      name: 'HealthPlus Clinic',
      type: 'clinic',
      address: 'Brigade Rd, Bengaluru',
      contact: '+91 90000 00002',
      location: { type: 'Point', coordinates: [77.59, 12.969] },
      openTime: '08:00',
      closeTime: '22:00',
      rating: 4.2,
      services: ['Preventive Care','Dental Care','Lab Tests'],
      languages: ['English','Kannada'],
      insuranceAccepted: ['Aetna','Cigna'],
      transportation: ['public_transit','car_accessible'],
      wheelchairAccessible: true
    },
    {
      name: 'Sunrise Pharmacy',
      type: 'pharmacy',
      address: 'Indiranagar, Bengaluru',
      contact: '+91 90000 00003',
      location: { type: 'Point', coordinates: [77.62, 12.97] },
      openTime: '08:00',
      closeTime: '23:00',
      rating: 4.6,
      services: ['OTC Medicines','Immunizations'],
      languages: ['English','Hindi','Kannada'],
      insuranceAccepted: ['UnitedHealth'],
      transportation: ['walking_distance'],
      wheelchairAccessible: false
    },
    {
      name: 'Aster Labs Diagnostic Center',
      type: 'clinic',
      address: 'HSR Layout, Bengaluru',
      contact: '+91 90000 00004',
      location: { type: 'Point', coordinates: [77.64, 12.91] },
      openTime: '07:00',
      closeTime: '20:00',
      rating: 4.1,
      services: ['Lab Tests','Blood Work','Radiology'],
      languages: ['English','Hindi'],
      insuranceAccepted: ['Aetna'],
      transportation: ['public_transit'],
      wheelchairAccessible: true
    },
    {
      name: 'GreenLeaf Clinic',
      type: 'clinic',
      address: 'Koramangala 4th Block, Bengaluru',
      contact: '+91 90000 00005',
      location: { type: 'Point', coordinates: [77.62, 12.935] },
      openTime: '10:00',
      closeTime: '19:00',
      rating: 4.0,
      services: ['Preventive Care','Pediatrics'],
      languages: ['English','Kannada'],
      insuranceAccepted: ['Cigna'],
      transportation: ['walking_distance','public_transit'],
      wheelchairAccessible: false
    },
    {
      name: 'CityCare Hospital',
      type: 'clinic',
      address: 'Jayanagar, Bengaluru',
      contact: '+91 90000 00006',
      location: { type: 'Point', coordinates: [77.584, 12.925] },
      openTime: '00:00',
      closeTime: '23:59',
      rating: 4.7,
      services: ['Emergency Care','ICU','Surgery'],
      languages: ['English','Hindi','Kannada'],
      insuranceAccepted: ['Medicaid','UnitedHealth'],
      transportation: ['car_accessible','free_parking'],
      wheelchairAccessible: true
    },
    {
      name: 'Metro Pharmacy',
      type: 'pharmacy',
      address: 'BTM Layout, Bengaluru',
      contact: '+91 90000 00007',
      location: { type: 'Point', coordinates: [77.61, 12.916] },
      openTime: '08:00',
      closeTime: '22:00',
      rating: 4.3,
      services: ['OTC Medicines','Immunizations'],
      languages: ['English','Hindi'],
      insuranceAccepted: ['Kaiser Permanente'],
      transportation: ['walking_distance'],
      wheelchairAccessible: true
    },
    {
      name: 'Prime Diagnostics',
      type: 'clinic',
      address: 'Whitefield, Bengaluru',
      contact: '+91 90000 00008',
      location: { type: 'Point', coordinates: [77.752, 12.969] },
      openTime: '06:30',
      closeTime: '21:00',
      rating: 4.4,
      services: ['Lab Tests','Radiology'],
      languages: ['English','Hindi'],
      insuranceAccepted: ['Aetna','Cigna'],
      transportation: ['public_transit','car_accessible'],
      wheelchairAccessible: true
    },
    {
      name: 'CareFirst Clinic',
      type: 'clinic',
      address: 'Hebbal, Bengaluru',
      contact: '+91 90000 00009',
      location: { type: 'Point', coordinates: [77.592, 13.035] },
      openTime: '09:30',
      closeTime: '18:30',
      rating: 3.9,
      services: ['Preventive Care'],
      languages: ['English','Kannada'],
      insuranceAccepted: ['Medicare'],
      transportation: ['public_transit'],
      wheelchairAccessible: false
    },
    {
      name: 'Apollo Pharmacy',
      type: 'pharmacy',
      address: 'Electronic City, Bengaluru',
      contact: '+91 90000 00010',
      location: { type: 'Point', coordinates: [77.66, 12.84] },
      openTime: '07:00',
      closeTime: '23:00',
      rating: 4.1,
      services: ['OTC Medicines'],
      languages: ['English','Hindi'],
      insuranceAccepted: ['UnitedHealth'],
      transportation: ['car_accessible'],
      wheelchairAccessible: true
    },
    {
      name: 'Namma Clinic',
      type: 'clinic',
      address: 'Malleshwaram, Bengaluru',
      contact: '+91 90000 00011',
      location: { type: 'Point', coordinates: [77.57, 13.0] },
      openTime: '10:00',
      closeTime: '19:00',
      rating: 4.0,
      services: ['Pediatrics','Lab Tests'],
      languages: ['English','Kannada'],
      insuranceAccepted: ['Cigna'],
      transportation: ['walking_distance','public_transit'],
      wheelchairAccessible: false
    },
    {
      name: 'Global Labs',
      type: 'clinic',
      address: 'Marathahalli, Bengaluru',
      contact: '+91 90000 00012',
      location: { type: 'Point', coordinates: [77.704, 12.96] },
      openTime: '07:00',
      closeTime: '20:00',
      rating: 4.2,
      services: ['Blood Work','Radiology','Lab Tests'],
      languages: ['English','Hindi'],
      insuranceAccepted: ['Aetna'],
      transportation: ['public_transit'],
      wheelchairAccessible: true
    },
    {
      name: 'City Blood Bank',
      type: 'blood',
      address: 'Richmond Town, Bengaluru',
      contact: '+91 90000 00013',
      location: { type: 'Point', coordinates: [77.6, 12.96] },
      openTime: '00:00',
      closeTime: '23:59',
      rating: 4.8,
      services: ['Blood Donation','Plasma'],
      languages: ['English','Hindi'],
      insuranceAccepted: [],
      transportation: ['car_accessible','free_parking'],
      wheelchairAccessible: true
    }
  ]);
  console.log('Seeded');
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});





