/* Trikaal: Medical Astrology section (Astrology › Medical astrology) */
var MA = makeMedAstro(J, C, KB), MC = makeMedCase(J, C, MA), MA_CACHE = {};
function maOf(p) {
  var c = calcP(p), key = p.id + '|' + p.time + '|' + DB.settings.ayan + '|' + new Date().toDateString();
  if (!MA_CACHE[key]) { var sb = null; try { sb = sbOf(c); } catch (e) { } MA_CACHE[key] = MA.analyze(c, new Date(), sb, age(p, new Date())); if (age(p, new Date()) < 14) MA_CACHE[key].areas = MA_CACHE[key].areas.filter(function (a) { return a.id !== 'repro'; }); }
  return MA_CACHE[key];
}
var MA_TABS = [['overview', 'Overview'], ['body', 'Body map'], ['planets', 'Planets'], ['timing', 'Timing'], ['remedies', 'Remedies'], ['muhurta', 'Treatment dates'], ['conditions', 'BP, sugar, thyroid…']];
function maLvl(l) { return l >= 2.5 ? 'b' : l >= 1.5 ? 'm' : 'g'; }
function maSafety() { return '<div class="masafe"><b>Doctor first.</b> The chart shows tendencies and timing; only a doctor diagnoses and treats. Never stop or delay medicine for a dasha, transit or remedy. Emergencies (chest pain, stroke signs, severe bleeding, breathing trouble, thoughts of self-harm — Tele-MANAS 14416) go to hospital at once.</div>'; }
function MedicalScreen(tab) {
  var p = curP(); if (!p) return topBar('Medical astrology', { noPerson: true }) + noPerson();
  tab = MA_TABS.some(function (t) { return t[0] === tab; }) ? tab : 'overview';
  if (tab === 'conditions') { setTimeout(function () { go('report/disease'); }, 0); return ''; }
  var R = maOf(p), c = calcP(p), n1 = p.name.split(' ')[0], kid = /child|teen/.test(NARR.stage(R.age || 30));
  var h = '<div class="top"><button class="ib" data-go="medical">' + icon('back') + '</button><span class="ttl">Full health chart</span></div><div class="chips mchips">' + MA_TABS.map(function (t) { return '<button class="' + (t[0] === tab ? 'on' : '') + '" data-go="medical/' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div><div class="pad">';
  h += (MAT[tab] || MAT.overview)(p, c, R, n1, kid);
  if (hasAI()) h += '<button class="btn sec wide" data-act="outAsk" data-q="' + esc('Medical astrology reading for ' + p.name + ': ' + (tab === 'timing' ? 'what the current dasha and transits mean for health, what to watch, when to get check-ups, and what to do' : tab === 'remedies' ? 'explain the remedy plan step by step: what, how much, which day, for how long' : 'the main health strengths and weak areas, what to watch now, and the remedies') + '.') + '">✦ Explain this with AI</button>';
  return h + maSafety() + '</div>';
}
var MAT = {};
MAT.overview = function (p, c, R, n1, kid) {
  var top = R.areas.filter(function (a) { return a.level >= 1.5; }).slice(0, 4), d = R.dosha, run = R.dasha[0], ad = R.dasha[1] || R.dasha[0];
  var h = '<div class="ocard"><div class="olbl">' + esc(n1) + ' · health in short</div><div class="overd ' + (R.lagna.score >= 4 ? 'g' : R.lagna.score >= 2 ? 'm' : 'b') + '">' + esc(R.lagna.word) + '</div><p class="op">' + esc('Lagna strength ' + R.lagna.score + ' of 5. ' + R.lights.text + ' Constitution: ' + d.type + '. ' + (top.length ? 'Areas to look after: ' + top.map(function (a) { return a.n.toLowerCase(); }).join(', ') + '.' : 'No body area shows three agreeing warnings.') + ' Now: ' + MA.PN[run.code] + '–' + MA.PN[ad.code] + (ad.bad || run.bad ? ' period asks for care.' : ' period supports health.')) + '</p></div>';
  h += '<div class="card"><div class="kgh"><h3>Recovery power (Lagna)</h3><span class="tag ' + (R.lagna.score >= 4 ? 'g' : R.lagna.score >= 2 ? 'tn' : 'b') + '">' + R.lagna.score + '/5</span></div>' + R.lagna.tests.map(function (t) { return '<div class="matest ' + (t.ok ? 'ok' : 'no') + '"><b>' + (t.ok ? '✓' : '✗') + '</b><span>' + esc(t.t) + '<small>' + esc(t.ok ? t.good : t.bad) + '</small></span></div>'; }).join('') + '<p class="note">' + esc(R.lights.text) + '</p></div>';
  h += '<div class="card"><h3>Body constitution (dosha)</h3><div class="madosha">' + ['Vata', 'Pitta', 'Kapha'].map(function (x) { return '<div class="' + x.toLowerCase() + '"><b>' + d.pc[x] + '%</b><span>' + x + '</span><i style="height:' + Math.max(8, d.pc[x]) + '%"></i></div>'; }).join('') + '</div><p><b>' + esc(d.type) + '.</b> ' + esc(d.main + ' governs ' + MA.DOSHA[d.main].what + '. When it is in excess: ' + MA.DOSHA[d.main].excess + '.') + '</p><p class="mut" style="font-size:13px"><b>What suits ' + esc(n1) + ':</b> ' + esc(MA.DOSHA[d.main].care) + '.</p></div>';
  if (R.combos.length) h += '<div class="card rstory"><h3>Protection and pressure</h3>' + R.combos.map(function (x) { return '<div class="rs ' + (x[0] === 'g' ? 'g' : 'b') + '"><p>' + esc(x[1]) + '</p></div>'; }).join('') + '</div>';
  h += '<div class="card"><h3>Running now</h3>' + R.dasha.slice(0, 2).map(function (x) { return '<div class="rs ' + (x.bad ? 'b' : 'g') + '"><p>' + esc(x.text) + '</p></div>'; }).join('') + (R.agree.length ? '<div class="rs b"><p><b>Take seriously:</b> ' + esc(R.agree.join(' ')) + '</p></div>' : '') + '<button class="btn sec sm" data-go="medical/timing">Full timing ›</button></div>';
  return h;
};
MAT.body = function (p, c, R, n1) {
  var h = '<p class="mut" style="font-size:13px;margin:0 2px 10px">Each area is checked in three layers: its sign (where), its house in ' + esc(n1) + '\'s chart, and its karaka planet. One layer is a hint; three agreeing layers need preventive attention.</p>';
  return h + R.areas.map(function (a) {
    var q = maLvl(a.level);
    return '<div class="card maarea ' + q + '"><div class="kgh"><h3>' + esc(a.n) + '</h3><span class="tag ' + (q === 'b' ? 'b' : q === 'm' ? 'tn' : 'g') + '">' + esc(a.word) + '</span></div><div class="malayers">' + [0, 1, 2].map(function (i) { return '<i class="' + (i < a.layers ? 'on' : '') + '"></i>'; }).join('') + '<span>' + a.layers + ' of 3 layers</span></div>' +
      (a.why.length ? '<ul class="mawhy">' + a.why.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul>' : '<p class="mut" style="font-size:13px">No pressure on this area.</p>') +
      (a.prot.length ? '<p class="maprot">🛡 ' + esc(a.prot.join('; ')) + '</p>' : '') + (a.conf.length ? '<p class="mut" style="font-size:12.5px">' + esc(a.conf.join('; ')) + '</p>' : '') +
      (a.level >= 1 ? '<p><b>Care:</b> ' + esc(a.care) + '</p><p class="maalert"><b>See a doctor:</b> ' + esc(a.alert) + '</p>' : '') + '</div>';
  }).join('');
};
MAT.planets = function (p, c, R) {
  return ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'].map(function (x) {
    var s = R.st[x], d = MA.PL[x], q = s.state === 'strong' ? 'g' : s.state === 'average' ? 'tn' : 'b', ro = MA.role(c.k, x);
    return '<div class="card"><div class="kgh"><h3>' + MA.PN[x] + ' <small class="mut">' + MA.HN[x] + '</small></h3><span class="tag ' + q + '">' + esc(s.state) + '</span></div><p class="mut" style="font-size:12.5px;margin:-2px 0 6px">' + esc(J.SIGNS[s.sign] + ', ' + N.nth(s.house) + ' house · ' + ro.t + (s.why.length ? ' · ' + s.why.join(', ') : '')) + '</p>' +
      '<p><b>Rules:</b> ' + esc(d.rules) + '.</p>' + (s.dir ? '<p><b>' + (s.dir === 'more' ? 'Leans to excess' : 'Leans to weakness') + ':</b> ' + esc(s.dir === 'more' ? d.more : d.less) + '.</p>' : '') +
      '<p><b>Daily care:</b> ' + esc(d.care) + '</p><p class="maalert"><b>See a doctor:</b> ' + esc(d.alert) + '</p></div>';
  }).join('');
};
MAT.timing = function (p, c, R) {
  var h = '<div class="card"><h3>Dasha: the season</h3>' + R.dasha.map(function (x) { return '<div class="rs ' + (x.bad ? 'b' : 'g') + '"><h4>' + ['Mahadasha', 'Antardasha', 'Pratyantar'][x.lvl] + ' · ' + MA.PN[x.code] + '</h4><p>' + esc(x.text.replace(/^[^:]+: /, '')) + '</p></div>'; }).join('') + (R.shadashtaka ? '<div class="rs b"><p>' + esc(R.shadashtaka) + '</p></div>' : '') + (R.sandhi ? '<div class="rs b"><p>' + esc(R.sandhi) + '</p></div>' : '') + '</div>';
  h += '<div class="card"><h3>Transits: the weather</h3>' + R.transits.map(function (t) { return '<div class="rs ' + (t.k === 'g' ? 'g' : 'b') + '"><p>' + (t.agree && t.k === 'b' ? '<b>Agrees with your dasha. </b>' : '') + esc(t.t) + '</p></div>'; }).join('') + (R.retro.length ? '<p class="note">' + esc(R.retro.join(' ')) + '</p>' : '') + '<p class="note">A difficult transit alone usually passes with minor effects; it matters when it matches the running dasha.</p></div>';
  if (R.upcoming.length) h += '<div class="card"><h3>Check-up reminders, next 3 years</h3>' + R.upcoming.map(function (u) { return '<div class="btw"><b class="mono">' + N.dmy(u.start) + '</b><span>' + esc(MA.PN[u.md] + '–' + MA.PN[u.lord]) + '</span></div><p style="font-size:13px;margin:2px 2px 8px">' + esc(u.text.replace(/^[^:]+: /, '')) + '</p>'; }).join('') + '</div>';
  h += '<div class="card"><h3>12-month health calendar (Sun)</h3><div class="macal">' + R.calendar.map(function (m) { var g = [3, 6, 10, 11].indexOf(m.hm) >= 0, b = [1, 8, 12].indexOf(m.hm) >= 0; return '<div class="' + (g ? 'g' : b ? 'b' : '') + '"><b>' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m.from.getMonth()] + '</b><small>' + J.SIGNS[m.sign].slice(0, 3) + ' · ' + N.nth(m.hm) + '</small><span>' + esc(m.note) + '</span></div>'; }).join('') + '</div><p class="note">House counted from the Moon sign. Green months are good for check-ups and starting treatment; red months need rest and care.</p></div>';
  return h;
};
MAT.remedies = function (p, c, R, n1, kid) {
  var h = '<p class="mut" style="font-size:13px;margin:0 2px 10px">First the role, then the strength: a weak friend of the chart is strengthened, a troublesome 6th/8th/12th lord is calmed (never given its gemstone), a strong planet is just maintained. Follow for 40 days, review at 90 days, alongside medical care.</p>';
  h += R.remedies.map(function (r) {
    return '<div class="card marem ' + r.mode + '"><div class="kgh"><h3>' + MA.PN[r.code] + '</h3><span class="tag ' + (r.mode === 'strengthen' ? 'g' : r.mode === 'pacify' ? 'b' : 'tn') + '">' + r.mode + '</span></div><p class="mut" style="font-size:12.5px;margin:-2px 0 6px">' + esc(r.why + ' · ' + r.role + ' · ' + r.state) + '</p><ul class="mawhy">' + r.acts.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul><p class="' + (r.gemOk ? '' : 'maalert') + '" style="font-size:13px"><b>Gemstone:</b> ' + esc(kid && r.gemOk ? 'Not for a child; use mantra (parents can chant) and food.' : r.gem) + '</p></div>';
  }).join('');
  h += '<div class="card"><h3>Maha Mrityunjaya mantra</h3><p class="mono" style="font-size:13px">om tryambakaṁ yajāmahe sugandhiṁ puṣṭivardhanam, urvārukam iva bandhanān mṛtyor mukṣīya māmṛtāt</p><p style="font-size:13px">For recovery and courage during illness: one mala (108) daily, facing east or north-east, or silently in bed or hospital. Start the evening before any planned procedure.</p></div>';
  h += '<div class="card"><h3>Gemstones for ' + esc(J.SIGNS[c.k.ascSign]) + ' lagna</h3><p style="font-size:13px"><b>Generally supportive:</b> ' + esc(R.gemLagna.good.map(function (x) { return MA.PL[x].gem; }).join(', ')) + '.<br><b>Generally avoided:</b> ' + esc(R.gemLagna.avoid.map(function (x) { return MA.PL[x].gem; }).join(', ')) + '.</p><p class="note">Only after a full chart check, a lab certificate and never for a planet in pacify mode. When in doubt, choose mantra.</p></div>';
  return h;
};
MAT.muhurta = function (p, c, R) {
  var f = U.maMu || (U.maMu = { area: 'gut', from: '', to: '' }), today = todayStart(0);
  var iso = function (d) { return new Date(d.getTime() + locOff() * 3600e3).toISOString().slice(0, 10); };
  if (!f.from) { f.from = iso(today); f.to = iso(new Date(today.getTime() + 13 * 864e5)); }
  var h = '<div class="card"><h3>Pick a date for planned treatment</h3><p class="mut" style="font-size:13px">Only for planned care, and only within the dates your doctor offers. Urgent treatment never waits.</p><div class="field"><span>BODY AREA</span>' + sel('maArea', MA.AREAS.map(function (a) { return [a.id, a.n]; }), f.area) + '</div><div class="grid2"><label class="field"><span>FROM</span><input class="inp" type="date" data-in="maMu" data-f="from" value="' + f.from + '"></label><label class="field"><span>TO</span><input class="inp" type="date" data-in="maMu" data-f="to" value="' + f.to + '"></label></div><button class="btn acc wide" data-act="maMuRun">Check these dates</button></div>';
  if (U.maMuR && U.maMuR.pid === p.id) {
    var L = U.maMuR.list.slice().sort(function (a, b) { return b.score - a.score || a.date - b.date; });
    h += '<div class="card"><h3>Best days first</h3>' + L.map(function (d, i) { var q = d.bad.length ? (d.bad.length > 1 ? 'b' : 'm') : 'g'; return '<div class="rs ' + (q === 'g' ? 'g' : q === 'b' ? 'b' : 'i') + '"><h4>' + (i === 0 && !d.bad.length ? '★ ' : '') + J.VARAS[d.date.getDay()] + ', ' + N.dmy(d.date) + '</h4><p>' + esc(d.tithi + ' · ' + d.nak + '. ' + (d.good.length ? 'Good: ' + d.good.join('; ') + '. ' : '') + (d.bad.length ? 'Avoid: ' + d.bad.join('; ') + '.' : 'No problem found.') + (d.note ? ' ' + d.note : '')) + '</p></div>'; }).join('') + '<p class="note">If no day is ideal, choose the least troubled one inside the doctor\'s window. A good surgeon, a prepared patient and good aftercare matter most.</p></div>';
  }
  return h;
};
CHG.maArea = function (el) { U.maMu.area = el.value; };
INP.maMu = function (el) { U.maMu[el.dataset.f] = el.value; };
ACT.maMuRun = function () {
  var p = curP(), f = U.maMu, pd = function (x) { var q = String(x).split('-').map(Number); return new Date(Date.UTC(q[0], q[1] - 1, q[2]) - locOff() * 3600e3); }, a = pd(f.from), b = pd(f.to);
  if (isNaN(a) || isNaN(b) || b < a) return toast('Check the dates'); if ((b - a) / 864e5 > 60) return toast('Keep the window within 60 days');
  toast('Checking ' + (Math.round((b - a) / 864e5) + 1) + ' days…');
  setTimeout(function () { var loc = DB.settings.loc; U.maMuR = { pid: p.id, list: MA.muhurta(calcP(p), a, b, f.area, { lat: +loc.lat, lon: +loc.lon }) }; rerender(true); }, 30);
};

/* route, entry card and section list */
(function () {
  var r0 = render;
  render = function () {
    var pr = parts();
    if (pr[0] === 'medical') {
      applySettings(); var html; try { html = pr[1] === 'case' ? MedCaseScreen(pr[2]) : !pr[1] ? MedHome() : MedicalScreen(pr[1]); } catch (e) { html = '<div class="empty"><h2>Something went wrong</h2>' + esc(e.message) + '</div>'; if (window.console) console.error(e); }
      if (!html) return; $('#app').innerHTML = html;
      $('#nav').innerHTML = NAVS.map(function (x) { return '<button data-go="' + x[0] + '" class="' + (x[0] === 'astro' ? 'on' : '') + '">' + icon(x[0]) + x[1] + '</button>'; }).join('');
      document.body.classList.remove('asking'); var ap = $('#askbar'); if (ap) ap.classList.add('hide');
      (U.after || []).forEach(function (f) { try { f(); } catch (e) { } }); U.after = [];
      var on = document.querySelector('.chips button.on'); if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', inline: 'center' });
      try { if (isTr()) hiApply(true); } catch (e) { } try { addAiButtons(); } catch (e) { }
      return;
    }
    r0();
  };
  var a0 = AstroV2;
  AstroV2 = function (id) {
    return a0(id).replace(/<button class="kentry k3" data-go="report\/disease">[\s\S]*?<\/button>/, '<button class="kentry k3" data-go="medical"><span class="kei">✚</span><div><b>Medical astrology</b><small>Body map, recovery power, dasha and transit timing, remedies, treatment dates</small></div><span>›</span></button>');
  };
})();
AI_ROUTES = /^(report|analysis|milan|p|panchang|dasha|remedies|today|medical)$/;

/* AI: medical questions use this section as the source */
var MED_RE = /\b(health|disease|ill|illness|sick|bp|blood pressure|diabet\w*|sugar|thyroid|heart|cholesterol|kidney|liver|disease|asthma|arthritis|joint|knee|back pain|acidity|gastric|anxiety|depression|sleep|insomnia|migraine|headache|skin|allerg\w*|pcos|pcod|period|fertility|pregnan\w*|surgery|operation|hospital|treatment|medicine|cancer|tumou?r|fever|infection|weight|obesity|eye|ear|teeth|dental|stomach|piles|stone|uric|bones?|spine|nerves?|stress|recover\w*|swasthya|bimari|rog)\b/i;
(function () {
  var ag = askGemini;
  askGemini = function (p, c, q, onLive) {
    if (!MED_RE.test(q)) return ag(p, c, q, onLive);
    var R; try { R = maOf(p); } catch (e) { return ag(p, c, q, onLive); }
    return ag(p, c, q + '\n\n' + MA.RULES + '\n' + MA.text(R, p.name) + '\nUse the MEDICAL ASTROLOGY READING above as the primary source for this answer: name the body area and its layers, say what the running dasha and current transits mean for it with dates, give the matching care steps and doctor-alert signs, and the remedy plan by mode (what, how much, which day, how long).', onLive);
  };
  var aa = answerAny;
  answerAny = function (p, c, q) {
    var qq = typeof withContext === 'function' ? withContext(p, q) : q;
    if (!MED_RE.test(qq) || /\b(why did|happened|accident on)\b/i.test(qq)) return aa(p, c, q);
    var R = maOf(p), ql = qq.toLowerCase(), STOP = ['health', 'blood', 'and', 'the'], hit = R.areas.filter(function (a) { return a.n.toLowerCase().split(/[ ,]+/).some(function (w) { return w.length > 3 && STOP.indexOf(w) < 0 && ql.indexOf(w.replace(/s$/, '')) >= 0; }); });
    var areas = hit.length ? hit : R.areas.filter(function (a) { return a.level >= 1.5; }).slice(0, 3), d0 = R.dasha[0], d1 = R.dasha[1] || d0;
    var quick = (hit.length ? hit[0].n + ': ' + hit[0].word.toLowerCase() + '. ' : 'Recovery power ' + R.lagna.score + '/5 (' + R.lagna.word.toLowerCase() + '). ') + 'Now ' + MA.PN[d0.code] + '–' + MA.PN[d1.code] + (d0.bad || d1.bad ? ' asks for extra care.' : ' supports health.');
    var paras = areas.map(function (a) { return a.n + ' (' + a.layers + ' of 3 layers): ' + (a.why.length ? a.why.join('; ') + '.' : 'no pressure.') + (a.prot.length ? ' Protection: ' + a.prot.join('; ') + '.' : '') + ' Care: ' + a.care + ' See a doctor if: ' + a.alert; });
    paras.push(R.dasha.slice(0, 2).map(function (x) { return x.text; }).join(' ') + (R.agree.length ? ' ' + R.agree.join(' ') : ''));
    var todo = R.remedies.slice(0, 2).map(function (r) { return MA.PN[r.code] + ' (' + r.mode + '): ' + r.acts[0].replace(/^Mantra: /, 'mantra ') + ' ' + (r.acts[1] || ''); });
    todo.push('Doctor first: get the matching tests; never stop or delay medicine.');
    return storyRes({ quick: quick, paras: paras, short: 'Open Astrology › Medical astrology for the full body map, timing and remedy plan.', todo: todo, question: null });
  };
})();

/* ---------- problem-first home ---------- */
function mcOpt(p) { return { gender: p.gender, age: age(p, new Date()), now: new Date() }; }
function mcList(p) { var o = mcOpt(p); return MC.P.filter(function (x) { return !(x.fem && o.gender !== 'F') && !(x.adult && o.age < 16); }); }
function MedHome() {
  var p = curP(); if (!p) return topBar('Medical astrology', { noPerson: true }) + noPerson();
  var c = calcP(p), R = maOf(p), n1 = p.name.split(' ')[0], key = 'rank|' + p.id + '|' + p.time + '|' + new Date().toDateString();
  if (!MA_CACHE[key]) MA_CACHE[key] = MC.rank(c, R, mcOpt(p));
  var rk = MA_CACHE[key], q = (U.mcQ || '').toLowerCase().trim(), list = mcList(p);
  var tq = {}; rk.forEach(function (r) { tq[r.id] = r; });
  var h = topBar('Medical astrology') + '<div class="pad">';
  h += '<div class="card mchead"><h3>Which health problem?</h3><p class="mut" style="font-size:13px;margin:-2px 0 10px">Pick a problem to see what ' + esc(n1) + '\'s chart shows, when it is more active (dasha and transits, with dates) and exactly what to do.</p><input class="inp" id="mcSearch" data-in="mcQ" placeholder="Search: BP, sugar, thyroid, knee, sleep…" value="' + esc(U.mcQ || '') + '"></div>';
  var shown = q ? list.filter(function (x) { return (x.n + ' ' + x.alt).toLowerCase().indexOf(q) >= 0 || x.re.test(q); }) : list;
  if (!q) h += '<div class="card"><div class="kgh"><h3>Top concerns in ' + esc(n1) + '\'s chart</h3><span class="sm">today</span></div>' + rk.slice(0, 4).map(function (r) { return '<button class="mcrow" data-go="medical/case/' + r.id + '"><span class="mcdot ' + r.tq + '"></span><div><b>' + esc(r.n) + '</b><small>' + esc(r.tend) + ' · ' + esc(r.now) + '</small></div><span class="tag ' + (r.nq === 'b' ? 'b' : r.nq === 'm' ? 'tn' : 'g') + '">' + esc(r.now.replace(' now', '')) + '</span></button>'; }).join('') + '</div>';
  h += '<div class="card"><h3>' + (q ? 'Matching problems' : 'All health problems') + '</h3><div class="mcgrid">' + (shown.length ? shown.map(function (x) { var r = tq[x.id]; return '<button data-go="medical/case/' + x.id + '"><span class="mcdot ' + (r ? r.tq : 'g') + '"></span>' + esc(x.n) + '</button>'; }).join('') : '<p class="mut">No match. Try another word, or ask in the AI tab.</p>') + '</div><p class="note">Dot colour: red strong tendency, amber moderate, green low (from the chart; not a diagnosis).</p></div>';
  h += '<div class="card v2list"><h3 style="padding:4px 4px 6px">Full health chart</h3>' + [['overview', 'Recovery power and body type', 'Lagna strength, Sun and Moon, Vata-Pitta-Kapha'], ['body', 'Body map', '20 body areas, three layers each'], ['planets', 'Planets and health', 'Excess or weakness, care, warning signs'], ['timing', 'Timing', 'Dasha, transits, check-up reminders, 12-month calendar'], ['remedies', 'Remedy plan', 'By mode: strengthen, maintain or pacify'], ['muhurta', 'Treatment dates', 'Pick a good day within your doctor\'s window']].map(function (t) { return '<button data-go="medical/' + t[0] + '"><div><b>' + t[1] + '</b><small>' + t[2] + '</small></div><span>›</span></button>'; }).join('') + '</div>';
  return h + maSafety() + '</div>';
}
INP.mcQ = function (el) { U.mcQ = el.value; var pos = el.selectionStart; rerender(true); var n = $('#mcSearch'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) { } } };

/* ---------- problem case file ---------- */
var MC_TRACK = ['Medicine / doctor plan followed', 'Mantra (one mala)', 'Food or daan as planned', 'Yoga / walk', 'Sleep 7 hours', 'Evening journal'];
function MedCaseScreen(id) {
  var p = curP(); if (!p) return noPerson();
  var c = calcP(p), R = maOf(p), a = MC.analyze(c, R, id, new Date()); if (!a) { go('medical'); return ''; }
  var n1 = p.name.split(' ')[0], self = relOf(p) === 'me', pr = a.pr, dm = function (d) { return N.dmy(d); };
  var h = '<div class="top"><button class="ib" data-go="medical">' + icon('back') + '</button><span class="ttl">' + esc(pr.n) + '</span><span class="sp"></span><button class="ib" data-act="shareTab">' + icon('share') + '</button></div><div class="pad">';
  var run = a.runL[1] || a.runL[0];
  h += '<div class="ocard"><div class="olbl">' + esc(n1) + ' · ' + esc(pr.n) + '</div><div class="mcverd"><span class="tag ' + (a.tq === 'b' ? 'b' : a.tq === 'm' ? 'tn' : 'g') + '">' + esc(a.tend) + '</span><span class="tag ' + (a.nowQ === 'b' ? 'b' : a.nowQ === 'm' ? 'tn' : 'g') + '">' + esc(a.nowWord) + '</span></div><p class="op">' + esc(
    (a.nL >= 2 ? 'The chart points to this area from ' + a.nL + ' of 3 directions, so prevention matters. ' : a.nL === 1 ? 'Only one indicator points here: a hint, not a pattern. ' : 'The chart does not point to this problem. ') +
    (a.nowWord === 'Active now' ? 'The running ' + MA.PN[a.runL[0].lord] + '–' + MA.PN[run.lord] + ' period' + (a.trNow.some(function (t) { return !t.good; }) ? ' and current transits' : '') + ' make it more sensitive now: be regular with tests and routine.' : a.nowWord === 'Watch now' ? 'The current period touches it lightly: keep the routine and tests on time.' : 'Nothing in the current period stirs it up; maintain good habits.') +
    (a.easy.length ? ' Best period for treatment and lifestyle change: ' + MA.PN[a.easy[0].md] + '–' + MA.PN[a.easy[0].ad] + ' from ' + dm(a.easy[0].start) + '.' : '') + ' Recovery power ' + a.recovery.score + '/5.') + '</p></div>';
  /* chart */
  h += '<div class="card"><div class="kgh"><h3>What the chart shows</h3><span class="sm">' + a.nL + ' of 3 layers</span></div>' + [['sign', 'Sign (where in the body)'], ['house', 'House (in ' + n1 + '\'s chart)'], ['karaka', 'Planet (the force behind it)']].map(function (L) { var it = a.layers[L[0]]; return '<div class="mclayer ' + (it.length ? 'on' : '') + '"><b>' + (it.length ? '●' : '○') + ' ' + L[1] + '</b>' + (it.length ? '<ul class="mawhy">' + it.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '<small>No pressure here.</small>') + '</div>'; }).join('') +
    (a.prot.length ? '<p class="maprot">🛡 ' + esc(a.prot.join('; ')) + '</p>' : '') + (a.dosha ? '<p style="font-size:13.5px">' + esc(a.dosha) + '</p>' : '') + '</div>';
  /* timing */
  h += '<div class="card"><h3>When: dasha is the season, transit is the weather</h3>';
  h += '<div class="lbl" style="margin:6px 0 4px">Now</div>' + a.runL.slice(0, 3).map(function (r) { return '<div class="rs ' + (r.s >= 1.5 ? 'b' : r.s > 0 ? 'i' : 'g') + '"><h4>' + ['Mahadasha', 'Antardasha', 'Pratyantar'][r.lvl] + ' ' + MA.PN[r.lord] + ' · till ' + dm(r.end) + '</h4><p>' + esc(r.why.length ? r.why.join('; ') + '.' : 'Not linked to this problem.') + '</p></div>'; }).join('');
  h += a.trNow.length ? a.trNow.map(function (t) { return '<div class="rs ' + (t.good ? 'g' : 'b') + '"><p>' + esc(t.t) + '</p></div>'; }).join('') : '<p class="mut" style="font-size:13px">No slow planet is over this area now.</p>';
  if (a.agree) h += '<div class="rs b"><p><b>Dasha and transit agree:</b> take this period seriously; do not postpone tests.</p></div>';
  if (a.ahead.length) h += '<div class="lbl" style="margin:12px 0 4px">Changes ahead (next 2 years)</div>' + a.ahead.map(function (x) { return '<div class="rs ' + (x.good ? 'g' : 'b') + '"><p>' + esc(x.t) + '</p></div>'; }).join('');
  if (a.sens.length) h += '<div class="lbl" style="margin:12px 0 4px">More sensitive periods (next 10 years)</div><div class="mctl">' + a.sens.map(function (s) { return '<div class="b' + (s.now ? ' now' : '') + '"><b>' + dm(s.start) + ' – ' + dm(s.end) + '</b><span>' + MA.PN[s.md] + '–' + MA.PN[s.ad] + (s.now ? ' (running)' : '') + '</span><small>' + esc(s.why.join('; ')) + '. Get tests before it starts.</small></div>'; }).join('') + '</div>';
  if (a.easy.length) h += '<div class="lbl" style="margin:12px 0 4px">Easier periods (good to start treatment)</div><div class="mctl">' + a.easy.map(function (s) { return '<div class="g' + (s.now ? ' now' : '') + '"><b>' + dm(s.start) + ' – ' + dm(s.end) + '</b><span>' + MA.PN[s.md] + '–' + MA.PN[s.ad] + '</span></div>'; }).join('') + '</div>';
  if (a.bestMonths.length) h += '<p class="note">Good months for check-ups this year: ' + esc(a.bestMonths.join(', ')) + '.</p>';
  h += '</div>';
  /* plan */
  h += '<div class="card"><h3>What to do</h3><div class="mcplan"><b>👩‍⚕️ Doctor</b><p>' + esc(pr.doc) + '. ' + esc(pr.tests.join('. ')) + '.</p><b>✕ Avoid strictly</b><ul>' + pr.avoid.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul><b>✓ Do daily</b><ul>' + pr.dos.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul><b>🍲 Food</b><p>' + esc(pr.food) + '.</p>' + (pr.yoga && pr.yoga !== '—' ? '<b>🧘 Yoga and breath</b><p>' + esc(pr.yoga) + '. Learn from a teacher; stop if you feel pain or dizziness.</p>' : '') + '</div></div>';
  h += '<div class="card"><h3>Remedies for this problem</h3>' + a.rem.map(function (r) { return '<div class="marem2"><div class="kgh"><b>' + MA.PN[r.code] + '</b><span class="tag ' + (r.mode === 'strengthen' ? 'g' : r.mode === 'pacify' ? 'b' : 'tn') + '">' + r.mode + '</span></div><small class="mut">' + esc(r.why + ' · ' + r.role) + '</small><ul class="mawhy">' + r.acts.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '<li>' + esc('Gemstone: ' + r.gem) + '</li></ul></div>'; }).join('') + '<p class="note">Start on the planet\'s weekday, keep it for 40 days, review at 90 days with your doctor\'s reports.</p></div>';
  /* tracker */
  var tk = (DB.mtrack || {})[p.id + '|' + id];
  h += '<div class="card"><div class="kgh"><h3>90-day routine</h3>' + (tk ? '<span class="sm">week ' + Math.min(13, Math.floor((Date.now() - tk.start) / (7 * 864e5)) + 1) + ' of 13</span>' : '') + '</div>';
  if (!tk) h += '<p class="mut" style="font-size:13px">Tick each habit on the days you keep it. Review at 90 days with your doctor.</p><button class="btn acc wide" data-act="mcTrack" data-id="' + id + '">Start the 90-day routine</button>';
  else { var wk = Math.min(12, Math.floor((Date.now() - tk.start) / (7 * 864e5))), dayKey = new Date().toDateString(); h += MC_TRACK.map(function (t, i) { var done = (tk.d[dayKey] || [])[i]; var cnt = Object.keys(tk.d).filter(function (k) { return (tk.d[k] || [])[i]; }).length; return '<button class="mctk' + (done ? ' on' : '') + '" data-act="mcTick" data-id="' + id + '" data-i="' + i + '"><span>' + (done ? '✓' : '') + '</span><div>' + esc(t) + '<small>' + cnt + ' days so far</small></div></button>'; }).join('') + '<p class="note">Today\'s ticks. Started ' + dm(new Date(tk.start)) + '.</p><button class="btn sec sm" data-act="mcTrackEnd" data-id="' + id + '">Stop routine</button>'; }
  h += '</div>';
  h += '<div class="card maalertc"><b>See a doctor at once if:</b> ' + esc(pr.alert) + '</div>';
  if (!self) h += '<div class="card"><div class="olbl">What to tell ' + esc(n1) + '</div><ol class="otell"><li>' + esc(a.tend + ' for ' + pr.n.toLowerCase() + ' in the chart; it is a tendency, the doctor confirms.') + '</li><li>' + esc('Now: ' + a.nowWord.toLowerCase() + (a.sens[0] ? (a.sens[0].now ? '; sensitive period running till ' + dm(a.sens[0].end) : '; next sensitive period from ' + dm(a.sens[0].start)) + '.' : '.')) + '</li><li>' + esc('Tests: ' + pr.tests[0] + '.') + '</li><li>' + esc('Avoid: ' + pr.avoid.slice(0, 2).join('; ') + '.') + '</li><li>' + esc('Remedy: ' + (a.rem[0] ? MA.PN[a.rem[0].code] + ' mantra daily for 40 days' + (a.rem[0].mode === 'pacify' ? ' and daan on ' + MA.PL[a.rem[0].code].day + 's' : '') : 'routine') + '.') + '</li></ol></div>';
  if (hasAI()) h += '<button class="btn sec wide" data-act="outAsk" data-q="' + esc('Explain ' + p.name + '\'s ' + pr.n.toLowerCase() + ' in detail: what the chart shows, when it is active (dasha and transit dates), and the full plan.') + '">✦ Explain this with AI</button>';
  U.shareFn = function () { return MC.text(a, p.name); };
  return h + maSafety() + '</div>';
}
ACT.mcTrack = function (el) { var p = curP(); DB.mtrack = DB.mtrack || {}; DB.mtrack[p.id + '|' + el.dataset.id] = { start: Date.now(), d: {} }; save(); rerender(true); };
ACT.mcTrackEnd = function (el) { var p = curP(); delete DB.mtrack[p.id + '|' + el.dataset.id]; save(); rerender(true); };
ACT.mcTick = function (el) { var p = curP(), tk = DB.mtrack[p.id + '|' + el.dataset.id], k = new Date().toDateString(), i = +el.dataset.i; tk.d[k] = tk.d[k] || []; tk.d[k][i] = !tk.d[k][i]; save(); rerender(true); };

/* AI: a named problem brings its full case file */
(function () {
  var ag = askGemini;
  askGemini = function (p, c, q, onLive) {
    var hits = MC.find(q).slice(0, 2); if (!hits.length) return ag(p, c, q, onLive);
    var R = maOf(p), extra = hits.map(function (x) { return MC.text(MC.analyze(c, R, x.id, new Date()), p.name); }).join('\n\n');
    return ag(p, c, q + '\n\n' + extra + '\nAnswer from this CASE FILE: what the chart shows, whether it is active now and when it is more or less active (exact dates), and the plan (doctor and tests, avoid, do, food, yoga, remedies by mode, doctor alert).', onLive);
  };
  var aa = answerAny;
  answerAny = function (p, c, q) {
    var qq = typeof withContext === 'function' ? withContext(p, q) : q, hits = MC.find(qq); if (!hits.length) return aa(p, c, q);
    var a = MC.analyze(c, maOf(p), hits[0].id, new Date()), pr = a.pr;
    return storyRes({ quick: pr.n + ': ' + a.tend.toLowerCase() + ', ' + a.nowWord.toLowerCase() + '.' + (a.sens[0] ? (a.sens[0].now ? ' Sensitive period running till ' + N.dmy(a.sens[0].end) + '.' : ' Next sensitive period from ' + N.dmy(a.sens[0].start) + '.') : ''),
      paras: [['sign', 'house', 'karaka'].map(function (x) { return a.layers[x].join('; '); }).filter(Boolean).join(' | ') || 'No strong indicator for this problem.', 'Now: ' + a.runL.slice(0, 2).map(function (r) { return MA.PN[r.lord] + (r.why.length ? ' (' + r.why[0] + ')' : ' (not linked)'); }).join(', ') + '. ' + a.trNow.map(function (t) { return t.t; }).join(' '), 'Tests: ' + pr.tests.join('; ') + '. Avoid: ' + pr.avoid.join('; ') + '.'],
      short: 'Open Astrology › Medical astrology › ' + pr.n + ' for the dated timeline and 90-day plan.', todo: pr.dos.slice(0, 3).concat(a.rem.slice(0, 1).map(function (r) { return MA.PN[r.code] + ' (' + r.mode + '): ' + r.acts[0]; })).concat(['See a doctor at once if: ' + pr.alert]), question: null });
  };
})();
