// Extracted from editor.html inline script
(function(){
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) {
    alert('No quiz id provided');
    window.location.href = 'dashboard.html';
    return;
  }

  // load quiz and render into editor-root
  const quizzes = getCustomQuizzes();
  const quiz = quizzes[id];
  if (!quiz) {
    alert('Quiz not found');
    window.location.href = 'dashboard.html';
    return;
  }

  const root = document.getElementById('editor-root');
  // make root full-bleed for editor
  root.innerHTML = '';
  const editorContainer = document.createElement('div');
  editorContainer.className = 'full-editor-container';
  root.appendChild(editorContainer);

  // use shared builder
  buildEditor(editorContainer, quiz, { inModal: false });
})();
