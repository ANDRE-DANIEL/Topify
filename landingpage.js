// Landing page behavior
(function(){
  const enterBtn = document.getElementById('enterBtn');
  const learnBtn = document.getElementById('learnBtn');

  // NOTE: do NOT auto-redirect on load. This ensures the landing page is visible
  // when users open the app. The skip preference is still respected when users
  // click the Enter button (it will be saved and used on future visits if you
  // choose to implement a server-side or initial check).

  if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      // Directly navigate to the app dashboard; no skip preference saved.
      window.location.href = 'dashboard.html';
    });
  }

  if (learnBtn) {
    learnBtn.addEventListener('click', () => {
      window.location.href = 'resources.html';
    });
  }

  learnBtn.addEventListener('click', ()=>{
    // route to resources or settings page — resources.html exists in the project
    window.location.href = 'resources.html';
  });
})();
