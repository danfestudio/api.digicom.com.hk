const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PageStyleSchema = new Schema({
  style_name: { type: String, required: true },
  theme: {
    type: [Schema.Types.Mixed]
  },
  image: {
    type: String
  },
  product: {
    type: Schema.Types.ObjectId, ref: "Product"
  },
  is_deleted: {
    type: Boolean, default: false
  }
});

module.exports = mongoose.model('PageStyle', PageStyleSchema);