const express = require('express');

const {registerUser, loginUser, getProfile} = require('../controller/authController');
const {protect} = require('../middlewares/authMiddleware');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');


router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);

router.post('/image-upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded'
        });
    }

    const imgUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.json({
        success: true,
        imageUrl:  imgUrl
    });
});

module.exports = router;