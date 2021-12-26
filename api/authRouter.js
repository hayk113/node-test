const Router = require('express')
const router = new Router()
const controller = require('./authController')
const {check} = require('express-validator')
const authMiddleware = require('./middleware/authMiddleware')

//Registration route
router.post('/registration', [
    check('login', "Username can't be empty").notEmpty(),
    check('email', "Email can't be empty").notEmpty(),
    check('password', 'Password must be more than 4 and less than 10 characters').isLength({min:4, max:20})
], controller.registration)

//Authorization route
router.post('/auth', controller.auth)

//Change password route
router.post('/change_password', authMiddleware, controller.changePassword)

//Get user route
router.get('/user', controller.getUser)

module.exports = router