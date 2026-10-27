/* Trikaal Shadbala (BPHS six-fold strength), in virupas (60 = 1 rupa). Abda and Masa bala (max 45 together) are left out. */
function makeShadbala(J, C) {
  var P7 = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa'];
  var EXP = { Su: 10, Mo: 33, Ma: 298, Me: 165, Ju: 95, Ve: 357, Sa: 200 };
  var NAIS = { Su: 60, Mo: 51.43, Ve: 42.86, Ju: 34.29, Me: 25.71, Ma: 17.14, Sa: 8.57 };
  var REQ = { Su: 5, Mo: 6, Ma: 5, Me: 7, Ju: 6.5, Ve: 5.5, Sa: 5 };
  var MEAN = { Ma: 0.524, Me: 0.9856, Ju: 0.0831, Ve: 0.9856, Sa: 0.0335 };
  var MT = { Su: [4, 0, 20], Mo: [1, 3, 30], Ma: [0, 0, 12], Me: [5, 15, 20], Ju: [8, 0, 10], Ve: [6, 0, 15], Sa: [10, 0, 20] };
  var CHALD = ['Sa', 'Ju', 'Ma', 'Su', 'Ve', 'Me', 'Mo'];
  function norm(x) { return ((x % 360) + 360) % 360; }
  function arc(a, b) { var d = Math.abs(norm(a - b)); return d > 180 ? 360 - d : d; }
  function natRel(a, b) { return J.FRIEND[a].indexOf(b) >= 0 ? 1 : J.ENEMY[a].indexOf(b) >= 0 ? -1 : 0; }
  function vargaPts(code, sign, signs) {
    var lord = J.RULER[sign]; if (lord === code) return 30;
    var hs = (signs[lord] - signs[code] + 12) % 12 + 1, tmp = [2, 3, 4, 10, 11, 12].indexOf(hs) >= 0 ? 1 : -1, r = natRel(code, lord) + tmp;
    return { 2: 22.5, 1: 15, 0: 7.5, '-1': 3.75, '-2': 1.875 }[r];
  }
  function compute(k, birth, lat, lon) {
    var P = k.P, asc = k.asc, mc = k.cusps[9].lon, out = {};
    /* sunrise / sunset around birth */
    var r = J.sunEvent(new Date(birth.getTime() - 30 * 3600e3), lat, lon, +1), guard = 0;
    while (r && guard++ < 3) { var nx = J.sunEvent(new Date(r.getTime() + 3600e3), lat, lon, +1); if (nx && nx <= birth) r = nx; else break; }
    var rise = r || new Date(birth.getTime() - 6 * 3600e3), set = J.sunEvent(rise, lat, lon, -1) || new Date(rise.getTime() + 12 * 3600e3), next = J.sunEvent(new Date(rise.getTime() + 3600e3), lat, lon, +1) || new Date(rise.getTime() + 864e5);
    var isDay = birth < set, dayLen = set - rise, nightLen = next - set;
    var lmt = ((birth.getUTCHours() + birth.getUTCMinutes() / 60 + lon / 15) % 24 + 24) % 24, fromMid = Math.min(lmt, 24 - lmt);
    var wdLord = J.VARA_LORD ? J.VARA_LORD[new Date(rise.getTime() + lon / 15 * 3600e3).getUTCDay()] : null;
    var horaN = Math.floor((birth - rise) / 3600e3), horaLord = CHALD[(CHALD.indexOf(wdLord) + horaN * 5) % 7];
    var third = isDay ? Math.min(2, Math.floor((birth - rise) / dayLen * 3)) : Math.min(2, Math.floor((birth - set) / nightLen * 3));
    var tribLord = isDay ? ['Me', 'Su', 'Sa'][third] : ['Mo', 'Ve', 'Ma'][third];
    var elong = norm(P.Mo.lon - P.Su.lon), pk = (elong <= 180 ? elong : 360 - elong) / 3;
    var signs = {}; P7.forEach(function (c) { signs[c] = P[c].sign; });
    var VG = [1, 2, 3, 7, 9, 12, 30], vs = VG.map(function (n) { var s = {}; P7.forEach(function (c) { s[c] = J.varga(P[c].lon, n).sign; }); return s; });
    var ayan = k.ayanamsa || 24, eps = 23.44 * Math.PI / 180;
    P7.forEach(function (c) {
      var p = P[c], b = {};
      /* Sthana */
      var uch = arc(p.lon, EXP[c] + 180) / 3;
      var sv = VG.reduce(function (a, n, i) { var s = vs[i][c]; if (n === 1) { var m = MT[c], dd = p.lon - p.sign * 30; if (p.sign === m[0] && dd >= m[1] && dd < m[2]) return a + 45; } return a + vargaPts(c, s, vs[i]); }, 0);
      var even = function (s) { return s % 2 === 1; }, fem = c === 'Mo' || c === 'Ve', oj = ((fem ? even(p.sign) : !even(p.sign)) ? 15 : 0) + ((fem ? even(vs[4][c]) : !even(vs[4][c])) ? 15 : 0);
      var kh = p.house, ken = [1, 4, 7, 10].indexOf(kh) >= 0 ? 60 : [2, 5, 8, 11].indexOf(kh) >= 0 ? 30 : 15;
      var dk = Math.floor((p.lon % 30) / 10), drek = (['Su', 'Ma', 'Ju'].indexOf(c) >= 0 && dk === 0) || (['Me', 'Sa'].indexOf(c) >= 0 && dk === 1) || (fem && dk === 2) ? 15 : 0;
      b.sthana = uch + sv + oj + ken + drek;
      /* Dig */
      var strong = { Su: mc, Ma: mc, Ju: asc, Me: asc, Mo: mc + 180, Ve: mc + 180, Sa: asc + 180 }[c];
      b.dig = (180 - arc(p.lon, strong)) / 3;
      /* Kala */
      var nat = c === 'Me' ? 60 : ['Su', 'Ju', 'Ve'].indexOf(c) >= 0 ? fromMid * 5 : 60 - fromMid * 5;
      var benef = ['Mo', 'Me', 'Ju', 'Ve'].indexOf(c) >= 0, paksha = benef ? pk : 60 - pk; if (c === 'Mo') paksha *= 2;
      var trib = c === 'Ju' || c === tribLord ? 60 : 0;
      var vh = (c === wdLord ? 45 : 0) + (c === horaLord ? 60 : 0);
      var trop = (p.lon + ayan) * Math.PI / 180, decl = Math.asin(Math.sin(eps) * Math.sin(trop)) * 180 / Math.PI;
      var ay = c === 'Me' ? (24 + Math.abs(decl)) * 1.25 : ['Mo', 'Sa'].indexOf(c) >= 0 ? (24 - decl) * 1.25 : (24 + decl) * 1.25; if (c === 'Su') ay *= 2;
      b.kala = nat + paksha + trib + vh + ay;
      /* Chesta */
      if (c === 'Su') b.chesta = ay / 2; else if (c === 'Mo') b.chesta = pk;
      else { var sp = p.speed, m = MEAN[c]; b.chesta = sp < 0 ? 60 : Math.abs(sp) < m * 0.1 ? 15 : sp < m * 0.8 ? 30 : sp > m * 1.2 ? 45 : 37.5; }
      b.nais = NAIS[c];
      /* Drik: full Parashari aspects, benefic + / malefic -, quarter value */
      var dr = 0; k.planets.forEach(function (q) { if (q.code === c || q.code === 'Ra' || q.code === 'Ke') return; if (J.aspectedHouses(q.code, q.house).indexOf(p.house) < 0) return; var good = ['Ju', 'Ve'].indexOf(q.code) >= 0 || (q.code === 'Me') || (q.code === 'Mo' && elong < 180); dr += good ? 60 : -60; });
      b.drik = dr / 4;
      var tot = b.sthana + b.dig + b.kala + b.chesta + b.nais + b.drik;
      var ishta = Math.sqrt(uch * b.chesta), kashta = Math.sqrt((60 - uch) * (60 - Math.min(60, b.chesta)));
      out[c] = { code: c, b: b, uch: uch, virupa: tot, rupa: tot / 60, req: REQ[c], ratio: tot / 60 / REQ[c], ishta: ishta, kashta: kashta };
    });
    var rank = P7.slice().sort(function (a, b) { return out[b].ratio - out[a].ratio; }); rank.forEach(function (c, i) { out[c].rank = i + 1; });
    return { P: out, rank: rank, strongest: rank[0], weakest: rank[6] };
  }
  return { compute: compute, P7: P7, REQ: REQ };
}
