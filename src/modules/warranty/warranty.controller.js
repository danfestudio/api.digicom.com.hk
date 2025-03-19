const Joi = require("joi");
const { sendErrorResponse, sendSuccessResponse, parseFilters, sendResponse } = require("../../helpers/responseHelper");
const httpStatus = require("http-status");
const warrantyModel = require("./warranty.model");

const warrantyJoiSchema = Joi.object({
    continent: Joi.string().required(),
    country: Joi.string().required(),
    country_code: Joi.string().required(),
    warranty: Joi.string().required(),
});

exports.addWarranty = async (req, res, next) => {
    try {
        // Validate data
        const { error } = warrantyJoiSchema.validate(req.body);
        if (error) {
            return sendErrorResponse(res, httpStatus.BAD_REQUEST, error.details[0].message);
        }

        const checkWarrantyExists = await warrantyModel.findOne({ country: req.body.country }).lean();
        if (checkWarrantyExists) {
            return sendErrorResponse(res, httpStatus.CONFLICT, 'Warranty Already Exists');
        }

        const warranty = await warrantyModel.create(req.body)
        return sendSuccessResponse(res, httpStatus.CREATED, 'Warranty added', warranty)
    } catch (error) {
        next(error);
    }
};

exports.getWarranties = async (req, res, next) => {
    try {
        let { page, limit, searchQuery, selectQuery, sortQuery, populate } = parseFilters(req);

        if (req.query.country) {
            searchQuery = {
                ...searchQuery,
                country: { $regex: req.query.country, $options: 'i' }
            };
        }
        
        if (req.query.country_code) {
            searchQuery = {
                ...searchQuery,
                country_code: req.query.country_code
            };
        }
        
        if (req.query.continent) {
            searchQuery = {
                ...searchQuery,
                continent: req.query.continent
            };
        }

        const continents = await warrantyModel.distinct('continent',{is_active: true, is_deleted: false})

        let warranties = await sendResponse(warrantyModel, page, limit, sortQuery, searchQuery, selectQuery, populate);
        warranties.continents = continents
        return sendSuccessResponse(res, httpStatus.OK, 'All Warranty', warranties);
    } catch (error) {
        next(error)
    }
}

exports.getWarranty = async (req, res, next) => {
    try {
        const warranty = await warrantyModel.findOne({
            country_code: req.params.country_code,
            is_deleted: false
        });
        return sendSuccessResponse(res, httpStatus.OK, 'Warranty', warranty);
    } catch (error) {
        next(error)
    }
}

exports.updateWarranty = async (req, res, next) => {
    try {
        //check Duplicates
        const is_duplicate = await warrantyModel.findOne({
            country: req.body.country,
            _id: { $ne: req.params.id }
        });

        if (is_duplicate) {
            return sendErrorResponse(res, httpStatus.CONFLICT, `Warranty for country ${req.body.country} Already Exist`);
        }

        const warranties = await warrantyModel.findOneAndUpdate({
            _id: req.params.id
        }, req.body, { new: true });

        return sendSuccessResponse(res, httpStatus.OK, 'Warranty Updated', warranties);
    } catch (error) {
        next(error)
    }
}

exports.deleteWarranty = async (req, res, next) => {
    try {
        await warrantyModel.findOneAndUpdate({
            _id: req.params.id
        }, {
            // is_active: false,
            is_deleted: true
        });
        return sendSuccessResponse(res, httpStatus.OK, 'Warrantry Deleted');
    } catch (error) {
        next(error);
    }
};