const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  product_name: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  product_sku: { type: String, required: false },
  front_image: { type: Schema.Types.ObjectId, ref: 'Media' },
  is_deleted: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true },
  product_warranty: { type: String },
  serial_number: { type: String },
  user_guide: {
    type: Schema.Types.ObjectId, ref: 'Media'
  },
  // product_page_ui: {
  //   type: Schema.Types.ObjectId, ref: 'PageStyle'
  // },
  specs: [{
    main_title: { type: String },
    content: [{
      subtitle: {
        type: String
      },
      items: {
        type: [String]
      }
    }]
  }]
});

module.exports = mongoose.model('Product', ProductSchema);
