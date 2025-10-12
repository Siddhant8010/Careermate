const Result = require('../models/Result');
const Question = require('../models/Question');

// GET /dashboard - Display dashboard with user's test results
exports.getDashboard = async (req, res) => {
  try {
    const username = req.session.user ? req.session.user.username : 'Student';
    const userId = req.session.user ? req.session.user._id : null;

    // Fetch ONLY this user's test results (latest 5)
    const results = await Result.find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    console.log(` Found ${results.length} tests for user ${username}`);

    // Get total questions count (default to 20 if no questions)
    const totalQuestions = await Question.countDocuments() || 20;

    // Calculate dashboard stats
    const testsCompleted = results.length;
    const latestResult = results[0] || null;
    
    // Calculate average score
    let averageScore = 0;
    if (results.length > 0) {
      const totalScore = results.reduce((sum, r) => sum + r.overallScore, 0);
      averageScore = Math.round((totalScore / results.length / totalQuestions) * 100);
    }

    // Get recommended stream from latest result
    const recommendedStream = latestResult ? latestResult.recommendedStream : 'Not Available';
    const latestScore = latestResult ? latestResult.overallScore : 0;
    const latestPercentage = latestResult ? Math.round((latestResult.overallScore / totalQuestions) * 100) : 0;

    // Calculate confidence score (based on consistency of recommendations)
    let confidenceScore = 0;
    if (results.length > 0) {
      const streamCounts = {};
      results.forEach(r => {
        streamCounts[r.recommendedStream] = (streamCounts[r.recommendedStream] || 0) + 1;
      });
      const maxCount = Math.max(...Object.values(streamCounts));
      confidenceScore = Math.round((maxCount / results.length) * 100);
    
    }
    
    const profileComplete = 100;

    // Prepare dashboard data
    const dashboardData = {
      username,
      testsCompleted,
      profileComplete,
      latestResult: latestResult ? {
        id: latestResult._id,
        score: latestResult.overallScore,
        percentage: Math.round((latestResult.overallScore / totalQuestions) * 100),
        totalQuestions,
        subjectScores: latestResult.subjectScores || { physics: 0, chemistry: 0, maths: 0, biology: 0 },
        date: latestResult.createdAt
      } : null,
      recommendedStream,
      confidenceScore,
      averageScore,
      allResults: results.map(r => ({
        id: r._id,
        score: r.overallScore,
        percentage: Math.round((r.overallScore / totalQuestions) * 100),
        totalQuestions,
        stream: r.recommendedStream,
        subjectScores: r.subjectScores || { physics: 0, chemistry: 0, maths: 0, biology: 0 },
        date: r.createdAt
      }))
    };

    console.log(` Dashboard loaded for ${username}: ${testsCompleted} tests completed`);
    
    res.render('dashboard', dashboardData);
  } catch (err) {
    console.error(' Error loading dashboard:', err);
    
   
    res.render('dashboard', {
      username: req.session.user ? req.session.user.username : 'Student',
      testsCompleted: 0,
      profileComplete: 85,
      latestResult: null,
      recommendedStream: 'Not Available',
      confidenceScore: 0,
      averageScore: 0,
      allResults: []
    });
  }
};


exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.session.user ? req.session.user._id : null;
    
    const results = await Result.find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const totalQuestions = await Question.countDocuments();

    const stats = {
      testsCompleted: results.length,
      averageScore: results.length > 0 
        ? Math.round((results.reduce((sum, r) => sum + r.overallScore, 0) / results.length / totalQuestions) * 100)
        : 0,
      latestResult: results[0] || null,
      recentTests: results.slice(0, 5).map(r => ({
        id: r._id,
        score: r.overallScore,
        percentage: Math.round((r.overallScore / totalQuestions) * 100),
        stream: r.recommendedStream,
        date: r.createdAt
      }))
    };

    res.json(stats);
  } catch (err) {
    console.error(' Error fetching dashboard stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
