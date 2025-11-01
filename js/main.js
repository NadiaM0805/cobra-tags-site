document.getElementById('year').textContent = new Date().getFullYear();

async function loadPartials(){
  const sections = document.querySelectorAll('[data-partial]');
  for (const sec of sections){
    const url = sec.getAttribute('data-partial');
    try {
      const res = await fetch(url);
      sec.innerHTML = await res.text();
    } catch (e) {
      sec.innerHTML = '<div class="container"><p>Failed to load section.</p></div>';
      console.error('Partial load error:', url, e);
    }
  }
}
loadPartials().then(initBehaviors);

function initBehaviors(){
  fetch('data/prices.json')
    .then(r => r.json())
    .then(p => {
      if (p.round) document.querySelector('#price-round').textContent = p.round;
      if (p.card)  document.querySelector('#price-card').textContent = p.card;
    }).catch(()=>{});

  const params = new URLSearchParams(location.hash.replace('#','').split('&').map(x=>x.split('=')));
  if(params.get('pr')){
    const [roundP, cardP] = params.get('pr').split(',');
    if(roundP) document.querySelector('#price-round').textContent = roundP;
    if(cardP) document.querySelector('#price-card').textContent = cardP;
  }

  document.addEventListener('click', e=>{
    const btn = e.target.closest('[data-copy-email]');
    if(!btn) return;
    const email = document.querySelector('#email')?.textContent?.trim();
    if(email){ navigator.clipboard.writeText(email).then(()=>alert('Email copied: '+email)); }
  });

  // Play jingle when user clicks "See prices"
  const jingle = document.getElementById('cobra-audio');
  document.addEventListener('click', e => {
    const pricesBtn = e.target.closest('a[href="#pricing"]');
    if (!pricesBtn || !jingle) return;
    try { jingle.muted = false; jingle.play(); } catch (_) {}
  });

  // Setup video click handlers after partials load
  setupVideoHandlers();
  
  // Also watch for dynamically added videos
  const observer = new MutationObserver(() => {
    setupVideoHandlers();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  
  function setupVideoHandlers() {
    // Remove old handlers to avoid duplicates
    document.querySelectorAll('.phone-shot, .video-wrap > div').forEach(container => {
      const newContainer = container.cloneNode(true);
      container.parentNode?.replaceChild(newContainer, container);
    });
    
    // Find all video containers and attach handlers
    document.querySelectorAll('.phone-shot, .video-wrap > div').forEach(container => {
      const video = container.querySelector('video.precision-video, video.video');
      if (!video || container.dataset.handlerAttached) return;
      
      container.dataset.handlerAttached = 'true';
      
      container.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleVideoClick(video);
      });
      
      // Also allow direct clicks on video
      video.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleVideoClick(video);
      });
    });
  }
  
  function handleVideoClick(video) {
    if (!video) return;
    
    // Unmute video when user clicks (enables sound)
    if (video.muted) {
      video.muted = false;
      video.play().catch(err => console.log('Play error:', err));
    }
    
    // Check if video supports fullscreen
    if (video.requestFullscreen) {
      video.requestFullscreen().catch(err => console.log('Fullscreen error:', err));
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen();
    } else if (video.mozRequestFullScreen) {
      video.mozRequestFullScreen();
    } else if (video.msRequestFullscreen) {
      video.msRequestFullscreen();
    }
  }

  // Restore video state when exiting fullscreen (keep sound unmuted)
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      const videos = document.querySelectorAll('video.precision-video, video.video');
      videos.forEach(v => {
        if (v.paused) v.play(); // Resume if paused
      });
    }
  });
  document.addEventListener('webkitfullscreenchange', () => {
    if (!document.webkitFullscreenElement) {
      const videos = document.querySelectorAll('video.precision-video, video.video');
      videos.forEach(v => {
        if (v.paused) v.play();
      });
    }
  });
}

