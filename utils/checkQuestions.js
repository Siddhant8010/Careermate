const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Question = require('../models/Question');

const { MONGO_URL } = process.env;

async function checkQuestions() {
  if (!MONGO_URL) {
    console.error(' MONGO_URL not set in environment.');
    process.exit(1);
  }

  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URL);
    console.log(' Connected to MongoDB\n');

    const questions = await Question.find({}).lean();
    console.log(` Total questions in database: ${questions.length}\n`);

    if (questions.length === 0) {
      console.log('  No questions found!');
      console.log('   Run: npm run seed:questions\n');
    } else {
      // Group by subject
      const bySubject = {};
      questions.forEach(q => {
        bySubject[q.subject] = (bySubject[q.subject] || 0) + 1;
      });

      console.log(' Questions by subject:');
      Object.keys(bySubject).sort().forEach(subject => {
        console.log(`   ${subject.padEnd(10)}: ${bySubject[subject]} questions`);
      });

      console.log('\n Sample questions:');
      questions.slice(0, 3).forEach((q, i) => {
        console.log(`\n   ${i + 1}. [${q.subject.toUpperCase()}] ${q.questionText}`);
        console.log(`      Options: ${q.options.join(', ')}`);
        console.log(`      Correct: ${q.correctAnswer}`);
      });
      
      console.log('\n Database is ready for testing!');
    }

  } catch (err) {
    console.error(' Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n Disconnected from MongoDB');
  }
}

checkQuestions();
