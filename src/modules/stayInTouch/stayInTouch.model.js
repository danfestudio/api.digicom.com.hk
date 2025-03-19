const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StayInTouchSchema = new Schema({
  email: { type: String, required: true },
  is_active: {type: Boolean, default: true},
  is_deleted: {type: Boolean, default: false}
});

module.exports = mongoose.model('StayInTouch', StayInTouchSchema);
