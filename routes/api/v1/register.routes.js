'use strict'
const router = require('express').Router()
const Controller = require('../../../controller/api/v1/register.controller')
const upload = require('../../../middleware/multer')

router.post('/', upload.single('profileImage'),  Controller.register)


module.exports = router
