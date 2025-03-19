const httpStatus = require("http-status");
const Joi = require("joi");
const { sendErrorResponse, sendSuccessResponse, parseFilters, sendResponse } = require("../../helpers/responseHelper");
const roleModel = require("./role.model");

const roleJoiSchema = Joi.object({
    name: Joi.string().required(),
    permissions: Joi.array().optional()
});

const permissionJoiSchema = Joi.object({
    permissions: Joi.array().required(),
});


exports.addPermission = async (req, res, next) => {
    try {
        // Validate data
        const { error } = permissionJoiSchema.validate(req.body);
        if (error) {
            return sendErrorResponse(res, httpStatus.BAD_REQUEST, error.details[0].message);
        }

        const checkRole = await roleModel.findOne({ _id: req.params.id });
        if (!checkRole) {
            return sendErrorResponse(res, httpStatus.CONFLICT, 'Role Not Exists');
        }

        let permissions = checkRole.permissions
        permissions = permissions.concat(req.body.permissions)
        checkRole.permissions = permissions
        console.log("checkRole", checkRole)
        await checkRole.save()
        return sendSuccessResponse(res, httpStatus.OK, 'Permission added', checkRole);
    } catch (error) {
        next(error);
    }
};

exports.addRole = async (req, res, next) => {
    try {
        // Validate data
        const { error } = roleJoiSchema.validate(req.body);
        if (error) {
            return sendErrorResponse(res, httpStatus.BAD_REQUEST, error.details[0].message);
        }

        const checkRole = await roleModel.findOne({ name: req.body.name }).lean();
        if (checkRole) {
            return sendErrorResponse(res, httpStatus.CONFLICT, 'Role Already Exists');
        }

        const role = await roleModel.create(req.body);
        return sendSuccessResponse(res, httpStatus.CREATED, 'Roles added', role);
    } catch (error) {
        next(error);
    }
};

exports.getRoles = async (req, res, next) => {
    try {
        let { page, limit, searchQuery, selectQuery, sortQuery, populate } = parseFilters(req);

        if (req.query.name) {
            searchQuery = {
                ...searchQuery,
                name: { $regex: req.query.name, $options: 'i' }
            };
        }

        let roles = await sendResponse(roleModel, page, limit, sortQuery, searchQuery, selectQuery, populate);

        return sendSuccessResponse(res, httpStatus.OK, 'All Role', roles);
    } catch (error) {
        next(error);
    }
};

exports.getRole = async (req, res, next) => {
    try {
        const role = await roleModel.findOne({
            _id: req.params.id,
            is_deleted: false
        });
        return sendSuccessResponse(res, httpStatus.OK, 'Role', role);
    } catch (error) {
        next(error);
    }
};

exports.updateRole = async (req, res, next) => {
    try {
        //check Duplicates
        const is_duplicate = await roleModel.findOne({
            name: req.body.name,
            _id: { $ne: req.params.id }
        });

        if (is_duplicate) {
            return sendErrorResponse(res, httpStatus.CONFLICT, `Role Already Exist`);
        }

        const role = await roleModel.findOneAndUpdate({
            _id: req.params.id
        }, req.body, { new: true });

        return sendSuccessResponse(res, httpStatus.OK, 'Role Updated', role);
    } catch (error) {
        next(error);
    }
};

exports.deleteRole = async (req, res, next) => {
    try {
        await roleModel.findOneAndUpdate({
            _id: req.params.id
        }, {
            // is_active: false,
            is_deleted: true
        });
        return sendSuccessResponse(res, httpStatus.OK, 'Role Deleted');
    } catch (error) {
        next(error);
    }
};