import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import DonorProfile from '../models/DonorProfile.js';
import BloodRequest from '../models/BloodRequest.js';
import Match from '../models/Match.js';
import Notification from '../models/Notification.js';
import Report from '../models/Report.js';
import Appointment from '../models/Appointment.js';

dotenv.config();

/**
 * ============================================================================
 * RAKTHALINK AI - DEVELOPMENT TEST DATA SEED SCRIPT
 * Primary Administrator: dharshang317@gmail.com
 * ============================================================================
 */
const seedDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rakthalink';

  try {
    await mongoose.connect(uri);
    console.log('🍃 Connected to MongoDB for seeding development dataset...');

    // Clean existing test collections
    await User.deleteMany({});
    await DonorProfile.deleteMany({});
    await BloodRequest.deleteMany({});
    await Match.deleteMany({});
    await Notification.deleteMany({});
    await Report.deleteMany({});
    await Appointment.deleteMany({});

    console.log('🧹 Purged existing development collections.');

    // 1. Create Users (Including Dharshan as Primary Admin)
    const users = await User.create([
      {
        googleId: 'google_admin_dharshan',
        email: 'dharshang317@gmail.com',
        name: 'Dharshan G (Platform Admin)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        role: 'admin',
        phone: '+91 98765 43210',
        city: 'Coimbatore',
        area: 'Gandhipuram',
        isProfileCompleted: true,
      },
      {
        googleId: 'test_google_donor_1',
        email: 'donor.arun@example.com',
        name: 'Arun Kumar (Voluntary Donor)',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        role: 'donor',
        phone: '+91 98765 43211',
        city: 'Coimbatore',
        area: 'Gandhipuram',
        isProfileCompleted: true,
      },
      {
        googleId: 'test_google_donor_2',
        email: 'donor.priya@example.com',
        name: 'Priya Sharma (Voluntary Donor)',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        role: 'donor',
        phone: '+91 98765 43212',
        city: 'Coimbatore',
        area: 'RS Puram',
        isProfileCompleted: true,
      },
      {
        googleId: 'test_google_donor_3',
        email: 'donor.suresh@example.com',
        name: 'Suresh Raina (Voluntary Donor)',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        role: 'donor',
        phone: '+91 98765 43213',
        city: 'Coimbatore',
        area: 'Peelamedu',
        isProfileCompleted: true,
      },
      {
        googleId: 'test_google_requester_1',
        email: 'requester.karthik@example.com',
        name: 'Karthik Raja (Requester)',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
        role: 'requester',
        phone: '+91 98765 43214',
        city: 'Coimbatore',
        area: 'Peelamedu',
        isProfileCompleted: true,
      },
    ]);

    console.log(`👤 Created ${users.length} users (Primary Admin: dharshang317@gmail.com).`);

    const admin = users[0];
    const donor1 = users[1];
    const donor2 = users[2];
    const donor3 = users[3];
    const requester = users[4];

    // 2. Create Donor Profiles
    const donorProfiles = await DonorProfile.create([
      {
        userId: admin._id,
        bloodGroup: 'O+',
        isAvailable: true,
        lastDonationDate: new Date('2025-10-10'),
        preferredContactMethod: 'phone',
        city: 'Coimbatore',
        area: 'Gandhipuram',
        location: {
          type: 'Point',
          coordinates: [76.9634, 11.0168],
        },
        totalDonations: 6,
      },
      {
        userId: donor1._id,
        bloodGroup: 'O+',
        isAvailable: true,
        lastDonationDate: new Date('2025-10-15'),
        preferredContactMethod: 'phone',
        city: 'Coimbatore',
        area: 'Gandhipuram',
        location: {
          type: 'Point',
          coordinates: [76.9634, 11.0168],
        },
        totalDonations: 4,
      },
      {
        userId: donor2._id,
        bloodGroup: 'A+',
        isAvailable: true,
        lastDonationDate: new Date('2025-11-20'),
        preferredContactMethod: 'in_app',
        city: 'Coimbatore',
        area: 'RS Puram',
        location: {
          type: 'Point',
          coordinates: [76.9458, 11.0084],
        },
        totalDonations: 2,
      },
      {
        userId: donor3._id,
        bloodGroup: 'O-',
        isAvailable: true,
        lastDonationDate: new Date('2025-08-12'),
        preferredContactMethod: 'phone',
        city: 'Coimbatore',
        area: 'Peelamedu',
        location: {
          type: 'Point',
          coordinates: [77.0012, 11.0254],
        },
        totalDonations: 8,
      },
    ]);

    console.log(`🩸 Created ${donorProfiles.length} donor profiles.`);

    // 3. Create Sample Blood Requests
    const bloodRequests = await BloodRequest.create([
      {
        requesterId: requester._id,
        patientName: 'Meena Sundaram',
        bloodGroup: 'O+',
        unitsRequired: 2,
        hospitalName: 'KMCH Hospital',
        city: 'Coimbatore',
        area: 'Avinashi Road',
        location: {
          type: 'Point',
          coordinates: [77.0392, 11.0487],
        },
        requiredDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        urgency: 'high',
        status: 'MATCHED',
        additionalNotes: 'Scheduled cardiac surgery. Cross-match requested at blood bank reception.',
      },
      {
        requesterId: requester._id,
        patientName: 'Rajesh Kumar',
        bloodGroup: 'A+',
        unitsRequired: 1,
        hospitalName: 'Ganga Medical Center',
        city: 'Coimbatore',
        area: 'Ram Nagar',
        location: {
          type: 'Point',
          coordinates: [76.9582, 11.0182],
        },
        requiredDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
        urgency: 'normal',
        status: 'OPEN',
        additionalNotes: 'Elective orthopedic replacement procedure.',
      },
    ]);

    console.log(`📋 Created ${bloodRequests.length} blood requests.`);

    // 4. Create Sample Report
    await Report.create({
      reporterId: requester._id,
      reportedUserId: donor1._id,
      reason: 'suspicious_activity',
      category: 'MISLEADING_INFO',
      description: 'Minor test report: Donor changed phone contact details during inquiry.',
      status: 'PENDING',
    });

    console.log('🚨 Created sample moderation safety report.');

    console.log('====================================================');
    console.log('✅ Dataset seeded successfully into MongoDB Atlas!');
    console.log('👑 Primary Admin: dharshang317@gmail.com (Role: admin)');
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
