

// @route POST user/register

const httpStatus = require("http-status");
const { sendSuccessResponse, sendErrorResponse, parseFilters, sendResponse } = require("../../helpers/responseHelper");
const productModel = require("./product.model");
const Joi = require("joi");
const Category = require("../category/category.model");
const featureProductModel = require("../featureProduct/featureProduct.model");
const Mongoose = require("mongoose");

const productJoiSchema = Joi.object({
    product_name: Joi.string().required(),
    category: Joi.string().required(),
    front_image: Joi.string().required(),
    product_warranty: Joi.string().required(),
    serial_number: Joi.string().required(),
    user_guide: Joi.string().optional(),
    // product_page_ui: Joi.string().required(),
    specs: Joi.array().items(
        Joi.object({
            main_title: Joi.string().required(),
            content: Joi.array().required()
        })
    )
});

const skuGenerator = async (productName) => {
    const formattedName = productName.replace(/[0-9+\-*\/@$#%&!^`~{}\[\]()<>]/g, ' ').replace(/\s+/g, '_'); // Replace spaces with underscores
    console.log(formattedName);
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    const sku = formattedName.toLowerCase() + '_' + randomNum;
    const checkSKU = await productModel.findOne({
        product_sku: sku,
        is_deleted: false,
    });
    if (checkSKU) await this.skuGenerator(productName);

    return sku;
};

exports.addProduct = async (req, res, next) => {
    try {

        const { error } = productJoiSchema.validate(req.body);

        if (error) {
            return sendErrorResponse(res, httpStatus.BAD_REQUEST, error.message);
        }
        //check Duplicates
        const is_duplicate = await productModel.findOne({
            product_name: req.body.product_name,
            serial_number: req.body.serial_number
        });

        if (is_duplicate) {
            return sendErrorResponse(res, httpStatus.CONFLICT, 'Product Already Exist');
        }

        //generate product_sku
        req.body.product_sku = await skuGenerator(req.body.product_name);

        const product = await productModel.create(req.body);
        return sendSuccessResponse(res, httpStatus.OK, 'Product Added', product);
    } catch (error) {
        console.log("err", error);
        next(error);
    }
};
async function getCategoryIds(ids, categoryId) {
    ids.push(categoryId);
    const category = await Category.findById(categoryId)
        .select('_id name image order is_active children show_in_nav')
        .populate({
            path: 'children',
            match: { is_active: true, is_deleted: false },
            select: '_id name image order is_active children show_in_nav',
            options: { sort: { order: 1 } }
        })
        .lean();

    if (category && category.children) {
        await Promise.all(
            category.children.map(async (child) => {
                child.children = await getCategoryIds(ids, child._id);
            })
        );
    }

    return ids;
}
exports.getProducts = async (req, res, next) => {
    try {
        let { page, limit, searchQuery, selectQuery, sortQuery, populate } = parseFilters(req);
        populate = [
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
        ];
        if (req.query.search) {
            searchQuery = {
                ...searchQuery,
                product_name: { $regex: req.query.search, $options: 'i' }
            };
        }
        if (req.query.is_active !== undefined && req.query.is_active !== null && req.query.is_active !== "") {
            searchQuery = {
                ...searchQuery,
                is_active: req.query.is_active
            };
        }
        let category;
        if (req.query.category) {
            let ids = [];
            category = await Category.findOne({ slug: req.query.category })
                .select('_id name image order is_active children show_in_nav')
                .populate({
                    path: 'children',
                    match: { is_active: true, is_deleted: false },
                    select: '_id name image order is_active children show_in_nav',
                    options: { sort: { order: 1 } }
                })
                .lean();
            ids = await getCategoryIds(ids, category._id);
            searchQuery = {
                ...searchQuery,
                category: { $in: ids }
            };
        }

        const products = await sendResponse(productModel, page, limit, sortQuery, searchQuery, selectQuery, populate);
        products.category = category;
        return sendSuccessResponse(res, httpStatus.OK, 'All Products', products);
    } catch (error) {
        next(error);
    }
};

exports.updateProducts = async (req, res, next) => {
    try {
        //check Duplicates
        const is_duplicate = await productModel.findOne({
            product_name: req.body.product_name,
            _id: { $ne: req.params.id }
        });

        if (is_duplicate) {
            return sendErrorResponse(res, httpStatus.CONFLICT, `Product ${req.body.product_name} Already Exist`);
        }
        //get product
        const checkProduct = await productModel.findById(req.params.id);
        //generate product_sku
        if (req.body.product_sku && checkProduct && checkProduct.product_name !== req.body.product_sku) {
            req.body.product_sku = await skuGenerator(req.body.product_name);
        }

        const product = await productModel.findOneAndUpdate({
            _id: req.params.id
        }, req.body, { new: true });
        return sendSuccessResponse(res, httpStatus.OK, 'Product Updated', product);
    } catch (error) {
        next(error);
    }
};

exports.deleteProduct = async (req, res, next) => {
    try {
        await productModel.findOneAndUpdate({
            _id: req.params.id
        }, {
            // is_active: false,
            is_deleted: true
        });

        this.deleteFeaturedProduct(req.params.id);

        return sendSuccessResponse(res, httpStatus.OK, 'Product Deleted');
    } catch (error) {
        next(error);
    }
};

exports.deleteFeaturedProduct = async (product_id) => {
    try {
        const getFeaturedProducts = await featureProductModel.find({
            "products.product": product_id
        });
        await Promise.all(getFeaturedProducts.map(async value => {
            console.log("before", value);
            value.products = value.products.filter(_value =>
                !_value.product.equals(new Mongoose.Types.ObjectId(product_id))
            );
            console.log("after", value);
            await value.save();
        }));
    } catch (error) {
        console.log(error);
        next(error);
    }
};

exports.userGuide = async (req, res, next) => {
    try {
        let { page, limit, searchQuery, selectQuery, sortQuery, populate } = parseFilters(req);

        populate = [
            {
                path: 'user_guide',
                select: 'path file_details'
            },
            {
                path: 'category',
                select: 'name image'
            }
        ];

        searchQuery = {
            ...searchQuery,
            user_guide: {$ne: null}
        }

        selectQuery = 'product_name category user_guide';
        if (req.query.search) {
            searchQuery = {
                ...searchQuery,
                product_name: { $regex: req.query.search, $options: 'i' }
            };
        }
        const products = await sendResponse(productModel, page, limit, sortQuery, searchQuery, selectQuery, populate);
        return sendSuccessResponse(res, httpStatus.OK, 'All Products', products);
    } catch (error) {
        next(error);
    }
};

exports.search = async (req, res, next) => {
    try {
        let { page, limit, searchQuery, selectQuery, sortQuery, populate } = parseFilters(req);
        searchQuery = {
            ...searchQuery,
            $or: [{ is_active: true }, { is_active: null }]
        };
        populate = [
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
        ];
        selectQuery = '-__v -is_deleted -is_active';
        if (!req.params.search) {
            return sendSuccessResponse(res, httpStatus.OK, 'Searched Products', []);
        }
        const productSearch = {
            ...searchQuery,
            product_name: { $regex: req.params.search, $options: 'i' }
        };
        const categorySearch = {
            ...searchQuery,
            name: { $regex: req.params.search, $options: 'i' }
        };
        // let products = await productModel.find({
        //     product_name: { $regex: searchParams, $options: 'i' }
        // })
        console.log(productSearch);
        const categories = await Category.find(categorySearch).select(selectQuery);
        const products = await productModel.find(productSearch).select(selectQuery);
        return sendSuccessResponse(res, httpStatus.OK, 'Searched Products', { products, categories });
    } catch (error) {
        next(error);
    }
};