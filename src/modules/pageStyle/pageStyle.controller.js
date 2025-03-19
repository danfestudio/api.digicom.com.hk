

// @route POST user/register

const httpStatus = require("http-status");
const { sendSuccessResponse, sendErrorResponse, parseFilters, sendResponse } = require("../../helpers/responseHelper");
const pageStyleModel = require("./pageStyle.model");
const Joi = require("joi");
const productModel = require("../product/product.model");
const { default: mongoose } = require("mongoose");
const upload = require("../../upload/upload");


const pageStypeJoiSchema = Joi.object({
    style_name: Joi.string().required(),
    theme: Joi.array().required()
});

const defaultStyleJoiSchema = Joi.object({
    style_name: Joi.string().required(),
    theme: Joi.required()
});

exports.addUpdateProductPageStyle = async (req, res, next) => {
    try {
        const { error } = await pageStypeJoiSchema.validate(req.body);
        if (error) {
            return sendErrorResponse(res, httpStatus.BAD_REQUEST, error.message);
        }

        const product = await productModel.findOne({ product_sku: req.params.product_sku });
        if (!product) {
            return sendErrorResponse(res, httpStatus.NOT_FOUND, "Product Not Found");
        }

        //check style if exists
        let pageStyleCheck = await pageStyleModel.findOne({
            product: product._id,
        });

        req.body.product = product._id;
        if (!pageStyleCheck) {
            await pageStyleModel.create(req.body);
        } else {
            pageStyleCheck.style_name = req.body.style_name;
            pageStyleCheck.theme = req.body.theme;
            await pageStyleCheck.save();
        }

        return sendSuccessResponse(res, httpStatus.OK, 'Product Page Style Updates', pageStyleCheck);
    } catch (error) {
        next(error);
    }
};

exports.addUpdateDefaultStyle = async (req, res, next) => {
    upload.single('image')(req, res, async error => {
        if (error) {
            return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Error during file upload');
        }
        try {
            const { error } = await defaultStyleJoiSchema.validate(req.body);
            if (error) {
                return sendErrorResponse(res, httpStatus.BAD_REQUEST, error.message);
            }

            req.body.image = req.file.path.split('uploads')[1];
                
            //check style if exists
            // let pageStyleCheck = await pageStyleModel.findById(
            let pageStyleCheck = await pageStyleModel.findOne({
                style_name: req.body.style_name
            });

            if (pageStyleCheck) {
                return sendErrorResponse(res, httpStatus.CONFLICT, 'Style Name Already Exists');
            }

            if (req.query._id) {
                pageStyleCheck = await pageStyleModel.findOne(
                    req.query._id);
            }

            req.body.theme = typeof req.body.theme === 'string' ? JSON.parse(req.body.theme) : req.body.theme;
            if (!pageStyleCheck) {
                await pageStyleModel.create(req.body);
            } else {
                pageStyleCheck.style_name = req.body.style_name;
                pageStyleCheck.theme = req.body.theme;
                await pageStyleCheck.save();
            }

            return sendSuccessResponse(res, httpStatus.OK, 'Default Page Style', pageStyleCheck);
        } catch (error) {
            next(error);
        }
    });
};

exports.getProductPageStyles = async (req, res, next) => {
    try {
        let { page, limit, searchQuery, selectQuery, sortQuery, populate } = parseFilters(req);
        const products = await sendResponse(pageStyleModel, page, limit, sortQuery, searchQuery, selectQuery, populate);
        return sendSuccessResponse(res, httpStatus.OK, 'All Products', products);
    } catch (error) {
        next(error);
    }
};

exports.getDefaultStyle = async (req, res, next) => {
    try {
        let { page, limit, searchQuery, selectQuery, sortQuery, populate } = parseFilters(req);
        searchQuery = {
            ...searchQuery,
            product: {
                $eq: null
            }
        };
        const defaultStyle = await sendResponse(pageStyleModel, page, limit, sortQuery, searchQuery, selectQuery, populate);
        return sendSuccessResponse(res, httpStatus.OK, 'Default Style', defaultStyle);
    } catch (error) {
        next(error);
    }
};

exports.getProductPageStyle = async (req, res, next) => {
    try {
        const product = await productModel.findOne({ product_sku: req.params.product_sku }).select('-is_deleted -__v').populate([
            {
                path: 'front_image',
                select: 'path file_details'
            },
            {
                path: 'user_guide',
                select: 'path file_details'
            },
            {
                path: 'category',
                select: 'name image'
            }
        ]);
        if (!product) {
            return sendErrorResponse(res, httpStatus.NOT_FOUND, "Product Not Found");
        }

        let pageStyle = await pageStyleModel.findOne({
            product: product._id
        });
        if (!pageStyle) pageStyle = {};
        pageStyle.product = product;
        return sendSuccessResponse(res, httpStatus.OK, "Product Page Style", pageStyle);
    } catch (error) {
        next(error);
    }
};

exports.deleteStyle = async (req, res, next) => {
    try {
        await pageStyleModel.findOneAndUpdate({
            _id: req.params.id
        }, {
            // is_active: false,
            is_deleted: true
        });
        return sendSuccessResponse(res, httpStatus.OK, 'Page Style Deleted');
    } catch (error) {
        next(error);
    }
};