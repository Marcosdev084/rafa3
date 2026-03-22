gsap.registerPlugin(ScrollTrigger);

/* CURSOR */
const cur     = document.getElementById('cur');
const curRing = document.getElementById('cur-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  gsap.to(cur, { x: mx, y: my, duration: .08, ease: 'none' });
});
(function tickRing() {
  rx += (mx - rx) * .13;
  ry += (my - ry) * .13;
  curRing.style.left = rx + 'px';
  curRing.style.top  = ry + 'px';
  requestAnimationFrame(tickRing);
})();
document.querySelectorAll('a, button, .aula-card, .val, .dep-card, .dep-btn').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cur-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cur-hover'));
});

/* NAV — sólido ao scrollar */
ScrollTrigger.create({
  start: 60,
  onEnter:     () => document.getElementById('nav').classList.add('solid'),
  onLeaveBack: () => document.getElementById('nav').classList.remove('solid'),
});

/* MENU MOBILE */
document.getElementById('burger').addEventListener('click', () => {
  document.getElementById('mob-menu').classList.add('open');
});
document.getElementById('mob-close').addEventListener('click', closeMob);
function closeMob() {
  document.getElementById('mob-menu').classList.remove('open');
}

/* SMOOTH SCROLL */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  });
});

/* FOTO HERO — sincroniza blob (desktop) e background mobile */
(function() {
  const imgBlob   = document.getElementById('heroImg');
  const imgMobile = document.getElementById('heroMobileBg');
  const ph        = document.getElementById('heroPlaceholder');
  if (!imgBlob) return;

  const src = imgBlob.getAttribute('src');
  if (!src || src === '') {
    imgBlob.style.display = 'none';
    return;
  }

  // Copia o mesmo src para a imagem de background mobile
  if (imgMobile) imgMobile.setAttribute('src', src);

  imgBlob.addEventListener('load',  () => { if (ph) ph.style.display = 'none'; });
  imgBlob.addEventListener('error', () => {
    imgBlob.style.display = 'none';
    if (imgMobile) imgMobile.style.display = 'none';
  });
})();

/* FOTO SOBRE */
(function() {
  const img = document.getElementById('sobreImg');
  const ph  = document.getElementById('sobrePlaceholder');
  if (!img) return;
  const src = img.getAttribute('src');
  if (!src || src === '') { img.style.display = 'none'; return; }
  img.addEventListener('load',  () => { if (ph) ph.style.display = 'none'; });
  img.addEventListener('error', () => { img.style.display = 'none'; });
})();

/* HERO ENTRANCE */
gsap.timeline({ defaults: { ease: 'power3.out' } })
  .from('.hero-right-blob',  { opacity: 0, scale: .85, duration: 1.1 }, .3)
  .from('.hrb-dot',          { opacity: 0, scale: 0, stagger: .15, duration: .5, ease: 'back.out(2)' }, 1.0)
  .from('.hero-eyebrow',     { opacity: 0, y: 14, duration: .7 }, .55)
  .from('.hero-title',       { opacity: 0, y: 36, duration: .9 }, .72)
  .from('.hero-sub',         { opacity: 0, y: 18, duration: .7 }, .95)
  .from('.hero-actions',     { opacity: 0, y: 18, duration: .7 }, 1.1)
  .from('.hero-stats-bar',   { opacity: 0, y: 22, duration: .7 }, 1.15)
  .from('.scroll-hint',      { opacity: 0, duration: .6 }, 1.4);

/* SCROLL REVEALS */
function reveal(sel, from) {
  gsap.utils.toArray(sel).forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, ...from },
      { opacity: 1, ...Object.fromEntries(Object.keys(from).map(k => [k, 0])),
        duration: .85, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      }
    );
  });
}
reveal('.sobre-left',  { x: -40 });
reveal('.sobre-right', { x:  40 });
reveal('.sec-header',  { y:  26 });
reveal('.metodo-left', { y:  26 });
reveal('.cta-left',    { y:  26 });
reveal('.cta-right',   { x:  40 });

ScrollTrigger.batch('.aula-card', {
  start: 'top 88%', once: true,
  onEnter: batch => gsap.fromTo(batch,
    { opacity: 0, y: 38 },
    { opacity: 1, y: 0, stagger: .13, duration: .75, ease: 'power3.out' }
  )
});
ScrollTrigger.batch('.mstep', {
  start: 'top 90%', once: true,
  onEnter: batch => gsap.fromTo(batch,
    { opacity: 0, x: 28 },
    { opacity: 1, x: 0, stagger: .14, duration: .7, ease: 'power2.out' }
  )
});
ScrollTrigger.batch('.val', {
  start: 'top 88%', once: true,
  onEnter: batch => gsap.fromTo(batch,
    { opacity: 0, scale: .9 },
    { opacity: 1, scale: 1, stagger: .1, duration: .55, ease: 'back.out(1.4)' }
  )
});

/* DEPOIMENTOS SLIDER */
(function() {
  const track    = document.getElementById('depTrack');
  const dotsWrap = document.getElementById('depDots');
  const prevBtn  = document.getElementById('depPrev');
  const nextBtn  = document.getElementById('depNext');
  if (!track) return;

  const cards = Array.from(track.querySelectorAll('.dep-card'));
  let current  = 0;

  function perPage() {
    if (window.innerWidth <= 560) return 1;
    if (window.innerWidth <= 960) return 2;
    return 3;
  }
  function totalPages() { return Math.ceil(cards.length / perPage()); }

  function buildDots() {
    dotsWrap.innerHTML = '';
    for (let i = 0; i < totalPages(); i++) {
      const d = document.createElement('div');
      d.className = 'dep-dot' + (i === 0 ? ' on' : '');
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    }
  }

  function goTo(page) {
    const tp = totalPages();
    current  = ((page % tp) + tp) % tp;
    dotsWrap.querySelectorAll('.dep-dot').forEach((d,i) => d.classList.toggle('on', i === current));
    const pp    = perPage();
    const cardW = cards[0].offsetWidth;
    const gap   = 20;
    gsap.to(track, { x: -(current * pp * (cardW + gap)), duration: .5, ease: 'power2.inOut' });
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { buildDots(); goTo(0); }, 150);
  });

  buildDots();
  goTo(0);

  /* Tilt 3D no hover */
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - .5;
      const y = (e.clientY - r.top)  / r.height - .5;
      gsap.to(card, { rotateY: x*10, rotateX: -y*8, translateY: -6, scale: 1.025, boxShadow: '0 18px 38px rgba(0,150,199,.16)', duration: .22, ease: 'power1.out', transformPerspective: 700, overwrite: 'auto' });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateY: 0, rotateX: 0, translateY: 0, scale: 1, boxShadow: '0 2px 18px rgba(0,0,0,.07)', duration: .38, ease: 'power2.out', overwrite: 'auto' });
    });
  });
})();
