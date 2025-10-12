const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class PDFGenerator {
  constructor() {
    this.browser = null;
  }

  async initBrowser() {
    // Check if browser is still connected
    if (this.browser) {
      try {
        await this.browser.version(); // Test if browser is still alive
      } catch (error) {
        console.log('🔌 Browser connection lost, creating new instance');
        this.browser = null;
      }
    }

    if (!this.browser) {
      console.log('🚀 Launching new browser instance...');
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });
      
      // Handle browser disconnect
      this.browser.on('disconnected', () => {
        console.log('🔌 Browser disconnected, will create new instance on next request');
        this.browser = null;
      });
    }
    return this.browser;
  }

  async generateTestResultPDF(resultData, useFreshBrowser = false) {
    let browser = null;
    let page = null;
    let shouldCloseBrowser = false;
    
    try {
      if (useFreshBrowser) {
        // Use a fresh browser instance for this generation
        console.log(' Using fresh browser instance for PDF generation');
        browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--no-first-run',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
          ]
        });
      }
      page = await browser.newPage();

      await page.setViewport({ width: 1200, height: 800 });

      // Read and encode logo as base64
      const logoPath = path.join(__dirname, '..', 'public', 'Images', 'logo.png');
      const logoBuffer = await fs.readFile(logoPath);
      const logoBase64 = logoBuffer.toString('base64');
      const logoDataUrl = `data:image/png;base64,${logoBase64}`;

      // Generate HTML content for the PDF
      const htmlContent = this.generateResultHTML(resultData, logoDataUrl);

      // Set content and generate PDF with optimized settings
      await page.setContent(htmlContent, { 
        waitUntil: 'domcontentloaded', // Faster than networkidle0
        timeout: 10000 // 10 second timeout
      });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        },
        timeout: 15000 // 15 second timeout for PDF generation
      });

      console.log(' PDF generated successfully');
      return pdfBuffer;
    } catch (error) {
      console.error(' PDF generation error:', error.message);
      
      // If connection error, reset browser instance
      if (error.message.includes('Connection closed') || error.message.includes('Target closed')) {
        console.log(' Resetting browser due to connection error');
        this.browser = null;
      }
      
      throw error;
    } finally {
      // Safely close page
      if (page) {
        try {
          await page.close();
        } catch (closeError) {
          console.log(' Error closing page:', closeError.message);
        }
      }
      
      // Close fresh browser if we created one
      if (shouldCloseBrowser && browser) {
        try {
          await browser.close();
        } catch (closeError) {
          console.log(' Error closing fresh browser:', closeError.message);
        }
      }
    }
  }

  async closeBrowser() {
    if (this.browser) {
      this.browser = null;
      console.log(' Browser instance closed');
    }
  }

  generateResultHTML(resultData, logoDataUrl = '') {
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
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Helvetica Neue', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                line-height: 1.6;
                color: #334155;
                background: #f1f5f9;
            }
            
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                min-height: 100vh;
            }
            
            .header {
                background: linear-gradient(135deg, #000ead 0%, #001638 100%);
                color: white;
                padding: 2rem;
                text-align: center;
            }
            
            .logo {
                font-size: 2rem;
                font-weight: bold;
                margin-bottom: 0.5rem;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
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
            
            .result-summary {
                background: #f1f5f9;
                border-radius: 12px;
                padding: 1.5rem;
                margin-bottom: 2rem;
                border-left: 4px solid #000ead;
            }
            
            .student-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 1.5rem;
                padding-bottom: 1rem;
                border-bottom: 2px solid #e2e8f0;
            }
            
            .info-item {
                text-align: center;
            }
            
            .info-label {
                font-size: 0.9rem;
                color: #64748b;
                margin-bottom: 0.25rem;
            }
            
            .info-value {
                font-size: 1.1rem;
                font-weight: 600;
                color: #1e293b;
            }
            
            .score-overview {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 1rem;
                margin-bottom: 2rem;
            }
            
            .score-card {
                text-align: center;
                padding: 1rem;
                border-radius: 8px;
                border: 2px solid #e2e8f0;
            }
            
            .score-card.primary {
                background: linear-gradient(135deg, #000ead 0%, #001638 100%);
                color: white;
                border-color: #000ead;
            }
            
            .score-number {
                font-size: 2rem;
                font-weight: bold;
                margin-bottom: 0.25rem;
            }
            
            .score-label {
                font-size: 0.9rem;
                opacity: 0.8;
            }
            
            .recommendation {
                background: ${this.getStreamColor(recommendedStream)};
                color: white;
                padding: 1.5rem;
                border-radius: 12px;
                text-align: center;
                margin-bottom: 2rem;
            }
            
            .recommendation h3 {
                font-size: 1.5rem;
                margin-bottom: 0.5rem;
            }
            
            .recommendation p {
                opacity: 0.9;
                font-size: 1.1rem;
            }
            
            .subject-breakdown {
                margin-bottom: 2rem;
            }
            
            .section-title {
                font-size: 1.3rem;
                font-weight: 600;
                margin-bottom: 1rem;
                color: #1e293b;
                border-bottom: 2px solid #e2e8f0;
                padding-bottom: 0.5rem;
            }
            
            .subject-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 1rem;
            }
            
            .subject-item {
                background: #f8fafc;
                padding: 1rem;
                border-radius: 8px;
                text-align: center;
                border: 1px solid #e2e8f0;
            }
            
            .subject-name {
                font-weight: 600;
                color: #1e293b;
                margin-bottom: 0.5rem;
                text-transform: capitalize;
            }
            
            .subject-score {
                font-size: 1.5rem;
                font-weight: bold;
                color: #000ead;
            }
            
            .performance-analysis {
                background: #f1f5f9;
                padding: 1.5rem;
                border-radius: 12px;
                margin-bottom: 2rem;
            }
            
            .analysis-item {
                margin-bottom: 1rem;
                padding: 0.75rem;
                background: white;
                border-radius: 6px;
                border-left: 3px solid #667eea;
            }
            
            .footer {
                background: #1e293b;
                color: white;
                padding: 1.5rem;
                text-align: center;
                margin-top: 2rem;
            }
            
            .footer p {
                opacity: 0.8;
                font-size: 0.9rem;
            }
            
            @media print {
                body { background: white; }
                .container { box-shadow: none; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">
                    <img src="${logoDataUrl}" alt="CareerMate Logo" />
                    <span class="logo-text">CareerMate</span>
                </div>
                <div class="subtitle">Aptitude Test Results Report</div>
            </div>
            
            <div class="content">
                <div class="result-summary">
                    <div class="student-info">
                        <div class="info-item">
                            <div class="info-label">Student Name</div>
                            <div class="info-value">${username || 'Anonymous'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Test Date</div>
                            <div class="info-value">${formattedDate}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Test Duration</div>
                            <div class="info-value">30 Minutes</div>
                        </div>
                    </div>
                    
                    <div class="score-overview">
                        <div class="score-card primary">
                            <div class="score-number">${overallScore}</div>
                            <div class="score-label">Total Score</div>
                        </div>
                        <div class="score-card">
                            <div class="score-number">${totalQuestions}</div>
                            <div class="score-label">Total Questions</div>
                        </div>
                        <div class="score-card">
                            <div class="score-number">${percentage}%</div>
                            <div class="score-label">Percentage</div>
                        </div>
                    </div>
                </div>
                
                <div class="recommendation">
                    <h3>🎯 Recommended Stream</h3>
                    <p><strong>${recommendedStream}</strong> - Based on your performance analysis</p>
                </div>
                
                <div class="subject-breakdown">
                    <h2 class="section-title">📊 Subject-wise Performance</h2>
                    <div class="subject-grid">
                        <div class="subject-item">
                            <div class="subject-name">Physics</div>
                            <div class="subject-score">${subjectScores.physics}/5</div>
                        </div>
                        <div class="subject-item">
                            <div class="subject-name">Chemistry</div>
                            <div class="subject-score">${subjectScores.chemistry}/5</div>
                        </div>
                        <div class="subject-item">
                            <div class="subject-name">Mathematics</div>
                            <div class="subject-score">${subjectScores.maths}/5</div>
                        </div>
                        <div class="subject-item">
                            <div class="subject-name">Biology</div>
                            <div class="subject-score">${subjectScores.biology}/5</div>
                        </div>
                        <div class="subject-item">
                            <div class="subject-name">Logical Reasoning</div>
                            <div class="subject-score">${subjectScores.logicalreasoning}/5</div>
                        </div>
                    </div>
                </div>
                
                <div class="performance-analysis">
                    <h2 class="section-title">🔍 Performance Analysis</h2>
                    ${this.generateAnalysis(subjectScores, recommendedStream)}
                </div>
            </div>
            
            <div class="footer">
                <p>Generated by CareerMate • Career Guidance System</p>
                <p>This report is confidential and intended for the named recipient only.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  getStreamColor(stream) {
    const colors = {
      'Science': 'linear-gradient(135deg, #000ead 0%, #001638 100%)',
      'Commerce': 'linear-gradient(135deg, #58dcfa 0%, #000ead 100%)',
      'Arts': 'linear-gradient(135deg, #3a3e58 0%, #001638 100%)'
    };
    return colors[stream] || colors['Science'];
  }

  generateAnalysis(subjectScores, recommendedStream) {
    const analysis = [];
    
    // Find strongest and weakest subjects
    const subjects = Object.entries(subjectScores);
    const strongest = subjects.reduce((a, b) => a[1] > b[1] ? a : b);
    const weakest = subjects.reduce((a, b) => a[1] < b[1] ? a : b);
    
    analysis.push(`
      <div class="analysis-item">
        <strong>🌟 Strongest Subject:</strong> ${strongest[0].charAt(0).toUpperCase() + strongest[0].slice(1)} (${strongest[1]}/5)
      </div>
    `);
    
    if (weakest[1] < strongest[1]) {
      analysis.push(`
        <div class="analysis-item">
          <strong>📈 Area for Improvement:</strong> ${weakest[0].charAt(0).toUpperCase() + weakest[0].slice(1)} (${weakest[1]}/5)
        </div>
      `);
    }
    
    // Stream-specific analysis
    const streamAnalysis = {
      'Science': 'Your performance in Physics, Chemistry, and Mathematics indicates strong analytical and problem-solving skills suitable for science-based careers.',
      'Commerce': 'Your mathematical reasoning and analytical thinking skills make you well-suited for business and commerce-related fields.',
      'Arts': 'Your diverse skill set and reasoning abilities open up opportunities in humanities, social sciences, and creative fields.'
    };
    
    analysis.push(`
      <div class="analysis-item">
        <strong>🎯 Career Guidance:</strong> ${streamAnalysis[recommendedStream]}
      </div>
    `);
    
    return analysis.join('');
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = new PDFGenerator();
