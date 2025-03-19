const router = require('express').Router();
const categoryController = require('./category.controller');

router.post('/', categoryController.addCategory);
router.put('/:id', categoryController.updateCategory);
router.get('/', categoryController.getAllCategories);
router.get('/:slug', categoryController.getCategoryBySlug);
router.get('/get-category/:id', categoryController.getCategoryById);
router.get('/get-category-by-type', categoryController.getCategoriesByType);
router.delete('/:id', categoryController.deleteCategory);

router.post('/add-slug', categoryController.addSlugInExistingCategory);
module.exports = router;
