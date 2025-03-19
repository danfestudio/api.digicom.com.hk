const router = require('express').Router();
const controller = require('./faq.controller');
const { verifyUser } = require('../../middleware/auth');

router.post('/', verifyUser, controller.addFaq);
router.put('/:id', verifyUser, controller.updateFaq);
router.get('/',  controller.getAllFaq);
router.get('/:id', controller.getFaqById);
router.delete('/:id', verifyUser, controller.deleteFaq);

module.exports = router;
