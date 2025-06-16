const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session'
    },
    question: {
        type: String
    },
    answer: {
        type: String
    },
    notes: {
        type: String
    },
    isPinned: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true
    }
);

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;