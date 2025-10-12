// One-time script to sync existing Student data to User profiles
const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('../models/form');
const User = require('../models/usermodel');

async function syncStudentDataToUsers() {
  try {
    // Connect to MongoDB
    const MONGO_URL = process.env.MONGO_URL || process.env.MONGO_URI;
    
    if (!MONGO_URL) {
      console.error(' MONGO_URL not set in environment.');
      process.exit(1);
    }
    
    await mongoose.connect(MONGO_URL);
    console.log(' Connected to MongoDB');

    // Get all students
    const students = await Student.find({});
    console.log(` Found ${students.length} students in database`);

    // Get all users
    const users = await User.find({});
    console.log(` Found ${users.length} users in database`);

    let syncedCount = 0;
    let skippedCount = 0;

    // Try to match students to users by phone or email
    for (const student of students) {
      // Try to find matching user by phone
      let user = null;
      
      if (student.phone) {
        user = await User.findOne({ phone: student.phone });
      }
      
      // If no match by phone, try by name similarity
      if (!user) {
        const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
        user = users.find(u => {
          const username = (u.username || '').toLowerCase();
          return username.includes(student.firstName.toLowerCase()) || 
                 username.includes(student.lastName.toLowerCase());
        });
        
        if (user) {
          user = await User.findById(user._id);
        }
      }

      if (user) {
        // Update user with student data
        user.firstName = student.firstName;
        user.middleName = student.middleName;
        user.lastName = student.lastName;
        user.gender = student.gender;
        user.phone = student.phone;
        user.city = student.city;
        user.state = student.state;
        user.age = student.age;
        user.dob = student.dob;
        user.tenthPercentage = student.tenthPercentage;
        user.board = student.board;
        user.physicsMarks = student.physicsMarks;
        user.chemistryMarks = student.chemistryMarks;
        user.mathsMarks = student.mathsMarks;
        user.biologyMarks = student.biologyMarks;
        user.interest = student.interest;

        await user.save();
        console.log(` Synced data for user: ${user.username} (${student.firstName} ${student.lastName})`);
        syncedCount++;
      } else {
        console.log(`⚠️ No matching user found for student: ${student.firstName} ${student.lastName}`);
        skippedCount++;
      }
    }

    console.log('\n Sync Summary:');
    console.log(` Successfully synced: ${syncedCount} users`);
    console.log(` Skipped (no match): ${skippedCount} students`);
    console.log('\n Sync completed!');

    process.exit(0);
  } catch (error) {
    console.error(' Error syncing data:', error);
    process.exit(1);
  }
}

// Run the sync
syncStudentDataToUsers();
