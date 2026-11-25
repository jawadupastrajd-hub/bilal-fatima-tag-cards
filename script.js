/* ==========================================================
   Bilal & Fatima — Wedding Invitation
   Edit CONFIG only; everything else reads from it.
   ========================================================== */
const CONFIG = {
  // Licensed music file, e.g. 'assets/music.mp3'. Leave '' to hide the music button.
  music: 'assets/music.mp3',

  // VENUE LOCATIONS — replace `location` with the exact address or GPS pin, e.g.
  //   'Lubaba Marquee, Canal Road, Faisalabad'   or   '31.4504,73.1350'
  // The map on the page and the "Open in Google Maps" button both use it.
  // While location is empty, a drawn map with "Location pin will be added soon" shows instead.
  // Optional `link`: a Google Maps share link (maps.app.goo.gl/...) for the button only.
  venues: {
    mehndi:  { name: 'Canal Homes',    location: '30.8159375,73.4215625', link: 'https://maps.app.goo.gl/K9ncFjTE76ovcvWB9' },
    shalima: { name: 'Lubaba Marquee', location: '30.8297265,73.4959468', link: 'https://maps.app.goo.gl/sA2DyD49abh244jL6' },
  },

  // Add real wedding photos here. With one image, arrows and dots hide automatically.
  gallery: [
    { src: 'assets/hero.jpg', alt: 'Floral wedding archway' },
  ],

  // Times in Pakistan Standard Time (UTC+05:00). End times are estimates for calendar entries only.
  events: [
    { key: 'mehndi',  title: 'Mehndi',  start: '2027-01-16T18:00:00+05:00', end: '2027-01-16T23:00:00+05:00' },
    { key: 'shalima', title: 'Shalima', start: '2027-01-17T13:00:00+05:00', end: '2027-01-17T17:00:00+05:00' },
  ],
};

const $ = (s, el = document) => el.querySelector(s);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;

/* ---------- Music ---------- */
const soundBtn = $('#sound');
let audio = null;
if (CONFIG.music) {
  audio = new Audio(CONFIG.music);
  audio.loop = true;
  audio.volume = 0.35;
  audio.preload = 'none';
  soundBtn.hidden = false;
  const setPlaying = on => {
    soundBtn.setAttribute('aria-pressed', on);
    soundBtn.setAttribute('aria-label', on ? 'Pause music' : 'Play music');
  };
  audio.addEventListener('play', () => setPlaying(true));
  audio.addEventListener('pause', () => setPlaying(false));
  soundBtn.addEventListener('click', () => (audio.paused ? audio.play().catch(() => {}) : audio.pause()));
}

/* ---------- Opening cover ---------- */
const cover = $('#cover');
const openBtn = $('#openInvite');
let seen = false;
try { seen = sessionStorage.getItem('bf-opened') === '1'; } catch (e) {}

function openInvitation(animate) {
  document.body.classList.add('opened');
  setTimeout(startPetals, animate ? 1800 : 0);
  root.classList.remove('locked');
  try { sessionStorage.setItem('bf-opened', '1'); } catch (e) {}
  if (!animate || reduceMotion) { cover.remove(); return; }
  cover.classList.add('is-leaving');
  cover.addEventListener('animationend', e => { if (e.target === cover) cover.remove(); });
  setTimeout(() => cover.isConnected && cover.remove(), 1600);
}

if (seen) {
  openInvitation(false);
} else {
  root.classList.add('locked');
  openBtn.focus({ preventScroll: true });
  openBtn.addEventListener('click', () => {
    if (audio) audio.play().catch(() => {}); // the tap counts as a user gesture, so music may start here
    openInvitation(true);
  });
}

/* ---------- Sparkles ---------- */
if (!reduceMotion) {
  const layer = $('.sparkles');
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('i');
    p.style.setProperty('--x', `${Math.random() * 100}%`);
    p.style.setProperty('--s', `${2 + Math.random() * 2.5}px`);
    p.style.setProperty('--drift', `${(Math.random() - .5) * 60}px`);
    p.style.setProperty('--duration', `${12 + Math.random() * 12}s`);
    p.style.animationDelay = `-${Math.random() * 20}s`;
    layer.appendChild(p);
  }
}

/* ---------- Falling rose petals ---------- */
function startPetals() {
  if (reduceMotion || document.querySelector('.petals')) return;
  const layer = document.createElement('div');
  layer.className = 'petals';
  layer.setAttribute('aria-hidden', 'true');
  const tones = [['#F6DADF', '#E9B7C1'], ['#F3E3CC', '#E2C696'], ['#F7E6E8', '#DDA3AF'], ['#FFFFFF', '#F1D9DD']];
  const count = innerWidth < 400 ? 10 : 14;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('i');
    const [c1, c2] = tones[i % tones.length];
    p.className = 'petal';
    p.style.cssText = `--x:${Math.random() * 100}%;--w:${9 + Math.random() * 8}px;--t:${13 + Math.random() * 10}s;`
      + `--delay:-${Math.random() * 20}s;--sway:${(Math.random() - .5) * 120}px;--c1:${c1};--c2:${c2}`;
    layer.appendChild(p);
  }
  const blossomTones = [['#F2C9D1', '#D99AA8'], ['#F7E1C8', '#D9B47A'], ['#FFFFFF', '#E2C4CA']];
  for (let i = 0; i < (innerWidth < 400 ? 4 : 6); i++) {
    const f = document.createElement('i');
    const [pf, ps] = blossomTones[i % blossomTones.length];
    f.className = 'petal-flower';
    f.style.cssText = `--x:${Math.random() * 95}%;--w:${14 + Math.random() * 8}px;--t:${16 + Math.random() * 10}s;`
      + `--delay:-${Math.random() * 24}s;--sway:${(Math.random() - .5) * 100}px;--pf:${pf};--ps:${ps}`;
    f.innerHTML = '<svg viewBox="0 0 40 40"><use href="#blossom"/></svg>';
    layer.appendChild(f);
  }
  document.querySelector('.site').appendChild(layer);
}

/* ---------- Countdown ---------- */
const startAt = new Date(CONFIG.events[0].start).getTime();
const endAt = new Date(CONFIG.events[CONFIG.events.length - 1].end).getTime();
const cd = { days: $('#days'), hours: $('#hours'), minutes: $('#minutes'), seconds: $('#seconds') };
let timer;
function tick() {
  const now = Date.now();
  let left = startAt - now;
  if (left <= 0) {
    $('#countdown').hidden = true;
    const done = $('#countdownDone');
    done.hidden = false;
    done.textContent = now < endAt ? 'The celebrations have begun ♥' : 'Thank you for celebrating with us ♥';
    clearInterval(timer);
    return;
  }
  const d = Math.floor(left / 864e5); left %= 864e5;
  const h = Math.floor(left / 36e5);  left %= 36e5;
  const m = Math.floor(left / 6e4);   left %= 6e4;
  const s = Math.floor(left / 1e3);
  const pad = n => String(n).padStart(2, '0');
  [[cd.days, d], [cd.hours, h], [cd.minutes, m], [cd.seconds, s]].forEach(([el, v]) => {
    const t = pad(v);
    if (el.textContent === t) return;
    el.textContent = t;
    if (!reduceMotion) { el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); }
  });
}
tick();
timer = setInterval(tick, 1000);

/* ---------- Gallery (fade, swipe, keyboard) ---------- */
const gallerySection = $('.gallery');
const photo = $('#galleryImage');
const dots = $('#dots');
const pics = CONFIG.gallery;
let current = 0;

function show(i) {
  if (i === current && photo.getAttribute('src') === pics[i].src) return;
  current = (i + pics.length) % pics.length;
  const next = pics[current];
  const swap = () => {
    photo.src = next.src;
    photo.alt = next.alt;
    photo.onload = () => photo.classList.remove('is-fading');
    if (photo.complete) photo.classList.remove('is-fading');
  };
  if (reduceMotion) swap();
  else { photo.classList.add('is-fading'); setTimeout(swap, 450); }
  renderDots();
}
function renderDots() {
  dots.innerHTML = '';
  pics.forEach((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'dot' + (i === current ? ' active' : '');
    b.setAttribute('aria-label', `Photo ${i + 1} of ${pics.length}`);
    if (i === current) b.setAttribute('aria-current', 'true');
    b.addEventListener('click', () => show(i));
    dots.appendChild(b);
  });
}
photo.addEventListener('error', () => { gallerySection.hidden = true; }, { once: true });
if (photo.complete && !photo.naturalWidth) gallerySection.hidden = true;
photo.src = pics[0].src;
photo.alt = pics[0].alt;
if (pics.length < 2) {
  gallerySection.classList.add('single');
} else {
  renderDots();
  $('#prev').addEventListener('click', () => show(current - 1));
  $('#next').addEventListener('click', () => show(current + 1));
  const frame = $('#galleryFrame');
  let x0 = null;
  frame.addEventListener('pointerdown', e => { x0 = e.clientX; });
  frame.addEventListener('pointerup', e => {
    if (x0 === null) return;
    const dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
  });
  frame.tabIndex = 0;
  frame.setAttribute('aria-label', 'Photo gallery, use arrow keys to browse');
  frame.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') show(current + 1);
    if (e.key === 'ArrowLeft') show(current - 1);
  });
}

/* ---------- Save the Date ---------- */
const toUTC = iso => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const venueOf = key => CONFIG.venues[key].name;
const details = 'Bilal Aslam & Fatima Waheed — Wedding Celebrations\n'
  + 'Mehndi: Saturday 16 January 2027, 6:00 PM, Canal Homes\n'
  + 'Shalima: Sunday 17 January 2027, 1:00 PM, Lubaba Marquee';

CONFIG.events.forEach(ev => {
  const url = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
    + '&text=' + encodeURIComponent(`${ev.title} — Bilal & Fatima`)
    + '&dates=' + toUTC(ev.start) + '/' + toUTC(ev.end)
    + '&ctz=Asia/Karachi'
    + '&location=' + encodeURIComponent(CONFIG.venues[ev.key].location || CONFIG.venues[ev.key].name)
    + '&details=' + encodeURIComponent(details);
  const link = $(ev.key === 'mehndi' ? '#gcalMehndi' : '#gcalShalima');
  if (link) link.href = url;
});

$('#icsBtn').addEventListener('click', () => {
  const esc = s => s.replace(/[,;\\]/g, m => '\\' + m).replace(/\n/g, '\\n');
  const stamp = toUTC(new Date().toISOString());
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bilal & Fatima//Wedding//EN', 'CALSCALE:GREGORIAN'];
  CONFIG.events.forEach(ev => lines.push(
    'BEGIN:VEVENT',
    `UID:${ev.key}-2027-bilal-fatima@invitation`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${toUTC(ev.start)}`,
    `DTEND:${toUTC(ev.end)}`,
    `SUMMARY:${esc(ev.title + ' — Bilal & Fatima')}`,
    `LOCATION:${esc(CONFIG.venues[ev.key].location || CONFIG.venues[ev.key].name)}`,
    `DESCRIPTION:${esc(details)}`,
    'END:VEVENT'
  ));
  lines.push('END:VCALENDAR');
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'Bilal-Fatima-Wedding.ics';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  closeMenu();
});

const saveBtn = $('#saveDate');
const menu = $('#saveMenu');
function closeMenu() { menu.hidden = true; saveBtn.setAttribute('aria-expanded', 'false'); }
saveBtn.addEventListener('click', () => {
  const open = menu.hidden;
  menu.hidden = !open;
  saveBtn.setAttribute('aria-expanded', String(open));
  if (open) menu.querySelector('a,button').focus();
});
menu.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
document.addEventListener('click', e => { if (!e.target.closest('.save')) closeMenu(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { closeMenu(); saveBtn.focus(); } });

/* ---------- Google Maps ---------- */
const mapsLink = v => v.link || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(v.location);
const mapsEmbed = v => 'https://maps.google.com/maps?q=' + encodeURIComponent(v.location) + '&z=15&output=embed';

document.querySelectorAll('.map-frame').forEach(frame => {
  const v = CONFIG.venues[frame.dataset.map];
  if (!v.location) return;
  frame.classList.add('has-map');
  const iframe = document.createElement('iframe');
  iframe.src = mapsEmbed(v);
  iframe.title = `Map showing ${v.name}`;
  iframe.loading = 'lazy';
  iframe.referrerPolicy = 'no-referrer-when-downgrade';
  iframe.allowFullscreen = true;
  frame.appendChild(iframe);
});
document.querySelectorAll('.map-btn').forEach(btn => {
  const v = CONFIG.venues[btn.dataset.venue];
  if (!v.location && !v.link) { btn.hidden = true; return; }
  btn.href = mapsLink(v);
  btn.setAttribute('aria-label', `Open ${v.name} in Google Maps`);
});

/* ---------- Corner blossoms on cards ---------- */
document.querySelectorAll('.panel, .venue-card').forEach(card => {
  ['tl', 'br'].forEach(pos => card.insertAdjacentHTML('beforeend',
    `<svg class="card-bloom ${pos}" viewBox="0 0 40 40" aria-hidden="true"><use href="#blossom"/></svg>`));
});

/* ---------- Scroll reveal with stagger ---------- */
document.querySelectorAll('.timeline .event, #venue .venue-card, .countdown > div')
  .forEach(el => el.style.setProperty('--i', [...el.parentNode.children].indexOf(el)));

const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reduceMotion) {
  const io = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); }
  }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('visible'));
}

/* ---------- Tag details dialog ---------- */
const tagDialog = $('#tagDialog');
if (tagDialog) {
  const tagInfo = {
    mehndi: { day: 'Saturday', date: '16 January 2027', time: '6:00 PM', blurb: 'Join us for an evening of mehndi and celebration.' },
    shalima: { day: 'Sunday', date: '17 January 2027', time: '1:00 PM', blurb: 'Join us for the Shalima in the afternoon.' },
  };
  function openTag(key) {
    const ev = CONFIG.events.find(e => e.key === key);
    const venue = CONFIG.venues[key];
    const info = tagInfo[key];
    if (!ev || !venue || !info) return;
    $('#tagDialogName').textContent = ev.title;
    $('#tagDialogDay').textContent = info.day;
    $('#tagDialogDate').textContent = info.date;
    $('#tagDialogTime').textContent = info.time;
    $('#tagDialogBlurb').textContent = info.blurb;
    $('#tagDialogVenue').textContent = venue.name;
    $('#tagMaps').href = venue.link || ('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(venue.location));
    const gcal = $(key === 'mehndi' ? '#gcalMehndi' : '#gcalShalima');
    if (gcal && gcal.href) $('#tagCal').href = gcal.href;
    tagDialog.showModal();
  }
  document.querySelectorAll('.tg').forEach(btn => {
    btn.addEventListener('click', () => openTag(btn.dataset.event));
  });
  $('#tagClose').addEventListener('click', () => tagDialog.close());
  tagDialog.addEventListener('click', e => { if (e.target === tagDialog) tagDialog.close(); });
}
