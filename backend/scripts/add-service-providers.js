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

// Sample service provider users
const serviceProviders = [
  {
    name: "Dr. Rajesh Kumar",
    phone: "+91 9876543210",
    email: "rajesh.kumar@apollohyd.com",
    resourceName: "Apollo Hospitals Jubilee Hills",
    role: "Emergency Doctor"
  },
  {
    name: "Dr. Priya Sharma",
    phone: "+91 9876543211",
    email: "priya.sharma@carehospitals.com",
    resourceName: "Care Hospitals Banjara Hills",
    role: "Duty Doctor"
  },
  {
    name: "Pharmacist Ravi",
    phone: "+91 9876543212",
    email: "ravi@medplus.com",
    resourceName: "MedPlus Pharmacy Kukatpally",
    role: "Chief Pharmacist"
  },
  {
    name: "Dr. Sunitha Reddy",
    phone: "+91 9876543213",
    email: "sunitha.reddy@yashodahospitals.com",
    resourceName: "Yashoda Hospitals Secunderabad",
    role: "Emergency Physician"
  },
  {
    name: "Dr. Vikram Singh",
    phone: "+91 9876543214",
    email: "vikram.singh@continentalhospitals.com",
    resourceName: "Continental Hospitals Gachibowli",
    role: "Trauma Surgeon"
  },
  {
    name: "Blood Bank Officer Lakshmi",
    phone: "+91 9876543215",
    email: "lakshmi@redcrosshyderabad.org",
    resourceName: "Red Cross Blood Bank Hyderabad",
    role: "Blood Bank Officer"
  },
  {
    name: "Pharmacist Suresh",
    phone: "+91 9876543216",
    email: "suresh@apollopharmacy.in",
    resourceName: "Apollo Pharmacy Miyapur",
    role: "Store Manager"
  },
  {
    name: "Dr. Madhavi Rao",
    phone: "+91 9876543217",
    email: "madhavi.rao@nims.edu.in",
    resourceName: "NIMS Hospital Punjagutta",
    role: "Resident Doctor"
  },
  {
    name: "Dr. Ahmed Khan",
    phone: "+91 9876543218",
    email: "ahmed.khan@gandhihospital.gov.in",
    resourceName: "Gandhi Hospital Secunderabad",
    role: "Emergency Doctor"
  },
  {
    name: "Dr. Ramesh Babu",
    phone: "+91 9876543219",
    email: "ramesh.babu@osmania.gov.in",
    resourceName: "Osmania General Hospital",
    role: "Duty Doctor"
  },
  {
    name: "Dr. Kavitha Menon",
    phone: "+91 9876543220",
    email: "kavitha.menon@medicoverhospitals.in",
    resourceName: "Medicover Hospitals Madhapur",
    role: "Consultant Physician"
  },
  {
    name: "Blood Bank Tech Anil",
    phone: "+91 9876543221",
    email: "anil@lifelinebloodbank.com",
    resourceName: "LifeLine Blood Bank Ameerpet",
    role: "Lab Technician"
  },
  {
    name: "Dr. Deepika Agarwal",
    phone: "+91 9876543222",
    email: "deepika.agarwal@maxcurehospitals.com",
    resourceName: "Max Cure Hospitals Gachibowli",
    role: "Oncologist"
  },
  {
    name: "Pharmacist Kiran",
    phone: "+91 9876543223",
    email: "kiran@24x7pharmacy.com",
    resourceName: "24/7 Pharmacy Kondapur",
    role: "Night Shift Pharmacist"
  },
  {
    name: "Dr. Srinivas Rao",
    phone: "+91 9876543224",
    email: "srinivas.rao@sunshinehospitals.com",
    resourceName: "Sunshine Hospitals Gachibowli",
    role: "Pediatrician"
  }
];

async function addServiceProviders() {
  try {
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://prasannasimha5002_db_user:prasanna@cluster0.p6esyqh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all resources
    const resources = await Resource.find({});
    console.log(`📋 Found ${resources.length} resources in database`);

    let providersAdded = 0;

    for (const providerData of serviceProviders) {
      // Find the resource this provider should be assigned to
      const resource = resources.find(r => r.name === providerData.resourceName);
      
      if (resource) {
        // Generate a unique Firebase UID for this provider
        const firebaseUid = `provider_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create service provider user
        const serviceProvider = new User({
          firebaseUid: firebaseUid,
          name: providerData.name,
          phone: providerData.phone,
          email: providerData.email,
          isServiceProvider: true,
          assignedResourceId: resource._id.toString(),
          emergencyNotificationsEnabled: true,
          role: providerData.role,
          isActive: true,
          lastLoginAt: new Date(),
          createdAt: new Date()
        });

        await serviceProvider.save();
        providersAdded++;
        
        console.log(`✅ Added provider: ${providerData.name} -> ${providerData.resourceName}`);
      } else {
        console.log(`⚠️ Resource not found: ${providerData.resourceName}`);
      }
    }

    console.log(`\n🎉 Successfully added ${providersAdded} service providers!`);
    
    // Display summary
    const totalProviders = await User.countDocuments({ isServiceProvider: true });
    console.log(`👥 Total service providers in system: ${totalProviders}`);
    
    console.log('\n📊 Provider Distribution:');
    const clinicProviders = await User.aggregate([
      { $match: { isServiceProvider: true } },
      { 
        $lookup: {
          from: 'resources',
          localField: 'assignedResourceId',
          foreignField: '_id',
          as: 'resource'
        }
      },
      { $unwind: '$resource' },
      { $group: { _id: '$resource.type', count: { $sum: 1 } } }
    ]);
    
    clinicProviders.forEach(group => {
      console.log(`${group._id}: ${group.count} providers`);
    });

  } catch (error) {
    console.error('❌ Error adding service providers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
addServiceProviders();