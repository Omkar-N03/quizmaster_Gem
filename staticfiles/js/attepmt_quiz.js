/**
 * Quiz Attempt - Student Quiz Taking Interface
 * Handles quiz loading, timer, navigation, and submission
 */

let quizData = null;
let attemptId = null;
let currentQuestionIndex = 0;
let answers = {};
let flaggedQuestions = new Set();
let timeRemaining = 0;
let timerInterval = null;

/**
 * Get CSRF token from cookies
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value
 */
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const trimmedCookie = cookie.trim();
            if (trimmedCookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(trimmedCookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

/**
 * Load quiz data from backend API
 */
async function loadQuizFromBackend() {
    try {
        const urlParams = new URLSearchParams(globalThis.location.search);
        const quizId = urlParams.get('id');
        
        if (!quizId) {
            throw new Error('Quiz ID not provided');
        }
        
        const response = await fetch(`/api/quiz/${quizId}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            credentials: 'same-origin'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load quiz');
        }
        
        quizData = await response.json();
        attemptId = quizData.attemptId;
        
        if (quizData.previousAnswers) {
            for (const [questionId, prev] of Object.entries(quizData.previousAnswers)) {
                answers[questionId] = prev.selected_option;
                if (prev.is_flagged) {
                    flaggedQuestions.add(Number.parseInt(questionId, 10));
                }
            }
        }
        
        timeRemaining = quizData.duration * 60;
        document.getElementById('quizTitle').textContent = quizData.title;
        
        initializeQuestionGrid();
        loadQuestion(currentQuestionIndex);
        startTimer();
        
    } catch (error) {
        console.error('Error loading quiz:', error);
        alert('Failed to load quiz. Please try again.');
        globalThis.location.href = '/student/dashboard/';
    }
}

/**
 * Initialize page and event listeners
 */
globalThis.addEventListener('DOMContentLoaded', () => {
    loadQuizFromBackend();
    
    // Prevent accidental page refresh during quiz
    globalThis.addEventListener('beforeunload', (e) => {
        if (quizData && timeRemaining > 0) {
            e.preventDefault();
        }
    });
}); // ← FIXED: Added closing parenthesis and semicolon

/**
 * Initialize question navigation grid
 */
function initializeQuestionGrid() {
    const grid = document.getElementById('questionGrid');
    grid.innerHTML = '';
    
    for (const [index] of quizData.questions.entries()) {
        const dot = document.createElement('div');
        dot.className = 'question-dot';
        dot.textContent = index + 1;
        dot.onclick = () => goToQuestion(index);
        grid.appendChild(dot);
    }
}

/**
 * Load and display a specific question
 * @param {number} index - Question index
 */
function loadQuestion(index) {
    const question = quizData.questions[index];
    
    document.getElementById('questionNumber').textContent = `Question ${index + 1}`;
    document.getElementById('questionMarks').textContent = `${question.marks} Marks`;
    document.getElementById('questionText').textContent = question.text;
    
    document.getElementById('progressCount').textContent = `${index + 1} of ${quizData.questions.length}`;
    const progressPercent = ((index + 1) / quizData.questions.length) * 100;
    document.getElementById('progressFill').style.width = `${progressPercent}%`;
    
    const container = document.getElementById('optionsContainer');
    container.innerHTML = '';
    
    for (const [optIndex, option] of question.options.entries()) {
        const optDiv = document.createElement('div');
        optDiv.className = 'option';
        
        if (answers[question.id] === optIndex) {
            optDiv.classList.add('selected');
        }
        
        optDiv.onclick = () => selectOption(question.id, optIndex);
        
        optDiv.innerHTML = `
            <div class="option-radio"></div>
            <span class="option-label">${String.fromCodePoint(65 + optIndex)}.</span>
            <span class="option-text">${option}</span>
        `;
        
        container.appendChild(optDiv);
    }
    
    document.getElementById('btnPrevious').disabled = index === 0;
    
    const nextBtn = document.getElementById('btnNext');
    if (index === quizData.questions.length - 1) {
        nextBtn.innerHTML = '<span>Finish</span><span>→</span>';
    } else {
        nextBtn.innerHTML = '<span>Next</span><span>→</span>';
    }
    
    const flagBtn = document.getElementById('btnFlag');
    if (flaggedQuestions.has(question.id)) {
        flagBtn.classList.add('flagged');
    } else {
        flagBtn.classList.remove('flagged');
    }
    
    updateQuestionGrid();
}

/**
 * Select an option for current question
 * @param {number} questionId - Question ID
 * @param {number} optionIndex - Option index
 */
function selectOption(questionId, optionIndex) {
    answers[questionId] = optionIndex;
    
    const options = document.querySelectorAll('.option');
    for (const [idx, opt] of Array.from(options).entries()) {
        if (idx === optionIndex) {
            opt.classList.add('selected');
        } else {
            opt.classList.remove('selected');
        }
    }
    
    updateQuestionGrid();
}

/**
 * Update question navigation grid status
 */
function updateQuestionGrid() {
    const dots = document.querySelectorAll('.question-dot');
    
    for (const [index, dot] of Array.from(dots).entries()) {
        const questionId = quizData.questions[index].id;
        
        dot.className = 'question-dot';
        
        if (index === currentQuestionIndex) {
            dot.classList.add('current');
        } else if (Object.hasOwn(answers, questionId)) {
            dot.classList.add('answered');
        }
        
        if (flaggedQuestions.has(questionId)) {
            dot.classList.add('flagged');
        }
    }
}

/**
 * Navigate to previous question
 */
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion(currentQuestionIndex);
    }
}

/**
 * Navigate to next question or open submit modal
 */
function nextQuestion() {
    if (currentQuestionIndex < quizData.questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion(currentQuestionIndex);
    } else {
        openSubmitModal();
    }
}

/**
 * Navigate to specific question
 * @param {number} index - Question index
 */
function goToQuestion(index) {
    currentQuestionIndex = index;
    loadQuestion(currentQuestionIndex);
}

/**
 * Toggle flag status for current question
 */
function toggleFlag() {
    const questionId = quizData.questions[currentQuestionIndex].id;
    
    if (flaggedQuestions.has(questionId)) {
        flaggedQuestions.delete(questionId);
    } else {
        flaggedQuestions.add(questionId);
    }
    
    updateQuestionGrid();
    
    const flagBtn = document.getElementById('btnFlag');
    flagBtn.classList.toggle('flagged');
}

/**
 * Start quiz timer
 */
function startTimer() {
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining === 300) {
            document.getElementById('timerContainer').classList.add('warning');
            alert('⚠️ 5 minutes remaining!');
        }
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            alert('⏰ Time is up! Your quiz will be submitted automatically.');
            confirmSubmit();
        }
    }, 1000);
}

/**
 * Update timer display
 */
function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('timer').textContent = display;
}

/**
 * Open submit confirmation modal
 */
function openSubmitModal() {
    const answered = Object.keys(answers).length;
    const unanswered = quizData.questions.length - answered;
    const flagged = flaggedQuestions.size;
    
    document.getElementById('modalAnswered').textContent = answered;
    document.getElementById('modalUnanswered').textContent = unanswered;
    document.getElementById('modalFlagged').textContent = flagged;
    
    document.getElementById('submitModal').classList.add('show');
}

/**
 * Close submit confirmation modal
 */
function closeSubmitModal() {
    document.getElementById('submitModal').classList.remove('show');
}

/**
 * Submit quiz to backend
 */
async function confirmSubmit() {
    clearInterval(timerInterval);
    
    const submissionData = {
        attemptId: attemptId,
        answers: answers,
        timeSpent: (quizData.duration * 60) - timeRemaining,
        flaggedQuestions: Array.from(flaggedQuestions)
    };
    
    try {
        const response = await fetch('/api/quiz/submit/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            credentials: 'same-origin',
            body: JSON.stringify(submissionData)
        });
        
        if (!response.ok) {
            throw new Error('Submission failed');
        }
        
        const result = await response.json();
        
        alert(`✅ Quiz submitted successfully!\n\nYour Score: ${result.score}/${result.totalMarks} (${result.percentage}%)`);
        globalThis.location.href = `/student/result/${result.attemptId}/`;
        
    } catch (error) {
        console.error('Error submitting quiz:', error);
        alert('Failed to submit quiz. Please try again.');
    }
}

/**
 * Video background fallback
 */
const video = document.querySelector('.video-background video');
if (video) {
    video.addEventListener('error', () => {
        console.log('Video failed to load. Using gradient background.');
        const videoBg = document.querySelector('.video-background');
        if (videoBg) {
            videoBg.style.display = 'none';
        }
    });
}
