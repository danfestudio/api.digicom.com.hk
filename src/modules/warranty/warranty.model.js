const { boolean } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WarrantySchema = new Schema({
  continent: { type: String, required: true },
  country: { type: String, required: true },
  country_code: { type: String, required: true},
  warranty: { type: String, required: true },
  is_active: {type: Boolean, default: true},
  is_deleted: {type: Boolean, default: false}
});

module.exports = mongoose.model('Warranty', WarrantySchema);
