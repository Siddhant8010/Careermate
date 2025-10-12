// Global state
let currentPage = "dashboard"
let sidebarOpen = false

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  showPage("dashboard")
  updateActiveNavItem("dashboard")
  loadAvailableTests()
})

// Navigation functions
function showPage(pageId) {
  // Hide all pages
  const pages = document.querySelectorAll(".page")
  pages.forEach((page) => page.classList.remove("active"))

  // Show selected page
  const targetPage = document.getElementById(pageId + "-page")
  if (targetPage) {
    targetPage.classList.add("active")
    currentPage = pageId
    updateActiveNavItem(pageId)
  }

  // Close sidebar on mobile after navigation
  if (window.innerWidth <= 768) {
    closeSidebar()
  }
}

function updateActiveNavItem(pageId) {
  // Remove active class from all nav items
  const navItems = document.querySelectorAll(".nav-item")
  navItems.forEach((item) => item.classList.remove("active"))

  // Add active class to current nav item
  const activeItem = document.querySelector(`[data-page="${pageId}"]`)
  if (activeItem) {
    activeItem.classList.add("active")
  }
}

// Profile dropdown functions
function toggleProfileDropdown() {
  const dropdown = document.getElementById("profileDropdown")
  dropdown.classList.toggle("show")

  // Close dropdown when clicking outside
  document.addEventListener("click", function closeDropdown(e) {
    if (!e.target.closest(".profile-dropdown")) {
      dropdown.classList.remove("show")
      document.removeEventListener("click", closeDropdown)
    }
  })
}

// Mobile sidebar functions
function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar")
  sidebar.classList.toggle("show")
  sidebarOpen = !sidebarOpen
}

function closeSidebar() {
  const sidebar = document.querySelector(".sidebar")
  sidebar.classList.remove("show")
  sidebarOpen = false
}

// Interactive functions
function takeTest() {
  window.location.href = '/test-rules';
}

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    // Clear session and redirect to main page
    fetch('/logout', { method: 'POST' })
      .then(() => {
        window.location.href = '/';
      })
      .catch(() => {
        // Fallback: just redirect to main page
        window.location.href = '/';
      });
  }
}

// Progress animation
function animateProgress() {
  const progressBars = document.querySelectorAll(".progress-fill")
  progressBars.forEach((bar) => {
    // Get width from data attribute or existing style
    const width = bar.dataset.width ? `${bar.dataset.width}%` : bar.style.width
    bar.style.width = "0%"
    setTimeout(() => {
      bar.style.width = width
    }, 500)
  })
}

// Initialize animations when page loads
window.addEventListener("load", () => {
  setTimeout(animateProgress, 1000)
})

// Handle window resize
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    closeSidebar()
  }
})

// Smooth scrolling for better UX
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href")
    // Only handle if href is not just "#" and has content after the hash
    if (href && href.length > 1 && href !== "#") {
      e.preventDefault()
      try {
        const target = document.querySelector(href)
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }
      } catch (error) {
        console.warn('Invalid selector:', href)
      }
    }
  })
})

// Fetch and update dashboard stats
async function refreshDashboardStats() {
  try {
    const response = await fetch('/api/dashboard/stats');
    if (response.ok) {
      const stats = await response.json();
      console.log('📊 Dashboard stats updated:', stats);
      
      // Update UI elements if they exist
      const testsCompletedEl = document.querySelector('.stat-number');
      if (testsCompletedEl && stats.testsCompleted !== undefined) {
        testsCompletedEl.textContent = stats.testsCompleted;
      }
    }
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
  }
}

// Auto-refresh stats every 30 seconds if on dashboard page
setInterval(() => {
  if (currentPage === 'dashboard') {
    refreshDashboardStats();
  }
}, 30000);

// Load available tests from backend
async function loadAvailableTests() {
  try {
    const response = await fetch('/api/tests');
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.tests) {
        console.log(`✅ Loaded ${data.tests.length} tests`);
        displayAvailableTests(data.tests);
      }
    }
  } catch (error) {
    console.error('Failed to load tests:', error);
  }
}

// Display available tests in the dashboard
function displayAvailableTests(tests) {
  const testsContainer = document.getElementById('available-tests-container');
  if (!testsContainer) return;
  
  testsContainer.innerHTML = '';
  
  tests.forEach(test => {
    const testCard = document.createElement('div');
    testCard.className = 'test-card';
    
    testCard.innerHTML = `
      <h4>${test.name}</h4>
      <p>${test.description}</p>
      <button class="btn btn-primary" onclick="startTest('${test._id}')">Start Test</button>
    `;
    testsContainer.appendChild(testCard);
  });
}

// Start a specific test
function startTest(testId) {
  // Redirect to test page with test ID
  window.location.href = `/test?testId=${testId}`;
}
// Theme toggle
function toggleTheme() {
  const body = document.body
  const themeIcon = document.getElementById("theme-icon")

  body.classList.toggle("dark-mode")

  if (body.classList.contains("dark-mode")) {
    themeIcon.classList.remove("fa-moon")
    themeIcon.classList.add("fa-sun")
    localStorage.setItem("theme", "dark")
  } else {
    themeIcon.classList.remove("fa-sun")
    themeIcon.classList.add("fa-moon")
    localStorage.setItem("theme", "light")
  }
}

// Load saved theme
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme")
  const body = document.body
  const themeIcon = document.getElementById("theme-icon")

  if (savedTheme === "dark") {
    body.classList.add("dark-mode")
    themeIcon.classList.remove("fa-moon")
    themeIcon.classList.add("fa-sun")
  }
})

// Stream Details Modal Functions
function openStreamDetails(streamType) {
  const modal = document.getElementById('streamModal');
  const modalContent = modal.querySelector('.modal-content');
  const modalHeader = modal.querySelector('.modal-header');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  
  // Remove existing stream classes
  modalContent.classList.remove('science-modal', 'commerce-modal', 'arts-modal');
  modalHeader.classList.remove('science-header', 'commerce-header', 'arts-header');
  
  // Add stream-specific classes
  modalContent.classList.add(`${streamType}-modal`);
  modalHeader.classList.add(`${streamType}-header`);
  
  // Set modal title
  const streamTitles = {
    'science': 'Science Stream - Detailed Information',
    'commerce': 'Commerce Stream - Detailed Information',
    'arts': 'Arts Stream - Detailed Information'
  };
  
  modalTitle.textContent = streamTitles[streamType];
  
  // Set modal content based on stream type
  modalBody.innerHTML = getStreamContent(streamType);
  
  // Show modal
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeStreamDetails() {
  const modal = document.getElementById('streamModal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto'; // Restore scrolling
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('streamModal');
  if (event.target === modal) {
    closeStreamDetails();
  }
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeStreamDetails();
  }
});

function getStreamContent(streamType) {
  const streamData = {
    science: {
      title: "Science Stream",
      overview: "Science stream is the gateway to innovation, research, and technological advancement. It empowers students to understand the natural world, develop cutting-edge technologies, and contribute to solving humanity's greatest challenges through scientific inquiry and evidence-based solutions.",
      stats: [
        { number: "40+", label: "Career Options" },
        { number: "₹3-50L", label: "Salary Range" },
        { number: "85%", label: "Job Growth Rate" },
        { number: "12th", label: "Entry Level" }
      ],
      categories: [
        {
          title: "Engineering & Technology",
          icon: "fas fa-cogs",
          careers: [
            { name: "Software Engineer", salary: "₹6-25 LPA" },
            { name: "Data Scientist", salary: "₹8-30 LPA" },
            { name: "AI/ML Engineer", salary: "₹10-40 LPA" },
            { name: "Cybersecurity Specialist", salary: "₹7-28 LPA" },
            { name: "Mechanical Engineer", salary: "₹4-15 LPA" },
            { name: "Civil Engineer", salary: "₹3-12 LPA" },
            { name: "Electrical Engineer", salary: "₹4-18 LPA" },
            { name: "Aerospace Engineer", salary: "₹6-25 LPA" },
            { name: "Chemical Engineer", salary: "₹5-20 LPA" },
            { name: "Robotics Engineer", salary: "₹8-30 LPA" }
          ]
        },
        {
          title: "Medical & Healthcare",
          icon: "fas fa-heartbeat",
          careers: [
            { name: "Doctor (MBBS)", salary: "₹8-25 LPA" },
            { name: "Surgeon", salary: "₹15-50 LPA" },
            { name: "Dentist", salary: "₹6-20 LPA" },
            { name: "Pharmacist", salary: "₹3-8 LPA" },
            { name: "Physiotherapist", salary: "₹3-10 LPA" },
            { name: "Medical Researcher", salary: "₹6-20 LPA" },
            { name: "Biotechnologist", salary: "₹4-15 LPA" },
            { name: "Biomedical Engineer", salary: "₹5-18 LPA" },
            { name: "Veterinarian", salary: "₹4-12 LPA" },
            { name: "Radiologist", salary: "₹12-40 LPA" }
          ]
        },
        {
          title: "Research & Academia",
          icon: "fas fa-microscope",
          careers: [
            { name: "Research Scientist", salary: "₹6-20 LPA" },
            { name: "Professor", salary: "₹8-25 LPA" },
            { name: "Lab Technician", salary: "₹2-6 LPA" },
            { name: "Environmental Scientist", salary: "₹4-12 LPA" },
            { name: "Space Scientist", salary: "₹8-30 LPA" },
            { name: "Forensic Scientist", salary: "₹4-10 LPA" },
            { name: "Marine Biologist", salary: "₹5-15 LPA" },
            { name: "Geologist", salary: "₹4-12 LPA" },
            { name: "Meteorologist", salary: "₹5-15 LPA" },
            { name: "Nuclear Physicist", salary: "₹8-25 LPA" }
          ]
        }
      ],
      requirements: [
        "Strong foundation in Physics, Chemistry, Mathematics",
        "Analytical and problem-solving skills",
        "Curiosity about natural phenomena and scientific processes",
        "Attention to detail and precision in work",
        "Willingness to pursue higher education and continuous learning",
        "Good mathematical and computational aptitude",
        "Laboratory skills and safety awareness",
        "Critical thinking and research methodology"
      ],
      additionalInfo: [
        {
          title: "Popular Entrance Exams",
          content: "JEE Main/Advanced, NEET, BITSAT, VITEEE, COMEDK, State Engineering/Medical entrance exams"
        },
        {
          title: "Higher Education Options",
          content: "B.Tech, B.E., MBBS, BDS, B.Sc., B.Pharma, B.Arch, Integrated M.Sc., Dual Degree Programs"
        },
        {
          title: "Industry Growth",
          content: "Technology, Healthcare, Space, Renewable Energy, Biotechnology sectors showing 15-25% annual growth"
        },
        {
          title: "Global Opportunities",
          content: "High demand for Indian science graduates in USA, Canada, Germany, Australia, and other developed nations"
        }
      ]
    },
    commerce: {
      title: "Commerce Stream",
      overview: "Commerce stream is the gateway to the dynamic world of business, finance, and entrepreneurship. It prepares students to become future business leaders, financial experts, and innovative entrepreneurs who drive economic growth and create value in the global marketplace.",
      stats: [
        { number: "35+", label: "Career Options" },
        { number: "₹3-50L", label: "Salary Range" },
        { number: "78%", label: "Job Growth Rate" },
        { number: "12th", label: "Entry Level" }
      ],
      categories: [
        {
          title: "Finance & Banking",
          icon: "fas fa-university",
          careers: [
            { name: "Chartered Accountant", salary: "₹6-20 LPA" },
            { name: "Investment Banker", salary: "₹10-50 LPA" },
            { name: "Financial Analyst", salary: "₹5-15 LPA" },
            { name: "Bank Manager", salary: "₹6-18 LPA" },
            { name: "Tax Consultant", salary: "₹4-12 LPA" },
            { name: "Insurance Underwriter", salary: "₹4-14 LPA" },
            { name: "Financial Planner", salary: "₹5-18 LPA" },
            { name: "Credit Analyst", salary: "₹4-12 LPA" },
            { name: "Risk Manager", salary: "₹8-25 LPA" },
            { name: "Portfolio Manager", salary: "₹12-40 LPA" }
          ]
        },
        {
          title: "Business & Management",
          icon: "fas fa-briefcase",
          careers: [
            { name: "Business Analyst", salary: "₹5-15 LPA" },
            { name: "Marketing Manager", salary: "₹6-20 LPA" },
            { name: "HR Manager", salary: "₹5-18 LPA" },
            { name: "Operations Manager", salary: "₹6-22 LPA" },
            { name: "Entrepreneur", salary: "Variable" },
            { name: "Management Consultant", salary: "₹8-30 LPA" },
            { name: "Project Manager", salary: "₹7-25 LPA" },
            { name: "Supply Chain Manager", salary: "₹6-20 LPA" },
            { name: "Brand Manager", salary: "₹8-25 LPA" },
            { name: "Business Development Manager", salary: "₹6-22 LPA" }
          ]
        },
        {
          title: "Digital & E-commerce",
          icon: "fas fa-shopping-cart",
          careers: [
            { name: "Digital Marketing Specialist", salary: "₹4-12 LPA" },
            { name: "E-commerce Manager", salary: "₹5-15 LPA" },
            { name: "Social Media Manager", salary: "₹3-8 LPA" },
            { name: "SEO/SEM Specialist", salary: "₹4-12 LPA" },
            { name: "Sales Manager", salary: "₹4-15 LPA" },
            { name: "Product Manager", salary: "₹8-25 LPA" },
            { name: "Content Marketing Manager", salary: "₹5-15 LPA" },
            { name: "Data Analyst", salary: "₹5-18 LPA" },
            { name: "Customer Success Manager", salary: "₹6-18 LPA" },
            { name: "Growth Hacker", salary: "₹6-20 LPA" }
          ]
        }
      ],
      requirements: [
        "Strong foundation in Economics, Business Studies, Accountancy",
        "Excellent numerical and analytical skills",
        "Outstanding communication and interpersonal abilities",
        "Deep interest in current affairs and market trends",
        "Leadership qualities and decision-making skills",
        "Advanced computer and digital literacy",
        "Understanding of financial markets and instruments",
        "Strategic thinking and business acumen"
      ],
      additionalInfo: [
        {
          title: "Popular Entrance Exams",
          content: "CAT, XAT, SNAP, NMAT, MAT, CMAT, CLAT, DU JAT, IPU CET, State University entrance exams"
        },
        {
          title: "Higher Education Options",
          content: "B.Com, BBA, B.Econ, CA, CS, CMA, MBA, M.Com, LLB, Integrated Law Programs"
        },
        {
          title: "Industry Growth",
          content: "FinTech, E-commerce, Digital Marketing, Consulting sectors experiencing 20-30% annual growth"
        },
        {
          title: "Entrepreneurship Opportunities",
          content: "Strong foundation for starting own business, with government support through Startup India initiative"
        }
      ]
    },
    arts: {
      title: "Arts Stream",
      overview: "Arts stream opens doors to diverse and meaningful careers in creative fields, social sciences, public service, and humanities. It's perfect for students passionate about literature, history, politics, human behavior, and making a positive impact on society through creative expression and social change.",
      stats: [
        { number: "45+", label: "Career Options" },
        { number: "₹3-40L", label: "Salary Range" },
        { number: "72%", label: "Job Growth Rate" },
        { number: "12th", label: "Entry Level" }
      ],
      categories: [
        {
          title: "Government & Public Service",
          icon: "fas fa-landmark",
          careers: [
            { name: "IAS Officer", salary: "₹7-15 LPA" },
            { name: "IPS Officer", salary: "₹7-15 LPA" },
            { name: "IFS Officer", salary: "₹8-20 LPA" },
            { name: "Judge", salary: "₹10-25 LPA" },
            { name: "Diplomat", salary: "₹8-20 LPA" },
            { name: "Government Teacher", salary: "₹4-10 LPA" },
            { name: "Policy Analyst", salary: "₹6-15 LPA" },
            { name: "Public Administrator", salary: "₹5-12 LPA" },
            { name: "Election Commissioner", salary: "₹8-18 LPA" },
            { name: "Municipal Commissioner", salary: "₹6-15 LPA" }
          ]
        },
        {
          title: "Media & Communication",
          icon: "fas fa-newspaper",
          careers: [
            { name: "Journalist", salary: "₹4-12 LPA" },
            { name: "News Anchor", salary: "₹6-20 LPA" },
            { name: "Content Writer", salary: "₹3-8 LPA" },
            { name: "Film Director", salary: "₹5-25 LPA" },
            { name: "Radio Jockey", salary: "₹3-10 LPA" },
            { name: "Public Relations Manager", salary: "₹5-15 LPA" },
            { name: "Documentary Filmmaker", salary: "₹4-18 LPA" },
            { name: "Editor", salary: "₹4-12 LPA" },
            { name: "Screenwriter", salary: "₹5-20 LPA" },
            { name: "Media Researcher", salary: "₹4-10 LPA" }
          ]
        },
        {
          title: "Social Sciences & Psychology",
          icon: "fas fa-brain",
          careers: [
            { name: "Clinical Psychologist", salary: "₹5-18 LPA" },
            { name: "Social Worker", salary: "₹3-8 LPA" },
            { name: "Counselor", salary: "₹4-12 LPA" },
            { name: "Historian", salary: "₹4-10 LPA" },
            { name: "Anthropologist", salary: "₹5-15 LPA" },
            { name: "Sociologist", salary: "₹4-12 LPA" },
            { name: "Political Scientist", salary: "₹5-15 LPA" },
            { name: "Criminologist", salary: "₹5-12 LPA" },
            { name: "Human Rights Activist", salary: "₹4-10 LPA" },
            { name: "Research Analyst", salary: "₹5-15 LPA" }
          ]
        },
        {
          title: "Creative & Design",
          icon: "fas fa-palette",
          careers: [
            { name: "Graphic Designer", salary: "₹3-12 LPA" },
            { name: "Fashion Designer", salary: "₹4-15 LPA" },
            { name: "Interior Designer", salary: "₹4-18 LPA" },
            { name: "Artist", salary: "₹3-25 LPA" },
            { name: "Photographer", salary: "₹3-15 LPA" },
            { name: "Art Director", salary: "₹6-20 LPA" },
            { name: "Creative Writer", salary: "₹4-12 LPA" },
            { name: "Theatre Artist", salary: "₹3-15 LPA" },
            { name: "Museum Curator", salary: "₹4-10 LPA" },
            { name: "Art Therapist", salary: "₹4-12 LPA" }
          ]
        }
      ],
      requirements: [
        "Exceptional language and communication skills",
        "Critical thinking and analytical abilities",
        "Deep interest in human behavior and society",
        "Creative and artistic inclination",
        "Excellent memory and retention skills",
        "Strong empathy and social awareness",
        "Cultural sensitivity and global perspective",
        "Research and writing capabilities"
      ],
      additionalInfo: [
        {
          title: "Popular Entrance Exams",
          content: "UPSC CSE, CLAT, JMI, BHU UET, DU JAT, NIFT, NID, FTII, State PSC exams"
        },
        {
          title: "Higher Education Options",
          content: "BA, B.Des, BFA, BSW, LLB, MA, MSW, MFA, PhD, Integrated Programs, Diploma courses"
        },
        {
          title: "Industry Growth",
          content: "Digital Media, Content Creation, Social Work, Design sectors showing 18-25% growth annually"
        },
        {
          title: "Social Impact",
          content: "High potential for creating positive social change through policy, media, education, and creative expression"
        }
      ]
    }
  };

  const data = streamData[streamType];
  
  return `
    <div class="stream-hero">
      <h3>${data.title}</h3>
      <p>${data.overview}</p>
    </div>
    
    <div class="stream-stats">
      ${data.stats.map(stat => `
        <div class="stat-item">
          <span class="stat-number">${stat.number}</span>
          <span class="stat-label">${stat.label}</span>
        </div>
      `).join('')}
    </div>
    
    <div class="content-section">
      <h4 class="section-title">
        <i class="fas fa-briefcase"></i>
        Career Opportunities
      </h4>
      <div class="career-categories">
        ${data.categories.map(category => `
          <div class="career-category">
            <h4><i class="${category.icon}"></i> ${category.title}</h4>
            <ul>
              ${category.careers.map(career => `
                <li>
                  <span class="career-name">${career.name}</span>
                  <span class="salary-range">${career.salary}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
      
      <div class="requirements-section">
        <h4 class="section-title">
          <i class="fas fa-check-circle"></i>
          Key Requirements & Skills
        </h4>
        <div class="requirements-grid">
          ${data.requirements.map(req => `
            <div class="requirement-item">
              <i class="fas fa-arrow-right"></i>
              <span>${req}</span>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="additional-info">
        <h4><i class="fas fa-info-circle"></i> Additional Information</h4>
        <div class="info-grid">
          ${data.additionalInfo.map(info => `
            <div class="info-item">
              <h5>${info.title}</h5>
              <p>${info.content}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

