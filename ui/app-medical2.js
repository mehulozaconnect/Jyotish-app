/* Trikaal: visual medical astrology — body map, gauges, health timeline, action tiles */
var MC_ICON = { bp: '🩺', heart: '❤️', sugar: '🍬', chol: '🧈', thyroid: '🦋', weight: '⚖️', pcos: '🌸', fertility: '👶', kidney: '💧', acidity: '🔥', ibs: '🌀', piles: '🌿', joints: '🦵', back: '🧍', sciatica: '🦴', migraine: '🤕', anxiety: '😟', depression: '🌧️', sleep: '😴', skin: '🧴', asthma: '🫁', eyes: '👁️', teeth: '🦷', anaemia: '🩸', infection: '🦠', allergy: '🤧', surgery: '🏥' };
/* body hotspots on a 200 x 430 figure */
var MC_SPOT = { head: [100, 38, 'Head & mind', ['migraine', 'anxiety', 'depression', 'sleep', 'eyes']], throat: [100, 84, 'Throat & thyroid', ['thyroid', 'teeth']], chest: [100, 124, 'Heart, BP & lungs', ['bp', 'heart', 'asthma']], stomach: [100, 160, 'Stomach & liver', ['acidity', 'chol', 'sugar', 'weight']], gut: [100, 192, 'Intestines', ['ibs', 'infection', 'allergy']], kidney: [134, 176, 'Kidneys', ['kidney']], pelvis: [100, 222, 'Pelvis & hormones', ['pcos', 'fertility', 'piles']], hips: [70, 246, 'Hips & back', ['sciatica', 'back']], knees: [128, 318, 'Knees & joints', ['joints']], skin: [42, 170, 'Skin & blood', ['skin', 'anaemia']] };
var MC_TV = { 'Strong tendency': 0.9, 'Moderate tendency': 0.65, 'Mild tendency': 0.38, 'Low tendency': 0.12 }, MC_NV = { 'Active now': 0.9, 'Watch now': 0.55, 'Quiet now': 0.18 };
function mcAll(p) {
  var key = 'all|' + p.id + '|' + p.time + '|' + DB.settings.ayan + '|' + new Date().toDateString();
  if (!MA_CACHE[key]) { var c = calcP(p), R = maOf(p), o = {}; mcList(p).forEach(function (x) { o[x.id] = MC.analyze(c, R, x.id, new Date()); }); MA_CACHE[key] = o; }
  return MA_CACHE[key];
}
function mcCol(v) { return v >= 0.8 ? '#C0453A' : v >= 0.55 ? '#D79A2B' : v >= 0.3 ? '#C9B65A' : '#3E9A6A'; }
function gauge(v, label, sub) {
  var a = Math.PI * (1 - v), x = 60 + 46 * Math.cos(a), y = 58 - 46 * Math.sin(a), col = mcCol(v);
  return '<div class="gauge"><svg viewBox="0 0 120 70"><path d="M14 58 A46 46 0 0 1 106 58" fill="none" stroke="#ECE5D8" stroke-width="11" stroke-linecap="round"/><path d="M14 58 A46 46 0 0 1 ' + x.toFixed(1) + ' ' + y.toFixed(1) + '" fill="none" stroke="' + col + '" stroke-width="11" stroke-linecap="round"/><circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="6" fill="#fff" stroke="' + col + '" stroke-width="3"/></svg><b style="color:' + col + '">' + esc(label) + '</b><small>' + esc(sub) + '</small></div>';
}
function ring(score, max, label) {
  var v = score / max, r = 26, L = 2 * Math.PI * r, col = v >= 0.75 ? '#3E9A6A' : v >= 0.4 ? '#D79A2B' : '#C0453A';
  return '<div class="ring"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="' + r + '" fill="none" stroke="#ECE5D8" stroke-width="7"/><circle cx="32" cy="32" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="7" stroke-linecap="round" stroke-dasharray="' + (L * v).toFixed(1) + ' ' + L.toFixed(1) + '" transform="rotate(-90 32 32)"/><text x="32" y="37" text-anchor="middle" font-size="16" font-weight="700" fill="' + col + '">' + score + '/' + max + '</text></svg><small>' + esc(label) + '</small></div>';
}
function bodyMap(p, all) {
  var h = '<svg class="bodymap" viewBox="0 0 200 430"><g fill="#EFE7DA" stroke="#D6CAB6" stroke-width="2">' +
    '<circle cx="100" cy="38" r="26"/><rect x="88" y="62" width="24" height="18" rx="6"/>' +
    '<path d="M58 84 Q100 72 142 84 L150 196 Q148 214 132 224 L68 224 Q52 214 50 196 Z"/>' +
    '<path d="M58 88 L34 150 L30 214 L44 216 L54 156 L70 112 Z"/><path d="M142 88 L166 150 L170 214 L156 216 L146 156 L130 112 Z"/>' +
    '<path d="M68 222 L132 222 L130 252 L118 340 L114 410 L94 412 L98 340 L100 270 L102 340 L106 412 L86 410 L82 340 L70 252 Z"/></g>';
  var spots = Object.keys(MC_SPOT).map(function (k) {
    var s = MC_SPOT[k], ids = s[3].filter(function (id) { return all[id]; }); if (!ids.length) return '';
    var best = ids.map(function (id) { return all[id]; }).sort(function (a, b) { return (MC_TV[b.tend] + MC_NV[b.nowWord] * 0.4) - (MC_TV[a.tend] + MC_NV[a.nowWord] * 0.4); })[0];
    var v = MC_TV[best.tend], act = best.nowWord === 'Active now' && v >= 0.38, col = mcCol(v);
    return '<g class="spot" data-act="mcSpot" data-k="' + k + '">' + (act ? '<circle cx="' + s[0] + '" cy="' + s[1] + '" r="15" fill="' + col + '" opacity=".25" class="pulse"/>' : '') + '<circle cx="' + s[0] + '" cy="' + s[1] + '" r="' + (7 + v * 6).toFixed(1) + '" fill="' + col + '" stroke="#fff" stroke-width="2.5"/></g>';
  }).join('');
  return h + spots + '</svg>';
}
function bandTimeline(per, now, years) {
  var t0 = now.getTime(), t1 = t0 + years * 365.25 * 864e5, span = t1 - t0, segs = per.filter(function (x) { return x.end > now; });
  var bar = segs.map(function (x) { var a = Math.max(x.start.getTime(), t0), b = Math.min(x.end.getTime(), t1); if (b <= a) return ''; var col = x.lvl === 2 ? '#C0453A' : x.lvl === 1 ? '#D79A2B' : x.good ? '#3E9A6A' : '#E3DCCD'; return '<i style="left:' + ((a - t0) / span * 100).toFixed(2) + '%;width:' + ((b - a) / span * 100).toFixed(2) + '%;background:' + col + '" title="' + esc(MA.PN[x.md] + '–' + MA.PN[x.ad]) + '"></i>'; }).join('');
  var ticks = ''; for (var y = new Date(now).getFullYear() + 1; ; y++) { var tt = new Date(y, 0, 1).getTime(); if (tt > t1) break; if ((y - new Date(now).getFullYear()) % 2 === 0 || years <= 5) ticks += '<span style="left:' + ((tt - t0) / span * 100).toFixed(2) + '%">' + y + '</span>'; }
  return '<div class="hband"><div class="hbar">' + bar + '<em></em></div><div class="hticks">' + ticks + '</div><div class="hleg"><span><i style="background:#C0453A"></i>sensitive</span><span><i style="background:#D79A2B"></i>watch</span><span><i style="background:#3E9A6A"></i>good for treatment</span><span>▼ today</span></div></div>';
}
function tiles(list) { return '<div class="atiles">' + list.filter(Boolean).map(function (t) { return '<div class="atile ' + (t[3] || '') + '"><span>' + t[0] + '</span><b>' + esc(t[1]) + '</b><small>' + esc(t[2]) + '</small></div>'; }).join('') + '</div>'; }

/* ---------- home ---------- */
function MedHome() {
  var p = curP(); if (!p) return topBar('Medical astrology', { noPerson: true }) + noPerson();
  var R = maOf(p), all = mcAll(p), n1 = p.name.split(' ')[0], now = new Date();
  var ids = Object.keys(all), ranked = ids.map(function (id) { return all[id]; }).sort(function (a, b) { return (MC_TV[b.tend] + MC_NV[b.nowWord] * 0.5) - (MC_TV[a.tend] + MC_NV[a.nowWord] * 0.5); });
  var top = ranked.filter(function (a) { return a.pr.id !== 'surgery'; }).slice(0, 3), act = ranked.filter(function (a) { return a.nowWord === 'Active now' && MC_TV[a.tend] >= 0.38; });
  var h = topBar('Medical astrology') + '<div class="pad">';
  /* hero */
  h += '<div class="card mhero"><div class="mhl">' + ring(R.lagna.score, 5, 'Recovery power') + '<div class="mdosh">' + ['Vata', 'Pitta', 'Kapha'].map(function (d) { return '<div><small>' + d + '</small><i><b style="width:' + R.dosha.pc[d] + '%" class="' + d.toLowerCase() + '"></b></i><span>' + R.dosha.pc[d] + '%</span></div>'; }).join('') + '<p>' + esc(R.dosha.type) + ' body</p></div></div><p class="mhsum">' + esc(act.length ? 'Needs care now: ' + act.slice(0, 3).map(function (a) { return a.pr.n.toLowerCase(); }).join(', ') + '.' : 'Nothing is strongly active right now; keep good habits.') + '</p></div>';
  /* body map */
  h += '<div class="card"><div class="kgh"><h3>Your body map</h3><span class="sm">tap a spot</span></div><div class="bmwrap">' + bodyMap(p, all) + '<div class="bmside">' + Object.keys(MC_SPOT).map(function (k) { var s = MC_SPOT[k], idz = s[3].filter(function (id) { return all[id]; }); if (!idz.length) return ''; var b = idz.map(function (id) { return all[id]; }).sort(function (x, y) { return MC_TV[y.tend] - MC_TV[x.tend]; })[0]; return '<button data-act="mcSpot" data-k="' + k + '"><i style="background:' + mcCol(MC_TV[b.tend]) + '"></i>' + esc(s[2]) + '</button>'; }).join('') + '</div></div><p class="note">Bigger and redder = the chart points there more. A pulsing ring = active in the current dasha. Not a diagnosis.</p></div>';
  /* act now */
  h += '<div class="card"><h3>' + (act.length ? 'Act now' : 'Top things to watch') + '</h3>' + top.map(function (a) {
    var pr = a.pr; return '<button class="actcard" data-go="medical/case/' + pr.id + '"><div class="ach"><span class="aci">' + (MC_ICON[pr.id] || '•') + '</span><div><b>' + esc(pr.n) + '</b><div class="mini"><span style="background:' + mcCol(MC_TV[a.tend]) + '">' + esc(a.tend.replace(' tendency', '')) + '</span><span style="background:' + mcCol(MC_NV[a.nowWord]) + '">' + esc(a.nowWord) + '</span></div></div><em>›</em></div>' +
      '<div class="acts"><span>🩺 ' + esc(pr.tests[0].split(';')[0].split(' every')[0]) + '</span><span>✕ ' + esc(pr.avoid[0].split(',')[0]) + '</span><span>✓ ' + esc(pr.dos[0].split(',')[0]) + '</span></div></button>';
  }).join('') + '</div>';
  /* overall timeline */
  var base = top[0] ? top[0].per : [], merged = base.map(function (x, i) { var s = Math.max.apply(null, top.map(function (a) { return a.per[i] ? a.per[i].s : 0; })), lv = Math.max.apply(null, top.map(function (a) { return a.per[i] ? a.per[i].lvl : 0; })); return { md: x.md, ad: x.ad, start: x.start, end: x.end, s: s, lvl: lv, good: top.every(function (a) { return a.per[i] && a.per[i].good; }) }; });
  if (merged.length) h += '<div class="card"><h3>Health timeline, next 10 years</h3>' + bandTimeline(merged, now, 10) + '<p class="note">Built from the dasha periods for ' + esc(top.map(function (a) { return a.pr.n.toLowerCase(); }).join(', ')) + '. Book check-ups just before red stretches.</p></div>';
  /* all problems */
  var q = (U.mcQ || '').toLowerCase().trim(), shown = mcList(p).filter(function (x) { return !q || (x.n + ' ' + x.alt).toLowerCase().indexOf(q) >= 0 || x.re.test(q); });
  h += '<div class="card"><h3>Check any problem</h3><input class="inp" id="mcSearch" data-in="mcQ" placeholder="Search: BP, sugar, thyroid, knee, sleep…" value="' + esc(U.mcQ || '') + '" style="margin-bottom:10px"><div class="pgrid">' + shown.map(function (x) { var a = all[x.id]; return '<button data-go="medical/case/' + x.id + '"><span>' + (MC_ICON[x.id] || '•') + '</span><b>' + esc(x.n.split(' / ')[0]) + '</b><i style="background:' + mcCol(a ? MC_TV[a.tend] : 0) + '"></i></button>'; }).join('') + '</div></div>';
  h += '<div class="card v2list"><h3 style="padding:4px 4px 6px">Full health chart</h3>' + [['overview', '📊', 'Recovery power and body type'], ['body', '🧍', 'Body map in detail'], ['planets', '🪐', 'Planets and health'], ['timing', '📅', 'Dasha, transits and 12-month calendar'], ['remedies', '📿', 'Remedy plan'], ['muhurta', '🗓️', 'Pick a treatment date']].map(function (t) { return '<button data-go="medical/' + t[0] + '"><div><b>' + t[1] + ' ' + t[2] + '</b></div><span>›</span></button>'; }).join('') + '</div>';
  return h + maSafety() + '</div>';
}
ACT.mcSpot = function (el) {
  var p = curP(), all = mcAll(p), s = MC_SPOT[el.dataset.k], ids = s[3].filter(function (id) { return all[id]; });
  if (ids.length === 1) { go('medical/case/' + ids[0]); return; }
  sheet('<div class="pad"><h3 style="font:600 18px var(--sans);margin:4px 0 10px">' + esc(s[2]) + '</h3>' + ids.map(function (id) { var a = all[id]; return '<button class="mcrow" data-act="mcOpen" data-id="' + id + '"><span class="aci sm">' + (MC_ICON[id] || '•') + '</span><div><b>' + esc(a.pr.n) + '</b><small>' + esc(a.tend + ' · ' + a.nowWord) + '</small></div><span class="mcdot" style="background:' + mcCol(MC_TV[a.tend]) + '"></span></button>'; }).join('') + '</div>');
};
ACT.mcOpen = function (el) { closeSheet(true); go('medical/case/' + el.dataset.id); };

/* ---------- problem page ---------- */
var mcCase0 = MedCaseScreen;
MedCaseScreen = function (id) {
  var p = curP(); if (!p) return noPerson();
  var c = calcP(p), R = maOf(p), a = (mcAll(p)[id]) || MC.analyze(c, R, id, new Date()); if (!a) { go('medical'); return ''; }
  var pr = a.pr, n1 = p.name.split(' ')[0], now = new Date(), dm = function (d) { return N.dmy(d); };
  var h = '<div class="top"><button class="ib" data-go="medical">' + icon('back') + '</button><span class="ttl">' + esc(pr.n) + '</span><span class="sp"></span><button class="ib" data-act="shareTab">' + icon('share') + '</button></div><div class="pad">';
  h += '<div class="card chero"><div class="chi">' + (MC_ICON[pr.id] || '•') + '</div><div class="gauges">' + gauge(MC_TV[a.tend], a.tend.replace(' tendency', ''), 'chart tendency') + gauge(MC_NV[a.nowWord], a.nowWord.replace(' now', ''), 'right now') + ring(a.recovery.score, 5, 'recovery') + '</div><p class="mhsum">' + esc((a.nL >= 2 ? n1 + '\'s chart points here from ' + a.nL + ' of 3 sides. ' : a.nL === 1 ? 'Only a mild pointer in the chart. ' : 'The chart does not point here. ') + (a.nowWord === 'Active now' ? 'The current period stirs it: act now.' : a.nowWord === 'Watch now' ? 'Keep routine and tests on time.' : 'Quiet for now.')) + '</p></div>';
  /* timeline */
  h += '<div class="card"><h3>When it is more sensitive</h3>' + bandTimeline(a.per, now, 10) + (a.sens.length ? '<div class="kdates">' + a.sens.slice(0, 3).map(function (s) { return '<div class="b"><b>' + (s.now ? 'Now → ' + dm(s.end) : dm(s.start)) + '</b><small>' + MA.PN[s.md] + '–' + MA.PN[s.ad] + (s.now ? ' running' : '') + ' · tests before it starts</small></div>'; }).join('') + (a.easy[0] ? '<div class="g"><b>' + dm(a.easy[0].start) + '</b><small>best time to start treatment</small></div>' : '') + '</div>' : '') + '</div>';
  /* actions */
  var rem0 = a.rem[0], d0 = rem0 ? MA.PL[rem0.code] : null;
  h += '<div class="card"><h3>Do this</h3>' + tiles([
    ['🩺', 'Doctor & tests', pr.doc + ': ' + pr.tests[0], 'blue'],
    ['✕', 'Avoid strictly', pr.avoid.slice(0, 3).join(' · '), 'red'],
    ['✓', 'Every day', pr.dos.slice(0, 3).join(' · '), 'green'],
    ['🍲', 'Food', pr.food, ''],
    pr.yoga && pr.yoga !== '—' ? ['🧘', 'Yoga & breath', pr.yoga, ''] : null,
    rem0 ? ['📿', MA.PN[rem0.code] + ' remedy · ' + rem0.mode, (rem0.mode === 'pacify' ? 'Daan on ' + d0.day + 's: ' + d0.daan.split(',').slice(0, 2).join(',') + '. ' : '') + 'Mantra 108× ' + (rem0.mode === 'pacify' ? 'on ' + d0.day + 's' : 'daily') + ', 40 days', 'purple'] : null
  ]) + '</div>';
  if (a.rem.length > 1) h += '<div class="card"><h3>All remedies</h3>' + a.rem.map(function (r) { return '<details class="remd"><summary><span class="tag ' + (r.mode === 'strengthen' ? 'g' : r.mode === 'pacify' ? 'b' : 'tn') + '">' + r.mode + '</span> ' + MA.PN[r.code] + ' <small class="mut">' + esc(r.why) + '</small></summary><ul class="mawhy">' + r.acts.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '<li>' + esc('Gemstone: ' + r.gem) + '</li></ul></details>'; }).join('') + '</div>';
  /* reading */
  h += '<details class="card rdet"' + (U.mcOpen === id ? ' open' : '') + '><summary>📖 Read the full explanation</summary>' + mcReading(p, c, R, a).replace(/^<div class="card mcread">/, '<div class="mcread in">') + '</details>';
  /* tracker + alert + tech (reuse old page sections) */
  var old = mcCase0(id), ti = old.indexOf('<div class="card"><div class="kgh"><h3>90-day routine'), te = old.indexOf('<div class="card maalertc">');
  if (ti > 0 && te > ti) h += old.slice(ti, te);
  h += '<div class="card maalertc"><b>🚨 See a doctor at once if:</b> ' + esc(pr.alert) + '</div>';
  var tb = old.indexOf('<details class="tech"'); if (tb > 0) { var tbe = old.indexOf('</details>', tb); h += old.slice(tb, tbe + 10); }
  U.shareFn = function () { return MC.text(a, p.name); };
  return h + maSafety() + '</div>';
};
/* the old Health risks report now opens the visual section */
(function () { var r0 = render; render = function () { var pr = parts(); if (pr[0] === 'report' && pr[1] === 'disease') { location.replace('#/medical'); return; } r0(); }; })();
