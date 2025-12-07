// Quiz data
const quizData = {
    'basic-programming': {
        id: 'basic-programming',
        title: 'Basic Programming Concepts',
        icon: '💻',
        questions: [
            {
                id: 1,
                question: 'What is a variable in programming?',
                options: [
                    'A container for storing data values',
                    'A type of loop',
                    'A function that returns nothing',
                    'A programming language'
                ],
                correctAnswer: 0
            },
            {
                id: 2,
                question: 'Which of the following is NOT a primitive data type in JavaScript?',
                options: ['String', 'Number', 'Boolean', 'Array'],
                correctAnswer: 3
            },
            {
                id: 3,
                question: 'What does "DRY" stand for in programming?',
                options: [
                    'Debug Regularly Yearly',
                    "Don't Repeat Yourself",
                    'Develop Rapid Years',
                    'Data Resource Yield'
                ],
                correctAnswer: 1
            },
            {
                id: 4,
                question: 'What is the purpose of a function?',
                options: [
                    'To style web pages',
                    'To reuse code and organize logic',
                    'To connect to databases',
                    'To create variables'
                ],
                correctAnswer: 1
            },
            {
                id: 5,
                question: 'What is an array?',
                options: [
                    'A single value',
                    'A collection of values stored in a single variable',
                    'A type of loop',
                    'A function parameter'
                ],
                correctAnswer: 1
            }
        ]
    },
    'networking': {
        id: 'networking',
        title: 'Networking Fundamentals',
        icon: '🌐',
        questions: [
            {
                id: 1,
                question: 'What does IP stand for?',
                options: ['Internet Protocol', 'Internal Process', 'Information Package', 'Integrated Platform'],
                correctAnswer: 0
            },
            {
                id: 2,
                question: 'Which protocol is used for sending emails?',
                options: ['HTTP', 'FTP', 'SMTP', 'DNS'],
                correctAnswer: 2
            },
            {
                id: 3,
                question: 'What is the default port for HTTPS?',
                options: ['80', '8080', '443', '22'],
                correctAnswer: 2
            },
            {
                id: 4,
                question: 'What does DNS stand for?',
                options: [
                    'Domain Name System',
                    'Data Network Service',
                    'Digital Naming Structure',
                    'Direct Network Source'
                ],
                correctAnswer: 0
            },
            {
                id: 5,
                question: 'Which layer of the OSI model handles routing?',
                options: ['Application', 'Transport', 'Network', 'Data Link'],
                correctAnswer: 2
            }
        ]
    },
    'ui-ux': {
        id: 'ui-ux',
        title: 'UI/UX Design Principles',
        icon: '🎨',
        questions: [
            {
                id: 1,
                question: 'What does UI stand for?',
                options: ['User Interface', 'Universal Integration', 'Unified Information', 'User Interaction'],
                correctAnswer: 0
            },
            {
                id: 2,
                question: 'Which principle focuses on making important elements stand out?',
                options: ['Alignment', 'Contrast', 'Repetition', 'Proximity'],
                correctAnswer: 1
            },
            {
                id: 3,
                question: 'What is a wireframe?',
                options: [
                    'A finished design',
                    'A basic structural guide for a page',
                    'A color palette',
                    'A typography system'
                ],
                correctAnswer: 1
            },
            {
                id: 4,
                question: 'What does UX stand for?',
                options: ['User Experience', 'Universal Exchange', 'Unified Extension', 'User Exploration'],
                correctAnswer: 0
            },
            {
                id: 5,
                question: 'Which color scheme uses colors opposite each other on the color wheel?',
                options: ['Monochromatic', 'Analogous', 'Complementary', 'Triadic'],
                correctAnswer: 2
            }
        ]
    }
};

// Merge custom quizzes from localStorage (key: topify_quizzes)
try {
    const customRaw = localStorage.getItem('topify_quizzes');
    if (customRaw) {
        const custom = JSON.parse(customRaw);
        Object.keys(custom).forEach(key => {
            // ensure id exists
            if (custom[key] && custom[key].id) {
                quizData[custom[key].id] = custom[key];
            }
        });
    }
} catch (e) {
    // ignore malformed storage
}

// State
let currentQuiz = null;
let currentQuestionIndex = 0;
let answers = {};
let startTime = null;

// Utility: Fisher-Yates shuffle
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = array[i];
        array[i] = array[j];
        array[j] = tmp;
    }
    return array;
}

// Get quiz ID from URL
function getQuizIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || 'basic-programming';
}

// Initialize quiz
function initQuiz() {
    const quizId = getQuizIdFromURL();
    const originalQuiz = quizData[quizId];
    // create a shallow copy of the quiz and shuffle the questions
    currentQuiz = {
        ...originalQuiz,
        questions: shuffleArray(originalQuiz.questions.slice())
    };
    
    if (!currentQuiz) {
        window.location.href = '/';
        return;
    }

    startTime = Date.now();
    currentQuestionIndex = 0;
    answers = {};
    
    document.getElementById('quiz-icon').textContent = currentQuiz.icon;
    document.getElementById('quiz-title').textContent = currentQuiz.title;
    
    updateQuizDisplay();
    startTimer();
    lucide.createIcons();
}

// Update quiz display
function updateQuizDisplay() {
    const question = currentQuiz.questions[currentQuestionIndex];
    const totalQuestions = currentQuiz.questions.length;
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
    
    document.getElementById('progress-text').textContent = `Question ${currentQuestionIndex + 1} of ${totalQuestions}`;
    document.getElementById('progress-percentage').textContent = `${Math.round(progress)}%`;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    
    document.getElementById('question-text').textContent = question.question;
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const isSelected = answers[currentQuestionIndex] === index;
        
        const optionHTML = `
            <label class="option-label">
                <input 
                    type="radio" 
                    name="answer" 
                    value="${index}" 
                    class="option-input"
                    ${isSelected ? 'checked' : ''}
                    onchange="handleAnswerSelect(${index})"
                >
                <div class="option-card">
                    <div class="option-radio"></div>
                    <span class="option-text">${option}</span>
                </div>
            </label>
        `;
        optionsContainer.innerHTML += optionHTML;
    });
    
    document.getElementById('prev-btn').disabled = currentQuestionIndex === 0;
    
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
    document.getElementById('next-btn').style.display = isLastQuestion ? 'none' : 'flex';
    document.getElementById('submit-btn').style.display = isLastQuestion ? 'flex' : 'none';
}

// Handle answer selection
function handleAnswerSelect(optionIndex) {
    answers[currentQuestionIndex] = optionIndex;
}

// Navigation handlers
function handlePrevious() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        updateQuizDisplay();
    }
}

function handleNext() {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
        currentQuestionIndex++;
        updateQuizDisplay();
    }
}

function handleSubmit() {
    const endTime = Date.now();
    showResults(endTime);
}

// Timer
function startTimer() {
    setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('time-display').textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

// Calculate score
function calculateScore() {
    let correct = 0;
    currentQuiz.questions.forEach((question, index) => {
        if (answers[index] === question.correctAnswer) {
            correct++;
        }
    });
    return {
        correct,
        total: currentQuiz.questions.length,
        percentage: Math.round((correct / currentQuiz.questions.length) * 100)
    };
}

// Show results
function showResults(endTime) {
    const timeTaken = Math.floor((endTime - startTime) / 1000);
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    const score = calculateScore();
    
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('results-container').style.display = 'block';
    
    document.getElementById('score-display').textContent = `${score.correct}/${score.total}`;
    document.getElementById('correct-display').textContent = score.correct;
    document.getElementById('time-taken-display').textContent = timeString;
    
    displayReview();
    lucide.createIcons();
}

// Display review
function displayReview() {
    const reviewContainer = document.getElementById('review-container');
    reviewContainer.innerHTML = '';
    
    currentQuiz.questions.forEach((question, index) => {
        const userAnswer = answers[index];
        const isCorrect = userAnswer === question.correctAnswer;
        
        const reviewHTML = `
            <div class="review-item ${isCorrect ? 'correct' : 'incorrect'}">
                <div class="review-header">
                    <span class="review-status ${isCorrect ? 'correct' : 'incorrect'}">
                        <i data-lucide="${isCorrect ? 'check-circle' : 'x-circle'}"></i>
                        ${isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                </div>
                <h3 class="review-question">Question ${index + 1}: ${question.question}</h3>
                <div class="review-answers">
                    ${userAnswer !== undefined ? `
                        <div class="review-answer your-answer">
                            <strong>Your answer:</strong> ${question.options[userAnswer]}
                        </div>
                    ` : '<div class="review-answer">No answer selected</div>'}
                    ${!isCorrect ? `
                        <div class="review-answer correct-answer">
                            <i data-lucide="check"></i>
                            <strong>Correct answer:</strong> ${question.options[question.correctAnswer]}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        reviewContainer.innerHTML += reviewHTML;
    });
    
    lucide.createIcons();
}

// Event listeners
// Event listeners (guarded to avoid errors when elements are absent)
const backBtn = document.getElementById('back-btn');
if (backBtn) backBtn.addEventListener('click', () => { window.location.href = '../index.html'; });
else console.warn('quiz.js: back-btn not found');

const prevBtn = document.getElementById('prev-btn');
if (prevBtn) prevBtn.addEventListener('click', handlePrevious);
else console.warn('quiz.js: prev-btn not found');

const nextBtn = document.getElementById('next-btn');
if (nextBtn) nextBtn.addEventListener('click', handleNext);
else console.warn('quiz.js: next-btn not found');

const submitBtn = document.getElementById('submit-btn');
if (submitBtn) submitBtn.addEventListener('click', handleSubmit);
else console.warn('quiz.js: submit-btn not found');

// Go home (same behavior)
const homeBtn = document.getElementById('home-btn');
if (homeBtn) homeBtn.addEventListener('click', () => { window.location.href = '../index.html'; });
else console.warn('quiz.js: home-btn not found');

const retakeBtn = document.getElementById('retake-btn');
if (retakeBtn) retakeBtn.addEventListener('click', () => { window.location.reload(); });
else console.warn('quiz.js: retake-btn not found');

// Initialize on page load
initQuiz();
