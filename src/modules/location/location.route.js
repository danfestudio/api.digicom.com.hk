const router = require('express').Router();
const controller = require('./location.controller');
const { verifyUser } = require('../../middleware/auth');

router.post('/', verifyUser, controller.addLocation);
router.put('/:id', verifyUser, controller.updateLocation);
router.get('/', controller.getAllLocation);
router.delete('/:id', verifyUser, controller.deleteLocation);

module.exports = router;
