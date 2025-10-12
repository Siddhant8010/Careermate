const Question = require('../models/Question');
const Result = require('../models/Result');
const pdfGenerator = require('../utils/pdfGenerator');
const emailService = require('../utils/emailService');

// GET /test
exports.getTest = async (req, res) => {
  try {
    const questions = await Question.find({}).sort({ questionNumber: 1, createdAt: 1 }).lean();

    console.log(` Fetched ${questions.length} questions from database`);

    if (questions.length === 0) {
      console.warn('⚠️  No questions found in database. Please run: npm run seed:questions');
      return res.status(404).send(`
        <h1>No Questions Found</h1>
        <p>Please seed the database first by running:</p>
        <pre>npm run seed:questions</pre>
        <p>Then refresh this page.</p>
        <a href="/test">Refresh</a>
      `);
    }

    // Log question distribution
    const bySubject = {};
    questions.forEach(q => {
      bySubject[q.subject] = (bySubject[q.subject] || 0) + 1;
    });
    console.log(' Questions by subject:', bySubject);

    // Log sample question structure for debugging
    if (questions.length > 0) {
      console.log('Sample question structure:', {
        id: questions[0]._id,
        subject: questions[0].subject,
        questionText: questions[0].questionText.substring(0, 50) + '...',
        options: questions[0].options,
        correctAnswer: questions[0].correctAnswer
      });
    }

    return res.render('test', { title: 'CareerMate Test', questions });
  } catch (err) {
    console.error(' Error fetching questions:', err);
    return res.status(500).send('Failed to load test. Check server logs for details.');
  }
};

// POST /submit-test
exports.submitTest = async (req, res) => {
  try {
    // Expecting req.body.answers as an object: { [questionId]: selectedAnswer }
    const bodyAnswers = req.body.answers || {};

    // Get all questions from database
    const allQuestions = await Question.find({}).lean();
    const totalQuestionsCount = allQuestions.length;

    // Filter out empty answers and get only answered questions
    const answeredQuestions = Object.keys(bodyAnswers).filter(qId => bodyAnswers[qId] && bodyAnswers[qId].trim() !== '');
    
    console.log(`📊 Submission Summary:`);
    console.log(`- Total questions in database: ${totalQuestionsCount}`);
    console.log(`- Questions with answers: ${answeredQuestions.length}`);
    console.log(`- Unanswered questions: ${totalQuestionsCount - answeredQuestions.length}`);

    // Allow submission even with 0 answers
    if (answeredQuestions.length === 0) {
      console.log('⚠️ User submitted test with no answers');
      // Create a result with 0 score
      const result = {
        userId: req.session && req.session.user ? req.session.user._id : null,
        username: req.session && req.session.user ? req.session.user.username : 'Anonymous',
        answers: [],
        overallScore: 0,
        subjectScores: { physics: 0, chemistry: 0, maths: 0, biology: 0, logicalreasoning: 0 },
        recommendedStream: 'Arts', // Default stream for 0 score
        date: new Date()
      };
      
      const resultDoc = await Result.create(result);
      
      return res.render('results', {
        title: 'Test Results',
        overallScore: 0,
        totalQuestions: totalQuestionsCount,
        subjectScores: { physics: 0, chemistry: 0, maths: 0, biology: 0, logicalreasoning: 0 },
        recommendedStream: 'Arts',
        resultId: resultDoc._id,
        detailedAnswers: []
      });
    }

    // Process answered questions
    const questions = await Question.find({ _id: { $in: answeredQuestions } }).lean();

    let overallScore = 0;
    const subjectScores = { physics: 0, chemistry: 0, maths: 0, biology: 0, logicalreasoning: 0 };
    const answers = [];
    const detailedAnswers = []; // For displaying on results page

    const questionMap = new Map(questions.map(q => [String(q._id), q]));

    for (const qId of answeredQuestions) {
      const q = questionMap.get(String(qId));
      if (!q) continue;

      const selectedAnswer = bodyAnswers[qId];
      const isCorrect = selectedAnswer === q.correctAnswer;

      if (isCorrect) {
        overallScore += 1;
        const subj = (q.subject || '').toLowerCase();
        if (subjectScores.hasOwnProperty(subj)) {
          subjectScores[subj] += 1;
        }
      }

      answers.push({
        questionId: q._id,
        selectedAnswer,
        isCorrect,
      });

      // Add detailed answer info for results page
      detailedAnswers.push({
        questionText: q.questionText,
        subject: q.subject,
        selectedAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        options: q.options,
      });
    }

    // Recommended Stream Logic based on 5 subjects
    let recommendedStream = 'Arts';
    
    // Calculate total possible scores per subject (assuming 5 questions each)
    const maxScorePerSubject = 5;
    const totalQuestions = totalQuestionsCount; // Should be 25 (5 subjects × 5 questions)
    
    // Science recommendation: Strong in Physics, Chemistry, Maths + Reasoning
    // Requires good performance in core science subjects
    const scienceScore = subjectScores.physics + subjectScores.chemistry + subjectScores.maths + subjectScores.logicalreasoning;
    const scienceMaxScore = 4 * maxScorePerSubject; // 20 points max
    
    // Commerce recommendation: Strong in Maths, Reasoning, and Chemistry
    // Business-oriented subjects with analytical thinking
    const commerceScore = subjectScores.maths + subjectScores.logicalreasoning + subjectScores.chemistry;
    const commerceMaxScore = 3 * maxScorePerSubject; // 15 points max
    
    // Arts recommendation: Strong in any combination, especially if Biology is strong
    // Or when other streams don't meet thresholds
    const artsScore = subjectScores.biology + subjectScores.logicalreasoning;
    const artsMaxScore = 2 * maxScorePerSubject; // 10 points max
    
    // Calculate percentages for better decision making
    const sciencePercentage = (scienceScore / scienceMaxScore) * 100;
    const commercePercentage = (commerceScore / commerceMaxScore) * 100;
    const artsPercentage = (artsScore / artsMaxScore) * 100;
    
    // Determine stream based on performance thresholds
    if (sciencePercentage >= 60 && scienceScore >= 12) {
      // Science: Need 60%+ in PCM+R with minimum 12/20 points
      recommendedStream = "Science";
    } else if (commercePercentage >= 53 && commerceScore >= 8) {
      // Commerce: Need 53%+ in M+R+C with minimum 8/15 points
      recommendedStream = "Commerce";
    } else if (artsPercentage >= 50 || subjectScores.biology >= 3) {
      // Arts: Good in Biology or general reasoning, or default case
      recommendedStream = "Arts";
    } else {
      // Default fallback
      recommendedStream = "Arts";
    }
    
    console.log(`📊 Stream Recommendation Logic (5 Subjects):`);
    console.log(`- Total Questions: ${totalQuestions}`);
    console.log(`- Science Score (P+C+M+R): ${scienceScore}/${scienceMaxScore} (${sciencePercentage.toFixed(1)}%)`);
    console.log(`- Commerce Score (M+R+C): ${commerceScore}/${commerceMaxScore} (${commercePercentage.toFixed(1)}%)`);
    console.log(`- Arts Indicator (B+R): ${artsScore}/${artsMaxScore} (${artsPercentage.toFixed(1)}%)`);
    console.log(`- Recommended Stream: ${recommendedStream}`);
    console.log(`- Subject Breakdown:`, {
      physics: `${subjectScores.physics}/${maxScorePerSubject}`,
      chemistry: `${subjectScores.chemistry}/${maxScorePerSubject}`,
      maths: `${subjectScores.maths}/${maxScorePerSubject}`,
      biology: `${subjectScores.biology}/${maxScorePerSubject}`,
      logicalreasoning: `${subjectScores.logicalreasoning}/${maxScorePerSubject}`
    });

    // Get userId and username from session
    const userId = req.session && req.session.user ? req.session.user._id : null;
    const username = req.session && req.session.user ? req.session.user.username : 'Anonymous';

    const resultDoc = await Result.create({
      userId,
      username,
      answers,
      overallScore,
      subjectScores,
      recommendedStream,
      date: new Date(),
    });

    console.log(` Test submitted by user: ${username} (Score: ${overallScore}/${totalQuestionsCount})`);

    // Send immediate response to user
    const responseData = {
      title: 'Test Results',
      overallScore,
      subjectScores,
      recommendedStream,
      totalQuestions: totalQuestionsCount,
      resultId: resultDoc._id,
      detailedAnswers,
      pdfGenerated: false // Will be updated when PDF is ready
    };

    // Respond immediately to user
    res.render('results', responseData);

    // Generate PDF and send email in background (non-blocking)
    setImmediate(async () => {
      let retryCount = 0;
      const maxRetries = 2;
      
      while (retryCount <= maxRetries) {
        try {
          console.log(` Generating PDF report in background... (attempt ${retryCount + 1}/${maxRetries + 1})`);
          const useFreshBrowser = retryCount > 0; // Use fresh browser on retry attempts
          const pdfBuffer = await pdfGenerator.generateTestResultPDF({
            username,
            overallScore,
            totalQuestions: totalQuestionsCount,
            subjectScores,
            recommendedStream,
            date: new Date(),
            detailedAnswers
          }, useFreshBrowser);

          // Get user email
          const userEmail = req.session && req.session.user && req.session.user.email;
          
          if (userEmail && pdfBuffer) {
            console.log(` Sending results to: ${userEmail}`);
            const emailResult = await emailService.sendTestResultEmail(userEmail, {
              username,
              overallScore,
              totalQuestions: totalQuestionsCount,
              subjectScores,
              recommendedStream,
              date: new Date()
            }, pdfBuffer);

            if (emailResult.success) {
              console.log(' Email sent successfully in background!');
              return; // Success, exit retry loop
            } else {
              console.error(' Background email sending failed:', emailResult.error);
              return; // Email failed but PDF was generated, don't retry
            }
          } else {
            console.log(' No email address found for user, skipping background email');
            return; // No email to send, exit
          }
        } catch (pdfError) {
          console.error(` Background PDF generation failed (attempt ${retryCount + 1}):`, pdfError.message);
          retryCount++;
          
          if (retryCount <= maxRetries) {
            console.log(` Retrying PDF generation in 2 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
          } else {
            console.error(' All PDF generation attempts failed. User will not receive email.');
          }
        }
      }
    });

    return; // Ensure we don't continue after sending response
  } catch (err) {
    console.error('Error submitting test:', err);
    return res.status(500).send('Failed to submit test.');
  }
};

// GET /result/:id - View a specific result by ID
exports.getResultById = async (req, res) => {
  try {
    const resultId = req.params.id;
    const result = await Result.findById(resultId).populate('answers.questionId').lean();

    if (!result) {
      return res.status(404).send('Result not found.');
    }

    // Get total count of questions in database for consistent scoring display
    const totalQuestionsCount = await Question.countDocuments();

    // Build detailed answers from populated data
    const detailedAnswers = result.answers.map(ans => ({
      questionText: ans.questionId.questionText,
      subject: ans.questionId.subject,
      selectedAnswer: ans.selectedAnswer,
      correctAnswer: ans.questionId.correctAnswer,
      isCorrect: ans.isCorrect,
      options: ans.questionId.options,
    }));

    return res.render('results', {
      title: 'Test Results',
      overallScore: result.overallScore,
      subjectScores: result.subjectScores,
      recommendedStream: result.recommendedStream,
      totalQuestions: totalQuestionsCount, // Use total questions count for consistency
      resultId: result._id,
      detailedAnswers,
    });
  } catch (err) {
    console.error('Error fetching result:', err);
    return res.status(500).send('Failed to load result.');
  }
};
