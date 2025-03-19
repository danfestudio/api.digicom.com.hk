const Joi = require("joi");
const { sendErrorResponse, sendSuccessResponse, sendResponse, parseFilters } = require("../../helpers/responseHelper");
const httpStatus = require("http-status");
const FeatureProduct = require("./featureProduct.model");
const { getProducts } = require("../product/product.controller");

const featureProductJoiSchema = Joi.object({
    feature_name: Joi.string().required(),
    products: Joi.array().optional(),
});

const getOrder = async () => {
    const res = await FeatureProduct.find({ is_deleted: false }).select('order').sort({ order: -1 }).limit(1);
    return res[0];
};

exports.addFeatureCategory = async (req, res, next) => {
    try {
        const { error } = featureProductJoiSchema.validate(req.body);
        if (error) {
            return sendErrorResponse(res, httpStatus.BAD_REQUEST, error.message);
        }

        const checkFeatureProduct = await FeatureProduct.findOne({
            feature_name: req.body.feature_name,
            is_deleted: false
        });

        if (checkFeatureProduct) {
            return sendErrorResponse(res, httpStatus.CONFLICT, `${req.body.feature_name} feature name already taken.`);
        }

        const order = await getOrder();
        req.body.order = order.order ? order.order + 1 : 1;

        const data = await FeatureProduct.create(req.body);

        return sendSuccessResponse(res, httpStatus.OK, "Featured Product Added", data);
    } catch (error) {
        next(error);
    }
};

exports.getFeatureProducts = async (req, res, next) => {
    try {
        let { page, limit, searchQuery, selectQuery, sortQuery, populate } = parseFilters(req);
        populate = {
            path: 'products.product',
            select: '-__v -is_deleted',
            match: { is_active: true },
            populate: [
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
            ]
        };
        sortQuery = {
            order: 1
        };
        searchQuery = {
            ...searchQuery,
            feature_name: { $ne: "722eb324-1ce5-4200-862f-0dd0894a3568" }
        };
        if (req.query.search) {
            searchQuery = {
                ...searchQuery,
                feature_name: { $regex: req.query.search, $options: 'i' }
            };
        }
        if (req.query.is_active) {
            searchQuery = {
                ...searchQuery,
                is_active: req.query.is_active
            };
        }
        selectQuery = {
            __v: 0,
            is_deleted: 0
        };
        console.log("searc", searchQuery);
        const products = await sendResponse(FeatureProduct, page, limit, sortQuery, searchQuery, selectQuery, populate);

        const data = await Promise.all(products.data.map(value => {
            value.products = value.products.length;
            return value;
        }));

        return sendSuccessResponse(res, httpStatus.OK, "Featured Product", { data, totalCount: products.count, totalPage: products.totalPage });
    } catch (error) {
        next(error);
    }
};

exports.getFeatureProduct = async (req, res, next) => {
    try {
        let {
            page = 1, limit = 10, is_active
        } = req.query;

        let checkFeatureProduct = await FeatureProduct.findById(req.params.id)
            .select('-__v -is_deleted')
            .populate({
                path: 'products.product',
                match: { is_active: true },
                select: '-__v -is_deleted',
                populate: [
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
                ]
            });

        if (!checkFeatureProduct) {
            return sendErrorResponse(res, httpStatus.CONFLICT, `Featured Products Not Found`);
        }

        checkFeatureProduct = checkFeatureProduct.toJSON();
        checkFeatureProduct.productCount = checkFeatureProduct.products.length;
        if (is_active) {
            checkFeatureProduct.products = checkFeatureProduct.products.filter(value => is_active === `${value.is_active}`);
        }
        checkFeatureProduct.products = checkFeatureProduct.products.slice((page - 1) * limit, page * limit);

        return sendSuccessResponse(res, httpStatus.OK, "Featured Product", checkFeatureProduct);
    } catch (error) {
        next(error);
    }
};

const checkDuplicate = async (featuredProducts, checkProducts) => {
    let flag = false;
    for (let i of checkProducts) {
        if (featuredProducts.findIndex(ele => ele.product.toString() === i.product) > -1) {
            flag = true;
            break;
        }
    }
    // checkProducts.map(value=>{
    //     value
    // })

    return flag;
};

exports.addProducts = async (req, res, next) => {
    try {
        const checkFeatureProduct = await FeatureProduct.findById(req.params.id);

        if (!checkFeatureProduct) {
            return sendErrorResponse(res, httpStatus.NOT_FOUND, `Featured Products Not Found`);
        }

        //check duplication
        const _checkDuplicate = await checkDuplicate(checkFeatureProduct.products, req.body.products);
        console.log(
            _checkDuplicate
        );
        if (_checkDuplicate) {
            return sendErrorResponse(res, httpStatus.CONFLICT, 'One or more than one products already exist');
        }
        checkFeatureProduct.products = checkFeatureProduct.products.concat(req.body.products);

        await checkFeatureProduct.save();
        return sendSuccessResponse(res, httpStatus.OK, "Featured Product Added", checkFeatureProduct);
    } catch (error) {
        next(error);
    }
};

exports.removeProducts = async (req, res, next) => {
    try {
        const checkFeatureProduct = await FeatureProduct.findById(req.params.id);

        if (!checkFeatureProduct) {
            return sendErrorResponse(res, httpStatus.CONFLICT, `Featured Products Not Found`);
        }

        checkFeatureProduct.products.splice(req.body.index, 1);
        await checkFeatureProduct.save();

        return sendSuccessResponse(res, httpStatus.OK, "Featured Product Removed", checkFeatureProduct);
    } catch (error) {
        next(error);
    }
};

const shiftElement = async (products, element, index) => {
    console.log(products, element);
    const findindex = await products.findIndex(ele => ele.product == element);
    if (findindex === -1) {
        return products;
    }

    const updateElement = await products.splice(findindex, 1);
    console.log(updateElement);
    await products.splice(index, 0, updateElement[0]);

    return products;
};

//update product order
exports.updateProductOrder = async (req, res, next) => {
    try {
        const { product, index } = req.body;
        //get featured_product
        const featuredProduct = await FeatureProduct.findById(req.params.id).select('feature_name products is_active');

        if (!featuredProduct) {
            return sendErrorResponse(res, httpStatus.NOT_FOUND, "Featured Product Module Not Found");
        }

        const products = await shiftElement(featuredProduct.products, product, index);

        featuredProduct.products = products;
        await featuredProduct.save();

        return sendSuccessResponse(res, httpStatus.OK, "Updated Product Order");
    } catch (error) {
        next(error);
    }
};

//update product order
exports.updateFeaturedCategoryOrder = async (req, res, next) => {
    try {
        const { order } = req.body;
        //get featured_product
        const featuredProduct = await FeatureProduct.findById(req.params.id).select('feature_name order products is_active');

        if (!featuredProduct) {
            return sendErrorResponse(res, httpStatus.NOT_FOUND, "Featured Product Module Not Found");
        }

        const getMaxOrder = await getOrder();
        console.log(getMaxOrder);

        if ((featuredProduct.order === getMaxOrder.order && order === 1) || (featuredProduct.order === 1 && order === -1)) {
            return sendSuccessResponse(res, httpStatus.OK, "Updated Featured Order");
        }

        // }
        // const products = await shiftElement(featuredProduct.products, product, index);


        await FeatureProduct.findOneAndUpdate({ order: featuredProduct.order + order, is_deleted: false }, {
            $set: {
                order: featuredProduct.order
            }
        }, { new: true });

        featuredProduct.order = featuredProduct.order + order;
        await featuredProduct.save();

        return sendSuccessResponse(res, httpStatus.OK, "Updated Featured Order");
    } catch (error) {
        next(error);
    }
};


// Active/Inactive
exports.setProductStatus = async (req, res, next) => {
    try {
        const { product, is_active } = req.body;

        const featuredProduct = await FeatureProduct.findById(req.params.id).select('feature_name products is_active');

        if (!featuredProduct) {
            return sendErrorResponse(res, httpStatus.NOT_FOUND, "Featured Product Module Not Found");
        }

        //find index
        console.log(product, featuredProduct.products);
        const findindex = featuredProduct.products.findIndex(ele => ele.product == product);
        featuredProduct.products[findindex].is_active = is_active;

        await featuredProduct.save();

        return sendSuccessResponse(res, httpStatus.OK, "Updated active Status of the featured product", featuredProduct);
    } catch (error) {
        next(error);
    }
};


exports.updateFeaturedCategory = async (req, res, next) => {
    try {
        const featuredProduct = await FeatureProduct.findById(req.params.id).select('feature_name products is_active');

        if (!featuredProduct) {
            return sendErrorResponse(res, httpStatus.NOT_FOUND, "Featured Product Module Not Found");
        }

        await FeatureProduct.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        });

        return sendSuccessResponse(res, httpStatus.OK, "Updated Feature Category");
    } catch (error) {
        next(error);
    }
};

exports.deleteFeaturedCategory = async (req, res, next) => {
    try {
        const featuredProduct = await FeatureProduct.findById(req.params.id).select('feature_name products is_active is_deleted');
        featuredProduct.is_deleted = true;
        await featuredProduct.save();
        return sendSuccessResponse(res, httpStatus.OK, "Feature Category Deleted");
    } catch (error) {
        next(error);
    }
};

exports.getLatestProduct = async (req, res, next) => {
    try {
        let {
            page = 1, limit = 10, is_active, is_admin
        } = req.query;

        let searchQuery = {
            feature_name: "722eb324-1ce5-4200-862f-0dd0894a3568"
        }

        if(is_admin){
            searchQuery = {
                ...searchQuery
            }
        }else{
            searchQuery = {
                ...searchQuery,
                is_active: true
            }
        }
        
        let checkFeatureProduct = await FeatureProduct.findOne(searchQuery)
            .select('-__v -is_deleted')
            .populate({
                path: 'products.product',
                match: { is_active: true },
                select: '-__v -is_deleted',
                populate: [
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
                ]
            });

        if (!checkFeatureProduct) {
            await getProducts(req, res, next)
        }

        checkFeatureProduct = checkFeatureProduct.toJSON();
        checkFeatureProduct.productCount = checkFeatureProduct.products.length;
        if (is_active) {
            checkFeatureProduct.products = checkFeatureProduct.products.filter(value => is_active === `${value.is_active}`);
        }
        checkFeatureProduct.products = checkFeatureProduct.products.slice((page - 1) * limit, page * limit);

        return sendSuccessResponse(res, httpStatus.OK, "Featured Product", checkFeatureProduct);
    } catch (error) {
        next(error);
    }
};

exports.updateProducts;