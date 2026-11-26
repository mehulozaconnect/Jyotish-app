/* Trikaal 7: answer a customer's problem through Vedic (Parashari, Lahiri) and KP (Placidus, KP ayanamsa, KSK rules).
   Everything here is worked out by rule from the exact chart, and every result carries its reasons:
   - KP: cusp sub lord of the matter's house -> houses it signifies (4-step) -> promised or not; period lords that signify the
     right houses -> date windows; today's ruling planets -> confirmation.
   - Vedic: house, its lord, occupants, aspects, Ashtakavarga, karaka, the matter's divisional chart -> promise; dasha lords
     linked to the house -> date windows; Jupiter and Saturn double transit -> confirmation.
   - Remedies: for the planet that actually blocks the matter (KP sub lord or Vedic affliction) and for the planet whose period
     gives the result, with the reason written next to each. */
function makeConsult(J, C, N) {
  var PN = { Su: 'Sun', Mo: 'Moon', Ma: 'Mars', Me: 'Mercury', Ju: 'Jupiter', Ve: 'Venus', Sa: 'Saturn', Ra: 'Rahu', Ke: 'Ketu' }, SG = J.SIGNS, DAY = 864e5;
  function nth(n) { var s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
  function uniq(a) { var o = []; a.forEach(function (x) { if (o.indexOf(x) < 0) o.push(x); }); return o.sort(function (x, y) { return x - y; }); }
  function hit(a, b) { return (b || []).filter(function (x) { return a.indexOf(x) >= 0; }); }
  function list(a) { return a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  /* extra KP matters on top of the standard ones */
  N.KP_MATTERS.harmony = { l: 'Harmony in marriage', cusps: [7], fav: [2, 7, 11], neg: [1, 6, 10, 12] };
  N.KP_MATTERS.surg = { l: 'Surgery shown', cusps: [8, 6], fav: [6, 8, 12], neg: [1, 5, 11] };
  N.KP_MATTERS.peace = { l: 'Peace of mind', cusps: [4], fav: [1, 4, 11], neg: [3, 8, 12] };
  N.KP_MATTERS.debt = { l: 'Debt clearing', cusps: [6, 11], fav: [6, 11, 2], neg: [5, 8, 12] };

  /* problems the customer brings: KP checks, Vedic houses, karakas and divisional chart, age limits */
  var TOPICS = [
    { id: 'job', l: 'Job / career', q: 'Will a better job or growth come, and when?', ev: 'a better job or growth', kp: [['job', 'Is a better job or growth promised?']], h: 10, also: [6, 11], kar: ['Su', 'Sa'], d: 10, min: 16 },
    { id: 'business', l: 'Business loss', q: 'Will the business recover and gain, and when?', ev: 'business gain', kp: [['business', 'Is business gain promised?']], h: 7, also: [10, 11], kar: ['Me'], d: 10, min: 16 },
    { id: 'marriage', l: 'Marriage delay', q: 'Will marriage happen, and when?', ev: 'marriage', kp: [['marriage', 'Is marriage promised?']], h: 7, also: [2, 11], kar: 'spouse', d: 9, min: 18 },
    { id: 'married', l: 'Married life', q: 'Will peace and harmony return in married life?', ev: 'harmony in marriage', kp: [['harmony', 'Is harmony promised?']], h: 7, also: [2, 4], kar: 'spouse', d: 9, min: 18 },
    { id: 'money', l: 'Money / debt', q: 'Will money improve and debts clear, and when?', ev: 'money gain and relief from debt', kp: [['money', 'Is money gain promised?'], ['debt', 'Will debts clear?']], h: 11, also: [2, 6], kar: ['Ju'], d: 2, min: 16 },
    { id: 'health', l: 'Health', q: 'Will health recover, and when?', ev: 'recovery', kp: [['health', 'Is recovery promised?']], h: 1, also: [6, 8], kar: ['Su', 'Mo'], d: 6, med: true },
    { id: 'surgery', l: 'Surgery', q: 'Is surgery shown, should they go ahead, and when?', ev: 'a successful surgery', kp: [['surg', 'Is surgery shown in the chart?'], ['health', 'Will it go well, with good recovery?']], h: 8, also: [6, 1], kar: ['Ma', 'Ke'], d: 6, med: true, surgery: true },
    { id: 'child', l: 'Childbirth', q: 'Will a child come, and when?', ev: 'childbirth', kp: [['child', 'Is childbirth promised?']], h: 5, also: [2, 11], kar: ['Ju'], d: 7, min: 18, max: 55 },
    { id: 'study', l: 'Child / studies', q: 'Will studies and exams go well, and when?', ev: 'success in studies', kp: [['study', 'Is success in studies promised?']], h: 4, also: [5, 9], kar: ['Me', 'Ju'], d: 24, min: 4 },
    { id: 'property', l: 'Property / house', q: 'Will they buy a house or property, and when?', ev: 'buying property', kp: [['property', 'Is property purchase promised?']], h: 4, also: [11, 2], kar: ['Ma'], d: 4, min: 18 },
    { id: 'foreign', l: 'Foreign / visa', q: 'Will foreign travel or settling abroad happen, and when?', ev: 'going abroad', kp: [['foreign', 'Is going abroad promised?']], h: 12, also: [9, 3], kar: ['Ra'], d: 4, min: 16 },
    { id: 'court', l: 'Court case', q: 'Will they win the court case or dispute, and when?', ev: 'winning the dispute', kp: [['legal', 'Is victory promised?']], h: 6, also: [11, 1], kar: ['Ma', 'Sa'], d: 6, min: 18 },
    { id: 'peace', l: 'Peace of mind', q: 'When will peace of mind return?', ev: 'peace of mind', kp: [['peace', 'Is peace of mind promised?']], h: 4, also: [1, 5], kar: ['Mo'], d: 9 }
  ];
  function topicsFor(age) { return TOPICS.filter(function (t) { return (t.min == null || age >= t.min) && (t.max == null || age <= t.max); }); }
  function topic(id) { return TOPICS.filter(function (t) { return t.id === id; })[0]; }

  /* ---------- remedies (free or low cost, by planet) ---------- */
  var REM = {
    Su: { day: 'Sunday', mantra: 'Om Suryaya Namah', give: 'wheat or jaggery', act: 'Offer water to the rising Sun; respect father and seniors' },
    Mo: { day: 'Monday', mantra: 'Om Somaya Namah', give: 'rice, milk or white clothes', act: 'Offer water on a Shivling; keep good ties with the mother; sleep on time' },
    Ma: { day: 'Tuesday', mantra: 'Hanuman Chalisa once a day', give: 'red masoor dal', act: 'Control anger; donate blood if fit; help brothers' },
    Me: { day: 'Wednesday', mantra: 'Om Budhaya Namah', give: 'green moong or green grass for a cow', act: 'Keep promises and paperwork clean; respect sisters and aunts' },
    Ju: { day: 'Thursday', mantra: 'Om Gurave Namah', give: 'chana dal or turmeric at a temple', act: 'Respect teachers and elders; feed a Brahmin or a needy student' },
    Ve: { day: 'Friday', mantra: 'Om Shukraya Namah', give: 'white sweets, rice or curd', act: 'Respect the wife or women at home; keep the home clean and pleasant' },
    Sa: { day: 'Saturday', mantra: 'Om Sham Shanaishcharaya Namah', give: 'mustard oil or black sesame', act: 'Help workers and the elderly; be honest and patient; light a mustard-oil lamp under a peepal tree' },
    Ra: { day: 'Saturday', mantra: 'Om Rahave Namah, or Durga Chalisa', give: 'a blanket or food to sweepers', act: 'Avoid shortcuts, alcohol and gossip; keep the home toilet clean' },
    Ke: { day: 'Tuesday or Thursday', mantra: 'Om Ketave Namah, or Ganesh prayer', give: 'a blanket, or feed street dogs', act: 'Meditate a few minutes daily; finish work you start' }
  };
  var STEPS = {
    job: ['Update the CV and meet seniors and contacts before the best window opens.', 'Do not quit in anger outside the window; move when the offer is in hand.'],
    business: ['Cut avoidable costs and collect pending dues first.', 'Sign big deals or expand inside the best window, not before.'],
    marriage: ['Increase meetings and introductions before and during the best window.', 'Match kundlis carefully; do not rush a match just to beat a delay.'],
    married: ['Talk calmly at a fixed time each week; avoid arguments on high-tension days.', 'Do one shared activity together each week.'],
    money: ['List debts and clear the highest-interest one first.', 'Avoid new loans and lending outside the best window.'],
    health: ['Follow the doctor\'s treatment fully; astrology only guides timing.', 'Keep sleep, food and medicine on time, especially in the care periods.'],
    surgery: ['The doctor decides whether surgery is needed. Astrology helps choose a better date and prepare.', 'If it is not urgent, prefer the best window and the good dates listed; in an emergency, do not wait for a date.', 'Keep the family informed and follow post-operative care strictly.'],
    child: ['Follow the doctor\'s guidance and tests; plan around the best window.', 'Keep both partners\' health routine steady.'],
    study: ['Fix a daily study time; revise in the mornings.', 'Take exams and admissions in the best window where possible.'],
    property: ['Check documents with a lawyer before paying.', 'Book or register inside the best window.'],
    foreign: ['Keep documents ready; apply in the best window.', 'Avoid agents promising shortcuts.'],
    court: ['Keep papers in order and follow the lawyer\'s advice.', 'Try settlement talks in the best window; avoid new disputes.'],
    peace: ['Ten minutes of slow breathing or prayer each morning.', 'Reduce screen time at night; talk to someone you trust.']
  };

  /* ---------- KP ---------- */
  /* KSK: the cusp sub lord's star lord shows whether the matter is there (houses signified); the sub lord's own star decides
     whether it fructifies. Supporting houses count fully, opposing houses count at 0.6 because most planets touch a few. */
  function kpJudge(sig, cusp, m) {
    var csl = sig.houses[cusp - 1].csl, st = sig.steps[csl], s12 = uniq(st.planet.houses.concat(st.star.houses)), s4 = st.subStar.houses;
    var pf = hit(m.fav, s12), pn = hit(m.neg, s12), of = hit(m.fav, s4), on = hit(m.neg, s4), key = s12.indexOf(cusp) >= 0 || s12.indexOf(11) >= 0;
    var star = pf.length - 0.6 * pn.length, res = of.length - 0.6 * on.length, level;
    if (!pf.length) level = 'no';
    else if (star >= 1.4 && key && res > 0) level = 'strong';
    else if (star > 0 && res >= 0) level = 'yes';
    else if (star > 0 || res > 0) level = 'mixed';
    else if (pf.length >= 2) level = 'blocked';
    else level = 'no';
    return { cusp: cusp, csl: csl, st: st, pf: pf, pn: pn, of: of, on: on, level: level };
  }
  function kpAnswer(c, T, now, lat, lon, tz) {
    var maha = J.dashas(c.birth, c.kp.P.Mo.lon), rp = null;
    try { rp = J.rulingPlanets(now, lat, lon, tz, 'kp'); } catch (e) { }
    var rps = rp ? rp.set : null;
    var checks = T.kp.map(function (x) {
      var jm = N.judgeMatter(c.sig, x[0], maha, now, 6, rps), m = jm.m, js = kpJudge(c.sig, m.cusps[0], m), st = js.st, verd = N.VERD[js.level];
      var why = [];
      why.push({ k: 'i', t: nth(js.cusp) + ' cusp sub lord is ' + PN[js.csl] + ', in the star of ' + PN[st.star.lord] + '.' });
      var s12 = uniq(st.planet.houses.concat(st.star.houses));
      why.push({ k: js.pf.length ? 'g' : 'b', t: PN[js.csl] + ' signifies houses ' + s12.join(', ') + '. ' + (js.pf.length ? 'Supporting houses for this matter: ' + js.pf.join(', ') + '.' : 'None of the supporting houses (' + m.fav.join(', ') + ') are signified.') });
      if (js.pn.length) why.push({ k: 'b', t: 'It also signifies ' + js.pn.join(', ') + ', which work against it: expect delay, obstacles or a partial result.' });
      why.push({ k: js.of.length && !js.on.length ? 'g' : js.on.length ? 'b' : 'i', t: 'Result step: its sub lord ' + PN[st.sub.lord] + ' is in the star of ' + PN[st.subStar.lord] + ', which signifies ' + (st.subStar.houses.join(', ') || 'no houses') + (js.of.length && !js.on.length ? ': favourable.' : js.on.length ? ': resists the result.' : '.') });
      var wins = js.level === 'no' ? [] : T.med ? jm.timing.filter(function (w) { return w.rank >= 1; }).sort(function (a, b) { return a.start - b.start; }).slice(0, 3) : N.topWindows(jm.timing, 3);
      return { key: x[0], label: x[1], cusp: js.cusp, level: js.level, verdict: verd[0], tone: verd[1], csl: js.csl, why: why, windows: wins, fav: m.fav, neg: m.neg, sig: c.sig, st: st };
    });
    var rpNote = null;
    if (rp) {
      var main = checks[0], favRP = rp.set.filter(function (x) { var s = c.sig.sig[x] || []; return hit(main.fav, s).length > hit(main.neg, s).length; });
      rpNote = { set: rp.set, fav: favRP, t: 'Ruling planets at the time of the question: ' + rp.set.map(function (x) { return PN[x]; }).join(', ') + '. ' + (main.level === 'no' ? 'They cannot give what the cusp sub lord does not promise.' : favRP.length ? list(favRP.map(function (x) { return PN[x]; })) + (favRP.length > 1 ? ' signify' : ' signifies') + ' the supporting houses: windows in their periods (marked ★) are the most likely.' : 'None of them clearly signifies the supporting houses: the result is not ready yet; expect it later.') };
      checks.forEach(function (ch) { ch.windows.forEach(function (w) { w.rp = [w.ad, w.pd].filter(function (x) { return rp.set.indexOf(x) >= 0; }); }); });
    }
    return { checks: checks, rp: rpNote, maha: maha };
  }

  /* ---------- Vedic ---------- */
  var DG = { 'Exalted': 2, 'Moolatrikona': 1.5, 'Own sign': 1.5, 'Friendly sign': 0.5, 'Neutral sign': 0, 'Enemy sign': -0.7, 'Debilitated': -2 };
  function karakas(T, p) { return T.kar === 'spouse' ? [p.gender === 'F' ? 'Ju' : 'Ve'] : T.kar; }
  function vedicAnswer(c, T, p, now) {
    var k = c.k, A = k.ascSign, P = k.P, H = T.h, sgH = (A + H - 1) % 12, L = J.RULER[sgH], f = [], vs = 0, up = [3, 6, 10, 11].indexOf(H) >= 0, dus = [6, 8, 12].indexOf(H) >= 0;
    function add(s, t, src) { f.push({ s: s, t: t, src: src }); vs += s; }
    /* the house lord */
    var pl = P[L], d = DG[pl.dignity] || 0, hL = pl.house;
    add(d, nth(H) + ' lord ' + PN[L] + ' is in ' + SG[pl.sign] + ' (' + (pl.dignity || 'neutral').toLowerCase() + ').', 'D1');
    var own6812 = [6, 8, 12].some(function (x) { return J.RULER[(A + x - 1) % 12] === L; });
    if ([1, 4, 5, 7, 9, 10, 11].indexOf(hL) >= 0) add(1, PN[L] + ' sits in the ' + nth(hL) + ' house, a supportive place.', 'D1');
    else if ([6, 8, 12].indexOf(hL) >= 0) add(own6812 ? 0.3 : -1.5, PN[L] + ' sits in the ' + nth(hL) + ' house' + (own6812 ? ', but it also rules a dusthana, so this turns into Viparita Raja Yoga (gain after struggle).' : ', a house of loss and struggle.'), 'D1');
    if (pl.combust) add(-1, PN[L] + ' is combust (too close to the Sun): its results come weaker or late.', 'D1');
    /* occupants and aspects */
    k.planets.filter(function (q) { return q.house === H && q.code !== L; }).forEach(function (q) {
      var ben = ['Ju', 'Ve', 'Me', 'Mo'].indexOf(q.code) >= 0;
      add(ben ? 1 : up ? 0.5 : -1, PN[q.code] + ' sits in the ' + nth(H) + ' house' + (ben ? ', a benefic: helps.' : up ? ', a malefic in a growth house: gives push.' : ', a malefic: brings strain or delay.'), 'D1');
    });
    J.aspectsOnHouse(k, H).forEach(function (x) { if (P[x].house === H) return;
      if (x === 'Ju') add(1, 'Jupiter aspects the ' + nth(H) + ' house: protection and blessing.', 'D1');
      else if ((x === 'Sa' || x === 'Ma') && !up) add(-0.6, PN[x] + ' aspects the ' + nth(H) + ' house: pressure and delay.', 'D1'); });
    if (c.av && !dus) { var b = c.av.sav[sgH]; if (b >= 30) add(1, 'Ashtakavarga gives the ' + nth(H) + ' house ' + b + ' bindus: strong.', 'AV'); else if (b <= 24) add(-1, 'Ashtakavarga gives the ' + nth(H) + ' house only ' + b + ' bindus: weak support.', 'AV'); }
    /* karaka */
    karakas(T, p).forEach(function (x) { var q = P[x]; if (!q) return; var dd = x === 'Ra' || x === 'Ke' ? 0 : DG[q.dignity] || 0;
      if (Math.abs(dd) >= 0.5 || [6, 8, 12].indexOf(q.house) >= 0 || q.combust) add(dd * 0.6 + ([6, 8, 12].indexOf(q.house) >= 0 ? -0.5 : 0) + (q.combust ? -0.5 : 0), 'Karaka ' + PN[x] + (x === 'Ra' || x === 'Ke' ? ' is' : ' is ' + (q.dignity || 'neutral').toLowerCase()) + ' in the ' + nth(q.house) + ' house' + (q.combust ? ', combust' : '') + '.', 'D1'); });
    /* linked houses */
    T.also.forEach(function (h2) { var L2 = J.RULER[(A + h2 - 1) % 12]; if (L2 !== L && P[L2].house === H) add(0.5, nth(h2) + ' lord ' + PN[L2] + ' sits in the ' + nth(H) + ': the two matters join.', 'D1'); if (hL === h2) add(0.5, nth(H) + ' lord sits in the ' + nth(h2) + ': linked with ' + nth(h2) + ' house matters.', 'D1'); });
    /* divisional chart */
    var dn = T.d, dla = J.varga(k.asc, dn).sign, vx = J.varga(pl.lon, dn), dd2 = J.dignity(L, vx.sign * 30 + vx.deg), dh = J.houseFrom(dla, vx.sign);
    if (/Exalted|Own|Moola/.test(dd2)) add(1, 'In D' + dn + ', ' + PN[L] + ' is ' + dd2.toLowerCase().replace('moolatrikona', 'in own sign') + ': the promise holds.', 'D' + dn);
    else if (/Debilitated/.test(dd2)) add(-1, 'In D' + dn + ', ' + PN[L] + ' is debilitated: the promise is weaker than D1 shows.', 'D' + dn);
    if (vx.sign === pl.sign) add(0.5, PN[L] + ' is vargottama (same sign in D1 and D' + dn + '): steady results.', 'D' + dn);
    if ([1, 4, 5, 7, 9, 10].indexOf(dh) >= 0) add(0.5, 'In D' + dn + ', ' + PN[L] + ' is in the ' + nth(dh) + ' house from its lagna: supported.', 'D' + dn);
    else if ([6, 8, 12].indexOf(dh) >= 0) add(-0.5, 'In D' + dn + ', ' + PN[L] + ' is in the ' + nth(dh) + ' house from its lagna: obstacles.', 'D' + dn);
    var level = vs >= 2.5 ? 'strong' : vs >= 0.5 ? 'yes' : vs >= -1 ? 'effort' : 'weak';
    var VV = { strong: ['Strongly promised', 'good'], yes: ['Promised', 'good'], effort: ['Promised with effort or delay', 'mixed'], weak: ['Weak in the birth chart', 'bad'] };
    /* planets linked to this house, for timing */
    var link = {}; function lk(x, w, why) { if (!x) return; if (!link[x] || link[x].w < w) link[x] = { w: w, why: why }; }
    lk(L, 3, 'lord of the ' + nth(H)); k.planets.forEach(function (q) { if (q.house === H) lk(q.code, 2.5, 'sits in the ' + nth(H)); if (J.aspectedHouses(q.code, q.house).indexOf(H) >= 0) lk(q.code, 1.2, 'aspects the ' + nth(H)); if (q.nak.lord === L && q.code !== L) lk(q.code, 1.5, 'is in the star of the ' + nth(H) + ' lord'); });
    karakas(T, p).forEach(function (x) { lk(x, 2, 'karaka of this matter'); }); T.also.forEach(function (h2) { lk(J.RULER[(A + h2 - 1) % 12], 1, 'lord of the ' + nth(h2)); });
    var good = function (x) { return x === 'Ra' || x === 'Ke' ? 0 : (DG[P[x].dignity] || 0) + ([6, 8, 12].indexOf(P[x].house) >= 0 ? -1 : 0.5); };
    /* dasha windows in the next 6 years */
    var to = new Date(now.getTime() + 6 * 365.25 * DAY), wins = [];
    c.maha.forEach(function (md) { if (md.end <= now || md.start >= to) return; J.subPeriods(md).forEach(function (ad) { if (ad.end <= now || ad.start >= to) return;
      var sc = (link[ad.lord] ? link[ad.lord].w : 0) + 0.5 * (link[md.lord] ? link[md.lord].w : 0); if (sc < 2) return;
      sc += 0.6 * good(ad.lord); wins.push({ md: md.lord, ad: ad.lord, start: ad.start < now ? now : ad.start, end: ad.end > to ? to : ad.end, score: sc, why: PN[ad.lord] + ' ' + (link[ad.lord] ? link[ad.lord].why : 'runs inside ' + PN[md.lord] + ', which is ' + link[md.lord].why) }); }); });
    wins.forEach(function (w) { w.dt = doubleTransit(c, H, w.start, w.end); if (w.dt) w.score += 1; });
    var top = wins.slice().sort(function (a, b) { return b.score - a.score || a.start - b.start; }).slice(0, 3).sort(function (a, b) { return a.start - b.start; });
    /* transit now */
    var tr = [], sj = sgOf('Ju', now), ss = sgOf('Sa', now), hJ = J.houseFrom(A, sj), hS = J.houseFrom(A, ss);
    if (hJ === H || J.aspectedHouses('Ju', hJ).indexOf(H) >= 0) tr.push({ s: 1, t: 'Jupiter now ' + (hJ === H ? 'passes through' : 'aspects') + ' the ' + nth(H) + ' house: support right now.' });
    if (hS === H || J.aspectedHouses('Sa', hS).indexOf(H) >= 0) tr.push({ s: up ? 0.5 : -0.5, t: 'Saturn now ' + (hS === H ? 'passes through' : 'aspects') + ' the ' + nth(H) + ' house: ' + (up ? 'slow but steady push.' : 'tests patience; results come with effort.') });
    var sm = J.houseFrom(P.Mo.sign, ss); if (sm === 12 || sm === 1 || sm === 2) tr.push({ s: -0.5, t: 'Sade Sati is running (Saturn ' + nth(sm) + ' from the Moon): pressure, so go slowly.' });
    var out = { level: level, verdict: VV[level][0], tone: VV[level][1], score: Math.round(vs * 10) / 10, f: f, windows: top, transit: tr, H: H, lord: L, link: link };
    if (T.surgery) { out.surg = surgeryVedic(c, p, now); out.level = out.surg.iscore >= 2 ? 'strong' : out.surg.iscore >= 1 ? 'yes' : 'weak'; out.verdict = out.surg.iword; out.tone = out.surg.iscore >= 1 ? 'mixed' : 'good'; }
    return out;
  }
  function sgOf(x, d) { return Math.floor(((C.sidereal(x, d) % 360) + 360) % 360 / 30); }
  function doubleTransit(c, H, a, b) {
    var A = c.k.ascSign, hits = [];
    for (var t = a.getTime(); t <= b.getTime(); t += 30 * DAY) { var d = new Date(t), hJ = J.houseFrom(A, sgOf('Ju', d)), hS = J.houseFrom(A, sgOf('Sa', d));
      if ((hJ === H || J.aspectedHouses('Ju', hJ).indexOf(H) >= 0) && (hS === H || J.aspectedHouses('Sa', hS).indexOf(H) >= 0)) hits.push(d); }
    return hits.length ? { from: hits[0], to: hits[hits.length - 1] } : null;
  }
  /* surgery: is a surgical event shown, and how strong is recovery */
  function surgeryVedic(c, p, now) {
    var k = c.k, A = k.ascSign, P = k.P, ind = [], rec = [], is = 0, rs = 0;
    function I(s, t) { ind.push({ s: s, t: t }); is += s; } function R(s, t) { rec.push({ s: s, t: t }); rs += s; }
    var L8 = J.RULER[(A + 7) % 12], L6 = J.RULER[(A + 5) % 12], L1 = J.RULER[A];
    ['Ma', 'Ke', 'Sa'].forEach(function (x) { var q = P[x]; if (q.house === 8 || q.house === 6 || q.house === 1) I(1, PN[x] + ' in the ' + nth(q.house) + ' house: an operation-type event is possible in life.'); else if (J.aspectedHouses(x, q.house).indexOf(8) >= 0) I(0.5, PN[x] + ' aspects the 8th house.'); });
    if (P[L8].sign === P.Ma.sign && L8 !== 'Ma') I(1, '8th lord ' + PN[L8] + ' sits with Mars.');
    if (P[L6].house === 8 || P[L8].house === 6) I(1, '6th and 8th lords exchange or join: hospital-type events are shown.');
    var md = J.find(c.maha, now), ad = md ? J.find(J.subPeriods(md), now) : null;
    if (ad && [L8, L6, 'Ma', 'Ke'].indexOf(ad.lord) >= 0) I(1, 'Running sub-period of ' + PN[ad.lord] + ' (' + (ad.lord === L8 ? '8th lord' : ad.lord === L6 ? '6th lord' : 'planet of surgery') + ') activates it now.');
    var dl = DG[P[L1].dignity] || 0; R(dl, 'Lagna lord ' + PN[L1] + ' is ' + (P[L1].dignity || 'neutral').toLowerCase() + ': ' + (dl >= 0.5 ? 'good body strength.' : dl < 0 ? 'body strength needs support.' : 'average body strength.'));
    if ([6, 8, 12].indexOf(P[L1].house) >= 0) R(-1, 'Lagna lord in the ' + nth(P[L1].house) + ' house: recovery can be slower.'); else if ([1, 4, 5, 7, 9, 10, 11].indexOf(P[L1].house) >= 0) R(0.5, 'Lagna lord in the ' + nth(P[L1].house) + ' house: good resilience.');
    if (J.aspectsOnHouse(k, 1).indexOf('Ju') >= 0 || P.Ju.house === 1) R(1, 'Jupiter protects the lagna: a strong sign of safe recovery.');
    if (J.aspectsOnHouse(k, 8).indexOf('Ju') >= 0 || P.Ju.house === 8) R(1, 'Jupiter guards the 8th house: protection during the operation.');
    var mm = DG[P.Mo.dignity] || 0; if (mm <= -2) R(-1, 'Moon is debilitated: keep the patient calm; recovery needs patience.'); else if (mm >= 1.5) R(0.5, 'Moon is strong: good healing and morale.');
    return { ind: ind, rec: rec, iscore: is, rscore: rs, iword: is >= 2 ? 'Clearly shown' : is >= 1 ? 'Possible' : 'Not strongly shown', rword: rs >= 1.5 ? 'Good recovery shown' : rs >= 0 ? 'Recovery with normal care' : 'Recovery needs extra care' };
  }
  /* good dates for a planned procedure in the next N days: waxing Moon, no rikta tithi, Moon not 8th or 12th from natal Moon, no bad tara */
  function goodDates(c, lat, lon, tz, now, n) {
    var out = [], nat = c.k.P.Mo, start = new Date(now.getTime());
    for (var i = 1; i <= (n || 45) && out.length < 8; i++) {
      var d0 = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + i) - tz * 3600e3), pc;
      try { pc = J.panchangLite(d0, lat, lon); } catch (e) { continue; }
      var cb = J.houseFrom(nat.sign, pc.moonSign), tara = ((((pc.nak.index !== undefined ? pc.nak.index : Math.floor(pc.moonLon / (360 / 27))) - (nat.nak.index !== undefined ? nat.nak.index : Math.floor(nat.lon / (360 / 27))) + 27) % 27) % 9) + 1;
      var wd = new Date(d0.getTime() + tz * 3600e3 + 12 * 3600e3).getUTCDay();
      if (pc.tithi.paksha !== 'Shukla' || [4, 9, 14].indexOf(pc.tithi.num) >= 0 || pc.tithi.num === 15 || cb === 8 || cb === 12 || [3, 5, 7].indexOf(tara) >= 0) continue;
      out.push({ d: d0, t: J.VARAS[wd] + ', ' + pc.tithi.paksha + ' ' + pc.tithi.name + ', Moon in ' + pc.nak.name + ' (' + nth(cb) + ' from natal Moon)' });
    }
    return out;
  }


  /* ---------- right now: are the running period lords switching the matter on or off? ---------- */
  function lordsNow(maha, now) { var md = J.find(maha, now), ad = md ? J.find(J.subPeriods(md), now) : null, pd = ad ? J.find(J.subPeriods(ad), now) : null; return { md: md, ad: ad, pd: pd }; }
  function kpNow(c, kp, now) {
    var ch = kp.checks[kp.checks.length > 1 && /health|surg/.test(kp.checks[1].key) ? 1 : 0], L = lordsNow(kp.maha, now), rows = [], f = 0, n = 0;
    ['md', 'ad', 'pd'].forEach(function (k, i) { var x = L[k]; if (!x) return; var sg = c.sig.sig[x.lord] || [], a = hit(ch.fav, sg), b = hit(ch.neg, sg), w = [0.5, 1, 1][i];
      f += a.length * w; n += b.length * w; rows.push({ lvl: ['Dasha', 'Bhukti', 'Antara'][i], lord: x.lord, end: x.end, sig: sg, fav: a, neg: b }); });
    var st = f > n * 1.2 ? 'on' : n > f * 1.2 ? 'off' : 'mixed';
    return { rows: rows, status: st, fav: ch.fav, neg: ch.neg, label: ch.label };
  }
  function vedicNow(c, T, now) {
    var k = c.k, A = k.ascSign, L = lordsNow(c.maha, now), rows = [], H = T.h, bad = 0, good = 0, med = !!T.med;
    ['md', 'ad', 'pd'].forEach(function (key, i) { var x = L[key]; if (!x) return; var pl = x.lord, rules = J.lordsOf ? J.lordsOf(A, pl) : [], q = k.P[pl], notes = [], w = [0.5, 1, 0.7][i];
      if (pl !== 'Ra' && pl !== 'Ke') rules = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter(function (h) { return J.RULER[(A + h - 1) % 12] === pl; });
      if (rules.indexOf(H) >= 0) { notes.push('rules the ' + nth(H) + ' house of this matter'); good += w; }
      if (q.house === H) { notes.push('sits in the ' + nth(H) + ' house'); good += w * 0.8; }
      if (J.aspectedHouses(pl, q.house).indexOf(H) >= 0) { notes.push('aspects the ' + nth(H) + ' house'); good += w * 0.4; }
      var d = rules.filter(function (h) { return [6, 8, 12].indexOf(h) >= 0; }); if (d.length && H !== 6 && H !== 8 && H !== 12) { notes.push('rules the ' + d.map(nth).join(' and ') + ' (illness, obstacles, loss)'); bad += w; }
      if ([6, 8, 12].indexOf(q.house) >= 0 && H !== q.house) { notes.push('sits in the ' + nth(q.house) + ' house'); bad += w * 0.8; }
      if (med && (pl === 'Ra' || pl === 'Ke' || pl === 'Ma' || pl === 'Sa') && (q.house === 1 || q.house === 6 || q.house === 8)) { notes.push('a malefic in the ' + nth(q.house) + ': physical strain'); bad += w * 0.5; }
      rows.push({ lvl: ['Mahadasha', 'Antardasha', 'Pratyantar'][i], lord: pl, end: x.end, notes: notes });
    });
    /* slow transits over the lagna, the Moon and the matter's house */
    var tr = []; ['Sa', 'Ra', 'Ke', 'Ma', 'Ju'].forEach(function (x) { var sg = sgOf(x, now), hL = J.houseFrom(A, sg), hM = J.houseFrom(k.P.Mo.sign, sg);
      if (x === 'Ju') { if (hL === H || J.aspectedHouses('Ju', hL).indexOf(H) >= 0) tr.push({ s: 1, t: 'Jupiter (transit) ' + (hL === H ? 'in' : 'aspects') + ' the ' + nth(H) + ' house: protection.' }); return; }
      if (hL === 1 || hM === 1) { tr.push({ s: -1, t: PN[x] + ' (transit) is over the ' + (hL === 1 ? 'lagna' : 'natal Moon') + ': pressure on body and mind.' }); bad += 0.5; }
      if (hL === H && H !== 1) tr.push({ s: -0.5, t: PN[x] + ' (transit) is in the ' + nth(H) + ' house.' });
      if (med && (hL === 8 || hM === 8)) { tr.push({ s: -1, t: PN[x] + ' (transit) is 8th from the ' + (hL === 8 ? 'lagna' : 'Moon') + ': a sensitive time for health.' }); bad += 0.5; } });
    var st = med ? (bad >= 1.2 ? 'off' : bad >= 0.6 ? 'mixed' : 'on') : (good > bad + 0.5 ? 'on' : bad > good + 0.5 ? 'off' : 'mixed');
    return { rows: rows, tr: tr, status: st, good: good, bad: bad };
  }
  /* ---------- remedies with reasons ---------- */
  function remedies(T, kp, ve, p) {
    var out = [], seen = {};
    function add(x, why, mode) { if (seen[x]) { seen[x].why.push(why); return; } var r = REM[x]; if (!r) return; seen[x] = { planet: x, mode: mode, why: [why], day: r.day, mantra: r.mantra, give: r.give, act: r.act }; out.push(seen[x]); }
    var ch = kp.checks[0];
    if (ch.tone !== 'good') { var bad = ch.st.subStar.houses.some(function (h) { return ch.neg.indexOf(h) >= 0; }) ? ch.st.sub.lord : ch.csl; add(bad, 'KP: ' + PN[bad] + (bad === ch.csl ? ' is the ' + nth(ch.cusp) + ' cusp sub lord' : ' decides the result step') + ' and leans towards the houses against this matter.', 'pacify'); }
    var w0 = ch.windows[0]; if (w0) add(w0.ad, 'KP: the result comes in the period of ' + PN[w0.ad] + '; strengthening it helps the window deliver.', 'strengthen');
    var L = ve.lord;
    var worst = ve.f.filter(function (x) { return x.s < 0; }).sort(function (a, b) { return a.s - b.s; })[0];
    if (worst) { var pm = Object.keys(PN).filter(function (x) { return worst.t.indexOf(PN[x]) === 0 || worst.t.indexOf(' ' + PN[x] + ' ') > 0; })[0] || L; add(pm, 'Vedic: ' + worst.t.replace(/\.$/, '') + '.', pm === L ? 'strengthen' : 'pacify'); }
    var vw0 = ve.windows[0]; if (vw0) add(vw0.ad, 'Vedic: the result comes in the ' + PN[vw0.md] + '–' + PN[vw0.ad] + ' period; strengthening ' + PN[vw0.ad] + ' helps it deliver.', 'strengthen');
    if (ve.tone !== 'good' && !seen[L]) add(L, 'Vedic: ' + PN[L] + ' rules the ' + nth(ve.H) + ' house of this matter and needs strength.', 'strengthen');
    return { planets: out.slice(0, 4), steps: STEPS[T.id] || [] };
  }

  /* ---------- the answer to tell the customer ---------- */
  function fmtW(w, dmy) { return dmy(w.start) + ' to ' + dmy(w.end); }
  function combine(T, kp, ve, dmy, nw) {
    var main = kp.checks[0], kv = { strong: 1, yes: 0.85, open: 0.6, mixed: 0.6, blocked: 0.4, no: 0.1 }[main.level], vv = { strong: 1, yes: 0.8, effort: 0.5, weak: 0.2 }[ve.level];
    var agree = (kv >= 0.6 && vv >= 0.5) || (kv < 0.5 && vv < 0.5), conf = agree ? (Math.min(kv, vv) >= 0.8 || Math.max(kv, vv) < 0.3 ? 'High' : 'Medium') : 'Low';
    /* best window: the first KP window that overlaps a Vedic window, else the first KP window, else the first Vedic window */
    var best = null; main.windows.some(function (w) { var o = ve.windows.filter(function (v) { return v.start < w.end && v.end > w.start; })[0]; if (o) { best = { start: new Date(Math.max(w.start, o.start)), end: new Date(Math.min(w.end, o.end)), both: true, kp: w, ve: o }; return true; } });
    if (!best && main.windows[0]) best = { start: main.windows[0].start, end: main.windows[0].end, kp: main.windows[0] };
    if (!best && ve.windows[0]) { var vw = ve.windows.filter(function (w) { return w.dt; })[0] || ve.windows[0], a0 = vw.dt ? new Date(Math.max(vw.start, vw.dt.from)) : vw.start, b0 = vw.dt ? new Date(Math.min(vw.end, new Date(vw.dt.to.getTime() + 30 * DAY))) : vw.end; best = { start: a0, end: b0, ve: vw }; }
    var t, ev = T.ev;
    if (T.surgery) {
      var s = ve.surg, kpS = kp.checks[0], kpR = kp.checks[1], soon = new Date(Date.now() + 200 * DAY), rWin = kpR && kpR.windows.filter(function (w) { return w.start < soon; })[0];
      var kShown = ['strong', 'yes', 'mixed'].indexOf(kpS.level) >= 0, vShown = s.iscore >= 1, rGood = (kpR && kpR.tone === 'good' ? 1 : 0) + (s.rscore >= 0.5 ? 1 : 0);
      agree = kShown === vShown; conf = agree ? (rGood !== 1 ? 'High' : 'Medium') : 'Low'; best = rWin ? { start: rWin.start, end: rWin.end, kp: rWin } : null;
      t = (kShown && vShown ? 'Surgery is clearly shown in the chart, so if the doctor advises it, going ahead is right. ' : kShown || vShown ? 'Surgery is possible in the chart; if the doctor advises it, go ahead, and a second opinion is fine if there is time. ' : 'The chart does not strongly show surgery: if it is not urgent, take a second opinion on other treatment first. ') +
        (rGood === 2 ? 'Recovery looks good. ' : rGood === 1 ? 'Recovery should be fine with proper care. ' : 'Recovery needs extra care and patience. ') +
        (rWin ? 'If it is not urgent, the better time is ' + fmtW(rWin, dmy) + ', on one of the good dates listed.' : 'If it is not urgent, pick one of the good dates listed.') + ' The doctor\'s advice always comes first.';
    } else if (T.id === 'health') {
      var w0 = main.windows[0]; best = w0 ? { start: w0.start, end: w0.end, kp: w0 } : best;
      t = (kv >= 0.6 && vv >= 0.5 ? 'Recovery is promised in the chart. ' : kv < 0.5 && vv < 0.5 ? 'Recovery is slow in this chart; steady long-term care is needed. ' : 'Recovery comes, but slowly and with ups and downs. ') + (w0 ? 'Clear improvement is shown from ' + dmy(w0.start) + ' (' + PN[w0.ad] + '–' + PN[w0.pd] + ' period).' : '');
    } else if (kv >= 0.6 && vv >= 0.5) t = 'Yes, ' + ev + ' is shown in the chart' + (kv >= 0.85 && vv >= 0.8 ? ' clearly' : ', with some effort') + '. ' + (best ? 'Best time: ' + fmtW(best, dmy) + '.' : 'Timing depends on effort; no strong window in the next 6 years.');
    else if (kv < 0.5 && vv < 0.5) t = ev.charAt(0).toUpperCase() + ev.slice(1) + ' does not come easily in this chart. ' + (best ? 'The best chance is ' + fmtW(best, dmy) + ', with effort and the remedies below.' : 'Steady effort and the remedies below are needed.');
    else t = ev.charAt(0).toUpperCase() + ev.slice(1) + ' is possible but comes with delay or obstacles: KP and Vedic do not fully agree. ' + (best ? 'Best chance: ' + fmtW(best, dmy) + '.' : '');
    if (T.med && nw) {
      var al = nw.alerts.filter(function (w) { return w.start <= new Date(Date.now() + 3 * DAY) && w.end >= new Date(Date.now() - 2 * DAY); })[0], kOff = nw.kp.status === 'off', vOff = nw.ve.status === 'off';
      if (al || (kOff && vOff)) t = 'Right now health needs real care: ' + (al ? 'a ' + (al.level === 'high' ? 'high-care' : 'watch') + ' window runs ' + dmy(al.start) + ' to ' + dmy(al.end) + ', and ' : '') + (kOff ? 'the running period lords signify the illness houses (6, 8, 12)' : 'the running period is linked to the illness houses') + '. Follow the doctor fully and avoid strain until this passes. ' + t;
      else if (kOff || vOff) t = 'Right now: mild caution; one of the two systems shows a sensitive period, so keep the routine and do not ignore symptoms. ' + t;
      else if (nw.kp.status === 'on' && nw.ve.status === 'on') t = 'Right now the period supports health. ' + t;
    }
    return { text: t, conf: conf, agree: agree, best: best };
  }

  function answer(c, p, tid, now, place, dmy) {
    var T = topic(tid), lat = place && place.lat != null ? place.lat : +p.lat, lon = place && place.lon != null ? place.lon : +p.lon, tz = place && place.tz != null ? place.tz : +p.tz;
    var kp = kpAnswer(c, T, now, lat, lon, tz), ve = vedicAnswer(c, T, p, now);
    var out = { T: T, kp: kp, ve: ve, rem: remedies(T, kp, ve, p), now: { kp: kpNow(c, kp, now), ve: vedicNow(c, T, now), alerts: (place && place.alerts) || [] } };
    out.tell = combine(T, kp, ve, dmy, out.now);
    if (T.surgery) out.dates = goodDates(c, lat, lon, tz, now, 45);
    return out;
  }
  return { TOPICS: TOPICS, topicsFor: topicsFor, topic: topic, answer: answer, REM: REM, PN: PN };
}
if (typeof module !== 'undefined') module.exports = makeConsult;
