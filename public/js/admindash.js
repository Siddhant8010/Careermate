// Data Storage
let users = []
let tests = [
  { id: 'aptitude', name: 'Aptitude Test', description: 'Career aptitude assessment based on subject performance' }
]
let questions = []
let results = []
let careers = []

// Initialize the application
document.addEventListener("DOMContentLoaded", async () => {
  initializeTheme()
  await loadAdminProfile()
  initializeNavigation()
  
  // Load real data from backend first
  await loadDashboardData()
  
  // Only use sample data if backend fails AND no localStorage data
  if (users.length === 0 && tests.length === 0 && results.length === 0) {
    loadDataFromStorage()
    if (users.length === 0) {
      console.log('No backend data available, using sample data')
      initializeSampleData()
    }
  }
  
  // Render initial page
  updateDashboardStats()
  renderAllData()
  
  // Show dashboard page first
  showPage('dashboard')
  
  // Initialize charts after data is loaded and page is visible
  setTimeout(() => {
    console.log('Attempting to initialize charts...')
    initializeCharts()
  }, 1000)
})

// Admin Profile Management
async function loadAdminProfile() {
  try {
    const response = await fetch('/admin/profile', {
      method: 'GET',
      credentials: 'include',
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.admin) {
        document.getElementById('admin-username').textContent = data.admin.username
        // Update avatar with admin's name
        const avatarImg = document.getElementById('admin-avatar')
        avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.admin.username)}&background=667eea&color=fff&size=80`
      }
    }
  } catch (error) {
    console.log('Using default admin profile')
  }
}

// Logout Handler
async function handleLogout() {
  if (!confirm('Are you sure you want to logout?')) {
    return
  }
  
  try {
    const response = await fetch('/admin/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    const data = await response.json()
    
    if (data.success) {
      // Clear local storage
      localStorage.removeItem('careermate_users')
      localStorage.removeItem('careermate_tests')
      localStorage.removeItem('careermate_questions')
      localStorage.removeItem('careermate_results')
      localStorage.removeItem('careermate_careers')
      
      // Redirect to login page
      window.location.href = '/login?admin=true'
    } else {
      alert('Logout failed. Please try again.')
    }
  } catch (error) {
    console.error('Logout error:', error)
    alert('An error occurred during logout.')
  }
}

// Theme management functions
function initializeTheme() {
  const savedTheme = localStorage.getItem("careermate_theme") || "light"
  document.documentElement.setAttribute("data-theme", savedTheme)
  updateThemeIcon(savedTheme)
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme")
  const newTheme = currentTheme === "dark" ? "light" : "dark"

  document.documentElement.setAttribute("data-theme", newTheme)
  localStorage.setItem("careermate_theme", newTheme)
  updateThemeIcon(newTheme)
  
  // Update charts with new theme colors
  updateChartsTheme()
}

function updateThemeIcon(theme) {
  const themeIcon = document.querySelector(".theme-icon")
  if (themeIcon) {
    themeIcon.textContent = theme === "dark" ? "☀️" : "🌙"
  }
}

// Navigation functionality
function initializeNavigation() {
  const navLinks = document.querySelectorAll(".nav-link")
  const mobileToggle = document.querySelector(".mobile-menu-toggle")

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()
      const page = this.getAttribute("data-page")
      showPage(page)

      // Update active nav link
      navLinks.forEach((l) => l.classList.remove("active"))
      this.classList.add("active")
    })
  })

  mobileToggle.addEventListener("click", toggleMobileMenu)
}

function showPage(pageId) {
  // Close mobile menu when navigating on mobile
  if (window.innerWidth <= 768) {
    closeMobileMenu()
  }

  // Hide all pages
  const pages = document.querySelectorAll(".page")
  pages.forEach((page) => page.classList.remove("active"))

  // Show selected page
  const targetPage = document.getElementById(pageId + "-page")
  if (targetPage) {
    targetPage.classList.add("active")

    // Load page-specific data
    switch (pageId) {
      case "dashboard":
        updateDashboardStats()
        break
      case "users":
        renderUsers()
        break
      case "tests":
        renderTests()
        break
      case "questions":
        loadTestSelector()
        loadQuestionsFromBackend() // Reload questions from backend when accessing questions page
        break
      case "results":
        renderResults()
        break
      case "careers":
        renderCareers()
        break
    }
  }
}

// Mobile menu functionality
function toggleMobileMenu() {
  const sidebar = document.getElementById("sidebar")
  const overlay = document.getElementById("mobile-overlay")
  const toggle = document.querySelector(".mobile-menu-toggle")

  sidebar.classList.toggle("mobile-open")
  overlay.classList.toggle("active")
  toggle.classList.toggle("active")

  // Prevent body scroll when menu is open
  document.body.style.overflow = sidebar.classList.contains("mobile-open") ? "hidden" : ""
}

function closeMobileMenu() {
  const sidebar = document.getElementById("sidebar")
  const overlay = document.getElementById("mobile-overlay")
  const toggle = document.querySelector(".mobile-menu-toggle")

  sidebar.classList.remove("mobile-open")
  overlay.classList.remove("active")
  toggle.classList.remove("active")
  document.body.style.overflow = ""
}

// Window resize handler to manage mobile menu state
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    closeMobileMenu()
  }
})

// Data Management Functions
function loadDataFromStorage() {
  users = JSON.parse(localStorage.getItem("careermate_users") || "[]")
  tests = JSON.parse(localStorage.getItem("careermate_tests") || "[]")
  questions = JSON.parse(localStorage.getItem("careermate_questions") || "[]")
  results = JSON.parse(localStorage.getItem("careermate_results") || "[]")
  careers = JSON.parse(localStorage.getItem("careermate_careers") || "[]")
}

function saveDataToStorage() {
  localStorage.setItem("careermate_users", JSON.stringify(users))
  localStorage.setItem("careermate_tests", JSON.stringify(tests))
  localStorage.setItem("careermate_questions", JSON.stringify(questions))
  localStorage.setItem("careermate_results", JSON.stringify(results))
  localStorage.setItem("careermate_careers", JSON.stringify(careers))
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Load Dashboard Data from Backend
async function loadDashboardData() {
  try {
    console.log('🔄 Loading dashboard data from backend...')
    
    // Load all data in parallel
    const [statsLoaded, usersLoaded, questionsLoaded, resultsLoaded, testsLoaded] = await Promise.all([
      loadStatsFromBackend(),
      loadUsersFromBackend(),
      loadQuestionsFromBackend(),
      loadResultsFromBackend(),
      loadTestsFromBackend()
    ])
    
    if (statsLoaded || usersLoaded || questionsLoaded || resultsLoaded) {
      console.log('✅ Backend data loaded successfully')
      updateDashboardStats()
      return true
    } else {
      console.log('⚠️ Backend not available, using fallback')
      return false
    }
  } catch (error) {
    console.error('❌ Error loading dashboard data:', error)
    return false
  }
}

// Load Stats from Backend
async function loadStatsFromBackend() {
  try {
    const response = await fetch('/api/admin/stats', {
      method: 'GET',
      credentials: 'include',
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.stats) {
        document.getElementById("total-users").textContent = data.stats.totalUsers || 0
        document.getElementById("total-questions").textContent = data.stats.totalQuestions || 0
        document.getElementById("total-results").textContent = data.stats.totalResults || 0
        document.getElementById("total-tests").textContent = 4 // 4 subjects (physics, chemistry, maths, biology)
        return true
      }
    }
    return false
  } catch (error) {
    console.log('Stats API unavailable')
    return false
  }
}

// Dashboard Functions
function updateDashboardStats() {
  document.getElementById("total-users").textContent = users.length
  document.getElementById("total-questions").textContent = questions.length
  document.getElementById("total-results").textContent = results.length
  document.getElementById("total-tests").textContent = 4 // 4 subjects (physics, chemistry, maths, biology)
}

// Load Users from Backend
async function loadUsersFromBackend() {
  try {
    const response = await fetch('/api/admin/users', {
      method: 'GET',
      credentials: 'include',
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.users) {
        users = data.users.map(user => ({
          id: user._id,
          name: user.username,
          email: user.email,
          registrationDate: user.createdAt,
        }))
        console.log(`✅ Loaded ${users.length} users from backend`)
        renderUsers()
        return true
      }
    }
    return false
  } catch (error) {
    console.log('Failed to load users from backend:', error)
    return false
  }
}

// Load Questions from Backend
async function loadQuestionsFromBackend() {
  try {
    const response = await fetch('/api/admin/questions', {
      method: 'GET',
      credentials: 'include',
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.questions) {
        // Transform backend questions to frontend format
        questions = data.questions.map(q => ({
          id: q._id,
          testId: q.subject,
          text: q.questionText,
          answers: q.options,
          correctAnswer: q.options.indexOf(q.correctAnswer),
        }))
        console.log(`✅ Loaded ${questions.length} questions from backend`)
        console.log('Questions by subject:', questions.reduce((acc, q) => {
          acc[q.testId] = (acc[q.testId] || 0) + 1
          return acc
        }, {}))
        // Refresh charts after loading questions
        setTimeout(() => {
          if (typeof Chart !== 'undefined') {
            initializeCharts()
          }
        }, 100)
        return true
      }
    }
    return false
  } catch (error) {
    console.log('Failed to load questions from backend:', error)
    return false
  }
}

// Load Results from Backend
async function loadResultsFromBackend() {
  try {
    const response = await fetch('/api/admin/results', {
      method: 'GET',
      credentials: 'include',
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.results) {
        results = data.results.map(r => ({
          id: r._id,
          _id: r._id,
          userId: r.userId?._id,
          userName: r.username || r.userId?.username,
          userEmail: r.userId?.email,
          testId: r.testId,
          subject: r.subject,
          score: r.score || r.totalScore,
          totalScore: r.totalScore,
          correctAnswers: r.correctAnswers,
          totalQuestions: r.totalQuestions,
          suggestedCareer: r.suggestedCareer,
          careerSuggestion: r.careerSuggestion,
          dateTaken: r.createdAt,
          createdAt: r.createdAt,
          completedAt: r.completedAt,
        }))
        renderResults()
        console.log(`✅ Loaded ${results.length} results from backend`)
        // Refresh charts after loading results
        setTimeout(() => {
          if (typeof Chart !== 'undefined') {
            initializeCharts()
          }
        }, 100)
        return true
      }
    }
    return false
  } catch (error) {
    console.log('Failed to load results from backend:', error)
    return false
  }
}

// Load Tests from Backend (removed - no custom tests)
async function loadTestsFromBackend() {
  // No custom tests - only 4 default subjects
  return true
}

// Refresh Questions
async function refreshQuestions() {
  showNotification('Refreshing questions...', 'info')
  await loadQuestionsFromBackend()
  loadQuestions() // Reload the current subject questions
  showNotification('Questions refreshed successfully', 'success')
}

// Delete Result
async function deleteResult(resultId) {
  if (!confirm('Are you sure you want to delete this result?')) {
    return
  }

  try {
    const response = await fetch(`/api/admin/results/${resultId}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        showNotification('Result deleted successfully', 'success')
        results = results.filter((r) => (r.id || r._id) !== resultId)
        renderResults()
        updateDashboardStats()
        return
      }
    }
    showNotification('Failed to delete result', 'error')
  } catch (error) {
    console.error('Delete result error:', error)
    showNotification('Error deleting result', 'error')
  }
}

// Users Management
function renderUsers() {
  const tbody = document.getElementById("users-table-body")
  tbody.innerHTML = ""

  users.forEach((user) => {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${new Date(user.registrationDate).toLocaleDateString()}</td>
            <td class="action-buttons-table">
                <button class="btn btn-secondary btn-small" onclick="editUser('${user.id}')">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteUser('${user.id}')">Delete</button>
            </td>
        `
    tbody.appendChild(row)
  })
}

function showAddUserModal() {
  const modalTitle = document.getElementById("modal-title")
  const modalBody = document.getElementById("modal-body")

  modalTitle.textContent = "Add New User"
  modalBody.innerHTML = `
        <form onsubmit="addUser(event)">
            <div class="form-group">
                <label for="user-name">Name</label>
                <input type="text" id="user-name" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="user-email">Email</label>
                <input type="email" id="user-email" class="form-control" required>
            </div>
            <div class="form-group">
                <button type="submit" class="btn btn-primary">Add User</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `

  showModal()
}

async function addUser(event) {
  event.preventDefault()

  const name = document.getElementById("user-name").value
  const email = document.getElementById("user-email").value

  try {
    // For now, just add locally since we don't have a create user API
    const newUser = {
      id: generateId(),
      name: name,
      email: email,
      registrationDate: new Date().toISOString(),
    }

    users.push(newUser)
    saveDataToStorage()
    renderUsers()
    updateDashboardStats()
    closeModal()
    showNotification('User added successfully', 'success')
  } catch (error) {
    console.error('Add user error:', error)
    showNotification('Failed to add user', 'error')
  }
}

function editUser(userId) {
  const user = users.find((u) => u.id === userId)
  if (!user) return

  const modalTitle = document.getElementById("modal-title")
  const modalBody = document.getElementById("modal-body")

  modalTitle.textContent = "Edit User"
  modalBody.innerHTML = `
        <form onsubmit="updateUser(event, '${userId}')">
            <div class="form-group">
                <label for="edit-user-name">Name</label>
                <input type="text" id="edit-user-name" class="form-control" value="${user.name}" required>
            </div>
            <div class="form-group">
                <label for="edit-user-email">Email</label>
                <input type="email" id="edit-user-email" class="form-control" value="${user.email}" required>
            </div>
            <div class="form-group">
                <button type="submit" class="btn btn-primary">Update User</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `

  showModal()
}

function updateUser(event, userId) {
  event.preventDefault()

  const name = document.getElementById("edit-user-name").value
  const email = document.getElementById("edit-user-email").value

  const userIndex = users.findIndex((u) => u.id === userId)
  if (userIndex !== -1) {
    users[userIndex].name = name
    users[userIndex].email = email

    saveDataToStorage()
    renderUsers()
    closeModal()
  }
}

async function deleteUser(userId) {
  if (!confirm("Are you sure you want to delete this user?")) {
    return
  }
  
  try {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        users = users.filter((u) => u.id !== userId)
        results = results.filter((r) => r.userId !== userId)
        saveDataToStorage()
        renderUsers()
        updateDashboardStats()
        alert('User deleted successfully')
      }
    } else {
      alert('Failed to delete user')
    }
  } catch (error) {
    console.error('Delete user error:', error)
    // Fallback to local deletion
    users = users.filter((u) => u.id !== userId)
    results = results.filter((r) => r.userId !== userId)
    saveDataToStorage()
    renderUsers()
    updateDashboardStats()
  }
}

// Tests Management
function renderTests() {
  const tbody = document.getElementById("tests-table-body")
  tbody.innerHTML = ""

  // Show default subject tests only
  const subjects = ['physics', 'chemistry', 'maths', 'biology', 'logicalreasoning']
  
  subjects.forEach((subject) => {
    const subjectQuestions = questions.filter((q) => q.testId === subject)
    const row = document.createElement("tr")
    row.innerHTML = `
            <td>${subject}</td>
            <td>${subject.charAt(0).toUpperCase() + subject.slice(1)} Test</td>
            <td>Subject-based aptitude assessment for ${subject}</td>
            <td>${subjectQuestions.length}</td>
            <td><span style="color: #10b981; font-weight: 600;">Active</span></td>
            <td class="action-buttons-table">
                <button class="btn btn-secondary btn-small" onclick="viewTestQuestions('${subject}')">View Questions</button>
            </td>
        `
    tbody.appendChild(row)
  })
  
  // Add overall test summary
  if (questions.length > 0) {
    const totalRow = document.createElement("tr")
    totalRow.style.fontWeight = '600'
    totalRow.style.background = 'var(--bg-tertiary)'
    totalRow.innerHTML = `
            <td colspan="3"><strong>Total Questions Across All Tests</strong></td>
            <td><strong>${questions.length}</strong></td>
            <td colspan="2"></td>
        `
    tbody.appendChild(totalRow)
  }
}

// View test questions
function viewTestQuestions(subject) {
  // Switch to questions page and select the subject
  showPage('questions')
  const selector = document.getElementById('test-selector')
  if (selector) {
    selector.value = subject
    loadQuestions()
  }
}

function showAddTestModal() {
  const modalTitle = document.getElementById("modal-title")
  const modalBody = document.getElementById("modal-body")

  modalTitle.textContent = "Add New Test"
  modalBody.innerHTML = `
        <form onsubmit="addTest(event)">
            <div class="form-group">
                <label for="test-name">Test Name</label>
                <input type="text" id="test-name" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="test-description">Description</label>
                <textarea id="test-description" class="form-control" required></textarea>
            </div>
            <div class="form-group">
                <button type="submit" class="btn btn-primary">Add Test</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `

  showModal()
}

function editTest(testId) {
  const test = tests.find((t) => t.id === testId)
  if (!test) return

  const modalTitle = document.getElementById("modal-title")
  const modalBody = document.getElementById("modal-body")

  modalTitle.textContent = "Edit Test"
  modalBody.innerHTML = `
        <form onsubmit="updateTest(event, '${testId}')">
            <div class="form-group">
                <label for="edit-test-name">Test Name</label>
                <input type="text" id="edit-test-name" class="form-control" value="${test.name}" required>
            </div>
            <div class="form-group">
                <label for="edit-test-description">Description</label>
                <textarea id="edit-test-description" class="form-control" required>${test.description}</textarea>
            </div>
            <div class="form-group">
                <button type="submit" class="btn btn-primary">Update Test</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `

  showModal()
}

async function updateTest(event, testId) {
  event.preventDefault()

  const name = document.getElementById("edit-test-name").value
  const description = document.getElementById("edit-test-description").value

  try {
    // Try backend API first
    console.log('📤 Updating test:', testId, { name, description })
    const response = await fetch(`/api/admin/tests/${testId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, description }),
    })

    if (response.ok) {
      const data = await response.json()
      console.log('📥 Update response:', data)
      
      if (data.success) {
        showNotification('Test updated in database! ✅', 'success')
        await loadTestsFromBackend()
        renderTests()
        loadTestSelector()
        closeModal()
        return
      }
    }
    
    showNotification('Failed to update test', 'error')
    closeModal()
  } catch (error) {
    console.error('❌ Update error:', error)
    showNotification('Network error: Cannot update test', 'error')
    closeModal()
  }
}

async function deleteTest(testId) {
  if (!confirm("Are you sure you want to delete this test? This will also delete all related questions and results.")) {
    return
  }
  
  try {
    // Try backend API first
    console.log('📤 Deleting test:', testId)
    const response = await fetch(`/api/admin/tests/${testId}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (response.ok) {
      const data = await response.json()
      console.log('📥 Delete response:', data)
      
      if (data.success) {
        showNotification('Test deleted from database! ✅', 'success')
        tests = tests.filter((t) => (t.id || t._id) !== testId)
        questions = questions.filter((q) => q.testId !== testId)
        await loadTestsFromBackend()
        renderTests()
        loadTestSelector()
        updateDashboardStats()
        return
      }
    }
    
    showNotification('Failed to delete test', 'error')
  } catch (error) {
    console.error('❌ Delete error:', error)
    showNotification('Network error: Cannot delete test', 'error')
  }
}

// Questions Management
function loadTestSelector() {
  const selector = document.getElementById("test-selector")
  selector.innerHTML = '<option value="">Select a subject</option>'

  // Default subjects only
  const subjects = [
    { id: 'physics', name: 'Physics' },
    { id: 'chemistry', name: 'Chemistry' },
    { id: 'maths', name: 'Mathematics' },
    { id: 'biology', name: 'Biology' },
    { id: 'logicalreasoning', name: 'Logical Reasoning' }
  ]

  subjects.forEach((subject) => {
    const option = document.createElement("option")
    option.value = subject.id
    option.textContent = subject.name
    selector.appendChild(option)
  })
}

function loadQuestions() {
  const testId = document.getElementById("test-selector").value
  const addBtn = document.getElementById("add-question-btn")
  const container = document.getElementById("questions-container")

  if (!testId) {
    addBtn.disabled = true
    container.innerHTML = '<p class="empty-state">Select a test to view and manage questions</p>'
    return
  }

  addBtn.disabled = false
  const testQuestions = questions.filter((q) => q.testId === testId)

  console.log(`🔍 Loading questions for subject: ${testId}`)
  console.log(`📊 Total questions for ${testId}: ${testQuestions.length}`)
  console.log('All questions:', questions.map(q => ({ id: q.id, testId: q.testId, text: q.text.substring(0, 50) + '...' })))

  if (testQuestions.length === 0) {
    container.innerHTML =
      '<p class="empty-state">No questions found for this test. Add some questions to get started.</p>'
    return
  }

  container.innerHTML = ""
  testQuestions.forEach((question) => {
    const questionCard = document.createElement("div")
    questionCard.className = "question-card"

    const answersHtml = question.answers
      .map((answer, index) => {
        const isCorrect = index === question.correctAnswer
        return `
                <li class="${isCorrect ? "correct-answer" : "incorrect-answer"}">
                    ${answer}
                    ${isCorrect ? '<span class="answer-indicator correct-indicator">Correct</span>' : ""}
                </li>
            `
      })
      .join("")

    questionCard.innerHTML = `
            <div class="question-header">
                <div class="question-text">${question.text}</div>
                <div class="question-actions">
                    <button class="btn btn-secondary btn-small" onclick="editQuestion('${question.id}')">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="deleteQuestion('${question.id}')">Delete</button>
                </div>
            </div>
            <ul class="answers-list">
                ${answersHtml}
            </ul>
        `

    container.appendChild(questionCard)
  })
}

function showAddQuestionModal() {
  const testId = document.getElementById("test-selector").value
  if (!testId) return

  const modalTitle = document.getElementById("modal-title")
  const modalBody = document.getElementById("modal-body")

  modalTitle.textContent = "Add New Question"
  modalBody.innerHTML = `
        <form onsubmit="addQuestion(event, '${testId}')">
            <div class="form-group">
                <label for="question-text">Question Text</label>
                <textarea id="question-text" class="form-control" required></textarea>
            </div>
            <div class="form-group">
                <label for="answer-1">Answer 1</label>
                <input type="text" id="answer-1" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="answer-2">Answer 2</label>
                <input type="text" id="answer-2" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="answer-3">Answer 3</label>
                <input type="text" id="answer-3" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="answer-4">Answer 4</label>
                <input type="text" id="answer-4" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="correct-answer">Correct Answer</label>
                <select id="correct-answer" class="form-control" required>
                    <option value="">Select correct answer</option>
                    <option value="0">Answer 1</option>
                    <option value="1">Answer 2</option>
                    <option value="2">Answer 3</option>
                    <option value="3">Answer 4</option>
                </select>
            </div>
            <div class="form-group">
                <button type="submit" class="btn btn-primary">Add Question</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `

  showModal()
}

async function addQuestion(event, testId) {
  event.preventDefault()

  const text = document.getElementById("question-text").value
  const answers = [
    document.getElementById("answer-1").value,
    document.getElementById("answer-2").value,
    document.getElementById("answer-3").value,
    document.getElementById("answer-4").value,
  ]
  const correctAnswerIndex = Number.parseInt(document.getElementById("correct-answer").value)

  try {
    // Try backend API first
    console.log('📤 Attempting to add question to backend...')
    console.log('Question data:', {
      subject: testId,
      questionText: text,
      options: answers,
      correctAnswer: answers[correctAnswerIndex],
    })
    
    const response = await fetch('/api/admin/questions', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: testId,
        questionText: text,
        options: answers,
        correctAnswer: answers[correctAnswerIndex],
      }),
    })

    console.log('📥 Response status:', response.status)
    console.log('📥 Response ok:', response.ok)

    if (response.ok) {
      const data = await response.json()
      console.log('📥 Response data:', data)
      
      if (data.success) {
        showNotification('Question added successfully', 'success')
        await loadQuestionsFromBackend()
        loadQuestions()
        refreshCharts()
        closeModal()
        return
      } else {
        console.error('❌ Backend returned error:', data)
        showNotification('Error: ' + (data.message || 'Failed to add question'), 'error')
      }
    } else {
      const errorText = await response.text()
      console.error('❌ Server error:', response.status, errorText)
      showNotification('Server error: ' + response.status, 'error')
    }
  } catch (error) {
    console.error('❌ Network error:', error)
    showNotification('Network error: Cannot connect to server', 'error')
  }

  // Fallback to localStorage
  const newQuestion = {
    id: generateId(),
    testId: testId,
    text: text,
    answers: answers,
    correctAnswer: correctAnswerIndex,
  }

  questions.push(newQuestion)
  saveDataToStorage()
  loadQuestions()
  closeModal()
  showNotification('Question added locally', 'success')
}

function editQuestion(questionId) {
  const question = questions.find((q) => q.id === questionId)
  if (!question) return

  const modalTitle = document.getElementById("modal-title")
  const modalBody = document.getElementById("modal-body")

  modalTitle.textContent = "Edit Question"
  modalBody.innerHTML = `
        <form onsubmit="updateQuestion(event, '${questionId}')">
            <div class="form-group">
                <label for="edit-question-text">Question Text</label>
                <textarea id="edit-question-text" class="form-control" required>${question.text}</textarea>
            </div>
            <div class="form-group">
                <label for="edit-answer-1">Answer 1</label>
                <input type="text" id="edit-answer-1" class="form-control" value="${question.answers[0]}" required>
            </div>
            <div class="form-group">
                <label for="edit-answer-2">Answer 2</label>
                <input type="text" id="edit-answer-2" class="form-control" value="${question.answers[1]}" required>
            </div>
            <div class="form-group">
                <label for="edit-answer-3">Answer 3</label>
                <input type="text" id="edit-answer-3" class="form-control" value="${question.answers[2]}" required>
            </div>
            <div class="form-group">
                <label for="edit-answer-4">Answer 4</label>
                <input type="text" id="edit-answer-4" class="form-control" value="${question.answers[3]}" required>
            </div>
            <div class="form-group">
                <label for="edit-correct-answer">Correct Answer</label>
                <select id="edit-correct-answer" class="form-control" required>
                    <option value="0" ${question.correctAnswer === 0 ? "selected" : ""}>Answer 1</option>
                    <option value="1" ${question.correctAnswer === 1 ? "selected" : ""}>Answer 2</option>
                    <option value="2" ${question.correctAnswer === 2 ? "selected" : ""}>Answer 3</option>
                    <option value="3" ${question.correctAnswer === 3 ? "selected" : ""}>Answer 4</option>
                </select>
            </div>
            <div class="form-group">
                <button type="submit" class="btn btn-primary">Update Question</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `

  showModal()
}

async function updateQuestion(event, questionId) {
  event.preventDefault()

  const text = document.getElementById("edit-question-text").value
  const answers = [
    document.getElementById("edit-answer-1").value,
    document.getElementById("edit-answer-2").value,
    document.getElementById("edit-answer-3").value,
    document.getElementById("edit-answer-4").value,
  ]
  const correctAnswerIndex = Number.parseInt(document.getElementById("edit-correct-answer").value)

  try {
    // Try backend API first
    const response = await fetch(`/api/admin/questions/${questionId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        questionText: text,
        options: answers,
        correctAnswer: answers[correctAnswerIndex],
      }),
    })

    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        showNotification('Question updated successfully', 'success')
        await loadQuestionsFromBackend()
        loadQuestions()
        refreshCharts()
        closeModal()
        return
      }
    }
  } catch (error) {
    console.log('Backend unavailable, using localStorage')
  }

  // Fallback to localStorage
  const questionIndex = questions.findIndex((q) => q.id === questionId)
  if (questionIndex !== -1) {
    questions[questionIndex].text = text
    questions[questionIndex].answers = answers
    questions[questionIndex].correctAnswer = correctAnswerIndex

    saveDataToStorage()
    loadQuestions()
    closeModal()
    showNotification('Question updated locally', 'success')
  }
}

async function deleteQuestion(questionId) {
  if (!confirm("Are you sure you want to delete this question?")) {
    return
  }

  try {
    // Try backend API first
    const response = await fetch(`/api/admin/questions/${questionId}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        showNotification('Question deleted successfully', 'success')
        questions = questions.filter((q) => q.id !== questionId)
        await loadQuestionsFromBackend()
        loadQuestions()
        refreshCharts()
        return
      }
    }
  } catch (error) {
    console.log('Backend unavailable, using localStorage')
  }

  // Fallback to localStorage
  questions = questions.filter((q) => q.id !== questionId)
  saveDataToStorage()
  loadQuestions()
  showNotification('Question deleted locally', 'success')
}

// Results Management
function renderResults() {
  const tbody = document.getElementById("results-table-body")
  tbody.innerHTML = ""

  if (results.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
          No results found. Results will appear here when users complete tests.
        </td>
      </tr>
    `
    return
  }

  results.forEach((result) => {
    const user = users.find((u) => u.id === result.userId)
    const userName = result.userName || (user ? user.name : "Unknown User")
    const userEmail = result.userEmail || (user ? user.email : "N/A")
    
    // Format subject name
    const subjectName = result.subject || result.testId || "General Test"
    const formattedSubject = subjectName.charAt(0).toUpperCase() + subjectName.slice(1)
    
    const career = careers.find((c) => c.id === result.suggestedCareer)
    const careerName = result.careerSuggestion || (career ? career.name : "No suggestion")
    
    const score = result.score || result.totalScore || 0
    const dateTaken = result.dateTaken || result.createdAt || result.completedAt || new Date()

    const row = document.createElement("tr")
    row.innerHTML = `
            <td>${result.id || result._id}</td>
            <td>
              <div style="font-weight: 600;">${userName}</div>
              <div style="font-size: 0.85em; color: var(--text-secondary);">${userEmail}</div>
            </td>
            <td>${formattedSubject}</td>
            <td>
              <span style="
                padding: 0.25rem 0.75rem;
                border-radius: 12px;
                font-weight: 600;
                background: ${score >= 70 ? '#d1fae5' : score >= 50 ? '#fef3c7' : '#fee2e2'};
                color: ${score >= 70 ? '#065f46' : score >= 50 ? '#92400e' : '#991b1b'};
              ">
                ${score}
              </span>
            </td>
            <td>${careerName}</td>
            <td>${new Date(dateTaken).toLocaleDateString()} ${new Date(dateTaken).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
            <td class="action-buttons-table">
                <button class="btn btn-danger btn-small" onclick="deleteResult('${result.id || result._id}')">Delete</button>
            </td>
        `
    tbody.appendChild(row)
  })
}

// Careers Management
function renderCareers() {
  const grid = document.getElementById("careers-grid")
  grid.innerHTML = ""

  careers.forEach((career) => {
    const careerCard = document.createElement("div")
    careerCard.className = "career-card"
    careerCard.innerHTML = `
            <h3>${career.name}</h3>
            <p>${career.description}</p>
            <div class="career-card-actions">
                <button class="btn btn-secondary btn-small" onclick="editCareer('${career.id}')">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteCareer('${career.id}')">Delete</button>
            </div>
        `
    grid.appendChild(careerCard)
  })
}

function showAddCareerModal() {
  const modalTitle = document.getElementById("modal-title")
  const modalBody = document.getElementById("modal-body")

  modalTitle.textContent = "Add Career Option"
  modalBody.innerHTML = `
        <form onsubmit="addCareer(event)">
            <div class="form-group">
                <label for="career-name">Career Name</label>
                <input type="text" id="career-name" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="career-description">Description</label>
                <textarea id="career-description" class="form-control" required></textarea>
            </div>
            <div class="form-group">
                <button type="submit" class="btn btn-primary">Add Career</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `

  showModal()
}

function addCareer(event) {
  event.preventDefault()

  const name = document.getElementById("career-name").value
  const description = document.getElementById("career-description").value

  const newCareer = {
    id: generateId(),
    name: name,
    description: description,
  }

  careers.push(newCareer)
  saveDataToStorage()
  renderCareers()
  updateDashboardStats()
  closeModal()
}

function editCareer(careerId) {
  const career = careers.find((c) => c.id === careerId)
  if (!career) return

  const modalTitle = document.getElementById("modal-title")
  const modalBody = document.getElementById("modal-body")

  modalTitle.textContent = "Edit Career"
  modalBody.innerHTML = `
        <form onsubmit="updateCareer(event, '${careerId}')">
            <div class="form-group">
                <label for="edit-career-name">Career Name</label>
                <input type="text" id="edit-career-name" class="form-control" value="${career.name}" required>
            </div>
            <div class="form-group">
                <label for="edit-career-description">Description</label>
                <textarea id="edit-career-description" class="form-control" required>${career.description}</textarea>
            </div>
            <div class="form-group">
                <button type="submit" class="btn btn-primary">Update Career</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `

  showModal()
}

function updateCareer(event, careerId) {
  event.preventDefault()

  const name = document.getElementById("edit-career-name").value
  const description = document.getElementById("edit-career-description").value

  const careerIndex = careers.findIndex((c) => c.id === careerId)
  if (careerIndex !== -1) {
    careers[careerIndex].name = name
    careers[careerIndex].description = description

    saveDataToStorage()
    renderCareers()
    closeModal()
  }
}

function deleteCareer(careerId) {
  if (confirm("Are you sure you want to delete this career option?")) {
    careers = careers.filter((c) => c.id !== careerId)
    saveDataToStorage()
    renderCareers()
    updateDashboardStats()
  }
}

// Modal Functions
function showModal() {
  document.getElementById("modal-overlay").classList.add("active")
}

function closeModal() {
  document.getElementById("modal-overlay").classList.remove("active")
}

// Initialize sample data
function initializeSampleData() {
  // Sample careers
  careers = [
    {
      id: generateId(),
      name: "Software Developer",
      description: "Design, develop, and maintain software applications and systems.",
    },
    {
      id: generateId(),
      name: "Data Scientist",
      description: "Analyze complex data to help organizations make informed decisions.",
    },
    {
      id: generateId(),
      name: "UX Designer",
      description: "Create user-friendly interfaces and improve user experience for digital products.",
    },
    {
      id: generateId(),
      name: "Marketing Manager",
      description: "Develop and execute marketing strategies to promote products and services.",
    },
  ]

  // Sample users
  users = [
    {
      id: generateId(),
      name: "John Doe",
      email: "john.doe@example.com",
      registrationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      name: "Jane Smith",
      email: "jane.smith@example.com",
      registrationDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      name: "Mike Johnson",
      email: "mike.johnson@example.com",
      registrationDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  // Sample tests
  tests = [
    {
      id: generateId(),
      name: "Programming Aptitude Test",
      description: "Assess programming logic and problem-solving skills",
      createdDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      name: "Creative Thinking Assessment",
      description: "Evaluate creative problem-solving and design thinking abilities",
      createdDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  // Sample questions
  questions = [
    {
      id: generateId(),
      testId: tests[0].id,
      text: "What is the time complexity of binary search?",
      answers: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      correctAnswer: 1,
    },
    {
      id: generateId(),
      testId: tests[0].id,
      text: "Which data structure uses LIFO principle?",
      answers: ["Queue", "Stack", "Array", "Linked List"],
      correctAnswer: 1,
    },
    {
      id: generateId(),
      testId: tests[1].id,
      text: "What is the first step in the design thinking process?",
      answers: ["Prototype", "Empathize", "Test", "Define"],
      correctAnswer: 1,
    },
  ]

  // Sample results
  results = [
    {
      id: generateId(),
      userId: users[0].id,
      testId: tests[0].id,
      score: 85,
      suggestedCareer: careers[0].id,
      dateTaken: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      userId: users[1].id,
      testId: tests[1].id,
      score: 92,
      suggestedCareer: careers[2].id,
      dateTaken: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      userId: users[2].id,
      testId: tests[0].id,
      score: 78,
      suggestedCareer: careers[1].id,
      dateTaken: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  saveDataToStorage()
  updateDashboardStats()
  renderAllData()
}

function renderAllData() {
  renderUsers()
  renderTests()
  renderResults()
  // renderCareers() - Removed: Career suggestions feature removed
}

// Notification System
function showNotification(message, type = 'info') {
  const notification = document.createElement('div')
  notification.className = `notification ${type}`
  notification.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" style="margin-left: 10px; background: none; border: none; color: inherit; cursor: pointer; font-size: 18px;">&times;</button>
  `
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    animation: slideIn 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 10px;
  `
  
  if (type === 'success') {
    notification.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  } else if (type === 'error') {
    notification.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
  } else {
    notification.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }
  
  document.body.appendChild(notification)
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease'
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}

// Add CSS animation
if (!document.getElementById('notification-styles')) {
  const style = document.createElement('style')
  style.id = 'notification-styles'
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(400px); opacity: 0; }
    }
  `
  document.head.appendChild(style)
}

// Chart instances
let questionsChart = null
let usersChart = null
let resultsChart = null

// Initialize all charts
function initializeCharts() {
  // Check if Chart.js is loaded
  if (typeof Chart === 'undefined') {
    console.error('❌ Chart.js not loaded')
    return
  }
  
  console.log('📊 Initializing charts...')
  
  const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark'
  const textColor = isDarkMode ? '#e2e8f0' : '#334155'
  const gridColor = isDarkMode ? '#475569' : '#e2e8f0'
  
  Chart.defaults.color = textColor
  Chart.defaults.font.family = 'Inter, sans-serif'
  
  try {
    createQuestionsChart(textColor, gridColor)
    createUsersChart(textColor, gridColor)
    createResultsChart(textColor, gridColor)
    console.log('✅ Charts initialized successfully')
  } catch (error) {
    console.error('❌ Error initializing charts:', error)
  }
}

// Questions by Subject Chart (Doughnut)
function createQuestionsChart(textColor, gridColor) {
  const ctx = document.getElementById('questionsChart')
  if (!ctx) {
    console.warn('⚠️ questionsChart canvas not found')
    return
  }
  
  console.log('Creating questions chart with', questions.length, 'total questions')
  
  // Count questions by subject
  const subjects = ['physics', 'chemistry', 'maths', 'biology', 'logicalreasoning']
  const questionCounts = subjects.map(subject => {
    const count = questions.filter(q => q.testId === subject).length
    console.log(`${subject}: ${count} questions`)
    return count
  })
  
  // Only show subjects that have questions
  const subjectsWithData = []
  const countsWithData = []
  const colorsWithData = []
  const borderColorsWithData = []
  
  const subjectColors = {
    physics: { bg: 'rgba(59, 130, 246, 0.8)', border: 'rgba(59, 130, 246, 1)' },
    chemistry: { bg: 'rgba(16, 185, 129, 0.8)', border: 'rgba(16, 185, 129, 1)' },
    maths: { bg: 'rgba(245, 158, 11, 0.8)', border: 'rgba(245, 158, 11, 1)' },
    biology: { bg: 'rgba(239, 68, 68, 0.8)', border: 'rgba(239, 68, 68, 1)' },
    logicalreasoning: { bg: 'rgba(147, 51, 234, 0.8)', border: 'rgba(147, 51, 234, 1)' }
  }
  
  const subjectLabels = {
    physics: 'Physics',
    chemistry: 'Chemistry', 
    maths: 'Mathematics',
    biology: 'Biology',
    logicalreasoning: 'Logical Reasoning'
  }
  
  subjects.forEach((subject, index) => {
    if (questionCounts[index] > 0) {
      subjectsWithData.push(subjectLabels[subject])
      countsWithData.push(questionCounts[index])
      colorsWithData.push(subjectColors[subject].bg)
      borderColorsWithData.push(subjectColors[subject].border)
    }
  })
  
  // If no data, show empty chart
  const hasData = countsWithData.length > 0
  const chartData = hasData ? countsWithData : []
  const chartLabels = hasData ? subjectsWithData : []
  const chartColors = hasData ? colorsWithData : []
  const chartBorderColors = hasData ? borderColorsWithData : []
  
  if (questionsChart) questionsChart.destroy()
  
  questionsChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: chartLabels,
      datasets: [{
        data: chartData,
        backgroundColor: chartColors,
        borderColor: chartBorderColors,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            font: { size: 12, weight: '500' },
            color: textColor
          }
        },
        tooltip: {
          enabled: hasData,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: { size: 14, weight: '600' },
          bodyFont: { size: 13 },
          callbacks: {
            label: function(context) {
              return context.label + ': ' + context.parsed + ' questions'
            }
          }
        }
      }
    }
  })
  
  // Add empty state overlay if no data
  if (!hasData) {
    addEmptyStateOverlay(ctx.parentElement, 'No questions added yet')
  }
}

// Users Activity Chart (Line)
function createUsersChart(textColor, gridColor) {
  const ctx = document.getElementById('usersChart')
  if (!ctx) {
    console.warn('⚠️ usersChart canvas not found')
    return
  }
  
  console.log('Creating users chart...')
  
  // Get last 7 days of user registrations
  const last7Days = []
  const userCounts = []
  const today = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    last7Days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    
    const count = users.filter(u => {
      const regDate = new Date(u.registrationDate)
      return regDate.toDateString() === date.toDateString()
    }).length
    
    userCounts.push(count)
  }
  
  const hasData = userCounts.some(count => count > 0)
  
  if (usersChart) usersChart.destroy()
  
  usersChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: last7Days,
      datasets: [{
        label: 'New Users',
        data: userCounts,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: { size: 14, weight: '600' },
          bodyFont: { size: 13 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { 
            stepSize: 1,
            color: textColor,
            font: { size: 11 }
          },
          grid: { color: gridColor }
        },
        x: {
          ticks: { 
            color: textColor,
            font: { size: 11 }
          },
          grid: { display: false }
        }
      }
    }
  })
  
  // Add empty state overlay if no data
  if (!hasData) {
    addEmptyStateOverlay(ctx.parentElement, 'No users registered yet')
  }
}

// Results Overview Chart (Bar)
function createResultsChart(textColor, gridColor) {
  const ctx = document.getElementById('resultsChart')
  if (!ctx) {
    console.warn('⚠️ resultsChart canvas not found')
    return
  }
  
  console.log('Creating results chart...')
  
  // Calculate average scores by subject
  const subjects = ['physics', 'chemistry', 'maths', 'biology', 'logicalreasoning']
  const subjectLabels = {
    physics: 'Physics',
    chemistry: 'Chemistry', 
    maths: 'Mathematics',
    biology: 'Biology',
    logicalreasoning: 'Logical Reasoning'
  }
  
  console.log('Creating results chart with', results.length, 'total results')
  
  const avgScores = subjects.map(subject => {
    const subjectResults = results.filter(r => {
      // Check both subject field and subjectScores object
      return r.subject === subject || (r.subjectScores && r.subjectScores[subject] !== undefined)
    })
    
    if (subjectResults.length === 0) return 0
    
    let total = 0
    let count = 0
    
    subjectResults.forEach(r => {
      if (r.subjectScores && r.subjectScores[subject] !== undefined) {
        total += r.subjectScores[subject]
        count++
      } else if (r.subject === subject && r.score !== undefined) {
        total += r.score
        count++
      }
    })
    
    const avg = count > 0 ? Math.round(total / count) : 0
    console.log(`${subject}: ${count} results, average: ${avg}%`)
    return avg
  })
  
  // Only show subjects that have data
  const subjectsWithData = []
  const scoresWithData = []
  const colorsWithData = []
  const borderColorsWithData = []
  
  const subjectColors = {
    physics: { bg: 'rgba(59, 130, 246, 0.8)', border: 'rgba(59, 130, 246, 1)' },
    chemistry: { bg: 'rgba(16, 185, 129, 0.8)', border: 'rgba(16, 185, 129, 1)' },
    maths: { bg: 'rgba(245, 158, 11, 0.8)', border: 'rgba(245, 158, 11, 1)' },
    biology: { bg: 'rgba(239, 68, 68, 0.8)', border: 'rgba(239, 68, 68, 1)' },
    logicalreasoning: { bg: 'rgba(147, 51, 234, 0.8)', border: 'rgba(147, 51, 234, 1)' }
  }
  
  subjects.forEach((subject, index) => {
    if (avgScores[index] > 0) {
      subjectsWithData.push(subjectLabels[subject])
      scoresWithData.push(avgScores[index])
      colorsWithData.push(subjectColors[subject].bg)
      borderColorsWithData.push(subjectColors[subject].border)
    }
  })
  
  const hasData = scoresWithData.length > 0
  
  // If no data, don't show any bars - just empty chart
  const chartData = hasData ? scoresWithData : []
  const chartLabels = hasData ? subjectsWithData : []
  const chartColors = hasData ? colorsWithData : []
  const chartBorderColors = hasData ? borderColorsWithData : []
  
  if (resultsChart) resultsChart.destroy()
  
  resultsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartLabels,
      datasets: [{
        label: 'Average Score (%)',
        data: chartData,
        backgroundColor: chartColors,
        borderColor: chartBorderColors,
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: { size: 14, weight: '600' },
          bodyFont: { size: 13 },
          callbacks: {
            label: function(context) {
              return context.parsed.y + '%'
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { 
            callback: function(value) { return value + '%' },
            color: textColor,
            font: { size: 11 }
          },
          grid: { color: gridColor }
        },
        x: {
          ticks: { 
            color: textColor,
            font: { size: 12, weight: '500' }
          },
          grid: { display: false }
        }
      }
    }
  })
  
  // Add empty state overlay if no data
  if (!hasData) {
    addEmptyStateOverlay(ctx.parentElement, 'No test results available')
  }
}

// Add empty state overlay to chart
function addEmptyStateOverlay(container, message) {
  // Remove existing overlay
  const existing = container.querySelector('.chart-empty-state')
  if (existing) existing.remove()
  
  const overlay = document.createElement('div')
  overlay.className = 'chart-empty-state'
  overlay.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: #94a3b8;
    font-size: 14px;
    font-weight: 500;
    z-index: 10;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  `
  
  overlay.innerHTML = `
    <div style="font-size: 2rem; opacity: 0.5;">📊</div>
    <div>${message}</div>
  `
  
  container.style.position = 'relative'
  container.appendChild(overlay)
}

// Update charts when theme changes
function updateChartsTheme() {
  if (questionsChart || usersChart || resultsChart) {
    initializeCharts()
  }
}

// Refresh charts with current data
function refreshCharts() {
  if (typeof Chart !== 'undefined') {
    console.log('🔄 Refreshing charts with current data...')
    initializeCharts()
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.querySelector(".mobile-menu-toggle");
  const sidebar = document.querySelector(".sidebar");

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("mobile-open");
    });
  }
});