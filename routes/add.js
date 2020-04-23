const { Router } = require('express')
const Course = require('../models/course')
const router = Router()
const authMiddleware = require('../middleware/auth')
const { courseValidator } = require('../utils/validators')
const { validationResult } = require('express-validator')

router.get('/', authMiddleware, (req, res) => {
  res.render('add', {
    title: 'Добавить курс',
    isAdd: true
  })
})

router.post('/', authMiddleware, courseValidator, async (req, res) => {
  // const course = new Course(req.body.title, req.body.price, req.body.img)
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).render('add', {
      title: 'Добавить курс',
      isAdd: true,
      error: errors.array()[0].msg,
      data: {
        title: req.body.title,
        price: req.body.price,
        img: req.body.img,
      }
    })
  }

  const course = new Course({
    title: req.body.title,
    price: req.body.price,
    img: req.body.img,
    userId: req.session.user._id
  });

  try {
    await course.save()
    res.redirect('/courses')
  } catch (e) {
    console.log(e);
  }
})

module.exports = router