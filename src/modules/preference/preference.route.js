const router = require('express').Router();
const controller = require('./preference.controller');
const { verifyUser } = require('../../middleware/auth');

router.post('/', verifyUser, controller.addPreference);
router.post('/social-media/:id', verifyUser, controller.addOrUpdateSocialMedia);

router.put('/update-navbar/:id', verifyUser, controller.updateNavbar); // id--> navbar id

router.get('/', controller.getAllPreferences);
router.get('/:id', controller.getPreferenceId);

router.delete('/:id', verifyUser, controller.deletePreference);
router.delete('/delete-social-media/:id', verifyUser, controller.deleteSocialMedia);

module.exports = router;
