import mongoose from 'mongoose';

const donorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    bloodGroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      index: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastDonationDate: {
      type: Date,
      default: null,
    },
    preferredContactMethod: {
      type: String,
      enum: ['phone', 'email', 'in_app'],
      default: 'in_app',
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    area: {
      type: String,
      trim: true,
      default: '',
    },
    // GeoJSON Point for geodesic distance calculations
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    totalDonations: {
      type: Number,
      default: 0,
      min: 0,
    },
    donationNotes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index on location coordinates for geospatial matching queries
donorProfileSchema.index({ location: '2dsphere' });
donorProfileSchema.index({ bloodGroup: 1, isAvailable: 1, city: 1 });

const DonorProfile = mongoose.model('DonorProfile', donorProfileSchema);
export default DonorProfile;
