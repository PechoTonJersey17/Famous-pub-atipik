// Menu mobile
const btn = document.querySelector('.burger-btn');
const nav = document.getElementById('menu');
const setNav = open => { nav.classList.toggle('open', open); btn.setAttribute('aria-expanded', open); };
btn.addEventListener('click', () => setNav(!nav.classList.contains('open')));
nav.addEventListener('click', e => { if (e.target.closest('a')) setNav(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') setNav(false); });

// Onglets de la carte (Famous Bus / Atipik)
const tabs = [...document.querySelectorAll('[role=tab]')];
function showTab(id, focus) {
  document.getElementById('carte').dataset.theme = id;
  tabs.forEach(t => {
    const on = t.id === 'tab-' + id;
    t.setAttribute('aria-selected', on);
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    if (on && focus) t.focus();
  });
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => showTab(t.id.slice(4)));
  t.addEventListener('keydown', e => {
    const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (d) showTab(tabs[(i + d + tabs.length) % tabs.length].id.slice(4), true);
  });
});
document.querySelectorAll('[data-tab]').forEach(a => a.addEventListener('click', () => { showTab(a.dataset.tab); setNav(false); }));
showTab('famous');

// Apparition douce
const targets = document.querySelectorAll('.truck, .atipik-cards figure, .c-card, .ev > *, .masonry li');
if ('IntersectionObserver' in window) {
  targets.forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.1 });
  targets.forEach(el => io.observe(el));
}

// Fonctionne aussi hors connexion
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// Galerie : agrandir les photos (clavier, flèches et balayage)
const lb = document.getElementById('lightbox');
const shots = [...document.querySelectorAll('.masonry button')];
let cur = 0;
function openShot(i) {
  cur = (i + shots.length) % shots.length;
  const b = shots[cur];
  document.getElementById('lb-img').src = b.dataset.full;
  document.getElementById('lb-img').alt = b.dataset.cap;
  document.getElementById('lb-cap').textContent = b.dataset.cap;
  if (!lb.open) lb.showModal();
}
shots.forEach((b, i) => b.addEventListener('click', () => openShot(i)));
lb.querySelector('.lb-close').addEventListener('click', () => lb.close());
lb.querySelector('.lb-prev').addEventListener('click', () => openShot(cur - 1));
lb.querySelector('.lb-next').addEventListener('click', () => openShot(cur + 1));
lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
lb.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') openShot(cur - 1);
  if (e.key === 'ArrowRight') openShot(cur + 1);
});
let x0;
lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - x0;
  if (Math.abs(dx) > 50) openShot(cur + (dx < 0 ? 1 : -1));
});

// Incontournables : toucher une photo révèle le plat (une seule ouverte à la fois)
const stars = [...document.querySelectorAll('.star')];
stars.forEach(st => st.querySelector('.star-btn').addEventListener('click', () => {
  const open = !st.classList.contains('open');
  stars.forEach(o => { o.classList.remove('open'); o.querySelector('.star-btn').setAttribute('aria-expanded', 'false'); });
  if (open) { st.classList.add('open'); st.querySelector('.star-btn').setAttribute('aria-expanded', 'true'); }
}));
document.addEventListener('keydown', e => { if (e.key === 'Escape') stars.forEach(o => o.classList.remove('open')); });

// Effet de profondeur : l'image du bandeau bouge moins vite que la page
const px = document.querySelectorAll('[data-parallax]');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (px.length && !still) {
  let tick = false;
  const run = () => {
    px.forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      el.style.transform = `translate3d(0, ${(r.top + r.height / 2 - innerHeight / 2) * -0.12}px, 0)`;
    });
    tick = false;
  };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(run); } }, { passive: true });
  run();
}

// Galerie : apparition en cascade
document.querySelectorAll('.masonry li').forEach((li, i) => li.style.setProperty('--d', i % 4));

// Cartes du menu : toucher une carte révèle sa description et son prix (une seule ouverte à la fois par menu)
document.querySelectorAll('.panel').forEach(panel => {
  const items = [...panel.querySelectorAll('.dish, .drink')];
  items.forEach(it => it.querySelector('.dish-btn, .drink-btn').addEventListener('click', () => {
    const open = !it.classList.contains('open');
    items.forEach(o => { o.classList.remove('open'); o.querySelector('.dish-btn, .drink-btn').setAttribute('aria-expanded', 'false'); });
    if (open) { it.classList.add('open'); it.querySelector('.dish-btn, .drink-btn').setAttribute('aria-expanded', 'true'); }
  }));
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('.dish.open, .drink.open').forEach(o => o.classList.remove('open')); });
