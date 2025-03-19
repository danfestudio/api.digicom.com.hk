const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const preferenceSchema = new Schema(
  {
    navbar: [
      {
        id: String,
        name: String
      }
    ],
    font: { type: String },
    primaryColor: { type: String },
    secondaryColor: { type: String },
    primaryBackground: { type: String },
    secondaryBackground: { type: String },
    banner: [{ type: Schema.Types.ObjectId, ref: 'Banner' }],
    preferences: [{ type: Schema.Types.ObjectId, ref: 'Blog' }],
    socialMedia: [
      {
        icon: String,
        name: String,
        link: String
      }
    ],
    privacyPolicy: { type: String },
    userGuides: { type: String },
    warrantyPolicy: { type: String },
    faq: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Preference', preferenceSchema);
