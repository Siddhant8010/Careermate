const User = require("../models/usermodel");
const Question = require("../models/Question");
const Result = require("../models/Result");

// Get Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const totalResults = await Result.countDocuments();
    
    // Get subject-wise question count
    const questionsBySubject = await Question.aggregate([
      {
        $group: {
          _id: "$subject",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get recent users
    const recentUsers = await User.find()
      .select('username email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalQuestions,
        totalResults,
        totalTests: questionsBySubject.length,
        questionsBySubject,
        recentUsers,
      }
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('username email createdAt')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, users });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Also delete user's results
    await Result.deleteMany({ userId });
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get All Questions
exports.getAllQuestions = async (req, res) => {
  try {
    const { subject } = req.query;

    const filter = subject ? { subject } : {};
    const questions = await Question.find(filter).sort({ questionNumber: 1, createdAt: 1 });

    res.json({ success: true, questions });
  } catch (error) {
    console.error("Get questions error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Add Question
exports.addQuestion = async (req, res) => {
  try {
    const { subject, questionText, options, correctAnswer } = req.body;

    if (!subject || !questionText || !options || !correctAnswer) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Get the highest question number and add 1
    const lastQuestion = await Question.findOne({}).sort({ questionNumber: -1 });
    const nextQuestionNumber = lastQuestion && lastQuestion.questionNumber ? lastQuestion.questionNumber + 1 : 1;

    const question = await Question.create({
      questionNumber: nextQuestionNumber,
      subject,
      questionText,
      options,
      correctAnswer,
    });

    res.status(201).json({
      success: true,
      message: 'Question added successfully',
      question
    });
  } catch (error) {
    console.error("Add question error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update Question
exports.updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { subject, questionText, options, correctAnswer } = req.body;
    
    const question = await Question.findByIdAndUpdate(
      questionId,
      { subject, questionText, options, correctAnswer },
      { new: true, runValidators: true }
    );
    
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Question updated successfully',
      question 
    });
  } catch (error) {
    console.error("Update question error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete Question
exports.deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findByIdAndDelete(questionId);

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Renumber remaining questions to maintain sequential order
    await renumberQuestions();

    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    console.error("Delete question error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Helper function to renumber questions sequentially
async function renumberQuestions() {
  try {
    const questions = await Question.find({}).sort({ createdAt: 1 });

    for (let i = 0; i < questions.length; i++) {
      if (questions[i].questionNumber !== i + 1) {
        await Question.findByIdAndUpdate(questions[i]._id, {
          questionNumber: i + 1
        });
      }
    }

    console.log(`🔢 Renumbered ${questions.length} questions`);
  } catch (error) {
    console.error("Error renumbering questions:", error);
  }
}

// Get All Results
exports.getAllResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });
    
    // Transform results to include all necessary data
    const transformedResults = results.map(result => {
      // Calculate total score from subject scores
      const subjectScores = result.subjectScores || {};
      const subjects = ['physics', 'chemistry', 'maths', 'biology', 'logicalreasoning'];
      const totalScore = result.overallScore || 0;
      
      // Find highest scoring subject
      let highestSubject = 'general';
      let highestScore = 0;
      subjects.forEach(subject => {
        if (subjectScores[subject] > highestScore) {
          highestScore = subjectScores[subject];
          highestSubject = subject;
        }
      });
      
      return {
        _id: result._id,
        userId: result.userId,
        username: result.username || result.userId?.username,
        subject: highestSubject,
        score: totalScore,
        totalScore: totalScore,
        subjectScores: subjectScores,
        correctAnswers: result.answers?.filter(a => a.isCorrect).length || 0,
        totalQuestions: result.answers?.length || 0,
        careerSuggestion: result.recommendedStream,
        suggestedCareer: result.recommendedStream,
        createdAt: result.createdAt || result.date,
        completedAt: result.date,
      };
    });
    
    res.json({ success: true, results: transformedResults });
  } catch (error) {
    console.error("Get results error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete Result
exports.deleteResult = async (req, res) => {
  try {
    const { resultId } = req.params;
    
    const result = await Result.findByIdAndDelete(resultId);
    
    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }
    
    res.json({ success: true, message: 'Result deleted successfully' });
  } catch (error) {
    console.error("Delete result error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
