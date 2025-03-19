const router = require('express').Router();
const controller = require('./user.controller');
const { verifyUser, verifySuperAdmin } = require('../../middleware/auth');

router.post('/register', verifyUser, verifySuperAdmin, controller.register);
router.post('/login', controller.login);
router.post('/refresh-token', controller.refreshToken);
router.put('/change-password', verifyUser, controller.changePassword);
//update profile
router.put('/update-profile', verifyUser, controller.updateUserProfile);
router.put('/remove-image/:id', verifyUser, controller.removeImage);

router.get('/get-profile', verifyUser, controller.getUserProfile);

module.exports = router;
