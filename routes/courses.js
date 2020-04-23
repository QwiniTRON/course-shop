const {Router} = require('express')
const Course = require('../models/course')
const router = Router()
const authMiddleware = require('../middleware/auth')
const {courseValidator} = require('../utils/validators')
const {validationResult} = require('express-validator')

function isOwner(course, req){
  return course.userId.toString() === String(req.session.user._id);
}




// Получение всех крусов
router.get('/', async (req, res) => {

  // populate как join - уму нужно указать поле по которму нужно из таблицы ref сгрубать соответствующие данные, также туда можно указать какие поля нужно взять. select указание точных полей которые нужно забрать у моделеи, find().populate('userId').select('price title') - взять эти поля у Course
  const courses = await Course.find().populate('userId', 'mail name')
  
  res.render('courses', {
    title: 'Курсы',
    isCourses: true,
    courses: courses,
    userId: req.session.user? req.session.user._id.toString() : null
  })
})

router.get('/:id/edit',  authMiddleware, async (req, res)=>{
  if(!req.query.allow){
    return res.redirect('/');
  }
  
  const course = await Course.findById(req.params.id);
  if(!isOwner(course, req)){
    return res.redirect('/courses')
  }
  
  res.render('course-edit', {
    title: `Редактировать ${course.title}`,
    course
  });
});

router.post('/remove', authMiddleware, async (req, res)=>{
  try{
    await Course.deleteOne({
      _id: req.body.id,
      userId: req.session.user._id
    });
    res.redirect('/courses');
  }catch(e){
    console.log(e);
  }
 
});

router.post('/edit', authMiddleware, courseValidator, async (req, res)=>{
  let id;
  ({id} = req.body);
  delete req.body.id;

  const errors = validationResult(req)
  if(!errors.isEmpty()){
     return res.status(422).redirect(`/courses/${id}/edit`);
  }

  const course = await Course.findOne({_id: id})

  if(!isOwner(course, req)){
    return res.redirect('/courses')
  }
  Object.assign(course, req.body)
  await course.save()
  res.redirect('/courses');
});

router.get('/:id', async (req, res) => {
  const course = await Course.findById(req.params.id)
  
  res.render('course', {
    layout: 'empty',
    title: `Курс ${course.title}`,
    course
  })
})

module.exports = router