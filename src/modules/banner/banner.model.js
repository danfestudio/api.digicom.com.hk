const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bannerSchema = new Schema(
  {
    banner_name: {
      type: String
    },
    banner_style: {
      type: [Schema.Types.Mixed]
    },
    link: {
      for: {
        type: String, enum: ['product', 'category']
      },
      value: {
        type: String
      }
    },
    order: {
      type: Number, default: 0
    },
    is_deleted: { type: Boolean, default: false },
    is_active: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', bannerSchema);
