import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    default: () => 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  engine: {
    provider: { type: String, default: 'local' },
    model: { type: String, default: 'aara-local-v1' },
    isRealAI: { type: Boolean, default: false },
    isFallback: { type: Boolean, default: true }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ConversationSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)
    },
    title: {
      type: String,
      default: 'New Conversation'
    },
    mode: {
      type: String,
      enum: ['assistant', 'coding', 'interview', 'english'],
      default: 'assistant'
    },
    messages: [MessageSchema]
  },
  {
    timestamps: true
  }
);

export const Conversation = mongoose.model('Conversation', ConversationSchema);
export default Conversation;
