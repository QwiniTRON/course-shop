const express = require('express')
const path = require('path')
const exphbs = require('express-handlebars')
const homeRoutes = require('./routes/home')
const addRoutes = require('./routes/add')
const coursesRoutes = require('./routes/courses')
const cardRoutes = require('./routes/card')
const compression = require('compression')
const helmet = require('helmet')
const mongoose = require('mongoose')
const ordersRoutes = require('./routes/Orders')
const authRouter = require('./routes/auth')
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const varMiddle = require('./middleware/variables')
const userMiddleware = require('./middleware/user')
const csrf = require('csurf')
const flash = require('connect-flash')
const keys = require('./keys')
const nodemailer = require('nodemailer')
const error404 = require('./middleware/error')
const profileRouter = require('./routes/profile')
const fileMiddleware = require('./middleware/file')

const app = express()
const store = new MongoStore({
  collection: 'sessions',
  uri: keys.MONGODB_URI
});

const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
  helpers: require('./utils/hbs.helpers')
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

// ? middleware
// app.use(async (req, res, next)=>{
//   try{
//     const user = await User.findById('5e6a4170c32a842ec49fdea1');
//     req.user = user;
//     next();
//   }catch(e){
//     console.log(e);
//   }
// });

app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(express.urlencoded({ extended: true }))
app.use(session({
  secret: keys.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: store
}));
app.use(fileMiddleware.single('photo'))
app.use(csrf())
app.use(flash())
app.use(helmet())
app.use(compression())
app.use(varMiddle);
app.use(userMiddleware);


//----------------------------------
app.use('/', homeRoutes)
app.use('/add', addRoutes)
app.use('/courses', coursesRoutes)
app.use('/card', cardRoutes)
app.use('/orders', ordersRoutes)
app.use('/auth', authRouter)
app.use('/profile', profileRouter)

app.use(error404)

const PORT = process.env.PORT || 4400

async function start() {
  // const mp = "t5uyqqAO6wai9nFW"
  // const mu = 'mgui'
  // // const url = 'mongodb+srv://mgui:t5uyqqAO6wai9nFW@cluster0-towlq.mongodb.net/shop'
  // const url = 'mongodb://mgui:t5uyqqAO6wai9nFW@cluster0-shard-00-00-towlq.mongodb.net:27017,cluster0-shard-00-01-towlq.mongodb.net:27017,cluster0-shard-00-02-towlq.mongodb.net:27017/shop?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority'


  try {
    await mongoose.connect(keys.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
  } catch (e) {
    console.log(e);
  }
}



start();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})