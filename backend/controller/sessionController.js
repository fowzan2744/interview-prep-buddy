const Session = require('../models/Session')
const Question = require('../models/Question')
exports.createSession = async (req, res) => {   
  try {
    const { role, experience, topicsToFocus, description, questions } = req.body;
    const userid = req.user._id;
 
    const session = await Session.create({
      user: userid,
      role, 
      experience, 
      topicsToFocus,
      description
    });
 
    if (!Array.isArray(questions)) {
      return res.status(400).json({ success: false, message: "questions must be an array" });
    }
 
    const questionDocs = await Promise.all(
      questions.map(async (q) => {
        const question = await Question.create({
          question: q.question,
          answer: q.answer,
          session: session._id
        });
        return question._id;
      })
    );
 
    session.questions = questionDocs;
    await session.save();
 
    res.status(201).json({
      success: true,
      message: "Session created successfully",
      session,
    });
  } catch (error) {
    console.error("Create session error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSessionQuestions = async (req, res) => {
  try {
    const { questions } = req.body;
    const sessionId = req.params.id;
    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }
    
    if (!Array.isArray(questions)) {
      return res.status(400).json({ success: false, message: "questions must be an array" });
    }
    
    const questionDocs = await Promise.all(
      questions.map(async (q) => {
        const question = await Question.create({
          question: q.question,
          answer: q.answer,
          session: session._id
        });
        return question._id;
      })
    );
    
    // APPEND new questions instead of replacing
    session.questions.push(...questionDocs);
    await session.save();
    
    res.status(200).json({ success: true, message: "Questions added successfully", session });
    
  } catch (error) {
    console.error("Update session error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMySessions = async (req, res) => {
    try{
        const sessions = await Session.find({user: req.user._id})
        .sort({createdAt: -1})
        .populate('questions')
        res.status(200).json(sessions);
    }
    catch(error){
        res.status(500).json({ success:false, message: 'Session error' })
    }
}

exports.getSessionsById = async (req, res) => {
    try{
        const session = await Session.findById(req.params.id)
        .populate({
            path: 'questions',
            options : {
                sort: {
                    isPinned: -1,
                    createdAt: -1
                }
            }
        })
        .exec()
    
    if(!session){
        return res.status(404).json({success:false, message: 'Session not found' })
    }

        res.status(200).json(session)
    }
    catch(error){
        res.status(500).json({ success:true, message: 'Session not found'})
    }
}

exports.deleteSession = async (req, res) => {
    try{
        const session = await Session.findById(req.params.id)
        if(!session){
            return res.status(404).json({success:false, message: 'Session not found' })
        }

        if(session.user.toString() !== req.user.id){
            return res.status(401).json({success:false, message: 'Unauthorized'})
        }

        await Question.deleteMany({session: session._id});
        await session.deleteOne();
        
        res.status(200).json({success:true, message: 'Session deleted successfully'})
    }
    catch(error){
        res.status(500).json({ success:false, message: 'Session not found' })
    }
}