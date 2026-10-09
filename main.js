/* abd design — portfolio scripts · v2 */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isTouch = !canHover;
  document.documentElement.classList.add('js');

  /* ---------- Smooth scroll (Lenis, desktop only) ---------- */
  let lenis = null;
  if (window.Lenis && canHover && !reduceMotion) {
    try {
      lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true });
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    } catch (e) { lenis = null; }
  }
  if (!lenis) document.documentElement.style.scrollBehavior = reduceMotion ? 'auto' : 'smooth';
  const scrollToEl = window.__scrollToEl = (el) => {
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -84, duration: 1.4 });
    else { const y = el.getBoundingClientRect().top + window.scrollY - 84; window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' }); }
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const h = a.getAttribute('href');
    if (h.length < 2 || h.startsWith('#/')) return;
    const t = document.getElementById(h.slice(1));
    if (!t) return;
    e.preventDefault();
    document.body.classList.remove('menu-open');
    if (lenis) lenis.start();
    if (t.offsetParent === null && t.closest('.page')) { location.hash = h; return; }
    scrollToEl(t);
    history.replaceState(null, '', h);
  });

  /* ---------- Header / menu ---------- */
  const header = $('.header');
  const burger = $('.burger');
  const updateHeader = () => { if (header) header.classList.toggle('solid', window.scrollY > 40); };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
  if (burger) {
    burger.addEventListener('click', () => {
      const open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open);
      if (lenis) open ? lenis.stop() : lenis.start();
    });
    $$('.mmenu a').forEach(a => a.addEventListener('click', () => { document.body.classList.remove('menu-open'); if (lenis) lenis.start(); }));
  }
  const fab = $('.fab');
  if (fab) {
    const uf = () => fab.classList.toggle('show', window.scrollY > 320);
    uf(); window.addEventListener('scroll', uf, { passive: true });
  }

  /* ---------- Word-rise headline ---------- */
  const splitWords = (el) => {
    let i = 0;
    const wrap = (txt) => {
      const frag = document.createDocumentFragment();
      txt.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
        const w = document.createElement('span'); w.className = 'w';
        const inner = document.createElement('i'); inner.textContent = part; inner.style.setProperty('--d', (i++ * 0.07) + 's');
        w.appendChild(inner); frag.appendChild(w);
      });
      return frag;
    };
    const walk = (node) => {
      Array.from(node.childNodes).forEach(n => {
        if (n.nodeType === 3) node.replaceChild(wrap(n.nodeValue), n);
        else if (n.nodeType === 1) {
          if (n.classList.contains('typed') || n.classList.contains('tw')) {
            const w = document.createElement('span'); w.className = 'w';
            const inner = document.createElement('i'); inner.style.setProperty('--d', (i++ * 0.07) + 's');
            node.replaceChild(w, n); inner.appendChild(n); w.appendChild(inner);
          } else walk(n);
        }
      });
    };
    walk(el);
  };
  $$('.wr').forEach(el => { splitWords(el); setTimeout(() => el.classList.add('in'), 120); });

  /* ---------- Typing word ---------- */
  const typed = $('.typed');
  if (typed) {
    const words = (typed.dataset.words || 'сайты,приложения,лендинги').split(',');
    // reserve the width of the longest word so the headline never reflows
    const meas = document.createElement('span'); meas.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;pointer-events:none';
    typed.parentNode.appendChild(meas);
    const twEl = typed.closest('.tw') || typed;
    const measure = () => { let w = 0; words.forEach(x => { meas.textContent = x + ','; w = Math.max(w, meas.getBoundingClientRect().width); }); twEl.style.setProperty('--tw', Math.ceil(w) + 'px'); };
    const cursor = () => { meas.textContent = typed.textContent; typed.style.setProperty('--cw', meas.getBoundingClientRect().width + 'px'); };
    measure(); window.addEventListener('resize', () => { measure(); cursor(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); cursor(); });
    if (reduceMotion) typed.textContent = words[0];
    else {
      let wi = 0, ci = words[0].length, del = false;
      typed.textContent = words[0]; cursor();
      const tick = () => {
        const w = words[wi];
        if (!del) {
          ci++; typed.textContent = w.slice(0, ci); cursor();
          if (ci >= w.length) { del = true; setTimeout(tick, 2200); return; }
          setTimeout(tick, 70 + Math.random() * 50);
        } else {
          ci--; typed.textContent = w.slice(0, ci); cursor();
          if (ci === 0) { del = false; wi = (wi + 1) % words.length; setTimeout(tick, 340); return; }
          setTimeout(tick, 36);
        }
      };
      setTimeout(() => { del = true; tick(); }, 3200);
    }
  }

  /* ---------- Reveal on scroll ---------- */
  // Containers reveal item by item with a small stagger instead of as one block
  const STAGGER = ['.shots', '.sol', '.hyp', '.grid-3', '.services', '.steps', '.exp', '.palette', '.brand-chips', '.case-cover.cover-phones', '.trust', '.hero-stats', '.faq', '.sites-small'];
  $$(STAGGER.join(',')).forEach(box => {
    const kids = Array.from(box.children).filter(k => k.nodeType === 1);
    if (!kids.length) return;
    box.classList.remove('rv');
    kids.forEach((k, i) => { if (!k.classList.contains('rv') && !k.classList.contains('mrev')) { k.classList.add('rv'); k.style.setProperty('--d', Math.min(i, 7) * 0.09 + 's'); } });
  });
  $$('.masonry .g').forEach((g, i) => { g.classList.add('rv'); g.style.setProperty('--d', (i % 3) * 0.08 + 's'); });
  const mas = $('.masonry'); if (mas) mas.classList.remove('rv');
  const rv = $$('.rv, .mrev, .mrev-s');
  const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const odometer = (el) => {
    const target = String(+el.dataset.count);
    el.textContent = '';
    const cols = [];
    target.split('').forEach(ch => {
      const d = document.createElement('span'); d.className = 'd';
      const strip = document.createElement('span');
      for (let i = 0; i <= 9; i++) { const it = document.createElement('i'); it.textContent = i; strip.appendChild(it); }
      d.appendChild(strip); el.appendChild(d); cols.push([strip, +ch]);
    });
    requestAnimationFrame(() => requestAnimationFrame(() => cols.forEach(([strip, n], i) => {
      strip.style.transitionDelay = (i * 0.12) + 's';
      strip.style.transform = `translateY(-${n}em)`;
    })));
  };
  const count = (el) => {
    if (el._done) return; el._done = 1;
    if (el.classList.contains('odo')) { if (reduceMotion) { el.textContent = fmt(+el.dataset.count); } else odometer(el); return; }
    const to = +el.dataset.count; const suffix = el.dataset.suffix || '';
    if (!to || reduceMotion) { el.textContent = fmt(to) + suffix; return; }
    let t0 = null; const dur = 1400;
    const step = (t) => { if (!t0) t0 = t; const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4); el.textContent = fmt(Math.round(to * e)) + suffix; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((es) => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); $$('[data-count]', e.target).forEach(count); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0 });
    rv.forEach(el => io.observe(el));
    setTimeout(() => rv.forEach(el => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) { el.classList.add('in'); $$('[data-count]', el).forEach(count); } }), 2400);
  } else { rv.forEach(el => el.classList.add('in')); $$('[data-count]').forEach(count); }
  $$('[data-count]').forEach(el => { if (!el.closest('.rv')) count(el); });

  $$('.mrev').forEach(el => el.addEventListener('transitionend', () => { if (el.classList.contains('in')) el.style.willChange = 'auto'; }));

  /* ---------- Hero 3D ring ---------- */
  const visual = $('.hero-visual');
  if (visual) {
    const lowEnd = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) || (navigator.deviceMemory && navigator.deviceMemory <= 2);
    const canvas = $('canvas', visual);
    let gl = null;
    try { gl = canvas.getContext('webgl2') || canvas.getContext('webgl'); } catch (e) {}
    if (!gl || lowEnd) visual.classList.add('fallback');
    else {
      import('https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js')
        .then(THREE => initRing(THREE, canvas, visual))
        .catch(() => visual.classList.add('fallback'));
    }
  }

  function initRing(THREE, canvas, wrap) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.set(0, 0, 7.2);

    const env = document.createElement('canvas'); env.width = 1024; env.height = 512;
    const c = env.getContext('2d');
    c.fillStyle = '#05070c'; c.fillRect(0, 0, 1024, 512);
    const band = (x, y, w, h, color, blur) => { c.save(); c.filter = `blur(${blur}px)`; c.fillStyle = color; c.fillRect(x, y, w, h); c.restore(); };
    band(0, 110, 1024, 14, 'rgba(77,182,255,.9)', 14);
    band(0, 330, 1024, 22, 'rgba(30,91,255,.8)', 22);
    band(150, 40, 150, 330, 'rgba(255,255,255,.9)', 26);
    band(660, 150, 110, 260, 'rgba(170,220,255,.75)', 24);
    band(880, 30, 60, 440, 'rgba(77,182,255,.7)', 30);
    band(0, 440, 1024, 60, '#02040a', 20);
    const envTex = new THREE.CanvasTexture(env);
    envTex.mapping = THREE.EquirectangularReflectionMapping;
    envTex.colorSpace = THREE.SRGBColorSpace;
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromEquirectangular(envTex).texture;
    envTex.dispose(); pmrem.dispose();

    const geo = new THREE.TorusGeometry(1.55, 0.5, 128, 256);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x05070d, metalness: 0.96, roughness: 0.2,
      clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 1.05,
      sheen: 0.25, sheenColor: new THREE.Color(0x4DB6FF)
    });
    const ring = new THREE.Mesh(geo, mat);
    scene.add(ring);
    const l1 = new THREE.PointLight(0x4DB6FF, 26, 20); l1.position.set(3.5, 2.5, 3); scene.add(l1);
    const l2 = new THREE.PointLight(0x1E5BFF, 16, 20); l2.position.set(-3.5, -2, 2.5); scene.add(l2);
    const l3 = new THREE.PointLight(0xffffff, 10, 20); l3.position.set(0, 3.5, -2); scene.add(l3);
    scene.add(new THREE.AmbientLight(0x0e1424, 0.8));

    const base = { x: 0.95, y: -0.35 };
    const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    let t = 0, running = true, needs = true;

    function size() {
      const r = wrap.getBoundingClientRect();
      const s = Math.max(1, Math.round(Math.min(r.width, r.height)));
      renderer.setSize(s, s, false);
      camera.aspect = 1; camera.updateProjectionMatrix();
      needs = true;
    }
    size(); window.addEventListener('resize', size);

    if (!isTouch) {
      window.addEventListener('pointermove', e => {
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = (e.clientY / window.innerHeight) * 2 - 1;
        target.x = ny * 0.55; target.y = nx * 0.9;
      }, { passive: true });
    } else if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== 'function') {
      window.addEventListener('deviceorientation', e => {
        if (e.beta == null) return;
        target.x = THREE.MathUtils.clamp((e.beta - 45) / 90, -1, 1) * 0.5;
        target.y = THREE.MathUtils.clamp(e.gamma / 45, -1, 1) * 0.7;
      }, { passive: true });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => { running = es[0].isIntersecting; if (running) loop(); }, { threshold: 0.05 }).observe(wrap);
    }
    document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) loop(); });

    let raf = 0;
    function loop() {
      cancelAnimationFrame(raf);
      if (!running) return;
      raf = requestAnimationFrame(loop);
      if (reduceMotion) { if (!needs) return; needs = false; }
      t += 0.004;
      cur.x += (target.x - cur.x) * 0.045;
      cur.y += (target.y - cur.y) * 0.045;
      ring.rotation.x = base.x + cur.x + Math.sin(t * 1.3) * 0.08;
      ring.rotation.y = base.y + cur.y + t * (isTouch ? 1.2 : 0.55);
      ring.rotation.z = Math.cos(t * 0.9) * 0.08;
      ring.position.y = Math.sin(t * 1.7) * 0.08;
      renderer.render(scene, camera);
    }
    loop();
  }

  /* ---------- Marquee: duplicate track ---------- */
  $$('.marquee').forEach(m => {
    const track = $('.marquee-track', m); if (!track) return;
    const clone = track.cloneNode(true); clone.setAttribute('aria-hidden', 'true'); m.appendChild(clone);
  });

  /* ---------- Hover-scroll frames ---------- */
  const setupScroll = (el, imgSel, pad) => {
    const img = $(imgSel, el); if (!img) return;
    const reset = () => { img.style.transition = 'transform 1.2s cubic-bezier(.22,1,.36,1)'; img.style.transform = 'translateY(0)'; };
    const go = () => {
      const h = img.getBoundingClientRect().height, vh = el.getBoundingClientRect().height - pad;
      const d = Math.max(0, h - vh); if (!d) return;
      img.style.transition = `transform ${Math.max(3, d / 220)}s cubic-bezier(.3,0,.7,1)`;
      img.style.transform = `translateY(${-d}px)`;
    };
    if (canHover && !reduceMotion) { el.addEventListener('mouseenter', go); el.addEventListener('mouseleave', reset); }
  };
  $$('.frame').forEach(f => {
    setupScroll(f, '.view img', $('.bar', f) ? ($('.bar', f).offsetHeight || 24) : 0);
    if (isTouch && !f.closest('a') && !f.hasAttribute('data-zoom')) {
      f.addEventListener('click', () => { const img = $('.view img', f); if (img) openLb(img.currentSrc || img.src, img.alt); });
    }
  });
  $$('.shot .im').forEach(f => setupScroll(f, 'img', 0));
  $$('.phone').forEach(p => {
    setupScroll(p, '.screen img', 12);
    if (isTouch && !p.closest('a')) p.addEventListener('click', () => { const img = $('.screen img', p); if (img) openLb(img.currentSrc || img.src, img.alt); });
  });

  /* ---------- Lightbox ---------- */
  const lb = document.createElement('div');
  lb.className = 'lb';
  lb.innerHTML = '<button class="x" aria-label="Закрыть"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button><img alt=""><div class="cap"></div>';
  document.body.appendChild(lb);
  const lbImg = $('img', lb), lbCap = $('.cap', lb);
  function openLb(src, cap) {
    lbImg.src = src; lbCap.textContent = cap || '';
    lb.classList.add('open'); document.body.classList.add('lb-open'); lb.scrollTop = 0;
    if (lenis) lenis.stop();
  }
  function closeLb() { lb.classList.remove('open'); document.body.classList.remove('lb-open'); lbImg.src = ''; if (lenis) lenis.start(); }
  lb.addEventListener('click', closeLb);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeLb(); document.body.classList.remove('menu-open'); } });
  $$('[data-zoom]').forEach(el => {
    el.addEventListener('click', (e) => {
      if (el.tagName === 'A') e.preventDefault();
      const img = el.tagName === 'IMG' ? el : $('img', el);
      const src = el.dataset.zoom ? el.dataset.zoom : (img && (img.currentSrc || img.src));
      openLb(src, el.dataset.cap || (img && img.alt));
    });
  });

  /* ---------- Gallery: balanced columns + filters ---------- */
  const masonry = $('.masonry');
  if (masonry) {
    const items = $$('.g', masonry);
    let current = 'all';
    const layout = () => {
      const n = window.innerWidth <= 900 ? 2 : 3;
      const cols = Array.from({ length: n }, () => { const c = document.createElement('div'); c.className = 'col'; return c; });
      const hts = cols.map(() => 0);
      items.forEach(g => {
        if (current !== 'all' && g.dataset.cat !== current) return;
        const img = $('img', g);
        const ratio = (+img.getAttribute('height') || 1) / (+img.getAttribute('width') || 1);
        const i = hts.indexOf(Math.min(...hts));
        cols[i].appendChild(g); hts[i] += ratio;
      });
      masonry.innerHTML = ''; cols.forEach(c => masonry.appendChild(c));
    };
    layout();
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layout, 120); });
    $$('.filter').forEach(b => b.addEventListener('click', () => {
      $$('.filter').forEach(x => x.classList.toggle('active', x === b));
      current = b.dataset.filter; layout();
      if (!reduceMotion) masonry.animate([{ opacity: .3, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.22,1,.36,1)' });
    }));
  }

  /* ---------- PROLIGHT bulbs ---------- */
  const bulbs = $$('.bulb');
  if (bulbs.length) {
    bulbs.forEach(b => {
      b.addEventListener('mouseenter', () => b.classList.add('on'));
      b.addEventListener('mouseleave', () => b.classList.remove('on'));
      b.addEventListener('click', () => b.classList.toggle('on'));
    });
    if (isTouch && 'IntersectionObserver' in window) {
      new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) bulbs.forEach((b, i) => setTimeout(() => b.classList.add('on'), 300 + i * 300));
        else bulbs.forEach(b => b.classList.remove('on'));
      }), { threshold: 0.4 }).observe(bulbs[0].parentElement);
    }
  }

  /* ---------- Before / after ---------- */
  $$('.ba').forEach(ba => {
    const r = $('input', ba);
    const set = v => ba.style.setProperty('--x', v + '%');
    r.addEventListener('input', () => set(r.value)); set(r.value);
  });

  /* ---------- FAQ: close others ---------- */
  const faq = $('.faq');
  if (faq) faq.addEventListener('toggle', e => { if (e.target.open) $$('details', faq).forEach(d => { if (d !== e.target) d.open = false; }); }, true);

  /* ---------- Copy-to-clipboard for email ---------- */
  $$('[data-copy]').forEach(b => b.addEventListener('click', e => {
    e.preventDefault();
    navigator.clipboard && navigator.clipboard.writeText(b.dataset.copy).then(() => { const t = b.textContent; b.textContent = 'Скопировано'; setTimeout(() => b.textContent = t, 1600); });
  }));
})();
