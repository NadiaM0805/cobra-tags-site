document.getElementById('year').textContent = new Date().getFullYear();

const reviews = [
  {
    name: "Jack M.",
    location: "Liverpool, UK",
    rating: 5,
    text: "My bike was nicked from outside our block. The Cobra Tag was tucked under the saddle and Find My showed it two streets away. I went with a neighbour, rang the tag and heard it beeping in a shared yard. Got the bike back within an hour.",
    tag: "Stolen bike found",
    avatar: "https://via.placeholder.com/72"
  },
  {
    name: "Sarah P.",
    location: "Bristol, UK",
    rating: 5,
    text: "We keep a Cobra Tag on our spaniel's collar for walks on the downs. She shot off after a squirrel and vanished. I opened Find My, played the sound and followed the beeps. She was happily sniffing bins behind a pub.",
    tag: "Dog on the loose",
    avatar: "https://via.placeholder.com/72"
  },
  {
    name: "Emma R.",
    location: "Manchester, UK",
    rating: 5,
    text: "We tow a little caravan most weekends. There's a tag in the van and another in the car. When we stop at services I always check the map — I like knowing exactly where everything is parked if we ever had to report it.",
    tag: "Caravan peace of mind",
    avatar: "https://via.placeholder.com/72"
  },
  {
    name: "Ben H.",
    location: "London, UK",
    rating: 5,
    text: "I'm the sort of person who leaves their wallet on the table and just walks off. The slim card lives in my wallet now. My phone pings the second I get to the door of the café without it.",
    tag: "Chronic wallet forgetter",
    avatar: "https://via.placeholder.com/72"
  },
  {
    name: "Lucy T.",
    location: "Leeds, UK",
    rating: 5,
    text: "There's a tag on the kids' school bags, one on the house keys and one in the suitcase we use for holidays. I'm much calmer now. If something's missing, I just open the app instead of panicking and turning the house upside down.",
    tag: "Calm, not frantic",
    avatar: "https://via.placeholder.com/72"
  },
  {
    name: "Tom S.",
    location: "Brighton, UK",
    rating: 4,
    text: "I drop a tag in every checked bag when I fly. Watching my luggage move on the map while I'm at the gate is ridiculously reassuring. Once I could see my suitcase stuck in a different terminal before the airline even admitted it.",
    tag: "Airport control freak",
    avatar: "https://via.placeholder.com/72"
  },
  {
    name: "Rachel G.",
    location: "Birmingham, UK",
    rating: 5,
    text: "Our house eats keys. Now the keys live on a Cobra Tag. If we're running late I just tap play sound and listen for the beeping from whatever coat pocket or toy box they've landed in.",
    tag: "Key chaos tamer",
    avatar: "https://via.placeholder.com/72"
  }
];

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
loadPartials().then(() => {
  initBehaviors();
  // Initialize reviews carousel after partials load
  setTimeout(() => initReviewsCarousel(), 100);
});

function initBehaviors(){
  fetch('data/prices.json')
    .then(r => r.json())
    .then(p => {
      if (p.round) document.querySelector('#price-round').textContent = p.round;
      if (p.card)  document.querySelector('#price-card').textContent = p.card;
    }).catch(()=>{});

  // Parse hash parameters safely
  try {
    const hash = location.hash.replace('#','');
    if (hash) {
      const params = new URLSearchParams(hash.split('&').map(x => {
        const parts = x.split('=');
        return parts.length === 2 ? [parts[0], parts[1]] : [parts[0], ''];
      }));
      if(params.get('pr')){
        const [roundP, cardP] = params.get('pr').split(',');
        if(roundP) document.querySelector('#price-round').textContent = roundP;
        if(cardP) document.querySelector('#price-card').textContent = cardP;
      }
    }
  } catch (e) {
    // Ignore hash parsing errors
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
  
  // Also watch for dynamically added videos (debounced)
  let handlerTimeout;
  const observer = new MutationObserver(() => {
    clearTimeout(handlerTimeout);
    handlerTimeout = setTimeout(() => {
      setupVideoHandlers();
    }, 100);
  });
  observer.observe(document.body, { childList: true, subtree: true });
  
  function setupVideoHandlers() {
    // Only attach handlers to precision video (seamless, no controls)
    // How-it-works video has native controls, so we skip it
    document.querySelectorAll('.phone-shot').forEach(container => {
      const video = container.querySelector('video.precision-video');
      if (!video || container.dataset.handlerAttached === 'true') return;
      
      container.dataset.handlerAttached = 'true';
      
      // Ensure video has volume set initially
      if (video.volume === 0 || video.volume < 1) {
        video.volume = 1.0;
      }
      
      // Ensure video autoplays (even if browser blocked it)
      if (video.paused) {
        video.play().catch(err => {
          console.log('Autoplay blocked, will play on user interaction:', err);
        });
      }
      
      // Re-enable autoplay if video ends (for loop)
      video.addEventListener('ended', () => {
        video.currentTime = 0;
        video.play();
      });
      
      const clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleVideoClick(video);
      };
      
      container.addEventListener('click', clickHandler);
      video.addEventListener('click', clickHandler);
      
      console.log('Video handler attached to precision video');
    });
    
    // Setup handlers for hero video
    document.querySelectorAll('.hero-video-section').forEach(section => {
      const video = section.querySelector('video.hero-video');
      if (!video || section.dataset.handlerAttached === 'true') return;
      
      section.dataset.handlerAttached = 'true';
      
      // Ensure video has volume set initially
      if (video.volume === 0 || video.volume < 1) {
        video.volume = 1.0;
      }
      
      // Ensure video autoplays
      if (video.paused) {
        video.play().catch(err => {
          console.log('Hero video autoplay blocked:', err);
        });
      }
      
      // Re-enable autoplay if video ends (for loop)
      video.addEventListener('ended', () => {
        video.currentTime = 0;
        video.play();
      });
      
      const clickHandler = (e) => {
        // Don't intercept clicks on buttons/links in overlay
        if (e.target.closest('a, .btn')) return;
        e.preventDefault();
        e.stopPropagation();
        handleVideoClick(video);
      };
      
      section.addEventListener('click', clickHandler);
      video.addEventListener('click', clickHandler);
      
      console.log('Video handler attached to hero video');
    });
    
    // Setup handlers for fullwidth video at bottom
    document.querySelectorAll('.video-fullwidth-section').forEach(section => {
      const video = section.querySelector('video.fullwidth-video');
      if (!video || section.dataset.handlerAttached === 'true') return;
      
      section.dataset.handlerAttached = 'true';
      
      // Ensure video has volume set initially
      if (video.volume === 0 || video.volume < 1) {
        video.volume = 1.0;
      }
      
      // Ensure video autoplays
      if (video.paused) {
        video.play().catch(err => {
          console.log('Fullwidth video autoplay blocked:', err);
        });
      }
      
      // Re-enable autoplay if video ends (for loop)
      video.addEventListener('ended', () => {
        video.currentTime = 0;
        video.play();
      });
      
      const clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleVideoClick(video);
      };
      
      section.addEventListener('click', clickHandler);
      video.addEventListener('click', clickHandler);
      
      console.log('Video handler attached to fullwidth video');
    });
    
    // Setup handlers for ping video
    document.querySelectorAll('.pf-shot').forEach(container => {
      const video = container.querySelector('video.ping-video');
      if (!video || container.dataset.handlerAttached === 'true') return;
      
      container.dataset.handlerAttached = 'true';
      
      // Ensure video has volume set initially
      if (video.volume === 0 || video.volume < 1) {
        video.volume = 1.0;
      }
      
      // Ensure video autoplays
      if (video.paused) {
        video.play().catch(err => {
          console.log('Ping video autoplay blocked:', err);
        });
      }
      
      // Re-enable autoplay if video ends (for loop)
      video.addEventListener('ended', () => {
        video.currentTime = 0;
        video.play();
      });
      
      const clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleVideoClick(video);
      };
      
      container.addEventListener('click', clickHandler);
      video.addEventListener('click', clickHandler);
      
      console.log('Video handler attached to ping video');
    });
  }
  
  function handleVideoClick(video) {
    if (!video) {
      console.log('No video found');
      return;
    }
    
    console.log('Video clicked, enabling sound');
    
    // Unmute and enable sound
    if (video.muted) {
      video.muted = false;
      video.volume = 1.0; // Ensure volume is at max
      
      // Play with sound enabled
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('Video playing with sound enabled');
        }).catch(err => {
          console.log('Play error:', err);
        });
      }
    }
  }
  
  // Also allow double-click to just unmute without fullscreen
  document.addEventListener('dblclick', e => {
    const video = e.target.closest('video.precision-video');
    if (video && video.muted) {
      e.preventDefault();
      e.stopPropagation();
      video.muted = false;
      video.volume = 1.0;
      video.play().catch(err => console.log('Play error:', err));
    }
  });
  
  // Listen for volume changes to verify sound is working
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      const videos = document.querySelectorAll('video.precision-video');
      videos.forEach(video => {
        video.addEventListener('volumechange', () => {
          console.log('Volume changed:', video.volume, 'Muted:', video.muted);
        });
      });
    }, 1000);
  });

}

function initReviewsCarousel() {
  const container = document.getElementById('reviews-container');
  if (!container || !reviews || reviews.length === 0) return;

  let currentIndex = 0;

  // Render reviews
  function renderReviews() {
    container.innerHTML = reviews.map((review, index) => `
      <div class="review-card ${index === 0 ? 'active' : ''}" data-index="${index}">
        <div class="review-header">
          <img src="${review.avatar}" alt="${review.name}" class="review-avatar" />
          <div class="review-info">
            <h3 class="review-name">${review.name}</h3>
            <p class="review-location">${review.location}</p>
          </div>
        </div>
        <div class="review-rating">
          ${Array.from({length: 5}, (_, i) => 
            `<span>${i < review.rating ? '★' : '☆'}</span>`
          ).join('')}
        </div>
        <p class="review-text">${review.text}</p>
        <span class="review-tag">${review.tag}</span>
      </div>
    `).join('');
  }

  // Render dots
  function renderDots() {
    const dotsContainer = document.getElementById('carousel-dots');
    if (!dotsContainer) return;
    
    dotsContainer.innerHTML = reviews.map((_, index) => `
      <button class="carousel-dot ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="Go to review ${index + 1}"></button>
    `).join('');

    dotsContainer.querySelectorAll('.carousel-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const index = parseInt(dot.dataset.index);
        goToReview(index);
      });
    });
  }

  // Go to specific review
  function goToReview(index) {
    if (index < 0 || index >= reviews.length) return;
    
    currentIndex = index;
    
    // Update cards
    container.querySelectorAll('.review-card').forEach((card, i) => {
      card.classList.toggle('active', i === index);
    });
    
    // Update dots
    document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    
    // Update buttons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === reviews.length - 1;
  }

  // Navigation handlers
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        goToReview(currentIndex - 1);
      }
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentIndex < reviews.length - 1) {
        goToReview(currentIndex + 1);
      }
    });
  }

  // Initialize
  renderReviews();
  renderDots();
  goToReview(0);
}

