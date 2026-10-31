/* Trikaal: Medical Astrology section (Astrology › Medical astrology) */
var MA = makeMedAstro(J, C, KB), MA_CACHE = {};
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
  var h = topBar('Medical astrology') + '<div class="chips mchips">' + MA_TABS.map(function (t) { return '<button class="' + (t[0] === tab ? 'on' : '') + '" data-go="medical/' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div><div class="pad">';
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
      applySettings(); var html; try { html = MedicalScreen(pr[1]); } catch (e) { html = '<div class="empty"><h2>Something went wrong</h2>' + esc(e.message) + '</div>'; if (window.console) console.error(e); }
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
