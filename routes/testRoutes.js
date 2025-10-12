const express = require('express');
const router = express.Router();
const testController = require('../controller/testController');

// GET /test-rules - Display test rules/instructions page
router.get('/test-rules', (req, res) => {
  const testId = req.query.testId;
  res.render('rulestest', {
    title: 'Test Rules - CareerMate',
    testId: testId
  });
});

// GET /test - Display test page with questions from database
router.get('/test', testController.getTest);

// POST /submit-test - Submit test answers, validate, save to database, and show results
router.post('/submit-test', testController.submitTest);

// GET /result/:id - View a specific result by ID (optional feature)
router.get('/result/:id', testController.getResultById);

// Public API to get all active tests
router.get('/api/tests', async (req, res) => {
  try {
    // Only return the combined aptitude test (no custom tests)
    const aptitudeTest = {
      _id: 'aptitude',
      name: 'Aptitude Test',
      description: 'Comprehensive career aptitude assessment covering Physics, Chemistry, Mathematics, Biology, and Logical Reasoning',
      testType: 'aptitude',
      subjects: ['physics', 'chemistry', 'maths', 'biology', 'logicalreasoning']
    };
    
    res.json({ 
      success: true,
      tests: [aptitudeTest]
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


router.get('/api/questions', async (req, res) => {
  try {
    const Question = require('../models/Question');
    const questions = await Question.find({}).lean();
    res.json({ 
      count: questions.length, 
      questions: questions.slice(0, 2) // Send first 2 for preview
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
