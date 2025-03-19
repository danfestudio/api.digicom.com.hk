const Joi = require("joi");
const { sendErrorResponse, sendSuccessResponse, parseFilters, sendResponse } = require("../../helpers/responseHelper");
const httpStatus = require("http-status");
const stayInTouchModel = require("./stayInTouch.model");

// const warrantyJoiSchema = Joi.object({
//     continent: Joi.string().required(),
//     country: Joi.string().required(),
//     country_code: Joi.string().required(),
//     stayInTouch: Joi.string().required(),
// });

exports.addContact = async (req, res, next) => {
    try {
        const checkWarrantyExists = await stayInTouchModel.findOne({ email: req.body.email }).lean();
        if (!checkWarrantyExists) {
           await stayInTouchModel.create(req.body)
            // return sendErrorResponse(res, httpStatus.CONFLICT, 'Contact Already Exists');
        }

        // const stayInTouch = await stayInTouchModel.create(req.body)
        return sendSuccessResponse(res, httpStatus.CREATED, 'Contact added', { email: req.body.email })
    } catch (error) {
        next(error);
    }
};

exports.getContacts = async (req, res, next) => {
    try {
        let { page, limit, searchQuery, selectQuery, sortQuery, populate } = parseFilters(req);

        let contacts = await sendResponse(stayInTouchModel, page, limit, sortQuery, searchQuery, selectQuery, populate);
        return sendSuccessResponse(res, httpStatus.OK, 'All Contact', contacts);
    } catch (error) {
        next(error)
    }
}

// exports.getContacts = async (req, res, next) => {
//     try {
//         const stayInTouch = await stayInTouchModel.findById(req.params.id);
//         return sendSuccessResponse(res, httpStatus.OK, 'Contact', stayInTouch);
//     } catch (error) {
//         next(error)
//     }
// }

// exports.updateWarranty = async (req, res, next) => {
//     try {
//         //check Duplicates
//         const is_duplicate = await stayInTouchModel.findOne({
//             country: req.body.country,
//             _id: { $ne: req.params.id }
//         });

//         if (is_duplicate) {
//             return sendErrorResponse(res, httpStatus.CONFLICT, `Contact for country ${req.body.country} Already Exist`);
//         }

//         const warranties = await stayInTouchModel.findOneAndUpdate({
//             _id: req.params.id
//         }, req.body, { new: true });

//         return sendSuccessResponse(res, httpStatus.OK, 'Contact Updated', warranties);
//     } catch (error) {
//         next(error)
//     }
// }

exports.deleteContact = async (req, res, next) => {
    try {
        await stayInTouchModel.findOneAndUpdate({
            _id: req.params.id
        }, {
            // is_active: false,
            is_deleted: true
        });
        return sendSuccessResponse(res, httpStatus.OK, 'Contact Deleted');
    } catch (error) {
        next(error);
    }
};