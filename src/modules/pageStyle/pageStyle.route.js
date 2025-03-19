const router = require('express').Router();
const controller = require('./pageStyle.controller');
// const { verifyUser } = require('../../middleware/auth');

router.post('/default-style', controller.addUpdateDefaultStyle);
router.post('/:product_sku', controller.addUpdateProductPageStyle);
router.get('/default-style', controller.getDefaultStyle);
router.get('/:product_sku', controller.getProductPageStyle);
router.get('/', controller.getProductPageStyles);
// router.put('/', controller.updateProducts);
router.delete('/:id', controller.deleteStyle);

module.exports = router; 
