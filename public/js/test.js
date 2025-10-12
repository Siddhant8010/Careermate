(function () {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTest);
  } else {
    initTest();
  }

  function initTest() {
    // Read questions from JSON script tag
    let questions = [];
    try {
      const questionsScript = document.getElementById('questions-data');
      if (questionsScript) {
        questions = JSON.parse(questionsScript.textContent);
        console.log(`✅ Loaded ${questions.length} questions from server`);
        console.log('📋 Questions by subject:');
        const bySubject = { physics: 0, chemistry: 0, maths: 0, biology: 0, logicalreasoning: 0 };
        questions.forEach(q => {
          const subj = (q.subject || '').toLowerCase();
          if (bySubject.hasOwnProperty(subj)) {
            bySubject[subj]++;
          }
        });
        console.log(bySubject);

        if (questions.length > 0) {
          console.log('🎯 First question:', questions[0]);
          console.log('🎯 Sample Logical Reasoning questions:');
          questions.filter(q => q.subject === 'logicalreasoning').forEach((q, i) => {
            console.log(`LR Q${i + 1}:`, { id: q._id, subject: q.subject, text: q.questionText.substring(0, 50) + '...' });
          });
        }
      } else {
        console.error('❌ Questions data script tag not found');
      }
    } catch (err) {
      console.error('❌ Failed to parse questions:', err);
      questions = [];
    }

    const questionNumberEl = document.getElementById('questionNumber');
    const questionSubjectEl = document.getElementById('questionSubject');
    const questionTextEl = document.getElementById('questionText');
    const optionsContainerEl = document.getElementById('optionsContainer');

    const progressLabelEl = document.getElementById('progressLabel');
    const progressFillMenuEl = document.getElementById('progressFillMenu');

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    const physicsIndicators = document.getElementById('physicsIndicators');
    const chemistryIndicators = document.getElementById('chemistryIndicators');
    const mathsIndicators = document.getElementById('mathsIndicators');
    const biologyIndicators = document.getElementById('biologyIndicators');
    const logicalreasoningIndicators = document.getElementById('logicalreasoningIndicators');

    if (!questions.length) {
      console.warn('⚠️  No questions to render');
      if (progressLabelEl) progressLabelEl.textContent = 'Progress: 0/0 answered';
      if (questionTextEl) {
        questionTextEl.innerHTML = '<strong>No questions available.</strong><br>Please contact administrator.';
      }
      return;
    }

    console.log('🔍 DOM Elements found:');
    console.log('- physicsIndicators:', !!physicsIndicators);
    console.log('- chemistryIndicators:', !!chemistryIndicators);
    console.log('- mathsIndicators:', !!mathsIndicators);
    console.log('- biologyIndicators:', !!biologyIndicators);
    console.log('- logicalreasoningIndicators:', !!logicalreasoningIndicators);
    console.log('- questionNumberEl:', !!questionNumberEl);
    console.log('- questionSubjectEl:', !!questionSubjectEl);
    console.log('- questionTextEl:', !!questionTextEl);
    console.log('- optionsContainerEl:', !!optionsContainerEl);

    let currentIndex = 0;
    const answers = {}; // questionId -> selectedAnswer

    function renderIndicators() {
      const bySubject = { physics: [], chemistry: [], maths: [], biology: [], logicalreasoning: [] };
      questions.forEach((q, i) => {
        const subj = (q.subject || '').toLowerCase();
        if (bySubject[subj]) bySubject[subj].push(i);
      });

      console.log('📋 Questions by subject:', {
        physics: bySubject.physics.length,
        chemistry: bySubject.chemistry.length,
        maths: bySubject.maths.length,
        biology: bySubject.biology.length,
        logicalreasoning: bySubject.logicalreasoning.length,
        total: questions.length
      });
      
      // Check for duplicate question IDs
      const questionIds = questions.map(q => q._id);
      const uniqueIds = new Set(questionIds);
      if (questionIds.length !== uniqueIds.size) {
        console.error('⚠️ DUPLICATE QUESTION IDs FOUND!');
        console.error('Total questions:', questionIds.length);
        console.error('Unique IDs:', uniqueIds.size);
        console.error('Duplicates:', questionIds.length - uniqueIds.size);
        
        // Find which IDs are duplicated
        const idCounts = {};
        questionIds.forEach(id => {
          idCounts[id] = (idCounts[id] || 0) + 1;
        });
        const duplicates = Object.entries(idCounts).filter(([id, count]) => count > 1);
        console.error('Duplicated IDs:', duplicates);
      } else {
        console.log('✅ All question IDs are unique');
      }

      function build(container, indices) {
        if (!container) return;
        container.innerHTML = '';
        indices.forEach((globalIndex, subjectIndex) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'question-indicator';
          // Use subject-specific numbering (1, 2, 3... for each subject)
          btn.textContent = String(subjectIndex + 1);
          btn.dataset.questionIndex = globalIndex; // Store global index for navigation
          btn.style.animation = `indicatorPop 0.3s ease-out ${subjectIndex * 0.05}s both`;
          btn.addEventListener('click', () => {
            currentIndex = globalIndex;
            renderQuestion();
          });
          container.appendChild(btn);
        });
      }

      build(physicsIndicators, bySubject.physics);
      build(chemistryIndicators, bySubject.chemistry);
      build(mathsIndicators, bySubject.maths);
      build(biologyIndicators, bySubject.biology);
      if (logicalreasoningIndicators) {
        build(logicalreasoningIndicators, bySubject.logicalreasoning);
        console.log(`✅ Built ${bySubject.logicalreasoning.length} Logical Reasoning indicators`);
      } else {
        console.error('❌ logicalreasoningIndicators element not found!');
      }
    }

    function updateProgress() {
      const answeredCount = Object.keys(answers).length;
      console.log(`📊 Progress: ${answeredCount}/${questions.length} answered`);
      
      if (progressLabelEl) {
        progressLabelEl.textContent = `Progress: ${answeredCount}/${questions.length} answered`;
      }
      if (progressFillMenuEl) {
        const pct = questions.length ? (answeredCount / questions.length) * 100 : 0;
        progressFillMenuEl.style.width = `${pct}%`;
      }
    }

    function renderQuestion() {
      const q = questions[currentIndex];
      if (!q) return;

      // Add fade-out animation
      const questionCard = document.querySelector('.question-card');
      if (questionCard) {
        questionCard.style.animation = 'none';
        void questionCard.offsetWidth; // Trigger reflow
        questionCard.style.animation = 'questionFadeIn 0.5s ease-out';
      }

      // Calculate subject-specific question number
      const currentSubject = (q.subject || '').toLowerCase();
      const subjectQuestions = questions.filter(question => 
        (question.subject || '').toLowerCase() === currentSubject
      );
      const subjectQuestionIndex = subjectQuestions.findIndex(question => question._id === q._id);
      const subjectQuestionNumber = subjectQuestionIndex + 1;

      if (questionNumberEl) questionNumberEl.textContent = `Question ${subjectQuestionNumber}`;
      if (questionSubjectEl) questionSubjectEl.textContent = (q.subject || '').toUpperCase();
      if (questionTextEl) questionTextEl.textContent = q.questionText || '';

      optionsContainerEl.innerHTML = '';
      (q.options || []).forEach((opt, index) => {
        const label = document.createElement('label');
        label.className = 'option-label';
        label.setAttribute('data-option', String.fromCharCode(97 + index).toUpperCase() + '.');
        
        // Add staggered animation
        label.style.animation = `optionSlideIn 0.4s ease-out ${index * 0.1}s both`;

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = `q_${q._id}`;
        input.value = opt;
        input.checked = answers[q._id] === opt;
        
        // Use both change and click events to ensure it's captured
        const handleAnswer = () => {
          answers[q._id] = opt;
          
          // Calculate subject-specific question number for logging
          const currentSubject = (q.subject || '').toLowerCase();
          const subjectQuestions = questions.filter(question => 
            (question.subject || '').toLowerCase() === currentSubject
          );
          const subjectQuestionIndex = subjectQuestions.findIndex(question => question._id === q._id);
          const subjectQuestionNumber = subjectQuestionIndex + 1;
          
          console.log(`✓ Answered ${currentSubject} question ${subjectQuestionNumber} (ID: ${q._id})`);
          console.log(`📝 Total unique answers: ${Object.keys(answers).length}`);
          console.log(`📋 All answered IDs:`, Object.keys(answers));
          updateProgress();
          updateIndicators();
        };
        
        input.addEventListener('change', handleAnswer);
        input.addEventListener('click', handleAnswer);

        const span = document.createElement('span');
        span.textContent = opt;

        label.appendChild(input);
        label.appendChild(span);
        optionsContainerEl.appendChild(label);
      });

      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex === questions.length - 1;
      
      // Update indicators to show current question
      updateIndicators();
    }
    
    function updateIndicators() {
      // Update all indicator buttons to show current and answered states
      document.querySelectorAll('.question-indicator').forEach((btn) => {
        btn.classList.remove('current', 'answered');
        
        const questionIndex = parseInt(btn.dataset.questionIndex);
        const question = questions[questionIndex];
        
        if (!question) {
          console.warn('⚠️ No question found for index:', questionIndex);
          return;
        }
        
        if (questionIndex === currentIndex) {
          btn.classList.add('current');
        } else if (answers[question._id]) {
          btn.classList.add('answered');
        }
      });
    }

    function go(delta) {
      const next = currentIndex + delta;
      if (next < 0 || next >= questions.length) return;
      currentIndex = next;
      renderQuestion();
    }

    function submitAnswers() {
      // Check if user has answered any questions
      const answeredCount = Object.keys(answers).length;
      const totalQuestions = questions.length;
      
      if (answeredCount === 0) {
        // No answers provided - show confirmation modal
        const confirmSubmit = confirm(
          'You have not answered any questions yet. Are you sure you want to submit the test?'
        );
        
        if (!confirmSubmit) {
          return; // User cancelled submission
        }
      } else if (answeredCount < totalQuestions) {
        // Some questions unanswered - show warning
        const unansweredCount = totalQuestions - answeredCount;
        const confirmSubmit = confirm(
          `You have ${unansweredCount} unanswered questions out of ${totalQuestions}. Are you sure you want to submit?`
        );
        
        if (!confirmSubmit) {
          return; // User cancelled submission
        }
      }
      
      // Build and submit a hidden form to /submit-test
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/submit-test';

      // Add all answers (including empty ones)
      questions.forEach((q) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = `answers[${q._id}]`;
        input.value = answers[q._id] || ''; // Empty string if no answer
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    }

    // Timer functionality (30 minutes = 1800 seconds)
    let timeRemaining = 30 * 60; // 30 minutes in seconds
    const timerDisplay = document.getElementById('timerDisplay');
    
    function updateTimer() {
      const minutes = Math.floor(timeRemaining / 60);
      const seconds = timeRemaining % 60;
      if (timerDisplay) {
        timerDisplay.textContent = `⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Add warning class when less than 5 minutes
        if (timeRemaining <= 300 && timeRemaining > 60) {
          timerDisplay.classList.add('warning');
          timerDisplay.classList.remove('danger');
        } else if (timeRemaining <= 60) {
          timerDisplay.classList.add('danger');
          timerDisplay.classList.remove('warning');
        }
      }
      
      if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        alert('Time is up! Submitting your test...');
        submitAnswers();
      }
      
      timeRemaining--;
    }
    
    // Start timer
    const timerInterval = setInterval(updateTimer, 1000);
    updateTimer(); // Initial call
    
    // Subject heading click to toggle indicators
    const subjectHeadings = document.querySelectorAll('.subject-heading');
    console.log(`Found ${subjectHeadings.length} subject headings`);

    subjectHeadings.forEach(heading => {
      heading.addEventListener('click', () => {
        const subject = heading.getAttribute('data-subject');
        const indicatorsContainer = document.getElementById(`${subject}Indicators`);

        console.log(`Clicked ${subject} heading, found indicators:`, !!indicatorsContainer);

        if (indicatorsContainer) {
          // Toggle visibility
          if (indicatorsContainer.classList.contains('visible')) {
            indicatorsContainer.classList.remove('visible');
            heading.classList.remove('expanded');
          } else {
            indicatorsContainer.classList.add('visible');
            heading.classList.add('expanded');
          }
        }
      });
    });
    
    // Show all indicators by default
    document.querySelectorAll('.question-indicators').forEach(container => {
      container.classList.add('visible');
    });
    document.querySelectorAll('.subject-heading').forEach(heading => {
      heading.classList.add('expanded');
    });

    prevBtn && prevBtn.addEventListener('click', () => go(-1));
    nextBtn && nextBtn.addEventListener('click', () => go(1));
    submitBtn && submitBtn.addEventListener('click', () => submitAnswers());

    renderIndicators();
    renderQuestion();
    updateProgress();
  }
})();

// Results page functionality
(function() {
  // Check if we're on the results page
  const resultData = document.getElementById('result-data');
  if (!resultData) return;

  // Get subject scores from meta tag
  const physicsScore = parseInt(resultData.getAttribute('data-physics') || '0');
  const chemistryScore = parseInt(resultData.getAttribute('data-chemistry') || '0');
  const mathsScore = parseInt(resultData.getAttribute('data-maths') || '0');
  const biologyScore = parseInt(resultData.getAttribute('data-biology') || '0');
  const logicalreasoningScore = parseInt(resultData.getAttribute('data-logicalreasoning') || '0');

  // Animate progress bars (assuming max 5 questions per subject)
  const maxScore = 5;
  
  function animateProgressBar(elementId, score) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const percentage = (score / maxScore) * 100;
    setTimeout(() => {
      element.style.width = `${percentage}%`;
    }, 300);
  }

  animateProgressBar('physicsProgress', physicsScore);
  animateProgressBar('chemistryProgress', chemistryScore);
  animateProgressBar('mathsProgress', mathsScore);
  animateProgressBar('biologyProgress', biologyScore);
  animateProgressBar('logicalreasoningProgress', logicalreasoningScore);

  // Toggle detailed answers
  const toggleBtn = document.getElementById('toggleAnswersBtn');
  const answersList = document.getElementById('answersList');
  
  if (toggleBtn && answersList) {
    toggleBtn.addEventListener('click', () => {
      if (answersList.style.display === 'none') {
        answersList.style.display = 'block';
        toggleBtn.textContent = 'Hide Detailed Answers';
      } else {
        answersList.style.display = 'none';
        toggleBtn.textContent = 'Show Detailed Answers';
      }
    });
  }

  // Retake button
  const retakeBtn = document.getElementById('retakeBtn');
  if (retakeBtn) {
    retakeBtn.addEventListener('click', () => {
      window.location.href = '/test';
    });
  }

  // Study plan button
  const studyPlanBtn = document.getElementById('studyPlanBtn');
  if (studyPlanBtn) {
    studyPlanBtn.addEventListener('click', () => {
      // Navigate to dashboard or study plan page
      window.location.href = '/dashboard';
    });
  }
})();


