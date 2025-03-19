const router = require('express').Router();
const controller = require('./warranty.controller');
const { verifyUser, verifySuperAdmin } = require('../../middleware/auth');

router.post('/', verifyUser, controller.addWarranty);
router.put('/:id', verifyUser, controller.updateWarranty);
router.get('/', controller.getWarranties);
router.get('/:country_code', controller.getWarranty);
router.delete('/:id', verifyUser, controller.deleteWarranty);

module.exports = router;
