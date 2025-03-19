const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SupportSchema = new Schema(
    {
        continent: { type: String, required: true },
        country: { type: String, required: true },
        country_code: { type: String, required: true },
        support_time: { type: String, required: true },
        phone: { type: String },
        email: { type: String },
        is_active: { type: Boolean, default: true },
        is_deleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Support', SupportSchema);
