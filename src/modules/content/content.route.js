const router = require('express').Router();
const controller = require('../content/content.controller');
const { verifyUser } = require('../../middleware/auth');
router.use(verifyUser);

// post image as its content
router.post('/upload', controller.addImageContent);
// post video as its content
router.post('/upload-video', controller.addVideoAsContent);
// post files as its content
router.post('/upload-file', controller.addFileAsContent);

module.exports = router;
