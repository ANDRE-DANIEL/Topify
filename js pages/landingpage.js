// Landing page behavior
(function(){
  // Apply saved theme preference from settings (light/dark)
  try{
    const savedTheme = localStorage.getItem('topify_theme');
    if(savedTheme === 'dark') document.body.classList.add('theme-dark');
    else document.body.classList.remove('theme-dark');
  }catch(e){ /* ignore if localStorage not available */ }

  // Helper to resolve navigation target depending on where the landing page is loaded from.
  // If the current URL path includes the `html pages` folder, pages are in the same folder.
  // Otherwise assume landing is at project root and other pages live under `html pages/`.
  function toTarget(filename){
    const path = window.location.pathname || window.location.href;
    const inHtmlPages = path.indexOf('/html pages/') !== -1 || path.indexOf('%20html%20pages%20') !== -1;
    return inHtmlPages ? filename : ('html pages/' + filename);
  }

  const enterBtn = document.getElementById('enterBtn');
  const learnBtn = document.getElementById('learnBtn');
  const ctaBannerBtn = document.querySelector('.lp-cta-banner .btn-primary');

  if(enterBtn){
    enterBtn.addEventListener('click', ()=>{
      window.location.href = toTarget('dashboard.html');
    });
  }

  if(learnBtn){
    learnBtn.addEventListener('click', ()=>{
      window.location.href = toTarget('resources.html');
    });
  }

  if(ctaBannerBtn){
    ctaBannerBtn.addEventListener('click', ()=>{
      window.location.href = toTarget('dashboard.html') + '#quizzes';
    });
  }

  // Normalize header nav links if present (so they work both from root and from html pages folder)
  const navResources = document.querySelectorAll('.lp-nav-link');
  navResources.forEach(a => { a.setAttribute('href', toTarget('resources.html')); });
  const navGetStarted = document.querySelectorAll('.lp-nav-cta');
  navGetStarted.forEach(a => { a.setAttribute('href', toTarget('dashboard.html')); });

})();
