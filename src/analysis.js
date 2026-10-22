/* Trikaal reasoning engine: turns computed charts into explained readings. Every statement carries its "why". */
function makeAnalysis(A, C, J, KB) {
  var DAY = C.DAY, norm = C.norm, PN = J.PNAME, SG = J.SIGNS;
  function nth(n) { var s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
  function uniq(a) { var o = []; a.forEach(function (x) { if (o.indexOf(x) < 0) o.push(x); }); return o; }
  function hit(arr, set) { return arr.filter(function (x) { return set.indexOf(x) >= 0; }); }
  var fmtTZ = 5.5;
  function setTZ(tz) { fmtTZ = tz; }
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function loc(d) { return new Date(d.getTime() + fmtTZ * 3600e3); }
  function dmy(d) { if (!d) return '–'; var x = loc(d); return x.getUTCDate() + ' ' + MON[x.getUTCMonth()] + ' ' + x.getUTCFullYear(); }
  function dmY(d) { var x = loc(d); return x.getUTCDate() + ' ' + MON[x.getUTCMonth()]; }
  function hm(d) { if (!d) return '–'; var x = loc(d); return (x.getUTCHours() < 10 ? '0' : '') + x.getUTCHours() + ':' + (x.getUTCMinutes() < 10 ? '0' : '') + x.getUTCMinutes(); }
  function dmyt(d) { return dmy(d) + ', ' + hm(d); }

  /* ---------- person calculation ---------- */
  function calc(p) {
    var a = p.date.split('-').map(Number), t = String(p.time).split(':').map(Number);
    var birth = new Date(Date.UTC(a[0], a[1] - 1, a[2], t[0], t[1] || 0, t[2] || 0) - p.tz * 3600e3);
    var k = J.kundli(birth, +p.lat, +p.lon);
    var kk = J.kundli(birth, +p.lat, +p.lon, { ayan: 'kp' });
    return { p: p, birth: birth, k: k, kp: kk, sig: J.kpSignificators(kk), maha: J.dashas(birth, k.P.Mo.lon), yog: J.yogini(birth, k.P.Mo.lon),
      av: J.ashtakavarga(k), func: J.functional(k.ascSign), yogas: J.yogas(k), ayan: C.getAyanamsa() };
  }
  function lordNote(c, code) { var ls = J.lordsOf(c.k.ascSign, code), pl = c.k.P[code]; return (ls.length ? 'rules ' + ls.map(nth).join(' & ') + ', ' : '') + 'in the ' + nth(pl.house) + ' (' + J.SG3[pl.sign] + ')'; }
  function houseTopic(h) { return KB.HOUSE[h].topic; }
  function funcWord(c, code) { if (code === 'Ra' || code === 'Ke') return 'node'; var f = c.func[code]; return f ? f.kind : 'neutral'; }
  function savOf(c, h) { return c.av.sav[(c.k.ascSign + h - 1) % 12]; }

  /* ---------- planet explanation ---------- */
  function planet(c, code, now) {
    var k = c.k, p = k.P[code], ls = J.lordsOf(k.ascSign, code), out = [];
    out.push({ t: PN[code] + ' in ' + SG[p.sign] + ' ' + p.degs + ', ' + nth(p.house) + ' house', why: ['Nakshatra ' + p.nak.name + ' pada ' + p.nak.pada + ', star lord ' + PN[p.nak.lord] + '.', 'Dignity: ' + p.dignity + (p.retro && code !== 'Ra' && code !== 'Ke' ? ', retrograde' : '') + (p.combust ? ', combust' : '') + '.'] });
    if (ls.length) out.push({ t: 'Rules ' + ls.map(function (h) { return nth(h) + ' (' + houseTopic(h) + ')'; }).join(' and '), why: ['For ' + SG[k.ascSign] + ' lagna ' + PN[code] + ' is a functional ' + funcWord(c, code) + '.'] });
    out.push({ t: 'In the ' + nth(p.house) + ': ' + KB.IN_HOUSE[code][p.house], why: ['House ' + p.house + ' covers ' + houseTopic(p.house) + '.'] });
    var asp = J.aspectedHouses(code, p.house); out.push({ t: 'Aspects houses ' + asp.join(', '), why: [PN[code] + "'s full aspects fall on " + asp.map(function (h) { return nth(h) + ' (' + houseTopic(h).split(',')[0] + ')'; }).join('; ') + '.'] });
    var v9 = J.varga(p.lon, 9), v10 = J.varga(p.lon, 10);
    out.push({ t: 'D9 ' + SG[v9.sign] + (v9.sign === p.sign ? ' (vargottama)' : '') + ', D10 ' + SG[v10.sign], why: ['D9 dignity: ' + J.dignity(code, v9.sign * 30 + v9.deg / 9) + '.'] });
    var st = c.sig.steps[code]; out.push({ t: 'KP: signifies houses ' + c.sig.sig[code].join(', '), why: ['Star lord ' + PN[st.star.lord] + ' gives ' + st.star.houses.join(', ') + '; sub lord ' + PN[st.sub.lord] + ' gives ' + st.sub.houses.join(', ') + '.'] });
    if (code !== 'Ra' && code !== 'Ke') { var bav = c.av.bav[code], tot = bav.reduce(function (a, b) { return a + b; }, 0); out.push({ t: 'Ashtakavarga: ' + bav[p.sign] + ' bindus in its own sign position, total ' + tot, why: [bav[p.sign] >= 5 ? 'Strong support where it sits.' : bav[p.sign] <= 3 ? 'Weak support where it sits.' : 'Average support.'] }); }
    if (now) {
      var tl = C.sidereal(code, now), ts = J.signOf(tl), hl = J.houseFrom(k.ascSign, ts), hm2 = J.houseFrom(k.P.Mo.sign, ts);
      out.push({ t: 'Now transiting ' + SG[ts] + ' ' + J.dms(tl) + ': your ' + nth(hl) + ', ' + nth(hm2) + ' from Moon', why: ['Gochar: ' + KB.GOCHAR[code][hm2] + '.'] });
      var ch = J.dashaChain(c.maha, now, 3); var roles = []; ['Mahadasha', 'Antardasha', 'Pratyantar'].forEach(function (r, i) { if (ch[i] && ch[i].lord === code) roles.push(r + ' lord until ' + dmy(ch[i].end)); });
      if (roles.length) out.push({ t: 'Running now as ' + roles.join(', '), why: ['Its houses (' + (ls.length ? ls.join(', ') : 'node') + ' and ' + p.house + ') are active.'] });
    }
    return out;
  }

  /* ---------- KP judgement ---------- */
  var KP_MATTERS = {
    job: { l: 'Job, promotion or raise', cusps: [10, 6], fav: [2, 6, 10, 11], neg: [1, 5, 9] }, business: { l: 'Business deal or contract', cusps: [7, 10], fav: [2, 7, 10, 11], neg: [5, 8, 12] },
    money: { l: 'Money gain', cusps: [11, 2], fav: [2, 6, 11], neg: [5, 8, 12] }, marriage: { l: 'Marriage', cusps: [7], fav: [2, 7, 11], neg: [1, 6, 10] },
    property: { l: 'Property purchase', cusps: [4], fav: [4, 11, 12], neg: [3, 10] }, vehicle: { l: 'Vehicle purchase', cusps: [4], fav: [4, 11, 12], neg: [3, 10] },
    foreign: { l: 'Foreign travel or settling abroad', cusps: [12, 9], fav: [3, 9, 12], neg: [2, 4, 11] }, child: { l: 'Childbirth', cusps: [5], fav: [2, 5, 11], neg: [1, 4, 10] },
    study: { l: 'Exam or higher education', cusps: [9, 4], fav: [4, 9, 11], neg: [3, 8, 12] }, health: { l: 'Recovery from illness', cusps: [6, 1], fav: [1, 5, 11], neg: [6, 8, 12] },
    legal: { l: 'Court case or dispute', cusps: [6], fav: [1, 6, 11], neg: [5, 7, 12] } };
  var VERD = { strong: ['Strongly promised', 'good'], yes: ['Promised', 'good'], mixed: ['Promised, with obstacles or delay', 'mixed'], open: ['Promised; timing decides', 'mixed'], blocked: ['Promised, but the result step shows resistance', 'mixed'], no: ['Not clearly promised by this cusp', 'bad'] };
  function cslJudge(sig, cusp, m) {
    var csl = sig.houses[cusp - 1].csl, st = sig.steps[csl], s12 = uniq(st.planet.houses.concat(st.star.houses)), s4 = st.subStar.houses;
    var pf = hit(m.fav, s12), pn = hit(m.neg, s12), of = hit(m.fav, s4), on = hit(m.neg, s4), level;
    if (!pf.length) level = 'no'; else if (of.length && !pn.length && !on.length) level = pf.length >= 2 || of.length >= 2 ? 'strong' : 'yes'; else if (of.length) level = 'mixed'; else if (on.length) level = 'blocked'; else level = 'open';
    return { cusp: cusp, csl: csl, st: st, pf: pf, pn: pn, of: of, on: on, level: level };
  }
  function favN(sig, code, m) { return hit(m.fav, sig.sig[code]).length; }
  function negN(sig, code, m) { return hit(m.neg, sig.sig[code]).length; }
  function goodSig(sig, code, m) { var f = favN(sig, code, m); return f > 0 && f >= negN(sig, code, m); }
  function kpTiming(sig, m, maha, from, years, rps) {
    var to = new Date(from.getTime() + years * 365.25 * DAY), out = [], rp = function (x) { return rps && rps.indexOf(x) >= 0 ? 1 : 0; };
    maha.forEach(function (md) { if (md.end <= from || md.start >= to) return; J.subPeriods(md).forEach(function (ad) { if (ad.end <= from || ad.start >= to || !goodSig(sig, ad.lord, m)) return;
      J.subPeriods(ad).forEach(function (pd) { if (pd.end <= from || pd.start >= to || !goodSig(sig, pd.lord, m)) return;
        var score = favN(sig, ad.lord, m) + favN(sig, pd.lord, m) - 0.5 * (negN(sig, ad.lord, m) + negN(sig, pd.lord, m)) + 1.5 * (rp(ad.lord) + rp(pd.lord)) + (goodSig(sig, md.lord, m) ? 1 : 0);
        out.push({ md: md.lord, ad: ad.lord, pd: pd.lord, start: pd.start < from ? from : pd.start, end: pd.end, score: score }); }); }); });
    if (out.length) { var mx = Math.max.apply(null, out.map(function (w) { return w.score; })); out.forEach(function (w) { w.rank = w.score >= mx - 0.01 ? 2 : w.score >= mx * 0.75 ? 1 : 0; }); }
    return out;
  }
  function topWindows(list, n) { return list.slice().sort(function (a, b) { return b.score - a.score || a.start - b.start; }).slice(0, n).sort(function (a, b) { return a.start - b.start; }); }
  function judgeMatter(sig, mk, maha, from, years, rps) { var m = KP_MATTERS[mk]; var js = m.cusps.map(function (cu) { return cslJudge(sig, cu, m); }); return { m: m, key: mk, js: js, main: js[0], sig: sig, timing: kpTiming(sig, m, maha, from, years, rps) }; }

  /* ---------- day verdict (personal) ---------- */
  function dayScore(c, pc, wd) {
    var nat = c.k.P.Mo, count = ((pc.nak.index - nat.nak.index + 27) % 27) + 1, taraN = ((count - 1) % 9) + 1, tara = KB.TARA[taraN];
    var cb = J.houseFrom(nat.sign, pc.moonSign), f = [], total = 0;
    function add(label, val, why) { f.push({ label: label, val: val, why: why }); total += val; }
    add('Tara: ' + tara[0], tara[1], tara[2] + ' (day star ' + pc.nak.name + ' is ' + nth(count) + ' from your ' + nat.nak.name + ').');
    var cbVal = cb === 8 ? -3 : [1, 3, 6, 7, 10, 11].indexOf(cb) >= 0 ? 1 : (cb === 4 || cb === 12) ? -1 : 0;
    add(cb === 8 ? 'Chandrashtama' : 'Moon ' + nth(cb) + ' from natal Moon', cbVal, 'Moon in ' + SG[pc.moonSign] + ', ' + nth(cb) + ' from your natal Moon in ' + SG[nat.sign] + '.');
    var g = KB.GHATAK[nat.sign], gt = g[1].split(',').map(Number), hits = [];
    if (wd === g[2]) { hits.push('Ghatak day'); add('Ghatak day', -2, J.VARAS[wd] + ' is the Ghatak day for ' + J.SIGNS_HI[nat.sign] + ' rashi.'); }
    if (gt.indexOf(pc.tithi.num) >= 0) { hits.push('Ghatak tithi'); add('Ghatak tithi', -1, 'Tithi ' + pc.tithi.num + ' is a Ghatak tithi for you.'); }
    if (pc.nak.index === g[3]) { hits.push('Ghatak nakshatra'); add('Ghatak nakshatra', -2, pc.nak.name + ' is your Ghatak nakshatra.'); }
    if (pc.yoga.n === g[4]) { hits.push('Ghatak yoga'); add('Ghatak yoga', -1, pc.yoga.name + ' is your Ghatak yoga.'); }
    if (pc.yoga.n === 16 || pc.yoga.n === 26) add(pc.yoga.name + ' yoga', -1, pc.yoga.name + ' is an inauspicious yoga.');
    if (pc.karana.name === 'Vishti') add('Bhadra (Vishti) karana', -1, 'Vishti karana at sunrise: avoid new starts while it lasts.');
    var v = total >= 2 ? 'push' : total >= 0 ? 'steady' : 'backend';
    if (cb === 8 || wd === g[2]) v = 'backend';
    return { score: total, v: v, factors: f, tara: tara, taraN: taraN, cb: cb, hits: hits };
  }
  var VWORD = { push: 'Strong day', steady: 'Steady day', backend: 'Go slow' };
  var VGUIDE = { push: 'Good for important meetings, closures, negotiations and new starts.', steady: 'Fine for follow-ups and routine work. Hold big commitments for a stronger day.', backend: 'Plan, prepare and follow up. Avoid signatures, big purchases and hard negotiations.' };
  function bestHoras(hs, parts, tz) { return hs.filter(function (h) { if (!h.day || (h.lord !== 'Ju' && h.lord !== 'Me' && h.lord !== 'Ve')) return false; var x = loc(h.start).getUTCHours(); if (x < 8 || x >= 20) return false; return !(h.start < parts.rahu.end && parts.rahu.start < h.end) && !(h.start < parts.yama.end && parts.yama.start < h.end); }); }

  /* ---------- transits for a month ---------- */
  function vedhaBlock(code, hm, tr) {
    var v = KB.VEDHA[code] && KB.VEDHA[code][hm]; if (!v) return null;
    var exempt = { Su: 'Sa', Sa: 'Su', Mo: 'Me', Me: 'Mo' };
    if (code === 'Ra' || code === 'Ke') return null;
    var blockers = tr.filter(function (x) { return x.code !== code && x.code !== exempt[code] && x.code !== 'Ra' && x.code !== 'Ke' && x.m === v; });
    return blockers.length ? { house: v, by: blockers.map(function (x) { return x.code; }) } : null;
  }
  function transitAt(c, date) {
    var k = c.k, tr = J.kundli(date, c.p.lat, c.p.lon).planets.map(function (p) { return { code: p.code, lon: p.lon, sign: p.sign, deg: p.deg, retro: p.retro, nak: p.nak, h: J.houseFrom(k.ascSign, p.sign), m: J.houseFrom(k.P.Mo.sign, p.sign) }; });
    tr.forEach(function (x) {
      var good = KB.GOCHAR_GOOD[x.code].indexOf(x.m) >= 0, bav = c.av.bav[x.code] ? c.av.bav[x.code][x.sign] : null, ved = good ? vedhaBlock(x.code, x.m, tr) : null;
      var score = (good ? 2 : -1) + (bav == null ? 0 : bav >= 5 ? 1 : bav <= 3 ? -1 : 0) + (ved ? -2 : 0);
      x.good = good; x.bav = bav; x.sav = c.av.sav[x.sign]; x.vedha = ved; x.verdict = score >= 2 ? 'good' : score >= 0 ? 'mixed' : 'bad';
      x.text = KB.GOCHAR[x.code][x.m];
      x.why = [nth(x.m) + ' from your natal Moon: classical gochar says "' + KB.GOCHAR[x.code][x.m] + '".', (bav == null ? 'Nodes have no Ashtakavarga.' : bav + ' of 8 bindus in ' + SG[x.sign] + ' in ' + PN[x.code] + "'s own Ashtakavarga" + (bav >= 5 ? ': strong support.' : bav <= 3 ? ': weak support.' : '.')), 'Your ' + nth(x.h) + ' house from lagna: ' + houseTopic(x.h) + '.'];
      if (ved) x.why.push('Vedha: ' + ved.by.map(function (b) { return PN[b]; }).join(', ') + ' in the ' + nth(ved.house) + ' from Moon blocks the good result.');
    });
    return tr;
  }
  function sadeSati(c, date) {
    var sa = J.signOf(C.sidereal('Sa', date)), m = J.houseFrom(c.k.P.Mo.sign, sa);
    var map = { 12: ['Sade Sati: rising phase', 'bad'], 1: ['Sade Sati: peak phase', 'bad'], 2: ['Sade Sati: setting phase', 'bad'], 4: ['Kantaka Shani (Dhaiya)', 'bad'], 8: ['Ashtama Shani (Dhaiya)', 'bad'] };
    var r = map[m] || ['No Sade Sati or Dhaiya', 'good'];
    var end = J.nextIngress('Sa', date, 1200);
    return { label: r[0], q: r[1], house: m, until: r[1] === 'bad' ? end : null };
  }
  function transitMonth(c, y, mo, now) {
    var start = new Date(Date.UTC(y, mo, 1) - fmtTZ * 3600e3), end = new Date(Date.UTC(y, mo + 1, 1) - fmtTZ * 3600e3);
    var ref = now && now >= start && now < end ? now : new Date(start.getTime() + 15 * DAY);
    var tr = transitAt(c, ref), evs = J.events(start, end, ['Su', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra']);
    tr.forEach(function (x) { if (x.code === 'Mo') return; var n = J.nextIngress(x.code === 'Ke' ? 'Ra' : x.code, ref, 1500); x.next = n; x.nextSign = n ? (x.code === 'Ke' ? (J.signOf(C.sidereal('Ra', new Date(n.getTime() + 3600e3))) + 6) % 12 : J.signOf(C.sidereal(x.code, new Date(n.getTime() + 3600e3)))) : null; });
    var ch = J.dashaChain(c.maha, ref, 4);
    var ruler = ch[2] ? ch[2].lord : ch[1] ? ch[1].lord : null, rx = tr.filter(function (x) { return x.code === ruler; })[0];
    return { start: start, end: end, ref: ref, tr: tr.filter(function (x) { return x.code !== 'Mo'; }), events: evs, chain: ch, ruler: ruler, rulerTr: rx, sade: sadeSati(c, ref) };
  }

  /* ---------- health ---------- */
  var MAL = ['Sa', 'Ma', 'Ra', 'Ke', 'Su'];
  function healthAnalysis(c, now) {
    var k = c.k, zones = [];
    for (var h = 1; h <= 12; h++) {
      var sign = (k.ascSign + h - 1) % 12, occ = k.planets.filter(function (p) { return p.house === h; }), asp = J.aspectsOnHouse(k, h).filter(function (x) { return occ.map(function (p) { return p.code; }).indexOf(x) < 0; });
      var lord = J.lordOfHouse(k.ascSign, h), lp = k.P[lord], sav = savOf(c, h), risk = 0, minus = [], plus = [];
      occ.forEach(function (p) { if (MAL.indexOf(p.code) >= 0) { var strongOcc = p.code === J.lordOfHouse(k.ascSign, 1) || ['Exalted', 'Own sign', 'Moolatrikona'].indexOf(p.dignity) >= 0; risk += p.code === 'Su' || strongOcc ? 1 : 2; minus.push(PN[p.code] + ' sits here (' + KB.PLANET[p.code].body + ')' + (strongOcc ? ', though it is strong, so milder.' : '.')); } else if (p.code === 'Ju' || p.code === 'Ve' || p.code === 'Mo') { risk -= 1; plus.push(PN[p.code] + ' here protects.'); } });
      asp.forEach(function (x) { if (x === 'Sa' || x === 'Ma' || x === 'Ra' || x === 'Ke') { risk += 1; minus.push(PN[x] + ' aspects this house.'); } if (x === 'Ju') { risk -= 1; plus.push('Jupiter aspects and protects.'); } });
      if ([6, 8, 12].indexOf(lp.house) >= 0 && h !== 6 && h !== 8 && h !== 12) { risk += 1; minus.push('Its lord ' + PN[lord] + ' sits in the ' + nth(lp.house) + '.'); }
      if (lp.dignity === 'Debilitated') { risk += 1; minus.push('Its lord ' + PN[lord] + ' is debilitated.'); }
      if (lp.dignity === 'Exalted' || lp.dignity === 'Own sign' || lp.dignity === 'Moolatrikona') { risk -= 1; plus.push('Its lord ' + PN[lord] + ' is strong (' + lp.dignity.toLowerCase() + ').'); }
      if (sav < 25) { risk += 1; minus.push('Only ' + sav + ' Ashtakavarga points.'); } else if (sav >= 30) { risk -= 1; plus.push(sav + ' Ashtakavarga points (good reserve).'); }
      var why = minus.concat(plus);
      zones.push({ house: h, sign: sign, body: KB.HOUSE[h].body + '; ' + KB.SIGN_BODY[sign], occ: occ.map(function (p) { return p.code; }), sav: sav, risk: risk, level: risk >= 3 ? 'watch' : risk >= 1 ? 'care' : 'good', why: why, plus: plus, minus: minus });
    }
    var lagnaLord = k.P[J.lordOfHouse(k.ascSign, 1)], vital = 0, vwhy = [];
    if (['Exalted', 'Own sign', 'Moolatrikona'].indexOf(lagnaLord.dignity) >= 0) { vital += 2; vwhy.push('Lagna lord ' + PN[lagnaLord.code] + ' is ' + lagnaLord.dignity.toLowerCase() + '.'); }
    if (lagnaLord.dignity === 'Debilitated') { vital -= 2; vwhy.push('Lagna lord ' + PN[lagnaLord.code] + ' is debilitated.'); }
    if ([6, 8, 12].indexOf(lagnaLord.house) >= 0) { vital -= 1; vwhy.push('Lagna lord sits in the ' + nth(lagnaLord.house) + '.'); }
    if ([1, 4, 5, 7, 9, 10].indexOf(lagnaLord.house) >= 0) { vital += 1; vwhy.push('Lagna lord well placed in the ' + nth(lagnaLord.house) + '.'); }
    var s1 = savOf(c, 1), s8 = savOf(c, 8), s6 = savOf(c, 6);
    vwhy.push('Lagna ' + s1 + ', 6th ' + s6 + ', 8th ' + s8 + ' Ashtakavarga points.');
    vital += s1 >= 28 ? 1 : s1 < 25 ? -1 : 0; vital += s8 >= 28 ? 1 : s8 < 22 ? -1 : 0;
    var moon = k.P.Mo; if (moon.dignity === 'Debilitated' || [6, 8, 12].indexOf(moon.house) >= 0) { vital -= 1; vwhy.push('Moon (mind and fluids) is under strain.'); }
    var overall = vital >= 2 ? 'Strong constitution' : vital >= 0 ? 'Moderate reserves, decent recovery' : 'Needs consistent care';
    /* timeline: next 6 months */
    var tl = [], from = now, to = new Date(now.getTime() + 183 * DAY);
    var chW = J.signWindows('Mo', (moon.sign + 7) % 12, from, to, 6).slice(0, 4);
    chW.forEach(function (w) { tl.push({ start: w.start || from, end: w.end, q: 'care', t: 'Chandrashtama: low energy; rest more and avoid strain.' }); });
    var ss = sadeSati(c, now); if (ss.q === 'bad') tl.push({ start: now, end: ss.until, q: 'care', t: ss.label + ': fatigue and stress; keep sleep and meals fixed.' });
    ['Ma', 'Sa', 'Ra'].forEach(function (code) {
      var s = J.signOf(C.sidereal(code, now)), hl = J.houseFrom(k.ascSign, s); if ([1, 6, 8, 12].indexOf(hl) >= 0) { var e = J.nextIngress(code, now, 1200); tl.push({ start: now, end: e, q: 'care', t: PN[code] + ' transits your ' + nth(hl) + ' house (' + KB.HOUSE[hl].body + '). Watch: ' + KB.PLANET[code].body.split(',').slice(0, 3).join(',') + '.' }); }
    });
    var ch = J.dashaChain(c.maha, now, 3), dnote = [];
    ch.forEach(function (x, i) { var ls = J.lordsOf(k.ascSign, x.lord), pl = k.P[x.lord]; if (ls.some(function (h) { return [6, 8, 12].indexOf(h) >= 0; }) || [6, 8, 12].indexOf(pl.house) >= 0) dnote.push(['Mahadasha', 'Antardasha', 'Pratyantar'][i] + ' lord ' + PN[x.lord] + ' (' + lordNote(c, x.lord) + ') links to 6/8/12: health needs attention until ' + dmy(x.end) + '.'); });
    var support = [], ju = J.signOf(C.sidereal('Ju', now)), jh = J.houseFrom(k.ascSign, ju);
    if ([1, 5, 7, 9].indexOf(jh) >= 0) support.push('Jupiter transits your ' + nth(jh) + ' and aspects your lagna: protective.');
    var jn = J.nextIngress('Ju', now, 500); if (jn) { var js = J.signOf(C.sidereal('Ju', new Date(jn.getTime() + 3600e3))), jh2 = J.houseFrom(k.ascSign, js); if ([1, 5, 7, 9].indexOf(jh2) >= 0) support.push(dmy(jn) + ': Jupiter enters your ' + nth(jh2) + ' and aspects your lagna.'); }
    support.push('Strengthen lagna lord ' + PN[lagnaLord.code] + ': ' + KB.MANTRA[lagnaLord.code][0] + '.');
    return { overall: overall, vital: vital, vwhy: vwhy, zones: zones.slice().sort(function (a, b) { return b.risk - a.risk; }), timeline: tl.sort(function (a, b) { return a.start - b.start; }), dasha: dnote, support: support, sade: ss };
  }

  /* ---------- event analysis ---------- */
  function eventAnalysis(c, type, date) {
    var E = KB.EVENTS[type], k = c.k, ev = E.houses, out = { type: type, E: E, date: date };
    var ch = J.dashaChain(c.maha, date, 5), score = {}; J.PC.forEach(function (x) { score[x] = { s: 0, why: [] }; });
    function add(code, v, why) { score[code].s += v; score[code].why.push(why); }
    out.dasha = ch.map(function (x, i) {
      var ls = J.lordsOf(k.ascSign, x.lord), pl = k.P[x.lord], kpS = c.sig.sig[x.lord], parH = uniq(ls.concat([pl.house]).concat(x.lord === 'Ra' || x.lord === 'Ke' ? J.lordsOf(k.ascSign, J.RULER[pl.sign]) : [])), evP = hit(ev, parH), evK = hit(ev, kpS);
      var w = [3, 3, 2, 1, 0.5][i]; if (evP.length || evK.length) add(x.lord, w + evP.length + evK.length * 0.5, ['Mahadasha', 'Antardasha', 'Pratyantar', 'Sookshma', 'Prana'][i] + ' lord, linked to houses ' + uniq(evP.concat(evK)).sort(function (a, b) { return a - b; }).join(', ') + '.');
      return { level: i, lord: x.lord, start: x.start, end: x.end, par: parH, kp: kpS, evP: evP, evK: evK };
    });
    var T = J.kundli(date, c.p.lat, c.p.lon), points = [{ code: 'Lagna', lon: k.asc }].concat(k.planets.map(function (p) { return { code: p.code, lon: p.lon }; }));
    out.transits = T.planets.map(function (p) {
      var hl = J.houseFrom(k.ascSign, p.sign), hm2 = J.houseFrom(k.P.Mo.sign, p.sign), conj = [];
      points.forEach(function (pt) { if (pt.code === p.code && pt.code !== 'Lagna') return; var d = Math.abs(norm(p.lon - pt.lon + 180) - 180); if (d <= 3) conj.push({ code: pt.code, orb: d }); });
      var asp = J.aspectedHouses(p.code, hl).filter(function (h) { return ev.indexOf(h) >= 0; });
      var bav = c.av.bav[p.code] ? c.av.bav[p.code][p.sign] : null;
      var malefic = ['Ma', 'Sa', 'Ra', 'Ke', 'Su'].indexOf(p.code) >= 0;
      if (E.karakas.indexOf(p.code) >= 0 || !E.good) {
        if (ev.indexOf(hl) >= 0 && (E.good ? !malefic : malefic)) add(p.code, 2, 'Transiting your ' + nth(hl) + ' (' + houseTopic(hl).split(',')[0] + ').');
        conj.forEach(function (cj) { if (cj.code === 'Lagna' || (cj.code !== p.code && (ev.indexOf(k.P[cj.code] ? k.P[cj.code].house : 0) >= 0 || J.lordsOf(k.ascSign, cj.code).some(function (h) { return ev.indexOf(h) >= 0 || h === 1; })))) add(p.code, 3 - cj.orb / 1.5, 'Transit ' + PN[p.code] + ' within ' + cj.orb.toFixed(1) + '° of natal ' + (cj.code === 'Lagna' ? 'lagna' : PN[cj.code] + ' (' + lordNote(c, cj.code) + ')') + '.'); });
        if (asp.length && (E.good ? !malefic : malefic)) add(p.code, 1, 'Aspecting your ' + asp.map(nth).join(', ') + ' house.');
      }
      if (E.karakas.indexOf(p.code) >= 0) add(p.code, 1, 'Natural significator (karaka) for this kind of event.');
      if (bav != null && bav <= 2 && !E.good) add(p.code, 1, 'Only ' + bav + ' bindus in ' + SG[p.sign] + ': weak protection.');
      return { code: p.code, lon: p.lon, sign: p.sign, deg: p.deg, retro: p.retro, h: hl, m: hm2, conj: conj, asp: asp, bav: bav };
    });
    /* double transit (Jupiter and Saturn on the main event house or its lord) */
    var main = ev[ev.length > 2 ? 2 : 0], mainSign = (k.ascSign + main - 1) % 12, lordSign = k.P[J.lordOfHouse(k.ascSign, main)].sign;
    function touches(code) { var t = out.transits.filter(function (x) { return x.code === code; })[0], hs = [t.h].concat(J.aspectedHouses(code, t.h)); return hs.indexOf(main) >= 0 || hs.indexOf(J.houseFrom(k.ascSign, lordSign)) >= 0; }
    out.doubleTransit = { house: main, ju: touches('Ju'), sa: touches('Sa') };
    var ranked = J.PC.map(function (x) { return { code: x, s: score[x].s, why: score[x].why }; }).filter(function (x) { return x.s > 0; }).sort(function (a, b) { return b.s - a.s; });
    out.ranked = ranked; out.main = ranked[0] || null; out.support = ranked.slice(1, 3);
    /* KP check */
    out.kp = ev.map(function (h) { var hs = c.sig.houses[h - 1]; return { house: h, csl: hs.csl, sig: c.sig.sig[hs.csl] }; });
    var running = ch.slice(0, 3).map(function (x) { return x.lord; }), kpRun = running.map(function (l) { return { lord: l, ev: hit(ev, c.sig.sig[l]) }; });
    out.kpRun = kpRun;
    /* outlook: when things turn */
    var outlook = [];
    if (out.main) {
      var mt = out.transits.filter(function (x) { return x.code === out.main.code; })[0];
      if (mt && out.main.code !== 'Mo') { var ni = J.nextIngress(out.main.code === 'Ke' ? 'Ra' : out.main.code, date, 1500); if (ni) outlook.push({ t: ni, text: PN[out.main.code] + ' leaves ' + SG[mt.sign] + (E.good ? '' : ': the acute pressure eases') + '.' }); }
    }
    ch.slice(1, 3).forEach(function (x, i) {
      var lvl = ['Antardasha', 'Pratyantar', 'Sookshma'][i];
      if (score[x.lord].s > 0 && !E.good) outlook.push({ t: x.end, text: lvl + ' of ' + PN[x.lord] + ' ends.' });
      var nxt = J.subPeriods(ch[i])[J.subPeriods(ch[i]).map(function (y) { return y.lord; }).indexOf(x.lord) + 1];
      if (nxt && i < 2) { var rec = hit(E.recover, c.sig.sig[nxt.lord]), bad = hit(ev, c.sig.sig[nxt.lord]);
        outlook.push({ t: nxt.start, text: 'Next ' + lvl.toLowerCase() + ': ' + PN[nxt.lord] + ' signifies ' + (rec.length ? rec.join(', ') + (E.heal ? ' (recovery houses)' : '') : 'none of ' + E.recover.join(', ')) + (bad.length && !E.good ? '; also ' + bad.join(', ') + ', so keep follow-ups' : '') + '.' }); }
    });
    out.outlook = outlook.filter(function (o) { return o.t > date; }).sort(function (a, b) { return a.t - b.t; }).slice(0, 5);
    /* recovery or follow-through periods: pratyantars from the event onward whose lords signify the recovery houses */
    var rec = [], horizon = new Date(date.getTime() + 548 * DAY);
    J.dashaChain(c.maha, date, 1).forEach(function (md) { J.subPeriods(md).forEach(function (ad) { if (ad.end <= date || ad.start > horizon) return; J.subPeriods(ad).forEach(function (pd) {
      if (pd.start <= date || pd.start > horizon || rec.length >= 3) return;
      var s = c.sig.sig[pd.lord], r = hit(E.recover, s), b = hit(ev, s).filter(function (h) { return E.recover.indexOf(h) < 0; }), sa = c.sig.sig[ad.lord], ra = hit(E.recover, sa);
      if (r.length && b.length <= r.length) rec.push({ lord: pd.lord, ad: ad.lord, start: pd.start, end: pd.end, houses: r, strong: ra.length > 0 });
    }); }); });
    out.recovery = rec;
    rec.forEach(function (r) { out.outlook.push({ t: r.start, text: (E.heal ? 'Healing support: ' : E.good ? 'Follow-through: ' : 'Relief: ') + PN[r.ad] + '–' + PN[r.lord] + ' period until ' + dmy(r.end) + '; ' + PN[r.lord] + ' signifies ' + r.houses.join(', ') + (r.strong ? ', and the antardasha lord supports it too' : '') + '.', rec: true }); });
    out.outlook.sort(function (a, b) { return a.t - b.t; });
    return out;
  }

  /* ---------- report ---------- */
  function strongestHouses(c) { var hs = []; for (var h = 1; h <= 12; h++) hs.push({ h: h, v: savOf(c, h) }); return hs.sort(function (a, b) { return b.v - a.v; }); }
  function report(c, now) {
    var k = c.k, P = k.P, L = k.ascSign, ll = J.lordOfHouse(L, 1), llp = P[ll], sec = [];
    var sh = strongestHouses(c), yg = c.yogas.filter(function (y) { return y.kind === 'raja' || y.kind === 'mahapurusha' || y.kind === 'dhana'; });
    sec.push({ id: 'short', title: 'In short', items: [
      { k: 'info', t: SG[L] + ' lagna, lord ' + PN[ll] + ' in the ' + nth(llp.house) + ' (' + llp.dignity.toLowerCase() + ')', why: ['Lagna ' + SG[L] + ': ' + KB.SIGN_TRAIT[L] + '.', PN[ll] + ' in the ' + nth(llp.house) + ': ' + KB.IN_HOUSE[ll][llp.house] + '.'] },
      { k: 'info', t: 'Moon in ' + SG[P.Mo.sign] + ', ' + P.Mo.nak.name + ' pada ' + P.Mo.nak.pada, why: ['Moon sign: ' + KB.SIGN_TRAIT[P.Mo.sign] + '.', P.Mo.nak.name + ': ' + KB.NAK_TRAIT[P.Mo.nak.index] + '.'] },
      { k: 'pro', t: 'Strongest areas: ' + sh.slice(0, 2).map(function (x) { return nth(x.h) + ' (' + houseTopic(x.h).split(',')[0] + ')'; }).join(', '), why: sh.slice(0, 3).map(function (x) { return nth(x.h) + ' house: ' + x.v + ' Ashtakavarga points.'; }) }]
      .concat(yg.slice(0, 2).map(function (y) { return { k: 'pro', t: y.name, why: [y.why] }; })) });
    /* personality */
    var p1 = k.planets.filter(function (p) { return p.house === 1; });
    sec.push({ id: 'personality', title: 'Personality', items: [
      { k: 'info', t: KB.SIGN_TRAIT[L].charAt(0).toUpperCase() + KB.SIGN_TRAIT[L].slice(1), why: [SG[L] + ' rises (' + KB.SIGN_ELEMENT[L] + ', ' + KB.SIGN_MODE[L] + ').'] },
      { k: 'info', t: 'Emotional nature: ' + KB.NAK_TRAIT[P.Mo.nak.index], why: ['Moon in ' + P.Mo.nak.name + ', ' + SG[P.Mo.sign] + '.'] }]
      .concat(p1.map(function (p) { return { k: ['Ju', 'Ve', 'Me', 'Mo'].indexOf(p.code) >= 0 ? 'pro' : 'info', t: PN[p.code] + ' in the lagna: ' + KB.IN_HOUSE[p.code][1], why: [PN[p.code] + ' at ' + p.deg + ' ' + SG[p.sign] + '.'] }; })) });
    /* health */
    var H = healthAnalysis(c, now), hz = H.zones.filter(function (z) { return z.level !== 'good'; }).slice(0, 3), hg = H.zones.filter(function (z) { return z.level === 'good' && z.risk < 0; }).slice(0, 2);
    sec.push({ id: 'health', title: 'Health', badge: H.vital >= 2 ? 'Strong' : H.vital >= 0 ? 'Moderate' : 'Watch', items: [{ k: H.vital >= 0 ? 'pro' : 'con', t: H.overall, why: H.vwhy }]
      .concat(hz.map(function (z) { return { k: 'con', t: nth(z.house) + ' house (' + SG[z.sign] + '): ' + z.body.split(';')[0], why: z.why }; }))
      .concat(hg.map(function (z) { return { k: 'pro', t: 'Protected: ' + z.body.split(';')[0], why: z.plus }; })), note: 'Astrological indications only. Check symptoms with a doctor.' });
    /* career */
    var l10 = J.lordOfHouse(L, 10), p10 = P[l10], occ10 = k.planets.filter(function (p) { return p.house === 10; }), ci = [];
    ci.push({ k: ['Exalted', 'Own sign', 'Moolatrikona'].indexOf(p10.dignity) >= 0 || [1, 4, 5, 7, 9, 10, 11].indexOf(p10.house) >= 0 ? 'pro' : 'con', t: '10th lord ' + PN[l10] + ' in the ' + nth(p10.house) + ' (' + houseTopic(p10.house).split(',')[0] + ')', why: [PN[l10] + ' is ' + p10.dignity.toLowerCase() + ' in ' + SG[p10.sign] + '.', 'Career connects with ' + houseTopic(p10.house) + '.'] });
    occ10.forEach(function (p) { ci.push({ k: ['Ju', 'Ve', 'Me', 'Su'].indexOf(p.code) >= 0 ? 'pro' : 'info', t: PN[p.code] + ' in the 10th: ' + KB.IN_HOUSE[p.code][10], why: [PN[p.code] + ' at ' + p.deg + ' ' + SG[p.sign] + '.'] }); });
    var d10a = J.varga(k.asc, 10).sign, d10strong = k.planets.filter(function (p) { var v = J.varga(p.lon, 10); return [1, 4, 7, 10].indexOf(J.houseFrom(d10a, v.sign)) >= 0 && ['Exalted', 'Own sign', 'Moolatrikona'].indexOf(J.dignity(p.code, v.sign * 30 + 1)) >= 0; });
    d10strong.forEach(function (p) { var v = J.varga(p.lon, 10); ci.push({ k: 'pro', t: 'D10: ' + PN[p.code] + ' strong in ' + SG[v.sign] + ', ' + nth(J.houseFrom(d10a, v.sign)) + ' house', why: ['A strong planet in a kendra of the Dashamsha lifts career.'] }); });
    yg.filter(function (y) { return /10|karma/i.test(y.why); }).forEach(function (y) { ci.push({ k: 'pro', t: y.name, why: [y.why] }); });
    var jm = judgeMatter(c.sig, 'job', c.maha, now, 5, null); ci.push({ k: VERD[jm.main.level][1] === 'good' ? 'pro' : VERD[jm.main.level][1] === 'bad' ? 'con' : 'info', t: 'KP: ' + VERD[jm.main.level][0].toLowerCase() + ' (10th cusp sub lord ' + PN[jm.main.csl] + ')', why: ['Signifies ' + uniq(jm.main.st.planet.houses.concat(jm.main.st.star.houses)).join(', ') + '; favourable 2, 6, 10, 11.'] });
    var fields = uniq([l10].concat(occ10.map(function (p) { return p.code; })).concat(d10strong.map(function (p) { return p.code; }))).slice(0, 3);
    ci.push({ k: 'info', t: 'Suits: ' + fields.map(function (x) { return KB.CAREER_HINT[x]; }).join('; '), why: ['From the 10th lord, planets in the 10th and strong D10 planets.'] });
    sec.push({ id: 'career', title: 'Career', items: ci });
    /* money */
    var l2 = J.lordOfHouse(L, 2), l11 = J.lordOfHouse(L, 11), mi = [];
    [[2, l2], [11, l11]].forEach(function (x) { var pl = P[x[1]]; mi.push({ k: [6, 8, 12].indexOf(pl.house) >= 0 || pl.dignity === 'Debilitated' ? 'con' : 'pro', t: nth(x[0]) + ' lord ' + PN[x[1]] + ' in the ' + nth(pl.house), why: [PN[x[1]] + ' is ' + pl.dignity.toLowerCase() + '.', 'Money flows through ' + houseTopic(pl.house) + '.'] }); });
    var s11 = savOf(c, 11), s12 = savOf(c, 12), s2 = savOf(c, 2);
    mi.push({ k: s11 > s12 ? 'pro' : 'con', t: s11 > s12 ? 'Income runs ahead of expenses' : 'Expenses tend to match income', why: ['11th house ' + s11 + ' vs 12th house ' + s12 + ' Ashtakavarga points; 2nd has ' + s2 + '.'] });
    c.yogas.filter(function (y) { return y.kind === 'dhana'; }).slice(0, 2).forEach(function (y) { mi.push({ k: 'pro', t: y.name, why: [y.why] }); });
    sec.push({ id: 'money', title: 'Money', items: mi });
    /* marriage */
    var l7 = J.lordOfHouse(L, 7), p7 = P[l7], occ7 = k.planets.filter(function (p) { return p.house === 7; }), wi = [];
    wi.push({ k: [6, 8, 12].indexOf(p7.house) >= 0 || p7.dignity === 'Debilitated' ? 'con' : 'pro', t: '7th lord ' + PN[l7] + ' in the ' + nth(p7.house), why: [PN[l7] + ' is ' + p7.dignity.toLowerCase() + ' in ' + SG[p7.sign] + '.'] });
    occ7.forEach(function (p) { wi.push({ k: ['Ju', 'Ve', 'Me', 'Mo'].indexOf(p.code) >= 0 ? 'pro' : 'con', t: PN[p.code] + ' in the 7th: ' + KB.IN_HOUSE[p.code][7], why: [PN[p.code] + ' at ' + p.deg + ' ' + SG[p.sign] + '.'] }); });
    var kar = c.p.gender === 'F' ? 'Ju' : 'Ve', kp2 = P[kar], kv9 = J.varga(kp2.lon, 9);
    wi.push({ k: ['Exalted', 'Own sign', 'Moolatrikona', 'Friendly sign'].indexOf(kp2.dignity) >= 0 ? 'pro' : 'info', t: PN[kar] + ' (marriage karaka) in ' + SG[kp2.sign] + ', D9 ' + SG[kv9.sign], why: ['D1 ' + kp2.dignity.toLowerCase() + '; D9 ' + J.dignity(kar, kv9.sign * 30 + 1).toLowerCase() + '.'] });
    c.yogas.filter(function (y) { return /Mangal/.test(y.name); }).forEach(function (y) { wi.push({ k: y.kind === 'dosha' ? 'con' : 'info', t: y.name + (y.kind === 'mild' ? ' (mild)' : ''), why: [y.why] }); });
    var mm = judgeMatter(c.sig, 'marriage', c.maha, now, 5, null); wi.push({ k: VERD[mm.main.level][1] === 'good' ? 'pro' : VERD[mm.main.level][1] === 'bad' ? 'con' : 'info', t: 'KP: ' + VERD[mm.main.level][0].toLowerCase(), why: ['7th cusp sub lord ' + PN[mm.main.csl] + ' signifies ' + uniq(mm.main.st.planet.houses.concat(mm.main.st.star.houses)).join(', ') + '; favourable 2, 7, 11.'] });
    sec.push({ id: 'marriage', title: 'Marriage and partners', items: wi });
    /* children */
    var l5 = J.lordOfHouse(L, 5), p5 = P[l5]; sec.push({ id: 'children', title: 'Children and learning', items: [
      { k: [6, 8, 12].indexOf(p5.house) >= 0 ? 'con' : 'pro', t: '5th lord ' + PN[l5] + ' in the ' + nth(p5.house), why: [PN[l5] + ' is ' + p5.dignity.toLowerCase() + '; 5th house has ' + savOf(c, 5) + ' points.'] },
      { k: 'info', t: 'Jupiter (children, wisdom) in the ' + nth(P.Ju.house) + ' (' + P.Ju.dignity.toLowerCase() + ')', why: [KB.IN_HOUSE.Ju[P.Ju.house] + '.'] }] });
    /* current period */
    var ch = J.dashaChain(c.maha, now, 3), cp = [];
    ch.forEach(function (x, i) { var f = funcWord(c, x.lord), lvl = ['Mahadasha', 'Antardasha', 'Pratyantar'][i]; cp.push({ k: f === 'malefic' ? 'con' : (f === 'benefic' || f === 'yogakaraka') ? 'pro' : 'info', t: lvl + ': ' + PN[x.lord] + ' (' + dmy(x.start) + ' – ' + dmy(x.end) + ')', why: [PN[x.lord] + ' ' + lordNote(c, x.lord) + '; functional ' + f + ' for ' + SG[L] + ' lagna.', 'Themes: ' + uniq(J.lordsOf(L, x.lord).concat([P[x.lord].house])).map(function (h) { return houseTopic(h).split(',')[0]; }).join(', ') + '.'] }); });
    var ss = sadeSati(c, now); cp.push({ k: ss.q === 'bad' ? 'con' : 'pro', t: ss.label + (ss.until ? ' until ' + dmy(ss.until) : ''), why: ['Saturn is ' + nth(ss.house) + ' from your natal Moon.'] });
    sec.push({ id: 'now', title: 'Current period', items: cp });
    /* next 3 years */
    var tl = [], end3 = new Date(now.getTime() + 3 * 365.25 * DAY);
    ch[0] && J.subPeriods(ch[0]).forEach(function (ad) { if (ad.start > now && ad.start < end3) tl.push({ t: ad.start, text: PN[ad.lord] + ' antardasha begins: ' + uniq(J.lordsOf(L, ad.lord).concat([P[ad.lord].house])).map(function (h) { return houseTopic(h).split(',')[0]; }).join(', ') + ' come forward.' }); });
    ch[1] && J.subPeriods(ch[1]).forEach(function (pd) { if (pd.start > now && pd.start < new Date(now.getTime() + 400 * DAY)) tl.push({ t: pd.start, text: PN[pd.lord] + ' pratyantar: ' + KB.IN_HOUSE[pd.lord][P[pd.lord].house].split(';')[0] + '.' }); });
    J.events(now, end3, ['Ju', 'Sa', 'Ra']).filter(function (e) { return e.type === 'ingress'; }).forEach(function (e) { var h = J.houseFrom(L, e.sign), m = J.houseFrom(P.Mo.sign, e.sign); tl.push({ t: e.t, text: PN[e.code] + (e.code !== 'Ra' && C.speed(e.code, e.t) < 0 ? ' (retrograde) moves back into ' : ' enters ') + SG[e.sign] + ', your ' + nth(h) + ' (' + houseTopic(h).split(',')[0] + '); ' + nth(m) + ' from Moon: ' + KB.GOCHAR[e.code][m] + '.' }); });
    sec.push({ id: 'future', title: 'Next 3 years', timeline: tl.sort(function (a, b) { return a.t - b.t; }).slice(0, 12) });
    return sec;
  }

  /* ---------- remedies ---------- */
  function remedies(c, now) {
    var k = c.k, f = c.func, L = k.ascSign, gem = [], ll = J.lordOfHouse(L, 1);
    J.P7.forEach(function (code) {
      var fx = f[code], p = k.P[code], kind;
      if (code === ll || fx.kind === 'yogakaraka' || fx.kind === 'benefic') kind = [6, 8, 12].indexOf(p.house) >= 0 && code !== ll ? 'care' : 'yes';
      else if (fx.kind === 'malefic') kind = 'no'; else kind = 'care';
      var why = code === ll ? PN[code] + ' is your lagna lord' : fx.kind === 'yogakaraka' ? PN[code] + ' is your yogakaraka (rules ' + fx.houses.join(' & ') + ')' : fx.kind === 'benefic' ? PN[code] + ' is a functional benefic (rules ' + fx.houses.join(' & ') + ')' : fx.kind === 'malefic' ? PN[code] + ' is a functional malefic for ' + SG[L] + ' lagna (rules ' + fx.houses.join(' & ') + ')' : PN[code] + ' is neutral for your lagna (rules ' + fx.houses.join(' & ') + ')';
      if (kind === 'care' && [6, 8, 12].indexOf(p.house) >= 0 && fx.kind !== 'malefic' && fx.kind !== 'neutral') why += ', but it sits in the ' + nth(p.house) + ', so use a lighter stone or upratna';
      if (fx.maraka && kind !== 'no') why += '; it is also a maraka (2nd/7th lord), so take advice first';
      gem.push({ code: code, kind: kind, gem: KB.GEM[code][0], how: KB.GEM[code][1], up: KB.UPRATNA[code], why: why + '.', dignity: p.dignity, house: p.house });
    });
    var order = { yes: 0, care: 1, no: 2 }; gem.sort(function (a, b) { return order[a.kind] - order[b.kind]; });
    var ch = J.dashaChain(c.maha, now, 3), focus = uniq(ch.map(function (x) { return x.lord; }).concat([ll]));
    var ss = sadeSati(c, now); if (ss.q === 'bad' && focus.indexOf('Sa') < 0) focus.push('Sa');
    var plan = focus.map(function (code) {
      var fx = f[code] || { kind: 'node', houses: [] }, bad = fx.kind === 'malefic' || code === 'Ra' || code === 'Ke', good = code === ll || fx.kind === 'benefic' || fx.kind === 'yogakaraka', sat = code === 'Sa' && ss.q === 'bad';
      return { code: code, mode: bad ? 'calm' : good && sat ? 'both' : good ? 'strengthen' : sat ? 'calm' : 'balance', why: (ch.some(function (x) { return x.lord === code; }) ? 'Running dasha lord. ' : '') + (code === ll ? 'Lagna lord. ' : '') + (code === 'Sa' && ss.q === 'bad' ? ss.label + '. ' : ''),
        mantra: KB.MANTRA[code], daan: KB.DAAN[code], lalkitab: KB.LALKITAB[code], fast: KB.FAST[code], rudra: KB.RUDRA[code], crystal: KB.CRYSTAL[code] };
    });
    var benefics = J.P7.filter(function (x) { return f[x].kind === 'benefic' || f[x].kind === 'yogakaraka' || x === ll; });
    return { func: f, gems: gem, plan: plan, rudraksha: benefics.map(function (x) { return { code: x, bead: KB.RUDRA[x] }; }), crystals: benefics.map(function (x) { return { code: x, stone: KB.CRYSTAL[x] }; }), lalkitab: k.planets.filter(function (p) { return f[p.code] && f[p.code].kind === 'malefic' || p.code === 'Ra' || p.code === 'Ke' || [6, 8, 12].indexOf(p.house) >= 0; }).map(function (p) { return { code: p.code, house: p.house, text: KB.LALKITAB[p.code] }; }) };
  }

  /* ---------- muhurat finder ---------- */
  function muhurat(purpose, from, days, lat, lon, tz, c) {
    var R = KB.MUHURAT[purpose], out = [];
    for (var i = 0; i < days; i++) {
      var dayStart = new Date(Date.UTC(loc(from).getUTCFullYear(), loc(from).getUTCMonth(), loc(from).getUTCDate() + i) - tz * 3600e3);
      var pc = J.panchangLite(dayStart, lat, lon), wd = loc(pc.rise).getUTCDay(), why = [], bad = [];
      if (R.naks.indexOf(pc.nak.index) < 0) continue;
      if (R.days.indexOf(wd) < 0) continue;
      if ([4, 9, 14].indexOf(pc.tithi.num) >= 0) bad.push('Rikta tithi'); if (pc.tithi.n === 30) bad.push('Amavasya');
      if ([0, 5, 8, 9, 12, 14, 16, 18, 26].indexOf(pc.yoga.n) >= 0) bad.push(pc.yoga.name + ' yoga');
      if (R.kharmas) { var ss = J.signOf(C.sidereal('Su', pc.rise)); if (ss === 8 || ss === 11) bad.push('Kharmas (Sun in ' + SG[ss] + ')'); }
      if (R.gurushukra) { ['Ju', 'Ve'].forEach(function (g) { if (J.isCombust(g, C.sidereal(g, pc.rise), C.sidereal('Su', pc.rise), C.speed(g, pc.rise) < 0)) bad.push(PN[g] + ' combust'); }); }
      var sc = c ? dayScore(c, pc, wd) : null;
      if (sc && (sc.taraN === 3 || sc.taraN === 5 || sc.taraN === 7)) bad.push(sc.tara[0] + ' tara for ' + c.p.name);
      if (sc && sc.cb === 8) bad.push('Chandrashtama for ' + c.p.name);
      if (bad.length) continue;
      why.push(pc.nak.name + ' nakshatra suits ' + R.l.toLowerCase());
      why.push(pc.tithi.paksha + ' ' + pc.tithi.name + ', ' + J.VARAS[wd]);
      var special = []; if (KB.AMRIT[wd] === pc.nak.index) special.push('Amrit Siddhi yoga'); if (KB.SARVARTHA[wd].indexOf(pc.nak.index) >= 0) special.push('Sarvartha Siddhi yoga'); if (pc.nak.index === 7 && wd === 4) special.push('Guru Pushya'); if (pc.nak.index === 7 && wd === 0) special.push('Ravi Pushya');
      if (sc) why.push(sc.tara[0] + ' tara for ' + c.p.name);
      var full = J.panchang(dayStart, lat, lon), parts = J.dayParts(full.rise, full.set, wd), cg = J.choghadiya(full.rise, full.set, full.nextRise, wd), vish = J.vishtiWindows(full.rise, full.set);
      function blocked(a, b) { return [parts.rahu, parts.yama, parts.gulika].concat(vish).some(function (w) { return a < w.end && w.start < b; }); }
      var wins = cg.day.filter(function (x) { return x.q === 'good' && !blocked(x.start, x.end); }).map(function (x) { return { name: x.name, start: x.start, end: x.end }; });
      if (!parts.abhijit.wednesday && !blocked(parts.abhijit.start, parts.abhijit.end)) wins.unshift({ name: 'Abhijit', start: parts.abhijit.start, end: parts.abhijit.end });
      var endN = full.nakEnd && full.nakEnd < full.set ? full.nakEnd : null; if (endN) { wins = wins.filter(function (w) { return w.start < endN; }).map(function (w) { return { name: w.name, start: w.start, end: w.end > endN ? endN : w.end }; }); why.push('Nakshatra holds until ' + hm(endN)); }
      if (!wins.length) continue;
      out.push({ date: dayStart, rise: full.rise, wd: wd, nak: pc.nak.name, tithi: pc.tithi, special: special, why: why, windows: wins, rahu: parts.rahu, shool: KB.DISHA_SHOOL[wd] });
    }
    return out;
  }

  /* ---------- my day ---------- */
  function myDay(c, dayStart, lat, lon, now) {
    var pc = J.panchang(dayStart, lat, lon), wd = loc(pc.rise).getUTCDay(), sc = dayScore(c, pc, wd), parts = J.dayParts(pc.rise, pc.set, wd), hs = J.horas(pc.rise, pc.set, pc.nextRise, wd);
    var tr = transitAt(c, now && now >= pc.rise && now < pc.nextRise ? now : new Date(pc.rise.getTime() + 4 * 3600e3)), ch = J.dashaChain(c.maha, pc.rise, 4);
    var why = sc.factors.map(function (f) { return { label: f.label, val: f.val, why: f.why }; });
    var slow = tr.filter(function (x) { return x.code === 'Sa' || x.code === 'Ju' || x.code === 'Ra'; }).map(function (x) { return PN[x.code] + ' ' + nth(x.m) + ' from Moon (' + x.verdict + '): ' + x.text; });
    var focus = []; var sk = ch[3] || ch[2];
    if (sk) focus.push('Dasha today: ' + ch.map(function (x) { return PN[x.lord]; }).join(' › ') + '. ' + PN[sk.lord] + ' (' + lordNote(c, sk.lord) + ') colours the day.');
    var mo = tr.filter(function (x) { return x.code === 'Mo'; })[0]; if (mo) focus.push('Moon in your ' + nth(mo.h) + ' (' + houseTopic(mo.h).split(',')[0] + '): ' + KB.GOCHAR.Mo[mo.m] + '.');
    return { pc: pc, wd: wd, score: sc, word: VWORD[sc.v], guide: VGUIDE[sc.v], why: why, parts: parts, horas: hs, best: bestHoras(hs, parts), slow: slow, focus: focus, chain: ch, tr: tr, sade: sadeSati(c, pc.rise) };
  }

  /* ---------- birth-time tolerance ---------- */
  function tolerance(c, fn) {
    var b = c.birth.getTime(), v0 = fn(c.birth), out = [];
    [-1, 1].forEach(function (dir) { var lo = 0, hi = null; for (var m = 1; m <= 240; m++) { if (fn(new Date(b + dir * m * 60e3)) !== v0) { hi = m; lo = m - 1; break; } } if (hi === null) { out.push(null); return; } for (var k2 = 0; k2 < 12; k2++) { var mid = (lo + hi) / 2; if (fn(new Date(b + dir * mid * 60e3)) !== v0) hi = mid; else lo = mid; } out.push(hi); });
    return out;
  }
  function tolerances(c) {
    var lat = +c.p.lat, lon = +c.p.lon, asc = function (d) { return C.lagna(d, lat, lon); };
    return [['Lagna sign (D1)', tolerance(c, function (d) { return J.signOf(asc(d)); })], ['Navamsha lagna (D9)', tolerance(c, function (d) { return J.varga(asc(d), 9).sign; })], ['Dashamsha lagna (D10)', tolerance(c, function (d) { return J.varga(asc(d), 10).sign; })],
      ['Shashtiamsha lagna (D60)', tolerance(c, function (d) { return J.varga(asc(d), 60).sign; })], ['KP lagna sub lord', tolerance(c, function (d) { return J.kpLords(C.lagna(d, lat, lon, 'kp')).sub; })], ['Moon nakshatra', tolerance(c, function (d) { return Math.floor(C.sidereal('Mo', d) / (40 / 3)); })]];
  }

  return { setTZ: setTZ, nth: nth, dmy: dmy, dmY: dmY, hm: hm, dmyt: dmyt, calc: calc, lordNote: lordNote, savOf: savOf, planet: planet, KP_MATTERS: KP_MATTERS, VERD: VERD, judgeMatter: judgeMatter, topWindows: topWindows,
    dayScore: dayScore, VWORD: VWORD, VGUIDE: VGUIDE, bestHoras: bestHoras, transitAt: transitAt, transitMonth: transitMonth, sadeSati: sadeSati, healthAnalysis: healthAnalysis, eventAnalysis: eventAnalysis,
    report: report, remedies: remedies, muhurat: muhurat, myDay: myDay, tolerances: tolerances, funcWord: funcWord, houseTopic: houseTopic, uniq: uniq };
}
if (typeof module !== 'undefined') module.exports = makeAnalysis;
