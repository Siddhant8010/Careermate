const User = require('../models/usermodel');
const Student = require('../models/form');
const bcrypt = require('bcryptjs');

// GET /profile - Display profile page
exports.getProfile = async (req, res) => {
    try {
        const userId = req.session.user ? req.session.user._id : null;
        const username = req.session.user ? req.session.user.username : null;
        const email = req.session.user ? req.session.user.email : null;
        
        if (!userId) {
            return res.redirect('/login');
        }
        
        // Get user auth data with createdAt
        const userAuth = await User.findById(userId).lean();
        
        // Fetch student data from Student model (form.js)
        // Try multiple strategies to find the student record
        let student = await Student.findOne({ userId: userId }).lean();
        
        // If not found by userId, try finding by username parts
        if (!student) {
            // Split username into parts and try to match
            const nameParts = username.split(/[\s_.-]+/);
            const queries = [];
            
            // Try exact matches first
            for (const part of nameParts) {
                if (part.length > 2) {
                    queries.push(
                        { firstName: { $regex: `^${part}$`, $options: 'i' } },
                        { lastName: { $regex: `^${part}$`, $options: 'i' } }
                    );
                }
            }
            
            // Try partial matches
            queries.push(
                { firstName: { $regex: username, $options: 'i' } },
                { lastName: { $regex: username, $options: 'i' } }
            );
            
            student = await Student.findOne({ $or: queries }).lean();
            
            // If found, update it with userId for future lookups
            if (student && !student.userId) {
                await Student.findByIdAndUpdate(student._id, { userId: userId });
                console.log(' Linked student record to user:', username);
            }
        }
        
        // If student record doesn't have middleName field, add it
        if (student && student.middleName === undefined) {
            await Student.findByIdAndUpdate(student._id, { middleName: '' });
            console.log(' Added missing middleName field to student record');
            student.middleName = '';
        }
        
        // Combine User auth data with Student form data
        const user = {
            _id: userId,
            username: username,
            email: email,
            createdAt: userAuth?.createdAt || new Date(),
            // Student data (if found) - handle empty strings and undefined
            firstName: student?.firstName || '',
            middleName: student?.middleName !== undefined ? student.middleName.trim() : '',
            lastName: student?.lastName || '',
            gender: student?.gender || '',
            phone: student?.phone || '',
            city: student?.city || '',
            state: student?.state || '',
            age: student?.age || '',
            dob: student?.dob || '',
            tenthPercentage: student?.tenthPercentage !== undefined ? student.tenthPercentage : '',
            board: student?.board || '',
            physicsMarks: student?.physicsMarks !== undefined ? student.physicsMarks : '',
            chemistryMarks: student?.chemistryMarks !== undefined ? student.chemistryMarks : '',
            mathsMarks: student?.mathsMarks !== undefined ? student.mathsMarks : '',
            biologyMarks: student?.biologyMarks !== undefined ? student.biologyMarks : '',
            interest: student?.interest || '',
        };
        
        if (student) {
            console.log(' Profile loaded for user:', username);
            console.log('   ├─ First Name:', student.firstName);
            console.log('   ├─ Middle Name:', student.middleName || 'Not set', '(type:', typeof student.middleName, ')');
            console.log('   ├─ Last Name:', student.lastName);
            console.log('   ├─ Biology Marks:', student.biologyMarks);
            console.log('   └─ Full Student Data:', JSON.stringify(student, null, 2));
        } else {
            console.log(' No student data found for user:', username);
            console.log('   Searched for username:', username);
            console.log('   UserId:', userId);
        }
        
        res.render('profile', { user });
    } catch (error) {
        console.error(' Error loading profile:', error);
        res.status(500).send('Failed to load profile');
    }
};

// PUT /api/profile/update - Update profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.session.user ? req.session.user._id : null;
        const username = req.session.user ? req.session.user.username : null;
        
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        
        const { 
            firstName, middleName, lastName,
            phone, dob, age, gender, city, state,
            tenthPercentage, board, 
            physicsMarks, chemistryMarks, mathsMarks, biologyMarks,
            interest,
            currentPassword, newPassword 
        } = req.body;
        
        // Find student record by userId (primary) or username (fallback)
        let student = await Student.findOne({
            $or: [
                { userId: userId },
                { firstName: { $regex: username, $options: 'i' } },
                { lastName: { $regex: username, $options: 'i' } }
            ]
        });
        
        if (student) {
            // Update existing student record
            student.firstName = firstName || student.firstName;
            student.middleName = middleName || ''; // Allow empty string
            student.lastName = lastName || student.lastName;
            student.phone = phone || student.phone;
            student.dob = dob || student.dob;
            student.age = age || student.age;
            student.gender = gender || student.gender;
            student.city = city || student.city;
            student.state = state || student.state;
            student.tenthPercentage = tenthPercentage !== undefined ? tenthPercentage : student.tenthPercentage;
            student.board = board || student.board;
            student.physicsMarks = physicsMarks !== undefined ? physicsMarks : student.physicsMarks;
            student.chemistryMarks = chemistryMarks !== undefined ? chemistryMarks : student.chemistryMarks;
            student.mathsMarks = mathsMarks !== undefined ? mathsMarks : student.mathsMarks;
            student.biologyMarks = biologyMarks !== undefined ? biologyMarks : student.biologyMarks;
            student.interest = interest || student.interest;
            
            await student.save();
            console.log(' Student profile updated:', student.firstName, student.middleName || '(no middle name)', student.lastName);
            console.log('   Biology Marks:', student.biologyMarks);
        } else {
            console.log(' No student record found, cannot update profile');
            return res.status(404).json({ message: 'Profile not found. Please complete registration first.' });
        }
        
        // Handle password change in User model
        if (currentPassword && newPassword) {
            const user = await User.findById(userId);
            if (user) {
                const isMatch = await bcrypt.compare(currentPassword, user.password);
                if (!isMatch) {
                    return res.status(400).json({ message: 'Current password is incorrect' });
                }
                user.password = newPassword; // Will be hashed by pre-save hook
                await user.save();
                console.log(' Password updated for user:', username);
            }
        }
        
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error(' Error updating profile:', error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
};

// DELETE /api/profile/delete - Delete account
exports.deleteProfile = async (req, res) => {
    try {
        const userId = req.session.user ? req.session.user._id : null;
        
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        
        await User.findByIdAndDelete(userId);
        
        // Destroy session
        req.session.destroy();
        
        console.log(' Account deleted for user ID:', userId);
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error(' Error deleting profile:', error);
        res.status(500).json({ message: 'Failed to delete account' });
    }
};

// POST /api/profile/upload-avatar - Upload avatar
exports.uploadAvatar = async (req, res) => {
    try {
        const userId = req.session.user ? req.session.user._id : null;
        
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        
        // Handle file upload logic here
        // For now, just return success
        console.log(' Avatar upload requested for user ID:', userId);
        res.json({ message: 'Avatar uploaded successfully' });
    } catch (error) {
        console.error(' Error uploading avatar:', error);
        res.status(500).json({ message: 'Failed to upload avatar' });
    }
};
