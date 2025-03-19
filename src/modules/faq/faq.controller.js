const FAQ = require('./faq.model')
const upload = require('../../upload/upload')
const mongoose = require('mongoose')
const { parseFilters, sendResponse, sendSuccessResponse, sendErrorResponse } = require('../../helpers/responseHelper')
const httpStatus = require('http-status')

const removePublicFromUrl = dest => {
  return dest.replace('public', '')
}

const removeSpacesFromFilename = filename => {
  return filename.replace(/\s/g, '') // This will remove all spaces from the filename
}

// @route POST faq/
// @desc add faq
exports.addFaq = async (req, res) => {
  try {
    const faq = await FAQ.create({ ...req.body })
    return sendSuccessResponse(res, httpStatus.OK, 'FAQ added successfully', faq)
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to add faq', null, error.message)
  }
}

// @route PUT faq/:id
// @desc update faq
exports.updateFaq = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
    return sendSuccessResponse(res, httpStatus.OK, 'FAQ updated successfully', faq)
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update faq', null, error.message)
  }
}

// @route GET faq/
// @desc get all faq
exports.getAllFaq = async (req, res, next) => {
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
    const faq = await sendResponse(FAQ, page, limit, sortQuery, searchQuery, selectQuery, populate, next)
    return sendSuccessResponse(res, httpStatus.OK, 'FAQ fetched successfully', faq)
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch faq', null, error.message)
  }
}

// @route GET faq/:id
// @desc get faq by ID
exports.getFaqById = async (req, res) => {
  try {
    const id = req.params.id
    const faq = await FAQ.findOne({_id: id, is_deleted: false}).select('-__v -updatedAt').lean()
    if (!faq) {
      return sendErrorResponse(res, httpStatus.NOT_FOUND, 'FAQ not found')
    }
    return sendSuccessResponse(res, httpStatus.OK, 'FAQ fetched successfully', faq)
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch faq', null, error.message)
  }
}

// @route DELETE faq/:id
// @desc delete faq by ID
exports.deleteFaq = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, { $set: { is_deleted: true } }, {new: true})
    if (!faq) {
      return sendErrorResponse(res, httpStatus.NOT_FOUND, 'FAQ not found')
    }
    return sendSuccessResponse(res, httpStatus.OK, 'FAQ deleted successfully', faq)
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete faq', null, error.message)
  }
}
