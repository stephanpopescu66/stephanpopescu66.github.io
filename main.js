const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- Videos: lazy-load and play only while on screen ---------- */
const vio = new IntersectionObserver((entries) => {
  for (const e of entries) {
    const v = e.target;
    if (e.isIntersecting) {
      if (v.preload === 'none') v.preload = 'auto';
      if (!reduce) v.play().catch(() => {});
    } else v.pause();
  }
}, { rootMargin: '200px 0px', threshold: 0.25 });
$$('video[data-lazy]').forEach((v) => vio.observe(v));

/* ---------- Portrait shrinks into the nav as you scroll ---------- */
const me = $('#me');
let ticking = false;
function setP() {
  const range = window.innerWidth < 700 ? 140 : 260;
  const p = document.body.dataset.view ? 1 : reduce ? (scrollY > 40 ? 1 : 0) : Math.min(1, Math.max(0, scrollY / range));
  document.documentElement.style.setProperty('--p', p.toFixed(3));
  me.classList.toggle('small', p > 0.34);
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(setP); } }, { passive: true });
addEventListener('resize', setP);
setP();

/* Portrait + buttons centered on the hero copy (desktop) */
function placeMe() {
  if (innerWidth <= 700) { document.documentElement.style.removeProperty('--me-t0'); return; }
  const copy = $('.hero-copy').getBoundingClientRect();
  const size = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--me-size')) || 208;
  const h0 = size + 14 + $('.me-ctas', me).offsetHeight;
  const center = copy.top + scrollY + copy.height / 2;
  document.documentElement.style.setProperty('--me-t0', Math.max(64, center - h0 / 2).toFixed(0) + 'px');
}
placeMe();
addEventListener('resize', placeMe);
document.fonts?.ready.then(placeMe);

/* ---------- Active chapter in the nav ---------- */
const navLinks = $$('.gnav nav a');
const chapter = { archer: 'work', lucid: 'work', milwaukee: 'work', tools: 'tools', outside: 'outside' };
const nio = new IntersectionObserver((entries) => {
  if (document.body.dataset.view) return;
  for (const e of entries) if (e.isIntersecting) {
    const c = chapter[e.target.id];
    navLinks.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + c));
  }
}, { rootMargin: '-45% 0px -50% 0px' });
Object.keys(chapter).forEach((id) => { const s = document.getElementById(id); if (s) nio.observe(s); });

/* ---------- Tab views: Hands-on, Racing, Outside open on their own ----------
   The main page ends after Projects. #hands, #per, #outside show only that section. */
const TABS = ['hands', 'per'];
function route() {
  const id = decodeURIComponent(location.hash.slice(1));
  const was = document.body.dataset.view;
  if (TABS.includes(id)) {
    document.body.dataset.view = id;
    window.scrollTo(0, 0);
    navLinks.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + id));
    document.title = { hands: 'Hands-on', per: 'Racing' }[id] + ' · Stephan Popescu';
  } else {
    delete document.body.dataset.view;
    document.title = 'Stephan Popescu';
    navLinks.forEach((a) => a.classList.remove('on'));
    if (was) {
      const t = id && document.getElementById(id);
      if (t) t.scrollIntoView(); else window.scrollTo(0, 0);
    }
  }
  setP();
}
addEventListener('hashchange', route);
route();

/* ---------- PersonalOS phones: page by whole phones ---------- */
$$('.phones').forEach((ph) => {
  const wrap = document.createElement('div');
  wrap.className = 'phones-wrap';
  ph.parentNode.insertBefore(wrap, ph); wrap.appendChild(ph);
  const nav = document.createElement('div');
  nav.className = 'ph-nav';
  nav.innerHTML = '<button aria-label="Previous screens">‹</button><span></span><button aria-label="Next screens">›</button>';
  wrap.appendChild(nav);
  const [prev, next] = $$('button', nav), count = $('span', nav), figs = $$('figure', ph);
  const step = () => figs[1] ? figs[1].offsetLeft - figs[0].offsetLeft : ph.clientWidth;
  function update() {
    const per = Math.max(1, Math.round((ph.clientWidth - 28) / step()));
    const first = Math.round(ph.scrollLeft / step());
    prev.disabled = ph.scrollLeft < 4;
    next.disabled = ph.scrollLeft + ph.clientWidth >= ph.scrollWidth - 4;
    count.textContent = `${Math.min(first + per, figs.length)} / ${figs.length}`;
  }
  prev.onclick = () => ph.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' });
  next.onclick = () => ph.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' });
  ph.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  addEventListener('resize', update); update();
});

/* ---------- Lightbox: every image and video opens large ---------- */
const lb = document.createElement('div');
lb.className = 'lb';
lb.setAttribute('role', 'dialog');
lb.setAttribute('aria-modal', 'true');
lb.innerHTML = '<button class="lb-x" aria-label="Close">×</button><button class="lb-prev" aria-label="Previous">‹</button><div class="lb-stage"></div><p class="lb-cap"></p><button class="lb-next" aria-label="Next">›</button>';
document.body.appendChild(lb);
const stage = $('.lb-stage', lb), cap = $('.lb-cap', lb);
let set = [], at = 0, opener = null;

function media() { return $$('main img:not([data-nolb]), main video'); }
function groupOf(el) {
  const g = el.closest('[data-gallery]');
  if (!g) return [el];
  const name = g.dataset.gallery;
  return media().filter((m) => { const h = m.closest('[data-gallery]'); return h && h.dataset.gallery === name; });
}
function captionOf(el) {
  const f = el.closest('figure');
  const c = f && f.querySelector('figcaption');
  return c ? c.innerText.replace(/\s+/g, ' ').trim() : (el.getAttribute('alt') || '');
}
function show(i) {
  at = (i + set.length) % set.length;
  const el = set[at];
  stage.innerHTML = '';
  let node;
  if (el.tagName === 'VIDEO') {
    node = document.createElement('video');
    node.src = el.currentSrc || el.src; node.poster = el.poster || '';
    node.controls = true; node.loop = true; node.muted = true; node.playsInline = true; node.autoplay = true;
  } else {
    node = document.createElement('img');
    node.src = el.currentSrc || el.src; node.alt = el.alt;
    if (/\.png$/i.test(node.src) && el.closest('.drawings, .duo, .white, .pair, .paper')) node.className = 'paper';
  }
  stage.appendChild(node);
  cap.innerHTML = '';
  cap.textContent = captionOf(el);
  if (set.length > 1) { const n = document.createElement('span'); n.className = 'n'; n.textContent = `${at + 1} / ${set.length}`; cap.appendChild(n); }
  $('.lb-prev', lb).style.display = $('.lb-next', lb).style.display = set.length > 1 ? '' : 'none';
}
function open(el) {
  if (document.body.classList.contains('editing')) return;
  opener = el; set = groupOf(el); show(set.indexOf(el));
  lb.classList.add('open'); document.body.classList.add('lb-on');
  $('.lb-x', lb).focus();
}
function close() {
  lb.classList.remove('open'); document.body.classList.remove('lb-on'); stage.innerHTML = '';
  if (opener) opener.focus?.();
}
document.addEventListener('click', (ev) => {
  const el = ev.target.closest('main img:not([data-nolb]), main video');
  if (!el || el.closest('a')) return;
  ev.preventDefault(); open(el);
});
media().forEach((m) => { if (!m.closest('a')) { m.tabIndex = 0; m.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(m); }); } });
$('.lb-x', lb).onclick = close;
$('.lb-prev', lb).onclick = () => show(at - 1);
$('.lb-next', lb).onclick = () => show(at + 1);
lb.addEventListener('click', (e) => { if (e.target === lb || e.target === stage) close(); });
addEventListener('keydown', (e) => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape') close();
  if (e.key === 'ArrowLeft') show(at - 1);
  if (e.key === 'ArrowRight') show(at + 1);
});
let tx = null;
lb.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', (e) => { if (tx === null) return; const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) show(at + (d < 0 ? 1 : -1)); tx = null; });

/* ---------- Fade sections in ---------- */
const rio = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); }
}, { threshold: 0.12 });
$$('.headline, .sub, .hero-img, .tile, .wide-media, .mosaic, .reel, .quad, .more-tile, .statement, .job, .st-media, .st-copy, .about-collage, .car-shot').forEach((el) => {
  el.classList.add('reveal'); rio.observe(el);
});

/* ---------- Edit mode: fix the wording in place ----------
   Open http://localhost:8811/?edit with tools/edit_server.py running.
   Click any text and type. Cmd/Ctrl+S writes the change into index.html.
   Without the server, "Save" downloads a new index.html instead. */
const EDIT_SEL = 'main h1, main h2, main h3, main h4, main p:not([data-noedit]), main li, main figcaption, main summary, footer span';
if (new URLSearchParams(location.search).has('edit')) startEdit();

function startEdit() {
  document.body.classList.add('editing');
  $$('.reveal').forEach((el) => el.classList.add('in'));
  const els = $$(EDIT_SEL);
  els.forEach((el, i) => {
    el.dataset.ed = i;
    el.contentEditable = 'true';
    el.spellcheck = true;
    el.dataset.orig = el.innerHTML;
    el.addEventListener('input', () => { el.classList.toggle('changed', el.innerHTML !== el.dataset.orig); status(); });
    // A <summary> (and text inside a link) treats Space as "click", so the space never gets typed.
    // Insert it by hand instead.
    el.addEventListener('keydown', (e) => {
      if (e.key === ' ' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault(); e.stopPropagation();
        document.execCommand('insertText', false, ' ');
      }
    });
    el.addEventListener('keyup', (e) => { if (e.key === ' ') e.preventDefault(); });
  });
  $$('main summary').forEach((s) => s.addEventListener('click', (e) => { if (e.target === s && document.activeElement === s) e.preventDefault(); }));
  $$('main details').forEach((d) => { d.open = true; });
  $$('main a').forEach((a) => a.addEventListener('click', (e) => e.preventDefault()));

  const bar = document.createElement('div');
  bar.className = 'editbar';
  bar.innerHTML = '<span>Edit mode</span><span class="st"></span><button class="alt" data-a="undo">Undo all</button><button data-a="save">Save</button>';
  document.body.appendChild(bar);
  const st = $('.st', bar);
  function status(t) { const n = $$('.changed').length; st.textContent = t || (n ? `${n} changed` : 'no changes'); }
  status();

  async function save() {
    const raw = await (await fetch('index.html', { cache: 'no-store' })).text();
    const doc = new DOMParser().parseFromString(raw, 'text/html');
    const src = [...doc.querySelectorAll(EDIT_SEL)];
    // Match each changed element to the file by its original text, not by position,
    // so a layout change on disk can't put an edit in the wrong place.
    const norm = (h) => h.replace(/\u00a0|&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    const used = new Set();
    let n = 0, lost = 0;
    els.forEach((el) => {
      if (!el.classList.contains('changed')) return;
      const want = norm(el.dataset.orig);
      const j = src.findIndex((x, k) => !used.has(k) && x.tagName === el.tagName && norm(x.innerHTML) === want);
      if (j < 0) { lost++; return; }
      used.add(j);
      src[j].innerHTML = el.innerHTML.replace(/\u00a0/g, ' ').replace(/<br>$/, '');
      n++;
    });
    if (lost) { status(`${lost} edit(s) don't match the file. Copy them, reload, paste.`); return; }
    const html = ('<!doctype html>\n' + doc.documentElement.outerHTML).replace(/\s+<\/body>/, '\n</body>') + '\n';
    try {
      const r = await fetch('/__save', { method: 'POST', headers: { 'Content-Type': 'text/html' }, body: html });
      if (!r.ok) throw new Error(r.status);
      els.forEach((el) => { el.dataset.orig = el.innerHTML; el.classList.remove('changed'); });
      status(`saved ${n}`);
    } catch {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
      a.download = 'index.html'; a.click();
      status('downloaded');
    }
  }
  bar.addEventListener('click', (e) => {
    const a = e.target.dataset.a;
    if (a === 'save') save();
    if (a === 'undo') { els.forEach((el) => { el.innerHTML = el.dataset.orig; el.classList.remove('changed'); }); status(); }
  });
  addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save(); } });
}
