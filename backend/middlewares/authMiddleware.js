const jwt = require('jsonwebtoken')
const User = require('../models/User')

const  protect = async (req, res, next) => {
    try{
        let token=req.headers.authorization
        if(!token){
            res.status(401)
            throw new Error('Not authorized, no token')
        }
        if(token && token.startsWith('Bearer ')){
            token = token.split(' ')[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user = await User.findById(decoded.id).select('-password')
            next()
        }
        else
        {
            res.status(401)
            throw new Error('Not authorized')
        }
    }
    catch(error){
        res.status(401)
        throw new Error('Token failed')
    }
}

module.exports = { protect }