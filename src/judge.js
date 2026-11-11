/* Trikaal accuracy core: ONE judge that every screen reads from.
   planet()  how strong a planet is, from every side (sign, house, combustion, Shadbala, navamsa, company and aspects)
   period()  how a Mahadasha–Antardasha behaves (nature for this lagna + strength + the link between the two lords)
   day()     how a day is for this person, from about ten independent factors, with a confidence level
   Every result carries its factors (for / against) in plain words, and how many of them agree. */
function makeJudge(J, KB, N, BOOK) {
  var PN = J.PNAME, KEN = [1, 4, 7, 10], TRI = [5, 9], DUS = [6, 8, 12], GOODD = ['Exalted', 'Moolatrikona', 'Own sign'];
  var sbFn = null, cache = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  function nth(n) { return n + (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'); }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function memo(c, key, fn) { if (!cache) return fn(); var m = cache.get(c); if (!m) { m = {}; cache.set(c, m); } if (!(key in m)) m[key] = fn(); return m[key]; }
  /* f = {t: plain text, v: vote -1..+1, w: weight} */
  function tally(fs) {
    var sw = 0, s = 0, pro = 0, con = 0, np = 0, nc = 0;
    fs.forEach(function (f) { sw += f.w; s += f.w * f.v; if (f.v > 0.15) { pro += f.w * f.v; np++; } else if (f.v < -0.15) { con += -f.w * f.v; nc++; } });
    return { mean: sw ? s / sw : 0, pro: pro, con: con, np: np, nc: nc, n: fs.length };
  }
  function confOf(t, dir) {
    var tot = t.pro + t.con; if (!tot) return { level: 'low', share: 0.5, agree: 0, of: t.n };
    var share = (dir >= 0 ? t.pro : t.con) / tot, agree = dir >= 0 ? t.np : t.nc;
    return { level: share >= 0.72 ? 'high' : share >= 0.58 ? 'medium' : 'low', share: share, agree: agree, of: t.np + t.nc };
  }
  function d9dig(code, lon) { var s = J.varga(lon, 9).sign, ex = J.EXALT[code]; return ex === s ? 1 : ex != null && (ex + 6) % 12 === s ? -1 : J.RULER[s] === code ? 1 : 0; }

  /* ---------- 1. planet strength ---------- */
  function planet(c, code) {
    return memo(c, 'p' + code, function () {
      var k = c.k, P = k.P, p = P[code], fs = [], node = code === 'Ra' || code === 'Ke';
      function add(t, v, w) { fs.push({ t: t, v: v, w: w }); }
      if (node) {
        var dl = J.RULER[p.sign], dp = planet(c, dl);
        add('Acts through its sign lord ' + PN[dl] + ', which is ' + dp.word.toLowerCase(), dp.word === 'Strong' ? 1 : dp.word === 'Weak' ? -1 : 0, 2);
        if (p.sign === J.EXALT[code]) add('In its exaltation sign ' + J.SIGNS[p.sign], 1, 1);
        add('In the ' + nth(p.house) + ' house' + ([3, 6, 11].indexOf(p.house) >= 0 ? ', where shadow planets do well' : [8, 12].indexOf(p.house) >= 0 ? ', a difficult house' : KEN.concat(TRI).indexOf(p.house) >= 0 ? ', a prominent house' : ''), [3, 6, 11].indexOf(p.house) >= 0 ? 1 : [8, 12].indexOf(p.house) >= 0 ? -1 : KEN.concat(TRI).indexOf(p.house) >= 0 ? 0.4 : 0, 1.5);
      } else {
        var nb = (c.yogas || []).some(function (y) { return /Neecha Bhanga/.test(y.name) && y.why.indexOf(PN[code]) === 0; });
        var dv = { 'Exalted': 1, 'Moolatrikona': 0.9, 'Own sign': 0.85, 'Friendly sign': 0.45, 'Neutral sign': 0, 'Enemy sign': -0.5, 'Debilitated': nb ? -0.3 : -1 }[p.dignity] || 0;
        add(p.dignity + ' in ' + J.SIGNS[p.sign] + (nb && p.dignity === 'Debilitated' ? ' (weakness is cancelled: Neecha Bhanga)' : ''), dv, 2.2);
        var own = J.lordsOf(k.ascSign, code).indexOf(p.house) >= 0;
        var hv = p.house === 1 || KEN.indexOf(p.house) >= 0 || TRI.indexOf(p.house) >= 0 ? 1 : p.house === 11 ? 0.6 : p.house === 2 ? 0.3 : DUS.indexOf(p.house) >= 0 ? (own ? 0 : -1) : 0;
        add('In the ' + nth(p.house) + ' house' + (hv > 0.5 ? ', a strong house' : hv < 0 ? ', a difficult house' : own && DUS.indexOf(p.house) >= 0 ? ' (its own house, so the harm is limited)' : ''), hv, 1.5);
        if (code !== 'Su' && p.combust) add('Combust: too close to the Sun, so its light is hidden', -1, 1.5);
        if (code === 'Mo') { var el = (P.Mo.lon - P.Su.lon + 360) % 360; if (el < 72 || el > 288) add('Dark Moon, near Amavasya', -0.8, 1.2); else if (el > 120 && el < 240) add('Bright Moon, near Purnima', 0.7, 1.2); }
        var sb = null; if (sbFn) try { sb = sbFn(c).P[code]; } catch (e) { }
        if (sb) add('Shadbala (six-fold strength) is ' + Math.round(sb.ratio * 100) + '% of what it needs', sb.ratio >= 1.15 ? 1 : sb.ratio >= 1 ? 0.4 : sb.ratio >= 0.9 ? -0.3 : -1, 1.8);
        var vg = J.varga(p.lon, 9).sign === p.sign, d9 = d9dig(code, p.lon);
        if (vg) add('Vargottama: same sign in the birth chart and the navamsa', 1, 1); else if (d9) add(d9 > 0 ? 'Strong in the navamsa (D9)' : 'Debilitated in the navamsa (D9)', d9 * 0.8, 1);
      }
      /* company and aspects */
      var asp = J.aspectsOnHouse(k, p.house), ju = code !== 'Ju' && P.Ju.dignity !== 'Debilitated' && (P.Ju.sign === p.sign || asp.indexOf('Ju') >= 0);
      if (ju) add('Jupiter ' + (P.Ju.sign === p.sign ? 'sits with it' : 'aspects it') + ': protection', 0.8, 1);
      var hurt = ['Sa', 'Ma', 'Ra', 'Ke'].filter(function (m) { return m !== code && !(node && (m === 'Ra' || m === 'Ke')) && (P[m].sign === p.sign || ((m === 'Sa' || m === 'Ma') && asp.indexOf(m) >= 0)); });
      if (hurt.length) add('Pressure from ' + hurt.map(function (m) { return PN[m]; }).join(' and ') + ' (with it or aspecting it)', -Math.min(1, 0.45 * hurt.length), 1);
      var t = tally(fs), pct = Math.round(clamp(50 + (t.mean - 0.25) * 60, 4, 96)), word = pct >= 60 ? 'Strong' : pct <= 40 ? 'Weak' : 'Average';
      return { raw: t.mean, code: code, pct: pct, word: word, k: word === 'Strong' ? 'g' : word === 'Weak' ? 'b' : 'm', factors: fs, conf: confOf(t, pct - 50), why: fs.filter(function (f) { return Math.abs(f.v) > 0.15; }).map(function (f) { return f.t; }) };
    });
  }
  /* what the planet stands for in THIS chart (by the houses it rules) */
  function nature(c, code) {
    var fx = code === 'Ra' || code === 'Ke' ? null : c.func[code];
    if (!fx) { var d = c.func[J.RULER[c.k.P[code].sign]]; var v0 = ({ yogakaraka: 0.8, benefic: 0.6, mixed: 0.1, neutral: 0, malefic: -0.6 }[d.kind] || 0) - 0.15; return { v: v0, t: PN[code] + ' behaves like its sign lord ' + PN[J.RULER[c.k.P[code].sign]] + ', a ' + d.kind + ' planet for this lagna' }; }
    var v = { yogakaraka: 1, benefic: 0.75, mixed: 0.1, neutral: 0, malefic: -0.75 }[fx.kind] || 0;
    return { v: v, t: PN[code] + ' rules the ' + fx.houses.map(nth).join(' and ') + ' house' + (fx.houses.length > 1 ? 's' : '') + ': ' + (fx.kind === 'yogakaraka' ? 'the best planet for this lagna (yogakaraka)' : fx.kind === 'benefic' ? 'a helpful planet for this lagna' : fx.kind === 'malefic' ? 'a difficult planet for this lagna' : 'a mixed planet for this lagna') };
  }

  /* ---------- 2. period verdict ---------- */
  function rel(a, b) { return (J.FRIEND[a].indexOf(b) >= 0 ? 1 : J.ENEMY[a].indexOf(b) >= 0 ? -1 : 0) + (J.FRIEND[b].indexOf(a) >= 0 ? 1 : J.ENEMY[b].indexOf(a) >= 0 ? -1 : 0); }
  var PWORD = function (pct) { return pct >= 68 ? 'Very good' : pct >= 57 ? 'Good' : pct >= 44 ? 'Mixed' : 'Careful'; };
  function period(c, md, ad) {
    ad = ad || md;
    return memo(c, 'd' + md + ad, function () {
      var P = c.k.P, fs = [];
      function add(t, v, w) { fs.push({ t: t, v: v, w: w }); }
      var nm = nature(c, md), sm = planet(c, md);
      add(nm.t, nm.v, 2.4);
      add(PN[md] + ' is ' + sm.word.toLowerCase() + ' in the chart, so it ' + (sm.word === 'Strong' ? 'delivers fully' : sm.word === 'Weak' ? 'struggles to deliver' : 'delivers partly'), (sm.pct - 50) / 46, 2);
      if (ad !== md) {
        var na = nature(c, ad), sa = planet(c, ad);
        add(na.t, na.v, 2);
        add(PN[ad] + ' is ' + sa.word.toLowerCase() + ' in the chart', (sa.pct - 50) / 46, 1.6);
        var f = rel(md, ad), pos = J.houseFrom(P[md].sign, P[ad].sign), good = [1, 4, 5, 7, 9, 10].indexOf(pos) >= 0, bad = DUS.indexOf(pos) >= 0;
        add(PN[md] + ' and ' + PN[ad] + ' are ' + (f > 0 ? 'friends' : f < 0 ? 'not friendly to each other' : 'neutral to each other'), f > 0 ? 0.8 : f < 0 ? -0.8 : 0, 1.2);
        add('They sit ' + (good ? 'well from each other (' + nth(pos) + ')' : bad ? pos + ' apart, a 6/8/12 link that causes friction' : nth(pos) + ' from each other'), good ? 0.8 : bad ? -1 : 0, 1.4);
      }
      var t = tally(fs), pct = Math.round(clamp(50 + t.mean * 58, 4, 96)), word = PWORD(pct), cf = confOf(t, pct - 50);
      var tip = word === 'Very good' ? 'A strong stretch: act on important plans.' : word === 'Good' ? 'Supportive: steady progress if you put in the work.' : word === 'Mixed' ? 'Some support, some strain: move ahead with patience and keep a buffer.' : 'A testing stretch: avoid big risks, protect health and relationships, and do the remedies.';
      return { raw: t.mean, md: md, ad: ad, pct: pct, word: word, v: pct >= 57 ? 'g' : pct >= 44 ? 'm' : 'b', factors: fs, conf: cf, tip: tip,
        why: fs.filter(function (x) { return x.v > 0.15; }).slice(0, 2).map(function (x) { return x.t; }).concat(fs.filter(function (x) { return x.v < -0.15; }).slice(0, 2).map(function (x) { return x.t; })).join('. ') + '. ' + tip };
    });
  }

  /* ---------- 3. the day ---------- */
  var TARA_TXT = [null,
    ['Today\'s star is your own birth star', 'Feelings run stronger than usual. Good for prayer and routine, not for risky decisions.', -0.35],
    ['Today\'s star brings gain (Sampat)', 'Good for money matters. Example: ask for a payment, quote a price, close a sale.', 0.9],
    ['Today\'s star brings obstacles (Vipat)', 'Things can slip or get delayed. Example: double-check documents and avoid new starts.', -0.8],
    ['Today\'s star brings comfort (Kshema)', 'Steady, safe progress. Example: a good day for health check-ups and home matters.', 0.7],
    ['Today\'s star brings opposition (Pratyari)', 'People may push back. Example: avoid arguments and do not force a decision.', -0.7],
    ['Today\'s star brings achievement (Sadhaka)', 'Effort gives results. Example: finish and send the important piece of work.', 0.9],
    ['Today\'s star is the hardest of the nine (Vadha)', 'Keep the day light. Example: no big decisions or purchases; drive carefully.', -1],
    ['Today\'s star is friendly (Mitra)', 'People help today. Example: a good day for meetings and requests.', 0.7],
    ['Today\'s star is very friendly (Param Mitra)', 'Support comes easily. Example: ask a favour or start a partnership talk.', 1]];
  var MOON_H = [null,
    ['you are in focus', 'How you feel and present yourself matters. Example: take a personal decision or restart a health routine.', 0.8],
    ['money, food and family talk', 'Example: settle a payment or have that pending family conversation.', 0.3],
    ['courage, calls and short trips', 'Example: make the call you were postponing; siblings and neighbours feature.', 0.5],
    ['home, mother and peace of mind', 'Example: fix something at home or spend time with your mother.', 0.6],
    ['children, learning and ideas', 'Example: plan studies or review an investment; do not speculate.', 0.7],
    ['workload, health and rivals', 'Example: clear pending tasks and look after digestion; do not pick fights.', -0.5],
    ['spouse, partners and clients', 'Example: meet a client or give time to your partner.', 0.7],
    ['sudden changes and low energy', 'Example: avoid risk and rash driving; do research or quiet backend work.', -1],
    ['luck, elders and faith', 'Example: seek advice from a senior or visit a temple.', 0.9],
    ['career and reputation', 'Example: present your work or meet seniors.', 0.9],
    ['gains, friends and wishes', 'Example: follow up on money owed and meet useful people.', 1],
    ['expenses, rest and sleep', 'Example: avoid big spending and sleep early.', -0.7]];
  var WDL = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa'];
  function day(c, pc, wd, base) {
    var k = c.k, P = k.P, fs = [];
    function add(id, daily, title, text, v, w) { fs.push({ id: id, daily: daily, title: title, t: text, v: v, w: w }); }
    var count = ((pc.nak.index - P.Mo.nak.index + 27) % 27) + 1, taraN = ((count - 1) % 9) + 1, T = TARA_TXT[taraN];
    add('tara', 1, T[0], T[1], T[2], 2.2);
    var cb = J.houseFrom(P.Mo.sign, pc.moonSign), cbv = cb === 8 ? -1 : [1, 3, 6, 7, 10, 11].indexOf(cb) >= 0 ? 0.8 : cb === 4 || cb === 12 ? -0.6 : 0;
    add('cb', 1, cb === 8 ? 'Chandrashtama: Moon is 8th from your Moon sign' : 'Moon is ' + nth(cb) + ' from your Moon sign', cb === 8 ? 'The mind is unsettled for about two days. Example: postpone important talks and signatures.' : cbv > 0 ? 'The mind is steady and people respond well to you.' : cbv < 0 ? 'The mind tires easily. Example: keep the schedule light and avoid emotional decisions.' : 'Neither helping nor hurting the mind today.', cbv, 2);
    var mh = J.houseFrom(k.ascSign, pc.moonSign), M = MOON_H[mh];
    add('mh', 1, 'Moon is in your ' + nth(mh) + ' house: ' + M[0], M[1], M[2], 1.4);
    var bav = c.av && c.av.bav.Mo ? c.av.bav.Mo[pc.moonSign] : null;
    if (bav != null) add('bav', 1, 'Moon has ' + bav + ' of 8 support points in ' + J.SIGNS[pc.moonSign], bav >= 5 ? 'Your chart backs the Moon strongly in this sign, so the day\'s good results come more easily.' : bav <= 3 ? 'Your chart gives the Moon little backing in this sign, so results need more effort.' : 'Average backing from your chart.', bav >= 6 ? 1 : bav === 5 ? 0.6 : bav === 4 ? 0 : bav === 3 ? -0.6 : -1, 1.4);
    var wl = WDL[wd], ws = planet(c, wl), wn = nature(c, wl), wv = clamp((ws.pct - 50) / 40 * 0.6 + wn.v * 0.5, -1, 1);
    add('vara', 1, J.VARAS[wd] + ' belongs to ' + PN[wl] + ', ' + (wv > 0.2 ? 'a helpful planet for you' : wv < -0.2 ? 'a difficult planet for you' : 'a neutral planet for you'), PN[wl] + ' is ' + ws.word.toLowerCase() + ' in your chart. ' + (wv > 0.2 ? 'Its day carries its support.' : wv < -0.2 ? 'Its day needs a little extra care; do its simple remedy.' : 'No strong push either way.'), wv, 1);
    var tn = pc.tithi.num, kr = pc.tithi.paksha === 'Krishna', tv = tn === 15 && kr ? -1 : [4, 9, 14].indexOf(tn) >= 0 ? -0.8 : [5, 10, 15].indexOf(tn) >= 0 ? 0.7 : [2, 3, 7, 11, 12, 13].indexOf(tn) >= 0 ? 0.4 : 0;
    add('tithi', 1, pc.tithi.paksha + ' ' + pc.tithi.name + (tv <= -0.8 ? (tn === 15 ? ': Amavasya' : ': a Rikta (empty) tithi') : tv >= 0.7 ? ': a Purna (full) tithi' : ''), tv <= -0.8 ? 'Traditionally avoided for new beginnings. Fine for prayer, charity and finishing old work.' : tv >= 0.7 ? 'Good for completing things and for auspicious work.' : tv > 0 ? 'A generally good tithi for normal work.' : 'An ordinary tithi.', tv, 0.8);
    var nn = BOOK && BOOK.nakNature ? BOOK.nakNature(pc.nak.index) : null;
    if (nn) add('nak', 1, pc.nak.name + ' is a ' + nn.w.toLowerCase() + ' star', nn.use, nn.k === 'g' ? 0.6 : nn.k === 'b' ? -0.7 : 0, 0.8);
    var yb = pc.yoga && (pc.yoga.n === 16 || pc.yoga.n === 26), vk = pc.karana && pc.karana.name === 'Vishti';
    if (yb || vk) add('yk', 1, (yb ? pc.yoga.name + ' yoga' : '') + (yb && vk ? ' and ' : '') + (vk ? 'Bhadra (Vishti) karana' : ''), 'A traditionally inauspicious combination at sunrise: avoid starting new things while it lasts.', -1, 0.9);
    var ch = J.dashaChain(c.maha, pc.rise, 4), sd = ch[3] || ch[2], pd = ch[2];
    if (sd) { var so = period(c, sd.lord); add('sd', 1, PN[sd.lord] + '\'s short period is running', PN[sd.lord] + ' is ' + (so.v === 'g' ? 'a helpful planet for you, so these few days carry its support.' : so.v === 'b' ? 'a difficult planet for you, so go a little slower these few days.' : 'a mixed planet for you.'), clamp((so.pct - 50) / 30, -1, 1), 1.3); }
    if (pd && sd && pd !== sd) { var po = period(c, pd.lord); add('pd', 0, PN[pd.lord] + '\'s sub-sub-period forms the backdrop', PN[pd.lord] + ' is ' + (po.v === 'g' ? 'helpful' : po.v === 'b' ? 'difficult' : 'mixed') + ' for you; this colours the coming weeks.', clamp((po.pct - 50) / 30, -1, 1), 1); }
    try { var tr = N.transitAt(c, new Date(pc.rise.getTime() + 4 * 3600e3)), sl = tr.filter(function (x) { return x.code === 'Sa' || x.code === 'Ju'; }), sv = 0; sl.forEach(function (x) { sv += x.verdict === 'good' ? 0.5 : x.verdict === 'bad' ? -0.5 : 0; });
      add('slow', 0, 'Saturn and Jupiter in the background', sl.map(function (x) { return PN[x.code] + ' is ' + nth(x.m) + ' from your Moon (' + x.verdict + ')'; }).join('; ') + '. This is the slow backdrop for the whole season.', sv, 1); } catch (e) { }
    var hits = base && base.hits ? base.hits : [];
    if (hits.length) add('ghatak', 1, hits.join(', ') + ' for your Moon sign', 'Tradition marks this as a day to keep low-key for your rashi. Example: avoid travel starts and confrontations.', -Math.min(1, 0.6 * hits.length), 1.2);
    var t = tally(fs), pct = Math.round(clamp(50 + (t.mean - 0.04) * 80, 6, 95)); if (cb === 8) pct = Math.min(pct, 40);
    var cf = confOf(t, pct - 50), mixed = pct >= 45 && pct <= 55 && t.pro >= 3.6 && t.con >= 3.6;
    var word = mixed ? 'Mixed signals' : pct >= 68 ? 'Strong day' : pct >= 56 ? 'Good day' : pct >= 45 ? 'Steady day' : pct >= 33 ? 'Careful day' : 'Go slow';
    return { raw: t.mean, wd: wd, pct: pct, word: word, v: pct >= 60 ? 'push' : pct >= 45 ? 'steady' : 'backend', k: pct >= 56 ? 'g' : pct >= 45 ? 'm' : 'b', factors: fs, conf: cf, mixed: mixed, taraN: taraN, tara: T, cb: cb, mh: mh, chain: ch, hits: hits };
  }
  /* five areas of the day, each 0–100 with its reasons */
  var AREA = [['work', 'Work', [10, 6, 11, 3], ['Su', 'Sa', 'Me']], ['money', 'Money', [2, 11, 5, 9], ['Ju', 'Ve']], ['family', 'Family', [7, 4, 2, 5], ['Ve', 'Mo']], ['health', 'Health', [1, 6, 8, 12], ['Su', 'Ma']], ['mind', 'Mind', [], ['Mo']]];
  var AREA_TXT = { work: ['Push important work: approvals and follow-ups land well.', 'Routine work goes fine; keep big asks for a stronger window.', 'Expect friction or delay at work; stay factual and double-check.'],
    money: ['Good for closing deals, collecting payments and planned purchases.', 'Fine for small transactions; compare before you commit.', 'Hold big payments, loans and investments today.'],
    family: ['A warm day with family and partner; good for plans together.', 'Normal; listen more than you speak.', 'Short tempers are likely; avoid sensitive topics.'],
    health: ['Good energy; a fine day for exercise.', 'Normal energy; keep meals and sleep on time.', 'Low energy or small niggles; eat light, rest and avoid strain.'],
    mind: ['Clear, positive mind; good for decisions.', 'Mixed mood; decide after a pause.', 'The mind can feel heavy; avoid big decisions and take quiet time.'] };
  function areas(c, D, tr) {
    var k = c.k, wl = WDL[D.wd], sd = D.chain[3] || D.chain[2], so = sd ? period(c, sd.lord) : null, sdH = sd ? J.lordsOf(k.ascSign, sd.lord).concat([k.P[sd.lord].house]) : [], ma = (tr || []).filter(function (x) { return x.code === 'Ma'; })[0];
    return AREA.map(function (a) {
      var s = 50 + (D.pct - 50) * 0.65, why = [];
      if (a[0] === 'mind') {
        s += D.cb === 8 ? -18 : [1, 3, 6, 7, 10, 11].indexOf(D.cb) >= 0 ? 8 : D.cb === 4 || D.cb === 12 ? -8 : 0; why.push('Moon is ' + nth(D.cb) + ' from your Moon sign');
        s += D.tara[2] * 8; why.push(D.tara[0].replace('Today\'s star', 'today\'s star'));
      } else {
        if (a[2].indexOf(D.mh) >= 0) { var dv = a[0] === 'health' ? (DUS.indexOf(D.mh) >= 0 ? -13 : 8) : (DUS.indexOf(D.mh) >= 0 ? -5 : 14); s += dv; why.push('Moon passes your ' + nth(D.mh) + ' house'); }
        if (so && sdH.some(function (h) { return a[2].indexOf(h) >= 0; })) { var d2 = so.v === 'g' ? 9 : so.v === 'b' ? -9 : 0; if (d2) { s += d2; why.push(PN[sd.lord] + '\'s short period touches this area' + (d2 > 0 ? ' and helps' : ' and strains it')); } }
        if (a[3].indexOf(wl) >= 0) { var ws = planet(c, wl); var d3 = ws.k === 'g' ? 6 : ws.k === 'b' ? -5 : 2; s += d3; why.push('it is ' + PN[wl] + '\'s day, the planet of this area'); }
        if (ma && a[2].indexOf(ma.h) >= 0 && [1, 4, 7, 8, 12].indexOf(ma.h) >= 0 && a[0] !== 'money') { s -= 7; why.push('Mars is passing your ' + nth(ma.h) + ' house: heat and haste'); }
        if (ma && a[0] === 'work' && [3, 6, 10, 11].indexOf(ma.h) >= 0) { s += 5; why.push('Mars in your ' + nth(ma.h) + ' gives drive'); }
      }
      s = Math.round(clamp(s, 5, 96)); var r = s >= 62 ? 0 : s >= 45 ? 1 : 2;
      return { id: a[0], t: a[1], pct: s, k: r === 0 ? 'g' : r === 1 ? 'm' : 'b', word: r === 0 ? 'Good' : r === 1 ? (a[0] === 'work' ? 'Routine' : 'Normal') : 'Careful', line: AREA_TXT[a[0]][r], why: why };
    });
  }

  return { planet: planet, nature: nature, period: period, day: day, areas: areas, PWORD: PWORD, MOON_H: MOON_H, setSb: function (f) { sbFn = f; }, confOf: confOf };
}
if (typeof module !== 'undefined') module.exports = makeJudge;
