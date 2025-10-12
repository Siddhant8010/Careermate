const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Configure email transporter (using Gmail as example)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS  // Your Gmail app password
      }
    });

  
  }

  async sendTestResultEmail(recipientEmail, resultData, pdfBuffer) {
    try {
      const { username, overallScore, totalQuestions, recommendedStream, date } = resultData;
      const percentage = Math.round((overallScore / totalQuestions) * 100);
      const formattedDate = new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const mailOptions = {
        from: {
          name: 'CareerMate',
          address: process.env.EMAIL_USER
        },
        to: recipientEmail,
        subject: `🎓 Your CareerMate Test Results - ${percentage}% Score`,
        html: this.generateEmailHTML(resultData),
        attachments: [
          {
            filename: 'logo.png',
            path: 'd:/demo testing/public/Images/logo.png',
            cid: 'logo'
          },
          {
            filename: `CareerMate_Results_${username || 'Student'}_${Date.now()}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(' Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };

    } catch (error) {
      console.error(' Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  generateEmailHTML(resultData) {
    const {
      username,
      overallScore,
      totalQuestions,
      subjectScores,
      recommendedStream,
      date
    } = resultData;

    const percentage = Math.round((overallScore / totalQuestions) * 100);
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CareerMate Test Results</title>
        <style>
            body {
                font-family: 'Helvetica Neue', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                line-height: 1.6;
                color: #334155;
                margin: 0;
                padding: 0;
                background-color: #f1f5f9;
            }
            
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            }
            
            .header {
                background: linear-gradient(135deg, #000ead 0%, #001638 100%);
                color: white;
                padding: 2rem;
                text-align: center;
            }
            
            .logo {
    display: flex;
    align-items: center;
    justify-content: center; /* Centers horizontally */
    gap: 0.5rem;
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    text-align: center;
}

.logo img {
    height: 40px;
    width: auto;
}

.logo-text {
    color: white;
    font-size: 1.8rem;
    font-weight: bold;
}

            
            .subtitle {
                opacity: 0.9;
                font-size: 1.1rem;
            }
            
            .content {
                padding: 2rem;
            }
            
            .greeting {
                font-size: 1.1rem;
                margin-bottom: 1.5rem;
                color: #1e293b;
            }
            
            .result-summary {
                background: #f1f5f9;
                border-radius: 12px;
                padding: 1.5rem;
                margin-bottom: 2rem;
                border-left: 4px solid #000ead;
            }
            
            .score-grid {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 1rem;
                margin-bottom: 1.5rem;
            }
            
            .score-item {
                text-align: center;
                padding: 1rem;
                background: white;
                border-radius: 8px;
                border: 2px solid #e2e8f0;
            }
            
            .score-item.primary {
                background: linear-gradient(135deg, #000ead 0%, #001638 100%);
                color: white;
                border-color: #000ead;
            }
            
            .score-number {
                font-size: 1.5rem;
                font-weight: bold;
                margin-bottom: 0.25rem;
            }
            
            .score-label {
                font-size: 0.9rem;
                opacity: 0.8;
            }
            
            .recommendation {
                background: ${this.getStreamGradient(recommendedStream)};
                color: white;
                padding: 1.5rem;
                border-radius: 12px;
                text-align: center;
                margin-bottom: 2rem;
            }
            
            .recommendation h3 {
                margin: 0 0 0.5rem 0;
                font-size: 1.3rem;
            }
            
            .subjects-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                gap: 0.75rem;
                margin-bottom: 2rem;
            }
            
            .subject-card {
                background: #f1f5f9;
                padding: 0.75rem;
                border-radius: 8px;
                text-align: center;
                border: 1px solid #e2e8f0;
            }
            
            .subject-name {
                font-size: 0.8rem;
                color: #64748b;
                margin-bottom: 0.25rem;
                text-transform: capitalize;
            }
            
            .subject-score {
                font-size: 1.2rem;
                font-weight: bold;
                color: #000ead;
            }
            
            .cta-section {
                background: #f1f5f9;
                padding: 1.5rem;
                border-radius: 12px;
                text-align: center;
                margin-bottom: 2rem;
            }
            
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #000ead 0%, #001638 100%);
                color: white;
                padding: 0.75rem 1.5rem;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin-top: 1rem;
                transition: all 0.3s ease;
            }
            
            .cta-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 14, 173, 0.3);
            }
            
            .footer {
                background: linear-gradient(135deg, #001638 0%, #000ead 100%);
                color: white;
                padding: 1.5rem;
                text-align: center;
            }
            
            .footer p {
                margin: 0.25rem 0;
                opacity: 0.8;
                font-size: 0.9rem;
            }
            
            .attachment-note {
                background: rgba(0, 14, 173, 0.1);
                border: 1px solid rgba(0, 14, 173, 0.2);
                border-radius: 8px;
                padding: 1rem;
                margin-bottom: 2rem;
                color: #001638;
            }
            
            .attachment-note strong {
                color: #000ead;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">
                    <img src="cid:logo" alt="CareerMate Logo" />
                    <span class="logo-text">CareerMate</span>
                </div>
                <div class="subtitle">Aptitude Test Results</div>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Hello <strong>${username || 'Student'}</strong>,
                    <br><br>
                    Congratulations on completing your CareerMate Aptitude test! We've analyzed your responses and prepared your personalized results.
                </div>
                
                <div class="attachment-note">
                    <strong>📎 PDF Report Attached:</strong> Your detailed test results report is attached to this email as a PDF file. Please download and save it for your records.
                </div>
                
                <div class="result-summary">
                    <h3 style="margin-top: 0; color: #1e293b;">📊 Quick Summary</h3>
                    
                    <div class="score-grid">
                        <div class="score-item primary">
                            <div class="score-number">${overallScore}</div>
                            <div class="score-label">Total Score</div>
                        </div>
                        <div class="score-item">
                            <div class="score-number">${totalQuestions}</div>
                            <div class="score-label">Questions</div>
                        </div>
                        <div class="score-item">
                            <div class="score-number">${percentage}%</div>
                            <div class="score-label">Percentage</div>
                        </div>
                    </div>
                    
                    <p><strong>Test Date:</strong> ${formattedDate}</p>
                </div>
                
                <div class="recommendation">
                    <h3>🎯 Recommended Academic Stream</h3>
                    <p><strong>${recommendedStream}</strong></p>
                    <p style="opacity: 0.9; font-size: 0.95rem; margin-top: 0.5rem;">
                        Based on your performance analysis across all subjects
                    </p>
                </div>
                
                <div style="margin-bottom: 2rem;">
                    <h3 style="color: #1e293b; margin-bottom: 1rem;">📈 Subject Performance</h3>
                    <div class="subjects-grid">
                        <div class="subject-card">
                            <div class="subject-name">Physics</div>
                            <div class="subject-score">${subjectScores.physics}/5</div>
                        </div>
                        <div class="subject-card">
                            <div class="subject-name">Chemistry</div>
                            <div class="subject-score">${subjectScores.chemistry}/5</div>
                        </div>
                        <div class="subject-card">
                            <div class="subject-name">Mathematics</div>
                            <div class="subject-score">${subjectScores.maths}/5</div>
                        </div>
                        <div class="subject-card">
                            <div class="subject-name">Biology</div>
                            <div class="subject-score">${subjectScores.biology}/5</div>
                        </div>
                        <div class="subject-card">
                            <div class="subject-name">Reasoning</div>
                            <div class="subject-score">${subjectScores.logicalreasoning}/5</div>
                        </div>
                    </div>
                </div>
                
                <div class="cta-section">
                    <h3 style="margin-top: 0; color: #1e293b;">🚀 What's Next?</h3>
                    <p>Ready to explore career opportunities in <strong>${recommendedStream}</strong>?</p>
                    <p>Visit our platform to discover detailed career paths, college recommendations, and skill development resources.</p>
                    <a href="#" class="cta-button">Explore Career Paths</a>
                </div>
                
                <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 1rem; color: #92400e;">
                    <strong>💡 Pro Tip:</strong> Keep this report handy when discussing career options with counselors, parents, or during college admissions.
                </div>
            </div>
            
            <div class="footer">
                <p><strong>CareerMate Team</strong></p>
                <p>Empowering your career journey through data-driven insights</p>
                <p style="margin-top: 1rem; font-size: 0.8rem;">
                    This email was sent to you because you completed a test on CareerMate.<br>
                    If you have any questions, please contact our support team.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  getStreamGradient(stream) {
    const gradients = {
      'Science': 'linear-gradient(135deg, #000ead 0%, #001638 100%)',
      'Commerce': 'linear-gradient(135deg, #58dcfa 0%, #000ead 100%)',
      'Arts': 'linear-gradient(135deg, #3a3e58 0%, #001638 100%)'
    };
    return gradients[stream] || gradients['Science'];
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log(' Email service is ready');
      return true;
    } catch (error) {
      console.error(' Email service connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
