/* Trikaal: an "Outcome" card on top of every kundli tab — what the data means, in words you can tell the person. */
var GOODH = [1, 2, 4, 5, 7, 9, 10, 11], DUSH = [6, 8, 12];
var AREA_OF = { 1: 'health and confidence', 2: 'money and family', 3: 'effort, courage and short travel', 4: 'home, property and peace of mind', 5: 'children, studies and creativity', 6: 'competition, debts and health care', 7: 'marriage and partnerships', 8: 'sudden events and research', 9: 'luck, father and long travel', 10: 'career and status', 11: 'income and gains', 12: 'expenses, rest and foreign links' };
function nm(p) { return p.name.split(' ')[0]; }
function rateIn(code, chart, c) {
  /* planet strength inside a chart (varsha or natal) plus its natal functional nature */
  var x = chart.P[code], s = { 'Exalted': 2, 'Moolatrikona': 2, 'Own sign': 1.5, 'Friendly sign': 0.5, 'Neutral sign': 0, 'Enemy sign': -1, 'Debilitated': -2 }[x.dignity] || 0;
  s += GOODH.indexOf(x.house) >= 0 ? 1 : DUSH.indexOf(x.house) >= 0 ? -1 : 0;
  var f = c.func[code]; if (f) s += { yogakaraka: 1, benefic: 0.7, malefic: -0.7 }[f.kind] || 0; else s -= 0.3;
  if (x.combust && code !== 'Su') s -= 0.5;
  return s;
}
function rword(s) { return s >= 1.5 ? ['Good', 'g'] : s >= 0 ? ['Mixed', 'm'] : ['Careful', 'b']; }

/* ---------- Varshphal outcome ---------- */
function varshOutcome(p, c, now, a) {
  var vp = J.varshphal(c.k, c.birth, a, +p.lat, +p.lon), V = vp.chart, yl = vp.yearLord, mh = MUNTHA_H[vp.munthaHouse];
  var ylS = rateIn(yl, V, c), vl = J.RULER[V.ascSign], vlS = rateIn(vl, V, c), score = ylS * 0.45 + vlS * 0.35 + (mh[0] === 'good' ? 1 : -1);
  var verdict = score >= 1.5 ? ['A good year', 'g'] : score >= 0 ? ['A mixed year', 'm'] : ['A testing year', 'b'];
  /* life areas from the year chart */
  var stg = NARR.stage(a), KM = stg === 'child' ? NARR.CH : stg === 'teen' ? NARR.TN : null;
  var AL = KM ? [[5, 'Studies'], [1, 'Health'], [4, 'Home & mother'], [3, 'Friends & hobbies'], [9, 'Teachers & father'], [6, 'Immunity']] : [[10, 'Career'], [2, 'Money'], [11, 'Gains'], [7, 'Relationships'], [1, 'Health'], [4, 'Home']];
  var areas = AL.map(function (x) {
    var h = x[0], occ = V.planets.filter(function (q) { return q.house === h; }), lord = J.RULER[(V.ascSign + h - 1) % 12], s = rateIn(lord, V, c) * 0.6;
    occ.forEach(function (q) { s += ['Ju', 'Ve', 'Me'].indexOf(q.code) >= 0 ? 1 : ['Sa', 'Ma', 'Ra', 'Ke'].indexOf(q.code) >= 0 ? (h === 10 || h === 11 ? 0.3 : -1) : 0.2; });
    if (vp.munthaHouse === h) s += mh[0] === 'good' ? 1 : -1;
    var w = rword(s), why = 'Year ' + N.nth(h) + ' house: lord ' + PN[lord] + ' in the ' + N.nth(V.P[lord].house) + (occ.length ? ', with ' + occ.map(function (q) { return PN[q.code]; }).join(', ') : '');
    var line = KM ? (w[1] === 'b' ? KM[h][1] : w[1] === 'g' ? KM[h][0] : KM[h][0].replace(/\.$/, '') + '; ' + KM[h][1].charAt(0).toLowerCase() + KM[h][1].slice(1)).replace(/\.$/, '').replace(/^./, function (z) { return z.toLowerCase(); }) : { Career: ['rise, recognition or a better role', 'steady work, no big jump', 'pressure or changes at work; avoid quitting in haste'], Money: ['savings grow; good for planned purchases', 'income steady; watch spends', 'cash flow tight; avoid loans and risky bets'], Gains: ['wishes and income targets met', 'some gains with effort', 'gains delayed; keep expectations modest'], Relationships: ['harmony; good for marriage or partnership steps', 'normal; small misunderstandings', 'strain likely; patience and clear talk needed'], Health: ['good energy', 'normal health; keep routine', 'health needs care; regular check-ups'], Home: ['peace at home; property moves possible', 'normal home life', 'worries at home or about mother'] }[x[1]][w[1] === 'g' ? 0 : w[1] === 'm' ? 1 : 2];
    return { t: x[1], w: w, line: line, why: why };
  });
  /* month-wise (mudda dasha) */
  var months = vp.mudda.map(function (d) {
    var s = rateIn(d.lord, V, c), h = V.P[d.lord].house, w = rword(s);
    return { d: d, w: w, line: (w[1] === 'g' ? 'Good for ' : w[1] === 'm' ? 'Mixed: ' : 'Go slow on ') + AREA_OF[h], now: now >= d.start && now < d.end };
  });
  var best = months.filter(function (m) { return m.w[1] === 'g'; }), worst = months.filter(function (m) { return m.w[1] === 'b'; });
  var tell = [
    verdict[0] + ' (' + N.dmy(vp.at) + ' – ' + N.dmy(vp.end) + '): ' + mh[1] + ' is the main theme.',
    (KM ? NARR.STAGE_TIP[stg] + ' ' : '') + 'Strongest area: ' + areas.slice().sort(function (x, y) { return ({ g: 2, m: 1, b: 0 })[y.w[1]] - ({ g: 2, m: 1, b: 0 })[x.w[1]]; })[0].t.toLowerCase() + '.'];
  function spans(list) { var o = []; list.forEach(function (m) { var l = o[o.length - 1]; if (l && Math.abs(l.e - m.d.start) < 864e5) l.e = m.d.end; else o.push({ s: m.d.start, e: m.d.end }); }); return o.map(function (x) { return mon(x.s) === mon(x.e) ? mon(x.s) : mon(x.s) + '–' + mon(x.e); }); }
  if (best.length) tell.push('Best months: ' + spans(best).join(', ') + ' — use them for important moves.');
  if (worst.length) tell.push('Go slow: ' + spans(worst).join(', ') + ' — avoid big decisions and keep health in check.');
  tell.push('Year lord ' + PN[yl] + ': ' + (ylS >= 1 ? 'strong, so the year supports ' + AREA_OF[V.P[yl].house] + '.' : 'weak, so strengthen it: ' + KB.MANTRA[yl][0] + ' on ' + KB.FAST[yl] + 's.'));
  return { verdict: verdict, areas: areas, months: months, tell: tell, vp: vp };
}
function mon(d) { return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()] + ' ' + d.getFullYear(); }

/* ---------- one outcome per tab ---------- */
var OUT = {};
OUT.varsh = function (p, c, now) {
  var a = U.vage != null && U.vageFor === p.id ? U.vage : age(p, now), o = varshOutcome(p, c, now, a);
  var h = '<div class="ocard"><div class="olbl">Outcome · year ' + (a + 1) + ' of life</div><div class="overd ' + o.verdict[1] + '">' + o.verdict[0] + '</div>' +
    '<div class="oareas">' + o.areas.map(function (x) { return '<div class="oa ' + x.w[1] + '"><b>' + x.t + '</b><span>' + x.w[0] + '</span><p>' + esc(x.line) + '</p></div>'; }).join('') + '</div>' +
    '<div class="olbl" style="margin-top:12px">Month by month (Mudda dasha)</div>' + o.months.map(function (m) { return '<div class="omon ' + m.w[1] + (m.now ? ' now' : '') + '"><span class="mono">' + mon(m.d.start) + '–' + mon(m.d.end) + '</span><b>' + PN[m.d.lord] + '</b><p>' + esc(m.line) + (m.now ? ' · <b>now</b>' : '') + '</p></div>'; }).join('');
  if (a === age(p, now)) h += '<button class="btn acc wide" style="margin-top:10px" data-go="report/year">Read the full year prediction ›</button>';
  return { html: h, tell: o.tell, ask: 'Explain ' + nm(p) + '\'s Varshphal for year ' + (a + 1) + ' of life (age ' + a + ', ' + N.dmy(o.vp.at) + ' to ' + N.dmy(o.vp.end) + '): outcomes for career, money, health and relationships, and the good and difficult months' };
};
OUT.report = function (p, c) { var a = kaOf(p); return { html: '<div class="ocard"><div class="olbl">Outcome</div><div class="overd ' + (/Challenging/.test(a.snapshot.grade[0]) ? 'b' : /Balanced/.test(a.snapshot.grade[0]) ? 'm' : 'g') + '">' + esc(a.snapshot.grade[0]) + '</div><p class="op">' + esc(a.snapshot.grade[1]) + '</p>', tell: a.pros.slice(0, 3).map(function (x) { return 'Strength: ' + x.t + '.'; }).concat(a.cons.slice(0, 2).map(function (x) { return 'Needs care: ' + x.t + '.'; })), ask: 'Key points to tell ' + nm(p) + ' from the full report' }; };
OUT.charts = OUT.report;
OUT.planets = function (p, c) {
  var s = J.P7.map(function (x) { return [x, rateIn(x, c.k, c)]; }).sort(function (a, b) { return b[1] - a[1]; });
  return { html: '<div class="ocard"><div class="olbl">Outcome</div><p class="op">Strongest helpers: <b>' + s.slice(0, 3).map(function (x) { return PN[x[0]]; }).join(', ') + '</b>. Weakest: <b>' + s.slice(-2).map(function (x) { return PN[x[0]]; }).join(', ') + '</b>.</p>',
    tell: s.slice(0, 3).map(function (x) { return PN[x[0]] + ' works for you: ' + AREA_OF[c.k.P[x[0]].house] + ' come more easily.'; }).concat(s.slice(-2).map(function (x) { return PN[x[0]] + ' is weak: ' + AREA_OF[c.k.P[x[0]].house] + ' need extra effort; its remedy helps (' + KB.MANTRA[x[0]][0] + ').'; })), ask: 'Which planets help ' + nm(p) + ' most and which need remedies, and what does that mean in real life' };
};
OUT.dasha = function (p, c, now) {
  var a = kaOf(p), ch = J.dashaChain(c.maha, now, 2), md = a.life.filter(function (m) { return m.now; })[0], g = a.golden.filter(function (x) { return x.start > now; })[0];
  return { html: '<div class="ocard"><div class="olbl">Outcome</div><div class="overd ' + (md ? ({ G: 'g', M: 'm', T: 'b' })[md.rate.charAt(0)] : 'm') + '">' + PN[ch[0].lord] + ' period: ' + (md ? md.rate.toLowerCase() : 'mixed') + '</div><p class="op">Running until ' + N.dmy(ch[0].end) + (ch[1] ? '; ' + PN[ch[1].lord] + ' sub-period until ' + N.dmy(ch[1].end) : '') + '.' + (g ? ' Next golden window: <b>' + esc(g.label) + ', ' + N.dmy(g.start) + '</b>.' : '') + '</p>',
    tell: [PN[ch[0].lord] + ' Mahadasha (until ' + N.dmy(ch[0].end) + ') focuses on ' + AREA_OF[c.k.P[ch[0].lord].house] + '.', ch[1] ? PN[ch[1].lord] + ' sub-period (until ' + N.dmy(ch[1].end) + ') brings ' + AREA_OF[c.k.P[ch[1].lord].house] + ' into focus.' : '', g ? 'Best period ahead: ' + g.label + ' from ' + N.dmy(g.start) + ' (' + g.areas.slice(0, 2).join(', ') + ').' : ''].filter(Boolean), ask: 'What does ' + nm(p) + '\'s current dasha bring, and what changes at the next sub-period' };
};
/* one shared transit reading: house from the lagna first, Moon-sign gochar second, transit dignity, bindus, vedha */
function transitRead(c, now) {
  var GG = KB.GOCHAR_GOOD, W = { 'Exalted': 1, 'Moolatrikona': 1, 'Own sign': 1, 'Debilitated': -1.5, 'Enemy sign': -0.5 };
  return N.transitAt(c, now).map(function (x) {
    var td = x.code === 'Ra' || x.code === 'Ke' ? null : J.dignity(x.code, x.lon);
    var sc = (GG[x.code].indexOf(x.h) >= 0 ? 1 : -1) + (GG[x.code].indexOf(x.m) >= 0 ? 0.7 : -0.5) + (td && W[td] ? W[td] : 0) + (x.bav == null ? 0 : x.bav >= 5 ? 0.5 : x.bav <= 3 ? -0.5 : 0) + (x.vedha ? -0.5 : 0);
    var tone = sc >= 1 ? 'g' : sc <= -1 ? 'b' : 'm', H = NARR.H[x.h];
    var line = tone === 'g' ? H.g[0] : tone === 'b' ? H.b[0] : H.g[0].replace(/\.$/, '') + ', but ' + H.b[0].charAt(0).toLowerCase() + H.b[0].slice(1);
    return { code: x.code, x: x, h: x.h, m: x.m, td: td, sc: sc, tone: tone, line: line, label: PN[x.code] + ' in your ' + N.nth(x.h) + ' house (' + J.SIGNS[x.sign] + (td === 'Debilitated' ? ', debilitated' : td === 'Exalted' ? ', exalted' : td === 'Own sign' || td === 'Moolatrikona' ? ', own sign' : '') + (x.retro && x.code !== 'Ra' && x.code !== 'Ke' ? ', retrograde' : '') + ')' };
  });
}
OUT.transit = function (p, c, now) {
  var ss = N.sadeSati(c, now), R = transitRead(c, now), slow = R.filter(function (r) { return ['Ju', 'Sa', 'Ra', 'Ke'].indexOf(r.code) >= 0; });
  var tot = slow.reduce(function (t, r) { return t + r.sc; }, 0) - (ss.q === 'bad' ? 0.5 : 0), v = tot >= 1.5 ? ['Supportive transits', 'g'] : tot <= -1.5 ? ['Testing transits', 'b'] : ['Mixed transits', 'm'];
  var tell = slow.filter(function (r) { return r.code !== 'Ke'; }).map(function (r) { return r.label + ': ' + r.line.charAt(0).toLowerCase() + r.line.slice(1).replace(/\.$/, '') + '. (From the Moon it is ' + N.nth(r.m) + ': ' + KB.GOCHAR[r.code][r.m] + '.)'; });
  tell.push(ss.q === 'bad' ? ss.label + (ss.until ? ' until ' + N.dmy(ss.until) : '') + ': steady routine and Saturday Hanuman Chalisa help.' : 'No Sade Sati or Dhaiya now.');
  return { html: '<div class="ocard"><div class="olbl">Outcome</div><div class="overd ' + v[1] + '">' + v[0] + '</div><p class="op">' + slow.filter(function (r) { return r.code === 'Ju' || r.code === 'Sa'; }).map(function (r) { return '<b>' + esc(r.label) + '</b>: ' + esc(r.line); }).join(' ') + '</p>', tell: tell, ask: 'How are the current transits affecting ' + nm(p) + ' and what changes in the next 12 months' };
};
OUT.health = function (p, c) { var a = kaOf(p); return { html: '<div class="ocard"><div class="olbl">Outcome</div><p class="op">' + (a.health.length ? 'Care periods ahead: <b>' + a.health.slice(0, 2).map(function (x) { return mon(x.start) + '–' + mon(x.end); }).join(', ') + '</b>.' : 'No strongly sensitive health periods in the next years.') + '</p>', tell: a.health.slice(0, 3).map(function (x) { return mon(x.start) + '–' + mon(x.end) + ': take care of ' + x.areas[0] + '.'; }).concat(a.saturn.slice(0, 2).map(function (x) { return x.label + ' ' + mon(x.start) + '–' + mon(x.end) + ': keep routine and rest.'; })).concat(['These are astrological indications, not a diagnosis.']), ask: 'Health outlook for ' + nm(p) + ' with periods to be careful and what to do' }; };
OUT.av = function (p, c) {
  var hs = []; for (var h = 1; h <= 12; h++) hs.push([h, N.savOf(c, h)]); hs.sort(function (a, b) { return b[1] - a[1]; });
  var s11 = N.savOf(c, 11), s12 = N.savOf(c, 12);
  return { html: '<div class="ocard"><div class="olbl">Outcome</div><p class="op">Easiest areas: <b>' + hs.slice(0, 3).map(function (x) { return AREA_OF[x[0]].split(',')[0]; }).join(', ') + '</b>. Hardest: <b>' + hs.slice(-2).map(function (x) { return AREA_OF[x[0]].split(',')[0]; }).join(', ') + '</b>. ' + (s11 > s12 ? 'Income runs ahead of expenses.' : 'Expenses keep pace with income.') + '</p>',
    tell: ['Life flows easily in ' + hs.slice(0, 3).map(function (x) { return AREA_OF[x[0]]; }).join('; ') + '.', 'Needs extra effort: ' + hs.slice(-2).map(function (x) { return AREA_OF[x[0]]; }).join('; ') + '.', s11 > s12 ? 'Saving is natural; income exceeds expenses (' + s11 + ' vs ' + s12 + ' points).' : 'Plan savings deliberately; expenses match income (' + s11 + ' vs ' + s12 + ').'], ask: 'Explain ' + nm(p) + '\'s Ashtakavarga: which life areas are strong or weak and what it means' };
};
OUT.yogas = function (p) { var a = kaOf(p), g = a.yogas.filter(function (y) { return y.good && y.kind !== 'mild'; }), d = a.yogas.filter(function (y) { return !y.good || y.kind === 'mild'; }); return { html: '<div class="ocard"><div class="olbl">Outcome</div><p class="op"><b>' + g.length + ' helpful yogas</b>' + (g.length ? ' (' + g.slice(0, 3).map(function (y) { return y.name; }).join(', ') + ')' : '') + ' and <b>' + d.length + ' doshas or weak points</b>' + (d.length ? ' (' + d.slice(0, 2).map(function (y) { return y.name; }).join(', ') + ')' : '') + '.</p>', tell: g.slice(0, 3).map(function (y) { return y.name + ': ' + y.why; }).concat(d.slice(0, 2).map(function (y) { return y.name + ' (handle with remedies): ' + y.why; })), ask: 'Which yogas does ' + nm(p) + ' have, what does each give, and when do they activate' }; };
OUT.remedies = function (p) { var a = kaOf(p); return { html: '<div class="ocard"><div class="olbl">Outcome</div><p class="op">Main focus: <b>' + a.rem.plan.map(function (x) { return PN[x.code]; }).join(', ') + '</b>.</p>', tell: a.rem.plan.map(function (x) { return (x.mode === 'calm' ? 'Calm ' : 'Strengthen ') + PN[x.code] + ': ' + x.mantra[0] + ' daily; donate ' + x.daan[0] + ' on ' + x.daan[1] + '.'; }), ask: 'Which remedies should ' + nm(p) + ' do now and why' }; };
OUT.kp = function (p, c, now) {
  var M = [['job', 'Job or promotion'], ['marriage', 'Marriage'], ['money', 'Money gains']].filter(function (x) { return N.KP_MATTERS[x[0]]; });
  var rows = M.map(function (x) { var jm = N.judgeMatter(c.sig, x[0], c.maha, now, 3, null), v = N.VERD[jm.main.level]; return [x[1], v[0], v[1]]; });
  return { html: '<div class="ocard"><div class="olbl">Outcome (KP promise)</div>' + rows.map(function (r) { return '<div class="omon ' + (r[2] === 'good' ? 'g' : r[2] === 'bad' ? 'b' : 'm') + '"><b>' + r[0] + '</b><p>' + esc(r[1]) + '</p></div>'; }).join(''), tell: rows.map(function (r) { return r[0] + ': ' + r[1].toLowerCase() + '.'; }), ask: 'Using KP, what does ' + nm(p) + '\'s chart promise for job, marriage and money, and when' };
};

function outcomeCard(p, c, now, tab, inside) {
  if (!OUT[tab] || (tab === 'varsh' && !inside)) return '';
  var o; try { o = OUT[tab](p, c, now); } catch (e) { return ''; }
  var who = relOf(p) === 'me' ? 'Key takeaways' : 'What to tell ' + nm(p);
  return '<div class="pad" style="padding-bottom:0">' + o.html + (o.tell && o.tell.length ? '<div class="olbl" style="margin-top:12px">' + who + '</div><ol class="otell">' + o.tell.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ol>' : '') +
    '<button class="btn sec wide" style="margin-top:10px" data-act="outAsk" data-q="' + esc(o.ask + (relOf(p) === 'me' ? '' : ' — give me the key points to tell ' + nm(p))) + '">✦ Explain this in detail with AI</button></div></div>';
}
ACT.outAsk = function (el) { var q = el.dataset.q; go('ai'); setTimeout(function () { var t = $('#askIn'); if (t) { t.value = q; ACT.askSend(); } }, 150); };
