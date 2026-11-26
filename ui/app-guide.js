/* Trikaal 7.1: guided reading. For a customer's problem, open the chart in Vedic or KP and walk through it step by step:
   which house, lord, karaka, divisional chart, dasha and transit to look at, highlighted on the chart, what it shows for this
   person, and what follows; ending with the conclusion and the remedy, each tied to a reason. */
var G_HOUSE = ['', 'body, vitality and self', 'family, speech, savings and food habits', 'courage, effort, short travel and siblings', 'home, mother, peace of mind, chest and heart', 'children, intelligence, studies and stomach', 'illness, debt, enemies, service and daily work', 'marriage, partner, business partners and the lower abdomen', 'chronic illness, surgery, sudden events and inheritance', 'luck, father, guru, dharma and long travel', 'career, status and action', 'gains, income, friends and fulfilment of wishes', 'loss, expense, hospital, foreign land and sleep'];
var G_KAR = { Su: 'soul, father, heart, vitality', Mo: 'mind, mother, fluids, sleep', Ma: 'energy, blood, courage, surgery, property', Me: 'nerves, speech, skin, business, studies', Ju: 'wisdom, children, wealth, liver, protection', Ve: 'marriage, comfort, kidneys, reproduction', Sa: 'delay, chronic issues, bones, workers', Ra: 'confusion, foreign, sudden events', Ke: 'detachment, surgery, hidden issues' };
var G_DG = { 'Exalted': 'exalted: at its best', 'Moolatrikona': 'in moolatrikona: very strong', 'Own sign': 'in its own sign: strong', 'Friendly sign': 'in a friendly sign: fairly comfortable', 'Neutral sign': 'in a neutral sign: average', 'Enemy sign': 'in an enemy sign: uncomfortable', 'Debilitated': 'debilitated: weak' };
function gNth(n) { return N.nth(n); }
function gDig(x, q) { return x === 'Ra' || x === 'Ke' ? 'a shadow planet; it gives the results of its sign lord ' + CQ_PN[J.RULER[q.sign]] : (G_DG[q.dignity] || (q.dignity || 'neutral').toLowerCase()); }
function gLordOf(A, h) { return J.RULER[(A + h - 1) % 12]; }
function gModel(c, id, hp) {
  var m, k = c.k;
  if (id === 'KP') { var kk = c.kp; m = { rows: [{ h: 1, code: 'Asc', deg: J.dm(kk.asc), cls: 'asc' }].concat(kk.planets.map(function (q) { return { h: q.bhava, code: q.code, deg: J.dm(q.lon), r: q.retro && q.code !== 'Ra' && q.code !== 'Ke' }; })), signs: kk.cusps.map(function (x) { return x.sign; }), title: 'KP chart (Placidus cusps, KP ayanamsa)' }; }
  else if (id === 'TR') { var now = new Date(), A = k.ascSign, sg = []; for (var i = 0; i < 12; i++) sg.push((A + i) % 12);
    m = { rows: [{ h: 1, code: 'Asc', deg: '', cls: 'asc' }, { h: J.houseFrom(A, k.P.Mo.sign), code: 'nMo', deg: 'natal', cls: 'mo' }].concat(C.BODIES.map(function (x) { var lon = C.sidereal(x, now), s = Math.floor(((lon % 360) + 360) % 360 / 30); return { h: J.houseFrom(A, s), code: x, deg: J.dm(lon % 30), r: x !== 'Ra' && x !== 'Ke' && C.speed(x, now) < 0 }; })), signs: sg, title: 'Transits today on the birth chart' }; }
  else { m = chartModel(c, id); }
  (m.rows || []).forEach(function (r) { if (hp && hp.indexOf(r.code) >= 0) r.cls = (r.cls || '') + ' hlp'; });
  return m;
}

/* ---------- Vedic steps ---------- */
function gVedic(a, c, p) {
  var k = c.k, A = k.ascSign, P = k.P, T = a.T, H = T.h, S = [], ve = a.ve, n1 = p.name.split(' ')[0];
  function lordLine(h) { var L = gLordOf(A, h), q = P[L]; return { L: L, t: 'Its lord ' + CQ_PN[L] + ' sits in the ' + gNth(q.house) + ' house (' + G_HOUSE[q.house].split(',')[0] + ') in ' + J.SIGNS[q.sign] + ', ' + gDig(L, q) + (q.combust ? ', and combust (weakened by the Sun)' : '') + (q.retro && L !== 'Ra' && L !== 'Ke' ? ', retrograde' : '') + '.', k: [6, 8, 12].indexOf(q.house) >= 0 || /Debil|Enemy/.test(q.dignity || '') ? 'b' : /Exalt|Own|Moola/.test(q.dignity || '') || [1, 4, 5, 7, 9, 10, 11].indexOf(q.house) >= 0 ? 'g' : 'i' }; }
  function houseStep(h, title, learn) {
    var sg = (A + h - 1) % 12, occ = k.planets.filter(function (q) { return q.house === h; }), asp = J.aspectsOnHouse(k, h).filter(function (x) { return P[x].house !== h; }), ll = lordLine(h), read = [];
    read.push({ k: 'i', t: 'The ' + gNth(h) + ' house is ' + J.SIGNS[sg] + '.' });
    read.push(occ.length ? { k: occ.some(function (q) { return ['Sa', 'Ma', 'Ra', 'Ke'].indexOf(q.code) >= 0; }) && [3, 6, 10, 11].indexOf(h) < 0 ? 'b' : 'g', t: 'Planets in it: ' + occ.map(function (q) { return CQ_PN[q.code] + ' (' + G_KAR[q.code].split(',')[0] + ')'; }).join(', ') + '.' } : { k: 'i', t: 'No planet sits in it, so its lord decides the result.' });
    if (asp.length) read.push({ k: asp.indexOf('Ju') >= 0 ? 'g' : asp.some(function (x) { return x === 'Sa' || x === 'Ma'; }) ? 'b' : 'i', t: 'Aspected by ' + asp.map(function (x) { return CQ_PN[x]; }).join(', ') + (asp.indexOf('Ju') >= 0 ? ': Jupiter\'s aspect protects.' : '.') });
    read.push(ll);
    if (c.av) { var b = c.av.sav[sg]; read.push({ k: b >= 30 ? 'g' : b <= 24 ? 'b' : 'i', t: 'Ashtakavarga: ' + b + ' bindus (28 is average)' + (b >= 30 ? ', good support.' : b <= 24 ? ', weak support.' : '.') }); }
    S.push({ t: title, chart: { id: 'D1', hl: [h, P[ll.L].house], hp: occ.map(function (q) { return q.code; }).concat([ll.L]) }, learn: learn, read: read });
  }
  /* 1. lagna */
  var L1 = gLordOf(A, 1), q1 = P[L1];
  S.push({ t: 'Start with the lagna', chart: { id: 'D1', hl: [1, q1.house], hp: [L1] }, learn: 'Every reading starts with the lagna (1st house) and its lord. They show the body and the person\'s ability to handle problems. A strong lagna lord means problems get solved; a weak one means more support is needed.',
    read: [{ k: 'i', t: n1 + ' has ' + J.SIGNS[A] + ' lagna, in ' + k.ascNak.name + ' nakshatra.' }, lordLine(1)].concat(k.planets.filter(function (q) { return q.house === 1; }).map(function (q) { return { k: ['Ju', 'Ve', 'Me', 'Mo'].indexOf(q.code) >= 0 ? 'g' : 'b', t: CQ_PN[q.code] + ' sits in the lagna: ' + G_KAR[q.code] + ' colour the person.' }; })) });
  /* 2. houses of the matter */
  if (T.med) {
    houseStep(6, 'The 6th house: illness', 'The 6th house shows illness and how the body fights it. Its sign, the planets in it and where its lord goes show which kind of trouble comes.');
    houseStep(8, 'The 8th house: chronic trouble and surgery', 'The 8th house shows long-lasting illness, operations and sudden events. Mars, Ketu or Saturn linked here often show surgery.');
    houseStep(12, 'The 12th house: hospital and expenses', 'The 12th house shows hospital stays, expenses and rest. When its lord or a malefic is active in the dasha, hospital visits come.');
    S.push({ t: 'The Moon: mind and healing', chart: { id: 'D1', hl: [P.Mo.house], hp: ['Mo'] }, learn: 'The Moon is the mind and the body\'s fluids. A strong Moon heals fast and keeps morale up; an afflicted Moon makes illness feel heavier.', read: [{ k: /Debil|Enemy/.test(P.Mo.dignity || '') ? 'b' : 'g', t: 'Moon is in ' + J.SIGNS[P.Mo.sign] + ' in the ' + gNth(P.Mo.house) + ' house, ' + gDig('Mo', P.Mo) + '.' }].concat(k.planets.filter(function (q) { return q.code !== 'Mo' && q.sign === P.Mo.sign; }).map(function (q) { return { k: ['Sa', 'Ra', 'Ke', 'Ma'].indexOf(q.code) >= 0 ? 'b' : 'g', t: CQ_PN[q.code] + ' is with the Moon.' }; })) });
  } else {
    houseStep(H, 'The ' + gNth(H) + ' house: ' + T.l.toLowerCase(), 'This problem is read from the ' + gNth(H) + ' house, the house of ' + G_HOUSE[H] + '. Look at its sign, the planets in it, the aspects on it, and above all where its lord sits.');
    T.also.forEach(function (h2) { var L2 = gLordOf(A, h2); S.push({ t: 'Supporting house: ' + gNth(h2), chart: { id: 'D1', hl: [h2, P[L2].house], hp: [L2] }, learn: 'The ' + gNth(h2) + ' house (' + G_HOUSE[h2] + ') supports this matter. Check whether its lord is linked to the ' + gNth(H) + ' house or its lord.', read: [lordLine(h2)].concat(P[L2].house === H ? [{ k: 'g', t: 'Its lord sits in the ' + gNth(H) + ' house: the two matters join.' }] : []) }); });
  }
  /* 3. karaka */
  var kar = T.kar === 'spouse' ? [p.gender === 'F' ? 'Ju' : 'Ve'] : T.kar;
  S.push({ t: 'The karaka', chart: { id: 'D1', hl: kar.map(function (x) { return P[x].house; }), hp: kar }, learn: 'Every matter also has a natural significator, the karaka: ' + kar.map(function (x) { return CQ_PN[x] + ' (' + G_KAR[x] + ')'; }).join('; ') + '. Even when the house is fine, a weak karaka reduces the result.',
    read: kar.map(function (x) { var q = P[x]; return { k: [6, 8, 12].indexOf(q.house) >= 0 || /Debil|Enemy/.test(q.dignity || '') ? 'b' : 'g', t: CQ_PN[x] + ' is in ' + J.SIGNS[q.sign] + ' in the ' + gNth(q.house) + ' house, ' + gDig(x, q) + (q.combust ? ', combust' : '') + '.' }; }) });
  /* 4. divisional chart */
  var dn = T.d, dL = gLordOf(A, H), dla = J.varga(k.asc, dn).sign, dv = J.varga(P[dL].lon, dn), dh = J.houseFrom(dla, dv.sign), vf = ve.f.filter(function (x) { return x.src === 'D' + dn; });
  S.push({ t: 'Confirm in D' + dn, chart: { id: 'D' + dn, hl: [1, dh], hp: [dL].concat(kar) }, learn: 'A promise in D1 must be confirmed in the divisional chart of the matter: D' + dn + ' (' + (J.VARGAS.filter(function (v) { return v[0] === dn; })[0] || ['', '', ''])[2].toLowerCase() + '). If the lord is strong here too, the result is reliable.',
    read: [{ k: 'i', t: 'D' + dn + ' lagna is ' + J.SIGNS[dla] + '. ' + CQ_PN[dL] + ' (lord of the ' + gNth(H) + ') is in ' + J.SIGNS[dv.sign] + ', the ' + gNth(dh) + ' house of D' + dn + '.' }].concat(vf.map(function (x) { return { k: x.s > 0 ? 'g' : 'b', t: x.t }; })) });
  /* 5. promise summary */
  S.push({ t: 'What the birth chart promises', chart: { id: 'D1', hl: [H], hp: [dL].concat(kar) }, learn: 'Now add up what you saw: supportive points against obstructive ones. This tells you whether the matter is promised in life at all, before looking at timing.',
    read: ve.f.slice().sort(function (x, y) { return y.s - x.s; }).map(function (x) { return { k: x.s > 0 ? 'g' : x.s < 0 ? 'b' : 'i', t: x.src + ': ' + x.t }; }), so: 'Vedic verdict: ' + ve.verdict + (ve.surg ? '. Surgery: ' + ve.surg.iword.toLowerCase() + '; ' + ve.surg.rword.toLowerCase() : '') + '.' });
  /* 6. dasha now */
  var nv = a.now.ve;
  S.push({ t: 'The dasha running now', chart: { id: 'D1', hl: nv.rows.map(function (r) { return P[r.lord].house; }), hp: nv.rows.map(function (r) { return r.lord; }) }, learn: 'The birth chart shows what is possible; the dasha shows when it happens. Check what the running Mahadasha, Antardasha and Pratyantar lords rule and where they sit.' + (T.med ? ' Lords that rule or sit in the 6th, 8th or 12th bring illness and hospital periods.' : ''),
    read: nv.rows.map(function (r) { return { k: r.notes.some(function (n) { return /illness|6th|8th|12th|strain/.test(n); }) ? 'b' : r.notes.length ? 'g' : 'i', t: r.lvl + ' of ' + CQ_PN[r.lord] + ' (till ' + N.dmy(r.end) + '): ' + (r.notes.length ? r.notes.join('; ') : 'not directly linked to this matter') + '.' }; }),
    so: T.med ? (nv.status === 'off' ? 'The running period is a sensitive one for health.' : nv.status === 'mixed' ? 'The running period is partly sensitive for health.' : 'The running period does not press on health.') : (nv.status === 'on' ? 'The running period activates this matter.' : nv.status === 'off' ? 'The running period works against this matter for now.' : 'The running period is mixed for this matter.') });
  /* 7. transits now */
  var al = a.now.alerts || [];
  S.push({ t: 'Transits now', chart: { id: 'TR', hl: T.med ? [1, 6, 8] : [H, 1], hp: ['Sa', 'Ju', 'Ra', 'Ke', 'Ma'] }, learn: 'Transits trigger what the dasha allows. Look at slow planets (Saturn, Jupiter, Rahu, Ketu) and Mars over the lagna, the natal Moon and the house of the matter. Jupiter and Saturn together on a house is the classic double transit for events.',
    read: nv.tr.concat(ve.transit).map(function (x) { return { k: x.s > 0 ? 'g' : 'b', t: x.t }; }).concat(al.map(function (w) { return { k: 'b', t: (w.level === 'high' ? 'High-care' : 'Watch') + ' window ' + N.dmy(w.start) + ' to ' + N.dmy(w.end) + ': ' + (w.why || []).slice(0, 2).map(function (y) { return (y.t || y).toString().replace(/\.$/, ''); }).join('; ') + '.' }; })).concat(nv.tr.length || ve.transit.length || al.length ? [] : [{ k: 'i', t: 'No major transit on these points right now.' }]) });
  /* 8. timing */
  S.push({ t: 'When it happens', chart: { id: 'D1', hl: [H], hp: ve.windows.map(function (w) { return w.ad; }) }, learn: 'Good periods are those whose lords are linked to the house of the matter. When Jupiter and Saturn also touch that house in the same period, the event is most likely.',
    read: ve.windows.length ? ve.windows.map(function (w) { return { k: w.dt ? 'g' : 'i', t: N.dmy(w.start) + ' to ' + N.dmy(w.end) + ': ' + CQ_PN[w.md] + '–' + CQ_PN[w.ad] + '. ' + w.why + (w.dt ? '. Double transit falls inside it.' : '.') }; }) : [{ k: 'i', t: 'No dasha period in the next 6 years is strongly linked to this house.' }] });
  return S;
}

/* ---------- KP steps ---------- */
function gKP(a, c, p) {
  var kk = c.kp, S = [], sig = c.sig;
  S.push({ t: 'The KP chart', chart: { id: 'KP', hl: a.kp.checks.map(function (ch) { return ch.cusp; }), hp: [] }, learn: 'KP uses Placidus house cusps and the KP ayanamsa. Each cusp falls in a sign, a star (nakshatra) and a sub. The sub lord of the cusp decides whether that house\'s matter happens. An exact birth time matters: a few minutes can change a sub lord.',
    read: a.kp.checks.map(function (ch) { var cu = kk.cusps[ch.cusp - 1]; return { k: 'i', t: gNth(ch.cusp) + ' cusp: ' + J.SIGNS[cu.sign] + ' ' + cu.deg + '. Sign lord ' + CQ_PN[cu.kp.sign] + ', star lord ' + CQ_PN[cu.kp.star] + ', sub lord ' + CQ_PN[cu.kp.sub] + '.' }; }) });
  a.kp.checks.forEach(function (ch) {
    var st = ch.st, q = kk.P[ch.csl];
    S.push({ t: ch.label.replace('?', '') + ': the sub lord', chart: { id: 'KP', hl: [ch.cusp, q.bhava], hp: [ch.csl] }, learn: 'Find the sub lord of the ' + gNth(ch.cusp) + ' cusp (' + ch.label.toLowerCase().replace('?', '') + '). It is the judge for this question.',
      read: [{ k: 'i', t: 'The ' + gNth(ch.cusp) + ' cusp sub lord is ' + CQ_PN[ch.csl] + '. It sits in the ' + gNth(q.bhava) + ' bhava, in the star of ' + CQ_PN[st.star.lord] + '.' }, { k: 'i', t: CQ_PN[ch.csl] + ' itself signifies houses ' + (st.planet.houses.join(', ') || 'none') + '.' }] });
    S.push({ t: 'Is it promised? (the star lord)', chart: { id: 'KP', hl: [ch.cusp].concat(st.star.houses.slice(0, 4)), hp: [st.star.lord] }, learn: 'The star lord of the sub lord shows the matter. Supporting houses here: ' + ch.fav.join(', ') + '. Opposing houses: ' + ch.neg.join(', ') + '. If the supporting houses appear, the matter is promised.',
      read: ch.why.slice(1, 3), so: 'KP: ' + ch.verdict + '.' });
    S.push({ t: 'Will it fructify? (the result step)', chart: { id: 'KP', hl: st.subStar.houses.slice(0, 4), hp: [st.sub.lord, st.subStar.lord] }, learn: 'Then check the sub lord of the sub lord and its star. If it also shows supporting houses, the matter fructifies; if it shows opposing houses, it gets stuck or delayed.', read: ch.why.slice(3) });
  });
  var main = a.kp.checks[a.kp.checks.length > 1 && a.T.med ? 1 : 0], hs = main.fav.slice(0, 3);
  S.push({ t: 'Who can deliver it: significators', chart: { id: 'KP', hl: hs, hp: [] }, learn: 'Planets that signify the supporting houses give the result in their periods. Level A (in the star of an occupant) is strongest, then B (occupants), C (in the star of the owner), D (the owner).',
    read: hs.map(function (h) { var x = sig.houses[h - 1], lv = [['A', x.A], ['B', x.B], ['C', x.C], ['D', x.D]].filter(function (y) { return y[1].length; }); return { k: 'i', t: 'House ' + h + ': ' + (lv.map(function (y) { return y[0] + ' ' + y[1].map(function (z) { return CQ_PN[z]; }).join(', '); }).join(' · ') || 'no significators') + '.' }; }) });
  var nk = a.now.kp;
  S.push({ t: 'Running periods now (DBA)', chart: { id: 'KP', hl: [], hp: nk.rows.map(function (r) { return r.lord; }) }, learn: 'Now check the running Dasha, Bhukti and Antara lords. If they signify the supporting houses, the matter is active now; if they signify the opposing houses, it is blocked for now.' + (a.T.med ? ' For health: lords signifying 6, 8 and 12 bring illness; 1, 5 and 11 bring recovery.' : ''),
    read: nk.rows.map(function (r) { return { k: r.neg.length > r.fav.length ? 'b' : r.fav.length ? 'g' : 'i', t: r.lvl + ' ' + CQ_PN[r.lord] + ' (till ' + N.dmy(r.end) + ') signifies ' + (r.sig.join(', ') || 'none') + (r.fav.length ? ': supports via ' + r.fav.join(', ') : '') + (r.neg.length ? (r.fav.length ? '; ' : ': ') + 'opposes via ' + r.neg.join(', ') : '') + '.' }; }),
    so: a.T.med ? (nk.status === 'off' ? 'Right now the period lords point to illness: care is needed now.' : nk.status === 'on' ? 'Right now the period lords support recovery.' : 'Right now the period is mixed for health.') : (nk.status === 'on' ? 'The matter is active now.' : nk.status === 'off' ? 'The matter is blocked for now.' : 'The present period is mixed.') });
  if (a.kp.rp) S.push({ t: 'Ruling planets', chart: { id: 'KP', hl: [], hp: a.kp.rp.set }, learn: 'Ruling planets at the moment of the question confirm the answer and pick the timing: of the possible periods, the one run by ruling planets is chosen.', read: [{ k: 'i', t: a.kp.rp.t }] });
  S.push({ t: 'When it happens', chart: { id: 'KP', hl: main.fav, hp: main.windows.map(function (w) { return w.pd; }) }, learn: 'Timing: a period where the Dasha, Bhukti and Antara lords all signify the supporting houses. Windows run by ruling planets are the most likely.',
    read: main.windows.length ? main.windows.map(function (w) { return { k: w.rank === 2 ? 'g' : 'i', t: N.dmy(w.start) + ' to ' + N.dmy(w.end) + ': ' + CQ_PN[w.md] + '–' + CQ_PN[w.ad] + '–' + CQ_PN[w.pd] + (w.rp && w.rp.length ? ' (ruling planet ★)' : '') + '.' }; }) : [{ k: 'i', t: 'No period in the next 6 years where all three lords support it.' }] });
  return S;
}
function gFinal(a, sys) {
  var rem = a.rem.planets.filter(function (r) { return r.why.some(function (w) { return w.indexOf(sys === 'v' ? 'Vedic' : 'KP') === 0; }); });
  if (!rem.length) rem = a.rem.planets;
  return { t: 'Conclusion and remedy', final: true, learn: 'Put it together: the promise, the present period and the timing. Then pick remedies for the planet that blocks the matter and for the planet whose period brings the result.', so: a.tell.text, rem: rem, steps: a.rem.steps };
}

function GuideScreen(id, sys, si) {
  var cs = caseById(id), p = cs && person(cs.pid); if (!cs || !p) return '<div class="empty"><h2>Not found</h2><button class="btn" data-go="q">Back</button></div>';
  var a = caseAnswer(cs), c = calcP(p), S = (sys === 'k' ? gKP(a, c, p) : gVedic(a, c, p)).concat([gFinal(a, sys)]), i = Math.max(0, Math.min(S.length - 1, +si || 0)), st = S[i];
  var h = '<div class="v4sky slim">' + v4stars(40, 7) + '<div class="v4top"><div class="dt"><button class="cqback" data-go="q/' + id + '">‹ Answer</button><b class="nm">' + esc(a.T.l) + ' · ' + (sys === 'k' ? 'KP' : 'Vedic') + '</b><small>' + esc(p.name) + ' · step ' + (i + 1) + ' of ' + S.length + '</small></div></div>';
  h += '<div class="gdots">' + S.map(function (x, j) { return '<button data-go="q/' + id + '/' + sys + '/' + j + '" class="' + (j === i ? 'on' : j < i ? 'done' : '') + '" aria-label="Step ' + (j + 1) + '"></button>'; }).join('') + '</div></div><div class="pad">';
  h += '<h2 class="gt">' + (i + 1) + '. ' + esc(st.t) + '</h2>';
  if (st.chart) { var m = gModel(c, st.chart.id, st.chart.hp); h += '<div class="card gchart">' + Charts.north(m.rows, m.signs, { hl: (st.chart.hl || []).filter(function (x, k2, arr) { return x && arr.indexOf(x) === k2; }) }) + '<div class="gcap">' + esc(m.title) + (st.chart.hl && st.chart.hl.length ? ' · highlighted: house ' + st.chart.hl.filter(function (x, k2, arr) { return x && arr.indexOf(x) === k2; }).join(', ') : '') + (st.chart.hp && st.chart.hp.length ? ' · planets in red: ' + st.chart.hp.filter(function (x, k2, arr) { return arr.indexOf(x) === k2; }).map(function (x) { return CQ_PN[x] || x; }).join(', ') : '') + '</div></div>'; }
  h += '<div class="card glearn"><div class="lbl2">What to look at</div><p>' + esc(st.learn) + '</p></div>';
  if (st.read && st.read.length) h += '<div class="card"><div class="lbl2">In ' + esc(p.name.split(' ')[0]) + '\'s chart</div><ul class="cqwhy">' + st.read.map(function (r) { return '<li>' + cqIcon(r.k) + '<span>' + esc(r.t) + '</span></li>'; }).join('') + '</ul></div>';
  if (st.so) h += '<div class="card gso"><div class="lbl2">' + (st.final ? 'Tell the customer' : 'So') + '</div><p>' + esc(st.so) + '</p></div>';
  if (st.final) {
    h += '<div class="card"><div class="lbl2">Remedies, with the reason</div>' + st.rem.map(function (r) { return '<div class="cqrem"><div class="cqck"><b>' + CQ_PN[r.planet] + '</b><span class="chip ' + (r.mode === 'pacify' ? 'w' : 'g') + '">' + (r.mode === 'pacify' ? 'Ease its block' : 'Strengthen it') + '</span></div><p class="why">' + r.why.map(esc).join('<br>') + '</p><ul class="cqwhy"><li><i>☀</i><span><b>' + r.day + ':</b> chant ' + esc(r.mantra) + (/Chalisa|prayer/.test(r.mantra) ? '' : ' 108 times') + '.</span></li><li><i>❁</i><span>Give ' + esc(r.give) + ' on ' + r.day + '.</span></li><li><i>✓</i><span>' + esc(r.act) + '.</span></li></ul></div>'; }).join('') +
      '<div class="lbl3">Practical steps</div><ul class="cqwhy">' + st.steps.map(function (s, j) { return '<li><i>' + (j + 1) + '</i><span>' + esc(s) + '</span></li>'; }).join('') + '</ul></div>';
    h += '<button class="v4btn" data-go="q/' + id + '/' + (sys === 'k' ? 'v' : 'k') + '/0" style="width:100%;margin-bottom:10px">Now read it with ' + (sys === 'k' ? 'Vedic' : 'KP') + '</button>';
  }
  h += '<div class="gnav">' + (i > 0 ? '<button data-go="q/' + id + '/' + sys + '/' + (i - 1) + '">‹ Back</button>' : '<button data-go="q/' + id + '">‹ Answer</button>') + (i < S.length - 1 ? '<button class="nx" data-go="q/' + id + '/' + sys + '/' + (i + 1) + '">Next step ›</button>' : '<button class="nx" data-go="q/' + id + '">Done</button>') + '</div>';
  if (ltProv()) h += '<button class="v4link" data-act="gAsk" data-id="' + id + '" data-s="' + sys + '" data-i="' + i + '" style="display:block;margin:12px auto">Ask AI to explain this step more ›</button>';
  return h + '</div><div style="height:80px"></div>';
}
ACT.gAsk = function (el) { var cs = caseById(el.dataset.id), a = caseAnswer(cs), p = person(cs.pid), S = (el.dataset.s === 'k' ? gKP(a, calcP(p), p) : gVedic(a, calcP(p), p)), st = S[+el.dataset.i] || {}; U.cur = cs.pid; U.ltPend = 'Explain this ' + (el.dataset.s === 'k' ? 'KP' : 'Vedic') + ' step for the ' + a.T.l.toLowerCase() + ' question, in simple words, and what I should tell the customer: "' + st.t + '". Facts: ' + (st.read || []).map(function (r) { return r.t; }).join(' ') + (st.so ? ' ' + st.so : ''); go('ai'); };

/* routing: q/<id>/v/<step> and q/<id>/k/<step>; buttons on the answer screen */
(function () {
  var r0 = render;
  render = function () {
    var pr = parts(); if (pr[0] !== 'q' || !pr[2]) return r0();
    applySettings(); var html; try { html = GuideScreen(pr[1], pr[2], pr[3]); } catch (e) { html = '<div class="empty"><h2>Something went wrong</h2>' + esc(e.message) + '<br><br><button class="btn" data-go="q">Back</button></div>'; if (window.console) console.error(e); }
    $('#app').innerHTML = html; $('#nav').innerHTML = NAVS.map(function (x) { return '<button data-go="' + x[0] + '" class="' + (x[0] === 'q' ? 'on' : '') + '">' + icon(x[0]) + x[1] + '</button>'; }).join('');
    document.body.setAttribute('data-scr', 'q'); window.scrollTo(0, 0);
  };
  var as = AnswerScreen; AnswerScreen = function (id) {
    var h = as(id), i = h.indexOf('<div class="card cqtell'); if (i < 0) return h;
    var g = '<div class="gpick"><button data-go="q/' + id + '/v/0"><b>Vedic, step by step</b><small>Lagna → houses → lord → karaka → divisional chart → dasha → transits → remedy</small></button><button data-go="q/' + id + '/k/0"><b>KP, step by step</b><small>Cusps → sub lord → star lord → result step → significators → DBA → ruling planets → remedy</small></button></div>';
    return h.slice(0, i) + g + h.slice(i);
  };
})();
render();
