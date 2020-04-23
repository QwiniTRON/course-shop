module.exports = function(req, res, next){
    if(!req.session.isAuths){
        return res.redirect('/') // return и следующие в цепочке функции просто не будут вызваны
    }
    next()
};