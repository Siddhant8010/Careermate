#  CareerMate

**CareerMate** is a comprehensive career guidance system that helps students discover their ideal academic stream through intelligent aptitude testing and personalized recommendations.

## 🔄 System Flowchart

<div align="center">

![CareerMate System Flowchart](screenshots/flowchart.png)
*Complete system flow showing user journey from registration to career recommendations*

</div>

## 📚 Table of Contents

- [System Flowchart](#-system-flowchart)
- [Screenshots](#-screenshots)
- [Features](#-features)
- [Technology Stack](#️-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [Configuration](#-configuration)
- [Security Features](#-security-features)
- [Contributing](#-contributing)
- [License](#-license)


### 🏠 Homepage & User Interface
<div align="center">

**Main Landing Page**
![Homepage](screenshots/homepage.png)
*Clean, modern interface welcoming users to CareerMate*



**Users Dashboard**
![Login Page](screenshots/login-page.png)
*Simple and user friendly dashboard*

</div>

### 🎯 Testing Experience
<div align="center">

**Admin Dashboard**
![Dashboard](screenshots/dashboard.png)
*Admin dashboard showing detailed test history and progress*


</div>


## 🌟 Features

### 🎯 Core Functionality
- **Smart Aptitude Testing** - Comprehensive tests covering Physics, Chemistry, Mathematics, Biology, and Logical Reasoning
- **Personalized Recommendations** - AI-driven career stream suggestions (Science, Commerce, Arts) based on performance
- **Detailed Results Analysis** - In-depth performance breakdown with subject-wise scoring
- **PDF Report Generation** - Professional test results reports with charts and analysis
- **Email Integration** - Automated result delivery with PDF attachments
- **Chatbot**-for 24*7 Assistance and guidance 

### 👥 User Management
- **Student Portal** - Secure registration, login, and profile management
- **Admin Dashboard** - Administrative controls for managing tests and users
- **Session Management** - Secure authentication with JWT tokens
- **Password Recovery** - OTP-based password reset functionality

### 📊 Analytics & Reporting
- **Performance Tracking** - Detailed subject-wise performance analysis
- **Visual Reports** - Professional PDF reports with performance insights
- **Email Reports** - Automated email delivery of test results
- **Career Guidance** - Stream-specific career recommendations and insights

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing and security

### Frontend
- **EJS** - Embedded JavaScript templating
- **HTML/CSS/JavaScript** - Modern responsive design
- **Bootstrap** - UI components and styling

### Additional Services
- **Nodemailer** - Email service integration
- **Puppeteer** - PDF generation for reports
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
CareerMate/
├── controller/           # Business logic controllers
│   ├── adminAuthController.js
│   ├── adminDashboardController.js
│   ├── authcontroller.js
│   ├── dashboardController.js
│   ├── profileController.js
│   └── testController.js
├── middleware/           # Custom middleware
│   ├── adminAuth.js
│   └── authmiddleware.js
├── models/              # Database models
│   ├── Admin.js
│   ├── Question.js
│   ├── Result.js
│   ├── usermodel.js
│   └── form.js
├── public/              # Static assets
│   ├── css/            # Stylesheets
│   ├── js/             # Client-side JavaScript
│   └── Images/         # Images and logos
├── routes/              # Route definitions
│   ├── adminRoutes.js
│   ├── auth.js
│   ├── index.js
│   ├── registeration.js
│   └── testRoutes.js
├── utils/               # Utility functions
│   ├── checkQuestions.js
│   ├── emailService.js
│   ├── pdfGenerator.js
│   ├── secrettoken.js
│   └── syncStudentToUser.js
├── views/               # EJS templates
│   ├── admindash.ejs
│   ├── auth.ejs
│   ├── dashboard.ejs
│   ├── mainpage.ejs
│   ├── profile.ejs
│   ├── test.ejs
│   └── results.ejs
├── server.js            # Main application file
├── package.json         # Dependencies and scripts
├── .env                 # Environment variables
└── README.md           # This file
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (local or cloud instance)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Siddhant8010/Careermate.git
   cd CareerMate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   MONGO_URL=mongodb://localhost:27017/
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here
   
   # Email Configuration (Gmail)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   
   # Session Secret
   SESSION_SECRET=your_session_secret_key
   ```

4. **Start the application**
   ```bash
   # Development mode
   npm start
   
   # The application will be available at http://localhost:3000
   ```


## 🎯 Usage

### For Students
1. **Register/Login** - Create an account or sign in
2. **Take Assessment** - Complete the comprehensive aptitude test
3. **View Results** - Get instant results with detailed analysis
4. **Download Report** - Receive professional PDF reports via email
5. **Career Guidance** - Explore recommended career streams

### For Administrators
1. **Admin Login** - Access administrative dashboard
2. **Manage Users** - View and manage student accounts
3. **Test Management** - Add, edit, or remove test questions
4. **Analytics** - View system-wide performance metrics
5. **Report Generation** - Generate comprehensive reports

## 🔧 Configuration

### Email Service Setup
Configure your email service in `.env`:
```env
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_specific_password
```

### Database Configuration
```env
MONGO_URL=mongodb://localhost:27017/
# OR for MongoDB Atlas
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
```

### Security Settings
```env
JWT_SECRET=your_super_secret_jwt_key
SESSION_SECRET=your_session_secret_key
```

## 🔐 Security Features

- **Password Hashing** - bcrypt for secure password storage
- **JWT Authentication** - Stateless token-based authentication
- **Session Management** - Secure session handling
- **Input validation** - Server-side validation for all inputs
- **CORS Protection** - Configured cross-origin policies
- **Rate Limiting** - Protection against brute force attacks

## 📧 Email Integration

CareerMate includes a robust email service for:
- **Test Results** - Automated delivery of test results
- **PDF Reports** - Professional reports as email attachments
- **Account Verification** - Email verification for new accounts
- **Password Recovery** - OTP-based password reset

## 📱 Responsive Design

- **Mobile-First** - Optimized for mobile devices
- **Cross-Browser** - Compatible with modern browsers

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👨‍💻 Author

**Siddhant8010**
**himansh-afk**
- GitHub:[@Siddhant8010] [@himansh-afk]
- [(https://github.com/Siddhant8010)
- Repository: [CareerMate](https://github.com/Siddhant8010/Careermate)

## 🙏 Acknowledgments

- Thanks to all contributors who helped build this platform
- Inspired by the need for accessible career guidance in education
- Built with modern web technologies and best practices

## 📞 Support

For support, email us or create an issue in the GitHub repository.

---

**Made with ❤️ for students seeking their ideal career path**
