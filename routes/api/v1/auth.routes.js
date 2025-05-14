'use strict'
const router = require('express').Router()
const Controller = require('../../../controller/api/v1/auth.controller')
const authValidator = require('../../../middleware/auth')
const tempAuthValidator = require('../../../middleware/tempTokenValidator')
router.post('/', Controller.login)
router.post('/change-password', authValidator, Controller.changePassword)
router.post('/forgot-password', Controller.forgotPassword)
router.post('/verify-otp', tempAuthValidator, Controller.verifyOtp)
router.post('/email-verify-otp', tempAuthValidator, Controller.emailVerifyOtp)
router.post('/new-password', tempAuthValidator, Controller.newPassword)


module.exports = router
