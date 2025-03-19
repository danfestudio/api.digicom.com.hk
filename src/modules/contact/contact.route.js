const router = require('express').Router();
const controller = require('./contact.controller');
const { verifyUser } = require('../../middleware/auth');

router.post('/', controller.addContact);
router.get('/', verifyUser, controller.getAllContacts);
router.get('/:id', verifyUser, controller.getContactById);
router.delete('/:id', verifyUser, controller.deleteContact);

module.exports = router;
