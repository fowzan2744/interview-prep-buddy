const Question = require('../models/Question');
const Session = require('../models/Session');

exports.addQuestionsToSession = async (req, res) => {
    try{
        const {questions, sessionId} = req.body;
        if(!questions || !sessionId || !Array.isArray(questions)){
            return res.status(400).json({message: "Please provide all the required fields"});
        }
        const session = await Session.findById(sessionId);
        if(!session){
            return res.status(404).json({message: "Session not found"});
        }

        const questionsToAdd =  await Question.insertMany(
            questions.map((q) => ({
                session: sessionId,
                question : q.question,
                answer : q.answer,
            }))
        );

        session.questions.push(...questionsToAdd.map((q) => q._id));
        await session.save();

        res.status(200).json({message: "Questions added to session successfully", questions: questionsToAdd});
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
}


exports.togglePinQuestion = async (req, res) => {
    try{
        const question = await Question.findById(req.params.id);

        if(!question){
            return res.status(404).json({message: "Question not found"});
        }

        question.isPinned = !question.isPinned;
        await question.save();

        res.status(200).json({message: "Question pinned status updated successfully", question});
    } 
    catch(error){
        res.status(500).json({message: error.message});
    }
}



exports.updateQuestionNote = async (req, res) => {
    try{
        const {note} = req.body;
        const question = await Question.findById(req.params.id);
        if(!question){
            return res.status(404).json({message: "Question not found"});
        }
        question.note = note || "";
        await question.save();
        res.status(200).json({message: "Question note updated successfully", question});
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
}

