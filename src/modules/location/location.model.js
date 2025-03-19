const mongoose = require('mongoose')
const Schema = mongoose.Schema

const locationSchema = new Schema(
  {
    branch_address: { type: String, required: true },
    branch_contact: { type: String, required: true },
    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Location', locationSchema)
