const router = require('express').Router();
const controller = require('./media.controller');
// const { verifyUser } = require('../../middleware/auth');

//folder
router.post('/folder', controller.addFolder);
router.get('/folder', controller.getInsideFolder);
router.put('/folder/:id', controller.updateFolder)
router.delete('/folder/:id', controller.deleteFolder)

//upload media
router.post('/', controller.addFiles);
router.delete('/:id', controller.deleteFile)

module.exports = router; 
