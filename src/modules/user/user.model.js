const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true },
    hash: { type: String, required: true },
    contact: { type: Number },
    address: { type: String },
    role: {
      type: String, enum: ['admin', 'superadmin'], default: 'admin'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
