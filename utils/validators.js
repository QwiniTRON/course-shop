const { body } = require('express-validator')
const User = require('../models/User')

module.exports.registerValidator = [
    body('email').normalizeEmail().isEmail().withMessage('Введите корректный email').bail()
        .custom(async (value, { req }) => {
            try {
                const candidate = await User.findOne({ mail: value })

                if (candidate) {
                    return Promise.reject('Такой email уже занят')
                }
            } catch (e) {

            }
        }),
    body('password', 'Пароль должен иметь не менее 6 символов и не более 56').trim().isLength({ min: 6, max: 56 }).isAlphanumeric(),
    body('cpassword')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Пароли должны совпадать') // это будет в msg
            }
            return true
        }),
    body('uname', 'Имя не короче 2 символов').isLength({ min: 2 })
]

module.exports.emailValidator = [
    body('email').isEmail().withMessage('Введите email по формату'),
    body('password', 'Введите пороль по формату').trim().isLength({ min: 6, max: 56 }).isAlphanumeric()
]

module.exports.courseValidator = [
    body('title').trim().isLength({ min: 3, max: 255 }).withMessage('Не менее трех символов в заголовке'),
    body('price').isNumeric().withMessage('Цена должна быть в чиловом формате'),
    body('img', 'Введите корректный url картинки').isURL(),
]