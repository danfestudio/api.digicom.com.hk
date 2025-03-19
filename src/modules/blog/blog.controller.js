const Blog = require('./blog.model');
const upload = require('../../upload/upload');
const { parseFilters, sendResponse, sendSuccessResponse, sendErrorResponse } = require('../../helpers/responseHelper');
const httpStatus = require('http-status');
const Joi = require('joi');

const blogJoiSchema = Joi.object({
  image: Joi.string().required(),
  title: Joi.string().required(),
  content: Joi.string().required(),
  description: Joi.string().required(),
  author: Joi.string().optional(),
});

// @route POST blog/
// @desc add blog
exports.addBlog = async (req, res) => {
  try {
    const { error } = blogJoiSchema.validate(req.body);

    if (error) {
      sendErrorResponse(res, httpStatus.BAD_REQUEST, 'Failed to add blog', {}, error.message);
    }

    const blog = await Blog.create({ ...req.body });
    return sendSuccessResponse(res, httpStatus.OK, 'Blog Added', blog);
    // })
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to add blog', error.message);
  }
};

// @route PUT blog/:id
// @desc update blog by ID
exports.updateBlog = async (req, res) => {
  try {
    const { error } = blogJoiSchema.validate(req.body);

    // if(error){
    //   sendErrorResponse(res, httpStatus.BAD_REQUEST, 'Failed to add blog',{}, error.message)
    // }

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedBlog) {
      return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Blog not found');
    }
    return sendSuccessResponse(res, httpStatus.OK, 'Blog Updated', updatedBlog);
    // })
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update blog', error.message);
  }
};

// @route PUT blog/change-status/:id
// @desc change blog feature status
exports.changeFeatureStatus = async (req, res) => {
  try {
    const checkBlog = await Blog.findById(req.params.id);
    if (!checkBlog) {
      res.json({
        success: false,
        message: 'Blog not found',
        // error: error.message
      });
    }
    const blog = await Blog.findByIdAndUpdate(req.params.id, { $set: { is_featured: req.body.status } }, { new: true });
    return sendSuccessResponse(res, httpStatus.OK, 'Blog feature status changed', blog);
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to change blog status', error.message);
  }
};

// @route PUT event/remove-image/:id
// @desc remove image from document
// exports.removeImage = async (req, res) => {
//   try {
//     const image = await Blog.findByIdAndUpdate(req.params.id, { $set: { image: '' } })
//     return sendSuccessResponse(res, httpStatus.OK, 'Image Removed', image)
//   } catch (error) {
//     return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to remove image', error.message)
//   }
// }

// @route GET blog/
// @desc get all blogs
exports.getAllBlogs = async (req, res, next) => {
  try {
    let { page, limit, selectQuery, searchQuery, sortQuery, populate } = parseFilters(req);
    searchQuery = { is_deleted: false };
    populate = [
      {
        path: 'image',
        select: 'path'
      }
    ];
    if (req.query.search) {
      searchQuery = {
        title: {
          $regex: req.query.search,
          $options: 'i',
        },
        ...searchQuery,
      };
    }
    const randomBlogs = await Blog.aggregate([{ $match: { is_deleted: false } }, { $sample: { size: 5 } }, {
      $lookup: {
        from: 'media',
        localField: 'image',
        foreignField: '_id',
        as: 'image'
      }
    },
    {
      $unwind: {
        'path': '$image'
      }
    }
    ]);
    const blogs = await sendResponse(Blog, page, limit, sortQuery, searchQuery, selectQuery, populate, next);
    return sendSuccessResponse(res, httpStatus.OK, 'Blog fetched', { blogs, randomBlogs });
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch blog', error.message);
  }
};

// @route GET blog/featured-blog
// @desc get all featured blogs
exports.getFeaturedBlog = async (req, res) => {
  try {
    const blogs = await Blog.find({
      is_deleted: false,
      is_featured: true,
    }).populate({
      path: 'image',
      select: 'path'
    });
    return sendSuccessResponse(res, httpStatus.OK, 'Blog fetched', blogs);
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch featured blog', error.message);
  }
};

// @route GET blog/:id
// @desc get blog by ID
exports.getBlogById = async (req, res) => {
  try {
    const blogId = req.params.id;
    const blog = await Blog.findById(blogId).select('-__v -is_deleted -updatedAt').populate({
      path: 'image',
      select: 'path'
    }).lean();
    if (!blog) {
      return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Blog not found');
    }
    return sendSuccessResponse(res, httpStatus.OK, 'Blog fetched', blog);
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch blog', error.message);
  }
};

// @route GET blog/:blog_slug
// @desc get blog by blog slug
exports.getBlogBySlug = async (req, res) => {
  try {
    const blog_slug = req.params.blog_slug;
    const blog = await Blog.findOne({ blog_slug: blog_slug, is_deleted: false }).select('-__v -is_deleted -updatedAt').populate({
      path: 'image',
      select: 'path'
    }).lean();
    if (!blog) {
      return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Blog not found');
    }
    return sendSuccessResponse(res, httpStatus.OK, 'Blog fetched', blog);
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch blog', error.message);
  }
};

// @route DELETE blog/:id
// @desc delete blog by ID
exports.deleteBlog = async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndUpdate(req.params.id, { $set: { is_deleted: true } });
    if (!deletedBlog) {
      return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Blog not found');
    }
    return sendSuccessResponse(res, httpStatus.OK, 'Blog Deleted');
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete blog', error.message);
  }
};
