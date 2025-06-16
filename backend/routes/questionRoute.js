const express = require('express');

const {togglePinQuestion, updateQuestionNote, addQuestionsToSession} = require('../controller/questionController');
const {protect} = require('../middlewares/authMiddleware');

const router = express.Router();


router.post('/add-questions', protect,  addQuestionsToSession);
router.put('/:id/pin-question', protect, togglePinQuestion);
router.put('/:id/note', protect, updateQuestionNote);

module.exports = router;