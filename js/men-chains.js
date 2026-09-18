/* ==========================================================================
   Geetha Jewellers — men's chains stage
   --------------------------------------------------------------------------
   Same pinned-track mechanism as js/stage.js (the homepage hero): a tall
   track pins a 100vh stage and scroll progress becomes a continuous slot
   value t (0 … 4). Unlike the hero's straight left/right fan, the five
   chains sit on an evenly-spaced circle (a turntable, seen slightly from
   above): as t advances every chain's angle turns in step, so the whole
   ring rotates and the next chain swings smoothly round to the front —
   settling centre-stage with its mirror reflection and a golden light-sweep
   flash — while the others arc around behind it.
   ========================================================================== */
(function () {
  'use strict';

  // jewel: the chain draped on the bust inside the display case (where the light-sweep flash plays)
  const chains = [
    { name: 'Engraved Bar Chain',   image: 'images/men-chains/chain1.png', jewel: [0.29, 0.20, 0.39, 0.40] },
    { name: 'Textured Link Chain',  image: 'images/men-chains/chain2.png', jewel: [0.29, 0.20, 0.39, 0.40] },
    { name: 'Classic Curb Chain',   image: 'images/men-chains/chain3.png', jewel: [0.29, 0.20, 0.39, 0.40] },
    { name: 'Cuban Link Chain',     image: 'images/men-chains/chain4.png', jewel: [0.29, 0.20, 0.39, 0.40] },
    { name: 'Figaro Chain',         image: 'images/men-chains/chain5.png', jewel: [0.29, 0.20, 0.39, 0.40] },
  ];

  const SETTINGS = {
    holdStart: 0.06,
    holdEnd: 0.14,
    settle: 0.55,
    smoothing: 11,
    sweepDelay: 150,
    parallax: { env: 0.004, sheen: 0.07 },
  };

  /* the ring: radiusX is how wide the circle spreads (× stage width), tilt lifts the
     far side of the ring up a touch (× stage height) so it reads as a turntable rather
     than a flat carousel; scale/opacity/bright interpolate smoothstep-eased between the
     back of the ring (depth 0) and the front (depth 1) */
  const CIRCLE = {
    desktop: { radiusX: 0.33, tilt: 0.07, scaleFront: 1, scaleBack: 0.4, opacityBack: 0.2, brightBack: 0.86 },
    compact: { radiusX: 0.42, tilt: 0.06, scaleFront: 0.92, scaleBack: 0.32, opacityBack: 0.14, brightBack: 0.85 },
  };

  /* ---------------------------------------------------------------- setup */
  const section = document.querySelector('[data-stage-mc]');
  if (!section) return;

  const $ = (sel) => section.querySelector(sel);
  const track = $('.gjmc-track');
  const stage = $('.gjmc-stage');
  const env = $('.gjmc-env');
  const bloom = $('.gjmc-light--bloom');
  const sheen = $('.gjmc-light--sheen');
  const floorGlow = $('.gjmc-light--floor');
  const mount = $('.gjmc-displays');
  const counter = $('[data-current]');
  const total = $('[data-total]');
  const progress = $('.gjmc-progress');
  const announce = $('[data-announce]');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const N = chains.length;
  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
  const smoothstep = (f) => f * f * (3 - 2 * f);
  const pad2 = (n) => String(n).padStart(2, '0');

  total.textContent = pad2(N);

  /* display units --------------------------------------------------------- */
  const displays = chains.map((item, i) => {
    const el = document.createElement('div');
    el.className = 'gjmc-display';
    el.style.setProperty('--size', item.size || 1);

    const unit = document.createElement('div');
    unit.className = 'gjmc-display__unit';

    const shadow = document.createElement('span');
    shadow.className = 'gjmc-display__shadow';

    const img = new Image();
    img.className = 'gjmc-display__image';
    img.src = item.image;
    img.alt = `${item.name} display`;
    img.decoding = 'async';
    img.draggable = false;

    const reflection = new Image();
    reflection.className = 'gjmc-display__reflection';
    reflection.src = item.image;
    reflection.alt = '';
    reflection.setAttribute('aria-hidden', 'true');
    reflection.draggable = false;

    const sweep = document.createElement('div');
    sweep.className = 'gjmc-display__sweep';
    sweep.setAttribute('aria-hidden', 'true');
    const [jx, jy, jw, jh] = item.jewel || [0, 0, 1, 1];
    sweep.style.setProperty('--jx', jx);
    sweep.style.setProperty('--jy', jy);
    sweep.style.setProperty('--jw', jw);
    sweep.style.setProperty('--jh', jh);
    // absolute URL: a relative url() inside a custom property resolves against the stylesheet, not the page
    sweep.style.setProperty('--mask', `url("${new URL(item.image, document.baseURI).href}")`);
    sweep.appendChild(document.createElement('i'));
    sweep.addEventListener('animationend', () => sweep.classList.remove('is-on'));

    // glints: the same pass masked by the display's own luminance (bright gold)
    const glints = sweep.cloneNode(true);
    glints.className = 'gjmc-display__sweep gjmc-display__sweep--glints';
    glints.addEventListener('animationend', () => glints.classList.remove('is-on'));

    unit.append(shadow, img, reflection, sweep, glints);
    el.appendChild(unit);
    mount.appendChild(el);

    const d = { el, unit, img, sweep, glints, z: -1, hidden: false, filter: '', loaded: img.complete && img.naturalWidth > 0 };
    if (!d.loaded) img.addEventListener('load', () => { d.loaded = true; maybeSweep(); }, { once: true });
    return d;
  });

  /* passive progress indicator  ━ ○ ○ ○ ○ ------------------------------------ */
  const dots = chains.map(() => {
    const dot = document.createElement('i');
    progress.appendChild(dot);
    return dot;
  });

  /* --------------------------------------------------------------- geometry */
  let trackTop = 0;
  let travel = 1;
  let W = 1;
  let H = 1;
  let compact = false;

  function measure() {
    const rect = track.getBoundingClientRect();
    trackTop = rect.top + window.scrollY;
    travel = Math.max(1, track.offsetHeight - stage.offsetHeight * 2);
    W = stage.clientWidth;
    H = stage.clientHeight;
    compact = W < 768 || (W < 1024 && H > W);
  }

  /* ---------------------------------------------------------------- scroll */
  let target = 0;
  let current = 0;
  let activeIndex = -1;
  let rafId = 0;
  let lastTime = 0;
  let pinned = false;
  let listening = false;

  function eased(t) {
    const i = Math.floor(t);
    const f = t - i;
    return i + f + (smoothstep(f) - f) * SETTINGS.settle;
  }

  function readScroll() {
    const y = window.scrollY;
    const p = clamp((y - trackTop) / travel, 0, 1);
    pinned = y >= trackTop - 1 && y <= trackTop + travel + 1;
    const u = clamp((p - SETTINGS.holdStart) / (1 - SETTINGS.holdStart - SETTINGS.holdEnd), 0, 1);
    target = eased(u * (N - 1));
  }

  function tick(now) {
    rafId = 0;
    const dt = clamp((now - lastTime) / 1000, 0, 0.064);
    lastTime = now;
    if (reduceMotion.matches) {
      current = target;
    } else {
      current += (target - current) * (1 - Math.exp(-dt * SETTINGS.smoothing));
      if (Math.abs(target - current) < 0.0006) current = target;
    }
    render(current);
    if (current !== target) rafId = requestAnimationFrame(tick);
  }

  function kick() {
    if (rafId) return;
    lastTime = performance.now();
    rafId = requestAnimationFrame(tick);
  }

  function onScroll() { readScroll(); kick(); }
  function attach() { if (!listening) { listening = true; window.addEventListener('scroll', onScroll, { passive: true }); } }
  function detach() { if (listening) { listening = false; window.removeEventListener('scroll', onScroll); } }

  /* ------------------------------------------------------------ light sweep */
  let sweptIndex = -1;
  let sweepTimer = 0;
  let litTimer = 0;

  function cancelSweepTimer() {
    if (sweepTimer) { clearTimeout(sweepTimer); sweepTimer = 0; }
  }

  function runSweep(i) {
    const d = displays[i];
    d.sweep.classList.remove('is-on');
    d.glints.classList.remove('is-on');
    void d.sweep.offsetWidth;
    d.sweep.classList.add('is-on');
    d.glints.classList.add('is-on');
    displays.forEach((o) => o.img.classList.remove('is-lit'));
    d.img.classList.add('is-lit');
    if (litTimer) clearTimeout(litTimer);
    litTimer = setTimeout(() => { litTimer = 0; d.img.classList.remove('is-lit'); }, 950);
  }

  function maybeSweep() {
    if (reduceMotion.matches) return;
    const idx = clamp(Math.round(current), 0, N - 1);
    const dist = Math.abs(current - idx);
    if (dist > 0.4) { sweptIndex = -1; cancelSweepTimer(); return; }
    if (dist > 0.3) { cancelSweepTimer(); return; }
    if (dist > 0.06 || sweptIndex === idx || sweepTimer || !displays[idx].loaded) return;
    sweepTimer = setTimeout(() => {
      sweepTimer = 0;
      if (Math.abs(current - idx) < 0.3 && sweptIndex !== idx) {
        sweptIndex = idx;
        runSweep(idx);
      }
    }, SETTINGS.sweepDelay);
  }

  /* ---------------------------------------------------------------- render */
  const TWO_PI = Math.PI * 2;

  function render(t) {
    const c = compact ? CIRCLE.compact : CIRCLE.desktop;
    const reduced = reduceMotion.matches;
    const step = TWO_PI / N;

    for (let i = 0; i < N; i++) {
      const d = displays[i];
      let transform;
      let opacity;
      let filter = '';
      let depth;

      if (reduced) {
        const off = Math.abs(i - t);
        const circDist = Math.min(off, N - off);
        depth = clamp(1 - circDist, 0, 1);
        opacity = clamp(1 - circDist * 1.6, 0, 1);
        transform = 'translate3d(0,0,0)';
      } else {
        const theta = (i - t) * step;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);
        depth = (cosT + 1) / 2;                          // 0 = far side of the ring, 1 = front-most
        const eased = depth * depth * (3 - 2 * depth);    // smoothstep
        const x = sinT * c.radiusX * W;
        const y = -(1 - eased) * c.tilt * H;
        const s = c.scaleBack + (c.scaleFront - c.scaleBack) * eased;
        opacity = c.opacityBack + (1 - c.opacityBack) * eased;
        transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) scale(${s.toFixed(4)})`;
        filter = `brightness(${(c.brightBack + (1 - c.brightBack) * eased).toFixed(3)})`;
      }

      d.unit.style.transform = transform;
      d.unit.style.opacity = opacity.toFixed(3);
      if (filter !== d.filter) { d.unit.style.filter = filter; d.filter = filter; }

      const z = Math.round(depth * 100);
      if (z !== d.z) { d.el.style.zIndex = z; d.z = z; }

      const hidden = opacity <= 0.01;
      if (hidden !== d.hidden) { d.el.classList.toggle('is-hidden', hidden); d.hidden = hidden; }
    }

    const idx = clamp(Math.round(t), 0, N - 1);
    const dist = Math.abs(t - idx);
    if (idx !== activeIndex) {
      activeIndex = idx;
      counter.textContent = pad2(idx + 1);
      announce.textContent = chains[idx].name;
    }

    for (let i = 0; i < N; i++) {
      dots[i].style.setProperty('--on', clamp(1 - Math.abs(i - t), 0, 1).toFixed(3));
    }

    const presented = 1 - clamp((dist - 0.08) / 0.3, 0, 1);
    bloom.style.opacity = (0.62 + 0.38 * presented).toFixed(3);
    floorGlow.style.opacity = (0.3 + 0.7 * presented).toFixed(3);
    if (!reduced) {
      env.style.transform = `translate3d(${(-t * W * SETTINGS.parallax.env).toFixed(2)}px,0,0) scale(1.05)`;
      sheen.style.transform = `translate3d(${(-t * W * SETTINGS.parallax.sheen).toFixed(2)}px,0,0)`;
    }

    maybeSweep();
  }

  /* ---------------------------------------------- keyboard (secondary only) */
  function goTo(index) {
    const i = clamp(index, 0, N - 1);
    const p = SETTINGS.holdStart + (i / (N - 1)) * (1 - SETTINGS.holdStart - SETTINGS.holdEnd);
    window.scrollTo({ top: Math.round(trackTop + p * travel), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }

  window.addEventListener('keydown', (e) => {
    if (!pinned || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(Math.round(target) + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(Math.round(target) - 1); }
  });

  /* --------------------------------------------------------------- lifecycle */
  let measureRaf = 0;
  function scheduleMeasure() {
    if (measureRaf) return;
    measureRaf = requestAnimationFrame(() => { measureRaf = 0; measure(); readScroll(); kick(); });
  }

  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { attach(); measure(); readScroll(); kick(); } else { detach(); }
  }, { rootMargin: '30% 0px' });

  measure();
  readScroll();
  current = target;
  render(current);
  io.observe(track);

  window.addEventListener('resize', scheduleMeasure);
  window.addEventListener('orientationchange', scheduleMeasure);
  window.addEventListener('load', scheduleMeasure);
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(scheduleMeasure);
    ro.observe(document.documentElement);
    ro.observe(track);
  }
  reduceMotion.addEventListener?.('change', () => { current = target; render(current); });

  window.GJMenChains = { goTo, get index() { return activeIndex; } };
})();
