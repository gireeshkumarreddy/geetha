/* Men's collection browser. The shared sections.js owns scroll progress.
   Images are six equal, transparent atlas cells: three columns by two rows.
   These are design concepts, not an inventory or a pricing database. */
(function () {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');
  const atlas = { gold: 'images/mens-gold-refined.png', silver: 'images/mens-silver-refined.png' };
  const products = {
    curb: { name: 'The Classic Link', category: 'chains', label: 'Curb chain', cell: 0, detail: 'Sculpted links. A confident, clean silhouette that sits just as naturally over a shirt as beneath its collar.', finish: 'Polished links', character: 'An everyday signature' },
    rope: { name: 'The Woven Rope', category: 'chains', label: 'Rope chain', cell: 1, detail: 'Fine strands, closely woven. A textured chain that catches the light with every movement.', finish: 'Twisted rope texture', character: 'Quietly distinctive' },
    pendant: { name: 'The North Star', category: 'pendants', label: 'Pendant', cell: 2, detail: 'An engraved compass motif, framed by clean edges. A personal detail with a sense of direction.', finish: 'Engraved sunburst', character: 'A meaningful accent' },
    signet: { name: 'The Signature', category: 'rings', label: 'Signet ring', cell: 3, detail: 'A sculpted oval face with fine engraved lines. Understated from a distance, considered in every detail.', finish: 'Engraved oval face', character: 'Personal by nature' },
    bracelet: { name: 'The Linked Cuff', category: 'bracelets', label: 'Link bracelet', cell: 4, detail: 'A bold rhythm of interlocking links and a clean clasp. A substantial presence, made effortless.', finish: 'Polished curb links', character: 'Modern and assured' },
    kada: { name: 'The Modern Kada', category: 'kadas', label: 'Open kada', cell: 5, detail: 'A single sculptural line, with softly squared ends and a brushed centre. Tradition expressed with simplicity.', finish: 'Brushed and polished', character: 'Rooted in tradition' }
  };
  const imageCache = new Map();
  function loadAtlas(metal) {
    if (!imageCache.has(metal)) {
      const img = new Image();
      img.src = atlas[metal];
      imageCache.set(metal, img.decode());
    }
    return imageCache.get(metal);
  }
  function setJewel(el, product, metal, decorative) {
    el.style.setProperty('--col', product.cell % 3);
    el.style.setProperty('--row', Math.floor(product.cell / 3));
    const img = el.querySelector('img');
    img.src = atlas[metal];
    img.alt = decorative ? '' : `${metal === 'gold' ? 'Gold' : 'Silver'} ${product.label.toLowerCase()} — ${product.name}`;
  }
  document.querySelectorAll('[data-mens]').forEach((section) => {
    const keys = section.dataset.products.split(',');
    const art = section.querySelector('.gjm__art');
    const details = section.querySelector('.gjm__details');
    const hero = section.querySelector('[data-m-hero]');
    const cards = Array.from(section.querySelectorAll('[data-m-product]'));
    const metalButtons = Array.from(section.querySelectorAll('[data-m-metal]'));
    const categoryButtons = Array.from(section.querySelectorAll('[data-m-category]'));
    const previous = section.querySelector('[data-m-prev]');
    const next = section.querySelector('[data-m-next]');
    let metal = 'gold', category = 'all', selected = keys[0];
    let visible = false, hovered = false, focused = false, sequence = 0;
    let timer = 0, transitionTimer = 0, pausedUntil = 0;
    const filtered = () => keys.filter((key) => category === 'all' || products[key].category === category);
    function stop() { window.clearTimeout(timer); timer = 0; }
    function schedule() {
      stop();
      if (!visible || hovered || focused || reduced.matches || document.hidden || filtered().length < 2) return;
      timer = window.setTimeout(() => { move(1, false); }, Math.max(6500, pausedUntil - Date.now()));
    }
    function pause() { pausedUntil = Date.now() + 16000; schedule(); }
    function render(announce) {
      const p = products[selected];
      const list = filtered();
      section.querySelector('.gjm__cards').dataset.count = String(list.length);
      section.dataset.metal = metal;
      section.dataset.selected = selected;
      metalButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mMetal === metal)));
      categoryButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mCategory === category)));
      setJewel(hero, p, metal, false);
      hero.parentElement.style.setProperty('--col', p.cell % 3);
      hero.parentElement.style.setProperty('--row', Math.floor(p.cell / 3));
      section.querySelectorAll('[data-m-satellite]').forEach((el, i) => {
        const others = keys.filter((key) => key !== selected);
        setJewel(el, products[others[i % others.length]], metal, true);
      });
      cards.forEach((card) => {
        const key = card.dataset.mProduct;
        const item = products[key];
        card.hidden = !list.includes(key);
        card.setAttribute('aria-pressed', String(key === selected));
        card.setAttribute('aria-label', `View ${item.name} in ${metal}`);
        setJewel(card.querySelector('.gjm__jewel'), item, metal, true);
        card.querySelector('.gjm__card-kind').textContent = `${metal === 'gold' ? 'Gold' : 'Silver'} · ${item.label}`;
      });
      section.querySelector('[data-m-name]').textContent = p.name;
      section.querySelector('[data-m-description]').textContent = p.detail;
      section.querySelector('[data-m-finish]').textContent = p.finish;
      section.querySelector('[data-m-character]').textContent = p.character;
      section.querySelector('[data-m-caption]').textContent = `${metal} ${p.label} · the men's edit`;
      section.querySelector('[data-m-count]').textContent = `${String(list.indexOf(selected) + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}`;
      previous.disabled = next.disabled = list.length < 2;
      const enquiry = `Hello Geetha Jewellers, I would like to enquire about your men's ${metal} ${p.label.toLowerCase()}, inspired by "${p.name}" on your website. Could you share the available designs and details?`;
      section.querySelector('[data-m-enquire]').href = `https://wa.me/918190377014?text=${encodeURIComponent(enquiry)}`;
      if (announce) section.querySelector('[data-m-status]').textContent = `${metal === 'gold' ? 'Gold' : 'Silver'} ${p.label}: ${p.name}. ${list.length} ${list.length === 1 ? 'design' : 'designs'} shown.`;
    }
    async function change(announce = true) {
      const token = ++sequence;
      window.clearTimeout(transitionTimer);
      try { await loadAtlas(metal); }
      catch (_) {
        if (token !== sequence) return;
        section.querySelector('[data-m-status]').textContent = 'The image could not load. Please try this selection again.';
        imageCache.delete(metal);
        art.classList.remove('is-changing'); details.classList.remove('is-changing');
        return;
      }
      if (token !== sequence) return;
      art.classList.add('is-changing'); details.classList.add('is-changing');
      transitionTimer = window.setTimeout(() => {
        if (token !== sequence) return;
        render(announce);
        art.classList.remove('is-changing'); details.classList.remove('is-changing');
        schedule();
      }, reduced.matches ? 0 : 180);
    }
    function move(direction, user = true) {
      const list = filtered();
      selected = list[(list.indexOf(selected) + direction + list.length) % list.length];
      if (user) pause();
      change(user);
    }
    metalButtons.forEach((button) => button.addEventListener('click', () => {
      metal = button.dataset.mMetal;
      pause(); change();
    }));
    categoryButtons.forEach((button) => button.addEventListener('click', () => {
      category = button.dataset.mCategory;
      if (!filtered().includes(selected)) selected = filtered()[0];
      pause(); change();
    }));
    cards.forEach((card) => {
      card.addEventListener('click', () => { selected = card.dataset.mProduct; pause(); change(); });
      card.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const list = cards.filter((el) => !el.hidden);
        let index = list.indexOf(card);
        if (event.key === 'Home') index = 0;
        else if (event.key === 'End') index = list.length - 1;
        else index = (index + (event.key === 'ArrowRight' ? 1 : -1) + list.length) % list.length;
        list[index].focus(); list[index].click();
      });
    });
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    section.addEventListener('pointerenter', (event) => { if (event.pointerType !== 'touch') { hovered = true; stop(); } });
    section.addEventListener('pointerleave', () => {
      hovered = false;
      art.style.removeProperty('--mx'); art.style.removeProperty('--my'); art.style.removeProperty('--mr');
      schedule();
    });
    section.addEventListener('pointerdown', pause, { passive: true });
    section.addEventListener('focusin', () => { focused = true; stop(); });
    section.addEventListener('focusout', (event) => { focused = section.contains(event.relatedTarget); schedule(); });
    section.addEventListener('pointermove', (event) => {
      if (!visible || reduced.matches || !finePointer.matches || event.pointerType === 'touch') return;
      const rect = section.querySelector('.gjm__stage').getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      art.style.setProperty('--mx', `${(x * 9).toFixed(2)}px`);
      art.style.setProperty('--my', `${(y * 6).toFixed(2)}px`);
      art.style.setProperty('--mr', `${(x * 4).toFixed(2)}deg`);
    }, { passive: true });
    // Observe the visible stage, rather than the very tall scroll track.
    const observer = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      section.classList.toggle('is-visible', visible);
      if (visible) loadAtlas(metal).catch(() => {});
      schedule();
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
    observer.observe(section.querySelector('.gjm__stage'));
    document.addEventListener('visibilitychange', schedule);
    reduced.addEventListener('change', () => {
      if (reduced.matches) {
        art.style.removeProperty('--mx'); art.style.removeProperty('--my'); art.style.removeProperty('--mr');
      }
      schedule();
    });
    render(false);
  });
}());
