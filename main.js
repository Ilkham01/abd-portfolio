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

  /* ---------- Typography: no hanging prepositions, no lonely short last word ---------- */
  (function () {
    const SHORT = /(^|[\s(«„"])([а-яёa-z]{1,2}|без|для|над|под|при|про|или|что|как|где|нет|так|уже|ещё|еще|это|все|всё|вас|нас|них|них|мне|вам|нам|его|её|ее|их|бы|же|ли|не|ни)\s+/giu;
    const NB = '\u00A0';
    const fix = (node) => {
      node.childNodes.forEach(n => {
        if (n.nodeType === 3) {
          let t = n.nodeValue;
          /* prepositions / conjunctions / particles stick to the next word */
          t = t.replace(/(^|[\s(«„"])(а|в|во|и|к|ко|с|со|у|о|об|от|до|за|из|на|не|ни|но|по|бы|же|ли|без|для|над|под|при|про|или|что|как|где|так|уже|ещё|еще)\s+/giu, (m, a, w) => a + w + NB);
          /* last word of a heading joins the previous one if it is short */
          t = t.replace(/\s+([^\s]{1,4})([»".!?]*)\s*$/u, (m, w, p) => NB + w + p);
          n.nodeValue = t;
        } else if (n.nodeType === 1 && n.tagName !== 'BR') fix(n);
      });
    };
    $$('h1, h2, h3, .q, .lead, .fcard p, .faq summary').forEach(fix);
  })();

  /* ---------- Word-rise headline ---------- */
  const splitWords = (el) => {
    let i = 0;
    const wrap = (txt) => {
      const frag = document.createDocumentFragment();
      txt.split(/([ \t\n]+)/).forEach(part => {
        if (!part) return;
        if (/^[ \t\n]+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
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
  const STAGGER = ['.shots', '.sol', '.hyp', '.grid-3', '.services', '.steps', '.exp', '.palette', '.brand-chips', '.case-cover.cover-phones', '.hero-stats', '.faq', '.sites-small'];
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

  /* ---------- Hero avatar: depth-parallax (image + depth map) or GLB, follows the cursor ---------- */
  const fig = $('.hero-figure');
  if (fig && $('canvas', fig)) {
    const canvas = $('canvas', fig);
    const fine = matchMedia('(pointer:fine)').matches && matchMedia('(min-width:1024px)').matches;
    const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
    const lowEnd = (navigator.deviceMemory && navigator.deviceMemory <= 2);
    let gl = null; try { gl = canvas.getContext('webgl2') || canvas.getContext('webgl'); } catch (e) {}
    if (gl && fine && !reduced && !lowEnd && (fig.dataset.depth || fig.dataset.model)) {
      const mods = [import('three')];
      if (fig.dataset.model) mods.push(import('three/addons/loaders/GLTFLoader.js'));
      Promise.all(mods).then(([THREE, G]) => initAvatar(THREE, G && G.GLTFLoader, canvas, fig)).catch(() => {});
    }
  }

  function initAvatar(THREE, GLTFLoader, canvas, wrap) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', premultipliedAlpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 50);
    camera.position.set(0, 0, 6.6);
    const pivot = new THREE.Group(); scene.add(pivot);
    let amp = { y: 1.15, x: 0.55, baseY: 0.12, baseX: -0.14 };

    if (wrap.dataset.depth) {
      /* ---- image + depth map → displaced relief plane (keeps the picture pixel-perfect) ---- */
      amp = { y: 0.42, x: 0.24, baseY: 0, baseX: 0 };
      const tl = new THREE.TextureLoader();
      Promise.all([
        new Promise((res, rej) => tl.load(wrap.dataset.color, res, undefined, rej)),
        new Promise((res, rej) => tl.load(wrap.dataset.depth, res, undefined, rej))
      ]).then(([col, dep]) => {
        col.colorSpace = THREE.SRGBColorSpace; col.anisotropy = 4; col.minFilter = THREE.LinearMipmapLinearFilter;
        const ar = col.image.width / col.image.height;
        const H = 2.7, W = H * ar;
        const geo = new THREE.PlaneGeometry(W, H, 240, Math.round(240 / ar));
        const mat = new THREE.ShaderMaterial({
          transparent: true, depthWrite: true,
          uniforms: { map: { value: col }, depthMap: { value: dep }, relief: { value: 0.95 }, light: { value: new THREE.Vector2(0, 0) }, time: { value: 0 } },
          vertexShader: `uniform sampler2D depthMap; uniform float relief; varying vec2 vUv;
            void main(){ vUv = uv; float d = texture2D(depthMap, uv).r;
              vec3 p = position; p.z += (d - 0.5) * relief;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
          fragmentShader: `uniform sampler2D map; uniform sampler2D depthMap; uniform vec2 light; uniform float time; varying vec2 vUv;
            void main(){ vec4 c = texture2D(map, vUv); if (c.a < 0.35) discard;
              /* surface normal from the depth map */
              float e = 3.0 / 1024.0;
              float dx = texture2D(depthMap, vUv + vec2(e, 0.0)).r - texture2D(depthMap, vUv - vec2(e, 0.0)).r;
              float dy = texture2D(depthMap, vUv + vec2(0.0, e)).r - texture2D(depthMap, vUv - vec2(0.0, e)).r;
              vec3 n = normalize(vec3(-dx * 9.0, -dy * 9.0, 1.0));
              /* key light from the top-left that slowly slides up and down, nudged by the cursor */
              float sw = sin(time * 0.45);
              vec3 L = normalize(vec3(-0.75 + light.x * 0.25, 0.55 + sw * 0.5 - light.y * 0.2, 0.75));
              float diff = max(dot(n, L), 0.0);
              vec3 V = vec3(0.0, 0.0, 1.0);
              float spec = pow(max(dot(reflect(-L, n), V), 0.0), 18.0);
              vec3 tint = vec3(0.82, 0.90, 1.0);
              float lum = dot(c.rgb, vec3(0.299, 0.587, 0.114));
              c.rgb = c.rgb * (0.82 + diff * 0.46) + tint * spec * (0.2 + lum * 0.25);
              /* soft blue rim on the left edge (continues the site's blue glow) */
              float rim = pow(1.0 - max(n.z, 0.0), 2.0) * max(-n.x, 0.0);
              c.rgb += vec3(0.18, 0.48, 1.0) * rim * 0.35;
              gl_FragColor = vec4(c.rgb, c.a);
              #include <colorspace_fragment>
            }`
        });
        mat.extensions = { derivatives: true };
        const mesh = new THREE.Mesh(geo, mat); pivot.add(mesh);
        wrap._light = mat.uniforms.light.value; wrap._time = mat.uniforms.time;
        wrap.classList.add('ready');
      }).catch(() => {});
    } else if (GLTFLoader) {
      /* ---- real 3D model ---- */
      renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
      const env = document.createElement('canvas'); env.width = 1024; env.height = 512;
      const c = env.getContext('2d'); c.fillStyle = '#0b1020'; c.fillRect(0, 0, 1024, 512);
      const band = (x, y, w, h, color, blur) => { c.save(); c.filter = `blur(${blur}px)`; c.fillStyle = color; c.fillRect(x, y, w, h); c.restore(); };
      band(560, 70, 300, 60, 'rgba(255,255,255,.95)', 30); band(0, 200, 300, 120, 'rgba(47,123,255,.9)', 40); band(700, 330, 324, 40, 'rgba(120,170,255,.5)', 30);
      const envTex = new THREE.CanvasTexture(env); envTex.mapping = THREE.EquirectangularReflectionMapping; envTex.colorSpace = THREE.SRGBColorSpace;
      const pmrem = new THREE.PMREMGenerator(renderer); scene.environment = pmrem.fromEquirectangular(envTex).texture; pmrem.dispose();
      scene.add(new THREE.AmbientLight(0x6f87b8, 0.18));
      const key = new THREE.DirectionalLight(0xffffff, 2.0); key.position.set(2.2, 3, 2.6); scene.add(key);
      const rim = new THREE.DirectionalLight(0x2f7bff, 4.2); rim.position.set(-3.5, 1.4, -1.2); scene.add(rim);
      const fill = new THREE.DirectionalLight(0xffd9b0, 0.35); fill.position.set(0.5, -2.5, 2.5); scene.add(fill);
      new GLTFLoader().load(wrap.dataset.model, (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3()); const center = box.getCenter(new THREE.Vector3());
        const s = 2.6 / Math.max(size.x, size.y, size.z);
        model.position.sub(center).multiplyScalar(s); model.scale.setScalar(s);
        model.traverse(o => { if (o.isMesh && o.material) { o.material.envMapIntensity = 0.9; if (o.material.roughness !== undefined) o.material.roughness = 0.42; if (o.material.metalness !== undefined) o.material.metalness = 0.05; } });
        pivot.add(model); wrap.classList.add('ready');
      }, undefined, () => {});
    }

    const resize = () => { const w = wrap.clientWidth, h = wrap.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    resize(); window.addEventListener('resize', resize);

    let tx = 0, ty = 0, rx = 0, ry = 0, visible = true, t0 = performance.now();
    window.addEventListener('pointermove', (e) => {
      const nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5;
      ty = nx * amp.y; tx = ny * amp.x;
      if (wrap._light) wrap._light.set(nx * 2, -ny * 2);
    });
    document.addEventListener('pointerleave', () => { tx = 0; ty = 0; });
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { threshold: 0 }).observe(wrap);
    const k = wrap.dataset.depth ? 0.075 : 0.06;
    const loop = (now) => {
      requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      const t = (now - t0) / 1000;
      if (wrap._time) wrap._time.value = t;
      const idleY = Math.sin(t * 0.6) * (wrap.dataset.depth ? 0.035 : 0.09), idleX = Math.sin(t * 0.9 + 1) * (wrap.dataset.depth ? 0.02 : 0.04), bob = Math.sin(t * 1.1) * 0.03;
      ry += ((amp.baseY + ty + idleY) - ry) * k;
      rx += ((amp.baseX + tx + idleX) - rx) * k;
      pivot.rotation.set(rx, ry, Math.sin(t * 0.5) * 0.012);
      pivot.position.y = bob;
      renderer.render(scene, camera);
    };
    requestAnimationFrame(loop);
  }

  /* ---------- Scroll cue: hide after first scroll ---------- */
  const markScrolled = () => { if (window.scrollY > 80) document.documentElement.classList.add('scrolled'); else document.documentElement.classList.remove('scrolled'); };
  window.addEventListener('scroll', markScrolled, { passive: true }); markScrolled();

  /* ---------- Marquee: duplicate track ---------- */
  $$('.marquee').forEach(m => {
    const track = $('.marquee-track', m); if (!track) return;
    const clone = track.cloneNode(true); clone.setAttribute('aria-hidden', 'true'); $$('a', clone).forEach(a => { a.tabIndex = -1; }); m.appendChild(clone);
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

  /* ---------- Stacking cards (generic): the card underneath shrinks and dims as the next one covers it ---------- */
  $$('.stack').forEach(stack => {
    const items = Array.from(stack.children);
    items.forEach((c, i) => c.style.setProperty('--i', i));
    if (matchMedia('(prefers-reduced-motion:reduce)').matches || !matchMedia('(min-width:1024px)').matches) return;
    const update = () => {
      items.forEach((c, i) => {
        const next = items[i + 1]; if (!next) { c.style.transform = ''; c.style.filter = ''; return; }
        const r = c.getBoundingClientRect(), n = next.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, 1 - (n.top - r.top - 14) / Math.max(1, Math.min(r.height, window.innerHeight * 0.9))));
        c.style.transform = `scale(${1 - p * 0.05})`;
        c.style.filter = `brightness(${1 - p * 0.3})`;
      });
    };
    window.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update); update();
  });

  /* ---------- Skills showcase: pinned section, 4 scenes driven by scroll progress ---------- */
  const skills = $('.skills');
  if (skills && matchMedia('(min-width:1024px)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
    const scenes = $$('.scene', skills), word = $('.skw-in', skills), cap = $('.skills-cap', skills), cnt = $('.skills-count b', skills), bars = $$('.skills-progress i', skills);
    const WORDS = ['первые экраны', 'презентации', 'брендинг и мерч', 'креативы для соцсетей'];
    const CAPS = ['Концепты первых экранов для сайтов и приложений', 'Слайды для курсов, форумов и бизнес-презентаций', 'Логотипы, упаковка, меню и мерч', 'Сторис, посты и обложки для Instagram и YouTube'];
    const stage = $('.skills-stage', skills);
    const N = scenes.length;
    const ease = t => 1 - Math.pow(1 - t, 3);
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const smooth = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    /* ---- scene 1: grid rising in rows ---- */
    const g = $$('figure', scenes[0]);
    const layoutGrid = () => {
      const W = stage.clientWidth, H = stage.clientHeight; const pad = Math.max(24, (W - 1320) / 2 + 24);
      const inner = W - pad * 2; const gridW = inner * 0.72; const cw = (gridW - 36) / 3, ch = cw * 10 / 16; const top0 = H * 0.36;
      const ph = ch * 2 + 18, pw = ph * 9 / 19.5; const px0 = pad + gridW + (inner - gridW - pw * 2 - 18) / 2 + 9;
      let k = 0;
      g.forEach((f, i) => {
        if (i < 6) { const col = i % 3, row = Math.floor(i / 3); f.style.left = (pad + col * (cw + 18)) + 'px'; f.style.top = (top0 + row * (ch + 18)) + 'px'; f.style.width = cw + 'px'; f.style.height = ch + 'px'; f.dataset.row = row; f.dataset.col = col; }
        else { f.style.width = pw + 'px'; f.style.height = ph + 'px'; f.style.left = (px0 + k * (pw + 18)) + 'px'; f.style.top = (top0 - 10 + k * 20) + 'px'; f.dataset.row = 0.5 + k * 0.4; f.dataset.col = 3 + k; k++; }
      });
    };
    const drawGrid = (p) => { /* p 0..1 within scene: cards rise in, then the whole grid drifts up and out */
      g.forEach((f, i) => {
        const row = +f.dataset.row, col = +f.dataset.col;
        const d = row * 0.16 + col * 0.05; const t = ease(clamp((p - d) / 0.42, 0, 1));
        const exit = clamp((p - 0.78) / 0.22, 0, 1);
        const y = (1 - t) * 160 + exit * -220 * (1 + row * 0.15);
        f.style.transform = `translate3d(0,${y}px,0) scale(${0.94 + t * 0.06})`;
        f.style.opacity = t * (1 - exit);
      });
    };

    /* ---- scene 2: curved arc of slides ---- */
    const arc = $$('figure', scenes[1]); const AN = arc.length;
    const drawArc = (p) => {
      const W = stage.clientWidth; const R = W * 0.78; const step = 0.38;
      const centre = -1.2 + p * (AN + 1.4); /* which slide index is in the middle */
      arc.forEach((f, i) => {
        const a = (i - centre) * step; const vis = Math.abs(a) < Math.PI * 0.62;
        const x = Math.sin(a) * R, z = (Math.cos(a) - 1) * R * 0.9;
        const ry = -a * 0.9; const sc = 0.82 + 0.18 * Math.cos(Math.min(Math.abs(a), 1.5));
        const op = vis ? clamp(1.3 - Math.abs(a) / (Math.PI * 0.55), 0, 1) : 0;
        f.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${stage.clientHeight * 0.14}px), ${z}px) rotateY(${ry}rad) scale(${sc})`;
        f.style.opacity = op; f.style.zIndex = Math.round(100 - Math.abs(a) * 40);
      });
    };

    /* ---- scene 3: tunnel ---- */
    const tun = $$('figure', scenes[2]); const TN = tun.length;
    const drawTunnel = (p) => {
      const W = stage.clientWidth, H = stage.clientHeight; const depth = 2400; const gap = 170;
      const travel = p * (TN * gap + 300);
      tun.forEach((f, i) => {
        const side = i % 2 ? 1 : -1; const lane = Math.floor(i / 2) % 2; /* two lanes per side */
        let z = -i * gap - 300 + travel;
        const x = side * (W * 0.3 + lane * 110); const y = H * 0.1 + (lane ? -1 : 1) * H * 0.13 + (i % 3 - 1) * 30;
        const op = z > 150 ? clamp(1 - (z - 150) / 350, 0, 1) : clamp((z + depth) / 900, 0, 1);
        f.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), ${z}px) rotateY(${-side * 50}deg)`;
        f.style.opacity = op; f.style.zIndex = Math.round(1000 + z);
      });
    };

    /* ---- scene 4: three rows sliding in opposite directions ---- */
    const rows = $$('.row', scenes[3]);
    const drawRows = (p) => {
      rows.forEach((r, i) => {
        const dir = i % 2 ? 1 : -1; const w = r.scrollWidth - stage.clientWidth;
        const x = dir * (w * (0.5 - p) ) + (i === 1 ? 0 : 0);
        const tilt = (p - 0.5) * (i % 2 ? -6 : 6);
        r.style.transform = `translate3d(${x}px,0,0) rotate(${tilt * 0.25}deg)`;
        r.style.opacity = clamp(Math.min(p / 0.12, (1 - p) / 0.12), 0, 1);
      });
    };
    const draws = [drawGrid, drawArc, drawTunnel, drawRows];

    let active = -1, raf = 0;
    const setWord = (i) => {
      if (i === active) return; active = i;
      word.classList.add('out'); cap.classList.add('out');
      setTimeout(() => { word.textContent = WORDS[i]; word.classList.add('pre'); word.classList.remove('out'); void word.offsetWidth; word.classList.remove('pre'); cap.textContent = CAPS[i]; cap.classList.remove('out'); cnt.textContent = String(i + 1).padStart(2, '0'); }, 320);
      scenes.forEach((s, k) => s.classList.toggle('on', k === i));
    };
    const render = () => {
      raf = 0;
      const r = skills.getBoundingClientRect(); const total = r.height - window.innerHeight;
      const prog = clamp(-r.top / total, 0, 1);
      const seg = 1 / N; const i = Math.min(N - 1, Math.floor(prog / seg)); const p = clamp((prog - i * seg) / seg, 0, 1);
      setWord(i);
      draws[i](p);
      bars.forEach((b, k) => b.style.setProperty('--p', k < i ? 1 : k === i ? p : 0));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(render); };
    /* preload scene images a screen and a half before the section pins */
    new IntersectionObserver((en, io) => { if (en[0].isIntersecting) { $$('.scene img', skills).forEach(im => { im.loading = 'eager'; }); io.disconnect(); } }, { rootMargin: '150% 0px' }).observe(skills);
    layoutGrid(); window.addEventListener('resize', () => { layoutGrid(); onScroll(); });
    window.addEventListener('scroll', onScroll, { passive: true }); render();
  } else if (skills) {
    const T = ['Первые экраны', 'Презентации', 'Брендинг', 'Соцсети'];
    $$('.scene', skills).forEach((s, i) => s.dataset.title = T[i]);
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
