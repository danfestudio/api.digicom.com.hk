const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoleSchema = new Schema(
    {
        name: { type: String, required: true },
        permissions: { type: [String], enum: ['create', 'read', 'update', 'delete'] },
        is_active: { type: Boolean, default: true },
        is_deleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// const PermissionSchma = new Schema({
//     name: { type: String },
//     // modules: {},
//     is_active: { type: Boolean, default: true },
//     is_deleted: { type: Boolean, default: false },
// });

module.exports = mongoose.model('Roles', RoleSchema);
// module.exports = mongoose.model('Permission', PermissionSchma);
