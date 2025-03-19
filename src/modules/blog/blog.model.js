const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

const blogSchema = new Schema(
  {
    image: { type: Schema.Types.ObjectId, ref: 'Media' },
    title: { type: String, required: true },
    content: { type: String, required: true },
    description: { type: String, required: true },
    author: { type: String },
    blog_slug: { type: String, unique: true, index: true, slug: 'title' },
    is_deleted: { type: Boolean, default: false },
    is_featured: { type: Boolean, default: false } //TODO: featured blog send it to preferences
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);
