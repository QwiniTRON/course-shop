const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer')
const mailRegister = require('../emails/register')
const keys = require('../keys')
const {validationResult, body}  = require('express-validator')
const {registerValidator, emailValidator} = require('../utils/validators')
const crypto  = require('crypto')


/*
    name: testmailer2000@mail.ru
    pas: mailer444test
    testmailer90@mail.ru
    supertest1
    kur4atoff1@yandex.ru
    Kura123z

    bartestnode@gmail.com
    tester1Z
*/
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'bartestnode@gmail.com', // generated ethereal user
        pass: 'tester1Z' // generated ethereal password
    }
},{
    from: 'Course shop <bartestnode@gmail.com>'
});



router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Авторизация',
        isLogin: true,
        errorReg: req.flash('errorReg'),
        errorLogin: req.flash('errorLogin')
    });
});

router.post('/login', emailValidator, async (req, res) => {

    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            req.flash('errorLogin', errors.array()[0].msg)
            return res.status(422).redirect('/auth/login#login')
        }

        const { email, password } = req.body
        const candidate = await User.findOne({ mail: email })
        
        if (candidate) {
            const samePas = await bcrypt.compare(password, candidate.password)
            if (samePas) {
                req.session.user = candidate
                req.session.isAuths = true
                req.session.save((error) => {
                    if (error) throw error

                    return res.redirect('/');
                });
            } else {
                req.flash('errorLogin', 'Email или пароль не совпадают')
                return res.redirect('/auth/login#login')
            }
        } else {
            req.flash('errorLogin', 'Email или пароль не совпадают')
            return res.redirect('/auth/login#login')
        }
    } catch (e) {
        console.log(e);
    }
});


// body('email').isEmail() - как middleware
router.post('/register', registerValidator, async (req, res) => {
    try {

        const errors = validationResult(req)
        if(!errors.isEmpty()){
            req.flash('errorReg', errors.array()[0].msg)
            return res.status(422).redirect('/auth/login#registr')
        }

        const { email, password, uname } = req.body
        // const candidate = await User.findOne({ mail: email })
        // if (candidate) {
        //     req.flash('errorReg', 'Пользователь с таким email уже существует')
        //     return res.redirect(302, '/auth/login#registr')
        // } else {
            const hashPassword = await bcrypt.hash(password, 10); // оптимально 10 можно 12
            const user = new User({
                mail: email,
                password: hashPassword,
                name: uname,
                cart: { items: [] }
            })
            await user.save();
            try {
                await transporter.sendMail({
                    to: email,
                    subject: '[nospam] Аккаунт создан! Сайт courses shop',
                    text: 'Вы успшно зарагистрированы на сайте shop course. Спасибо за регистрацию.',
                    html: "<h1>Аккаунт создан</h1><h3>Добро пожаловать в нашем магазине курсов</h3><p>ваш email: " + email + "</p><hr>Ждём вас с нетерпением!"
                });
            } catch (error) {
                console.log(error);
            }
            return res.redirect('/auth/login#login')
        // }
    } catch (err) {

    }
});

router.get('/logout', async (req, res) => {
    // req.session.isAuths = false;
    req.session.destroy(() => { // уничтожение данных в сессии, а после вызов функции
        res.redirect(302, '/auth/login#login') // можно предавать хэш и он будет в ссылке
    });
});

router.get('/reset', (req, res)=>{
    res.render('auth/reset', {
       title: 'Забыли пароль',
       error: req.flash('error')
    })
})

router.post('/reset', (req, res)=>{
    try {
        crypto.randomBytes(32, async (err, buffer)=>{
            if(err){
                req.flash('error', 'Что-то пошло не так попробуйте позже')
                return res.redirect('/auth/reset')
            }
            
            const token = buffer.toString('hex')
            const candidate = await User.findOne({mail: req.body.email})

            if(candidate){
                
                candidate.resetToken = token
                candidate.resetTokenExp = Date.now() + 1000 * 60 * 60;
                await candidate.save()

                res.redirect('/auth/login')
                await transporter.sendMail({
                    to: req.body.email,
                    subject: '[nospam] Восстановление пароля',
                    text: 'Восстановление пароля, проигнорируйте если не забывали пароль',
                    html: `
                        <h2>Зравствуйте!</h2>
                        <p>Восстановление пароля</p>
                        <p>Если вы не забывали пароль просто проигнорируйте письмо</p>
                        <hr>
                            <br>
                            <p>Ссылка: <a href="${keys.BASE_URL}/auth/resetoken/${token}">Восстановить</a></p>
                            <br>
                        <hr>
                        <p>С увжением, ваш courses shop</p>
                    `
                })
            }else{
                req.flash('error', 'Такого email не существует')
                return res.redirect('/auth/reset')
            }
        })// сколько байтов зарандомить
    } catch (error) {
        console.log(error);
    }
})

router.get('/resetoken/:token', async (req, res)=>{
    if(!req.params.token){
        return res.redirect('/auth/login')
    }

    try {
        const tokenOwner = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: {
                $gt: Date.now()
            }
        })

        if(!tokenOwner){
            return res.redirect('/auth/login')
        }else{
            res.render('auth/password', {
                title: 'Новый пароль',
                error: req.flash('error'),
                userId: tokenOwner._id.toString(),
                token: req.params.token
            })
        }

    } catch (error) {
        console.log(error);
    }
})

router.post('/password', async (req, res)=>{
    try {
        const user = await User.findOne({
            _id: req.body.userid,
            resetToken: req.body.token,
            resetTokenExp: {
                $gt: Date.now()
            }
        })

        if(user){
            user.password = await bcrypt.hash(req.body.password, 10)
            user.resetToken = undefined
            user.resetTokenExp = undefined
            await user.save()
            return res.redirect('/auth/login')
        }else{
            req.flash('errorLogin', 'Время жизни сообщения для смены вышло, попробуйте снова')
            return res.redirect('/auth/login')
        }
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;