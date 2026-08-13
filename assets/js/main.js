/* ABC a bollywood company — interactions */
(function () {
  'use strict';
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- nav: scrolled state ---------- */
  const nav = $('.site-nav');
  if (nav) {
    let last = 0;
    addEventListener('scroll', () => {
      const y = scrollY;
      nav.classList.toggle('nav-scrolled', y > 24);
      last = y;
    }, { passive: true });
  }

  /* ---------- nav: dropdowns ---------- */
  $$('.nav-drop').forEach(drop => {
    const btn = $('button', drop);
    let closeTimer;
    const open = () => { clearTimeout(closeTimer); $$('.nav-drop.open').forEach(d => d !== drop && d.classList.remove('open')); drop.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); };
    const close = () => { closeTimer = setTimeout(() => { drop.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }, 180); };
    drop.addEventListener('pointerenter', open);
    drop.addEventListener('pointerleave', close);
    btn.addEventListener('click', () => drop.classList.contains('open') ? (drop.classList.remove('open'), btn.setAttribute('aria-expanded','false')) : open());
    drop.addEventListener('focusout', e => { if (!drop.contains(e.relatedTarget)) { drop.classList.remove('open'); btn.setAttribute('aria-expanded','false'); } });
  });
  document.addEventListener('click', e => { if (!e.target.closest('.nav-drop')) $$('.nav-drop.open').forEach(d => d.classList.remove('open')); });

  /* ---------- nav: burger + overlay ---------- */
  const burger = $('.nav-burger');
  if (burger) {
    const overlay = $('.menu-overlay');
    const setMenu = open => {
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', String(open));
      if (open) {
        $$('.menu-overlay a').forEach((a, i) => { a.style.animationDelay = (80 + i * 45) + 'ms'; });
        const first = overlay && overlay.querySelector('a');
        if (first) first.focus();
      } else {
        burger.focus();
      }
    };
    burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
    $$('.menu-overlay a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    addEventListener('keydown', e => {
      if (!document.body.classList.contains('menu-open')) return;
      if (e.key === 'Escape') { setMenu(false); return; }
      if (e.key !== 'Tab' || !overlay) return;
      // trap focus inside the overlay (+ burger) while the menu is open
      const focusables = [...overlay.querySelectorAll('a')].concat(burger);
      const i = focusables.indexOf(document.activeElement);
      if (e.shiftKey && (i === 0 || i === -1)) { e.preventDefault(); focusables[focusables.length - 1].focus(); }
      else if (!e.shiftKey && i === focusables.length - 1) { e.preventDefault(); focusables[0].focus(); }
    });
  }

  /* ---------- scroll reveals ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('.rv, .rv-scale, .rv-img').forEach(el => io.observe(el));

  /* auto-stagger siblings marked with data-stagger on the parent */
  $$('[data-stagger]').forEach(parent => {
    $$(':scope > *', parent).forEach((el, i) => el.style.setProperty('--rv-d', (i * 90) + 'ms'));
  });

  /* ---------- marquee: duplicate track for seamless loop ---------- */
  $$('.marquee-track').forEach(track => {
    track.innerHTML += track.innerHTML;
  });

  /* ---------- hero parallax (transform-only, rAF-throttled) ---------- */
  const heroMedia = $('.hero-media');
  if (heroMedia && !reduced) {
    let ticking = false;
    addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = Math.min(scrollY, innerHeight);
        heroMedia.style.transform = 'translateY(' + y * 0.18 + 'px)';
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- accordions ---------- */
  // A closed panel is only clipped visually (grid-row 0fr); its links stayed in the tab order and
  // the a11y tree. Toggle `inert` so a keyboard/AT user can't land inside a closed panel.
  const setAcc = (item, open) => {
    item.classList.toggle('open', open);
    const btn = $('button', item); if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    const p = item.querySelector('.acc-panel'); if (p) { if (open) p.removeAttribute('inert'); else p.setAttribute('inert', ''); }
  };
  $$('.acc-item').forEach(it => setAcc(it, it.classList.contains('open')));  // sync initial state
  $$('.acc-item .acc-h > button, .acc-item > button').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.acc-item');
      const wasOpen = item.classList.contains('open');
      $$('.acc-item.open', item.parentElement).forEach(i => setAcc(i, false));
      if (!wasOpen) setAcc(item, true);
    });
  });

  /* ---------- countdown ---------- */
  $$('[data-countdown]').forEach(el => {
    const target = new Date(el.dataset.countdown + 'T00:00:00');
    const cells = { d: $('[data-cd="d"] b', el), h: $('[data-cd="h"] b', el), m: $('[data-cd="m"] b', el) };
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { el.style.display = 'none'; return; }
      cells.d.textContent = Math.floor(diff / 864e5);
      cells.h.textContent = Math.floor(diff % 864e5 / 36e5);
      cells.m.textContent = Math.floor(diff % 36e5 / 6e4);
    };
    tick(); setInterval(tick, 30000);
  });

  /* ---------- agenda filters ---------- */
  const filterRow = $('[data-filters]');
  if (filterRow) {
    const cards = $$('[data-eyear]');
    $$('.chip', filterRow).forEach(chip => {
      chip.addEventListener('click', () => {
        $$('.chip', filterRow).forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const y = chip.dataset.year;
        cards.forEach((card, i) => {
          const show = y === 'all' || card.dataset.eyear === y;
          card.style.display = show ? '' : 'none';
          if (show && !reduced) {
            card.classList.remove('in');
            card.style.setProperty('--rv-d', (i % 9) * 60 + 'ms');
            requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('in')));
          }
        });
      });
    });
  }

  /* ---------- YouTube facades ---------- */
  $$('.yt-facade').forEach(fc => {
    fc.addEventListener('click', () => {
      const id = fc.dataset.yt;
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.title = fc.dataset.title || 'Video';
      fc.innerHTML = '';
      fc.appendChild(iframe);
    }, { once: true });
  });

  /* ---------- lightbox ---------- */
  const lbTargets = $$('.g-item');
  if (lbTargets.length) {
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Image viewer');
    lb.innerHTML = '<button class="lb-close" aria-label="Close">✕</button><img alt=""><p class="lb-cap"></p>';
    document.body.appendChild(lb);
    const lbImg = $('img', lb), lbCap = $('.lb-cap', lb), lbClose = $('.lb-close', lb);
    let lastTrigger = null;
    const close = () => {
      lb.classList.remove('open');
      document.body.style.overflow = '';
      if (lastTrigger) { lastTrigger.focus(); lastTrigger = null; }  // restore focus to the image
    };
    lbTargets.forEach(g => g.addEventListener('click', () => {
      const img = $('img', g);
      lbImg.src = img.dataset.full || img.src;
      lbImg.alt = img.alt || '';
      lbCap.textContent = img.alt || '';
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
      lastTrigger = g;
      lbClose.focus();  // move focus into the dialog
    }));
    lb.addEventListener('click', e => { if (e.target !== lbImg) close(); });
    lb.addEventListener('keydown', e => {
      if (e.key === 'Escape') { close(); return; }
      // trap focus — the only focusable in the dialog is the close button
      if (e.key === 'Tab') { e.preventDefault(); lbClose.focus(); }
    });
  }

  /* ---------- mailto contact form ---------- */
  $$('[data-mailto-form]').forEach(mForm => {
    mForm.addEventListener('submit', e => {
      e.preventDefault();
      const f = new FormData(mForm);
      const subject = encodeURIComponent('[Website] ' + (f.get('subject') || 'Hello'));
      const lines = [];
      for (const [key, value] of f.entries()) {
        if (key === 'subject') continue;
        const label = key.replace(/[-_]+/g, ' ').replace(/\b\w/g, m => m.toUpperCase());
        lines.push(label + ': ' + value);
      }
      const body = encodeURIComponent(lines.join('\n'));
      location.href = 'mailto:' + mForm.dataset.mailtoForm + '?subject=' + subject + '&body=' + body;
    });
  });

  /* ---------- footer year ---------- */
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  /* ---------- magnetic buttons ---------- */
  if (!reduced && matchMedia('(pointer: fine)').matches) {
    $$('.btn').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / r.width;
        const y = (e.clientY - r.top - r.height / 2) / r.height;
        btn.style.translate = (x * 7) + 'px ' + (y * 5) + 'px';
      });
      btn.addEventListener('pointerleave', () => { btn.style.translate = ''; });
    });
  }

  /* ---------- reading progress (blog posts) ---------- */
  const rp = $('.read-progress');
  if (rp) {
    let rpTick = false;
    addEventListener('scroll', () => {
      if (rpTick) return; rpTick = true;
      requestAnimationFrame(() => {
        const h = document.documentElement;
        const max = h.scrollHeight - innerHeight;
        rp.style.transform = 'scaleX(' + (max > 0 ? Math.min(scrollY / max, 1) : 0) + ')';
        rpTick = false;
      });
    }, { passive: true });
  }

  /* ---------- auto-stagger card grids ---------- */
  $$('.grid-cards').forEach(grid => {
    $$(':scope > .rv', grid).forEach((el, i) => {
      if (!el.style.getPropertyValue('--rv-d')) el.style.setProperty('--rv-d', (i % 6) * 90 + 'ms');
    });
  });
})();

/* ================================================================
   ALIVE LAYER — video hero, counters, tilt, glow, film strip, explorer
   ================================================================ */
(() => {
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = navigator.connection && navigator.connection.saveData;

  /* ---------- native video hero (text-free loop) ---------- */
  const vh = document.querySelector('.hero-video[data-vsrc]');
  if (vh && !reduced && !saveData && matchMedia('(min-width: 700px)').matches) {
    const make = () => {
      const v = document.createElement('video');
      v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto';
      v.setAttribute('aria-hidden', 'true'); v.tabIndex = -1;
      v.src = vh.dataset.vsrc;
      v.addEventListener('canplay', () => {
        v.play().then(() => vh.classList.add('playing')).catch(() => {});
      }, { once: true });
      vh.appendChild(v);
    };
    'requestIdleCallback' in window ? requestIdleCallback(make, {timeout: 2000}) : setTimeout(make, 900);
  }

  /* ---------- stat counters ---------- */
  const fmt = (n, suffix) => n + (suffix || '');
  const cio = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    cio.unobserve(en.target);
    const el = en.target, target = parseInt(el.dataset.count, 10), suffix = el.dataset.suffix || '';
    if (reduced) { el.textContent = fmt(target, suffix); return; }
    const t0 = performance.now(), dur = 1400;
    const tick = t => {
      const p = Math.min((t - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * eased), suffix);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), { threshold: 0.35 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- card tilt ---------- */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reduced) {
    $$('.bezel').forEach(card => {
      let raf = null;
      card.addEventListener('pointermove', e => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          const rx = ((e.clientY - r.top) / r.height - 0.5) * -4;
          const ry = ((e.clientX - r.left) / r.width - 0.5) * 5;
          card.classList.add('tilting');
          card.style.transform = `perspective(52rem) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
          raf = null;
        });
      });
      card.addEventListener('pointerleave', () => {
        card.classList.remove('tilting');
        card.style.transform = '';
      });
    });
  }

  /* ---------- cursor glow on dark sections ---------- */
  $$('section[data-theme="dark"], section[data-theme="aubergine"]').forEach(sec => {
    const layer = document.createElement('div');
    layer.className = 'glow-layer';
    sec.prepend(layer);
    sec.addEventListener('pointermove', e => {
      const r = sec.getBoundingClientRect();
      layer.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      layer.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    }, { passive: true });
  });

  /* ---------- film strip drag ---------- */
  $$('.filmstrip').forEach(strip => {
    let down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('pointerdown', e => { down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft; });
    addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 6) { moved = true; strip.classList.add('dragging'); }
      if (moved) strip.scrollLeft = sl - dx;
    }, { passive: true });
    addEventListener('pointerup', () => { down = false; strip.classList.remove('dragging'); });
    strip.addEventListener('click', e => { if (moved) e.preventDefault(); }, true);
  });

  /* ---------- style explorer ---------- */
  const ex = document.querySelector('.explorer');
  if (ex) {
    const imgs = $$('.explorer-media img', ex);
    const blurb = ex.querySelector('.explorer-copy p');
    $$('.chip[data-style]', ex).forEach(chip => chip.addEventListener('click', () => {
      $$('.chip[data-style]', ex).forEach(c => c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'));
      imgs.forEach(im => im.classList.toggle('on', im.dataset.style === chip.dataset.style));
      if (blurb) blurb.textContent = chip.dataset.blurb || '';
    }));
  }

  /* ---------- experimental scroll hero ---------- */
  const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));
  const stage = document.querySelector('[data-stage-scroll]');
  if (stage && !reduced) {
    const cards = $$('.stage-card', stage);
    const backgrounds = $$('[data-stage-bg]', stage);
    const current = stage.querySelector('[data-stage-current]');
    const total = cards.length;
    let ticking = false;
    const paint = () => {
      const rect = stage.getBoundingClientRect();
      const travel = Math.max(stage.offsetHeight - innerHeight, 1);
      const p = clamp(-rect.top / travel);
      const track = p * Math.max(total - 1, 0);
      const active = Math.round(track);
      const lower = Math.floor(track);
      const blendRaw = track - lower;
      const blend = blendRaw * blendRaw * (3 - 2 * blendRaw);
      const gap = innerWidth < 821 ? 82 : 40;
      stage.style.setProperty('--stage-p', p.toFixed(4));
      stage.style.setProperty('--stage-bg-scale', (1.065 - p * 0.025).toFixed(4));

      backgrounds.forEach((bg, i) => {
        let opacity = 0;
        if (i === lower) opacity = 1 - blend;
        if (i === lower + 1) opacity = blend;
        if (track >= total - 1 && i === total - 1) opacity = 1;
        bg.style.setProperty('--bg-o', opacity.toFixed(4));
      });

      cards.forEach((card, i) => {
        let offset = i - track;
        while (offset > total / 2) offset -= total;
        while (offset < -total / 2) offset += total;
        const distance = Math.abs(offset);
        const visibility = clamp(1 - Math.max(0, distance - 1.45) * 1.8);
        card.style.setProperty('--x', (offset * gap).toFixed(3));
        card.style.setProperty('--y', (-2.5 + Math.min(distance, 1.7) * 15).toFixed(3));
        card.style.setProperty('--r', (offset * -0.9).toFixed(3));
        card.style.setProperty('--s', Math.max(0.64, 1.045 - distance * 0.24).toFixed(4));
        card.style.setProperty('--o', visibility.toFixed(3));
        card.style.setProperty('--shade', Math.max(0.58, 1 - distance * 0.25).toFixed(3));
        card.style.setProperty('--z', String(Math.round(100 - distance * 20)));
        card.style.pointerEvents = distance < 0.62 ? 'auto' : 'none';
        card.tabIndex = distance < 0.62 ? 0 : -1;
        card.setAttribute('aria-hidden', distance < 0.62 ? 'false' : 'true');
      });
      if (current) current.textContent = String(active + 1).padStart(2, '0');
      ticking = false;
    };
    const schedule = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(paint);
    };
    paint();
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule, { passive: true });
  }
})();

// GIDF edition films — swap each chapter's poster for a muted 6s stage loop when
// it scrolls into view. Reduced motion / no JS keep the credited poster image.
(function () {
  const holders = Array.from(document.querySelectorAll('.ed-film[data-clip]'));
  if (!holders.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const hd = matchMedia('(min-width: 761px)').matches;
  const build = holder => {
    const v = document.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'metadata';
    v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    v.poster = holder.dataset.poster || '';
    v.src = (hd && holder.dataset.clipHd) ? holder.dataset.clipHd : holder.dataset.clip;
    v.setAttribute('aria-hidden', 'true');
    const img = holder.querySelector('img');
    if (img) img.replaceWith(v); else (holder.querySelector('.ed-frame') || holder).prepend(v);
    return v;
  };
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    let v = en.target.querySelector('video');
    if (en.isIntersecting) {
      if (!v) v = build(en.target);
      v.play().catch(() => {});
    } else if (v) { v.pause(); }
  }), { rootMargin: '120px 0px', threshold: 0.15 });
  holders.forEach(h => io.observe(h));
})();
