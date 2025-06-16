const express = require('express');
const {createSession, getSessionsById, getMySessions, deleteSession, updateSessionQuestions} = require('../controller/sessionController');
const {protect} = require('../middlewares/authMiddleware');

const {checkDailyLimit,incrementDailyUsage} = require('../middlewares/ratelimitMiddleware');
const router = express.Router();

router.post('/create', protect, checkDailyLimit('sessions'),incrementDailyUsage('sessions'), createSession);
router.put('/update/:id', protect, updateSessionQuestions);
router.get('/my-sessions', protect, getMySessions);
router.get('/:id', protect, getSessionsById);
router.delete('/:id', protect, deleteSession);

router.post('/check-limit', 
    protect, 
    checkDailyLimit('explanations'),
    (req, res) => {
        // If we reach here, user hasn't exceeded limit
        res.status(200).json({
            success: true,
            message: 'Session can be created',
            canCreate: true
        });
    }
);

module.exports = router;