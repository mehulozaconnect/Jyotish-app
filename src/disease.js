/* Classical disease reading (Parashari). Disease shows where the chart's disease houses point:
   1. the 6th (illness) and 8th (chronic) houses: their body part (house from lagna and Kalapurusha sign) and the planets in them;
   2. the houses and signs where the 6th and 8th lords sit, and the planets that join those lords;
   3. malefic clusters (Mars with Saturn or Rahu) and afflicted lights.
   Each problem collects evidence from body part (house and sign) and planet nature; it is then judged against how often the same
   score appears across 700 charts, so no problem is flagged for everyone. Every point carries a plain reason. */
function makeDisease(J) {
  var SG = J.SIGNS, PN = { Su: 'Sun', Mo: 'Moon', Ma: 'Mars', Me: 'Mercury', Ju: 'Jupiter', Ve: 'Venus', Sa: 'Saturn', Ra: 'Rahu', Ke: 'Ketu' };
  var HB = ['', 'head and overall body', 'face, eyes, teeth and throat', 'neck, shoulders, arms and breathing', 'chest, heart and lungs', 'stomach, liver and upper abdomen', 'digestion, intestines and immunity', 'lower abdomen, kidneys and bladder', 'excretory organs, chronic illness', 'hips and thighs', 'knees, joints and back', 'calves, ankles and circulation', 'feet, sleep and eyes'];
  var SB = ['head', 'face and throat', 'shoulders, arms and lungs', 'chest and stomach', 'heart and upper back', 'intestines and digestion', 'kidneys and lower back', 'excretory and reproductive organs', 'hips, thighs and liver', 'knees, bones and joints', 'calves and circulation', 'feet and sleep'];
  /* problem -> body houses, Kalapurusha signs (0 = Aries), planet natures */
  var PR = {
    bp: { h: [4, 5], s: [4, 3], p: { Su: 1, Ma: 1, Ra: 0.6, Sa: 0.4 } },
    heart: { h: [4, 5], s: [4], p: { Su: 1, Mo: 0.5, Sa: 0.5, Ma: 0.5 } },
    sugar: { h: [5, 6], s: [5, 6], p: { Ve: 1, Ju: 1, Mo: 0.4 } },
    chol: { h: [5], s: [8, 4], p: { Ju: 1, Ve: 0.5, Sa: 0.4 } },
    thyroid: { h: [2, 3], s: [1, 2], p: { Me: 0.8, Mo: 0.6, Ra: 0.5 } },
    weight: { h: [1, 5], s: [3], p: { Ju: 1, Mo: 0.6, Ve: 0.6 } },
    pcos: { h: [5, 7, 8], s: [7, 3], p: { Ve: 1, Mo: 0.8, Ma: 0.5, Ra: 0.4 } },
    kidney: { h: [7], s: [6, 7], p: { Ve: 1, Mo: 0.4, Ma: 0.4 } },
    acidity: { h: [5, 6], s: [3, 5], p: { Su: 1, Ma: 1, Ra: 0.4 } },
    ibs: { h: [6, 5, 7], s: [5, 3], p: { Me: 1, Mo: 0.8, Sa: 0.5, Ra: 0.4 } },
    piles: { h: [8, 7], s: [7, 5], p: { Sa: 1, Ma: 0.8, Me: 0.6, Ke: 0.4 } },
    joints: { h: [10, 11], s: [9, 10], p: { Sa: 1, Ke: 0.5, Ma: 0.3 } },
    back: { h: [10, 7], s: [4, 6], p: { Sa: 1, Ma: 0.5, Su: 0.4 } },
    sciatica: { h: [9, 7], s: [8, 6], p: { Sa: 0.8, Ke: 0.8, Ma: 0.4 } },
    migraine: { h: [1], s: [0], p: { Su: 0.8, Ma: 1, Ra: 0.4 } },
    anxiety: { h: [4, 5, 1], s: [3], p: { Mo: 1, Me: 0.8, Ra: 0.8 } },
    depression: { h: [4, 5], s: [3], p: { Mo: 1, Sa: 1, Ke: 0.5 } },
    sleep: { h: [12, 4], s: [11], p: { Mo: 1, Ra: 0.8, Sa: 0.4 } },
    skin: { h: [1, 6], s: [5], p: { Me: 1, Ra: 0.6, Ke: 0.6, Ve: 0.3 } },
    asthma: { h: [3, 4], s: [2, 3], p: { Me: 0.8, Sa: 0.8, Mo: 0.5 } },
    eyes: { h: [2, 12], s: [1, 4], p: { Su: 1, Mo: 0.8, Ve: 0.4 } },
    teeth: { h: [2], s: [1], p: { Sa: 1, Ma: 0.4 } },
    anaemia: { h: [1, 6], s: [0], p: { Ma: 1, Mo: 0.6 } },
    infection: { h: [6, 1], s: [], p: { Ke: 1, Ma: 0.8, Mo: 0.3 } },
    allergy: { h: [6, 1], s: [], p: { Ra: 1, Me: 0.5, Mo: 0.3 } }
  };
  /* problem -> [median, top 25%, top 10%] of the score across 1,500 charts */
  var QT = {"bp":[2.87,3.99,5.04],"heart":[2.46,3.46,4.37],"sugar":[3.64,4.6,5.53],"chol":[1.98,2.96,3.92],"thyroid":[2.15,3.04,3.91],"weight":[2.16,3.02,3.9],"pcos":[3.52,4.51,5.51],"kidney":[2.05,2.97,3.88],"acidity":[3.59,4.52,5.62],"ibs":[4.18,5.2,6.16],"piles":[3.76,4.86,5.99],"joints":[1.78,2.8,3.68],"back":[2.2,3.1,4.08],"sciatica":[1.88,2.9,3.8],"migraine":[1.99,2.91,3.84],"anxiety":[2.42,3.46,4.67],"depression":[2.1,3.13,4.02],"sleep":[1.68,2.76,3.71],"skin":[3.19,4.07,4.97],"asthma":[2.47,3.41,4.18],"eyes":[2.49,3.54,4.64],"teeth":[1.22,2.18,2.79],"anaemia":[2.74,3.71,4.52],"infection":[2.73,3.38,4.05],"allergy":[2.49,3.11,3.73]};
  var MAL = ['Ma', 'Sa', 'Ra', 'Ke'];
  function nth(n) { return n + (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'); }
  function evidence(c) {
    var k = c.k, A = k.ascSign, P = k.P, H = {}, S = {}, PL = {}, why = { h: {}, s: {}, p: {} };
    function addH(h, w, t) { H[h] = (H[h] || 0) + w; (why.h[h] = why.h[h] || []).push(t); }
    function addS(s, w, t) { S[s] = (S[s] || 0) + w; (why.s[s] = why.s[s] || []).push(t); }
    function addP(x, w, t) { PL[x] = (PL[x] || 0) + w; (why.p[x] = why.p[x] || []).push(t); }
    function signOfH(h) { return (A + h - 1) % 12; }
    var L6 = J.lordOfHouse(A, 6), L8 = J.lordOfHouse(A, 8), L1 = J.lordOfHouse(A, 1);
    /* 1. the disease houses themselves */
    addH(6, 1, 'the 6th house (illness) governs ' + HB[6]); addS(signOfH(6), 1, 'your 6th house falls in ' + SG[signOfH(6)] + ' (' + SB[signOfH(6)] + ')');
    addH(8, 0.7, 'the 8th house (chronic trouble) governs ' + HB[8]); addS(signOfH(8), 0.7, 'your 8th house falls in ' + SG[signOfH(8)] + ' (' + SB[signOfH(8)] + ')');
    k.planets.forEach(function (q) {
      if (q.house === 6) addP(q.code, 1, PN[q.code] + ' sits in your 6th house of illness');
      if (q.house === 8) addP(q.code, 0.8, PN[q.code] + ' sits in your 8th house of chronic trouble');
      if (q.house === 12 && q.code !== 'Ju') addP(q.code, 0.3, PN[q.code] + ' sits in your 12th house');
    });
    /* 2. where the 6th and 8th lords go, and who joins them */
    [[L6, 6, 0.9], [L8, 8, 0.7]].forEach(function (z) {
      var l = z[0], q = P[l]; if (z[1] === 8 && l === L6) return;
      if (l !== L1) { addH(q.house, z[2], 'the ' + nth(z[1]) + ' lord ' + PN[l] + ' sits in your ' + nth(q.house) + ' house (' + HB[q.house] + ')'); addS(q.sign, z[2] * 0.8, 'the ' + nth(z[1]) + ' lord ' + PN[l] + ' is in ' + SG[q.sign] + ' (' + SB[q.sign] + ')'); }
      addP(l, 0.5, PN[l] + ' rules your ' + nth(z[1]) + ' house');
      k.planets.forEach(function (o) { if (o.code !== l && o.sign === q.sign) addP(o.code, 0.5, PN[o.code] + ' sits with the ' + nth(z[1]) + ' lord ' + PN[l]); });
    });
    /* 3. malefic clusters and afflicted planets */
    for (var h = 1; h <= 12; h++) {
      var occ = k.planets.filter(function (q) { return q.house === h; }), mal = occ.filter(function (q) { return MAL.indexOf(q.code) >= 0; });
      if (mal.length >= 2) { addH(h, 0.6, mal.map(function (q) { return PN[q.code]; }).join(' and ') + ' together in your ' + nth(h) + ' house (' + HB[h] + ')'); addS(signOfH(h), 0.5, mal.map(function (q) { return PN[q.code]; }).join(' and ') + ' together in ' + SG[signOfH(h)]); }
      else if (mal.length === 1 && h !== 3 && h !== 11 && h !== 6) { addH(h, 0.25, PN[mal[0].code] + ' in your ' + nth(h) + ' house'); }
      if (occ.length >= 3) occ.forEach(function (q) { if (MAL.indexOf(q.code) < 0) addP(q.code, 0.2, PN[q.code] + ' is crowded with ' + (occ.length - 1) + ' other planets'); });
    }
    var maJoin = ['Sa', 'Ra'].filter(function (x) { return P[x].sign === P.Ma.sign; }); if (maJoin.length) addP('Ma', 0.6, 'Mars joins ' + maJoin.map(function (x) { return PN[x]; }).join(' and ') + ': heat and pressure in the blood');
    k.planets.forEach(function (q) {
      if (q.code === 'Ra' || q.code === 'Ke') return;
      if (/Debilitated/.test(q.dignity || '')) addP(q.code, 0.5, PN[q.code] + ' is debilitated');
      if (q.combust) addP(q.code, 0.3, PN[q.code] + ' is combust');
      if (['Ra', 'Ke', 'Sa'].some(function (x) { return x !== q.code && P[x].sign === q.sign; }) && ['Su', 'Mo'].indexOf(q.code) >= 0) addP(q.code, 0.5, PN[q.code] + ' is joined by ' + ['Ra', 'Ke', 'Sa'].filter(function (x) { return x !== q.code && P[x].sign === q.sign; }).map(function (x) { return PN[x]; }).join(' and '));
    });
    /* Jupiter guards */
    var juH = P.Ju.house; [juH, (juH + 4 - 1) % 12 + 1, (juH + 6 - 1) % 12 + 1, (juH + 8 - 1) % 12 + 1].forEach(function (hh) { if (H[hh] && L6 !== 'Ju' && L8 !== 'Ju') H[hh] -= 0.3; });
    return { H: H, S: S, PL: PL, why: why };
  }
  function score(E, id) {
    var pr = PR[id]; if (!pr) return { s: 0, dims: 0, why: [] };
    var hs = 0, ss = 0, ps = 0, why = [];
    pr.h.forEach(function (h, i) { var v = (E.H[h] || 0) * (i === 0 ? 1 : 0.7); if (v > 0) { hs += v; if (E.why.h[h]) why = why.concat(E.why.h[h]); } });
    pr.s.forEach(function (sg, i) { var v = (E.S[sg] || 0) * (i === 0 ? 1 : 0.7); if (v > 0) { ss += v; if (E.why.s[sg]) why = why.concat(E.why.s[sg]); } });
    Object.keys(pr.p).forEach(function (x) { var v = (E.PL[x] || 0) * pr.p[x]; if (v > 0) { ps += v; if (pr.p[x] >= 0.8 && E.why.p[x]) why = why.concat(E.why.p[x]); } });
    var dims = (hs > 0.5 ? 1 : 0) + (ss > 0.5 ? 1 : 0) + (ps > 0.5 ? 1 : 0), s = hs + ss + ps * 1.2 + (dims >= 2 ? 0.6 : 0) + (dims === 3 ? 0.6 : 0);
    var seen = {}; why = why.filter(function (t) { if (seen[t]) return false; seen[t] = 1; return true; });
    return { s: Math.round(s * 100) / 100, dims: dims, why: why };
  }
  var CACHE = {};
  function rank(r) { return Object.keys(r).sort(function (a, b) { return r[b].z - r[a].z; }); }
  function analyze(c) {
    var key = c.k.asc.toFixed(3) + '|' + c.k.P.Mo.lon.toFixed(3); if (CACHE[key]) return CACHE[key];
    var E = evidence(c), out = {};
    Object.keys(PR).forEach(function (id) { var r = score(E, id), q = QT && QT[id]; r.pct = q ? (r.s >= q[2] ? 90 : r.s >= q[1] ? 75 : r.s >= q[0] ? 50 : 0) : 0;
      r.tend = r.pct >= 90 && r.dims >= 2 ? 'Strong tendency' : r.pct >= 75 && r.dims >= 2 ? 'Moderate tendency' : r.pct >= 50 && r.dims >= 1 ? 'Mild tendency' : 'Low tendency'; r.z = q ? (r.s - q[0]) / Math.max(0.3, q[2] - q[0]) : 0; out[id] = r; });
    CACHE[key] = out; return out;
  }
  return { analyze: analyze, rank: rank, score: score, evidence: evidence, PR: PR, setQ: function (q) { QT = q; } };
}
if (typeof module !== 'undefined') module.exports = makeDisease;
