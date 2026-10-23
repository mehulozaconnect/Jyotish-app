/* Trikaal simple answers: turns every analysis into a plain verdict, meaning, timing and action for a reader who knows no astrology. */
function makeSimple(A, C, J, KB, N, P) {
  var PN = J.PNAME, SG = J.SIGNS, nth = N.nth, DAY = C.DAY, dmy = N.dmy;
  var W = { Su: 1, Mo: 0.5, Ma: 1.5, Me: 1, Ju: 3, Ve: 1, Sa: 3, Ra: 2, Ke: 1 };
  var LVLP = { Mahadasha: 'main period', Antardasha: 'sub-period', Pratyantar: 'short period', Sookshma: 'period of a few days', Prana: 'period of hours' };
  var RETRO = { Me: 're-check documents, messages and payments', Ve: 'old relationships or pending deals come back', Ma: 'old disputes or repairs resurface', Ju: 'growth slows; review plans and investments', Sa: 'old pending work and responsibilities return' };
  function hit(a, s) { return a.filter(function (x) { return s.indexOf(x) >= 0; }); }
  function uniq(a) { var o = []; a.forEach(function (x) { if (x != null && o.indexOf(x) < 0) o.push(x); }); return o; }
  function cap(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }
  function codeByName(n) { var o = null; Object.keys(PN).forEach(function (k) { if (PN[k] === n) o = k; }); return o; }
  function kind(c, code) { if (code === 'Ra' || code === 'Ke') return c.func[J.RULER[c.k.P[code].sign]].kind; var f = c.func[code].kind; return f === 'mixed' ? 'mixed' : f; }
  function isLL(c, code) { return J.lordOfHouse(c.k.ascSign, 1) === code; }
  function verdictOf(c, code) { var k = kind(c, code); return isLL(c, code) || k === 'benefic' || k === 'yogakaraka' ? 'good' : k === 'malefic' ? 'bad' : 'mixed'; }
  function natureShort(c, code) { if (isLL(c, code)) return 'your own planet (lagna lord)'; if (code === 'Ra' || code === 'Ke') return 'a shadow planet that acts like ' + PN[J.RULER[c.k.P[code].sign]] + ' (' + P.NATURE_SHORT[kind(c, code)] + ')'; return P.NATURE_SHORT[c.func[code].kind]; }

  /* ---------- strength ---------- */
  function strength(c, code) {
    var p = c.k.P[code], s = 0, why = [];
    var dg = { 'Exalted': 2, 'Moolatrikona': 2, 'Own sign': 1.5, 'Friendly sign': 0.5, 'Neutral sign': 0, 'Enemy sign': -1, 'Debilitated': -2 }[p.dignity] || 0;
    s += dg; why.push(p.dignity === 'Exalted' ? 'at its highest strength (exalted)' : p.dignity === 'Debilitated' ? 'at its weakest (debilitated)' : p.dignity === 'Own sign' || p.dignity === 'Moolatrikona' ? 'in its own sign' : p.dignity === 'Enemy sign' ? 'in an unfriendly sign' : p.dignity === 'Friendly sign' ? 'in a friendly sign' : 'in a neutral sign');
    if (c.av.bav[code]) { var b = c.av.bav[code][p.sign]; s += b >= 5 ? 1 : b <= 3 ? -1 : 0; why.push(b + ' of 8 support points'); }
    if (p.combust) { s -= 1; why.push('too close to the Sun (combust)'); }
    if ([1, 4, 5, 7, 9, 10].indexOf(p.house) >= 0) { s += 0.5; why.push('well placed'); } else if ([6, 8, 12].indexOf(p.house) >= 0) { s -= 0.5; why.push('in a difficult house'); }
    var v9 = J.dignity(code, J.varga(p.lon, 9).sign * 30 + 1); if (['Exalted', 'Own sign', 'Moolatrikona'].indexOf(v9) >= 0) { s += 0.5; why.push('strong in the Navamsha'); } else if (v9 === 'Debilitated') { s -= 0.5; why.push('weak in the Navamsha'); }
    return { score: s, word: s >= 2 ? 'Strong' : s >= 0 ? 'Average' : 'Weak', why: why };
  }

  /* ---------- one planet ---------- */
  function planet(c, code, now) {
    var k = c.k, p = k.P[code], L = k.ascSign, rules = J.lordsOf(L, code), st = strength(c, code), nat = verdictOf(c, code), out = { code: code, lines: [], do: [], avoid: [] };
    var sentence = KB.IN_HOUSE[code][p.house], placeGood = [1, 2, 4, 5, 7, 9, 10, 11].indexOf(p.house) >= 0, dus = [6, 8, 12].indexOf(p.house) >= 0, v, head;
    if (nat === 'good') { if (st.word === 'Weak') { v = 'mixed'; head = PN[code] + ' is on your side, but too weak to give its full results.'; } else if (dus) { v = 'mixed'; head = PN[code] + ' is on your side, but sits in a difficult house, so its help is limited.'; } else { v = 'good'; head = 'In your birth chart, ' + PN[code] + ' works in your favour.'; } }
    else if (nat === 'bad') { if (dus) { v = 'mixed'; head = PN[code] + ' is a difficult planet for you, but it sits in a hidden house, so its harm is limited.'; } else if (placeGood && st.word === 'Strong') { v = 'mixed'; head = PN[code] + ' gives good results through its placement, but as a difficult planet for your lagna it also brings problems.'; } else { v = 'bad'; head = 'In your birth chart, ' + PN[code] + ' causes trouble for you.'; } }
    else { v = 'mixed'; head = 'In your birth chart, ' + PN[code] + ' gives mixed results: neither a big help nor a big problem.'; }
    out.verdict = v; out.nature = nat; out.strength = st;
    out.headline = head;
    out.meaning = 'It is ' + natureShort(c, code) + ' and ' + (st.word === 'Strong' ? 'strong' : st.word === 'Weak' ? 'weak' : 'of average strength') + ' in your chart. Its effect on you: ' + sentence + '.';
    if (code === 'Ra' || code === 'Ke') out.lines.push(['Its role', PN[code] + ' owns no sign. It works like ' + PN[J.RULER[p.sign]] + ', the lord of the sign it sits in, and brings ' + P.PLANET[code] + '.']);
    else out.lines.push(['Its role', 'It controls your ' + P.areas(rules) + '. ' + (isLL(c, code) ? 'As your lagna lord it is your own planet: it protects you.' : 'For your lagna it is ' + P.NATURE[c.func[code].kind] + '.')]);
    out.lines.push(['Where it sits', 'In your ' + P.AREA[p.house] + ' area: ' + sentence + '.']);
    out.lines.push(['How strong', st.word + ': ' + P.list(st.why) + '.']);
    var tr = N.transitAt(c, now).filter(function (x) { return x.code === code; })[0];
    if (tr && code !== 'Mo') { var nx = J.nextIngress(code === 'Ke' ? 'Ra' : code, now, 1500); out.lines.push(['Right now', 'Moving through your ' + P.AREA_SHORT[tr.h] + ' area: ' + P.EFFECT[code][tr.verdict] + (nx ? ' (until ' + dmy(nx) + ')' : '') + '.']); out.transit = tr; }
    var ch = J.dashaChain(c.maha, now, 3), role = null;
    ch.forEach(function (x, i) { if (!role && x.lord === code) role = 'It is running your ' + ['main period', 'sub-period', 'short period'][i] + ' until ' + dmy(x.end) + ', so its results are active now.'; });
    if (!role && ch[0]) { var nextAd = J.subPeriods(ch[0]).filter(function (a) { return a.lord === code && a.start > now; })[0]; if (nextAd) role = 'Its next sub-period: ' + dmy(nextAd.start) + ' to ' + dmy(nextAd.end) + '. Its results will be strongest then.'; else { var nm = c.maha.filter(function (m) { return m.lord === code && m.start > now; })[0]; if (nm) role = 'Its main period starts ' + dmy(nm.start) + '.'; } }
    if (role) out.lines.push(['Its time', role]);
    var ms = KB.MANTRA[code][0], day = KB.DAAN[code][1];
    if (nat === 'good' && st.word === 'Strong') out.do.push('No remedy needed. Use its strength: ' + P.DO[code] + '.');
    else if (nat === 'good') out.do.push('Strengthen it: chant ' + ms + ' 108 times on ' + day + 's.');
    if (nat === 'good' && code !== 'Ra' && code !== 'Ke' && !dus && !c.func[code].maraka) out.do.push('Gemstone: ' + KB.GEM[code][0] + ' suits you (' + KB.GEM[code][1] + ').');
    if (nat === 'bad') { out.do.push('Calm it: donate ' + KB.DAAN[code][0] + ' on ' + day + 's and chant ' + ms + '.'); if (code !== 'Ra' && code !== 'Ke') out.avoid.push('wearing ' + KB.GEM[code][0]); }
    if (nat === 'mixed' && role && /running/.test(role)) out.do.push('While its period runs: chant ' + ms + ' on ' + day + 's.');
    if (!out.do.length) out.do.push('No special remedy needed.');
    if (nat === 'bad' || (tr && tr.verdict === 'bad')) out.avoid.push(P.AVOID[code]);
    return out;
  }

  /* ---------- a month of transits ---------- */
  function month(c, tm) {
    var k = c.k, score = 0, good = [], bad = [];
    tm.tr.forEach(function (x) { var w = W[x.code]; score += (x.verdict === 'good' ? 1 : x.verdict === 'bad' ? -1 : 0) * w; if (x.verdict === 'good') good.push(x); if (x.verdict === 'bad') bad.push(x); });
    if (tm.sade.q === 'bad') score -= 2;
    if (tm.rulerTr) score += tm.rulerTr.verdict === 'good' ? 1.5 : tm.rulerTr.verdict === 'bad' ? -1.5 : 0;
    var byW = function (a, b) { return W[b.code] - W[a.code]; }; good.sort(byW); bad.sort(byW);
    var v = score >= 2 ? 'good' : score <= -3 ? 'bad' : 'mixed';
    var gA = uniq(good.map(function (x) { return P.AREA_SHORT[x.h]; })).slice(0, 3), bA = uniq(bad.map(function (x) { return P.AREA_SHORT[x.h]; })).slice(0, 3);
    var out = { verdict: v, score: score, word: { good: 'A good month', mixed: 'A mixed month', bad: 'A difficult month' }[v] };
    out.meaning = (gA.length ? 'Support for ' + P.list(gA) + '. ' : '') + (bA.length ? 'Take care with ' + P.list(bA) + '.' : '') + (tm.sade.q === 'bad' ? ' In the background, Saturn’s hard position from your Moon (' + tm.sade.label.replace(/\s*\(.*\)/, '') + (tm.sade.until ? ', until ' + dmy(tm.sade.until) : '') + ') keeps pressure and tiredness up.' : '');
    out.do = uniq(good.slice(0, 3).map(function (x) { return P.DO[x.code]; })); if (!out.do.length) out.do = ['keep a steady routine and finish pending work'];
    out.avoid = uniq(bad.slice(0, 3).map(function (x) { return P.AVOID[x.code]; }));
    var r = tm.ruler, rx = tm.rulerTr;
    if (r) { var roles = []; tm.chain.forEach(function (x, i) { if (x.lord === r) roles.push(['main period', 'sub-period', 'short period', 'few-day period'][i]); });
      out.ruler = { code: r, title: PN[r] + ' runs this month', text: PN[r] + ' is your ' + roles.join(' and ') + ' planet now and ' + natureShort(c, r) + '. ' + (rx ? 'This month it moves through your ' + P.AREA_SHORT[rx.h] + ' area, ' + (rx.verdict === 'good' ? 'a good position: ' : rx.verdict === 'bad' ? 'a hard position: ' : 'a mixed position: ') + P.EFFECT[r][rx.verdict] + '.' : '') }; }
    out.rows = tm.tr.map(function (x) { return { code: x.code, verdict: x.verdict, title: PN[x.code] + ' · your ' + P.AREA_SHORT[x.h], text: cap(P.EFFECT[x.code][x.verdict]) + '.' + (x.next ? ' Changes on ' + dmy(x.next) + '.' : '') }; });
    out.dates = tm.events.filter(function (e) { return e.code !== 'Mo'; }).map(function (e) {
      if (e.type === 'ingress') { var h = J.houseFrom(k.ascSign, e.sign), m = J.houseFrom(k.P.Mo.sign, e.sign), g = KB.GOCHAR_GOOD[e.code].indexOf(m) >= 0; return { t: e.t, text: PN[e.code] + ' moves into your ' + P.AREA_SHORT[h] + ' area: ' + (g ? 'good for you' : 'needs care') + '.' }; }
      if (e.type === 'retro') return { t: e.t, text: PN[e.code] + ' turns backward (retrograde): ' + (RETRO[e.code] || 'review before acting') + '.' };
      return { t: e.t, text: PN[e.code] + ' moves forward again: its delays start to clear.' };
    });
    return out;
  }

  /* ---------- health ---------- */
  function health(c, now) {
    var H = N.healthAnalysis(c, now), k = c.k, ll = J.lordOfHouse(k.ascSign, 1), v = H.vital >= 2 ? 'good' : H.vital >= 0 ? 'mixed' : 'bad';
    var out = { verdict: v, H: H };
    out.headline = { good: 'Your basic health is strong.', mixed: 'Your basic health is average: you recover well, but some areas need care.', bad: 'Your health needs regular care and check-ups.' }[v];
    out.weak = H.zones.filter(function (z) { return z.level !== 'good'; }).slice(0, 3).map(function (z) { return { area: P.HEALTH[z.house][0], tip: P.HEALTH[z.house][1], house: z.house, why: z.why }; });
    out.strong = H.zones.filter(function (z) { return z.level === 'good' && z.risk < 0; }).slice(0, 2).map(function (z) { return P.HEALTH[z.house][0]; });
    out.meaning = (out.weak.length ? 'Weak spots: ' + out.weak.map(function (w) { return w.area.toLowerCase(); }).join('; ') + '.' : 'No major weak spot.') + (out.strong.length ? ' Well protected: ' + out.strong.map(function (s) { return s.toLowerCase(); }).join('; ') + '.' : '');
    out.now = [];
    if (H.sade.q === 'bad') out.now.push('Until ' + dmy(H.sade.until) + ': Saturn’s hard position from your Moon brings tiredness and stress. Keep sleep and meals fixed.');
    ['Ma', 'Sa', 'Ra'].forEach(function (code) { var s = J.signOf(C.sidereal(code, now)), h = J.houseFrom(k.ascSign, s); if ([1, 6, 8, 12].indexOf(h) >= 0) { var e = J.nextIngress(code, now, 1200); out.now.push('Until ' + dmy(e) + ': ' + PN[code] + ' is in your ' + P.AREA_SHORT[h] + ' area. Watch ' + KB.PLANET[code].body.split(',').slice(0, 2).map(function (s) { return s.trim(); }).join(' and ') + '.'); } });
    var ch = J.dashaChain(c.maha, now, 2); ch.forEach(function (x, i) { var ls = J.lordsOf(k.ascSign, x.lord); if (ls.some(function (h) { return [6, 8].indexOf(h) >= 0; }) || [6, 8].indexOf(k.P[x.lord].house) >= 0) out.now.push('Your current ' + ['main period', 'sub-period'][i] + ' planet ' + PN[x.lord] + ' is linked to illness areas until ' + dmy(x.end) + ', so do not skip check-ups.'); });
    var chw = H.timeline.filter(function (t) { return /Chandrashtama/.test(t.t) && t.start > now; })[0]; if (chw) out.now.push('Next low-energy days: ' + N.dmY(chw.start) + ' to ' + N.dmY(chw.end) + '. Rest more.');
    out.better = [];
    if (H.sade.q === 'bad' && H.sade.until) out.better.push(dmy(H.sade.until) + ': Saturn moves on and the pressure eases.');
    H.support.filter(function (s) { return /Jupiter/.test(s); }).forEach(function (s) { var m = s.match(/^(\d+ \w+ \d{4}): Jupiter/); out.better.push(m ? m[1] + ': Jupiter moves to a position where it protects your health.' : 'Jupiter is now in a position where it protects your health.'); });
    out.do = out.weak.map(function (w) { return w.area + ': ' + w.tip + '.'; });
    out.do.push('Daily: chant ' + KB.MANTRA[ll][0] + ' 11 times to strengthen ' + PN[ll] + ', your lagna lord.');
    out.avoid = ['skipping meals and sleep'];
    var ma = J.houseFrom(k.ascSign, J.signOf(C.sidereal('Ma', now))); if ([1, 6, 8, 12].indexOf(ma) >= 0) out.avoid.push('fried food, anger and rash driving while Mars is in your ' + P.AREA_SHORT[ma] + ' area');
    return out;
  }

  /* ---------- event ---------- */
  function hp(hs, heal) { return P.list(uniq(hs.map(function (h) { return heal && P.EVH[h] ? P.EVH[h] : P.AREA_SHORT[h]; }))); }
  function plainReason(c, code, w, heal) {
    var m;
    if ((m = w.match(/^(Mahadasha|Antardasha|Pratyantar|Sookshma|Prana) lord, linked to houses ([\d, ]+)\./))) return 'It was running your ' + LVLP[m[1]] + ', and in your chart it is linked to ' + hp(m[2].split(',').map(Number), heal) + '.';
    if ((m = w.match(/^Transiting your (\d+)/))) return 'On that day it was moving through the part of your chart for ' + hp([+m[1]], heal) + '.';
    if ((m = w.match(/^Transit \w+ within ([\d.]+)° of natal lagna/))) return 'On that day it passed over your ascendant, the point of your body.';
    if ((m = w.match(/^Transit \w+ within ([\d.]+)° of natal (\w+) \(/))) { var nc = codeByName(m[2]), rl = nc ? J.lordsOf(c.k.ascSign, nc) : []; return 'On that day it passed ' + (+m[1] < 1 ? 'exactly ' : '') + 'over your birth ' + m[2] + (rl.length ? ', which controls your ' + P.areas(rl, true) : '') + '.'; }
    if ((m = w.match(/^Aspecting your ([\dthndrs, ]+) house/))) return 'It was also aspecting the part of your chart for ' + hp(m[1].match(/\d+/g).map(Number), heal) + '.';
    if (/^Natural significator/.test(w)) return 'By nature it rules ' + P.PLANET[code] + '.';
    if ((m = w.match(/^Only (\d+) bindus/))) return 'Your chart gives little protection there (only ' + m[1] + ' of 8 points).';
    return w;
  }
  function event(c, E, now) {
    var m = E.main, out = { verdict: E.E.good ? 'good' : 'bad', E: E };
    if (!m) { out.headline = 'No single planet stands out for this event.'; out.reasons = []; out.do = []; out.avoid = []; return out; }
    var heal = !!E.E.heal;
    var lv = [], links = [];
    E.dasha.forEach(function (d, i) { if (d.lord === m.code && (d.evP.length || d.evK.length)) { lv.push(['main period', 'sub-period', 'short period', 'period of a few days', 'period of hours'][i]); links = links.concat(d.evP, d.evK); } });
    out.reasons = uniq(m.why.filter(function (w) { return !/^(Mahadasha|Antardasha|Pratyantar|Sookshma|Prana) lord/.test(w); }).map(function (w) { return plainReason(c, m.code, w, heal); }).map(function (r) { return r.replace(/^It /, PN[m.code] + ' '); }));
    if (lv.length) out.reasons.unshift(PN[m.code] + ' was running your ' + P.list(lv) + ', and in your chart it is linked to ' + hp(uniq(links).sort(function (a, b) { return a - b; }), heal) + '.');
    function levelsOf(code) { var o = []; E.dasha.forEach(function (d, i) { if (d.lord === code) o.push(['main period', 'sub-period', 'short period', 'few-day period', 'period of hours'][i]); }); return o; }
    out.support = E.support.map(function (s) {
      var lv2 = levelsOf(s.code), tr = s.why.filter(function (w) { return /^Transit/.test(w); })[0];
      return { code: s.code, text: (lv2.length ? 'it ran your ' + P.list(lv2) + ' and is linked to the same areas' : '') + (tr ? (lv2.length ? '; ' : '') + plainReason(c, s.code, tr, heal).replace(/^On that day it /, 'that day it ').replace(/\.$/, '') : '') + (!lv2.length && !tr ? plainReason(c, s.code, s.why[0], heal).replace(/^It /, 'it ').replace(/\.$/, '') : '') + '.' };
    });
    var transitHit = m.why.some(function (w) { return /^Transit/.test(w); }), mlv = levelsOf(m.code);
    out.headline = (E.E.good ? 'This came mainly through ' : 'Main cause: ') + PN[m.code] + (transitHit ? ', which passed over a sensitive point in your chart that day' : mlv.length ? ', the planet running your ' + P.list(mlv) : '') + '.';
    var rec = E.recovery && E.recovery[0], ease = transitHit ? E.outlook.filter(function (o) { return /leaves/.test(o.text); })[0] : null;
    out.when = [];
    if (ease) out.when.push((ease.t < now ? 'The worst eased on ' : 'The worst eases on ') + dmy(ease.t) + ', when ' + PN[m.code] + ' moved off the trigger point.');
    if (rec) out.when.push((E.E.heal ? 'Recovery support from ' : E.E.good ? 'Results build up from ' : 'Relief from ') + dmy(rec.start) + (rec.start < now ? ' (already begun)' : '') + ': the ' + PN[rec.lord] + ' period favours ' + (E.E.heal ? 'healing' : 'improvement') + '.');
    if (E.recovery && E.recovery[1]) out.when.push('Stronger support again from ' + dmy(E.recovery[1].start) + ' (' + PN[E.recovery[1].lord] + ' period).');
    if (!out.when.length) out.when.push('No clear relief period in the next 18 months from the dasha; keep treatment and remedies going.');
    out.do = [];
    if (!E.E.good) { out.do.push('Calm ' + PN[m.code] + ': donate ' + KB.DAAN[m.code][0] + ' on ' + KB.DAAN[m.code][1] + 's and chant ' + KB.MANTRA[m.code][0] + ' 108 times.'); }
    if (E.E.heal) { out.do.push('Chant the Maha Mrityunjaya mantra 108 times daily until recovery.'); out.do.push('Follow the doctor’s treatment fully; the dates above are support periods, not a substitute for treatment.'); }
    if (E.E.good) out.do.push('Use the period: ' + P.DO[m.code] + '.');
    out.avoid = E.E.good ? [] : [P.AVOID[m.code]];
    return out;
  }

  /* ---------- KP question (natal or horary) ---------- */
  function kpWindows(sig, m, maha, from, months, depth, rps) {
    var to = new Date(from.getTime() + months * 30.44 * DAY), out = [];
    function f(l) { return hit(m.fav, sig.sig[l]).length; } function n(l) { return hit(m.neg, sig.sig[l]).length; }
    function sc(l) { return f(l) - 0.5 * n(l) + (rps && rps.indexOf(l) >= 0 ? 1.5 : 0); }
    function walk(list, lvl, chain, relaxed) {
      list.forEach(function (p) {
        if (p.end <= from || p.start >= to) return;
        var ch = chain.concat([p]);
        if (lvl === depth) { var last = ch.slice(-2), ok = last.every(function (x) { return relaxed ? f(x.lord) > 0 : f(x.lord) > 0 && f(x.lord) >= n(x.lord); }); if (ok) out.push({ lords: ch.map(function (x) { return x.lord; }), start: p.start < from ? from : p.start, end: p.end, score: sc(last[0].lord) + sc(last[1].lord) + (f(ch[0].lord) ? 0.5 : 0), relaxed: !!relaxed }); }
        else walk(J.subPeriods(p), lvl + 1, ch, relaxed);
      });
    }
    walk(maha, 1, [], false);
    if (!out.length) walk(maha, 1, [], true);
    var best = out.slice().sort(function (a, b) { return b.score - a.score || a.start - b.start; }).slice(0, 4).sort(function (a, b) { return a.start - b.start; });
    return best;
  }
  function kp(jm, mk, wins, now) {
    var j = jm.main, lv = N.VERD[j.level][1], v = lv === 'good' ? 'good' : lv === 'bad' ? 'bad' : 'mixed', M = P.MATTER[mk] || P.MATTER.job;
    var out = { verdict: v, q: M.q, headline: v === 'good' ? M.yes : v === 'bad' ? M.no : M.mixed };
    var qh = P.QH[mk] || {}, ph = function (hs) { return P.list(uniq(hs.map(function (h) { return qh[h] || P.AREA_SHORT[h]; }))); };
    out.meaning = 'The planet that decides this question is ' + PN[j.csl] + '. ' + (j.pf.length ? 'It shows ' + ph(j.pf) + (j.pn.length ? ', but also ' + ph(j.pn) : '') + '.' : 'It does not show ' + ph(jm.m.fav) + (j.pn.length ? '; instead it shows ' + ph(j.pn) : '') + '.');
    out.when = [];
    if (wins.length) { var w0 = wins[0]; out.when.push((v === 'bad' ? (mk === 'health' ? 'First chance of improvement: ' : 'Best chance: ') : 'Most likely: ') + dmy(w0.start) + ' to ' + dmy(w0.end) + (w0.relaxed ? ' (only a partial chance)' : '') + '.'); wins.slice(1, 3).forEach(function (w) { out.when.push((v === 'bad' ? 'Next chance: ' : 'Also possible: ') + dmy(w.start) + ' to ' + dmy(w.end) + '.'); }); }
    else out.when.push('No supportive period in this time frame.');
    out.do = [v === 'bad' ? M.wait : M.go];
    var helper = wins.length ? wins[0].lords[wins[0].lords.length - 1] : null;
    if (helper) out.do.push('To support it, chant ' + KB.MANTRA[helper][0] + ' 108 times on ' + KB.DAAN[helper][1] + 's (' + PN[helper] + ' rules the best period).');
    if (mk === 'health') out.do.push('Chant the Maha Mrityunjaya mantra 108 times daily, and follow the doctor’s treatment.');
    out.avoid = v === 'good' ? [] : ['forcing the matter before the dates above'];
    return out;
  }

  /* ---------- whole chart in plain words ---------- */
  function report(c, now) {
    var k = c.k, L = k.ascSign, sec = N.report(c, now), get = function (id) { return sec.filter(function (s) { return s.id === id; })[0]; }, out = [];
    function badgeV(s) { var p = 0, n = 0; (s.items || []).forEach(function (i) { if (i.k === 'pro') p++; if (i.k === 'con') n++; }); return p >= n + 2 ? 'good' : n >= p + 1 ? 'bad' : 'mixed'; }
    out.push({ k: 'Nature', v: 'neutral', t: cap(KB.SIGN_TRAIT[L]) + '. At heart ' + KB.NAK_TRAIT[k.P.Mo.nak.index] + '.' });
    var hs = health(c, now); out.push({ k: 'Health', v: hs.verdict, t: hs.headline + ' ' + hs.meaning });
    var l10 = J.lordOfHouse(L, 10), p10 = k.P[l10], car = get('career');
    var fields = uniq([l10].concat(k.planets.filter(function (x) { return x.house === 10; }).map(function (x) { return x.code; }))).slice(0, 2).map(function (x) { return KB.CAREER_HINT[x]; });
    out.push({ k: 'Career', v: badgeV(car), t: 'Career rises through ' + P.AREA[p10.house] + '. Suited to ' + P.list(fields) + '.' });
    var s11 = N.savOf(c, 11), s12 = N.savOf(c, 12), s2 = N.savOf(c, 2), dh = c.yogas.some(function (y) { return y.kind === 'dhana'; });
    out.push({ k: 'Money', v: s11 > s12 && s2 >= 25 ? 'good' : s11 > s12 ? 'mixed' : 'bad', t: (s11 > s12 ? 'You earn more than you spend' : 'Expenses tend to eat into income') + '; savings ' + (s2 >= 28 ? 'grow well' : s2 >= 24 ? 'grow with discipline' : 'need strict discipline') + '.' + (dh ? ' Your chart has wealth combinations (Dhana yoga).' : '') });
    var l7 = J.lordOfHouse(L, 7), p7 = k.P[l7], md = c.yogas.filter(function (y) { return /Mangal/.test(y.name); })[0], mar = get('marriage');
    out.push({ k: 'Marriage', v: badgeV(mar), t: 'Partnership is linked to your ' + P.AREA_SHORT[p7.house] + ' area' + ([6, 8, 12].indexOf(p7.house) >= 0 ? ', so expect some friction or distance at times' : ', a supportive placement') + '.' + (md ? (md.kind === 'dosha' ? ' Mangal dosha is present: match charts before marriage.' : ' Mild Mangal dosha only.') : '') });
    var ch = J.dashaChain(c.maha, now, 2), ss = N.sadeSati(c, now);
    out.push({ k: 'Right now', v: verdictOf(c, ch[1] ? ch[1].lord : ch[0].lord), t: 'Main period of ' + PN[ch[0].lord] + ' (until ' + dmy(ch[0].end) + '), ' + natureShort(c, ch[0].lord) + '. Sub-period of ' + PN[ch[1].lord] + ' (until ' + dmy(ch[1].end) + '), ' + natureShort(c, ch[1].lord) + '. ' + (ss.q === 'bad' ? 'Saturn’s hard position from your Moon adds pressure until ' + dmy(ss.until) + '.' : 'No Sade Sati pressure now.') });
    var nextAd = ch[0] ? J.subPeriods(ch[0]).filter(function (a) { return a.start > now; })[0] : null;
    if (nextAd) out.push({ k: 'Next change', v: verdictOf(c, nextAd.lord), t: dmy(nextAd.start) + ': the sub-period of ' + PN[nextAd.lord] + ' begins. It brings ' + P.areas(uniq(J.lordsOf(L, nextAd.lord).concat([k.P[nextAd.lord].house])), true) + ' to the front; ' + PN[nextAd.lord] + ' is ' + natureShort(c, nextAd.lord) + '.' });
    return out;
  }

  return { strength: strength, planet: planet, month: month, health: health, event: event, plainReason: plainReason, kpWindows: kpWindows, kp: kp, report: report, verdictOf: verdictOf, natureShort: natureShort };
}
if (typeof module !== 'undefined') module.exports = makeSimple;
