module.exports = function(req, res, next){
    res.locals.isAuthed = req.session.isAuths // locals видно внутри hbs, как будто его его свойства передали в рендер
    res.locals.csrf = req.csrfToken()
    next()
}