const User = require('../user/user.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Joi = require('joi')
const httpStatus = require('http-status')
const { sendErrorResponse, sendSuccessResponse } = require('../../helpers/responseHelper')

const userJoiSchema = Joi.object({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
  contact: Joi.number().required(),
  address: Joi.string().optional(),
  image: Joi.string().optional().allow(''),
})

// @route POST user/register
// @desc register new account
exports.register = async (req, res) => {
  try {
    // Validate user data
    const { error } = userJoiSchema.validate(req.body)
    if (error) {
      return sendErrorResponse(res, httpStatus.BAD_REQUEST, error.details[0].message)
    }

    const checkUserExists = await User.findOne({ email: req.body.email }).lean()
    if (checkUserExists) {
      return sendErrorResponse(res, httpStatus.CONFLICT, 'User Already Exists')
    }
    bcrypt.genSalt(10, async (error, salt) => {
      bcrypt.hash(req.body.password, salt, async (error, hash) => {
        const user = await User.create({ ...req.body, hash: hash })
        if (user) {
          return sendSuccessResponse(res, httpStatus.OK, 'Registration successful', user)
        } else {
          return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Registration Failed')
        }
      })
    })
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Registration Failed', null, error.message)
  }
}

// @route POST user/login
// @desc login to account
exports.login = async function (req, res) {
  try {
    const { email, password } = req.body
    const user = await User.findOne({
      email: email,
    })
      .select('-createdAt -updatedAt -__v')
      .lean()
    if (!user) {
      return sendErrorResponse(res, httpStatus.NOT_FOUND, 'User not found')
    }
    // check if password is valid
    const isPasswordValid = await bcrypt.compare(password, user.hash)
    if (!isPasswordValid) {
      return sendErrorResponse(res, httpStatus.BAD_REQUEST, `The password that you've entered is incorrect`)
    }

    // generate and send a JWT token for the authenticated user
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    delete user.hash
    return sendSuccessResponse(res, httpStatus.OK, 'Login successful', { ...user, token })
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Login Failed', null, error.message)
  }
}

// @route PUT user/update-password
// @desc upate user password
exports.changePassword = async (req, res) => {
  try {
    const { newPassword, currPassword } = req.body
    let id = req.user._id
    const user = await User.findById(id)

    const comparePassword = await bcrypt.compare(currPassword, user.hash)
    if (comparePassword) {
      const checkPassword = await bcrypt.compare(newPassword, user.hash)
      if (checkPassword) {
        return sendErrorResponse(res, httpStatus.BAD_REQUEST, 'New password matched current password')
      } else {
        await bcrypt.hash(newPassword, 10, async (err, hash) => {
          const update = await User.findByIdAndUpdate(id, { $set: { hash: hash } })
          return sendSuccessResponse(res, httpStatus.OK, 'Password changed successfully', update)
        })
      }
    } else {
      return sendErrorResponse(res, httpStatus.BAD_REQUEST, 'Current password didnot match old password')
    }
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to change password', null, error.message)
  }
}

// @route PUT event/remove-image/:id
// @desc remove image from document
exports.removeImage = async (req, res) => {
  try {
    const image = await User.findByIdAndUpdate(req.params.id, { $set: { image: '' } })
    return sendSuccessResponse(res, httpStatus.OK, 'Image removed successfully')
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to remove image', null, error.message)
  }
}

// @route PUT u ser/update-profile/
// @desc upate user profile
exports.updateUserProfile = async (req, res) => {
  try {
    // Validate user data
    // const { error } = userJoiSchema.validate(req.body)
    // if (error) {
    //   return sendErrorResponse(res, httpStatus.BAD_REQUEST, error.details[0].message)
    // }

    let id = req.user._id
    const profile = await User.findByIdAndUpdate(id, { $set: { ...req.body } })
    return sendSuccessResponse(res, httpStatus.OK, 'User profile updated successfully', profile)
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update user profile', null, error.message)
  }
}

// @route PUT user/get-profile/
// @desc get user profile
exports.getUserProfile = async (req, res) => {
  try {
    let id = req.user._id
    const profile = await User.findById(id)
    return sendSuccessResponse(res, httpStatus.OK, 'User profile fetched successfully', profile)
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch user profile', null, error.message)
  }
}

//refersh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body
    let checkUser = jwt.verify(refreshToken, process.env.JWT_SECRET)

    let result
    if (checkUser !== null) {
      // generate access token
      result = await generateToken(checkUser.userId)
    }
    return sendSuccessResponse(res, httpStatus.OK, 'Refresh token', result)
  } catch (error) {
    return sendErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Failed to generate refresh token', null, error.message)
  }
}

const generateToken = async id => {
  const accessToken = await jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: '1d' })
  const refreshToken = await jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: '1w' })

  return { accessToken, refreshToken }
}
