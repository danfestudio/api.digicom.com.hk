const Preference = require('./preference.model')
const mongoose = require('mongoose')
const { parseFilters, sendResponse, sendSuccessResponse, sendErrorResponse } = require('../../helpers/responseHelper')
const upload = require('../../upload/upload')
const httpStatus = require('http-status')

const removePublicFromUrl = dest => {
  return dest.replace('public', '')
}

const removeSpacesFromFilename = filename => {
  return filename.replace(/\s/g, '') // This will remove all spaces from the filename
}

// @route POST preference/
// @desc create preference
exports.addPreference = async (req, res) => {
  try {
    const existingPreference = await Preference.findOne({})
    let preference
    if (existingPreference) {
      preference = await Preference.findByIdAndUpdate(existingPreference._id, { $set: { ...req.body } }, { new: true })
    } else {
      preference = await Preference.create({ ...req.body })
    }
    return sendSuccessResponse(res, httpStatus.OK, 'Preference created', preference)
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to add preference', null, error.message)
  }
}

// @route POST preference/create-navbar/
// @desc create navbar
exports.createNavbar = async (req, res) => {
  try {
    const existingPreference = await Preference.findOne({})
    let navbar_id = req.body.id.toLowerCase()
    req.body.id = navbar_id
    let preference
    if (existingPreference) {
      preference = await Preference.findByIdAndUpdate(existingPreference._id, { $set: { navbar: req.body } }, { new: true })
    } else {
      preference = await Preference.create({ navbar: req.body })
    }
    return sendSuccessResponse(res, httpStatus.OK, 'Navbar created', preference)
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create navbar', null, error.message)
  }
}

// @route GET preference/
// @desc get all prefernce
exports.getAllPreferences = async (req, res) => {
  try {
    const preference = await Preference.findOne({}).lean()
    return sendSuccessResponse(res, httpStatus.OK, 'Preference fetched successfully', preference)
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch preference', null, error.message)
  }
}

// @route GET preference/:id
// @desc get all prefernce
exports.getPreferenceId = async (req, res) => {
  try {
    const prefernce = await Preference.findById(req.params.id).lean()
    return sendSuccessResponse(res, httpStatus.OK, 'Preference fetched successfully', prefernce)
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch preference', null, error.message)
  }
}

// @route PUT preference/update-navbar/:id
// @desc update navbar
exports.updateNavbar = async (req, res) => {
  try {
    let navabar_id = req.body.id.toLowerCase()
    const checkExists = await Preference.find({
      'navbar._id': req.params.id,
      'navbar.name': req.body.name,
      'navbar.id': navabar_id,
    }).lean()

    let data
    if (checkExists.length > 0) {
      return res.json({ success: false, message: 'Navabar component already exists' })
    } else {
      data = await Preference.findOneAndUpdate(
        { 'navbar._id': req.params.id },
        {
          $set: {
            'navbar.$.name': req.body.name,
            'navbar.$.id': navabar_id,
            'navbar.$.is_active': req.body.is_active,
          },
        },
        { new: true }
      )
    }
    return sendSuccessResponse(res, httpStatus.OK, 'Navbar updated', data)
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update navbar', null, error.message)
  }
}

// @route POST /preference/social-media/:id
// @desc Add or update social media
// @route PUT /preference/social-media/:id
// @desc Add or update social media
exports.addOrUpdateSocialMedia = async (req, res) => {
  try {
    upload.single('icon')(req, res, async () => {
      if (req.file) {
        let value = req.file
        let fileUrl = value ? `${removePublicFromUrl(value.destination)}/${removeSpacesFromFilename(value.filename)}` : ''
        req.body.image = fileUrl
      } else {
        delete req.body.image
      }
      const preferenceId = req.params.id
      const socialMediaName = req.body.name

      // Check if social media with the same name exists in the preference document
      const existingSocialMedia = await Preference.findOne({
        _id: preferenceId,
        'socialMedia.name': socialMediaName,
      })

      if (existingSocialMedia) {
        // Update the existing social media within the preference document
        const updatedPreference = await Preference.findOneAndUpdate(
          {
            _id: preferenceId,
            'socialMedia.name': socialMediaName,
          },
          {
            $set: {
              'socialMedia.$.name': req.body.name,
              'socialMedia.$.icon': req.body.icon,
              'socialMedia.$.link': req.body.link,
            },
          },
          { new: true }
        )
        return sendSuccessResponse(res, httpStatus.OK, 'Social Media updated', updatedPreference)
      } else {
        // Add a new social media to the preference document
        const preference = await Preference.findById(preferenceId)

        if (!preference) {
          return res.status.json({ success: false, message: 'Preference not found' })
        }

        preference.socialMedia.push(req.body)
        await preference.save()

        return sendSuccessResponse(res, httpStatus.OK, 'Social Media added', preference)
      }
    })
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to add or update social media', null, error.message)
  }
}

// @route DELETE preference/delete-social-media/:id
// @desc delete social media
exports.deleteSocialMedia = async (req, res) => {
  try {
    const social_media = await Preference.findOne({
      'socialMedia._id': req.params.id,
    })
    if (!social_media) {
      return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Preference not found')
    }
    const index = social_media.socialMedia.findIndex(value => value._id.toString() === req.params.id)
    if (index === -1) {
      return sendErrorResponse(res, httpStatus.NOT_FOUND, 'Social Media entry not found')
    }

    // Remove the social media entry from the social_media's array
    social_media.socialMedia.splice(index, 1)

    await social_media.save()
    return sendSuccessResponse(res, httpStatus.OK, 'Social Media deleted')
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete social media', null, error.message)
  }
}

// @route DELETE preference/:id
// @desc delete preference
exports.deletePreference = async (req, res) => {
  try {
    const preference = await Preference.findByIdAndDelete(req.params.id)
    return sendSuccessResponse(res, httpStatus.OK, 'Preference deleted', preference)
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete preference', null, error.message)
  }
}
