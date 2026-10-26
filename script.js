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
document.querySelectorAll('[data-tab]').forEach(a => a.addEventListener('click', () => showTab(a.dataset.tab)));
showTab('famous');

// Apparition douce
const targets = document.querySelectorAll('.truck, .atipik-cards figure, .c-card, .ev > *');
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
