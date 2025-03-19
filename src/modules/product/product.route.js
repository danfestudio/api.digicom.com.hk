const router = require('express').Router();
const controller = require('./product.controller');
const { verifyUser } = require('../../middleware/auth');

router.post('/', verifyUser, controller.addProduct);
router.get('/',  controller.getProducts);
router.put('/:id', verifyUser, controller.updateProducts);
router.get('/user_guide', controller.userGuide);
router.get('/search/:search', controller.search);
router.delete('/:id', controller.deleteProduct);

module.exports = router; 
