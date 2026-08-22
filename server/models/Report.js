import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reportedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    reportedRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      default: null,
    },
    reason: {
      type: String,
      default: 'suspicious_activity',
    },
    category: {
      type: String,
      default: 'COMMERCIAL_SELLING',
    },
    description: {
      type: String,
      required: [true, 'Please provide an explanatory description'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'],
      default: 'PENDING',
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
      default: '',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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

const Report = mongoose.model('Report', reportSchema);
export default Report;
