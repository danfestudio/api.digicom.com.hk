const router = require('express').Router();
const controller = require('./blog.controller');
const { verifyUser } = require('../../middleware/auth');

router.post('/', controller.addBlog);
router.put('/:id', verifyUser, controller.updateBlog);
router.put('/change-status/:id', verifyUser, controller.changeFeatureStatus);
// router.put('/remove-image/:id', verifyUser, controller.removeImage);
router.get('/', controller.getAllBlogs);
router.get('/featured-blog', controller.getFeaturedBlog);
router.get('/:id', controller.getBlogById);
router.get('/get-blog/:blog_slug', controller.getBlogBySlug);
router.delete('/:id', verifyUser, controller.deleteBlog);

module.exports = router;