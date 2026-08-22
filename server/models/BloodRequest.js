import mongoose from 'mongoose';

const bloodRequestSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    bloodGroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      index: true,
    },
    unitsRequired: {
      type: Number,
      required: [true, 'Units required is mandatory'],
      min: [1, 'At least 1 unit of blood is required'],
      max: [20, 'Maximum 20 units per request'],
      default: 1,
    },
    hospitalName: {
      type: String,
      required: [true, 'Hospital or blood bank name is required'],
      trim: true,
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
    requiredDate: {
      type: Date,
      required: [true, 'Required date is mandatory'],
    },
    urgency: {
      type: String,
      enum: ['normal', 'high', 'urgent'],
      default: 'normal',
      index: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'MATCHED', 'ACCEPTED', 'IN_COORDINATION', 'RESOLVED', 'CANCELLED'],
      default: 'OPEN',
      index: true,
    },
    additionalNotes: {
      type: String,
      trim: true,
      default: '',
    },
    matchedDonorsCount: {
      type: Number,
      default: 0,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

bloodRequestSchema.index({ location: '2dsphere' });
bloodRequestSchema.index({ status: 1, bloodGroup: 1, city: 1, urgency: 1 });

const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);
export default BloodRequest;
