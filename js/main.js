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
}

