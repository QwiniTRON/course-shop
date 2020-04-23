const User = require('../models/User');
module.exports = async function(req, res, next){
    if(!req.session.user){
        return next()
    }
    
    req.session.user = await User.findOne({_id: req.session.user._id.toString()})
    
    next()
}