/* Trikaal app: state, storage, bridge, routing, people */
var A = Astronomy, C = makeCore(A), J = makeJyotish(A, C), N = makeAnalysis(A, C, J, KB), S = makeSimple(A, C, J, KB, N, PLAIN), T = makeStory(A, C, J, KB, N, PLAIN, S);
var PN = J.PNAME, SG = J.SIGNS, SG3 = J.SG3, nth = N.nth;
var PCOL = { Su: '#C9762A', Mo: '#5C7CA8', Ma: '#B03A2E', Me: '#2D7A52', Ju: '#B38A1E', Ve: '#8E5BA8', Sa: '#3D4A6B', Ra: '#55525C', Ke: '#7A7680', La: '#B94E1A' };
var AVCOL = ['#26254A', '#B94E1A', '#2D7A52', '#8E5BA8', '#B38A1E', '#5C7CA8', '#B03A2E', '#3D4A6B'];
function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function cap(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }
function $(s) { return document.querySelector(s); }
var DEF_SETTINGS = { ayan: 'lahiri', node: 'mean', dyear: 365.25, style: 'north', meId: null, loc: { name: 'Mumbai', region: 'Maharashtra, India', lat: 19.076, lon: 72.8777, tz: 'Asia/Kolkata' }, key: '', model: 'claude-sonnet-5-5', deep: true };
var DB = { v: 1, people: [], settings: JSON.parse(JSON.stringify(DEF_SETTINGS)), chats: {}, remedies: [] };
var U = { tab: {}, chart: 'D1', style: null, dpath: [], dsys: 'vim', month: 0, kpseg: 'cusps', kpm: 'job', tseg: 'day', dayOff: 0, mpurpose: 'vehicle', mdays: 60, vage: null, ev: null, filter: 'all', open: {} };
var AND = window.Android || null;

/* ---------- storage ---------- */
function load() {
  var t = null;
  try { if (AND && AND.loadState) t = AND.loadState(); } catch (e) { }
  try { if (!t) t = localStorage.getItem('trikaal'); } catch (e) { }
  if (!t) return;
  try { var d = JSON.parse(t); DB.people = d.people || []; DB.chats = d.chats || {}; DB.remedies = d.remedies || []; Object.keys(d.settings || {}).forEach(function (k) { DB.settings[k] = d.settings[k]; }); } catch (e) { }
}
function save() {
  var t = JSON.stringify(DB);
  try { if (AND && AND.saveState) AND.saveState(t); } catch (e) { }
  try { localStorage.setItem('trikaal', t); } catch (e) { }
}
function applySettings() {
  C.setAyanamsa(DB.settings.ayan); C.setNode(DB.settings.node); J.setDashaYear(+DB.settings.dyear || 365.25);
  var off = tzOffsetAt(DB.settings.loc.tz, Date.now()); N.setTZ(off == null ? 5.5 : off);
}
/* ---------- time zones ---------- */
function tzOffsetAt(zone, utcMs) {
  try {
    var f = new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }), p = {};
    f.formatToParts(new Date(utcMs)).forEach(function (x) { p[x.type] = x.value; });
    var asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, (+p.hour) % 24, +p.minute, +p.second);
    return (asUTC - Math.floor(utcMs / 1000) * 1000) / 3600e3;
  } catch (e) { return null; }
}
function zoneOffsetForLocal(zone, date, time) {
  if (!zone || !date) return null;
  var a = date.split('-').map(Number), t = String(time || '12:00').split(':').map(Number), guess = Date.UTC(a[0], a[1] - 1, a[2], t[0] || 0, t[1] || 0, t[2] || 0);
  var o1 = tzOffsetAt(zone, guess); if (o1 == null) return null;
  return tzOffsetAt(zone, guess - o1 * 3600e3);
}
function fmtOff(h) { if (h == null || isNaN(h)) return '–'; var s = h < 0 ? '-' : '+', a = Math.abs(h), hh = Math.floor(a), mm = Math.round((a - hh) * 60); return 'UTC' + s + hh + ':' + (mm < 10 ? '0' : '') + mm; }
function locNow() { return N.dmyt(new Date()); }
function todayStart(off) { var o = tzOffsetAt(DB.settings.loc.tz, Date.now()); o = o == null ? 5.5 : o; var x = new Date(Date.now() + o * 3600e3); return new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate() + (off || 0)) - o * 3600e3); }
function locOff() { var o = tzOffsetAt(DB.settings.loc.tz, Date.now()); return o == null ? 5.5 : o; }

/* ---------- bridge helpers ---------- */
function toast(msg, ms) { var t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(function () { t.remove(); }, ms || 2200); }
function shareText(title, text) {
  try { if (AND && AND.shareText) { AND.shareText(title, text); return; } } catch (e) { }
  if (navigator.share) { navigator.share({ title: title, text: text }).catch(function () { }); return; }
  try { navigator.clipboard.writeText(text); toast('Copied to clipboard'); } catch (e) { toast('Sharing is not available here'); }
}
function saveFile(name, mime, text) {
  try { if (AND && AND.saveFile) { AND.saveFile(name, mime, text); return; } } catch (e) { }
  var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: mime })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 500);
}
window.__fileCb = null;
window.onFileOpened = function (text) { if (window.__fileCb) { var cb = window.__fileCb; window.__fileCb = null; cb(text); } };
function openFile(cb) {
  window.__fileCb = cb;
  try { if (AND && AND.openFile) { AND.openFile(); return; } } catch (e) { }
  var i = document.createElement('input'); i.type = 'file'; i.accept = '.json,application/json';
  i.onchange = function () { var f = i.files[0]; if (!f) return; var r = new FileReader(); r.onload = function () { window.onFileOpened(r.result); }; r.readAsText(f); }; i.click();
}
var HTTP = {}, httpN = 0;
window.__httpCb = function (id, status, text) { var cb = HTTP[id]; delete HTTP[id]; if (cb) cb(status, text); };
function http(method, url, headers, body) {
  return new Promise(function (res, rej) {
    if (AND && AND.http) { var id = 'h' + (++httpN); HTTP[id] = function (st, tx) { if (st === 0) rej(new Error(tx || 'Network error')); else res({ status: st, text: tx }); }; AND.http(id, method, url, JSON.stringify(headers || {}), body || ''); return; }
    fetch(url, { method: method, headers: headers, body: body || undefined }).then(function (r) { return r.text().then(function (t) { res({ status: r.status, text: t }); }); }).catch(rej);
  });
}
function printPage() { try { if (AND && AND.print) { AND.print(document.title); return; } } catch (e) { } window.print(); }

/* ---------- calculation cache ---------- */
var CACHE = {};
function person(id) { return DB.people.filter(function (p) { return p.id === id; })[0] || null; }
function me() { return person(DB.settings.meId) || DB.people[0] || null; }
function calcP(p) {
  var key = [p.id, p.date, p.time, p.tz, p.lat, p.lon, p.gender, DB.settings.ayan, DB.settings.node, DB.settings.dyear].join('|');
  if (!CACHE[key]) { CACHE[key] = N.calc({ name: p.name, date: p.date, time: p.time, tz: +p.tz, lat: +p.lat, lon: +p.lon, gender: p.gender }); CACHE[key].id = p.id; CACHE[key].person = p; }
  return CACHE[key];
}
function birthLine(p) { var a = p.date.split('-').map(Number); return a[2] + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][a[1] - 1] + ' ' + a[0] + ' · ' + String(p.time).slice(0, 5) + ' · ' + (p.place || (+p.lat).toFixed(2) + ', ' + (+p.lon).toFixed(2)); }
function initials(n) { return String(n || '?').split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase(); }
function avColor(id) { var h = 0; String(id).split('').forEach(function (c) { h = (h * 31 + c.charCodeAt(0)) >>> 0; }); return AVCOL[h % AVCOL.length]; }
function ayanShort() { return C.AYAN_INFO[DB.settings.ayan].name.replace(' (Chitrapaksha)', ''); }
function age(p, at) { var b = calcP(p).birth; return Math.floor((at - b) / (365.2564 * 864e5)); }

/* ---------- icons ---------- */
var IC = {
  people: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.3-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M17 14.5c2.4 0 4 1.5 4.6 4"/>',
  kundli: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 3l18 18M21 3L3 21M12 3l9 9-9 9-9-9z"/>',
  today: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
  ask: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8.5 9.5h7M8.5 12.5h4.5"/>',
  more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>', share: '<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v7h14v-7"/>', back: '<path d="M15 5l-7 7 7 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', send: '<path d="M4 12l16-8-6 16-2-7z"/>', star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>', print: '<path d="M7 8V3h10v5M7 17H4v-7h16v7h-3"/><rect x="7" y="14" width="10" height="7"/>',
  chevL: '<path d="M15 5l-7 7 7 7"/>', chevR: '<path d="M9 5l7 7-7 7"/>', search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'
};
function icon(n, w) { return '<svg viewBox="0 0 24 24" ' + (w ? 'style="width:' + w + 'px;height:' + w + 'px" ' : '') + 'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + IC[n] + '</svg>'; }
var LOGO = '<span class="logo"><svg width="17" height="17" viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" fill="none" stroke="#F3B37A" stroke-width="1.4"/><path d="M2 2l12 12M14 2L2 14M8 2l6 6-6 6-6-6z" fill="none" stroke="#F3B37A" stroke-width="1.1"/></svg></span>';

/* ---------- routing ---------- */
var NAVS = [['kundli', 'Kundli'], ['today', 'Today'], ['people', 'People'], ['ask', 'Ask'], ['more', 'More']];
function go(h) { if (location.hash === '#/' + h) render(); else location.hash = '#/' + h; }
function parts() { return location.hash.replace(/^#\/?/, '').split('/').filter(Boolean); }
function render() {
  applySettings();
  var p = parts(), scr = p[0] || (me() ? 'today' : 'people'), html = '', navOn = scr;
  try {
    if (scr === 'p') { var pp = person(p[1]); if (!pp) { go('people'); return; } U.cur = pp.id; html = Hub(pp, p[2] || U.tab[pp.id] || 'report'); navOn = 'kundli'; }
    else if (scr === 'kundli') { var cp = person(U.cur) || me(); if (!cp) { html = PeopleScreen(); navOn = 'people'; } else { go('p/' + cp.id + '/' + (U.tab[cp.id] || 'report')); return; } }
    else if (scr === 'edit') { html = EditScreen(p[1]); navOn = 'people'; }
    else if (scr === 'today') html = TodayScreen(p[1] || U.tseg);
    else if (scr === 'ask') html = AskScreen();
    else if (scr === 'more') html = MoreScreen();
    else html = PeopleScreen();
  } catch (e) { html = '<div class="empty"><h2>Something went wrong</h2>' + esc(e.message) + '<br><br><button class="btn" data-go="people">Back to people</button></div>'; if (window.console) console.error(e); }
  $('#app').innerHTML = html;
  $('#nav').innerHTML = NAVS.map(function (x) { return '<button data-go="' + x[0] + '" class="' + (x[0] === navOn ? 'on' : '') + '">' + icon(x[0]) + x[1] + '</button>'; }).join('');
  document.body.classList.toggle('asking', scr === 'ask');
  var ap = $('#askbar'); if (ap) ap.classList.toggle('hide', scr !== 'ask');
  (U.after || []).forEach(function (f) { try { f(); } catch (e) { } }); U.after = [];
  var on = document.querySelector('.tabs button.on'); if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', inline: 'center' });
}
function rerender(keepScroll) { var y = window.scrollY; render(); if (keepScroll) window.scrollTo(0, y); }
window.addEventListener('hashchange', function () { render(); window.scrollTo(0, 0); });
var ACT = {}, CHG = {}, INP = {};
document.addEventListener('click', function (e) {
  var el = e.target.closest('[data-go],[data-act]'); if (!el) return;
  if (el.dataset.go != null) { e.preventDefault(); go(el.dataset.go); return; }
  var f = ACT[el.dataset.act]; if (f) { e.preventDefault(); f(el, e); }
});
document.addEventListener('change', function (e) { var el = e.target.closest('[data-ch]'); if (el && CHG[el.dataset.ch]) CHG[el.dataset.ch](el, e); });
document.addEventListener('input', function (e) { var el = e.target.closest('[data-in]'); if (el && INP[el.dataset.in]) INP[el.dataset.in](el, e); });
function sheet(html) {
  closeSheet();
  var s = document.createElement('div'); s.className = 'scrim'; s.id = 'scrim';
  s.innerHTML = '<div class="sheet"><div class="grab"></div>' + html + '</div>';
  s.addEventListener('click', function (e) { if (e.target === s) closeSheet(); });
  document.body.appendChild(s); history.pushState({ sheet: 1 }, '');
}
function closeSheet(fromPop) { var s = $('#scrim'); if (s) { s.remove(); if (!fromPop && history.state && history.state.sheet) history.back(); } }
window.addEventListener('popstate', function () { if ($('#scrim')) closeSheet(true); });
ACT.close = function () { closeSheet(); };

/* ---------- small UI pieces ---------- */
function whoCard(p, extra) { return '<div class="who"><div style="min-width:0"><b>' + esc(p.name) + (p.id === DB.settings.meId ? ' <span style="color:var(--acc)">★</span>' : '') + '</b><small>' + esc(birthLine(p)) + '</small></div><div style="display:flex;gap:6px;align-items:center"><span class="pill">' + esc(ayanShort()) + '</span>' + (extra || '') + '</div></div>'; }
function vchip(q, label) { var m = { good: 'g', mixed: 'm', bad: 'b', neutral: 'n' }; return '<span class="vc ' + (m[q] || 'n') + '">' + esc(label || cap(q)) + '</span>'; }
function pg(code, size) { return '<span class="pg" style="background:' + PCOL[code] + (size ? ';width:' + size + 'px;height:' + size + 'px' : '') + '">' + code + '</span>'; }
function sel(name, opts, cur, attrs) { return '<select class="inp" ' + (attrs || '') + ' data-ch="' + name + '">' + opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(cur) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>'; }
function whyBox(lines, open) { lines = (lines || []).filter(Boolean); return lines.length ? '<details class="whyd"' + (open ? ' open' : '') + '><summary>Why</summary><div class="why">' + lines.map(function (l) { return '<div>' + esc(l) + '</div>'; }).join('') + '</div></details>' : ''; }
var VLABEL = { good: 'Good', mixed: 'Mixed', bad: 'Difficult', neutral: 'Info' };
/* plain answer card: o = {verdict, label, headline, meaning, rows: [[title, [lines], kind]]} */
function answerCard(o) {
  var h = '<div class="ans ' + (o.verdict || 'mixed') + '"><div class="row"><span class="lbl">' + esc(o.label || 'In simple words') + '</span>' + (o.chip !== false ? vchip(o.verdict === 'neutral' ? 'neutral' : o.verdict, o.chipText || VLABEL[o.verdict] || 'Mixed') : '') + '</div>';
  h += '<div class="ah">' + esc(o.headline) + '</div>' + (o.meaning ? '<p class="am">' + esc(o.meaning) + '</p>' : '');
  (o.rows || []).forEach(function (r) { var ls = (r[1] || []).filter(Boolean); if (!ls.length) return; h += '<div class="ar ' + (r[2] || '') + '"><b>' + esc(r[0]) + '</b><div>' + ls.map(function (l) { return '<div>' + esc(cap(l)) + '</div>'; }).join('') + '</div></div>'; });
  return h + '</div>';
}
function techBlock(title, inner, open) { return '<details class="tech"' + (open ? ' open' : '') + '><summary>' + esc(title || 'Show the astrology behind this') + '</summary><div class="techin">' + inner + '</div></details>'; }
function logic(lines) { return '<div class="logic">' + lines.map(function (l, i) { return '<div><i>' + (i + 1) + '</i><span>' + l + '</span></div>'; }).join('') + '</div>'; }
function durStr(ms) { var d = ms / 864e5, y = Math.floor(d / 365.25), m = Math.floor((d - y * 365.25) / 30.4375), dd = Math.round(d - y * 365.25 - m * 30.4375); return (y ? y + 'y ' : '') + (m ? m + 'm ' : '') + (y ? '' : dd + 'd'); }
function emptyState(t, s, btn) { return '<div class="empty"><h2>' + t + '</h2><p>' + s + '</p>' + (btn || '') + '</div>'; }

/* ---------- People ---------- */
function PeopleScreen() {
  var list = DB.people.slice().sort(function (a, b) { return (b.id === DB.settings.meId) - (a.id === DB.settings.meId) || a.name.localeCompare(b.name); });
  var h = '<div class="top">' + LOGO + '<span class="ttl">Trikaal</span><span class="sp"></span></div><div class="h1">People</div><div class="sub">' + list.length + ' kundli' + (list.length === 1 ? '' : 's') + ' saved on this phone</div><div class="pad">';
  if (!list.length) h += emptyState('Add your first kundli', 'Enter the date, time and place of birth. Everything is calculated on your phone, to the arc-second.', '<br><button class="btn acc" data-go="edit/new">' + icon('plus', 18) + 'Add kundli</button>');
  list.forEach(function (p) {
    var c = null; try { c = calcP(p); } catch (e) { }
    var line = c ? SG[c.k.ascSign] + ' lagna · ' + SG[c.k.P.Mo.sign] + ' Moon · ' + J.dashaChain(c.maha, new Date(), 2).map(function (x) { return PN[x.lord]; }).join(' › ') : '';
    h += '<button class="prow" data-go="p/' + p.id + '/' + (U.tab[p.id] || 'report') + '"><span class="av" style="background:' + avColor(p.id) + '">' + esc(initials(p.name)) + '</span><div style="min-width:0"><b>' + esc(p.name) + (p.id === DB.settings.meId ? ' <span style="color:var(--acc)">★</span>' : '') + '</b><small>' + esc(birthLine(p)) + '</small><small>' + esc(line) + '</small></div><span class="mut">' + icon('chevR', 18) + '</span></button>';
  });
  return h + '</div><button class="fab" data-go="edit/new">+ New kundli</button>';
}

/* ---------- Add / edit ---------- */
var EDIT = null;
function EditScreen(id) {
  var p = id && id !== 'new' ? person(id) : null;
  if (!EDIT || EDIT._for !== (id || 'new')) EDIT = p ? JSON.parse(JSON.stringify(p)) : { name: '', gender: 'M', date: '', time: '', place: '', lat: '', lon: '', zone: 'Asia/Kolkata', tz: 5.5, manualTz: false, notes: '' };
  EDIT._for = id || 'new';
  var e = EDIT, off = e.manualTz ? +e.tz : zoneOffsetForLocal(e.zone, e.date, e.time);
  var h = '<div class="top"><button class="ib" data-act="editBack">' + icon('back') + '</button><span class="ttl">' + (p ? 'Edit kundli' : 'New kundli') + '</span><span class="sp"></span>' + (p ? '<button class="ib" data-act="delPerson" style="color:var(--bad)">' + icon('trash') + '</button>' : '') + '</div><div class="pad">';
  h += '<label class="field"><span>NAME</span><input class="inp" data-in="ef" data-f="name" value="' + esc(e.name) + '" placeholder="Full name"></label>';
  h += '<div class="field"><span>GENDER</span><div class="seg" style="width:max-content">' + [['M', 'Male'], ['F', 'Female']].map(function (g) { return '<button data-act="egender" data-v="' + g[0] + '" class="' + (e.gender === g[0] ? 'on' : '') + '">' + g[1] + '</button>'; }).join('') + '</div></div>';
  h += '<div class="grid2"><label class="field"><span>DATE OF BIRTH</span><input class="inp" type="date" data-in="ef" data-f="date" value="' + esc(e.date) + '"></label><label class="field"><span>TIME OF BIRTH</span><input class="inp" type="time" step="1" data-in="ef" data-f="time" value="' + esc(e.time) + '"></label></div>';
  h += '<div class="field" style="position:relative"><span>PLACE OF BIRTH</span><div style="display:flex;gap:8px"><input class="inp" id="placeIn" data-in="place" value="' + esc(e.place) + '" placeholder="Type a city" autocomplete="off"><button class="ib" style="width:46px;height:46px" data-act="placeOnline" title="Search online">' + icon('search') + '</button></div><div id="sugg"></div></div>';
  h += '<div class="grid2"><label class="field"><span>LATITUDE (N +, S −)</span><input class="inp mono" inputmode="decimal" data-in="ef" data-f="lat" value="' + esc(e.lat) + '"></label><label class="field"><span>LONGITUDE (E +, W −)</span><input class="inp mono" inputmode="decimal" data-in="ef" data-f="lon" value="' + esc(e.lon) + '"></label></div>';
  h += '<div class="grid2"><label class="field"><span>TIME ZONE</span><input class="inp mono" data-in="ef" data-f="zone" value="' + esc(e.zone) + '" placeholder="Asia/Kolkata"></label><label class="field"><span>UTC OFFSET USED</span><input class="inp mono" inputmode="decimal" data-in="eoff" value="' + (off == null ? '' : off) + '" placeholder="5.5"></label></div>';
  h += '<div class="note" style="margin:-4px 0 12px">' + (e.manualTz ? 'Manual offset ' + fmtOff(+e.tz) + ' is used. Clear the field to go back to the time zone rule.' : 'Offset for that date from the time zone rule: ' + fmtOff(off) + ' (includes historical war time and DST). Type a value to override, for example 5.5 or 4.85 for old Bombay time.') + '</div>';
  h += '<label class="field"><span>NOTES</span><textarea class="inp" data-in="ef" data-f="notes" placeholder="Relation, source of birth time, known events">' + esc(e.notes) + '</textarea></label>';
  h += '<button class="btn acc wide" data-act="savePerson">Save and open kundli</button>';
  if (p) h += '<div style="margin-top:10px"><button class="btn sec wide" data-act="setMe">' + (DB.settings.meId === p.id ? '★ This is me' : 'Mark as me (used for My day)') + '</button></div>';
  return h + '<div style="height:30px"></div></div>';
}
INP.ef = function (el) { EDIT[el.dataset.f] = el.value; if (el.dataset.f === 'date' || el.dataset.f === 'time' || el.dataset.f === 'zone') updOff(); };
INP.eoff = function (el) { if (el.value.trim() === '') { EDIT.manualTz = false; } else { EDIT.manualTz = true; EDIT.tz = parseFloat(el.value); } };
function updOff() { if (EDIT.manualTz) return; var o = zoneOffsetForLocal(EDIT.zone, EDIT.date, EDIT.time), i = document.querySelector('[data-in="eoff"]'); if (i) i.value = o == null ? '' : o; }
ACT.egender = function (el) { EDIT.gender = el.dataset.v; el.parentNode.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b === el); }); };
INP.place = function (el) {
  EDIT.place = el.value; var q = el.value.trim().toLowerCase(), box = $('#sugg'); if (!q) { box.innerHTML = ''; return; }
  var hits = CITIES.filter(function (c) { return c.name.toLowerCase().indexOf(q) === 0; }).concat(CITIES.filter(function (c) { return c.name.toLowerCase().indexOf(q) > 0; })).slice(0, 7);
  U.places = hits;
  box.innerHTML = hits.length ? '<div class="sugg">' + hits.map(function (c, i) { return '<button data-act="pickPlace" data-i="' + i + '"><span>' + esc(c.name) + '</span><small>' + esc(c.region) + '</small></button>'; }).join('') + '</div>' : '<div class="note">Not in the offline list. Tap the search button to look it up online, or enter latitude and longitude.</div>';
};
ACT.pickPlace = function (el) {
  var c = U.places[+el.dataset.i]; EDIT.place = c.name + (c.region ? ', ' + c.region.split(',')[0] : ''); EDIT.lat = c.lat; EDIT.lon = c.lon; EDIT.zone = c.tz; EDIT.manualTz = false;
  rerender(true);
};
ACT.placeOnline = function () {
  var q = ($('#placeIn').value || '').trim(); if (!q) { toast('Type a place first'); return; }
  $('#sugg').innerHTML = '<div class="spin"></div>';
  http('GET', 'https://geocoding-api.open-meteo.com/v1/search?count=8&language=en&format=json&name=' + encodeURIComponent(q.split(',')[0]), {}).then(function (r) {
    var d = JSON.parse(r.text), res = (d.results || []).map(function (x) { return { name: x.name, region: [x.admin1, x.country].filter(Boolean).join(', '), lat: +x.latitude.toFixed(4), lon: +x.longitude.toFixed(4), tz: x.timezone }; });
    U.places = res;
    $('#sugg').innerHTML = res.length ? '<div class="sugg">' + res.map(function (c, i) { return '<button data-act="pickPlace" data-i="' + i + '"><span>' + esc(c.name) + '</span><small>' + esc(c.region) + '</small></button>'; }).join('') + '</div>' : '<div class="note">No match online. Enter latitude and longitude manually.</div>';
  }).catch(function () { $('#sugg').innerHTML = '<div class="note">No internet. Enter latitude, longitude and UTC offset manually.</div>'; });
};
ACT.editBack = function () { EDIT = null; if (history.length > 1) history.back(); else go('people'); };
ACT.savePerson = function () {
  var e = EDIT;
  if (!e.name.trim()) return toast('Enter a name');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date)) return toast('Enter the date of birth');
  if (!/^\d{1,2}:\d{2}/.test(e.time)) return toast('Enter the time of birth');
  var lat = parseFloat(e.lat), lon = parseFloat(e.lon);
  if (isNaN(lat) || isNaN(lon) || Math.abs(lat) > 66 || Math.abs(lon) > 180) return toast('Check latitude and longitude (houses need |latitude| below 66°)');
  var off = e.manualTz ? +e.tz : zoneOffsetForLocal(e.zone, e.date, e.time);
  if (off == null || isNaN(off)) return toast('Enter the UTC offset, for example 5.5');
  var time = e.time.length === 5 ? e.time + ':00' : e.time;
  var rec = { id: e.id || ('p' + Date.now().toString(36)), name: e.name.trim(), gender: e.gender, date: e.date, time: time, place: e.place.trim(), lat: lat, lon: lon, zone: e.zone, tz: off, manualTz: !!e.manualTz, notes: e.notes || '', events: e.events || [], created: e.created || Date.now() };
  var i = DB.people.map(function (p) { return p.id; }).indexOf(rec.id); if (i >= 0) DB.people[i] = rec; else DB.people.push(rec);
  if (!DB.settings.meId) DB.settings.meId = rec.id;
  save(); EDIT = null; U.cur = rec.id; go('p/' + rec.id + '/report');
};
ACT.setMe = function () { DB.settings.meId = EDIT.id; save(); toast('Marked as you. My day uses this kundli.'); rerender(true); };
ACT.delPerson = function () {
  sheet('<div class="pad"><h3 style="font:600 17px var(--sans);margin:6px 0 6px">Delete ' + esc(EDIT.name) + '?</h3><p class="mut" style="margin-bottom:14px">This removes the kundli and its saved events from this phone.</p><div class="grid2"><button class="btn sec" data-act="close">Cancel</button><button class="btn" style="background:var(--bad)" data-act="delYes">Delete</button></div></div>');
};
ACT.delYes = function () { var id = EDIT.id; DB.people = DB.people.filter(function (p) { return p.id !== id; }); if (DB.settings.meId === id) DB.settings.meId = DB.people[0] ? DB.people[0].id : null; delete DB.chats[id]; save(); EDIT = null; closeSheet(true); go('people'); };
