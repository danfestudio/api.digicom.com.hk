const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: { type: String, required: true },
  image: { type: Schema.Types.ObjectId, ref: 'Media' },
  parentCategory: { type: Schema.Types.ObjectId, ref: 'Category' },
  slug: { type: String, unique: true },
  order: { type: Number },
  is_deleted: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true },
  show_in_nav: { type: Boolean, default: false },
  children: [{ type: Schema.Types.ObjectId, ref: 'Category' }]
});

async function populateChildren(categoryId) {
  const category = await Category.findById(categoryId)
    .select('_id name image order slug is_active children show_in_nav')
    .populate([
      {
      path: 'children',
      match: { is_active: true, is_deleted: false },
      select: '_id name image order slug is_active children show_in_nav',
      options: { sort: { order: 1 } },
      populate: {
        path: 'image'
      }
    },
    {
      path: 'image'
    }
    ])
    .lean();
    if (category && category.children) {
      await Promise.all(
        category.children.map(async (child) => {
          child.children = await populateChildren(child._id);
        })
        );
      }

  return category.children;
}

CategorySchema.statics.getCategoryHierarchy = async (searchQuery) => {
  try {
    searchQuery = {
      ...searchQuery,
      parentCategory: null
    };
    const hierarchy = await Category.find(searchQuery)
      .select('_id name image slug order is_active children show_in_nav')
      .populate({
        path: 'image'
      })
      .sort({ order: 1 })
      .lean();

    await Promise.all(
      hierarchy.map(async (category) => {
        category.children = await populateChildren(category._id);
      })
    );

    return hierarchy;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching all children.');
  }
};

CategorySchema.virtual('childrens', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory',
  justOne: false,
  options: {
    match: {
      is_active: true,
      is_deleted: false
    },
    sort: {
      order: 1
    }
  }
  // async get() {
  //   try {
  //     // Use a recursive function to populate all children
  //     console.log("this", this)
  //     // const populateChildren = async (categoryId) => {
  //     //   const category = await this.model('Category')
  //     //   .findById(categoryId)
  //     //   .populate({
  //     //     path:'children',
  //     //     populate: {
  //     //       path: 'childrens',
  //     //     }
  //     //   });

  //     //   console.log("category", category)
  //     //   return category.children;
  //     // };
  //     return this
  //     // return await populateChildren(this._id);
  //   } catch (error) {
  //     console.error(error);
  //     throw new Error('Error fetching all children.');
  //   }
  // },
});

CategorySchema.set('toObject', { virtuals: true });
CategorySchema.set('toJSON', { virtuals: true });

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;
