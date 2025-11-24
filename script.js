// Toast notification function
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    toast.innerHTML = `
        <i class="fas fa-check-circle toast-icon"></i>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const sidebar = document.getElementById('sidebar');

mobileMenuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 1024) {
        if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    }
});

// Navigation tabs
const navItems = document.querySelectorAll('.nav-item');
const pageViews = {
    'dashboard': document.getElementById('dashboard-view'),
    'quizzes': document.getElementById('quizzes-view')
};

navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        const tab = item.dataset.tab;
        
        // Hide all views
        Object.values(pageViews).forEach(view => {
            if (view) view.classList.remove('active');
        });
        
        // Show selected view
        if (pageViews[tab]) {
            pageViews[tab].classList.add('active');
        }
        
        // Close mobile menu
        if (window.innerWidth <= 1024) {
            sidebar.classList.remove('open');
        }
    });
});

// Quiz start buttons
const quizButtons = document.querySelectorAll('.btn-quiz');
quizButtons.forEach(button => {
    button.addEventListener('click', () => {
        const quizName = button.dataset.quiz;
        showToast(`Starting ${quizName} quiz!`);
    });
});

// Share buttons
const shareBtn = document.getElementById('share-btn');
const shareQuizBtn = document.getElementById('share-quiz-btn');

shareBtn.addEventListener('click', () => {
    showToast('Quiz link copied to clipboard!');
});

shareQuizBtn.addEventListener('click', () => {
    showToast('Quiz link copied to clipboard!');
});

// Search functionality
const searchInput = document.querySelector('.search-input');
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    console.log('Searching for:', searchTerm);
    // In a real app, you would filter results here
});

// Window resize handler
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (window.innerWidth > 1024) {
            sidebar.classList.remove('open');
        }
    }, 250);
});

// Create Quiz Modal
const createQuizBtn = document.getElementById('create-quiz-btn');
const createQuizModal = document.getElementById('create-quiz-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelModalBtn = document.getElementById('cancel-modal-btn');
const confirmCreateBtn = document.getElementById('confirm-create-btn');
const modalOverlay = document.querySelector('.modal-overlay');

function openModal() {
    createQuizModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    createQuizModal.classList.remove('active');
    document.body.style.overflow = '';
}

createQuizBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
cancelModalBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

confirmCreateBtn.addEventListener('click', () => {
    const quizTitle = document.getElementById('quiz-title').value;
    const quizType = document.querySelector('input[name="quiz-type"]:checked').value;
    const numQuestions = document.getElementById('num-questions').value;
    
    if (!quizTitle.trim()) {
        showToast('Please enter a quiz title', 'error');
        return;
    }
    
    if (!numQuestions || numQuestions < 1) {
        showToast('Please enter a valid number of questions', 'error');
        return;
    }
    
    const quizTypeNames = {
        'multiple-choice': 'Multiple Choice',
        'identification': 'Identification',
        'fill-in-blanks': 'Fill in the Blanks'
    };
    
    showToast(`Creating ${quizTypeNames[quizType]} quiz "${quizTitle}" with ${numQuestions} questions!`);
    closeModal();
    
    // Reset form
    document.getElementById('quiz-title').value = '';
    document.getElementById('num-questions').value = '10';
    document.querySelector('input[name="quiz-type"][value="multiple-choice"]').checked = true;
});

console.log('Dashboard initialized successfully!');
