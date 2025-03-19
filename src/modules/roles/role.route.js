const router = require('express').Router();
const controller = require('./role.controller');
const { verifyUser } = require('../../middleware/auth');

router.post('/', controller.addRole);
router.get('/',  controller.getRoles);
router.get('/:id',  controller.getRole);
router.put('/:id', controller.updateRole);
router.put('/add-permission/:id', controller.addPermission);
router.delete('/:id', controller.deleteRole);

module.exports = router; 
