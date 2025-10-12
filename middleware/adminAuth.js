// Middleware to check if user is authenticated as admin
exports.requireAdmin = (req, res, next) => {
  if (!req.session.admin) {
    return res.status(401).json({ 
      success: false, 
      message: 'Admin authentication required' 
    });
  }
  next();
};

// Middleware for admin page rendering
exports.requireAdminPage = (req, res, next) => {
  if (!req.session.admin) {
    return res.redirect('/login?admin=true');
  }
  next();
};
