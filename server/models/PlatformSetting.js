import mongoose from 'mongoose';

const platformSettingSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: 'RakthaLink AI',
    },
    tagline: {
      type: String,
      default: 'Connecting Blood. Connecting Lives.',
    },
    announcementBanner: {
      type: String,
      default: 'Welcome to RakthaLink AI — Connecting voluntary blood donors with urgent patient requirements.',
    },
    isAnnouncementActive: {
      type: Boolean,
      default: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    emergencyContactPhone: {
      type: String,
      default: '+91 104', // National Blood Emergency Helpline in India
    },
    supportedCities: {
      type: [String],
      default: ['Coimbatore', 'Chennai', 'Bangalore', 'Madurai', 'Trichy', 'Salem', 'Kochi', 'Hyderabad', 'Mumbai', 'Delhi'],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const PlatformSetting = mongoose.model('PlatformSetting', platformSettingSchema);

export default PlatformSetting;
