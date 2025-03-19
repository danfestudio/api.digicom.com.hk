const jwt = require('jsonwebtoken');
const User = require('../modules/user/user.model');

const decodeToken = (authorization) => {
  try {
    const token = authorization.split(' ')[1];
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const getUser = async (userId) => {
  try {
    return await User.findById(userId);
  } catch (error) {
    return null;
  }
};

const handleUnauthorizedAccess = (res) => {
  return res.status(401).json({ success: false, message: 'Unauthorized access' });
};
const handleTokenExpired = (res) => {
  return res
    .status(422)
    .json({ success: false, message: 'Your token has been expired. Refresh your access token.' });
};

const verifyUser = async (req, res, next) => {
  if (req.headers.authorization === undefined) {
    return handleUnauthorizedAccess(res);
  }
  let decodedResult = decodeToken(req.headers.authorization);
  if (decodedResult == null || decodedResult == undefined) return handleTokenExpired(res);

  let userData = await getUser(decodedResult.userId);
  if (userData == null) return handleUnauthorizedAccess(res);
  req.user = userData;
  next();
};

const verifySuperAdmin = async (req, res, next) => {
  const user = req.user;
  if (user.role !== 'superadmin') {
    return handleUnauthorizedAccess(res);
  }
  next();
};

const verifyAdmin = async (req, res, next) => {
  const user = req.user;
  if (user.role !== 'superadmin') {
    return handleUnauthorizedAccess(res);
  }
  next();
};

module.exports = { verifyUser, verifySuperAdmin, verifyAdmin };
