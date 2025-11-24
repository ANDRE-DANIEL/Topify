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
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        const tab = item.dataset.tab;
        console.log('Navigating to:', tab);
        // In a real app, you would switch views here
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

console.log('Dashboard initialized successfully!');