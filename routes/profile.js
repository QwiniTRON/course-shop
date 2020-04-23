const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth')
const User = require('../models/User')

router.get('/', authMiddleware, async function(req, res){
    res.render('profile', {
        title: 'Профиль',
        isProfile: true,
        user: req.session.user.toObject()
    })
})


router.post('/', authMiddleware, async function(req, res){
    try {
        const user = await User.findById(req.session.user._id)

        const toChange = {
            name: req.body.name
        }

        if(req.file){
            toChange['photoUrl'] = req.file.path
        }
        
        Object.assign(user, toChange)
        await user.save()
        res.redirect('/profile')
    } catch (error) {
        console.log(error);
    }
})

module.exports = router