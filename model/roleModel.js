import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  description: String
}, {
  timestamps: true
});

export default mongoose.model('Role', roleSchema);
