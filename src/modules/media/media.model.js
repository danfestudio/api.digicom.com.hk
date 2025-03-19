const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MediaSchema = new Schema({
    folder: {
        type: Schema.Types.ObjectId, ref: "Folder"
    },
    name: {
        type: String
    },
    file_details: {
        type: Schema.Types.Mixed
    },
    path: {
        type: String
    },
    is_active: {
        type: Boolean, default: true
    },
    is_deleted: {
        type: Boolean, default: false
    }
}, { timestamps: true });

MediaSchema.options.toJSON = {
    transform: (doc, ret) => {
        delete ret.__v;
    }
};

module.exports = mongoose.model('Media', MediaSchema);