const router = require('express').Router();
const controller = require('./featureProduct.controller');
const { verifyUser } = require('../../middleware/auth');

router.post('/', verifyUser, controller.addFeatureCategory);
router.get('/', controller.getFeatureProducts);
router.get('/latest-product', controller.getLatestProduct);
router.get('/:id', controller.getFeatureProduct);
router.put('/:id', controller.updateFeaturedCategory);
router.put('/update-product-order/:id', controller.updateProductOrder);
router.put('/update-category-order/:id', controller.updateFeaturedCategoryOrder);
router.put('/add-product/:id', controller.addProducts);
router.put('/remove-product/:id', controller.removeProducts);
router.put('/set-product-status/:id', controller.setProductStatus);
router.delete('/:id', verifyUser, controller.deleteFeaturedCategory);

module.exports = router;
