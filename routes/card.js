// const { Router } = require('express');
// const router = Router();
// const Course = require('../models/course');

// // helper function //----/--------/------/---------/-------/----
// // --------------------------------------------------------

// function mapCartItems(cart) {
//     return cart.items.map(c => ({
//         ...c.courseId._doc, 
//         id: c.courseId.id,
//         count: c.count
//       }))
// }

// function computeCartSumPrice(courses) {
//     return courses.reduce((sum, c) => sum += c.count * c.price, 0)
// }

// // END helper function //---------------------------------------
// // ------/-------/------------/---------/-------------/---------

// router.post('/add', async (req, res) => {
//     const course = await Course.findById(req.body.id);

//     await req.user.addToCart(course);
//     res.redirect('/card');
// });

// router.delete('/remove/:id', async (req, res) => {
//     // await req.user.removeFromCart(req.params.id);
//     // const user = await req.user.populate('cart.items.courseId').execPopulate();

//     // const courses = mapCartItems(user.cart);
//     // const cart = {
//     //     courses, price: computeCartSumPrice(courses)
//     // };

//     // res.status(200).json(cart);

//     await req.user.removeFromCart(req.params.id)
//     const user = await req.user.populate('cart.items.courseId').execPopulate()
//     const courses = mapCartItems(user.cart)
//     const cart = {
//         courses, price: computeCartSumPrice(courses)
//     }
//     res.status(200).json(cart)
// });

// router.get('/', async (req, res) => {
//     const user = await req.user
//         .populate('cart.items.courseId')
//         .execPopulate();

//     const courses = mapCartItems(user.cart);

//     res.render('card', {
//         title: 'Корзина',
//         courses,
//         price: computeCartSumPrice(courses),
//         isCard: true
//     });
// });

// module.exports = router;

const {Router} = require('express')
const Course = require('../models/course')
const router = Router()
const authMiddleware = require('../middleware/auth');
const userMiddleware = require('../middleware/user');

function mapCartItems(cart) {
  return cart.items.map(c => ({
    ...c.courseId._doc, 
    id: c.courseId.id,
    count: c.count
  }))
}

function computePrice(courses) {
  return courses.reduce((total, course) => {
    return total += course.price * course.count
  }, 0)
}

router.post('/add', authMiddleware, async (req, res) => {
  const course = await Course.findById(req.body.id)
  await req.session.user.addToCart(course)
  res.redirect('/card')
})

router.delete('/remove/:id', authMiddleware, async (req, res) => {
  await req.session.user.removeFromCart(req.params.id)
  const user = await req.session.user.populate('cart.items.courseId').execPopulate()
  const courses = mapCartItems(user.cart)
  const cart = {
    courses, price: computePrice(courses)
  }
  res.status(200).json({cart, csrf: res.locals.csrf})
})

router.get('/', authMiddleware, async (req, res) => {
  const user = await req.session.user
    .populate('cart.items.courseId')
    .execPopulate()

  const courses = mapCartItems(user.cart)

  res.render('card', {
    title: 'Корзина',
    isCard: true,
    courses: courses,
    price: computePrice(courses)
  })
})

module.exports = router