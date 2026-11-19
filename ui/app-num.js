/* Trikaal 5: numerology with Lo Shu grid, kept separate from predictions (palm, face and the 360° reading were removed in 5.0). Was: palm reading, face reading, numerology with Lo Shu grid, and the 360° reading that checks them against the kundli.
   Numbers never feed the kundli verdicts. */
var NUM = makeNumerology(J);
V4I.hand = '<path d="M7 21c-1.500-2-3-5-3-8 0-1.500 1.500-1.500 2 0l1 2V6a1.200 1.200 0 0 1 2.400 0v5V4a1.200 1.200 0 0 1 2.400 0v7V5a1.200 1.200 0 0 1 2.400 0v7V8a1.200 1.200 0 0 1 2.400 0v7c0 3-1 5-2.500 6"/>';
V4I.face = '<circle cx="12" cy="12" r="8.500"/><path d="M9 10h.01M15 10h.01M9 15.500c1.700 1.300 4.300 1.300 6 0"/>';
V4I.hash = '<path d="M5 9h14M4 15h14M10 4L8 20M16 4l-2 16"/>';
V4I.r360 = '<circle cx="12" cy="12" r="8.500"/><path d="M3.500 12h17M12 3.500c2.500 2.300 3.800 5.200 3.800 8.500s-1.300 6.200-3.800 8.500c-2.500-2.300-3.800-5.200-3.800-8.500S9.500 5.800 12 3.500z"/>';
function x3Kid(p) { try { return age(p, new Date()) < 14; } catch (e) { return false; } }
function x3Head(title, sub, p, extra) { return '<div class="v4sky slim">' + v4stars(50, 5) + '<div class="v4top"><button class="v4nav" data-go="astro">‹</button><div class="dt"><b class="nm">' + title + '</b><small>' + sub + '</small></div><span class="sp"></span><button class="v4pill" data-act="pickPerson">' + esc(p.name.split(' ')[0]) + ' ▾</button></div>' + (extra || '') + '</div>'; }
function x3v(k) { return k === 'g' ? 1 : k === 'b' ? -1 : 0; }
function x3cmp(a, b) { var d = Math.abs(a - b); return d === 0 ? ['g', 'Kundli agrees'] : d === 1 ? ['w', 'Partly agrees'] : ['b', 'Kundli differs']; }
function x3word(k) { return k === 'g' ? 'strong' : k === 'b' ? 'weak' : 'average'; }

/* ---------- numerology ---------- */
var PY_NATURE = { 1: ['g', 'new beginnings'], 2: ['m', 'patience and partnerships'], 3: ['g', 'growth and learning'], 4: ['m', 'hard work and foundations'], 5: ['m', 'change and travel'], 6: ['g', 'family and responsibility'], 7: ['b', 'review and inner work'], 8: ['m', 'money, karma and effort'], 9: ['m', 'completion and letting go'] };
var MISS_FIX = { 1: 'Wake at sunrise and offer water to the Sun', 2: 'Keep a silver glass for drinking water; respect your mother', 3: 'Read 10 pages a day; respect teachers', 4: 'Keep your desk and accounts in order', 5: 'Keep a green plant near your work desk', 6: 'Spend Friday evenings with family', 7: 'Meditate or pray 10 minutes daily', 8: 'Keep weekly accounts and save on salary day', 9: 'Exercise daily; set one clear goal for the year' };
function numOf(p) { return NUM.analyze(p, new Date()); }
function NumScreen() {
  var p = curP(); if (!p) return topBar('Numerology', { noPerson: true }) + noPerson();
  var a = numOf(p), c = calcP(p), PLc = NUM.PL, kid = x3Kid(p), dob = N.dmy(new Date(p.date + 'T12:00:00Z'));
  var cores = [[a.mul, 'Mulank', 'Birth day · ' + PN[PLc[a.mul]]], [a.bha, 'Bhagyank', 'Destiny · ' + PN[PLc[a.bha]]], [a.name.single, 'Name', a.name.compound + ' · ' + PN[PLc[a.name.single]]], [a.kua, 'Kua', a.kuaDir.split(' (')[0]]];
  var h = x3Head('Numerology', 'Lo Shu grid · ' + esc(p.name) + ' · ' + dob, p, '<div class="x3cores">' + cores.map(function (x) { return '<div><span>' + x[0] + '</span><b>' + x[1] + '</b><small>' + esc(x[2]) + '</small></div>'; }).join('') + '</div>');
  /* grid */
  h += '<div class="v4sec"><h2>Lo Shu grid</h2><span>from the date of birth</span></div><div class="v4card"><div class="x3grid">' + NUM.GRID.map(function (n) { var k = a.cnt[n], cl = !k ? 'm' : k > 1 ? 'r' : 'p'; return '<div class="' + cl + '">' + (k ? String(n).repeat(Math.min(k, 4)) : n) + '<small>' + PN[PLc[n]] + '</small></div>'; }).join('') + '</div>' +
    '<div class="v4leg" style="justify-content:center"><span><i style="background:#BFDFCF"></i>present</span><span><i style="background:#F2C9C4"></i>missing</span><span><i style="background:#F0CF86"></i>repeated</span></div>' +
    (a.planes.filter(function (x) { return x.full; }).length ? '<p class="v4note"><b style="color:var(--good)">Complete: </b>' + a.planes.filter(function (x) { return x.full; }).map(function (x) { return x.name + ' (' + x.nums.join('-') + '): ' + x.gives; }).join('; ') + '.</p>' : '<p class="v4note">No complete line (plane) in the grid.</p>') + '</div>';
  /* meaning */
  h += '<div class="v4sec"><h2>What the grid says</h2></div><div class="v4card">' + a.missing.map(function (n) { var m = NUM.MISS[n]; return '<div class="v4row">' + v4chip('b', 'Missing ' + n) + '<div><b>' + m[0] + '</b><p>' + esc(m[1]) + '</p></div></div>'; }).join('') +
    a.repeat.map(function (n) { return '<div class="v4row">' + v4chip('w', n + ' × ' + a.cnt[n]) + '<div><b>' + esc(NUM.MANY[n].split(';')[0]) + '</b><p>' + esc(NUM.MANY[n]) + '.</p></div></div>'; }).join('') + '</div>';
  /* against the kundli */
  var now = new Date(), md = J.find(c.maha, now), ad = md ? J.find(J.subPeriods(md), now) : null, pv = ad ? JUDGE.period(c, md.lord, ad.lord) : null, pyn = PY_NATURE[a.py];
  var chk = [[a.mul, 'Mulank ' + a.mul, NUM.CORE[a.mul]], [a.bha, 'Bhagyank ' + a.bha, NUM.CORE[a.bha]]].map(function (x) { var jp = JUDGE.planet(c, PLc[x[0]]); return '<div class="v4row"><div style="flex:1"><b>' + x[1] + ' (' + PN[PLc[x[0]]] + ')</b><p>' + esc(x[2]) + '. In the kundli ' + PN[PLc[x[0]]] + ' is ' + jp.word.toLowerCase() + '.</p></div>' + v4chip(jp.k === 'b' ? 'w' : 'g', jp.k === 'b' ? 'Needs support' : 'Agrees') + '</div>'; }).join('');
  if (pv) { var agree = pyn[0] === pv.v || (pyn[0] === 'm' && pv.v !== 'b' && pv.v !== 'g'); chk += '<div class="v4row"><div style="flex:1"><b>Personal year ' + now.getFullYear() + ': ' + a.py + '</b><p>A year of ' + pyn[1] + '. The kundli period ' + PN[md.lord] + '–' + PN[ad.lord] + ' is ' + pv.word.toLowerCase() + '.</p></div>' + v4chip(agree ? 'g' : 'w', agree ? 'Agrees' : 'Partly') + '</div>'; }
  h += '<div class="v4sec"><h2>Numbers and the kundli</h2></div><div class="v4card">' + chk + '</div>';
  /* lucky, colours */
  var wd = new Date(Date.now() + locOff() * 3600e3).getUTCDay(), wr = NUM.wear(a, wd);
  h += '<div class="v4sec"><h2>Lucky numbers and colours</h2></div><div class="v4card"><div class="v4row"><div style="flex:1"><b>Lucky numbers</b><div class="x3nums">' + a.lucky.map(function (n) { return '<span class="g">' + n + '</span>'; }).join('') + '</div>' + (a.avoid.length ? '<b style="margin-top:8px">Numbers to avoid</b><div class="x3nums">' + a.avoid.map(function (n) { return '<span class="b">' + n + '</span>'; }).join('') + '</div>' : '') + '<p style="margin-top:6px">Lucky days: ' + a.days.join(', ') + '.</p></div></div>' +
    '<div class="v4row"><span class="x3sw" style="background:' + wr.hex + '"></span><div style="flex:1"><b>Wear today: ' + wr.names.join(' or ') + '</b><p>' + esc(wr.why) + '.</p></div></div>' +
    '<div class="v4row"><div style="flex:1"><b>Your colours</b><div class="x3cols">' + a.colours.good.map(function (x) { return '<span><i style="background:' + x.hex + '"></i>' + x.names[0] + '</span>'; }).join('') + '</div>' + (a.colours.bad.length ? '<b style="margin-top:8px">Avoid wearing often</b><div class="x3cols">' + a.colours.bad.map(function (x) { return '<span><i style="background:' + x.hex + '"></i>' + x.names[0] + '</span>'; }).join('') + '</div>' : '') + '</div></div>' +
    '<div class="v4row"><div style="flex:1"><b>Week plan</b><div class="x3week">' + [1, 2, 3, 4, 5, 6, 0].map(function (w) { var x = NUM.wear(a, w); return '<span><i style="background:' + x.hex + '"></i>' + ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][w] + '<small>' + x.names[0] + '</small></span>'; }).join('') + '</div></div></div></div>';
  /* name and mobile */
  var mob = (U.x3mob != null ? U.x3mob : p.phone) || '', mr = NUM.mobile(a, mob);
  h += '<div class="v4sec"><h2>Name and mobile number</h2></div><div class="v4card"><div class="v4row"><div style="flex:1"><b>Name number ' + a.name.compound + ' → ' + a.name.single + ' (' + PN[PLc[a.name.single]] + ')</b><p>' + (a.nameOk ? 'It suits the Mulank and Bhagyank. No name change is needed.' : 'It does not fully suit the Mulank and Bhagyank. A spelling change is optional; first try the simple remedies below. Never pay for a name change out of fear.') + '</p></div>' + v4chip(a.nameOk ? 'g' : 'w', a.nameOk ? 'Suits' : 'Not ideal') + '</div>' +
    '<div class="v4row"><div style="flex:1"><b>Mobile number check</b><input class="inp mono" inputmode="tel" data-in="x3mob" placeholder="10-digit mobile number" value="' + esc(mob) + '" style="margin:6px 0">' + (mr ? '<p><b style="display:inline;color:' + (mr.v === 'g' ? 'var(--good)' : mr.v === 'b' ? 'var(--bad)' : '#9A6C12') + '">' + mr.word + '.</b> ' + esc(cap1(mr.why.join('; '))) + '.</p>' : '') + '<p style="margin-top:4px">Best totals for a new number (add all 10 digits until one digit is left): <b style="display:inline">' + mr_best(a).join(', ') + '</b>. Prefer a number ending in ' + a.lucky.slice(0, 3).join(', ') + ' and with few zeros. The same check works for a car or house number.</p></div></div></div>';
  /* switch words */
  var mine = (DB.switchw || {})[p.id] || [];
  h += '<div class="v4sec"><h2>Switch words</h2><span>short words said or written for a goal</span></div><div class="v4card">' + NUM.SWITCH.map(function (s) { return '<div class="x3swrow"><b>' + s[0] + '</b><span>' + s[1].map(function (w) { return '<em>' + w.toUpperCase() + '</em>'; }).join('') + '</span></div>'; }).join('') +
    (mine.length ? '<div class="lbl" style="margin-top:12px">Your own words</div>' + mine.map(function (m, i) { return '<div class="x3swrow"><b>' + esc(m.g) + '</b><span><em>' + esc(m.w.toUpperCase()) + '</em><button data-act="x3swDel" data-i="' + i + '">✕</button></span></div>'; }).join('') : '') +
    '<div class="x3swadd"><input class="inp" data-in="x3swg" placeholder="Goal, e.g. health" value="' + esc(U.x3swg || '') + '"><input class="inp" data-in="x3sww" placeholder="Word, e.g. ASHWINA" value="' + esc(U.x3sww || '') + '"><button class="v4btn" data-act="x3swAdd" style="margin:0;width:auto">Add</button></div>' +
    '<p class="v4note">How to use: pick one goal, say the word slowly 27 times (or write it 9 times) morning and night, with your attention on the goal. Use one or two words at a time.</p></div>';
  /* remedies */
  h += '<div class="v4sec"><h2>Simple numerology remedies</h2></div><div class="v4card">' + a.missing.slice(0, 4).map(function (n) { return '<div class="v4row">' + v4chip('n', 'For ' + n) + '<p style="color:var(--ink)">' + esc(MISS_FIX[n]) + '.</p></div>'; }).join('') + (kid ? '<p class="v4note">For a child, keep it playful: colours and small habits, no fasting or name changes.</p>' : '') + '</div>';
  return h + '<div style="height:70px"></div>';
}
function mr_best(a) { return a.lucky.filter(function (n) { return NUM.rel(n, a.mul) >= 0 && NUM.rel(n, a.bha) >= 0; }); }
ACT.x3swAdd = function () { var p = curP(), g = (U.x3swg || '').trim(), w = (U.x3sww || '').trim(); if (!w) { toast('Type the word first'); return; } DB.switchw = DB.switchw || {}; (DB.switchw[p.id] = DB.switchw[p.id] || []).push({ g: g || 'My goal', w: w }); U.x3swg = U.x3sww = ''; save(); rerender(true); };
ACT.x3swDel = function (el) { var p = curP(); (DB.switchw[p.id] || []).splice(+el.dataset.i, 1); save(); rerender(true); };

/* ---------- hooks: routes, Kundli tiles, Today, AI ---------- */
(function () {
  var r0 = render; render = function () {
    var pr = parts(), S = { num: NumScreen }[pr[0]]; if (pr[0] === 'palm' || pr[0] === 'face' || pr[0] === 'r360') { location.hash = '#/astro'; return; }
    if (!S) return r0();
    applySettings(); var html; try { html = S(); } catch (e) { html = '<div class="empty"><h2>Something went wrong</h2>' + esc(e.message) + '<br><br><button class="btn" data-go="astro">Open Kundli</button></div>'; if (window.console) console.error(e); }
    $('#app').innerHTML = html; $('#nav').innerHTML = NAVS.map(function (x) { return '<button data-go="' + x[0] + '" class="' + (x[0] === 'astro' ? 'on' : '') + '">' + icon(x[0]) + x[1] + '</button>'; }).join('');
    document.body.setAttribute('data-scr', pr[0]); try { addAiButtons(); } catch (e) { } window.scrollTo(0, U.keepY || 0);
  };
  var a0 = AstroV2; AstroV2 = function (id) {
    var h = a0(id), i = h.indexOf('<div class="v4tiles">'); if (i < 0) return h;
    return h.slice(0, i) + '<button class="v4card x3promo" data-go="num"><span class="gl">' + v4i('hash') + '</span><div><b>Numbers and lucky colours</b><small>Numerology, Lo Shu grid, colour to wear, mobile number, switch words</small></div><span class="ar">›</span></button>' + h.slice(i);
  };
  var tv = TodayV4; TodayV4 = function () {
    var h = tv(), p = curP(); if (!p) return h;
    try { var a = numOf(p), L = DB.settings.loc, pl = J.panchangLite(todayStart(U.dayOff || 0), L.lat, L.lon), wd = new Date(pl.rise.getTime() + locOff() * 3600e3).getUTCDay(), w = NUM.wear(a, wd);
      var x = '<button class="v4card x3wear" data-go="num"><span class="x3sw" style="background:' + w.hex + '"></span><div><b>Wear ' + w.names.join(' or ') + '</b><small>Lucky numbers ' + a.lucky.slice(0, 4).join(', ') + (w.avoid.length ? ' · avoid ' + w.avoid.slice(0, 2).join(', ').toLowerCase() : '') + '</small></div><span class="ar">›</span></button>';
      var i = h.indexOf('<div class="v4two">'); return i < 0 ? h : h.slice(0, i) + x + h.slice(i);
    } catch (e) { return h; }
  };
  var ff = fixedFacts; fixedFacts = function (p, c) {
    var s = ff(p, c); try { var a = numOf(p); s += 'NUMEROLOGY (Chaldean name, Lo Shu grid): Mulank ' + a.mul + ', Bhagyank ' + a.bha + ', name ' + a.name.compound + '/' + a.name.single + (a.nameOk ? ' (suits)' : ' (does not fully suit)') + ', Kua ' + a.kua + ', personal year ' + a.py + '; missing ' + (a.missing.join(', ') || 'none') + '; repeated ' + (a.repeat.join(', ') || 'none') + '; lucky ' + a.lucky.join(', ') + '; avoid ' + (a.avoid.join(', ') || 'none') + '.\n';
    } catch (e) { }
    return s;
  };
})();
INP.x3mob = function (el) { U.x3mob = el.value; var d = el.value.replace(/\D/g, ''); if (d.length >= 10 || d.length === 0) { var st = el.selectionStart; rerender(true); var n = document.querySelector('[data-in="x3mob"]'); if (n) { n.focus(); try { n.setSelectionRange(st, st); } catch (e) { } } } };
INP.x3swg = function (el) { U.x3swg = el.value; };
INP.x3sww = function (el) { U.x3sww = el.value; };
