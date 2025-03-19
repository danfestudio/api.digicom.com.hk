const Category = require('../category/category.model')
const httpStatus = require('http-status')
const multer = require('multer')
const { sendErrorResponse, sendSuccessResponse, getFileUrl } = require('../../helpers/responseHelper');
const Joi = require('joi');

const categoryJoiSchema = Joi.object({
  name: Joi.string().required(),
  parentCategoryId: Joi.string().optional(),
  image: Joi.string().empty().optional(),
  show_in_nav: Joi.string().optional(),
});

const slugGenerator = async (categoryName) => {
  const formattedName = categoryName.replace(/[0-9+\-*\/@$#%&!^`~{}\[\]()<>]/g, ' ').replace(/\s+/g, '_');// Replace spaces with underscores
  console.log(formattedName)
  const randomNum = Math.floor(Math.random() * 9000) + 1000
  const sku = formattedName.toLowerCase() + '_' + randomNum;
  const checkSKU = await Category.findOne({
      sku,
      is_deleted: false,
  });
  if (checkSKU) await this.skuGenerator(categoryName);

  return sku;
};

exports.addSlugInExistingCategory = async (req, res, next) => {
  try {
    //getExistingCategorywithoutSlug
    const categories = await Category.find({slug: {$exists: false}})
    //Add Slug
    for(let category of categories){
      category.slug = await slugGenerator(category.name)
      category.save()
    }
    return sendSuccessResponse(res, httpStatus.OK, 'Category Slug done', categories)
  } catch (error) {
    next(error)
  }
}
// @desc   Add a new category
// @route  POST /category/
exports.addCategory = async (req, res) => {
    try {
      const { error } = categoryJoiSchema.validate(req.body);

      if (error) {
          return sendErrorResponse(res, httpStatus.BAD_REQUEST, error.message);
      }
      // const imageUrl = await getFileUrl(req)
      let { name, parentCategoryId, order, image } = req.body
      const existingCategory = await Category.findOne({
        name,
        parentCategory: parentCategoryId,
        is_deleted: false,
      })

      if (existingCategory) {
        return sendErrorResponse(res, httpStatus.CONFLICT, 'Category name already exists')
      }

      if (!order) {
        const query = {
          is_deleted: false,
          parentCategory: parentCategoryId || { $eq: null },
        }
        const result = await Category.aggregate([
          {
            $match: {
              ...query,
            },
          },
          {
            $group: {
              _id: null,
              maxOrder: { $max: '$order' },
            },
          },
          {
            $project: {
              _id: 0,
            },
          },
        ])
        order = result.length ? result[0].maxOrder + 1 : 1
      }
      const slug = await slugGenerator(name);
      const categoryData = {
        name,
        order,
        parentCategory: parentCategoryId,
        image,
        slug
      }

      const category = await Category.create(categoryData)

      if (parentCategoryId) {
        const parentCategory = await Category.findOne({
          _id: parentCategoryId,
        })
        if (parentCategory !== null) {
          parentCategory.children.push(category._id)
          await parentCategory.save()
        }
      }

      return sendSuccessResponse(res, httpStatus.OK, 'Category Added', category)
    } catch (error) {
      return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to add category', error.message)
    }
}

// Update an existing category by ID
exports.updateCategory = async (req, res) => {
  try {
      // const { error } = categoryJoiSchema.validate(req.body);

      // if (error) {
      //     return sendErrorResponse(res, httpStatus.BAD_REQUEST, error.message);
      // }
      const category = await Category.findById(req.params.id)
      if (!category) {
        return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Category not found')
      }
      let slug
      if(req.body.name && req.body.name !== category.name){
        slug = await slugGenerator(req.body.name);
      }
      
      let {image, ...body} = {...req.body}
      if(image === ""){
        await Category.findByIdAndUpdate(req.params.id, {$unset: {image: ""}})
      }else{
        body.image = image
      }
      // const imageUrl = await getFileUrl(req)
      const updatedData = { ...body, slug
        // image: imageUrl 
      }
      console.log("updatedData", updatedData)
      const updatedCategory = await Category.findByIdAndUpdate(req.params.id, updatedData, {
        new: true,
      })

      return sendSuccessResponse(res, httpStatus.OK, 'Category updated', updatedCategory)
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update category', error.message)
  }
}

// Fetch all categories with a hierarchical structure
exports.getAllCategories = async (req, res) => {
  try {
    let searchQuery = {
      is_deleted: false
    }
    if(req.query.show_in_nav){
      searchQuery={
        ...searchQuery,
        show_in_nav: req.query.show_in_nav
      }
    }

    const hierarchy = await Category.getCategoryHierarchy(searchQuery)

    return sendSuccessResponse(res, httpStatus.OK, 'All categories fetched', hierarchy)
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch categories', error.message)
  }
}

exports.getCategoryById = async (req, res) => {
  try {
    let category = await Category.findById(req.params.id)
      .populate([{
        path: 'parentCategory',
        select: '_id name type',
        populate: { path: 'parentCategory', select: '_id name type' },
      },
      {
        path: 'image',
        select: '_id name path'
      }])
      .lean()

    if (!category) {
      return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Category not found')
    }

    return sendSuccessResponse(res, httpStatus.OK, 'Category fetched', category)
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch category', error.message)
  }
}

exports.getCategoryBySlug = async (req, res) => {
  try {
    let category = await Category.findOne({slug:req.params.slug})
      .populate([{
        path: 'parentCategory',
        select: '_id name type',
        populate: { path: 'parentCategory', select: '_id name type' },
      },
    {
      path: 'image',
      select: '_id name path'
    }])
      .lean()

    if (!category) {
      return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Category not found')
    }

    return sendSuccessResponse(res, httpStatus.OK, 'Category fetched', category)
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch category', error.message)
  }
}

exports.getCategoriesByType = async (req, res) => {
  try {
    const { type } = req.query

    if (!type || !['main', 'sub', 'sub-child'].includes(type)) {
      return sendErrorResponse(res, httpStatus.BAD_REQUEST, 'Invalid or missing category type')
    }

    const categories = await Category.find({ type: type, is_deleted: false }).populate('parentCategory').lean()

    return sendSuccessResponse(res, httpStatus.OK, 'Categories fetched successfully', categories)
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch categories', error.message)
  }
}

// Delete a category by ID
exports.deleteCategory = async (req, res) => {
  try {
    let category = await Category.findById(req.params.id)
    if (!category) {
      return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Category not found')
    }

    category.is_deleted = true
    await category.save()

    return sendSuccessResponse(res, httpStatus.OK, 'Category deleted')
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete category', error.message)
  }
}
