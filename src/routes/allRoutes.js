const router = require("express").Router();

router.use("/banner", require("../modules/banner/banner.route"));
router.use("/blog", require("../modules/blog/blog.route"));
router.use("/content", require("../modules/content/content.route"));
router.use("/category", require("../modules/category/category.route"));
router.use("/contact", require("../modules/contact/contact.route"));
router.use("/preference", require("../modules/preference/preference.route"));
router.use("/media", require("../modules/media/media.route"));

router.use("/user", require("../modules/user/user.route"));
router.use("/product", require("../modules/product/product.route"));
router.use("/faq", require("../modules/faq/faq.route"));
router.use("/location", require("../modules/location/location.route"));
router.use(
  "/featured-product",
  require("../modules/featureProduct/featureProduct.route")
);
// router.use('/dashboard', require('../modules/dashboard/dashboard.route'))

// **** pagestyle ****
router.use("/page-style", require("../modules/pageStyle/pageStyle.route"));
router.use("/warranty", require("../modules/warranty/warranty.route"));
router.use("/support", require("../modules/support/support.route"));
router.use("/role", require("../modules/roles/role.route"));
router.use(
  "/stay-in-touch",
  require("../modules/stayInTouch/StayInTouch.route")
);
router.use("/policy", require("../modules/policy//policy.route"));

module.exports = router;
