const Student = require("../models/form");

exports.registerStudent = async (req, res) => {
  try {
   
    let {
      firstName,
      middleName,
      lastName,
      gender,
      phone,
      city,
      state,
      age,
      dob,
      tenthPercentage,
      board,
      physicsMarks,
      chemistryMarks,
      mathsMarks,
      biologyMarks,
      interest,
      accuracyConsent,
      contactConsent,
    } = req.body;

    
    accuracyConsent = accuracyConsent === 'true' || accuracyConsent === 'on' || accuracyConsent === true;
    contactConsent = contactConsent === 'true' || contactConsent === 'on' || contactConsent === true;

    console.log(" Received data:", req.body);

   
    if (
      !firstName?.trim() ||
      !lastName?.trim() ||
      !gender?.trim() ||
      !phone?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !dob?.trim() ||
      !tenthPercentage ||
      !board?.trim() ||
      !interest?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: " Please fill all required fields.",
      });
    }

    
    if (
      physicsMarks === undefined ||
      chemistryMarks === undefined ||
      mathsMarks === undefined ||
      biologyMarks === undefined ||
      age === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: " Please provide all subject marks and age.",
      });
    }

    
    if (accuracyConsent !== true || contactConsent !== true) {
      return res.status(400).json({
        success: false,
        message: " Please provide both consents to proceed.",
      });
    }

    // Get userId from session if available
    const userId = req.session.user ? req.session.user._id : null;
    
    const newStudent = new Student({
      userId: userId, // Link to User model
      firstName,
      middleName,
      lastName,
      gender,
      phone,
      city,
      state,
      age,
      dob,
      tenthPercentage,
      board,
      physicsMarks,
      chemistryMarks,
      mathsMarks,
      biologyMarks,
      interest,
      accuracyConsent,
      contactConsent,
    });

    const savedStudent = await newStudent.save();

    return res.status(201).json({
      success: true,
      message: " Registration successful!",
      data: savedStudent,
    });

  } catch (error) {
    console.error(" Error saving student:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Could not register student.",
      error: error.message,
    });
  }
};


exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error(" Error fetching students:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch students.",
      error: error.message,
    });
  }
};
