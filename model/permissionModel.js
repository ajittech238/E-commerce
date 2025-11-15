import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  resource: {
    type: String,
    required: true // e.g., 'users', 'products', 'orders'
  },
  actions: [{
    type: String,
    enum: ['create', 'read', 'update', 'delete', 'list']
  }],
  description: String
}, {
  timestamps: true
});

export default mongoose.model('Permission', permissionSchema);
