/* Trikaal 4.0 screens: Today (home), Sky now (current transit chart), Kundli home, Health home, problem page top.
   Every verdict on these screens comes from the one judge (JUDGE), with its reasons and a confidence level. */
NAVS = [['today', 'Today'], ['astro', 'Kundli'], ['medical', 'Health'], ['remedies', 'Remedies'], ['ai', 'Ask']];
IC.medical = '<path d="M12 20s-7-4.4-7-9.500A4 4 0 0 1 12 8a4 4 0 0 1 7 2.500C19 15.600 12 20 12 20z"/><path d="M8.500 12h2l1-2 1.500 4 1-2h1.500"/>';
IC.remedies = '<path d="M12 3c2 3 5 5 5 9a5 5 0 0 1-10 0c0-4 3-6 5-9z"/>';
IC.today = '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>';
var V4I = {
  moon: '<path d="M20 14.500A8 8 0 1 1 9.500 4a6.500 6.500 0 0 0 10.500 10.500z"/>', star: '<path d="M12 3l2.500 5.600 6 .7-4.500 4.100 1.300 6L12 16.400 6.700 19.400l1.300-6-4.500-4.100 6-.7z"/>', clock: '<circle cx="12" cy="12" r="8.500"/><path d="M12 7.500V12l3 2"/>',
  sun: IC.today, cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M8 3v4M16 3v4"/>', orbit: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8.500"/><circle cx="19" cy="7" r="1.300"/>',
  bars: '<path d="M4 7h10M4 12h16M4 17h7"/>', doc: '<path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h7"/>', heart: '<path d="M12 20s-7-4.400-7-9.500A4 4 0 0 1 12 8a4 4 0 0 1 7 2.500C19 15.600 12 20 12 20z"/>', book: '<path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z"/><path d="M9 9h6M9 13h6"/>',
  scale: '<path d="M12 4v16M5 8h14M5 8l-2 6h4zM19 8l-2 6h4zM8 20h8"/>', time: '<circle cx="12" cy="13" r="7"/><path d="M12 9v4l2.500 1.500M9 3h6"/>', flag: '<path d="M6 21V4h11l-2 4 2 4H6"/>', steth: '<path d="M6 3v6a4 4 0 0 0 8 0V3M10 13v3a4 4 0 0 0 8 0v-2"/><circle cx="18" cy="12" r="2"/>' };
function v4i(n) { return '<svg viewBox="0 0 24 24">' + (V4I[n] || '') + '</svg>'; }
function v4chip(k, t) { return '<span class="v4chip ' + k + '">' + esc(t) + '</span>'; }
var V4MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function v4conf(cf, what) {
  var w = cf.level === 'high' ? 'High confidence' : cf.level === 'medium' ? 'Medium confidence' : 'Low confidence';
  return '<div class="v4conf ' + cf.level + '"><b>' + w + '</b><span>' + cf.agree + ' of ' + cf.of + ' signals point this way' + (cf.level === 'low' ? '. Treat this ' + (what || 'reading') + ' as a rough guide.' : '.') + '</span></div>';
}
function v4why(fs) { return '<ul class="v4why">' + fs.map(function (f) { return '<li class="' + (f.v > 0.15 ? 'p' : f.v < -0.15 ? 'n' : 'z') + '"><i>' + (f.v > 0.15 ? '+' : f.v < -0.15 ? '−' : '•') + '</i><span>' + (f.title ? '<b>' + esc(f.title) + '.</b> ' : '') + esc(f.t) + '</span></li>'; }).join('') + '</ul>'; }

/* old "My day" areas now read from the same judge */
areaRatings = function (c, D) {
  var out = {}; JUDGE.areas(c, D.score.j, D.tr).forEach(function (a) { out[a.id === 'family' ? 'rel' : a.id] = { r: a.k === 'g' ? 'good' : a.k === 'b' ? 'bad' : 'ok', s: a.pct, line: a.line, why: a.why }; }); return out;
};

/* ---------- Today ---------- */
function v4arc(pc, good, bad, now) {
  var r = pc.rise.getTime(), st = pc.set.getTime(), R = 150;
  function T(d) { return Math.max(0, Math.min(1, (d.getTime() - r) / (st - r))); }
  function pt(t, rad) { var a = Math.PI * (1 - t); return [165 + rad * Math.cos(a), 172 - rad * Math.sin(a)]; }
  function seg(a, b, col, w) { var p = pt(a, R), q = pt(b, R); return b > a ? '<path d="M' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + 'A' + R + ' ' + R + ' 0 0 1 ' + q[0].toFixed(1) + ' ' + q[1].toFixed(1) + '" stroke="' + col + '" stroke-width="' + w + '" fill="none" stroke-linecap="round"/>' : ''; }
  var s = '<svg viewBox="0 0 330 190">' + seg(0, 1, 'rgba(255,255,255,.16)', 5);
  for (var i = 1; i < 12; i++) { var p = pt(i / 12, 150), q = pt(i / 12, 141); s += '<path d="M' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + 'L' + q[0].toFixed(1) + ' ' + q[1].toFixed(1) + '" stroke="rgba(255,255,255,.25)" stroke-width="1"/>'; }
  good.forEach(function (g) { s += seg(T(g.start), T(g.end), '#5FD39C', 7); }); bad.forEach(function (g) { s += seg(T(g.start), T(g.end), '#FF7B6E', 7); });
  if (now && now > pc.rise && now < pc.set) { var n = pt(T(now), R); s += '<circle cx="' + n[0].toFixed(1) + '" cy="' + n[1].toFixed(1) + '" r="15" fill="#D4A03A" opacity=".28"/><circle cx="' + n[0].toFixed(1) + '" cy="' + n[1].toFixed(1) + '" r="8" fill="#F0CF86" stroke="#fff" stroke-width="2"/>'; }
  return s + '<path d="M8 172H322" stroke="rgba(255,255,255,.22)" stroke-width="1"/></svg>';
}
function v4stars(n, seed) { var r = seed || 7, s = '<svg class="v4stars" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">'; for (var i = 0; i < n; i++) { r = (r * 9301 + 49297) % 233280; var x = r / 233280 * 400; r = (r * 9301 + 49297) % 233280; var y = r / 233280 * 300; r = (r * 9301 + 49297) % 233280; s += '<circle cx="' + x.toFixed(0) + '" cy="' + y.toFixed(0) + '" r="' + (0.5 + r / 233280).toFixed(1) + '" fill="#fff" opacity="' + (0.15 + r / 233280 * 0.4).toFixed(2) + '"/>'; } return s + '</svg>'; }
var V4WK = {};
function v4week(p, c) {
  var L = DB.settings.loc, key = p.id + '|' + p.time + '|' + dkey(new Date()) + '|' + L.lat + '|' + DB.settings.ayan; if (V4WK.k === key) return V4WK.v;
  var out = []; for (var i = 0; i < 7; i++) { var d0 = todayStart(i), pl = J.panchangLite(d0, L.lat, L.lon), wd = new Date(pl.rise.getTime() + locOff() * 3600e3).getUTCDay(), j = N.dayScore(c, pl, wd).j; out.push({ i: i, wd: wd, pct: j.pct, word: j.word, k: j.k }); }
  V4WK = { k: key, v: out }; return out;
}
function v4fmt(d) { return N.hm(d).replace(/^0/, ''); }
function TodayV4() {
  var p = curP(); if (!p) return '<div class="v4sky"><div class="v4top"><div class="dt">Trikaal</div></div><h1 class="v4h1" style="margin:30px 0 8px">Your day, from your own chart</h1><p class="v4lead" style="text-align:left;margin:0 0 18px">Add your birth details once. Everything is calculated on your phone.</p><button class="v4btn brass" data-go="edit/new">Add my kundli</button></div>';
  var c = calcP(p), L = DB.settings.loc, off = U.dayOff || 0, now = new Date(), d0 = todayStart(off), D = N.myDay(c, d0, L.lat, L.lon, off ? new Date(d0.getTime() + 10 * 3600e3) : now), pc = D.pc, jd = D.score.j, ar = JUDGE.areas(c, jd, D.tr), n1 = p.name.split(' ')[0];
  var dl = new Date(pc.rise.getTime() + locOff() * 3600e3), wk = v4week(p, c), kid = bkKid(p);
  if (kid) { var KT = { work: ['Studies', ['Sharp focus: good for tests and new topics.', 'A normal study day; short breaks help.', 'Attention wanders; keep study blocks short and revise old topics.']], money: ['Play', ['Lots of energy for play and friends.', 'Normal play and friends.', 'Can get cranky with friends; keep play calm.']], family: ['Family', ['Affectionate and cooperative at home.', 'Normal at home.', 'May be stubborn or tearful; be patient.']], mind: ['Mood', ['Cheerful and calm.', 'Mood goes up and down.', 'Can feel low or clingy; extra cuddles and an early night.']] };
    ar.forEach(function (a) { var t = KT[a.id]; if (t) { a.t = t[0]; a.line = t[1][a.k === 'g' ? 0 : a.k === 'm' ? 1 : 2]; if (a.word === 'Routine') a.word = 'Normal'; } }); }
  var best = ar.slice().sort(function (a, b) { return b.pct - a.pct; })[0], worst = ar.slice().sort(function (a, b) { return a.pct - b.pct; })[0], top = wk.slice().sort(function (a, b) { return b.pct - a.pct; })[0];
  var lead = (jd.mixed ? 'Signals pull both ways today, so there is no clear push. ' : '') + (best.k === 'g' ? 'Good for ' + best.t.toLowerCase() + (kid ? '. ' : ' matters. ') : jd.k === 'b' ? 'A day to go gently. ' : 'An ordinary day: routine work goes fine. ') + (worst.k === 'b' ? ({ mind: 'Keep the mind calm. ', health: 'Look after your health. ' }[worst.id] || 'Go easy on ' + worst.t.toLowerCase() + '. ') : '') + (!off && top.i > 0 && top.pct >= jd.pct + 10 ? 'Keep big moves for ' + J.VARAS[top.wd] + ', your best day this week.' : !off && top.i === 0 && jd.k === 'g' ? 'This is your best day this week: use it.' : '');
  var good = (D.best || []).slice(0, 3), g1 = good[0], rahu = D.parts.rahu;
  var h = '<div class="v4sky">' + v4stars(70) + '<div class="v4top"><button class="v4nav" data-act="dayOff" data-v="-1">‹</button><div class="dt"><b>' + J.VARAS[jd.wd].slice(0, 3) + ', ' + dl.getUTCDate() + ' ' + V4MON[dl.getUTCMonth()] + '</b>' + (off ? '<button data-act="dayOff" data-v="0">Back to today</button>' : '') + '</div><button class="v4nav" data-act="dayOff" data-v="1">›</button><span class="sp"></span><button class="v4pill" data-act="pickPerson">' + esc(n1) + ' ▾</button><button class="v4gear" data-go="more" aria-label="Settings">' + icon('gear', 18) + '</button></div>';
  h += '<div class="v4arc">' + v4arc(pc, good, [rahu], off ? null : now) + '<div class="v4score"><div class="n">' + jd.pct + '<small>/100</small></div><div class="w ' + jd.k + '">' + esc(jd.word) + '</div></div></div>';
  h += '<div class="v4ends"><span>Sunrise ' + v4fmt(pc.rise) + '</span><span>Sunset ' + v4fmt(pc.set) + '</span></div><p class="v4lead">' + esc(lead) + '</p>';
  h += '<div class="v4wins">' + (g1 ? '<div><i style="background:#5FD39C"></i>Best ' + v4fmt(g1.start) + ' to ' + v4fmt(g1.end) + '</div>' : '') + '<div><i style="background:#FF7B6E"></i>Avoid ' + v4fmt(rahu.start) + ' to ' + v4fmt(rahu.end) + '</div></div>';
  h += v4conf(jd.conf, 'day') + '</div>';
  /* quick links */
  h += '<div class="v4quick"><button data-go="sky">' + v4i('orbit') + 'Sky now</button><button data-go="panchang">' + v4i('cal') + 'Panchang</button><button data-go="today/day">' + v4i('time') + 'Hour plan</button><button data-go="today/muhurat">' + v4i('flag') + 'Muhurat</button></div>';
  /* week */
  h += '<div class="v4sec"><h2>Your week</h2><span>tap a day</span></div><div class="v4card"><div class="v4week">' + wk.map(function (d) { var col = d.pct >= 68 ? 'var(--good)' : d.pct >= 56 ? '#7FBF96' : d.pct < 45 ? '#E79B92' : 'var(--brass)'; return '<button data-act="v4day" data-v="' + d.i + '" class="' + (d.i === off ? 'on' : '') + '"><span class="wb" style="height:' + Math.round(Math.max(18, 8 + (d.pct - 15) * 1.05)) + 'px;background:' + col + '"><em>' + d.pct + '</em></span>' + (d.i === 0 ? 'Today' : J.VARAS[d.wd].slice(0, 3)) + '</button>'; }).join('') + '</div></div>';
  /* what is different */
  var daily = jd.factors.filter(function (f) { return f.daily && Math.abs(f.v) > 0.15; }).sort(function (a, b) { return Math.abs(b.v * b.w) - Math.abs(a.v * a.w); }).slice(0, 3), ICN = { tara: 'star', cb: 'moon', mh: 'moon', bav: 'orbit', vara: 'sun', tithi: 'cal', nak: 'star', yk: 'flag', sd: 'clock', ghatak: 'flag' };
  h += '<div class="v4sec"><h2>What is different ' + (off ? 'that day' : 'today') + '</h2></div><div class="v4card">' + daily.map(function (f) { return '<div class="v4row"><div class="gl ' + (f.v > 0 ? 'p' : 'n') + '">' + v4i(ICN[f.id] || 'star') + '</div><div><b>' + esc(f.title) + '</b><p>' + esc(f.t) + '</p></div></div>'; }).join('') +
    '<details class="v4det"><summary>See all ' + jd.factors.length + ' factors behind this score</summary>' + v4why(jd.factors) + '<p class="v4note">Green + pushes the score up, red − pulls it down. The score is the weighted balance of all of them, so no single factor decides the day.</p></details></div>';
  /* areas */
  h += '<div class="v4sec"><h2>Five areas ' + (off ? '' : 'today') + '</h2></div><div class="v4card">' + ar.map(function (a) { var col = a.k === 'g' ? 'var(--good)' : a.k === 'b' ? 'var(--bad)' : 'var(--brass)'; return '<details class="v4meter"><summary><b>' + a.t + '</b><span class="track"><i style="width:' + a.pct + '%;background:' + col + '"></i></span><em class="' + a.k + '">' + a.word + '</em></summary><p>' + esc(a.line) + (a.why.length ? ' <span>Why: ' + esc(a.why.join('; ')) + '.</span>' : '') + '</p></details>'; }).join('') + '</div>';
  /* do / avoid */
  h += '<div class="v4two"><div class="g"><b>Do ' + (off ? '' : 'today') + '</b><p>' + esc(best.k !== 'b' ? best.line : 'Finish pending routine work.') + (g1 ? ' Best window: ' + v4fmt(g1.start) + ' to ' + v4fmt(g1.end) + '.' : '') + '</p></div><div class="b"><b>Avoid ' + (off ? '' : 'today') + '</b><p>Starting anything new from ' + v4fmt(rahu.start) + ' to ' + v4fmt(rahu.end) + ' (Rahu Kaal).' + (worst.k === 'b' ? ' ' + esc(worst.line) : '') + '</p></div></div>';
  /* remedy */
  if (!off) {
    var dr = DAY_REMEDY[jd.wd], rk = p.id + '|' + dkey(now), done = (DB.dayRem || {})[rk], act = (DB.remedies || []).filter(function (r) { return r.pid === p.id && r.plan40 && r.until >= dkey(now); })[0], dn = act ? Math.min(40, Math.floor((new Date(dkey(now)) - new Date(act.from)) / 864e5) + 1) : 0;
    h += '<div class="v4card"><div class="v4row"><button class="v4tick' + (done ? ' on' : '') + '" data-act="v4rem" aria-label="Done"></button><div style="flex:1"><b>Today\'s small remedy</b><p>' + esc(dr[1]) + '</p>' + (act ? '<div class="v4prog"><i style="width:' + (dn / 40 * 100) + '%"></i></div><p class="sm">Day ' + dn + ' of your 40-day plan</p>' : '') + '</div></div><button class="v4link" data-go="remedies">All remedies and daily habits ›</button></div>';
    /* AI message */
    if (hasAI() && typeof briefCard === 'function') { h += briefCard(p).replace('Today for ' + esc(n1), 'Today\'s message for ' + esc(n1)); U.after = (U.after || []).concat([function () { briefLoad(p); }]); }
    /* was yesterday right */
    var yk = dkey(new Date(now.getTime() - 864e5)), TR = ((DB.track || {})[p.id]) || {}, ks = Object.keys(TR), hit = ks.filter(function (x) { return TR[x].fb === 1; }).length;
    if (!TR[yk]) { var y0 = todayStart(-1), ypl = J.panchangLite(y0, L.lat, L.lon), ywd = new Date(ypl.rise.getTime() + locOff() * 3600e3).getUTCDay(), yj = N.dayScore(c, ypl, ywd).j;
      h += '<div class="v4card v4fb"><b>Was yesterday right?</b><p>The app said: ' + esc(yj.word) + ' (' + yj.pct + '/100). Your answer builds ' + esc(n1) + '\'s own accuracy record.</p><div><button data-act="v4fb" data-v="1" data-p="' + yj.pct + '">Yes, it matched</button><button data-act="v4fb" data-v="0" data-p="' + yj.pct + '">No, it did not</button></div></div>'; }
    if (ks.length) h += '<p class="v4rec">Your record so far: ' + hit + ' of ' + ks.length + ' days matched (' + Math.round(hit / ks.length * 100) + '%).</p>';
  }
  return h + '<div style="height:70px"></div>';
}
ACT.v4day = function (el) { U.dayOff = +el.dataset.v; rerender(true); };
ACT.v4rem = function () { var p = curP(), k = p.id + '|' + dkey(new Date()); DB.dayRem = DB.dayRem || {}; if (DB.dayRem[k]) delete DB.dayRem[k]; else DB.dayRem[k] = 1; var ks = Object.keys(DB.dayRem); if (ks.length > 120) ks.slice(0, ks.length - 120).forEach(function (x) { delete DB.dayRem[x]; }); save(); rerender(true); };
ACT.v4fb = function (el) { var p = curP(), k = dkey(new Date(Date.now() - 864e5)); DB.track = DB.track || {}; var T = (DB.track[p.id] = DB.track[p.id] || {}); T[k] = { fb: +el.dataset.v, pct: +el.dataset.p }; var ks = Object.keys(T).sort(); if (ks.length > 400) ks.slice(0, ks.length - 400).forEach(function (x) { delete T[x]; }); save(); toast('Saved. Thank you'); rerender(true); };

/* ---------- Sky now: the current transit chart, one tap away ---------- */
function SkyNow() {
  var p = curP(); if (!p) return topBar('Sky now', { noPerson: true }) + noPerson();
  var c = calcP(p), k = c.k, off = U.skyOff || 0, at = new Date(Date.now() + off * 864e5), base = U.skyBase === 'MO' ? k.P.Mo.sign : k.ascSign, tr = N.transitAt(c, at), n1 = p.name.split(' ')[0];
  var signs = []; for (var i = 0; i < 12; i++) signs.push((base + i) % 12);
  var rows = [{ h: J.houseFrom(base, k.ascSign), code: U.skyBase === 'MO' ? 'La' : 'Asc', deg: '', cls: 'asc' }].concat(tr.map(function (x) { return { h: J.houseFrom(base, x.sign), code: x.code, deg: J.dm(x.lon), r: x.retro && x.code !== 'Ra' && x.code !== 'Ke', cls: x.verdict === 'bad' ? 'bad' : x.code === 'Mo' ? 'mo' : '' }; }));
  var h = '<div class="v4sky slim">' + v4stars(50, 11) + '<div class="v4top"><button class="v4nav" data-go="today">‹</button><div class="dt"><b>Sky ' + (off ? 'on ' + N.dmy(at) : 'now') + '</b><small>Planets today, placed in ' + esc(n1) + '\'s houses</small></div><span class="sp"></span><button class="v4pill" data-act="pickPerson">' + esc(n1) + ' ▾</button></div>';
  h += '<div class="v4skych">' + Charts.north(rows, signs) + '</div><div class="v4cchips">' + [[0, 'Now'], [30, '+1 month'], [91, '+3 months'], [183, '+6 months'], [365, '+1 year']].map(function (x) { return '<button data-act="skyOff" data-v="' + x[0] + '" class="' + (x[0] === off ? 'on' : '') + '">' + x[1] + '</button>'; }).join('') + '</div>';
  h += '<div class="v4cchips" style="margin-top:8px"><button data-act="skyBase" data-v="LA" class="' + (U.skyBase !== 'MO' ? 'on' : '') + '">Houses from lagna</button><button data-act="skyBase" data-v="MO" class="' + (U.skyBase === 'MO' ? 'on' : '') + '">Houses from Moon</button></div></div>';
  var g = tr.filter(function (x) { return x.verdict === 'good' && x.code !== 'Mo'; }), b = tr.filter(function (x) { return x.verdict === 'bad' && x.code !== 'Mo'; }), ss = N.sadeSati(c, at);
  h += '<div class="v4card" style="margin-top:14px"><div class="v4row"><div><b class="g">Helping ' + (off ? 'then' : 'now') + '</b><p>' + (g.length ? g.map(function (x) { return PN[x.code]; }).join(', ') : 'No slow planet is clearly helping') + '</p></div></div><div class="v4row"><div><b class="w">Testing ' + (off ? 'then' : 'now') + '</b><p>' + (b.length ? b.map(function (x) { return PN[x.code]; }).join(', ') : 'No planet is clearly against you') + '</p></div></div><div class="v4row"><div><b>Saturn</b><p>' + esc(ss.label) + (ss.tip ? '. ' + esc(ss.tip) : ss.good ? '. ' + esc(ss.good) : '') + '</p></div></div></div>';
  h += '<div class="v4sec"><h2>Each planet, in plain words</h2><span>tap for why</span></div><div class="v4card">' + tr.map(function (x) {
    return '<details class="v4pl"><summary><span class="pt" style="background:' + PCOL[x.code] + '">' + x.code + '</span><div><b>' + PN[x.code] + ' in ' + J.SIGNS[x.sign] + (x.retro && x.code !== 'Ra' && x.code !== 'Ke' ? ' (retrograde)' : '') + '</b><small>your ' + N.nth(x.h) + ' house, ' + N.nth(x.m) + ' from your Moon</small></div>' + v4chip(x.verdict === 'good' ? 'g' : x.verdict === 'bad' ? 'b' : 'w', x.verdict === 'good' ? 'Good' : x.verdict === 'bad' ? 'Careful' : 'Mixed') + '</summary><p>' + esc(cap1(x.text)) + '.</p><ul class="v4why">' + x.why.map(function (w) { return '<li class="z"><i>•</i><span>' + esc(w) + '</span></li>'; }).join('') + '</ul></details>'; }).join('') + '</div>';
  var ing = []; [['Ma', 90], ['Ju', 420], ['Sa', 1000], ['Ra', 600]].forEach(function (x) { try { var d = J.nextIngress(x[0], at, x[1]); if (d) ing.push({ code: x[0], d: d, sign: J.signOf(C.sidereal(x[0], new Date(d.getTime() + 36e5))) }); } catch (e) { } });
  if (ing.length) h += '<div class="v4sec"><h2>Next big moves</h2></div><div class="v4card">' + ing.sort(function (a, b) { return a.d - b.d; }).map(function (x) { var hh = J.houseFrom(k.ascSign, x.sign), mm = J.houseFrom(k.P.Mo.sign, x.sign), gd = KB.GOCHAR_GOOD[x.code].indexOf(mm) >= 0; return '<div class="v4row"><span class="pt" style="background:' + PCOL[x.code] + '">' + x.code + '</span><div style="flex:1"><b>' + PN[x.code] + ' enters ' + J.SIGNS[x.sign] + ' on ' + N.dmy(x.d) + '</b><p>Your ' + N.nth(hh) + ' house, ' + N.nth(mm) + ' from your Moon: ' + esc(KB.GOCHAR[x.code][mm]) + '.</p></div>' + v4chip(gd ? 'g' : 'w', gd ? 'Good' : 'Care') + '</div>'; }).join('') + '</div>';
  h += '<button class="v4btn out" data-go="p/' + p.id + '/transit">Month-by-month transits ›</button>';
  U.shareFn = function () { return 'Sky now for ' + p.name + '\n' + tr.map(function (x) { return PN[x.code] + ': ' + J.SIGNS[x.sign] + ', house ' + x.h + ' (' + x.verdict + ')'; }).join('\n'); };
  return h + '<div style="height:70px"></div>';
}
ACT.skyOff = function (el) { U.skyOff = +el.dataset.v; rerender(true); };
ACT.skyBase = function (el) { U.skyBase = el.dataset.v; rerender(true); };

/* ---------- Kundli home ---------- */
var AstroV3 = AstroV2;
AstroV2 = function (id) {
  var p = curP(); if (!p) return AstroV3(id);
  var c = calcP(p), k = c.k, now = new Date(), n1 = p.name.split(' ')[0]; id = id || U.chart || 'D1'; if (!/^(D\d+|CH|MO|SU|ALL)$/.test(id)) id = 'D1'; U.chart = id;
  var old = AstroV3(id), style = U.style || DB.settings.style;
  var h = '<div class="v4sky slim">' + v4stars(60, 3) + '<div class="v4top"><div class="dt"><b class="nm">' + esc(p.name) + '</b><small>' + SG[k.ascSign] + ' lagna, ' + SG[k.P.Mo.sign] + ' Moon, ' + esc(k.P.Mo.nak.name) + ' star</small></div><span class="sp"></span><button class="v4pill" data-act="pickPerson">' + esc(n1) + ' ▾</button><button class="v4gear" data-go="more" aria-label="Settings">' + icon('gear', 18) + '</button></div>';
  if (id !== 'ALL') { var m = chartModel(c, id); h += '<div class="v4skych">' + drawChart(m, style) + '</div><div class="v4cap"><span>' + esc(m.title) + '</span><button data-act="cstyle" data-v="' + (style === 'south' ? 'north' : 'south') + '">' + (style === 'south' ? 'North style' : 'South style') + '</button></div>'; }
  h += '<div class="v4cchips">' + [['D1', 'Birth chart'], ['D9', 'Navamsa'], ['D10', 'Career'], ['MO', 'Moon'], ['CH', 'Chalit'], ['ALL', 'All 16']].map(function (x) { return '<button data-go="astro/' + x[0] + '" class="' + (x[0] === id ? 'on' : '') + '">' + x[1] + '</button>'; }).join('') + '</div></div>';
  if (id === 'ALL') { var gi = old.indexOf('<div class="mgrid">'), ge = old.indexOf('<div class="card v2list">'); if (gi > 0) h += '<div class="pad" style="padding-top:14px">' + old.slice(gi, ge > gi ? ge : undefined) + '</div>'; }
  /* running now / next */
  var md = J.find(c.maha, now), subs = md ? J.subPeriods(md) : [], ad = md ? J.find(subs, now) : null;
  if (md && ad) { var v = JUDGE.period(c, md.lord, ad.lord), ix = subs.indexOf(ad), nx = subs[ix + 1], nmd = c.maha[c.maha.indexOf(md) + 1], nv = nx ? JUDGE.period(c, md.lord, nx.lord) : nmd ? JUDGE.period(c, nmd.lord) : null;
    h += '<div class="v4card" style="margin-top:14px"><button class="v4row tap" data-go="dasha"><div style="flex:1"><p>Running now</p><b class="big">' + PN[md.lord] + ', then ' + PN[ad.lord] + '</b><p>till ' + N.dmy(ad.end) + '. ' + esc(v.tip) + '</p></div>' + v4chip(v.v === 'g' ? 'g' : v.v === 'b' ? 'b' : 'w', v.word) + '</button>' +
      (nv ? '<button class="v4row tap" data-go="dasha"><div style="flex:1"><p>Coming next</p><b class="big">' + (nx ? PN[md.lord] + ', then ' + PN[nx.lord] : PN[nmd.lord] + ' Mahadasha') + '</b><p>from ' + N.dmy(nx ? nx.start : nmd.start) + '. ' + esc(nv.tip) + '</p></div>' + v4chip(nv.v === 'g' ? 'g' : nv.v === 'b' ? 'b' : 'w', nv.word) + '</button>' : '') +
      '<details class="v4det"><summary>Why the app says ' + v.word.toLowerCase() + ' for the current period</summary>' + v4why(v.factors) + v4conf(v.conf, 'period') + '</details></div>'; }
  /* three lines */
  var ps = J.PC.map(function (x) { return JUDGE.planet(c, x); }), st = ps.filter(function (x) { return x.word === 'Strong'; }), wkp = ps.filter(function (x) { return x.word === 'Weak'; }), hs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (hh) { return BOOK.house(c, hh, bkSb); }), hg = hs.filter(function (x) { return x.v === 'g'; }), hb = hs.filter(function (x) { return x.v === 'b'; });
  var a = KA.analyze(c, now), yg = a.yogas.filter(function (y) { return y.good && !/weak|cancelled|reduced/.test(y.name); }), yd = a.yogas.filter(function (y) { return !y.good || /weak|reduced/.test(y.name); }), nm = function (arr, f) { return arr.map(f).join(', '); }, lw = function (x) { return x.name.split(' and ')[0].toLowerCase(); };
  var rj = yg.filter(function (y) { return /Raja yoga/.test(y.name); }).length, others = N.uniq(yg.filter(function (y) { return !/^Raja yoga/.test(y.name); }).map(function (y) { return y.name; })).slice(0, 3);
  h += '<div class="v4sec"><h2>The chart in three lines</h2></div><div class="v4card"><button class="v4row tap" data-go="p/' + p.id + '/know"><div><b class="g">Working for ' + (relOf(p) === 'me' ? 'you' : esc(n1)) + '</b><p>' + (st.length ? nm(st, function (x) { return PN[x.code]; }) + (st.length > 1 ? ' are' : ' is') + ' strong. ' : 'No planet is clearly strong. ') + (hg.length ? cap1(nm(hg.slice(0, 3), lw)) + ' ' + (hg.length > 1 ? 'are' : 'is') + ' supported.' : '') + '</p></div></button>' +
    '<button class="v4row tap" data-go="p/' + p.id + '/know"><div><b class="w">Needs effort</b><p>' + (wkp.length ? nm(wkp, function (x) { return PN[x.code]; }) + (wkp.length > 1 ? ' are' : ' is') + ' weak. ' : 'No planet is badly placed. ') + (hb.length ? cap1(nm(hb.slice(0, 3), lw)) + ' need' + (hb.length > 1 ? '' : 's') + ' care.' : '') + '</p></div></button>' +
    '<button class="v4row tap" data-go="p/' + p.id + '/yogas"><div><b>Formed in the chart</b><p>' + ((rj ? [rj + ' Raja yoga' + (rj > 1 ? 's' : '')] : []).concat(others).join(', ') || 'No major yoga is fully formed') + '. ' + (yd.length ? 'To watch: ' + N.uniq(yd.map(function (y) { return y.name; })).slice(0, 2).join(', ') + '.' : 'No dosha needs attention.') + '</p></div></button></div>';
  h += '<div class="v4tiles">' + [['analysis', 'star', 'Full analysis'], ['p/' + p.id + '/know', 'orbit', 'My planets'], ['dasha', 'bars', 'Dasha periods'], ['sky', 'sun', 'Sky now'], ['reports', 'doc', '21 reports'], ['milan', 'heart', 'Kundli Milan'], ['p/' + p.id + '/shadbala', 'scale', 'Shadbala'], ['p/' + p.id + '/btime', 'time', 'Birth time'], ['notebook', 'book', 'Notebook']].map(function (t) { return '<button data-go="' + t[0] + '">' + v4i(t[1]) + t[2] + '</button>'; }).join('') + '</div>';
  /* planet table and the full list, from the earlier screen */
  if (id !== 'ALL') { var ti = old.indexOf('<div class="card" style="padding:6px 12px"><table class="v2t">'), te = ti > 0 ? old.indexOf('</table>', ti) : -1; if (te > 0) h += '<div class="v4sec"><h2>Planet positions</h2><span>tap a planet</span></div><div class="pad" style="padding-top:0;padding-bottom:0">' + old.slice(ti, te + 8) + '</div></div>'; }
  var li = old.indexOf('<div class="card v2list">'); if (li > 0) { var more = old.indexOf('<div class="chips" style="padding:0 0 10px">'); h += '<div class="v4sec"><h2>Everything else</h2></div><div class="pad" style="padding-top:0">' + (more > 0 && more < li && id !== 'ALL' ? old.slice(more, li) : '') + old.slice(li).replace(/<\/div>\s*$/, '') + '</div>'; }
  return h + '<div style="height:60px"></div>';
};

/* ---------- Health home ---------- */
function v4lvl(v) { return v >= 0.8 ? 4 : v >= 0.55 ? 3 : v >= 0.3 ? 2 : 1; }
var MedHomeV3 = MedHome;
MedHome = function () {
  var p = curP(); if (!p) return topBar('Health', { noPerson: true }) + noPerson();
  var R = maOf(p), all = mcAll(p), n1 = p.name.split(' ')[0], now = new Date(), male = p.gender === 'M';
  var ranked = Object.keys(all).map(function (id) { return all[id]; }).filter(function (a) { return a.pr.id !== 'surgery'; }).sort(function (a, b) { return (MC_TV[b.tend] + MC_NV[b.nowWord] * 0.5) - (MC_TV[a.tend] + MC_NV[a.nowWord] * 0.5); }), top = ranked.slice(0, 3);
  var h = '<div class="v4plain"><div><h1 class="v4h1">Health</h1><p>' + esc(R.dosha.type) + ' body. Recovery power ' + R.lagna.score + ' of 5</p></div><div><button class="v4pill l" data-act="pickPerson">' + esc(n1) + ' ▾</button></div></div>';
  /* body with the top spots labelled */
  var used = {}, lab = '', calls = top.map(function (a) { var kx = Object.keys(MC_SPOT).filter(function (kk) { return MC_SPOT[kk][3].indexOf(a.pr.id) >= 0; })[0]; return kx && !used[kx] ? (used[kx] = 1, { a: a, s: MC_SPOT[kx] }) : null; }).filter(Boolean);
  calls.forEach(function (x, i) { var right = i % 2 === 0, sx = x.s[0], sy = x.s[1], tx = right ? 196 : 4, col = mcCol(MC_TV[x.a.tend]);
    lab += '<path d="M' + (sx + (right ? 12 : -12)) + ' ' + sy + 'H' + (right ? tx - 6 : tx + 6) + '" stroke="#B8B6CF" stroke-width="1.2" fill="none"/><g data-go="medical/case/' + x.a.pr.id + '"><text x="' + (right ? tx : tx) + '" y="' + (sy - 2) + '" text-anchor="' + (right ? 'start' : 'end') + '" class="bl">' + esc(x.a.pr.n.split(' / ')[0]) + '</text><text x="' + tx + '" y="' + (sy + 18) + '" text-anchor="' + (right ? 'start' : 'end') + '" class="bs" fill="' + col + '">' + esc(x.a.nowWord === 'Active now' ? 'Active now' : x.a.tend.replace(' tendency', '') + ' tendency') + '</text></g>'; });
  var bm = bodyMap(p, all).replace('viewBox="0 0 200 430"', 'viewBox="-130 0 460 430"').replace('</svg>', lab + '</svg>');
  h += '<div class="v4card v4body">' + bm + '<p class="v4note" style="text-align:center">Bigger, redder spots are where the chart points more. Tap a spot or a name.</p></div>';
  /* next 12 months */
  var mons = []; for (var i = 0; i < 12; i++) { var d = new Date(now.getFullYear(), now.getMonth() + i, 15), lv = 0, gd = top.length > 0; top.forEach(function (a) { var pr = a.per.filter(function (x) { return x.start <= d && d < x.end; })[0]; if (pr) { lv = Math.max(lv, pr.lvl ? 1 : 0); if (!pr.good) gd = false; } else gd = false; }); var cal = R.calendar && R.calendar[i]; if (cal && [6, 8, 12].indexOf(cal.hm) >= 0) lv += 1; mons.push({ d: d, lv: lv, good: gd && lv === 0 }); }
  var care = mons.filter(function (m) { return m.lv >= 2; }), base1 = mons.filter(function (m) { return m.lv >= 1; }).length, gm = mons.filter(function (m) { return m.good; }), mn = function (m) { return V4MON[m.d.getMonth()]; }, rng = function (a) { return a.length > 3 ? mn(a[0]) + ' to ' + mn(a[a.length - 1]) : a.map(mn).join(', '); };
  h += '<div class="v4sec"><h2>The next 12 months</h2></div><div class="v4card"><div class="v4months">' + mons.map(function (m, i2) { return '<div><i class="' + (i2 === 0 ? 'now' : '') + '" style="background:' + (m.lv >= 2 ? '#E79B92' : m.lv >= 1 ? '#F0CF86' : m.good ? '#9CCFB5' : '#E7E5F0') + '"></i>' + V4MON[m.d.getMonth()].charAt(0) + '</div>'; }).join('') + '</div><p class="v4note">' + (base1 >= 10 && top[0] ? 'The running period keeps ' + esc(top[0].pr.n.split(' / ')[0].toLowerCase()) + ' active through the year, so keep the routine going. ' : '') + (care.length ? 'Take extra care in ' + care.map(mn).join(', ') + ', when the Sun also passes a sensitive house.' : base1 ? '' : 'No month stands out as sensitive in the coming year.') + (gm.length ? ' Best months for planned treatment: ' + rng(gm.slice(0, 3)) + '.' : '') + '</p><div class="v4leg"><span><i style="background:#E79B92"></i>sensitive</span><span><i style="background:#F0CF86"></i>watch</span><span><i style="background:#9CCFB5"></i>good for treatment</span></div></div>';
  /* three things this month */
  var mk = p.id + '|' + now.getFullYear() + '-' + (now.getMonth() + 1), HM = (DB.hmonth || {})[mk] || {}, todo = [];
  if (top[0]) todo.push([top[0].pr.tests[0].split(';')[0].split(' every')[0], cap1(top[0].pr.n.split(' / ')[0]) + ' is your most sensitive area']);
  top.forEach(function (a) { if (todo.length < 3 && a.pr.dos[0]) todo.push([cap1(a.pr.dos[0].split(',')[0]), 'For ' + a.pr.n.split(' / ')[0].toLowerCase()]); });
  h += '<div class="v4sec"><h2>Do these ' + todo.length + ' things this month</h2></div><div class="v4card">' + todo.map(function (t, i3) { return '<div class="v4row"><button class="v4tick' + (HM[i3] ? ' on' : '') + '" data-act="v4hm" data-v="' + i3 + '" aria-label="Done"></button><div><b>' + esc(t[0]) + '</b><p>' + esc(t[1]) + '</p></div></div>'; }).join('') + '</div>';
  /* needs care now */
  h += '<div class="v4sec"><h2>Needs care now</h2></div><div class="v4card">' + top.map(function (a) { var n = v4lvl(MC_TV[a.tend]), col = n >= 4 ? 'var(--bad)' : n >= 2 ? 'var(--brass)' : 'var(--good)', lv = ''; for (var q = 0; q < 5; q++) lv += '<i' + (q < n + (MC_TV[a.tend] >= 0.9 ? 1 : 0) ? ' style="background:' + col + '"' : '') + '></i>';
    return '<button class="v4row tap" data-go="medical/case/' + a.pr.id + '"><div style="flex:1"><b>' + esc(a.pr.n) + '</b><div class="v4lvl">' + lv + '</div></div>' + v4chip(a.nowWord === 'Active now' ? (n >= 4 ? 'b' : 'w') : a.nowWord === 'Watch now' ? 'w' : 'g', a.nowWord) + '</button>'; }).join('') + '</div>';
  h += '<button class="v4btn" data-go="medical/story/0">Understand your health in 7 simple steps</button>';
  /* find a problem */
  var q0 = (U.mcQ || '').toLowerCase().trim(), list = mcList(p), shown = q0 ? list.filter(function (x) { return (x.n + ' ' + x.alt).toLowerCase().indexOf(q0) >= 0 || x.re.test(q0); }) : [];
  h += '<div class="v4sec"><h2>Check any problem</h2></div><div class="pad" style="padding-top:0;padding-bottom:0"><input class="inp" id="mcSearch" data-in="mcQ" placeholder="Search BP, thyroid, knee, sleep…" value="' + esc(U.mcQ || '') + '"></div><div class="v4areas">' +
    (q0 ? (shown.length ? shown.map(function (x) { return '<button data-go="medical/case/' + x.id + '">' + esc(x.n.split(' / ')[0]) + '</button>'; }).join('') : '<p class="v4note">Nothing matches. Try another word.</p>') : Object.keys(MC_SPOT).filter(function (kk) { return MC_SPOT[kk][3].some(function (id) { return all[id]; }); }).map(function (kk) { return '<button data-act="mcSpot" data-k="' + kk + '">' + esc(MC_SPOT[kk][2].replace(/&/g, 'and')) + '</button>'; }).join('') + '<button data-act="v4allp">All ' + list.length + ' problems ›</button>') + '</div>';
  h += '<details class="v4card v4det2"><summary>Full health chart (for astrologers)</summary>' + [['overview', 'Recovery power and body type'], ['body', 'Body map in detail'], ['planets', 'Planets and health'], ['timing', 'Dasha, transits and 12-month calendar'], ['remedies', 'Remedy plan'], ['muhurta', 'Pick a treatment date']].map(function (t) { return '<button class="v4link" data-go="medical/' + t[0] + '">' + t[1] + ' ›</button>'; }).join('') + '</details>';
  return h + maSafety() + '<div style="height:70px"></div>';
};
ACT.v4hm = function (el) { var p = curP(), now = new Date(), mk = p.id + '|' + now.getFullYear() + '-' + (now.getMonth() + 1); DB.hmonth = DB.hmonth || {}; var H = (DB.hmonth[mk] = DB.hmonth[mk] || {}); if (H[el.dataset.v]) delete H[el.dataset.v]; else H[el.dataset.v] = 1; var ks = Object.keys(DB.hmonth); if (ks.length > 60) ks.slice(0, ks.length - 60).forEach(function (x) { delete DB.hmonth[x]; }); save(); rerender(true); };
ACT.v4allp = function () { var p = curP(), all = mcAll(p); sheet('<div class="pad"><h3 style="font:600 18px var(--sans);margin:4px 0 10px">All problems</h3>' + mcList(p).map(function (x) { var a = all[x.id]; return '<button class="mcrow" data-act="mcOpen" data-id="' + x.id + '"><div><b>' + esc(x.n) + '</b><small>' + esc(a ? a.tend + ', ' + a.nowWord.toLowerCase() : '') + '</small></div><span class="mcdot" style="background:' + mcCol(a ? MC_TV[a.tend] : 0) + '"></span></button>'; }).join('') + '</div>'); };

/* ---------- problem page: one clear statement, one scale, quiet AI failure ---------- */
var MedCaseV3 = MedCaseScreen;
MedCaseScreen = function (id) {
  var h = MedCaseV3(id); if (!h) return h;
  var p = curP(), a = mcAll(p)[id]; if (!a) return h;
  var n1 = p.name.split(' ')[0], tv = MC_TV[a.tend], tw = a.tend.replace(' tendency', ''), s0 = h.indexOf('<div class="card chero">'), s1 = s0 >= 0 ? h.indexOf('<div class="card', s0 + 20) : -1;
  if (s0 >= 0 && s1 > s0) {
    var big = tw + ' tendency' + (a.nowWord === 'Active now' ? ', and it is active now' : a.nowWord === 'Watch now' ? ': keep a watch now' : ', and quiet now'), run = a.sens && a.sens[0] && a.sens[0].now ? a.sens[0] : null;
    var sub = (a.nL >= 2 ? n1 + '\'s chart points here from ' + a.nL + ' of 3 sides. ' : a.nL === 1 ? 'Only one of 3 sides of the chart points here. ' : 'The chart does not really point here. ') + (a.nowWord === 'Active now' ? 'The period running' + (run ? ' till ' + N.dmy(run.end) : ' now') + ' stirs it, so this is the time to act.' : a.nowWord === 'Watch now' ? 'The current period touches it lightly: keep the routine and do the tests.' : 'The current period does not stir it; keep the basics going.');
    var hero = '<div class="v4case"><div class="big">' + esc(big) + '</div><p>' + esc(sub) + '</p></div><div class="v4card"><b class="hd">How likely for ' + (relOf(p) === 'me' ? 'you' : esc(n1)) + '</b><div class="v4scale"><i style="background:#BFDFCF"></i><i style="background:#DCE5B8"></i><i style="background:#F0CF86"></i><i style="background:#F2B49A"></i><i style="background:#E79B92"></i><em style="left:calc(' + Math.round(tv * 100) + '% - 12px);border-color:' + mcCol(tv) + '"></em></div><div class="v4scl"><span>Low</span><span>Moderate</span><span>High</span></div><p class="v4note">Bounce-back power: ' + a.recovery.score + ' of 5. ' + (a.nL >= 2 ? 'Confidence is ' + (a.nL === 3 ? 'high' : 'medium') + ' because ' + a.nL + ' independent parts of the chart agree.' : 'Confidence is low because only ' + a.nL + ' part of the chart points here.') + '</p></div>';
    h = h.slice(0, s0) + hero + h.slice(s1);
  }
  var e0 = h.indexOf('<div class="card mdwait"><b>Detailed analysis could not be written');
  if (e0 >= 0) { var e1 = h.indexOf('<div class="card', e0 + 20); if (e1 > e0) h = h.slice(0, e0) + '<div class="v4quiet">The personal AI write-up is not available right now. <button data-act="mdRe" data-id="' + id + '">Try again</button></div>' + h.slice(e1); }
  return h;
};

/* ---------- one Ask button per screen ---------- */
addAiButtons = function () {
  var old = document.getElementById('askfab'); if (old) old.remove();
  var r = parts()[0] || 'today'; if (!hasAI() || r === 'ai' || r === 'edit' || r === 'more' || r === 'people' || r === 'remedy') return;
  var b = document.createElement('button'); b.id = 'askfab'; b.setAttribute('data-act', 'v4ask'); b.setAttribute('data-notr', ''); b.innerHTML = '<i>✦</i>' + (r === 'today' ? 'Ask about today' : r === 'medical' ? 'Ask about health' : 'Ask about this'); document.body.appendChild(b);
};
ACT.v4ask = function () {
  var p = curP(), app = $('#app'), t = (app.innerText || '').replace(/\n{2,}/g, '\n').trim().slice(0, 2200), scr = (parts()[0] || 'today');
  var q = 'Explain this screen (' + scr + ') for ' + (p ? p.name.split(' ')[0] : 'me') + ' in simple words: what it means in real life, why the chart says so, what to be careful about and what to do. Give one everyday example.\n---\n' + t;
  go('ai'); setTimeout(function () { var x = $('#askIn'); if (x) { x.value = q; ACT.askSend(); } }, 150);
};

/* ---------- AI: same verdicts, with reasons and confidence ---------- */
(function () {
  var ff = fixedFacts;
  fixedFacts = function (p, c) {
    var s = ff(p, c); try {
      var L = DB.settings.loc, d0 = todayStart(0), pl = J.panchangLite(d0, L.lat, L.lon), wd = new Date(pl.rise.getTime() + locOff() * 3600e3).getUTCDay(), jd = N.dayScore(c, pl, wd).j, now = new Date(), md = J.find(c.maha, now), ad = md ? J.find(J.subPeriods(md), now) : null;
      s += 'TODAY\'S VERDICT (from the app\'s judge): ' + jd.word + ', ' + jd.pct + '/100, confidence ' + jd.conf.level + ' (' + jd.conf.agree + ' of ' + jd.conf.of + ' signals agree). Main reasons: ' + jd.factors.filter(function (f) { return f.daily && Math.abs(f.v) > 0.3; }).slice(0, 4).map(function (f) { return f.title + (f.v > 0 ? ' (+)' : ' (−)'); }).join('; ') + '.\n';
      if (ad) { var pv = JUDGE.period(c, md.lord, ad.lord); s += 'CURRENT PERIOD CONFIDENCE: ' + pv.conf.level + ' (' + pv.conf.agree + ' of ' + pv.conf.of + ' factors agree). Factors: ' + pv.factors.map(function (f) { return f.t + (f.v > 0.15 ? ' (+)' : f.v < -0.15 ? ' (−)' : ''); }).join('; ') + '.\n'; }
      s += 'ACCURACY RULES: The verdicts above (planet strength, houses, period verdict, day verdict) are final: use exactly these words and never contradict them. For every statement give the reason from the chart in simple words, and add one everyday example where it helps understanding. State the confidence as given; when confidence is low or the word is "Mixed" or "Mixed signals", say clearly that the chart gives no firm signal instead of predicting. Never state anything the facts above do not support.\n';
    } catch (e) { }
    return s;
  };
  if (typeof briefPrompt === 'function') { var bp = briefPrompt; briefPrompt = function (p, c) {
    var s = bp(p, c), B = DB.aiBrief || {}, yd = new Date(Date.now() - 864e5), yk = p.id + '|' + yd.getFullYear() + '-' + (yd.getMonth() + 1) + '-' + yd.getDate() + '|' + (DB.settings.lang || 'en');
    try { var L = DB.settings.loc, D = N.myDay(c, todayStart(0), L.lat, L.lon, new Date()), ar = JUDGE.areas(c, D.score.j, D.tr); s += '\nAREA SCORES TODAY (0-100, from the app): ' + ar.map(function (a) { return a.t + ' ' + a.pct + ' (' + a.word + ')'; }).join(', ') + '. Your lines must agree with these scores and with TODAY\'S VERDICT.'; } catch (e) { }
    if (B[yk]) s += '\nYESTERDAY YOU WROTE:\n' + B[yk] + '\nDo not repeat yesterday\'s sentences or advice. Say what is different today and why (the day\'s star, the Moon\'s house, the weekday lord).';
    return s; }; }
})();

/* ---------- routing, navigation, long pages ---------- */
(function () {
  var r0 = render;
  render = function () {
    var pr = parts(), scr = pr[0] || '';
    if (scr === '' || (scr === 'today' && !pr[1]) || scr === 'sky') {
      applySettings(); var html; try { html = scr === 'sky' ? SkyNow() : TodayV4(); } catch (e) { html = '<div class="empty"><h2>Something went wrong</h2>' + esc(e.message) + '<br><br><button class="btn" data-go="astro">Open Kundli</button></div>'; if (window.console) console.error(e); }
      $('#app').innerHTML = html; document.body.classList.remove('asking'); var ap = $('#askbar'); if (ap) ap.classList.add('hide');
      (U.after || []).forEach(function (f) { try { f(); } catch (e) { } }); U.after = [];
    } else r0();
    try { addAiButtons(); } catch (e) { }
    var on = scr === '' || scr === 'today' || scr === 'sky' || scr === 'panchang' ? 'today' : scr === 'medical' ? 'medical' : scr === 'remedies' || scr === 'remedy' || scr === 'reminders' ? 'remedies' : scr === 'ai' || scr === 'notebook' ? 'ai' : scr === 'more' ? '' : 'astro';
    $('#nav').innerHTML = NAVS.map(function (x) { return '<button data-go="' + x[0] + '" class="' + (x[0] === on ? 'on' : '') + '">' + icon(x[0]) + x[1] + '</button>'; }).join('');
    document.body.setAttribute('data-scr', scr || 'today');
    /* long cards: show the first part, open the rest on tap */
    if (scr === 'analysis' || scr === 'report') Array.prototype.forEach.call(document.querySelectorAll('#app .card'), function (cd) { if (cd.scrollHeight > 1500 && !cd.classList.contains('v4open')) { cd.classList.add('v4clip'); var b = document.createElement('button'); b.className = 'v4more'; b.setAttribute('data-act', 'v4more'); b.textContent = 'Show all'; cd.appendChild(b); } });
  };
})();
ACT.v4more = function (el) { var cd = el.closest('.card'); cd.classList.remove('v4clip'); cd.classList.add('v4open'); el.remove(); };
