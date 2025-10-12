const express=require('express');
const app=express();
const path = require("path");
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require('cors');

const { MONGO_URL, PORT } = process.env;

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
const session = require('express-session');

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));
const indexRoutes = require('./routes');
app.use('/', indexRoutes);
const authRoutes = require("./routes/auth");
app.use("/", authRoutes);
const registerationRoutes = require("./routes/registeration");
app.use("/", registerationRoutes);
const testRoutes = require("./routes/testRoutes");
app.use("/", testRoutes);
const adminRoutes = require("./routes/adminRoutes");
app.use("/", adminRoutes);



mongoose
  .connect(MONGO_URL)
  .then(async () => {
    console.log("MongoDB connected");
    
    // Auto-create admin if not exists
    const Admin = require('./models/Admin');
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (!adminExists) {
      await Admin.create({
        username: 'admin',
        password: 'admin123',
        email: 'admin@careermate.com',
      });
      console.log(' Default admin account created (username: admin, password: admin123)');
    }
    
    app.listen(PORT || port, () => {
      console.log(` Server started on port ${PORT || port}`);
    });
  })
  .catch((err) => {
    console.error(" DB connection failed:", err);
  });
