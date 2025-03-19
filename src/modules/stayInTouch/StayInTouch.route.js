const router = require('express').Router();
const controller = require('./stayInTouch.controller');
const { verifyUser, verifySuperAdmin } = require('../../middleware/auth');

router.post('/', controller.addContact);
// router.put('/:id', verifyUser, controller.updateContact);
router.get('/', controller.getContacts);
// router.get('/:id', controller.getContact);
router.delete('/:id', verifyUser, controller.deleteContact);

module.exports = router;
