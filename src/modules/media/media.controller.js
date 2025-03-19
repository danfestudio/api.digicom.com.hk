const Joi = require("joi");
const { sendErrorResponse, sendSuccessResponse, parseFilters, sendResponse } = require("../../helpers/responseHelper");
const httpStatus = require("http-status");
const Folder = require("./folder.model");
const upload = require("../../upload/upload");
const Media = require("./media.model");


const folderSchemaValidation = Joi.object({
    folder_name: Joi.string().required(),
    folder: Joi.string().optional()
});

exports.addFolder = async (req, res, next) => {
    try {
        const { error } = folderSchemaValidation.validate(req.body);

        if (error) {
            return sendErrorResponse(res, httpStatus.BAD_REQUEST, error.message);
        }

        const folder = await Folder.findOne({ folder_name: req.body.folder_name });

        if (folder) {
            return sendErrorResponse(res, httpStatus.CONFLICT, `Folder ${req.body.folder_name} is Already Exists.`);
        }

        const result = await Folder.create(req.body);

        return sendSuccessResponse(res, httpStatus.OK, "Folder Added", result);

    } catch (error) {
        next(error);
    }
};
let counter = 0;
exports.getFoldersPath = async (parentfolder, path, next) => {
    try {
        // console.log("counter", counter)
        counter++;
        const parentFolder = await Folder.findOne({ _id: parentfolder, is_active: true, is_deleted: false });

        if (!parentFolder) {
            return path;
        }

        console.log("path", path);
        //folder path
        path.unshift({ _id: parentFolder._id, name: parentFolder.folder_name });

        if (!parentFolder.folder) return path;

        await this.getFoldersPath(parentFolder.folder, path, next);

    } catch (error) {
        next(error);
    }
};

exports.getInsideFolder = async (req, res, next) => {
    try {
        let {limit, page, selectQuery, searchQuery, populate, sortQuery} = parseFilters(req);
        let query = { folder: null, is_active: true, is_deleted: false };
        if (req.query.folder) {
            query = {
                ...query,
                folder: req.query.folder
            };
        }

        let path = [];

        if (req.query.folder) {
            await this.getFoldersPath(req.query.folder, path, next);
        }

        const folder = await Folder.find(query);

        const media = await Media.find(query);
        // const result = await sendResponse(Media, page, limit, sortQuery, query, selectQuery, populate);
        // const media = result.data
        // const count = result.count
        // const totalPage = result.totalPage

        return sendSuccessResponse(res, httpStatus.OK, "Folders", { path, folder, media });

    } catch (error) {
        next(error);
    }
};

exports.updateFolder = async (req, res, next) => {
    try {
        const folder = await Folder.findById(req.params.id);
        if (!folder) {
            return sendErrorResponse(res, httpStatus.NOT_FOUND, "Folder Not Found");
        }

        const { error } = folderSchemaValidation.validate(req.body);

        if (error) {
            return sendErrorResponse(res, httpStatus.BAD_REQUEST, error.message);
        }

        const updatedFolder = await Folder.findByIdAndUpdate(req.params.id, req.body, { new: true });

        return sendSuccessResponse(res, httpStatus.OK, "Folder Updated", updatedFolder
        );
    } catch (error) {
        next(error);
    }
};

exports.deleteFolder = async (req, res, next) => {
    try {
        const folder = await Folder.findById(req.params.id);
        if (!folder) {
            return sendErrorResponse(res, httpStatus.NOT_FOUND, "Folder Not Found");
        }

        folder.is_deleted = true;
        await folder.save();

        return sendSuccessResponse(res, httpStatus.OK, "Folder Deleted");
    } catch (error) {
        next(error);
    }
};

/********* media upload **********/
exports.addFiles = async (req, res, next) => {
    try {
        let check_folder;
        upload.array('files', 10)(req, res, async error => {

            if (error) {
                return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Error during file upload');
            }
            try {
                if (req.body.folder) {
                    check_folder = await Folder.findOne({
                        _id: req.body.folder,
                        is_active: true,
                        is_deleted: false
                    });
                    if (!check_folder) {
                        return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Folder Not Found');
                    }
                }

                const files = req.files;
                for (i of files) {
                    console.log("i", i);
                    const name = i.originalname;
                    const path = i.path.split('uploads')[1];
                    const body = {
                        name,
                        path,
                        file_details: i,
                        folder: req.body.folder
                    };
                    await Media.create(body);
                }
                return sendSuccessResponse(res, httpStatus.OK, 'Media Upload Success.');
            } catch (error) {
                next(error);
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteFile = async (req, res, next) => {
    try {
        const file = await Media.findOne({ _id: req.params.id, is_deleted: false });
        if (!file) {
            return sendErrorResponse(res, httpStatus.NOT_FOUND, "File Not Found");
        }

        file.is_deleted = true;
        await file.save();

        return sendSuccessResponse(res, httpStatus.OK, "File Deleted");
    } catch (error) {
        next(error);
    }
};

