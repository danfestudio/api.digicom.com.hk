const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = new Schema(
  {
    fullname: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    is_deleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contact', contactSchema);
