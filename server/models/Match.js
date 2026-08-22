import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      required: true,
      index: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    donorProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonorProfile',
      required: true,
    },
    matchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      index: true,
    },
    distanceKm: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['PENDING', 'REQUESTED', 'ACCEPTED', 'DECLINED', 'EXPIRED'],
      default: 'PENDING',
      index: true,
    },
    contactShared: {
      type: Boolean,
      default: false,
    },
    requestedAt: {
      type: Date,
      default: null,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
    donorResponseNotes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

matchSchema.index({ requestId: 1, donorId: 1 }, { unique: true });

const Match = mongoose.model('Match', matchSchema);
export default Match;
