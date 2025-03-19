const httpStatus = require("http-status");
const Joi = require("joi");
const { sendErrorResponse, sendSuccessResponse, parseFilters, sendResponse } = require("../../helpers/responseHelper");
const supportModel = require("./support.model");

const supportJoiSchema = Joi.object({
    continent: Joi.string().required(),
    country: Joi.string().required(),
    country_code: Joi.string().required(),
    support_time: Joi.string().required(),
    phone: Joi.string().optional(),
    email: Joi.string().email().optional(),
});

exports.addSupport = async (req, res, next) => {
    try {
        // Validate data
        const { error } = supportJoiSchema.validate(req.body);
        if (error) {
            return sendErrorResponse(res, httpStatus.BAD_REQUEST, error.details[0].message);
        }

        const checkSupport = await supportModel.findOne({ country: req.body.country }).lean();
        if (checkSupport) {
            return sendErrorResponse(res, httpStatus.CONFLICT, 'Support Already Exists');
        }

        const support = await supportModel.create(req.body);
        return sendSuccessResponse(res, httpStatus.CREATED, 'Support added', support);
    } catch (error) {
        next(error);
    }
};

exports.getSupports = async (req, res, next) => {
    try {
        let { page, limit, searchQuery, selectQuery, sortQuery, populate } = parseFilters(req);

        if (req.query.country_code) {
            searchQuery = {
                ...searchQuery,
                country_code: { $regex: req.query.country_code, $options: 'i' }
            };
        }
        if (req.query.country) {
            searchQuery = {
                ...searchQuery,
                country: { $regex: req.query.country, $options: 'i' }
            };
        }

        if (req.query.continent) {
            searchQuery = {
                ...searchQuery,
                continent: req.query.continent
            };
        }

        const continents = await supportModel.distinct('continent',{is_active: true, is_deleted: false})

        let supports = await sendResponse(supportModel, page, limit, sortQuery, searchQuery, selectQuery, populate);
        
        supports.continents = continents

        return sendSuccessResponse(res, httpStatus.OK, 'All Support', supports);
    } catch (error) {
        next(error);
    }
};

exports.getSupport = async (req, res, next) => {
    try {
        const support = await supportModel.findOne({
            country_code: req.params.country_code,
            is_deleted: false
        });
        return sendSuccessResponse(res, httpStatus.OK, 'Support', support);
    } catch (error) {
        next(error);
    }
};

exports.updateSupport = async (req, res, next) => {
    try {
        //check Duplicates
        const is_duplicate = await supportModel.findOne({
            country: req.body.country,
            _id: { $ne: req.params.id }
        });

        if (is_duplicate) {
            return sendErrorResponse(res, httpStatus.CONFLICT, `Support for country ${req.body.country} Already Exist`);
        }

        const supports = await supportModel.findOneAndUpdate({
            _id: req.params.id
        }, req.body, { new: true });

        return sendSuccessResponse(res, httpStatus.OK, 'Support Updated', supports);
    } catch (error) {
        next(error);
    }
};

exports.deleteSupport = async (req, res, next) => {
    try {
        await supportModel.findOneAndUpdate({
            _id: req.params.id
        }, {
            // is_active: false,
            is_deleted: true
        });
        return sendSuccessResponse(res, httpStatus.OK, 'Support Deleted');
    } catch (error) {
        next(error);
    }
};