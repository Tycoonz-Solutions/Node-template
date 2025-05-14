'use strict'
const router = require('express').Router()


const AuthRoute = require('./auth.routes')
const RegisterRoute = require('./register.routes')


router.use('/auth', AuthRoute)
router.use('/register', RegisterRoute)




module.exports = router
