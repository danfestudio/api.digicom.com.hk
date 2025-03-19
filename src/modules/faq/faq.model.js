const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const faqSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    is_deleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Faq', faqSchema);
