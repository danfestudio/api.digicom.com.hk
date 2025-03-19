const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const products = new Schema({
    product: {
        type: Schema.Types.ObjectId, ref: 'Product'
    },
    is_active: {
        type: Boolean, default: true
    }
})

const featureProductSchema = new Schema({
    feature_name: { type: String, required: true },
    products: {
        type: [products]
    },
    order: {
        type: Number, default: 0
    },
    is_active: { 
        type: Boolean, default: false
    },
    is_deleted: { type: Boolean, default: false },
});

module.exports = mongoose.model('FeatureProduct', featureProductSchema);
