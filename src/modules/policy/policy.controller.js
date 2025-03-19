const Joi = require("joi");
const { sendErrorResponse, sendSuccessResponse, parseFilters, sendResponse } = require("../../helpers/responseHelper");
const httpStatus = require("http-status");
const policyModel = require("./policy.model");

exports.addPolicy = async (req, res, next) => {
    try {
        const policy = await policyModel.create(req.body)
        return sendSuccessResponse(res, httpStatus.CREATED, 'Policy added', policy)
    } catch (error) {
        next(error);
    }
};

exports.getPolicies = async (req, res, next) => {
    try {
        let { page, limit, searchQuery, selectQuery, sortQuery, populate } = parseFilters(req);

        let contacts = await sendResponse(policyModel, page, limit, sortQuery, searchQuery, selectQuery, populate);
        return sendSuccessResponse(res, httpStatus.OK, 'All Policy', contacts);
    } catch (error) {
        next(error)
    }
}

exports.getPolicy = async (req, res, next) => {
    try {
        const policy = await policyModel.findById(req.params.id);
        return sendSuccessResponse(res, httpStatus.OK, 'Policy', policy);
    } catch (error) {
        next(error)
    }
}

exports.updatePolicy = async (req, res, next) => {
    try {
        await policyModel.findOneAndUpdate({
            _id: req.params.id
        }, req.body, { new: true });

        return sendSuccessResponse(res, httpStatus.OK, 'Policy Updated');
    } catch (error) {
        next(error)
    }
}

// exports.setActivePolicy = async (req, res, next) => {
//     try {
//         await policyModel.findOneAndUpdate({
//             _id: req.params.id
//         }, req.body, { new: true });

//         return sendSuccessResponse(res, httpStatus.OK, 'Policy Updated');
//     } catch (error) {
//         next(error)
//     }
// }

exports.deletePolicy = async (req, res, next) => {
    try {
        await policyModel.findOneAndUpdate({
            _id: req.params.id
        }, {
            // is_active: false,
            is_deleted: true
        });
        return sendSuccessResponse(res, httpStatus.OK, 'Policy Deleted');
    } catch (error) {
        next(error);
    }
};