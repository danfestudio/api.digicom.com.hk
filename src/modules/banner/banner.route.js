const router = require('express').Router();
const controller = require('./banner.controller');
const { verifyUser } = require('../../middleware/auth');

router.post('/', verifyUser, controller.addBanner);
// router.put('/:id', verifyUser, controller.updateBanner);
// router.put('/remove-image/:id', verifyUser, controller.removeImage);
router.put('/make-active/:id', verifyUser, controller.changeBannerStatus);
router.put('/update-banner-order/:id', verifyUser, controller.changeBannerOrder);
router.get('/', controller.getAllBanners);
router.get('/:id', controller.getBannerById);
router.delete('/:id', verifyUser, controller.deleteBanner);

module.exports = router;
