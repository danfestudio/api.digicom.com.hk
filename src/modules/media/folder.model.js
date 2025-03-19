const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FolderSchema = new Schema({
  folder_name: { type: String, required: true, unique: true },
  folder: {
    type: Schema.Types.ObjectId, ref: "Folder"
  },
  is_active: {
    type: Boolean, default: true
  },
  is_deleted: {
    type: Boolean, default: false
  }
}, { timestamps: true });

FolderSchema.options.toJSON = {
  transform: (doc, ret) =>{
    delete ret.__v
  }
}

module.exports = mongoose.model('Folder', FolderSchema);