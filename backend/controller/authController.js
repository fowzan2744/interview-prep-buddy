const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    })
}

const registerUser = async (req, res) => {
    const { name, email, password , profileImageUrl } = req.body
    console.log(req.body)
    if (!name || !email || !password || !profileImageUrl) {
        res.status(400)
        throw new Error('Please fill in all fields')
    }
    const userExists = await User.findOne({ email })
    if (userExists) {
        res.status(400)
        throw new Error('User already exists')
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        profileImageUrl
    });

    res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        profileImageUrl: user.profileImageUrl
    })
};


const loginUser = async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (user && (await bcrypt.compare(password, user.password))) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            token: generateToken(user._id),
        })
    } else {
        res.status(400)
        throw new Error('Invalid credentials')
    }
}

const getProfile = async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        if(!user){
            res.status(400)
            throw new Error('User not found')
        }
        res.status(200).json(user)
    } catch(error){
        res.status(400)
        throw new Error(error)
    }
}

module.exports = {
    registerUser,
    loginUser,
    getProfile,
}