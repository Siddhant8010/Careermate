const Admin = require("../models/Admin");
const { createSecretToken } = require("../utils/secrettoken");
const bcrypt = require("bcryptjs");

// Admin Login
exports.AdminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ message: 'Email and password are required', success: false });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (!admin) {
      return res.json({ message: 'Invalid admin credentials', success: false });
    }

    const auth = await bcrypt.compare(password, admin.password);

    if (!auth) {
      return res.json({ message: 'Invalid admin credentials', success: false });
    }

    const token = createSecretToken(admin._id);

    res.cookie("adminToken", token, {
      withCredentials: true,
      httpOnly: false,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    req.session.admin = {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
    };

    res.status(200).json({
      message: "Admin logged in successfully",
      success: true,
      admin: {
        username: admin.username,
        email: admin.email,
      }
    });

  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: 'Server error', success: false });
  }
};

// Admin Logout
exports.AdminLogout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ success: false, message: 'Logout failed' });
      }
      res.clearCookie('adminToken');
      res.clearCookie('connect.sid');
      res.json({ success: true, message: 'Logged out successfully' });
    });
  } catch (error) {
    console.error("Admin logout error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get Admin Profile
exports.getAdminProfile = async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    const admin = await Admin.findById(req.session.admin.id).select('-password');
    
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    
    res.json({ 
      success: true, 
      admin: {
        username: admin.username,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt,
      }
    });
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create initial admin (for setup only - should be protected in production)
exports.createInitialAdmin = async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      return res.json({ message: 'Admin already exists', success: false });
    }
    
    const admin = await Admin.create({
      username: 'admin',
      password: 'admin123', // Change this in production!
      email: 'admin@careermate.com',
    });
    
    res.status(201).json({ 
      message: 'Initial admin created successfully', 
      success: true,
      credentials: {
        username: 'admin',
        password: 'admin123',
        email: 'admin@careermate.com',
      }
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({ message: 'Server error', success: false });
  }
};
