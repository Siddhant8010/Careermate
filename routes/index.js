const express = require('express');
const app = express();
const dashboardController = require('../controller/dashboardController');
const profileController = require('../controller/profileController');
const Student = require('../models/form');

app.get("/", (req, res) => {
    res.render("mainpage.ejs");
});

app.get("/login", (req, res) => {
    res.render("auth.ejs", { initialTab: 'login' });
});

app.get("/register", (req, res) => {
    res.render("auth.ejs", { initialTab: 'register' });
});

app.get("/forget", (req, res) => {
    res.render("forget.ejs");
});

// Admin route is now protected in adminRoutes.js
app.get("/registeration", (req, res) => {
    res.render("registeration.ejs");
});

// Dashboard with real data
app.get("/dashboard", dashboardController.getDashboard);

// Dashboard API endpoint
app.get("/api/dashboard/stats", dashboardController.getDashboardStats);

// Profile routes
app.get("/profile", profileController.getProfile);
app.put("/api/profile/update", profileController.updateProfile);
app.delete("/api/profile/delete", profileController.deleteProfile);

// Logout route
app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

module.exports = app;