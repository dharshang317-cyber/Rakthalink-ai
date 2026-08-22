import mongoose from 'mongoose';

const aiConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sessionType: {
      type: String,
      enum: ['request_creation', 'general_qa', 'eligibility_info'],
      default: 'general_qa',
    },
    messages: [
      {
        sender: {
          type: String,
          enum: ['user', 'assistant'],
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        extractedData: {
          type: mongoose.Schema.Types.Mixed,
          default: null,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const AIConversation = mongoose.model('AIConversation', aiConversationSchema);
export default AIConversation;
