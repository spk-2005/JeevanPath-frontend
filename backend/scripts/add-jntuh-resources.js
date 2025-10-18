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

// JNTUH coordinates: 17.5449° N, 78.5718° E
const JNTUH_LAT = 17.5449;
const JNTUH_LNG = 78.5718;

// Function to calculate coordinates at a given distance and bearing
function calculateCoordinates(lat, lng, distanceKm, bearingDegrees) {
  const R = 6371; // Earth's radius in km
  const d = distanceKm / R; // Distance in radians
  const bearing = bearingDegrees * Math.PI / 180; // Bearing in radians
  
  const lat1 = lat * Math.PI / 180;
  const lng1 = lng * Math.PI / 180;
  
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(bearing));
  const lng2 = lng1 + Math.atan2(Math.sin(bearing) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(lat2));
  
  return {
    lat: lat2 * 180 / Math.PI,
    lng: lng2 * 180 / Math.PI
  };
}

const sampleResources = [
  // 3km radius resources
  {
    name: "Apollo Hospitals Jubilee Hills",
    type: "clinic",
    address: "Road No. 72, Film Nagar, Jubilee Hills, Hyderabad",
    contact: "+91 40 2355 0000",
    alternateContact: "+91 40 2355 1234",
    distance: 3,
    bearing: 45,
    services: ["Emergency Care", "Cardiology", "Neurology", "ICU", "Surgery"],
    languages: ["English", "Hindi", "Telugu"],
    wheelchairAccessible: true,
    parkingAvailable: true,
    is24Hours: true,
    description: "Multi-specialty hospital with 24/7 emergency services",
    websiteUrl: "https://www.apollohospitals.com",
    rating: 4.5,
    reviewCount: 1250
  },
  {
    name: "Care Hospitals Banjara Hills",
    type: "clinic",
    address: "Road No. 1, Banjara Hills, Hyderabad",
    contact: "+91 40 6719 1000",
    distance: 3.2,
    bearing: 90,
    services: ["Emergency Care", "Orthopedics", "Gastroenterology", "Pediatrics"],
    languages: ["English", "Telugu", "Hindi"],
    wheelchairAccessible: true,
    parkingAvailable: true,
    openTime: "06:00",
    closeTime: "22:00",
    operatingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    description: "Advanced healthcare with specialized departments",
    rating: 4.3,
    reviewCount: 890
  },
  {
    name: "MedPlus Pharmacy Kukatpally",
    type: "pharmacy",
    address: "KPHB Colony, Kukatpally, Hyderabad",
    contact: "+91 40 2312 5678",
    distance: 2.8,
    bearing: 180,
    services: ["Prescription Medicines", "OTC Drugs", "Health Checkups"],
    languages: ["Telugu", "English", "Hindi"],
    wheelchairAccessible: false,
    parkingAvailable: true,
    openTime: "08:00",
    closeTime: "22:00",
    operatingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    description: "24/7 pharmacy with home delivery",
    rating: 4.1,
    reviewCount: 456
  },
  
  // 5km radius resources
  {
    name: "Yashoda Hospitals Secunderabad",
    type: "clinic",
    address: "SP Road, Secunderabad, Hyderabad",
    contact: "+91 40 4777 7777",
    distance: 5.1,
    bearing: 30,
    services: ["Emergency Care", "Oncology", "Nephrology", "Transplant", "ICU"],
    languages: ["English", "Telugu", "Hindi", "Urdu"],
    wheelchairAccessible: true,
    parkingAvailable: true,
    is24Hours: true,
    description: "Super specialty hospital with advanced medical facilities",
    websiteUrl: "https://www.yashodahospitals.com",
    rating: 4.4,
    reviewCount: 2100
  },
  {
    name: "Continental Hospitals Gachibowli",
    type: "clinic",
    address: "IT Park Road, Nanakramguda, Gachibowli, Hyderabad",
    contact: "+91 40 6777 6777",
    distance: 4.8,
    bearing: 225,
    services: ["Emergency Care", "Cardiac Surgery", "Neurosurgery", "Robotic Surgery"],
    languages: ["English", "Telugu", "Hindi"],
    wheelchairAccessible: true,
    parkingAvailable: true,
    is24Hours: true,
    description: "International standard healthcare with robotic surgery",
    websiteUrl: "https://www.continentalhospitals.com",
    rating: 4.6,
    reviewCount: 1800
  },
  {
    name: "Red Cross Blood Bank Hyderabad",
    type: "blood_bank",
    address: "Red Hills, Lakdikapul, Hyderabad",
    contact: "+91 40 2323 4567",
    distance: 5.5,
    bearing: 135,
    services: ["Blood Donation", "Blood Testing", "Emergency Blood Supply"],
    languages: ["Telugu", "English", "Hindi"],
    wheelchairAccessible: true,
    parkingAvailable: true,
    openTime: "08:00",
    closeTime: "20:00",
    operatingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    description: "Government blood bank with all blood types available",
    rating: 4.2,
    reviewCount: 340
  },
  {
    name: "Apollo Pharmacy Miyapur",
    type: "pharmacy",
    address: "Miyapur Main Road, Hyderabad",
    contact: "+91 40 2304 5678",
    distance: 4.2,
    bearing: 270,
    services: ["Prescription Medicines", "Health Products", "Diagnostic Tests"],
    languages: ["Telugu", "English", "Hindi"],
    wheelchairAccessible: true,
    parkingAvailable: true,
    is24Hours: true,
    description: "24/7 pharmacy chain with online ordering",
    websiteUrl: "https://www.apollopharmacy.in",
    rating: 4.0,
    reviewCount: 567
  },
  
  // 10km radius resources
  {
    name: "NIMS Hospital Punjagutta",
    type: "clinic",
    address: "Punjagutta, Hyderabad",
    contact: "+91 40 2335 0000",
    distance: 8.5,
    bearing: 120,
    services: ["Emergency Care", "Trauma Center", "Neurology", "Cardiology", "ICU"],
    languages: ["Telugu", "English", "Hindi"],
    wheelchairAccessible: true,
    parkingAvailable: true,
    is24Hours: true,
    description: "Government medical college hospital with trauma center",
    rating: 4.1,
    reviewCount: 1450
  },
  {
    name: "Gandhi Hospital Secunderabad",
    type: "clinic",
    address: "Musheerabad, Secunderabad, Hyderabad",
    contact: "+91 40 2770 1441",
    distance: 9.2,
    bearing: 60,
    services: ["Emergency Care", "General Medicine", "Surgery", "Pediatrics"],
    languages: ["Telugu", "English", "Hindi", "Urdu"],
    wheelchairAccessible: false,
    parkingAvailable: true,
    is24Hours: true,
    description: "Government hospital with affordable healthcare",
    rating: 3.8,
    reviewCount: 890
  },
  {
    name: "Osmania General Hospital",
    type: "clinic",
    address: "Afzal Gunj, Hyderabad",
    contact: "+91 40 2461 1146",
    distance: 10.5,
    bearing: 150,
    services: ["Emergency Care", "Trauma Center", "General Medicine", "Surgery"],
    languages: ["Telugu", "English", "Hindi", "Urdu"],
    wheelchairAccessible: false,
    parkingAvailable: true,
    is24Hours: true,
    description: "Historic government hospital with comprehensive services",
    rating: 3.6,
    reviewCount: 1200
  },
  {
    name: "Medicover Hospitals Madhapur",
    type: "clinic",
    address: "Madhapur, Hyderabad",
    contact: "+91 40 6813 6813",
    distance: 7.8,
    bearing: 200,
    services: ["Emergency Care", "Orthopedics", "Gynecology", "Pediatrics"],
    languages: ["English", "Telugu", "Hindi"],
    wheelchairAccessible: true,
    parkingAvailable: true,
    openTime: "06:00",
    closeTime: "22:00",
    operatingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    description: "Multi-specialty hospital with modern facilities",
    websiteUrl: "https://www.medicoverhospitals.in",
    rating: 4.2,
    reviewCount: 780
  },
  {
    name: "LifeLine Blood Bank Ameerpet",
    type: "blood_bank",
    address: "Ameerpet, Hyderabad",
    contact: "+91 40 2373 4567",
    distance: 8.0,
    bearing: 300,
    services: ["Blood Donation", "Platelet Donation", "Emergency Blood Supply"],
    languages: ["Telugu", "English", "Hindi"],
    wheelchairAccessible: true,
    parkingAvailable: true,
    openTime: "07:00",
    closeTime: "19:00",
    operatingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    description: "Private blood bank with component separation facility",
    rating: 4.3,
    reviewCount: 290
  },
  {
    name: "Max Cure Hospitals Gachibowli",
    type: "clinic",
    address: "Gachibowli, Hyderabad",
    contact: "+91 40 6719 9999",
    distance: 6.5,
    bearing: 240,
    services: ["Emergency Care", "Oncology", "Cardiology", "Neurology", "ICU"],
    languages: ["English", "Telugu", "Hindi"],
    wheelchairAccessible: true,
    parkingAvailable: true,
    is24Hours: true,
    description: "Advanced cancer care and multi-specialty services",
    websiteUrl: "https://www.maxcurehospitals.com",
    rating: 4.4,
    reviewCount: 920
  },
  {
    name: "24/7 Pharmacy Kondapur",
    type: "pharmacy",
    address: "Kondapur, Hyderabad",
    contact: "+91 40 2314 5678",
    distance: 9.8,
    bearing: 315,
    services: ["Prescription Medicines", "Emergency Medicines", "Health Supplements"],
    languages: ["Telugu", "English", "Hindi"],
    wheelchairAccessible: true,
    parkingAvailable: true,
    is24Hours: true,
    description: "Round-the-clock pharmacy with emergency medicine supply",
    rating: 3.9,
    reviewCount: 234
  },
  {
    name: "Sunshine Hospitals Gachibowli",
    type: "clinic",
    address: "Panjagutta Cross Road, Gachibowli, Hyderabad",
    contact: "+91 40 4455 4455",
    distance: 5.8,
    bearing: 210,
    services: ["Emergency Care", "Maternity", "Pediatrics", "General Surgery"],
    languages: ["English", "Telugu", "Hindi"],
    wheelchairAccessible: true,
    parkingAvailable: true,
    openTime: "00:00",
    closeTime: "23:59",
    operatingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    is24Hours: true,
    description: "Family-friendly hospital with maternity and pediatric care",
    websiteUrl: "https://www.sunshinehospitals.com",
    rating: 4.1,
    reviewCount: 650
  }
];

async function addJNTUHResources() {
  try {
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://prasannasimha5002_db_user:prasanna@cluster0.p6esyqh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing resources (optional - remove this if you want to keep existing data)
    // await Resource.deleteMany({});
    // console.log('🗑️ Cleared existing resources');

    // Add resources with calculated coordinates
    const resourcesWithCoords = sampleResources.map(resource => {
      const coords = calculateCoordinates(JNTUH_LAT, JNTUH_LNG, resource.distance, resource.bearing);
      
      return {
        name: resource.name,
        type: resource.type,
        address: resource.address,
        contact: resource.contact,
        alternateContact: resource.alternateContact,
        location: {
          type: 'Point',
          coordinates: [coords.lng, coords.lat] // [longitude, latitude]
        },
        openTime: resource.openTime,
        closeTime: resource.closeTime,
        operatingDays: resource.operatingDays || [],
        is24Hours: resource.is24Hours || false,
        rating: resource.rating || 0,
        reviewCount: resource.reviewCount || 0,
        services: resource.services || [],
        languages: resource.languages || [],
        wheelchairAccessible: resource.wheelchairAccessible || false,
        parkingAvailable: resource.parkingAvailable || false,
        description: resource.description,
        websiteUrl: resource.websiteUrl,
        isVerified: true,
        submittedBy: {
          name: "System Admin",
          phone: "+91 9876543210",
          email: "admin@jeevanpath.com"
        }
      };
    });

    // Insert resources
    const insertedResources = await Resource.insertMany(resourcesWithCoords);
    console.log(`✅ Added ${insertedResources.length} resources around JNTUH`);

    // Display summary
    console.log('\n📊 Resources Summary:');
    console.log(`🏥 Clinics: ${insertedResources.filter(r => r.type === 'clinic').length}`);
    console.log(`💊 Pharmacies: ${insertedResources.filter(r => r.type === 'pharmacy').length}`);
    console.log(`🩸 Blood Banks: ${insertedResources.filter(r => r.type === 'blood_bank').length}`);
    
    console.log('\n📍 Distance Distribution:');
    console.log(`📍 Within 3km: ${sampleResources.filter(r => r.distance <= 3).length} resources`);
    console.log(`📍 Within 5km: ${sampleResources.filter(r => r.distance <= 5).length} resources`);
    console.log(`📍 Within 10km: ${sampleResources.filter(r => r.distance <= 10).length} resources`);

    console.log('\n🎯 JNTUH Location: 17.5449°N, 78.5718°E');
    console.log('✅ All resources added successfully!');

  } catch (error) {
    console.error('❌ Error adding resources:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
addJNTUHResources();