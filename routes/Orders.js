const { Router } = require('express');
const router = Router();
const Order = require('../models/Order');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find( { 'user.userId': req.session.user._id } ).populate('user.userId');
        
        res.render('orders', {
            isOrder: true,
            title: 'Заказы',
            orders: orders.map( i => {
                return {
                    courses: i.courses.map( item => ({title: item.course.title, count: item.count}) ),
                    user: i.user,
                    date: i.date,
                    _id: i._id,
                    price: i.courses.reduce((total, c) => {
                        return total += c.count * c.course.price
                    }, 0)
                }
            }).sort((l, r) => r.date - l.date)
        });
    } catch (e) {
        console.log(e);
    }   
});

router.post('/', authMiddleware, async (req, res) => {
    try {
        const user = await req.session.user.populate('cart.items.courseId').execPopulate();

        const courses = user.cart.items.map(c => ({
            count: c.count,
            course: { ...c.courseId._doc }
        }));

        const order = new Order({
            user: {
                name: req.session.user.name,
                userId: req.session.user._id
            },
            courses
        });

        await order.save();
        await req.session.user.clearCart();

        res.redirect('/orders');
    } catch (e) {
        console.log(e);
    }

});

module.exports = router;