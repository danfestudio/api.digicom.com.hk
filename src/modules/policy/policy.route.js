const router = require('express').Router();
const controller = require('./policy.controller');
const { verifyUser, verifySuperAdmin } = require('../../middleware/auth');

router.post('/', verifyUser, controller.addPolicy);
router.put('/:id', verifyUser, controller.updatePolicy);
router.get('/', controller.getPolicies);
router.get('/:id', controller.getPolicy);
router.delete('/:id', verifyUser, controller.deletePolicy);

module.exports = router;
