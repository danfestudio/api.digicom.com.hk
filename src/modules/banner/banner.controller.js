const Banner = require('./banner.model');
const Product = require('../product/product.model');
const Preference = require('../preference/preference.model');
const upload = require('../../upload/upload');
const { parseFilters, sendResponse, sendErrorResponse, sendSuccessResponse } = require('../../helpers/responseHelper');
const httpStatus = require('http-status');
const Joi = require('joi');

const removePublicFromUrl = dest => {
  return dest.replace('public', '');
};

const removeSpacesFromFilename = filename => {
  return filename.replace(/\s/g, ''); // Remove all spaces from the filename
};

const bannerJoiSchema = Joi.object({
  banner_name: Joi.string().required(),
  banner_style: Joi.array().required(),
  link: Joi.object({
    for: Joi.string().optional(),
    value: Joi.string().optional()
  }).optional(),
  _id: Joi.string().optional()
});

const getOrder = async () => {
  const res = await Banner.find({ is_deleted: false }).select('order').sort({ order: -1 }).limit(1);
  return res[0];
};

// @route POST banner/
// @desc add banner
exports.addBanner = async (req, res) => {
  try {
    const { error } = await bannerJoiSchema.validate(req.body);
    if (error) {
      return sendErrorResponse(res, httpStatus.BAD_REQUEST, error.message);
    }

    let banner;
    if (req.body._id) {
      //check banner
      const checkBanner = await Banner.findOne({
        _id: req.body._id,
        is_deleted: false
      });
      if (!checkBanner) {
        return sendErrorResponse(res, httpStatus.CONFLICT, "Banner Not Found");
      }
      //check link value
      // if(req.body.link){
      //   // const checkValue 

      // }
      banner = await Banner.findByIdAndUpdate(checkBanner._id, req.body, { new: true });
    } else {
      //check banner
      const checkBanner = await Banner.findOne({
        banner_name: req.body.banner_name,
        is_deleted: false
      });
      if (checkBanner) {
        return sendErrorResponse(res, httpStatus.CONFLICT, "Banner Already Exist Not Found");
      }
      const order = await getOrder();
      
      req.body.order = order?.order ? order.order + 1 : 0;
      banner = await Banner.create(req.body);
    }

    return sendSuccessResponse(res, httpStatus.OK, 'Banner Added', banner);
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to add banner', error.message);
  }
};

exports.changeBannerOrder = async (req, res) => {
  try {
    const { order } = req.body;
    //get featured_product
    const banner = await Banner.findById(req.params.id).select('banner_name banner_style order is_active');

    if (!banner) {
      return sendErrorResponse(res, httpStatus.NOT_FOUND, "Banner Not Found");
    }

    const getMaxOrder = await getOrder();
    if(banner.order){
      if ((banner.order === getMaxOrder?.order && order === 1) || (banner.order === 1 && order === -1)) {
        return sendSuccessResponse(res, httpStatus.OK, "Updated Banner Order");
      }
  
      await Banner.findOneAndUpdate({ order: banner.order + order, is_deleted: false }, {
        $set: {
          order: banner.order
        }
      }, { new: true });
  
      banner.order = banner.order + order;
    }else{
      banner.order = getMaxOrder?.order  ? getMaxOrder.order + 1 : 1;
    }
    await banner.save();

    return sendSuccessResponse(res, httpStatus.OK, "Updated Banner Order");
  } catch (error) {
    next(error);
  }
};

// @route PUT banner/make-active/:id
// @desc change active status of banner
exports.changeBannerStatus = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, {
      $set: { is_active: req.body.is_active },
    });
    return sendSuccessResponse(res, httpStatus.OK, 'Banner Status Changed', banner);
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to change banner status ', error.message);
  }
};

// @route GET banner/
// @desc get all banners
exports.getAllBanners = async (req, res, next) => {
  try {
    let { page, limit, selectQuery, searchQuery, sortQuery, populate } = parseFilters(req);
    searchQuery = { is_deleted: false };
    sortQuery = { order: 1 };

    if (req.query.is_active) {
      searchQuery = {
        ...searchQuery,
        is_active: req.query.is_active
      };
    }
    if (req.query.search) {
      searchQuery = {
        banner_name: {
          $regex: req.query.search,
          $options: 'i',
        },
        ...searchQuery,
      };
    }

    const banners = await sendResponse(Banner, page, limit, sortQuery, searchQuery, selectQuery, populate, next);
    return sendSuccessResponse(res, httpStatus.OK, 'Banners fetched', banners);
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch banner', error.message);
  }
};

// @route GET banner/:id
// @desc get banner by ID
exports.getBannerById = async (req, res) => {
  try {
    const bannerId = req.params.id;
    const banner = await Banner.findOne({ _id: bannerId, is_deleted: false }).select('-__v -is_deleted -updatedAt').lean();
    if(banner.link && banner.link.value){
      //check category or product
      banner.link.value = await Product.findOne({
        product_sku: banner.link.value
      }).select('product_name product_sku')
    }
    return sendSuccessResponse(res, httpStatus.OK, 'Banner fetched', banner);
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch banner', error.message);
  }
};

// @route DELETE banner/:id
// @desc delete banner by ID
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, { $set: { is_deleted: true } });
    return sendSuccessResponse(res, httpStatus.OK, 'Banner Deleted', banner);
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete banner', error.message);
  }
};
