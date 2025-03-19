const Contact = require('./contact.model')
const { parseFilters, sendResponse, sendSuccessResponse, sendErrorResponse } = require('../../helpers/responseHelper')
const httpStatus = require('http-status')

// @route POST contact/
// @desc add contact
exports.addContact = async (req, res) => {
  try {
    const contact = await Contact.create({ ...req.body })
    return sendSuccessResponse(res, httpStatus.OK, 'Contact added successfully', contact)
    // res.status(200).json({ success: true, data: contact });
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to add contact', null, error.message)
  }
}

// @route GET contact/
// @desc get all contacts
exports.getAllContacts = async (req, res, next) => {
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
    const contact = await sendResponse(Contact, page, limit, sortQuery, searchQuery, selectQuery, populate, next)
    return sendSuccessResponse(res, httpStatus.OK, 'Contact fetched successfully', contact)
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch contact', null, error.message)
  }
}

// @route GET contact/:id
// @desc get contact by ID
exports.getContactById = async (req, res) => {
  try {
    const contactId = req.params.id
    const contact = await Contact.findById(contactId).select('-__v -updatedAt').lean()
    if (!contact) {
      return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Contact not found')
    }
    return sendSuccessResponse(res, httpStatus.OK, 'Contact fetched successfully', contact)
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch contact', null, error.message)
  }
}

// @route DELETE contact/:id
// @desc delete contact by ID
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, { $set: { is_deleted: true } })
    if (!contact) {
      return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Contact not found')
    }
    return sendSuccessResponse(res, httpStatus.OK, 'Contact deleted successfully', contact)
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete contact', null, error.message)
  }
}
