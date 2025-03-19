const Location = require('./location.model')
const upload = require('../../upload/upload')
const mongoose = require('mongoose')
const { parseFilters, sendResponse, sendErrorResponse, sendSuccessResponse } = require('../../helpers/responseHelper')
const httpStatus = require('http-status')

// @route POST faq/
// @desc add faq
exports.addLocation = async (req, res, next) => {
  try {
    const existingLocation = await Location.findOne({ branch_address: req.body.branch_address, is_deleted: false })
    if (existingLocation) {
      return sendErrorResponse(res, httpStatus.CONFLICT, 'Location already exists')
    }
    const location = await Location.create({ ...req.body })
    return sendSuccessResponse(res, httpStatus.OK, 'Location added successfully', location)
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to add location', null, error.message)
  }
}

// @route PUT faq/:id
// @desc update faq
exports.updateLocation = async (req, res, next) => {
  try {
    const location = await Location.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
    return sendSuccessResponse(res, httpStatus.OK, 'Location updated successfully', location)
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update location', null, error.message)
  }
}

// @route GET faq/
// @desc get all faq
exports.getAllLocation = async (req, res, next) => {
  try {
    let { page, limit, selectQuery, searchQuery, sortQuery, populate } = parseFilters(req)

    searchQuery = { is_deleted: false }
    if (req.query.search) {
      searchQuery = {
        fullname: {
          $regex: req.query.search,
          $options: 'i',
        },
        ...searchQuery,
      }
    }
    const location = await sendResponse(Location, page, limit, sortQuery, searchQuery, selectQuery, populate, next)
    return sendSuccessResponse(res, httpStatus.OK, 'Location fetched successfully', location)
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch location', null, error.message)
  }
}

// @route DELETE faq/:id
// @desc delete faq by ID
exports.deleteLocation = async (req, res, next) => {
  try {
    const location = await Location.findByIdAndUpdate(req.params.id, { $set: { is_deleted: true } })
    if (!location) {
      return res.json({
        success: false,
        message: 'FAQ not found',
      })
    }
    return sendSuccessResponse(res, httpStatus.OK, 'Location deleted successfully', location)
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete location', null, error.message)
  }
}
