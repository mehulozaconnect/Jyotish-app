/* Trikaal health alert windows.
   Day by day, checks fast and slow transits against a person's sensitive points by exact degree,
   adds eclipses and the running short dasha periods, and groups the risky days into dated windows.
   A window means "take extra care in these days", never a certainty. */
function makeAlerts(A, C, J, MC) {
  var PN = J.PNAME, DAY = 864e5, SG = J.SIGNS;
  function norm(x) { return ((x % 360) + 360) % 360; }
  function dist(a, b) { var d = Math.abs(norm(a - b)); return d > 180 ? 360 - d : d; }
  function nth(n) { return n + (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'); }
  function midday(d) { return new Date(Math.floor(d.getTime() / DAY) * DAY + 6.5 * 36e5); }
  var POS = {};
  function sky(day) {
    var key = Math.floor(day.getTime() / DAY); if (POS[key]) return POS[key];
    var o = {}; ['Su', 'Ma', 'Sa', 'Ra', 'Ke', 'Ju'].forEach(function (x) { o[x] = C.sidereal(x, day); });
    var ks = Object.keys(POS); if (ks.length > 2000) POS = {};
    return (POS[key] = o);
  }
  var ECL = null;
  function eclipses(from, to) {
    if (!ECL) ECL = {};
    var key = Math.floor(from.getTime() / (30 * DAY)); if (ECL[key]) return ECL[key];
    var out = [];
    try { var s = A.SearchGlobalSolarEclipse(new Date(from.getTime() - 20 * DAY)); for (var i = 0; i < 4 && s.peak.date < to; i++) { if (s.peak.date > new Date(from.getTime() - 20 * DAY)) out.push({ kind: 'solar', at: s.peak.date, lon: C.sidereal('Su', s.peak.date) }); s = A.NextGlobalSolarEclipse(s.peak); } } catch (e) { }
    try { var l = A.SearchLunarEclipse(new Date(from.getTime() - 20 * DAY)); for (var j = 0; j < 4 && l.peak.date < to; j++) { if (l.kind !== 'penumbral') out.push({ kind: 'lunar', at: l.peak.date, lon: C.sidereal('Mo', l.peak.date) }); l = A.NextLunarEclipse(l.peak); } } catch (e) { }
    return (ECL[key] = out);
  }
  /* sensitive points of a chart for one problem */
  function points(c, pr) {
    var k = c.k, P = k.P, pts = [];
    function add(lon, w, name, where, spec) { var q0 = pts.filter(function (q) { return dist(q.lon, lon) < 1.5; })[0]; if (q0) { q0.w = Math.max(q0.w, w); q0.spec = q0.spec || !!spec; return; } pts.push({ lon: lon, w: w, name: name, where: where, spec: !!spec }); }
    function where(code) { return SG[P[code].sign] + ', your ' + nth(P[code].house) + ' house'; }
    add(P.Mo.lon, 1, 'your natal Moon', where('Mo'));
    add(k.asc, 0.9, 'your lagna (body)', SG[k.ascSign]);
    add(P.Su.lon, pr.k.Su ? 1 : 0.6, 'your natal Sun', where('Su'));
    var ll = J.lordOfHouse(k.ascSign, 1); add(P[ll].lon, 0.7, 'your lagna lord ' + PN[ll], where(ll));
    Object.keys(pr.k).forEach(function (x) { if (P[x]) add(P[x].lon, 0.5 + pr.k[x] * 0.5, 'natal ' + PN[x] + ' (karaka of this problem)', where(x), true); });
    k.planets.forEach(function (p) { if (pr.h.indexOf(p.house) >= 0) add(p.lon, 0.6, 'natal ' + p.name, where(p.code) + ' (a house of this problem)', true); });
    pts.forEach(function (q) { q.bs = pr.s.indexOf(Math.floor(norm(q.lon) / 30)) >= 0; if (q.bs) q.where += ', the body sign of this problem'; });
    return pts;
  }
  var ATT = { Ma: { orb: 3.5, conj: 1, asp: [[90, 0.6], [180, 0.7], [210, 0.6]] }, Sa: { orb: 3, conj: 1, asp: [[60, 0.5], [180, 0.7], [270, 0.6]] }, Ra: { orb: 3, conj: 0.9, asp: [] }, Ke: { orb: 3, conj: 0.9, asp: [] }, Su: { orb: 2, conj: 0.3, asp: [[180, 0.2]] } };
  var JUP = { orb: 3, asp: [0, 120, 180, 240] };
  var ASPW = { 60: '3rd', 90: '4th', 180: '7th', 210: '8th', 270: '10th' };
  var TM = { 'Strong tendency': 1.25, 'Moderate tendency': 1, 'Mild tendency': 0.65, 'Low tendency': 0.35 };
  /* score one day for one problem */
  function dayScore(c, pr, pts, tend, day, ecl) {
    var S = sky(day), hits = [], fast = 0, slow = 0, prot = 0, spec = 0;
    pts.forEach(function (pt) {
      var on = [];
      Object.keys(ATT).forEach(function (x) {
        var a = ATT[x], d = dist(S[x], pt.lon);
        if (d <= a.orb) on.push({ p: x, w: a.conj * (1 - 0.5 * d / a.orb), t: PN[x] + ' passes over ' + pt.name + ' (' + pt.where + ')' });
        a.asp.forEach(function (as) { var dd = dist(norm(S[x] + as[0]), pt.lon); if (dd <= a.orb) on.push({ p: x, w: as[1] * (1 - 0.5 * dd / a.orb), t: PN[x] + '\'s ' + ASPW[as[0]] + ' aspect falls on ' + pt.name + ' (' + pt.where + ')' }); });
      });
      if (!on.length) return;
      var f = 0, sl = 0; on.forEach(function (h) { if (h.p === 'Ma' || h.p === 'Su') f += h.w; else sl += h.w; });
      if (JUP.asp.some(function (as) { return dist(norm(S.Ju + as), pt.lon) <= JUP.orb; })) { prot += 0.25 * pt.w; }
      fast += f * pt.w * (sl ? 1.6 : 1); slow += sl * pt.w; if (pt.spec || pt.bs) spec += (f * (sl ? 1.6 : 1) + sl * 0.5) * pt.w * (pt.bs ? 1.6 : 1) * (pt.spec ? 1 : 0.6); on.forEach(function (h) { hits.push({ p: h.p, w: h.w * pt.w * (h.p === 'Ma' || h.p === 'Su' ? 2 : 1), t: h.t }); });
    });
    /* malefics joined in the sky (Mars with Saturn, Rahu or Ketu) */
    ['Sa', 'Ra', 'Ke'].forEach(function (x) { var d = dist(S.Ma, S[x]), asp = [90, 180, 210].some(function (a) { return dist(norm(S.Ma + a), S[x]) <= 3; }); if (d <= 4 || asp) { fast += 0.35; hits.push({ p: 'Ma', w: 0.35, t: 'Mars ' + (d <= 4 ? 'joins' : 'aspects') + ' ' + PN[x] + ' in the sky: a short burst of heat and strain' }); } });
    (ecl || []).forEach(function (e) { if (Math.abs(e.at - day) <= 7 * DAY) pts.forEach(function (pt) { if (dist(e.lon, pt.lon) <= 5) { fast += 1 * pt.w; hits.push({ p: 'Ra', w: pt.w, t: 'A ' + e.kind + ' eclipse on ' + e.at.toISOString().slice(0, 10) + ' falls on ' + pt.name }); } }); });
    if (!fast && !slow) return { s: 0, hits: [] };
    /* running dasha periods */
    var ch = J.dashaChain(c.maha, day, 4), df = 0, dwhy = [];
    ch.forEach(function (d, i) { if (i === 0) return; var l = MC.link(c.k, d.lord, pr); if (l.s > 0) { df += (i === 1 ? 0.3 : 0.2) * Math.min(1.5, l.s); dwhy.push(PN[d.lord]); } });
    var lords = ch.slice(1).map(function (d) { return d.lord; }), agree = hits.some(function (h) { return lords.indexOf(h.p) >= 0; });
    if (agree) df += 0.4;
    var s = TM[tend] * Math.max(0, fast * (1 + Math.min(slow, 2) * 0.35) + slow * 0.3 - prot) * (1 + df);
    return { s: s, fast: fast, spec: spec * TM[tend] * (1 + df), hits: hits, dasha: dwhy, agree: agree, lords: lords, prot: prot > 0 };
  }
  var HIGH = 4.4, WATCH = 2.8;
  /* windows: scan days, take the strongest problem each day, group risky days */
  var NOT_ILLNESS = ['fertility', 'surgery'];
  function scan(c, R, pids, from, days, known) {
    known = known || [];
    var ps = pids.filter(function (id) { return NOT_ILLNESS.indexOf(id) < 0; }).map(function (pid) { var pr = MC.P.filter(function (x) { return x.id === pid; })[0]; if (!pr) return null; var a = MC.analyze(c, R, pid, from); return { pr: pr, a: a, pts: points(c, pr), tend: known.indexOf(pid) >= 0 ? 'Strong tendency' : pid === 'general' ? 'Moderate tendency' : a.tend }; }).filter(Boolean);
    var ecl = eclipses(from, new Date(from.getTime() + (days + 20) * DAY)), D = [];
    for (var i = -21; i <= days; i++) {
      var day = midday(new Date(from.getTime() + i * DAY)), best = null, per = [];
      ps.forEach(function (x) { var r = dayScore(c, x.pr, x.pts, x.tend, day, ecl); r.x = x; per.push(r); if (!best || r.s > best.s) best = r; });
      /* a high-care day needs a fast trigger (Mars, the Sun, an eclipse); slow planets alone only make a watch day */
      var lv = !best ? 0 : best.s >= HIGH && best.fast > 0 ? 2 : best.s >= WATCH ? 1 : 0;
      D.push({ day: day, best: best, per: per, lv: lv });
    }
    function runs(test, gap) { var rs = [], cur = null, miss = 0; D.forEach(function (d, k) { if (test(d)) { if (!cur) cur = { a: k, b: k }; cur.b = k; miss = 0; } else if (cur) { miss++; if (miss > gap) { rs.push(cur); cur = null; miss = 0; } } }); if (cur) rs.push(cur); return rs; }
    var hi0 = runs(function (d) { return d.lv === 2; }, 2), hi = [], out = [];
    /* a window longer than 3 weeks is not useful: keep only its sharpest part (raise the bar until each part is 3 weeks or less) */
    hi0.forEach(function (r) {
      if (r.b - r.a + 1 <= 21) { hi.push(r); return; }
      var t = HIGH, sub;
      for (var g = 0; g < 40; g++) { sub = []; var cur = null; for (var k = r.a; k <= r.b; k++) { var ok = D[k].best && D[k].best.s >= t && D[k].best.fast > 0; if (ok) { if (!cur) cur = { a: k, b: k }; cur.b = k; } else if (cur) { sub.push(cur); cur = null; } } if (cur) sub.push(cur);
        if (sub.length && sub.every(function (x) { return x.b - x.a + 1 <= 21; })) break; t *= 1.08; }
      var pk = function (x) { var m = 0; for (var k = x.a; k <= x.b; k++) m = Math.max(m, D[k].best.s); return m; };
      var bestSub = sub.sort(function (x, y) { return pk(y) - pk(x); })[0]; if (bestSub) { bestSub.wide = { a: r.a, b: r.b }; hi.push(bestSub); }
    });
    function inHi(k) { return hi.some(function (r) { return k >= r.a - 2 && k <= r.b + 2; }); }
    var wa = runs(function (d) { return d.lv >= 1; }, 0).filter(function (r) { for (var k = r.a; k <= r.b; k++) if (inHi(k)) return false; return r.b - r.a + 1 <= 21; });
    hi.map(function (r) { return { r: r, high: true }; }).concat(wa.map(function (r) { return { r: r, high: false }; })).forEach(function (o) {
      var w = { start: D[o.r.a].day, end: D[o.r.b].day, peak: 0, per: {}, ps: {}, tops: {}, high: o.high };
      if (o.r.wide) w.wide = { start: D[o.r.wide.a].day, end: D[o.r.wide.b].day };
      for (var k = o.r.a; k <= o.r.b; k++) { var d = D[k]; if (!d.best) continue; if (d.best.s > w.peak) { w.peak = d.best.s; w.at = d.day; w.top = d.best; }
        d.per.forEach(function (r) { if (r.s >= WATCH) { var id = r.x.pr.id, v = (r.spec || 0) + r.s * 0.25; if (v > (w.per[id] || 0)) { w.per[id] = v; w.tops[id] = r; } w.ps[id] = Math.max(w.ps[id] || 0, r.s); } }); }
      if (w.top) out.push(w);
    });
    out.sort(function (a, b) { return a.start - b.start; });
    return out.filter(function (w) { return w.end >= midday(from); }).map(function (w) {
      var lim = w.high ? HIGH * 0.75 : WATCH, ids = Object.keys(w.per).filter(function (id) { return w.ps[id] >= lim; }).sort(function (a, b) { return w.per[b] - w.per[a]; }).slice(0, 3);
      var probs = ids.map(function (id) { return MC.P.filter(function (x) { return x.id === id; })[0]; }), top = ids.length ? w.tops[ids[0]] : w.top, seen = {};
      var why = top.hits.slice().sort(function (x, y) { return y.w - x.w; }).filter(function (h) { if (seen[h.t]) return false; seen[h.t] = 1; return true; }).slice(0, 3).map(function (h) { return h.t; });
      if (top.agree) why.push('the same planet runs your current short dasha period (' + top.lords.map(function (l) { return PN[l]; }).join(' > ') + '), so the timing agrees');
      else if (top.dasha.length) why.push('the running ' + top.dasha.join(' and ') + ' period is linked to this problem');
      if (w.wide) why.push('the pressure builds slowly from ' + w.wide.start.toISOString().slice(0, 10) + ' to ' + w.wide.end.toISOString().slice(0, 10) + ' (a slow or retrograde planet); these are the sharpest days inside it');
      if (top.prot) why.push('Jupiter protects part of it, so it may stay milder');
      var p0 = probs[0] || top.x.pr;
      return { pid: p0.id, n: p0.n, tend: top.x.tend, probs: probs.map(function (x) { return { id: x.id, n: x.n }; }), start: w.start, end: w.end, at: w.at, level: w.high ? 'high' : 'watch', wide: w.wide || null, peak: Math.round(w.peak * 10) / 10, why: why, alert: p0.alert };
    });
  }
  function windows(c, R, pid, from, days) { return scan(c, R, [pid], from, days); }
  function forPerson(c, R, list, from, days, known) { return scan(c, R, list, from, days, known); }
  return { windows: windows, forPerson: forPerson, points: points, dayScore: dayScore, HIGH: HIGH, WATCH: WATCH, setLevels: function (h, w) { HIGH = h; WATCH = w; } };
}
if (typeof module !== 'undefined') module.exports = makeAlerts;
