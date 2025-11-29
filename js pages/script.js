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

// Apply saved theme (dark/light) from localStorage
function applySavedTheme() {
    try {
        // Read the saved preference and apply it. Default to light.
        const saved = localStorage.getItem('topify_theme') || 'light';
        if (saved === 'dark') {
            document.body.classList.add('theme-dark');
        } else {
            document.body.classList.remove('theme-dark');
        }
    } catch (e) {
        // ignore
    }
}

applySavedTheme();

// --- Sidebar collapse handling ---
const sidebarToggle = document.getElementById('sidebar-toggle');
function applySavedSidebarState() {
    try {
        const collapsed = localStorage.getItem('topify_sidebar_collapsed') === 'true';
        if (collapsed) {
            document.body.classList.add('sidebar-collapsed');
        } else {
            document.body.classList.remove('sidebar-collapsed');
        }
        // reflect state on the toggle button (icon animation)
        if (sidebarToggle) {
            if (collapsed) sidebarToggle.classList.add('is-collapsed');
            else sidebarToggle.classList.remove('is-collapsed');
        }
    } catch (e) {}
}

applySavedSidebarState();

if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
        const isCollapsed = document.body.classList.toggle('sidebar-collapsed');
        try {
            localStorage.setItem('topify_sidebar_collapsed', isCollapsed ? 'true' : 'false');
        } catch (e) {}
        // toggle animated class on the button
        sidebarToggle.classList.toggle('is-collapsed', isCollapsed);
    });
    // ensure icon state reflects saved collapsed value on load
    const iconInit = sidebarToggle.querySelector('i');
    if (iconInit) {
        const saved = localStorage.getItem('topify_sidebar_collapsed') === 'true';
        sidebarToggle.classList.toggle('is-collapsed', saved);
    }
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

function activateTab(tab) {
    // Set active class on nav items
    navItems.forEach(nav => {
        if (nav.dataset && nav.dataset.tab === tab) {
            nav.classList.add('active');
        } else {
            nav.classList.remove('active');
        }
    });

    // Hide all views, then show the requested one (with a smooth fade)
    Object.values(pageViews).forEach(view => {
        if (view) {
            view.classList.remove('active');
            // ensure fade-in class removed so it can be applied again
            view.classList.remove('fade-in');
        }
    });
    if (pageViews[tab]) {
        const view = pageViews[tab];
        view.classList.add('active');
        // trigger a fade-in animation
        requestAnimationFrame(() => {
            view.classList.add('fade-in');
            setTimeout(() => view.classList.remove('fade-in'), 450);
        });
    }

    // Close mobile menu on smaller screens
    if (window.innerWidth <= 1024) {
        sidebar.classList.remove('open');
    }
}

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const tab = item.dataset.tab;
        activateTab(tab);
    });
});

// On page load, check URL hash or current page to open the correct tab
let initialTab = 'dashboard';
if (window.location.hash) {
    initialTab = window.location.hash.slice(1);
} else if (window.location.pathname && window.location.pathname.endsWith('settings.html')) {
    // If we're on the separate settings page, highlight the Settings nav item
    initialTab = 'settings';
} else if (window.location.pathname && window.location.pathname.endsWith('resources.html')) {
    // Resources page lives on its own file; highlight the Resources (data-tab="students") nav item
    initialTab = 'students';
}
activateTab(initialTab);

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

// Toggle this to true if you want the share buttons to rickroll users instead of sharing.
const RICKROLL_MODE = false;
const RICKROLL_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

function fallbackCopyToClipboard(text){
    if(navigator.clipboard && navigator.clipboard.writeText){
        return navigator.clipboard.writeText(text).then(() => true).catch(()=>false);
    }
    // older fallback: create temporary textarea
    try{
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        return Promise.resolve(true);
    }catch(e){
        return Promise.resolve(false);
    }
}

function doShare({url=document.location.href, title=document.title, text='Check this out!' } = {}){
    if(RICKROLL_MODE){
        window.open(RICKROLL_URL, '_blank');
        return;
    }

    if(navigator.share){
        navigator.share({title, text, url}).then(()=>{
            showToast('Shared successfully');
        }).catch((err)=>{
            // user cancelled or failed — fallback to copy
            fallbackCopyToClipboard(url).then(ok => {
                if(ok) showToast('Link copied to clipboard');
                else showToast('Unable to share or copy link', 'error');
            });
        });
    } else {
        // fallback: copy link
        fallbackCopyToClipboard(url).then(ok => {
            if(ok) showToast('Link copied to clipboard');
            else window.open(url, '_blank');
        });
    }
}

if(shareBtn){
    shareBtn.addEventListener('click', (e)=>{
        // Hidden easter-egg: Shift+Click opens a rickroll. Regular click performs share.
        if(e && e.shiftKey){
            window.open(RICKROLL_URL, '_blank');
            showToast('Surprise!');
            return;
        }
        // share current page (dashboard)
        const url = window.location.href;
        doShare({url, title: 'Topify — Share', text: 'Check out this quiz dashboard on Topify!'});
    });
}

if(shareQuizBtn){
    shareQuizBtn.addEventListener('click', (e)=>{
        // Hidden easter-egg: Shift+Click opens a rickroll. Regular click performs share.
        if(e && e.shiftKey){
            window.open(RICKROLL_URL, '_blank');
            showToast('Surprise!');
            return;
        }
        // attempt to share current quiz or page
        const url = window.location.href;
        doShare({url, title: 'Topify — Quiz', text: 'Try this quiz on Topify!'});
    });
}

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
    
    // scaffold a new quiz and save to localStorage
    const quizIdBase = quizTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'custom-quiz';
    const quizId = `${quizIdBase}-${Date.now()}`;

    const typeIcons = {
        'multiple-choice': '❓',
        'identification': '🔤',
        'fill-in-blanks': '✍️'
    };

    const questions = [];
    for (let i = 0; i < Number(numQuestions); i++) {
        if (quizType === 'multiple-choice') {
            questions.push({
                id: i + 1,
                question: `Question ${i + 1}`,
                options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
                correctAnswer: 0
            });
        } else {
            questions.push({
                id: i + 1,
                question: `Question ${i + 1}`,
                options: [],
                correctAnswer: null
            });
        }
    }

    const newQuiz = {
        id: quizId,
        title: quizTitle,
        icon: typeIcons[quizType] || '📝',
        questions
    };

    // save
    const saved = getCustomQuizzes();
    saved[quizId] = newQuiz;
    saveCustomQuizzes(saved);

    showToast(`Created quiz "${quizTitle}" — now you can edit questions.`);
    closeModal();

    // reset form
    document.getElementById('quiz-title').value = '';
    document.getElementById('num-questions').value = '10';
    document.querySelector('input[name="quiz-type"][value="multiple-choice"]').checked = true;

    // refresh list and open full-page editor for the created quiz
    renderQuizzesList();
    window.location.href = `editor.html?id=${encodeURIComponent(quizId)}`;
});

// -- localStorage helpers for custom quizzes --
function getCustomQuizzes() {
    try {
        return JSON.parse(localStorage.getItem('topify_quizzes') || '{}');
    } catch (e) {
        return {};
    }
}

function saveCustomQuizzes(obj) {
    localStorage.setItem('topify_quizzes', JSON.stringify(obj));
}

// Render quizzes list in the "My Quizzes" view
function renderQuizzesList() {
    const container = document.querySelector('.quizzes-list');
    if (!container) return;

    // built-in quick list (matching quiz.js ids)
    const builtIns = [
        {id: 'basic-programming', title: 'Basic Programming Concepts', icon: '💻', questions: 5},
        {id: 'networking', title: 'Networking Fundamentals', icon: '🌐', questions: 5},
        {id: 'ui-ux', title: 'UI/UX Design Principles', icon: '🎨', questions: 5}
    ];

    const customs = Object.values(getCustomQuizzes());

    let html = '';

    const renderCard = (q, isCustom) => {
        const qCount = (q.questions && q.questions.length) || q.questions || 0;
        // Add an id to each card so we can link/scroll to it after save
        const cardId = `quiz-card-${q.id}`;
        return `
            <div class="quiz-list-card" id="${cardId}">
                <div class="quiz-list-icon">${q.icon || '📝'}</div>
                <div class="quiz-list-info">
                    <h3>${escapeHtml(q.title)}</h3>
                    <p class="quiz-list-meta">
                        <span><i class="fas fa-question-circle"></i> ${qCount} questions</span>
                    </p>
                </div>
                <div class="quiz-list-actions">
                    ${isCustom ? `
                        <button class="btn btn-outline btn-sm" data-open-id="${q.id}" onclick="window.location.href='editor.html?id=${encodeURIComponent(q.id)}'">
                            <i class="fas fa-edit"></i>
                            Edit
                        </button>
                        <button class="btn btn-outline btn-sm" data-delete-id="${q.id}" style="color:#ff6b6b;border-color:rgba(255,107,107,0.12);">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    ` : ''}
                    <button class="btn btn-primary btn-sm" data-start-id="${q.id}">
                        <i class="fas fa-play"></i>
                        Start
                    </button>
                </div>
            </div>
        `;
    };

    // built-ins first
    builtIns.forEach(b => html += renderCard(b, false));
    // then custom
    customs.forEach(c => html += renderCard(c, true));

    container.innerHTML = html;

    // attach handlers
    container.querySelectorAll('[data-start-id]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-start-id');
            // navigate to quiz page with id
            window.location.href = `quiz.html?id=${encodeURIComponent(id)}`;
        });
    });

    // Edit buttons now navigate directly to `editor.html?id=...`

    container.querySelectorAll('[data-delete-id]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-delete-id');
            deleteQuiz(id);
        });
    });
}

// Delete a custom quiz by id
function deleteQuiz(quizId) {
    if (!confirm('Delete this quiz? This action cannot be undone.')) return;
    const quizzes = getCustomQuizzes();
    if (!quizzes[quizId]) {
        showToast('Quiz not found', 'error');
        return;
    }
    delete quizzes[quizId];
    saveCustomQuizzes(quizzes);
    showToast('Quiz deleted', 'success');
    // close editor if open for this quiz
    const editingIdInput = document.getElementById('editing-quiz-id');
    if (editingIdInput && editingIdInput.value === quizId) {
        closeEditModal();
    }
    renderQuizzesList();
}

// Utility to escape HTML
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// -- Edit modal logic --
const editModal = document.getElementById('edit-quiz-modal');
const closeEditModalBtn = document.getElementById('close-edit-modal-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const saveEditBtn = document.getElementById('save-edit-btn');

// Generic editor builder: can render into any container (modal body or full page)
function buildEditor(container, quiz, options = {}) {
    // options: { inModal: boolean }
    container.innerHTML = '';

    const topbar = document.createElement('div');
    topbar.className = 'editor-topbar';
    topbar.innerHTML = `
        <button class="back-btn editor-back">
            <i class="fas fa-arrow-left"></i>
            Back to Quizzes
        </button>
        <div class="editor-title">${escapeHtml(quiz.title)}</div>
        <div class="editor-actions">
            <button id="header-save-btn" class="btn save-quiz-btn">
                <i class="fas fa-save"></i>
                Save Quiz
            </button>
        </div>
    `;
    container.appendChild(topbar);

    const layout = document.createElement('div');
    layout.className = 'edit-layout';

    // Sidebar
    const sidebarEl = document.createElement('aside');
    sidebarEl.className = 'edit-sidebar';
    sidebarEl.innerHTML = `
        <div class="quiz-info-card">
            <h4>Quiz Information</h4>
            <div class="info-row"><span class="info-label">Type:</span> <span class="info-value">${quiz.questions && quiz.questions.length && quiz.questions[0] && quiz.questions[0].options && quiz.questions[0].options.length ? 'Multiple Choice' : 'Identification/Short Answer'}</span></div>
            <div class="info-row"><span class="info-label">Questions:</span> <span id="questions-count" class="info-value">${quiz.questions.length}</span></div>
        </div>
        <button id="add-question-btn" class="btn btn-primary btn-block" style="margin-top:12px;">+ Add Question</button>
    `;

    // Main area
    const mainEl = document.createElement('main');
    mainEl.className = 'edit-main';

    const mainPanel = document.createElement('div');
    mainPanel.className = 'editor-main-panel';

    const questionsArea = document.createElement('div');
    questionsArea.id = 'questions-area';
    questionsArea.className = 'questions-area';

    mainPanel.appendChild(questionsArea);
    mainEl.appendChild(mainPanel);

    layout.appendChild(sidebarEl);
    layout.appendChild(mainEl);
    container.appendChild(layout);

    // Now create question cards and wire interactions (same logic used previously)
    function renderQuestionCardLocal(q, idx) {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.dataset.qIndex = idx;

        const qHeader = document.createElement('div');
        qHeader.className = 'question-card-header';
        qHeader.innerHTML = `<h4>Question ${idx + 1}</h4><button class="btn btn-outline btn-sm remove-question">Remove</button>`;
        card.appendChild(qHeader);

        const qTextGroup = document.createElement('div');
        qTextGroup.className = 'form-group';
        const qLabel = document.createElement('label');
        qLabel.textContent = 'Question';
        const qInput = document.createElement('input');
        qInput.type = 'text';
        qInput.className = 'form-input edit-question-text';
        qInput.value = q.question || '';
        qTextGroup.appendChild(qLabel);
        qTextGroup.appendChild(qInput);
        card.appendChild(qTextGroup);

        const optsContainer = document.createElement('div');
        optsContainer.className = 'options-container-editor';

        if (q.options && q.options.length) {
            q.options.forEach((opt, optIdx) => {
                const optRow = document.createElement('div');
                optRow.className = 'option-row';

                const optInput = document.createElement('input');
                optInput.type = 'text';
                optInput.className = 'form-input edit-option-text';
                optInput.value = opt || '';

                const checkBtn = document.createElement('button');
                checkBtn.type = 'button';
                checkBtn.className = 'option-check';
                checkBtn.innerHTML = '<i class="fas fa-check"></i>';
                if (q.correctAnswer === optIdx) checkBtn.classList.add('selected');

                checkBtn.addEventListener('click', () => {
                    optsContainer.querySelectorAll('.option-check').forEach(b => b.classList.remove('selected'));
                    checkBtn.classList.add('selected');
                });

                const removeOpt = document.createElement('button');
                removeOpt.type = 'button';
                removeOpt.className = 'btn btn-outline btn-sm remove-option';
                removeOpt.textContent = 'Remove';
                removeOpt.addEventListener('click', () => optRow.remove());

                optRow.appendChild(checkBtn);
                optRow.appendChild(optInput);
                optRow.appendChild(removeOpt);
                optsContainer.appendChild(optRow);
            });
        } else {
            const ansGroup = document.createElement('div');
            ansGroup.className = 'form-group';
            const ansLabel = document.createElement('label');
            ansLabel.textContent = 'Answer';
            const ansInput = document.createElement('input');
            ansInput.type = 'text';
            ansInput.className = 'form-input edit-answer-text';
            ansInput.value = q.correctAnswer || '';
            ansGroup.appendChild(ansLabel);
            ansGroup.appendChild(ansInput);
            optsContainer.appendChild(ansGroup);
        }

        const addOptBtn = document.createElement('button');
        addOptBtn.type = 'button';
        addOptBtn.className = 'btn btn-outline btn-sm add-option-btn';
        addOptBtn.textContent = 'Add Option';
        addOptBtn.addEventListener('click', () => {
            const optRow = document.createElement('div');
            optRow.className = 'option-row';
            const optInput = document.createElement('input');
            optInput.type = 'text';
            optInput.className = 'form-input edit-option-text';
            optInput.value = '';
            const checkBtn = document.createElement('button');
            checkBtn.type = 'button';
            checkBtn.className = 'option-check';
            checkBtn.innerHTML = '<i class="fas fa-check"></i>';
            checkBtn.addEventListener('click', () => { optsContainer.querySelectorAll('.option-check').forEach(b => b.classList.remove('selected')); checkBtn.classList.add('selected'); });
            const removeOpt = document.createElement('button');
            removeOpt.type = 'button';
            removeOpt.className = 'btn btn-outline btn-sm remove-option';
            removeOpt.textContent = 'Remove';
            removeOpt.addEventListener('click', () => optRow.remove());
            optRow.appendChild(checkBtn);
            optRow.appendChild(optInput);
            optRow.appendChild(removeOpt);
            optsContainer.appendChild(optRow);
        });

        card.appendChild(optsContainer);
        card.appendChild(addOptBtn);

        qHeader.querySelector('.remove-question').addEventListener('click', () => {
            card.remove();
            updateQuestionsCountLocal();
            questionsArea.querySelectorAll('.question-card').forEach((c, i) => {
                c.querySelector('.question-card-header h4').textContent = `Question ${i + 1}`;
                c.dataset.qIndex = i;
            });
        });

        return card;
    }

    function updateQuestionsCountLocal() {
        // Do not update the sidebar count while the user is actively editing/adding
        // questions. The count will be refreshed when the quiz is saved.
        return;
    }

    // populate
    quiz.questions.forEach((q, idx) => questionsArea.appendChild(renderQuestionCardLocal(q, idx)));

    function ensurePlaceholderLocal() {
        if (questionsArea.children.length === 0) {
            const ph = document.createElement('div');
            ph.className = 'no-questions-placeholder';
            ph.innerHTML = `<div class="placeholder-icon">📄</div><h3>No questions yet</h3><p class="placeholder-sub">Click "Add Question" to start building your quiz</p>`;
            questionsArea.appendChild(ph);
        } else {
            const ph = questionsArea.querySelector('.no-questions-placeholder');
            if (ph) ph.remove();
        }
    }

    ensurePlaceholderLocal();

    const addQuestionBtn = container.querySelector('#add-question-btn');
    addQuestionBtn.addEventListener('click', () => {
        const ph = questionsArea.querySelector('.no-questions-placeholder'); if (ph) ph.remove();
        const newQ = { id: questionsArea.children.length + 1, question: 'New question', options: ['Option 1','Option 2','Option 3','Option 4'], correctAnswer: 0 };
        const card = renderQuestionCardLocal(newQ, questionsArea.querySelectorAll('.question-card').length);
        questionsArea.appendChild(card);
        // Smoothly bring the newly added question into view and focus its input
        try {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const qInput = card.querySelector('.edit-question-text');
            if (qInput) qInput.focus();
        } catch (e) {}
    });

    // header back/save
    const headerBack = container.querySelector('.editor-back');
    if (headerBack) {
        if (options.inModal) headerBack.addEventListener('click', () => closeEditModal());
        else headerBack.addEventListener('click', () => window.location.href = 'dashboard.html');
    }

    const headerSave = container.querySelector('#header-save-btn');
    if (headerSave) headerSave.addEventListener('click', () => saveEditor(container, quiz.id));

    // expose questionsArea for saveEditor to use by container
    return;
}

// Save editor content for quizId by reading from the container (which may be modal body or page)
function saveEditor(container, quizId) {
    const quizzes = getCustomQuizzes();
    const quiz = quizzes[quizId];
    if (!quiz) return showToast('No quiz loaded', 'error');

    const questionsArea = container.querySelector('#questions-area');
    const qCards = questionsArea ? questionsArea.querySelectorAll('.question-card') : [];
    const newQuestions = [];

    qCards.forEach((card, idx) => {
        const qText = card.querySelector('.edit-question-text') ? card.querySelector('.edit-question-text').value : `Question ${idx+1}`;
        const optionRows = card.querySelectorAll('.option-row');
        if (optionRows && optionRows.length) {
            const opts = [];
            let correctIdx = 0;
            optionRows.forEach((orow, oidx) => {
                const val = orow.querySelector('.edit-option-text') ? orow.querySelector('.edit-option-text').value : '';
                opts.push(val);
                if (orow.querySelector('.option-check') && orow.querySelector('.option-check').classList.contains('selected')) {
                    correctIdx = oidx;
                }
            });
            newQuestions.push({ id: idx+1, question: qText, options: opts, correctAnswer: correctIdx });
        } else {
            const ansInput = card.querySelector('.edit-answer-text');
            newQuestions.push({ id: idx+1, question: qText, options: [], correctAnswer: ansInput ? ansInput.value : '' });
        }
    });

    quiz.questions = newQuestions;
    quizzes[quizId] = quiz;
    saveCustomQuizzes(quizzes);
    // Update editor sidebar count (if the editor container is passed in)
    try {
        const editorCounter = container && typeof container.querySelector === 'function' ? container.querySelector('#questions-count') : null;
        if (editorCounter) editorCounter.textContent = newQuestions.length;
    } catch (e) {
        // ignore if container is not a DOM node
    }
    showToast('Quiz saved');
    // if in modal, close; otherwise stay
    const editModalBody = document.getElementById('edit-modal-body');
    if (editModalBody && editModalBody.contains(container)) {
        closeEditModal();
    }
    else {
        // If the editor was used as a full-page editor (not the modal),
        // redirect back to the quizzes list page (index.html) so the user
        // sees their saved quiz in the list. Use a short delay so the
        // "Quiz saved" toast can be seen.
        // Redirect to the quizzes page and include an anchor to the saved quiz card
        setTimeout(() => { window.location.href = `dashboard.html#quiz-card-${encodeURIComponent(quizId)}`; }, 600);
    }
    renderQuizzesList();
}

function openEditModal(quizId) {
    const quizzes = getCustomQuizzes();
    const quiz = quizzes[quizId];
    if (!quiz) {
        showToast('Quiz not found for editing', 'error');
        return;
    }

    document.getElementById('editing-quiz-id').value = quizId;
    document.getElementById('edit-modal-title').textContent = `Edit: ${quiz.title}`;

    const body = document.getElementById('edit-modal-body');
    // delegate to the generic builder for editor UI inside the modal body
    buildEditor(body, quiz, { inModal: true });

    // helper to render a question card
    function renderQuestionCard(q, idx) {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.dataset.qIndex = idx;

        const qHeader = document.createElement('div');
        qHeader.className = 'question-card-header';
        qHeader.innerHTML = `<h4>Question ${idx + 1}</h4><button class="btn btn-outline btn-sm remove-question">Remove</button>`;
        card.appendChild(qHeader);

        const qTextGroup = document.createElement('div');
        qTextGroup.className = 'form-group';
        const qLabel = document.createElement('label');
        qLabel.textContent = 'Question';
        const qInput = document.createElement('input');
        qInput.type = 'text';
        qInput.className = 'form-input edit-question-text';
        qInput.value = q.question || '';
        qTextGroup.appendChild(qLabel);
        qTextGroup.appendChild(qInput);
        card.appendChild(qTextGroup);

        // options area
        const optsContainer = document.createElement('div');
        optsContainer.className = 'options-container-editor';

        if (q.options && q.options.length) {
            q.options.forEach((opt, optIdx) => {
                const optRow = document.createElement('div');
                optRow.className = 'option-row';

                const optInput = document.createElement('input');
                optInput.type = 'text';
                optInput.className = 'form-input edit-option-text';
                optInput.value = opt || '';

                const checkBtn = document.createElement('button');
                checkBtn.type = 'button';
                checkBtn.className = 'option-check';
                checkBtn.innerHTML = '<i class="fas fa-check"></i>';
                if (q.correctAnswer === optIdx) checkBtn.classList.add('selected');

                checkBtn.addEventListener('click', () => {
                    // mark this as correct; unselect siblings
                    optsContainer.querySelectorAll('.option-check').forEach(b => b.classList.remove('selected'));
                    checkBtn.classList.add('selected');
                });

                const removeOpt = document.createElement('button');
                removeOpt.type = 'button';
                removeOpt.className = 'btn btn-outline btn-sm remove-option';
                removeOpt.textContent = 'Remove';
                removeOpt.addEventListener('click', () => {
                    optRow.remove();
                });

                optRow.appendChild(checkBtn);
                optRow.appendChild(optInput);
                optRow.appendChild(removeOpt);
                optsContainer.appendChild(optRow);
            });
        } else {
            // identification / short answer
            const ansGroup = document.createElement('div');
            ansGroup.className = 'form-group';
            const ansLabel = document.createElement('label');
            ansLabel.textContent = 'Answer';
            const ansInput = document.createElement('input');
            ansInput.type = 'text';
            ansInput.className = 'form-input edit-answer-text';
            ansInput.value = q.correctAnswer || '';
            ansGroup.appendChild(ansLabel);
            ansGroup.appendChild(ansInput);
            optsContainer.appendChild(ansGroup);
        }

        const addOptBtn = document.createElement('button');
        addOptBtn.type = 'button';
        addOptBtn.className = 'btn btn-outline btn-sm add-option-btn';
        addOptBtn.textContent = 'Add Option';
        addOptBtn.addEventListener('click', () => {
            const newIdx = optsContainer.querySelectorAll('.option-row').length;
            const optRow = document.createElement('div');
            optRow.className = 'option-row';

            const optInput = document.createElement('input');
            optInput.type = 'text';
            optInput.className = 'form-input edit-option-text';
            optInput.value = '';

            const checkBtn = document.createElement('button');
            checkBtn.type = 'button';
            checkBtn.className = 'option-check';
            checkBtn.innerHTML = '<i class="fas fa-check"></i>';
            checkBtn.addEventListener('click', () => {
                optsContainer.querySelectorAll('.option-check').forEach(b => b.classList.remove('selected'));
                checkBtn.classList.add('selected');
            });

            const removeOpt = document.createElement('button');
            removeOpt.type = 'button';
            removeOpt.className = 'btn btn-outline btn-sm remove-option';
            removeOpt.textContent = 'Remove';
            removeOpt.addEventListener('click', () => optRow.remove());

            optRow.appendChild(checkBtn);
            optRow.appendChild(optInput);
            optRow.appendChild(removeOpt);
            optsContainer.appendChild(optRow);
        });

        card.appendChild(optsContainer);
        card.appendChild(addOptBtn);

        // remove question
        qHeader.querySelector('.remove-question').addEventListener('click', () => {
            card.remove();
            updateQuestionsCount();
            // renumber
            questionsArea.querySelectorAll('.question-card').forEach((c, i) => {
                c.querySelector('.question-card-header h4').textContent = `Question ${i + 1}`;
                c.dataset.qIndex = i;
            });
        });

        return card;
    }

    function updateQuestionsCount() {
        // Intentionally no-op during edit. Sidebar reflects saved state only.
        return;
    }

    // populate existing questions
    quiz.questions.forEach((q, idx) => {
        const card = renderQuestionCard(q, idx);
        questionsArea.appendChild(card);
    });

    // placeholder when no questions
    function ensurePlaceholder() {
        if (questionsArea.children.length === 0) {
            const ph = document.createElement('div');
            ph.className = 'no-questions-placeholder';
            ph.innerHTML = `<div class="placeholder-icon">📄</div><h3>No questions yet</h3><p class="placeholder-sub">Click "Add Question" to start building your quiz</p>`;
            questionsArea.appendChild(ph);
        } else {
            const ph = questionsArea.querySelector('.no-questions-placeholder');
            if (ph) ph.remove();
        }
    }

    ensurePlaceholder();

    // add question handler
    const addQuestionBtn = document.getElementById('add-question-btn');
    addQuestionBtn.addEventListener('click', () => {
        // remove placeholder if present
        const ph = questionsArea.querySelector('.no-questions-placeholder');
        if (ph) ph.remove();

        const newQ = { id: questionsArea.children.length + 1, question: 'New question', options: ['Option 1','Option 2','Option 3','Option 4'], correctAnswer: 0 };
        const card = renderQuestionCard(newQ, questionsArea.querySelectorAll('.question-card').length);
        questionsArea.appendChild(card);
        // Smoothly bring the newly added question into view and focus its input
        try {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const qInput = card.querySelector('.edit-question-text');
            if (qInput) qInput.focus();
        } catch (e) {}
    });

    // header back button behavior
    const headerBack = body.querySelector('.editor-back');
    if (headerBack) headerBack.addEventListener('click', () => closeEditModal());

    // wire header save button to existing save handler
    const headerSave = document.getElementById('header-save-btn');
    if (headerSave) headerSave.addEventListener('click', () => saveEditBtn.click());

    updateQuestionsCount();
    ensurePlaceholder();

    editModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeEditModal() {
    editModal.classList.remove('active');
    document.body.style.overflow = '';
}

closeEditModalBtn.addEventListener('click', closeEditModal);
cancelEditBtn.addEventListener('click', closeEditModal);

// Wire delete button in edit modal
const deleteEditBtn = document.getElementById('delete-edit-btn');
if (deleteEditBtn) {
    deleteEditBtn.addEventListener('click', () => {
        const quizId = document.getElementById('editing-quiz-id').value;
        if (!quizId) return showToast('No quiz loaded', 'error');
        deleteQuiz(quizId);
    });
}

saveEditBtn.addEventListener('click', () => {
    const quizId = document.getElementById('editing-quiz-id').value;
    const container = document.getElementById('edit-modal-body');
    saveEditor(container, quizId);
});

// render initially
document.addEventListener('DOMContentLoaded', () => {
    renderQuizzesList();
});

console.log('Dashboard initialized successfully!');
