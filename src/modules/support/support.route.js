const router = require('express').Router()
const controller = require('./support.controller')

router.post('/', controller.addSupport)
router.get('/', controller.getSupports)
router.get('/:country_code', controller.getSupport)
router.put('/:id', controller.updateSupport)
router.delete('/:id', controller.deleteSupport)

module.exports = router