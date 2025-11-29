// Extracted from settings.html inline script
(function(){
    const toggle = document.getElementById('theme-toggle');
    const label = document.getElementById('theme-label');
    const body = document.body;

    function applyTheme(theme){
        if(theme === 'light'){
            body.classList.remove('theme-dark');
            toggle.checked = false; // unchecked = light
            label.textContent = 'Light Mode';
        } else {
            body.classList.add('theme-dark');
            toggle.checked = true; // checked = dark
            label.textContent = 'Dark Mode';
        }
    }

    // Default theme is light unless a saved preference exists
    const saved = localStorage.getItem('topify_theme') || 'light';
    applyTheme(saved);

    toggle.addEventListener('change', () => {
        // When checked -> dark mode, unchecked -> light mode
        const newTheme = toggle.checked ? 'dark' : 'light';
        localStorage.setItem('topify_theme', newTheme);
        applyTheme(newTheme);
        showToast('Theme updated', 'success');
    });

    // Feedback
    const form = document.getElementById('feedback-form');
    const btnCancel = document.getElementById('fb-cancel');
    btnCancel.addEventListener('click', () => {
        form.reset();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('fb-name').value.trim();
        const email = document.getElementById('fb-email').value.trim();
        const message = document.getElementById('fb-message').value.trim();
        if(!message){
            showToast('Please enter feedback message', 'error');
            return;
        }

        const feedbacks = JSON.parse(localStorage.getItem('topify_feedbacks') || '[]');
        feedbacks.push({ name, email, message, time: Date.now() });
        localStorage.setItem('topify_feedbacks', JSON.stringify(feedbacks));

        showToast('Thanks for your feedback!');
        form.reset();
    });
})();
