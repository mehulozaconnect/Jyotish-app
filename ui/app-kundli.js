/* Trikaal app: kundli hub and its tabs */
var TABS = [['report', 'Report'], ['charts', 'Charts'], ['planets', 'Planets'], ['dasha', 'Dasha'], ['transit', 'Transit'], ['health', 'Health'], ['event', 'Event'], ['kp', 'KP'], ['av', 'Ashtakavarga'], ['varsh', 'Varshphal'], ['remedies', 'Remedies'], ['yogas', 'Yogas'], ['btime', 'Birth time']];
var TABF = {};
function Hub(p, tab) {
  if (!TABF[tab]) tab = 'report';
  U.tab[p.id] = tab;
  var c = calcP(p), now = new Date(), ch = J.dashaChain(c.maha, now, 3);
  var h = '<div class="top"><button class="ib" data-act="hubBack">' + icon('back') + '</button><div style="min-width:0;flex:1"><div class="ttl" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(p.name) + (p.id === DB.settings.meId ? ' <span style="color:var(--acc)">★</span>' : '') + '</div><div class="mut" style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(birthLine(p)) + '</div></div>' +
    '<button class="ib" data-act="shareTab" title="Share">' + icon('share') + '</button><button class="ib" data-go="edit/' + p.id + '" title="Edit">' + icon('edit') + '</button></div>';
  h += '<div class="sub" style="padding-top:0">' + SG[c.k.ascSign] + ' lagna ' + c.k.ascDeg + ' · ' + SG[c.k.P.Mo.sign] + ' Moon (' + c.k.P.Mo.nak.name + ') · ' + ch.map(function (x) { return PN[x.lord]; }).join(' › ') + ' · <span style="color:var(--lavI);font-weight:600">' + esc(ayanShort()) + '</span></div>';
  h += '<div class="tabs">' + TABS.map(function (t) { return '<button data-go="p/' + p.id + '/' + t[0] + '" class="' + (t[0] === tab ? 'on' : '') + '">' + t[1] + '</button>'; }).join('') + '</div>';
  U.shareFn = null;
  return h + TABF[tab](p, c, now);
}
ACT.shareTab = function () {
  var p = person(U.cur); if (!p) return;
  var txt = U.shareFn ? U.shareFn() : null;
  if (!txt) { var el = $('#app'); txt = (el.innerText || '').replace(/\n{3,}/g, '\n\n'); }
  shareText('Trikaal · ' + p.name, txt + '\n\nCalculated with Trikaal (' + ayanShort() + ').');
};
function itemIcon(k) { return k === 'pro' ? '<span class="ic p">+</span>' : k === 'con' ? '<span class="ic c">−</span>' : '<span class="ic i">•</span>'; }
function sectionBadge(s) {
  if (s.badge) return s.badge;
  var p = 0, c = 0; (s.items || []).forEach(function (i) { if (i.k === 'pro') p++; if (i.k === 'con') c++; });
  return !s.items ? null : p >= c + 2 ? 'Strong' : c >= p + 1 ? 'Watch' : 'Mixed';
}
function badgeChip(b) { if (!b) return ''; var m = { Strong: 'g', Moderate: 'm', Mixed: 'm', Watch: 'b' }; return '<span class="vc ' + (m[b] || 'n') + '">' + b + '</span>'; }

/* ---------- Report ---------- */
TABF.report = function (p, c, now) {
  var sec = N.report(c, now), f = U.filter, sum = S.report(c, now);
  var F = [['all', 'All'], ['personality', 'Nature'], ['health', 'Health'], ['career', 'Career'], ['money', 'Money'], ['marriage', 'Marriage'], ['children', 'Children'], ['now', 'Now'], ['future', 'Next 3 years']];
  var h = '<div class="pad"><div class="ans neutral"><div class="lbl">' + esc(p.name) + ' in simple words</div>';
  sum.forEach(function (r) { var col = r.v === 'good' ? 'var(--good)' : r.v === 'bad' ? 'var(--bad)' : r.v === 'mixed' ? 'var(--warn)' : 'var(--indigo)'; h += '<div class="sumrow"><span class="d" style="background:' + col + '"></span><div><b>' + esc(r.k) + '</b><p>' + esc(r.t) + '</p></div></div>'; });
  h += '</div><div class="lbl" style="margin:14px 2px 8px">Full reading, point by point</div></div>';
  h += '<div class="chips">' + F.map(function (x) { return '<button data-act="rfilter" data-v="' + x[0] + '" class="' + (f === x[0] ? 'on' : '') + '">' + x[1] + '</button>'; }).join('') + '</div><div class="pad">';
  sec.forEach(function (s) {
    if (f !== 'all' && s.id !== f) return;
    h += '<div class="card"><h3>' + esc(s.title) + badgeChip(s.id === 'short' || s.id === 'future' || s.id === 'personality' ? null : sectionBadge(s)) + '</h3>';
    (s.items || []).forEach(function (i) { h += '<div class="pc-row">' + itemIcon(i.k) + '<span><b>' + esc(i.t) + '</b></span></div>' + whyBox(i.why); });
    if (s.timeline) h += '<div class="tl">' + s.timeline.map(function (t) { return '<span class="d">' + N.dmy(t.t) + '</span><span>' + esc(t.text) + '</span>'; }).join('') + '</div>';
    if (s.note) h += '<div class="note">' + esc(s.note) + '</div>';
    h += '</div>';
  });
  h += '<div class="note" style="margin:0 2px 14px">Tap “Why” on any point to see the chart facts behind it. Ask follow-up questions in the Ask tab.</div></div>';
  U.shareFn = function () { return p.name + ' in simple words\n' + sum.map(function (r) { return r.k + ': ' + r.t; }).join('\n'); };
  return h;
};
ACT.rfilter = function (el) { U.filter = el.dataset.v; rerender(true); };

/* ---------- Charts ---------- */
var CHARTS = [['D1', 'D1 Rashi'], ['CH', 'Chalit'], ['MO', 'Moon'], ['SU', 'Sun']].concat(J.VARGAS.filter(function (v) { return v[0] > 1; }).map(function (v) { return ['D' + v[0], 'D' + v[0]]; }));
function digMark(d) { return d === 'Exalted' ? '↑' : d === 'Debilitated' ? '↓' : ''; }
function chartModel(c, id) {
  var k = c.k, rows = [], items = [], signs = [], title, sub, base;
  function signsFrom(s) { var a = []; for (var i = 0; i < 12; i++) a.push((s + i) % 12); return a; }
  if (id === 'D1' || id === 'MO' || id === 'SU') {
    base = id === 'D1' ? k.ascSign : id === 'MO' ? k.P.Mo.sign : k.P.Su.sign; signs = signsFrom(base);
    rows.push({ h: J.houseFrom(base, k.ascSign), code: id === 'D1' ? 'Asc' : 'La', deg: J.dm(k.asc), cls: 'asc' }); items.push({ s: k.ascSign, code: id === 'D1' ? 'Asc' : 'La', deg: J.dm(k.asc), cls: 'asc' });
    k.planets.forEach(function (p) { var r = { h: J.houseFrom(base, p.sign), code: p.code, deg: J.dm(p.lon), r: p.retro && p.code !== 'Ra' && p.code !== 'Ke', mark: digMark(p.dignity), cls: p.code === 'Mo' ? 'mo' : '' }; rows.push(r); items.push({ s: p.sign, code: p.code, deg: r.deg, r: r.r, mark: r.mark, cls: r.cls }); });
    title = id === 'D1' ? 'Rashi (D1)' : id === 'MO' ? 'Chandra lagna' : 'Surya lagna'; sub = id === 'D1' ? 'Body and life as a whole' : id === 'MO' ? 'Houses counted from the Moon: mind, gochar' : 'Houses counted from the Sun: soul, father, authority';
    return { title: title, sub: sub, signs: signs, rows: rows, items: items, ascSign: base };
  }
  if (id === 'CH') {
    signs = k.cusps.map(function (x) { return x.sign; });
    rows.push({ h: 1, code: 'Asc', deg: J.dm(k.asc), cls: 'asc' }); items.push({ s: k.ascSign, code: 'Asc', deg: J.dm(k.asc), cls: 'asc' });
    k.planets.forEach(function (p) { rows.push({ h: p.bhava, code: p.code, deg: J.dm(p.lon), r: p.retro && p.code !== 'Ra' && p.code !== 'Ke', cls: p.code === 'Mo' ? 'mo' : '' }); items.push({ s: k.cusps[p.bhava - 1].sign, code: p.code, deg: J.dm(p.lon), cls: p.code === 'Mo' ? 'mo' : '' }); });
    return { title: 'Bhava Chalit', sub: 'Planets by Placidus house cusps (KP bhavas)', signs: signs, rows: rows, items: items, ascSign: k.ascSign };
  }
  var n = +id.slice(1), meta = J.VARGAS.filter(function (v) { return v[0] === n; })[0], av = J.varga(k.asc, n);
  signs = signsFrom(av.sign);
  rows.push({ h: 1, code: 'Asc', deg: J.dm(av.deg), cls: 'asc' }); items.push({ s: av.sign, code: 'Asc', deg: J.dm(av.deg), cls: 'asc' });
  k.planets.forEach(function (p) { var v = J.varga(p.lon, n), dg = J.dignity(p.code, v.sign * 30 + v.deg), r = { h: J.houseFrom(av.sign, v.sign), code: p.code, deg: J.dm(v.deg), r: p.retro && p.code !== 'Ra' && p.code !== 'Ke', mark: digMark(dg), cls: p.code === 'Mo' ? 'mo' : '', sign: v.sign, dig: dg, vg: v.sign === p.sign }; rows.push(r); items.push({ s: v.sign, code: p.code, deg: r.deg, r: r.r, mark: r.mark, cls: r.cls }); });
  return { title: meta[1] + ' (D' + n + ')', sub: meta[2], signs: signs, rows: rows, items: items, ascSign: av.sign, n: n, ascV: av };
}
function drawChart(m, style) { return style === 'south' ? Charts.south(m.items, m.ascSign, m.title.split(' (')[0]) : Charts.north(m.rows, m.signs); }
TABF.charts = function (p, c) {
  var id = U.chart, style = U.style || DB.settings.style, m = chartModel(c, id), k = c.k;
  var h = '<div class="chips">' + CHARTS.map(function (x) { return '<button data-act="pickChart" data-v="' + x[0] + '" class="' + (x[0] === id ? 'on' : '') + '">' + x[1] + '</button>'; }).join('') + '</div>';
  h += '<div class="segw"><div><div style="font:600 15px var(--sans)">' + esc(m.title) + '</div><div class="mut" style="font-size:12px">' + esc(m.sub) + '</div></div><div class="seg"><button data-act="cstyle" data-v="north" class="' + (style === 'north' ? 'on' : '') + '">North</button><button data-act="cstyle" data-v="south" class="' + (style === 'south' ? 'on' : '') + '">South</button></div></div>';
  h += '<div class="pad"><div class="card" style="padding:10px">' + drawChart(m, style) + '<div class="note" style="text-align:center;margin-top:6px">Degrees are within the sign' + (m.n ? ' of this varga' : '') + '. ↑ exalted · ↓ debilitated · R retrograde</div></div>';
  /* table */
  h += '<div class="card"><div class="tw"><table>';
  if (id === 'D1' || id === 'MO' || id === 'SU') {
    h += '<tr><th>Body</th><th>Sign</th><th>Degree</th><th>Nakshatra</th><th>Pd</th><th>Star L</th><th>Sub L</th><th>H</th><th>Dignity</th></tr>';
    h += '<tr><td><b style="color:var(--acc)">Asc</b></td><td>' + SG3[k.ascSign] + '</td><td class="mono">' + k.ascDegs + '</td><td>' + k.ascNak.name + '</td><td>' + k.ascNak.pada + '</td><td>' + k.ascKP.star + '</td><td>' + k.ascKP.sub + '</td><td>1</td><td></td></tr>';
    k.planets.forEach(function (x) { h += '<tr class="tap" data-act="planetSheet" data-v="' + x.code + '"><td><b>' + x.code + '</b>' + (x.retro && x.code !== 'Ra' && x.code !== 'Ke' ? '<span class="r">R</span>' : '') + (x.combust ? '<span class="r" style="color:var(--warn)">C</span>' : '') + '</td><td>' + SG3[x.sign] + '</td><td class="mono">' + x.degs + '</td><td>' + x.nak.name + '</td><td>' + x.nak.pada + '</td><td>' + x.nak.lord + '</td><td>' + x.kp.sub + '</td><td>' + (id === 'D1' ? x.house : J.houseFrom(m.ascSign, x.sign)) + '</td><td>' + x.dignity.replace(' sign', '') + '</td></tr>'; });
  } else if (id === 'CH') {
    h += '<tr><th>Bhava</th><th>Cusp</th><th>Degree</th><th>Sign L</th><th>Star L</th><th>Sub L</th><th>Planets</th></tr>';
    k.cusps.forEach(function (x) { h += '<tr><td><b>' + x.house + '</b></td><td>' + SG3[x.sign] + '</td><td class="mono">' + x.degs + '</td><td>' + x.kp.sign + '</td><td>' + x.kp.star + '</td><td>' + x.kp.sub + '</td><td>' + k.planets.filter(function (q) { return q.bhava === x.house; }).map(function (q) { return q.code; }).join(' ') + '</td></tr>'; });
  } else {
    h += '<tr><th>Body</th><th>Sign</th><th>Degree</th><th>H</th><th>Dignity</th>' + (m.n === 60 ? '<th>D60 deity</th>' : '') + '</tr>';
    h += '<tr><td><b style="color:var(--acc)">Asc</b></td><td>' + SG3[m.ascV.sign] + '</td><td class="mono">' + J.dm(m.ascV.deg) + '</td><td>1</td><td></td>' + (m.n === 60 ? '<td>' + J.d60Deity(k.asc).name + '</td>' : '') + '</tr>';
    m.rows.slice(1).forEach(function (r) { var d6 = m.n === 60 ? J.d60Deity(k.P[r.code].lon) : null; h += '<tr class="tap" data-act="planetSheet" data-v="' + r.code + '"><td><b>' + r.code + '</b>' + (r.r ? '<span class="r">R</span>' : '') + '</td><td>' + SG3[r.sign] + (r.vg ? ' <span class="tag g">VG</span>' : '') + '</td><td class="mono">' + r.deg + '</td><td>' + r.h + '</td><td>' + r.dig.replace(' sign', '') + '</td>' + (d6 ? '<td style="color:' + (d6.benefic ? 'var(--good)' : 'var(--bad)') + '">' + d6.num + ' ' + d6.name + '</td>' : '') + '</tr>'; });
  }
  h += '</table></div>' + (m.n ? '<div class="note">VG = vargottama (same sign as D1). Tap a planet for its full reading.</div>' : '<div class="note">Tap a planet for its full reading. Ayanamsa ' + esc(C.AYAN_INFO[k.ayan].name) + ' ' + J.dms(k.ayanamsa, true) + '.</div>') + '</div>';
  return h + '</div>';
};
ACT.pickChart = function (el) { U.chart = el.dataset.v; rerender(true); };
ACT.cstyle = function (el) { U.style = el.dataset.v; DB.settings.style = el.dataset.v; save(); rerender(true); };
ACT.planetSheet = function (el) {
  var p = person(U.cur), c = calcP(p), code = el.dataset.v, items = N.planet(c, code, new Date());
  sheet('<div class="pad"><div class="row" style="margin:4px 0 10px"><div style="display:flex;gap:10px;align-items:center">' + pg(code) + '<div><div style="font:600 17px var(--sans)">' + PN[code] + ' <span class="mut" style="font-weight:500">' + J.PHI[code] + '</span></div><div class="mut" style="font-size:12px">' + esc(p.name) + '</div></div></div><button class="btn sec sm" data-act="close">Close</button></div>' +
    '<div class="card">' + items.map(function (i) { return '<div class="pc-row"><span class="ic i">•</span><span><b>' + esc(i.t) + '</b></span></div>' + whyBox(i.why); }).join('') + '</div></div>');
};

/* ---------- Planets ---------- */
var PVL = { good: 'On your side', mixed: 'Mixed', bad: 'Troubles you' };
function planetPlainCard(c, code, now, compact) {
  var x = c.k.P[code], sp = S.planet(c, code, now), items = N.planet(c, code, now);
  var h = '<div class="card"><div class="row" style="margin-bottom:8px"><div style="display:flex;gap:10px;align-items:center">' + pg(code) + '<div><b style="font-size:15.5px">' + PN[code] + '</b><div class="mut" style="font-size:12px">' + SG[x.sign] + ' ' + x.deg + ' · ' + nth(x.house) + ' house</div></div></div>' + vchip(sp.verdict, PVL[sp.verdict]) + '</div>';
  h += '<div style="font:600 15.5px/1.4 var(--sans);margin-bottom:4px">' + esc(sp.headline) + '</div><p style="font-size:13.8px;line-height:1.5">' + esc(sp.meaning) + '</p>';
  sp.lines.forEach(function (l) { h += '<div class="pl"><b>' + esc(l[0]) + '</b>' + esc(l[1]) + '</div>'; });
  h += '<div class="ar do"><b>Do</b><div>' + sp.do.map(function (d) { return '<div>' + esc(cap(d)) + '</div>'; }).join('') + '</div></div>';
  if (sp.avoid.length) h += '<div class="ar avoid"><b>Avoid</b><div>' + sp.avoid.map(function (d) { return '<div>' + esc(cap(d)) + '</div>'; }).join('') + '</div></div>';
  h += techBlock('Astrology details', items.map(function (i) { return '<div class="pc-row"><span class="ic i">•</span><span><b>' + esc(i.t) + '</b></span></div>' + whyBox(i.why); }).join(''));
  return h + '</div>';
}
TABF.planets = function (p, c, now) {
  var h = '<div class="pad"><div class="note" style="margin:0 2px 10px">Each planet in plain words: is it on your side, how strong it is, what it is doing in your life now, and what to do about it.</div>';
  ['Sa', 'Ju', 'Ra', 'Ke', 'Ma', 'Su', 'Mo', 'Me', 'Ve'].forEach(function (code) { h += planetPlainCard(c, code, now); });
  return h + '</div>';
};
/* ---------- Dasha ---------- */
var LVL = ['Mahadasha', 'Antardasha', 'Pratyantar', 'Sookshma', 'Prana'];
TABF.dasha = function (p, c, now) {
  var h = '<div class="segw"><div class="seg"><button data-act="dsys" data-v="vim" class="' + (U.dsys === 'vim' ? 'on' : '') + '">Vimshottari</button><button data-act="dsys" data-v="yog" class="' + (U.dsys === 'yog' ? 'on' : '') + '">Yogini</button></div><span class="mut" style="font-size:12px">Year ' + DB.settings.dyear + ' days</span></div><div class="pad">';
  if (U.dsys === 'yog') {
    var yg = c.yog, cur = J.find(yg, now);
    h += '<div class="card dark"><div class="lbl">Running Yogini dasha</div><div style="font:600 17px var(--sans);margin:4px 0 2px">' + cur.name + ' (' + PN[cur.lord] + ')</div><p>' + N.dmy(cur.start) + ' – ' + N.dmy(cur.end) + '</p></div>';
    yg.forEach(function (d, i) {
      var isCur = d === cur, past = d.end < now, open = U.yopen === i;
      h += '<button class="drow ' + (isCur ? 'cur' : past ? 'past' : '') + '" data-act="yopen" data-i="' + i + '"><span class="nm">' + d.name + ' <i>' + PN[d.lord] + ' · ' + d.years + 'y</i>' + (isCur ? '<span class="now">NOW</span>' : '') + '</span><span class="du">' + durStr(d.end - d.start) + '</span><span class="rg">' + N.dmy(d.start) + ' → ' + N.dmy(d.end) + '</span></button>';
      if (open) J.yoginiSub(d).forEach(function (s) { var sc = now >= s.start && now < s.end; h += '<div class="drow ' + (sc ? 'cur' : s.end < now ? 'past' : '') + '" style="margin-left:16px;width:calc(100% - 16px)"><span class="nm" style="font-size:13px">' + s.name + ' <i>' + PN[s.lord] + '</i>' + (sc ? '<span class="now">NOW</span>' : '') + '</span><span class="du">' + durStr(s.end - s.start) + '</span><span class="rg">' + N.dmy(s.start) + ' → ' + N.dmy(s.end) + '</span></div>'; });
    });
    return h + '</div>';
  }
  var chain = J.dashaChain(c.maha, now, 5);
  h += '<div class="card"><div class="lbl" style="margin-bottom:8px">Running now · ' + N.dmyt(now) + '</div><div class="dchips">' + chain.map(function (x, i) { return '<div class="dchip"><span class="k">' + LVL[i] + '</span><b>' + PN[x.lord] + '</b><span>' + (i < 2 ? N.dmy(x.end) : N.dmY(x.end) + ' ' + N.hm(x.end)) + '</span></div>'; }).join('') + '</div><div class="note">Last date in each box is when that period ends.</div></div>';
  /* drill */
  var path = U.dpath, list = c.maha.filter(function (d) { return d.start < new Date(c.birth.getTime() + 121 * 365.25 * 864e5); }), crumbs = [['', 'All mahadashas']], parent = null;
  for (var i = 0; i < path.length; i++) { var pick = list.filter(function (d) { return d.lord === path[i]; })[0]; if (!pick) { U.dpath = path = path.slice(0, i); break; } parent = pick; crumbs.push([path.slice(0, i + 1).join(','), PN[pick.lord]]); list = J.subPeriods(pick); }
  h += '<div class="crumbs">' + crumbs.map(function (x) { return '<button data-act="dcrumb" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>';
  if (parent) h += '<div class="card" style="padding:11px 13px"><b>' + LVL[path.length - 1] + ' of ' + PN[parent.lord] + '</b><div class="mut" style="font-size:12.5px;margin-top:3px">' + esc(PN[parent.lord] + ' ' + N.lordNote(c, parent.lord) + '; functional ' + N.funcWord(c, parent.lord) + '.') + '</div></div>';
  var lvl = path.length, withTime = lvl >= 2;
  list.forEach(function (d) {
    var isCur = now >= d.start && now < d.end, past = d.end < now, f = N.funcWord(c, d.lord);
    h += '<button class="drow ' + (isCur ? 'cur' : past ? 'past' : '') + '" ' + (lvl < 4 ? 'data-act="ddown" data-v="' + d.lord + '"' : '') + '><span class="nm">' + PN[d.lord] + ' <i>' + J.PHI[d.lord] + '</i>' + (isCur ? '<span class="now">NOW</span>' : '') + '</span><span class="du">' + durStr(d.end - d.start) + '</span><span class="rg">' + (withTime ? N.dmyt(d.start) + ' → ' + N.dmyt(d.end) : N.dmy(d.start) + ' → ' + N.dmy(d.end)) + '</span>' + (lvl < 2 ? '<span class="sb">' + esc(N.lordNote(c, d.lord)) + ' · ' + f + '</span>' : '') + '</button>';
  });
  h += '<div class="note">Tap a period to open its sub-periods, down to Prana. Balance at birth: ' + PN[c.maha[0].lord] + ' ' + durStr(c.maha[0].end - c.birth) + '.</div>';
  U.shareFn = function () { return 'Running dasha: ' + chain.map(function (x, i) { return LVL[i] + ' ' + PN[x.lord] + ' (to ' + N.dmyt(x.end) + ')'; }).join(', '); };
  return h + '</div>';
};
ACT.dsys = function (el) { U.dsys = el.dataset.v; rerender(true); };
ACT.yopen = function (el) { var i = +el.dataset.i; U.yopen = U.yopen === i ? null : i; rerender(true); };
ACT.ddown = function (el) { U.dpath = U.dpath.concat([el.dataset.v]); rerender(false); window.scrollTo(0, 0); };
ACT.dcrumb = function (el) { U.dpath = el.dataset.v ? el.dataset.v.split(',') : []; rerender(true); };

/* ---------- Transit ---------- */
var VERB = { Su: 'puts the spotlight on', Mo: 'moves feelings around', Ma: 'energises and heats up', Me: 'brings talks, paperwork and deals to', Ju: 'expands and protects', Ve: 'brings comfort and ease to', Sa: 'slows and tests', Ra: 'amplifies and unsettles', Ke: 'detaches you from' };
var VWORDQ = { good: 'Good', mixed: 'Mixed', bad: 'Hard' };
function monthStart(off) { var o = locOff(), x = new Date(Date.now() + o * 3600e3); return { y: x.getUTCFullYear() + Math.floor((x.getUTCMonth() + off) / 12), m: ((x.getUTCMonth() + off) % 12 + 12) % 12 }; }
var MONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
TABF.transit = function (p, c, now) {
  var ms = monthStart(U.month), tm = N.transitMonth(c, ms.y, ms.m, now), k = c.k, sm = S.month(c, tm);
  var h = '<div class="tabs" style="padding-bottom:10px">' + [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (o) { var x = monthStart(o); return '<button data-act="tmonth" data-v="' + o + '" class="' + (o === U.month ? 'on' : '') + '">' + MONS[x.m] + ' ' + x.y + '</button>'; }).join('') + '</div><div class="pad">';
  var cw = J.signWindows('Mo', (k.P.Mo.sign + 7) % 12, tm.start, tm.end, 6).map(function (w) { return (w.start ? N.dmY(w.start) + ' ' + N.hm(w.start) : 'Month start') + ' to ' + (w.end ? N.dmY(w.end) + ' ' + N.hm(w.end) : 'month end') + ': low-energy days, avoid big decisions'; });
  h += answerCard({ verdict: sm.verdict, label: MONS[ms.m] + ' ' + ms.y + ' for you', headline: sm.word + ' for you.', meaning: sm.meaning, rows: [['Do', sm.do, 'do'], ['Avoid', sm.avoid, 'avoid'], ['Go slow', cw, 'when']] });
  if (sm.ruler) h += '<div class="card dark"><div class="lbl">Who runs this month</div><div style="font:600 17px/1.3 var(--sans);margin:4px 0 4px">' + esc(sm.ruler.title) + '</div><p>' + esc(sm.ruler.text) + '</p></div>';
  h += '<div class="card" style="padding:4px 14px"><div class="lbl" style="padding:10px 0 2px">Each planet this month</div>';
  sm.rows.forEach(function (r) {
    var x = tm.tr.filter(function (t) { return t.code === r.code; })[0], open = U.open['tr' + r.code];
    h += '<button class="prow2" data-act="topen" data-v="' + r.code + '">' + pg(r.code) + '<div><b>' + esc(r.title) + '</b><small>' + esc(r.text) + '</small></div>' + vchip(r.verdict, VWORDQ[r.verdict]) + '</button>';
    if (open) h += '<div class="why" style="margin:0 0 10px 44px">' + x.why.map(function (l) { return '<div>' + esc(l) + '</div>'; }).join('') + '<div>Position: ' + SG[x.sign] + ' ' + J.dm(x.lon) + (x.retro && x.code !== 'Ra' && x.code !== 'Ke' ? ' R' : '') + ', your ' + nth(x.h) + ' house, ' + nth(x.m) + ' from Moon.</div></div>';
  });
  h += '</div>';
  if (sm.dates.length) h += '<div class="card"><h3>Key dates this month</h3><div class="tl">' + sm.dates.map(function (d) { return '<span class="d">' + N.dmY(d.t) + '</span><span>' + esc(d.text) + '</span>'; }).join('') + '</div></div>';
  var ss = tm.sade, rows = [{ h: 1, code: 'Asc', deg: k.ascDeg, cls: 'asc' }].concat(tm.tr.map(function (x) { return { h: x.h, code: x.code, deg: J.dm(x.lon), r: x.retro && x.code !== 'Ra' && x.code !== 'Ke' }; }));
  var mo = J.kundli(tm.ref, c.p.lat, c.p.lon).P.Mo; rows.push({ h: J.houseFrom(k.ascSign, mo.sign), code: 'Mo', deg: J.dm(mo.lon), cls: 'mo' });
  var signs = []; for (var i = 0; i < 12; i++) signs.push((k.ascSign + i) % 12);
  h += techBlock('Transit chart and Sade Sati details', '<div class="card"><div class="row"><b>' + esc(ss.label) + '</b>' + vchip(ss.q === 'bad' ? 'bad' : 'good', ss.q === 'bad' ? 'Active' : 'Clear') + '</div><div class="mut" style="font-size:12.5px;margin-top:3px">Saturn is ' + nth(ss.house) + ' from your Moon (' + SG[k.P.Mo.sign] + ')' + (ss.until ? ' until ' + N.dmy(ss.until) : '') + '.</div></div><div class="card" style="padding:10px"><div class="ctitle">Transits on your chart · ' + N.dmy(tm.ref) + '</div>' + Charts.north(rows, signs) + '</div>');
  U.shareFn = function () { return MONS[ms.m] + ' ' + ms.y + ': ' + sm.word + '. ' + sm.meaning + '\nDo: ' + sm.do.join('; ') + '\nAvoid: ' + sm.avoid.join('; ') + '\n' + sm.rows.map(function (r) { return r.title + ': ' + r.text; }).join('\n'); };
  return h + '</div>';
};
ACT.tmonth = function (el) { U.month = +el.dataset.v; rerender(true); };
ACT.topen = function (el) { var k = 'tr' + el.dataset.v; U.open[k] = !U.open[k]; rerender(true); };

/* ---------- Health ---------- */
TABF.health = function (p, c, now) {
  var sh = S.health(c, now), H = sh.H, h = '<div class="pad">';
  h += answerCard({ verdict: sh.verdict, label: 'Health in simple words', headline: sh.headline, meaning: sh.meaning, rows: [['Now', sh.now, 'when'], ['Better', sh.better, 'when'], ['Do', sh.do, 'do'], ['Avoid', sh.avoid, 'avoid']] });
  h += '<div class="card"><h3>Body areas, weakest first</h3>';
  H.zones.forEach(function (z) {
    var col = z.level === 'watch' ? 'var(--bad)' : z.level === 'care' ? 'var(--warn)' : 'var(--good)', lab = z.level === 'watch' ? 'Needs care' : z.level === 'care' ? 'Keep an eye' : 'Good';
    h += '<div class="zone"><span class="d" style="background:' + col + '"></span><div><b>' + esc(PLAIN.HEALTH[z.house][0]) + '</b> <em>' + lab + '</em>' + (z.level !== 'good' ? '<small>' + esc(cap(PLAIN.HEALTH[z.house][1])) + '.</small>' : '') + whyBox(z.why.concat(['House ' + z.house + ' (' + SG[z.sign] + '), ' + z.sav + ' Ashtakavarga points.'])).replace('margin:0 0 8px 22px', '') + '</div></div>';
  });
  h += '</div>';
  h += techBlock('Timeline and dasha details', (H.timeline.length ? '<div class="card"><h3>Next 6 months</h3><div class="tl">' + H.timeline.map(function (t) { return '<span class="d">' + N.dmY(t.start) + '</span><span>' + esc(t.t) + (t.end ? ' <span class="mut">Until ' + N.dmy(t.end) + '.</span>' : '') + '</span>'; }).join('') + '</div></div>' : '') +
    (H.dasha.length ? '<div class="card"><h3>Dasha and health</h3>' + H.dasha.map(function (d) { return '<div class="pc-row">' + itemIcon('con') + '<span>' + esc(d) + '</span></div>'; }).join('') + '</div>' : '') +
    '<div class="card"><h3>Overall strength</h3>' + H.vwhy.map(function (w) { return '<div class="pc-row">' + itemIcon('info') + '<span>' + esc(w) + '</span></div>'; }).join('') + '</div>');
  h += '<div class="note" style="margin:0 2px 14px">Astrological indications for timing and prevention only. For any symptom, see a doctor.</div>';
  U.shareFn = function () { return 'Health: ' + sh.headline + ' ' + sh.meaning + '\nNow: ' + sh.now.join(' ') + '\nDo: ' + sh.do.join(' '); };
  return h + '</div>';
};

/* ---------- Event analysis ---------- */
var EVT = Object.keys(KB.EVENTS);
TABF.event = function (p, c) {
  var e = U.evForm || (U.evForm = { type: 'accident', date: '', time: '12:00' });
  var h = '<div class="pad"><div class="card"><h3>What happened, and when?</h3><div class="field"><span>EVENT</span>' + sel('evType', EVT.map(function (x) { return [x, KB.EVENTS[x].l]; }), e.type) + '</div>' +
    '<div class="grid2"><label class="field"><span>DATE</span><input class="inp" type="date" data-in="evf" data-f="date" value="' + esc(e.date) + '"></label><label class="field"><span>TIME (if known)</span><input class="inp" type="time" data-in="evf" data-f="time" value="' + esc(e.time) + '"></label></div>' +
    '<button class="btn acc wide" data-act="evRun">Analyse this event</button></div>';
  if (U.ev && U.ev.pid === p.id) h += eventResult(p, c, U.ev);
  var past = (p.events || []).slice().reverse();
  if (past.length) h += '<div class="card"><h3>Analysed events</h3>' + past.map(function (x, i) { return '<button class="prow2" data-act="evOpen" data-i="' + (past.length - 1 - i) + '"><span class="pg" style="background:var(--indigo)">' + (i + 1) + '</span><div><b>' + esc(KB.EVENTS[x.type].l) + '</b><small>' + esc(x.date + ' ' + x.time) + '</small></div><span class="mut">' + icon('chevR', 16) + '</span></button>'; }).join('') + '</div>';
  return h + '</div>';
};
CHG.evType = function (el) { U.evForm.type = el.value; };
INP.evf = function (el) { U.evForm[el.dataset.f] = el.value; };
function evDate(p, d, t) { var a = d.split('-').map(Number), tt = String(t || '12:00').split(':').map(Number); return new Date(Date.UTC(a[0], a[1] - 1, a[2], tt[0] || 0, tt[1] || 0) - locOff() * 3600e3); }
ACT.evRun = function () {
  var p = person(U.cur), e = U.evForm; if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date)) return toast('Enter the date of the event');
  U.ev = { pid: p.id, type: e.type, date: e.date, time: e.time || '12:00' };
  p.events = p.events || []; if (!p.events.some(function (x) { return x.type === e.type && x.date === e.date; })) { p.events.push({ type: e.type, date: e.date, time: e.time || '12:00' }); if (p.events.length > 30) p.events.shift(); save(); }
  rerender(true); setTimeout(function () { var r = $('#evres'); if (r) r.scrollIntoView({ behavior: 'smooth' }); }, 60);
};
ACT.evOpen = function (el) { var p = person(U.cur), x = p.events[+el.dataset.i]; U.evForm = { type: x.type, date: x.date, time: x.time }; U.ev = { pid: p.id, type: x.type, date: x.date, time: x.time }; rerender(true); setTimeout(function () { var r = $('#evres'); if (r) r.scrollIntoView({ behavior: 'smooth' }); }, 60); };
function eventHeadline(E, pr) {
  var ch = E.dasha.slice(0, 3).map(function (d) { return PN[d.lord]; }).join('–');
  if (!E.main) return 'No single strong trigger stands out; the period ' + ch + ' sets the background.';
  var w = E.main.why.filter(function (x) { return /within/.test(x); })[0] || E.main.why[0] || '';
  w = w.replace(/^Transit \w+ within [0-9.]+° of /, 'crossing ').replace(/^Transiting /, 'transiting ');
  return PN[E.main.code] + ' is the main trigger' + (w ? ': ' + w.charAt(0).toLowerCase() + w.slice(1).replace(/\.$/, '') : '') + ', during ' + ch + '.';
}
function eventResult(p, c, ev) {
  var at = evDate(p, ev.date, ev.time), E = N.eventAnalysis(c, ev.type, at), k = c.k, pr = p.gender === 'F' ? 'her' : 'his', now = new Date(), se = S.event(c, E, now);
  U.lastEvent = { p: p.id, E: E, ev: ev };
  var h = '<div id="evres">';
  h += answerCard({ verdict: E.E.good ? 'good' : 'bad', chip: false, label: E.E.l + ' · ' + N.dmyt(at), headline: se.headline, rows: [['Why', se.reasons], ['Also', se.support.map(function (s) { return PN[s.code] + ': ' + s.text.replace(/^It /, ''); })], [E.E.heal ? 'Recovery' : 'Next', se.when, 'when'], ['Do', se.do, 'do'], ['Avoid', se.avoid, 'avoid']] });
  /* technical */
  var rows = [{ h: 1, code: 'Asc', deg: k.ascDeg, cls: 'asc' }], natShown = {};
  E.transits.forEach(function (t) { rows.push({ h: t.h, code: t.code, deg: J.dm(t.lon), r: t.retro && t.code !== 'Ra' && t.code !== 'Ke', cls: E.main && t.code === E.main.code ? 'bad' : t.code === 'Mo' ? 'mo' : '' }); t.conj.forEach(function (cj) { if (cj.code !== 'Lagna' && cj.code !== t.code && !natShown[cj.code]) { natShown[cj.code] = 1; rows.push({ h: J.houseFrom(k.ascSign, k.P[cj.code].sign), code: 'n' + cj.code, deg: J.dm(k.P[cj.code].lon), cls: 'nat' }); } }); });
  var signs = []; for (var i = 0; i < 12; i++) signs.push((k.ascSign + i) % 12);
  var steps = [];
  if (E.main) steps.push('<b>Trigger: ' + PN[E.main.code] + '</b> (' + esc(KB.PLANET[E.main.code].body.split(',').slice(0, 3).join(',')) + '). ' + esc(E.main.why.join(' ')));
  E.support.forEach(function (s) { steps.push('<b>Also: ' + PN[s.code] + '.</b> ' + esc(s.why.join(' '))); });
  steps.push('<b>Dasha:</b> ' + E.dasha.slice(0, 4).map(function (d, i) { var links = N.uniq(d.evP.concat(d.evK)).sort(function (a, b) { return a - b; }); return LVL[i] + ' ' + PN[d.lord] + (links.length ? ' (links ' + links.join(', ') + ')' : ' (no direct link)'); }).join(' › ') + '. Event houses: ' + E.E.houses.join(', ') + '.');
  steps.push('<b>KP check:</b> ' + E.kp.map(function (x) { var hit = x.sig.filter(function (y) { return E.E.houses.indexOf(y) >= 0; }); return nth(x.house) + ' cusp sub lord ' + PN[x.csl] + ' signifies ' + x.sig.join(', ') + (hit.length ? ' (event houses ' + hit.join(', ') + ')' : ''); }).join('; ') + '.');
  if (E.doubleTransit.ju || E.doubleTransit.sa) steps.push('<b>Double transit:</b> ' + (E.doubleTransit.ju && E.doubleTransit.sa ? 'both Jupiter and Saturn touch' : E.doubleTransit.sa ? 'Saturn touches' : 'Jupiter touches') + ' the ' + nth(E.doubleTransit.house) + ' house or its lord.');
  steps.push('<b>Shield:</b> 6th house ' + N.savOf(c, 6) + ' and 8th house ' + N.savOf(c, 8) + ' Ashtakavarga points.');
  var tech = '<div class="card" style="padding:10px"><div class="row" style="padding:2px 4px 6px"><b>Transit at the event, on ' + pr + ' chart</b><span class="lbl">' + SG[k.ascSign] + ' lagna</span></div>' + Charts.north(rows, signs) + '<div class="note" style="text-align:center">Red = main trigger. Grey italics = birth planets touched (n = natal).</div></div>';
  tech += '<div class="card"><h3>The logic</h3>' + steps.map(function (s, i) { return '<div class="step"><i>' + (i + 1) + '</i><span>' + s + '</span></div>'; }).join('') + '</div>';
  if (E.outlook.length) tech += '<div class="card"><h3>Timeline after the event</h3><div class="tl">' + E.outlook.map(function (o) { return '<span class="d">' + N.dmy(o.t) + '</span><span>' + esc(o.text) + '</span>'; }).join('') + '</div></div>';
  if (E.ranked.length > 1) tech += '<div class="card"><h3>All planets scored</h3><div class="tw"><table><tr><th>Planet</th><th>Score</th><th>Reasons</th></tr>' + E.ranked.map(function (r) { return '<tr><td><b>' + PN[r.code] + '</b></td><td class="mono">' + r.s.toFixed(1) + '</td><td class="w" style="font-size:12px">' + esc(r.why.join(' ')) + '</td></tr>'; }).join('') + '</table></div></div>';
  h += techBlock('Show the astrology behind this', tech);
  if (E.E.heal) h += '<div class="note" style="margin:0 2px 12px">Astrological timing only. Healing depends on treatment; follow the doctor.</div>';
  U.shareFn = function () { return E.E.l + ' on ' + N.dmyt(at) + '\n' + se.headline + '\nWhy: ' + se.reasons.join(' ') + '\n' + se.when.join('\n') + '\nDo: ' + se.do.join(' '); };
  return h + '</div>';
}
/* ---------- KP ---------- */
function kpDasha(c) { if (!c._kpMaha) c._kpMaha = J.dashas(c.birth, c.kp.P.Mo.lon); return c._kpMaha; }
TABF.kp = function (p, c, now) {
  var KPS = [['cusps', 'Cusps'], ['planets', 'Planets'], ['sig', '4-step'], ['houses', 'Houses'], ['rp', 'Ruling'], ['judge', 'Judge']], seg = U.kpseg, kk = c.kp, sig = c.sig;
  var h = '<div class="chips">' + KPS.map(function (x) { return '<button data-act="kpseg" data-v="' + x[0] + '" class="' + (seg === x[0] ? 'on' : '') + '">' + x[1] + '</button>'; }).join('') + '</div><div class="pad">';
  if (seg === 'cusps') {
    h += '<div class="card"><h3>Placidus cusps <span class="pill">KP ayanamsa</span></h3><div class="tw"><table><tr><th>Cusp</th><th>Sign</th><th>Degree</th><th>Sign L</th><th>Star L</th><th>Sub L</th><th>SS L</th></tr>' + kk.cusps.map(function (x) { return '<tr><td><b>' + x.house + '</b></td><td>' + SG3[x.sign] + '</td><td class="mono">' + x.degs + '</td><td>' + x.kp.sign + '</td><td>' + x.kp.star + '</td><td><b>' + x.kp.sub + '</b></td><td>' + x.kp.ss + '</td></tr>'; }).join('') + '</table></div><div class="note">KP ayanamsa ' + J.dms(kk.ayanamsa, true) + ' (' + (Math.floor(kk.ayanamsa)) + '°). The sub lord of a cusp decides whether that house’s matters are promised.</div></div>';
  } else if (seg === 'planets') {
    h += '<div class="card"><h3>Planets, KP lords</h3><div class="tw"><table><tr><th>Body</th><th>Sign</th><th>Degree</th><th>Sign L</th><th>Star L</th><th>Sub L</th><th>SS L</th><th>Bhava</th></tr>' + kk.planets.map(function (x) { return '<tr><td><b>' + x.code + '</b>' + (x.retro && x.code !== 'Ra' && x.code !== 'Ke' ? '<span class="r">R</span>' : '') + '</td><td>' + SG3[x.sign] + '</td><td class="mono">' + x.degs + '</td><td>' + x.kp.sign + '</td><td>' + x.kp.star + '</td><td><b>' + x.kp.sub + '</b></td><td>' + x.kp.ss + '</td><td>' + x.bhava + '</td></tr>'; }).join('') + '</table></div></div>';
  } else if (seg === 'sig') {
    J.PC.forEach(function (code) {
      var st = sig.steps[code];
      h += '<div class="card" style="padding:12px 14px"><div class="row" style="margin-bottom:6px"><div style="display:flex;gap:9px;align-items:center">' + pg(code, 30) + '<b>' + PN[code] + '</b></div><span class="hs">→ ' + sig.sig[code].join(' ') + '</span></div>' +
        '<div class="cbox"><i>1</i><div><b>' + PN[code] + ' itself</b><small>' + (st.planet.agentOf ? 'node, agent of ' + st.planet.agentOf.map(function (a) { return PN[a]; }).join(', ') : 'occupies ' + kk.P[code].bhava + ', owns ' + (sig.owns[code].join(', ') || 'no cusp')) + '</small></div><span class="hs">' + st.planet.houses.join(' ') + '</span></div>' +
        '<div class="cbox"><i>2</i><div><b>Star lord ' + PN[st.star.lord] + '</b><small>the result it gives</small></div><span class="hs">' + st.star.houses.join(' ') + '</span></div>' +
        '<div class="cbox"><i>3</i><div><b>Sub lord ' + PN[st.sub.lord] + '</b><small>decides good or bad</small></div><span class="hs">' + st.sub.houses.join(' ') + '</span></div>' +
        '<div class="cbox" style="margin-bottom:0"><i>4</i><div><b>Sub’s star ' + PN[st.subStar.lord] + '</b><small>the final outcome</small></div><span class="hs">' + st.subStar.houses.join(' ') + '</span></div></div>';
    });
  } else if (seg === 'houses') {
    h += '<div class="card"><h3>House significators</h3><div class="tw"><table><tr><th>H</th><th>A: in star of occupant</th><th>B: occupant</th><th>C: in star of owner</th><th>D: owner</th><th>Nodes</th><th>CSL</th></tr>' + sig.houses.map(function (x) { return '<tr><td><b>' + x.house + '</b></td><td>' + (x.A.join(' ') || '–') + '</td><td>' + (x.B.join(' ') || '–') + '</td><td>' + (x.C.join(' ') || '–') + '</td><td>' + x.D.join(' ') + '</td><td>' + (x.nodes.join(' ') || '–') + '</td><td><b>' + x.csl + '</b></td></tr>'; }).join('') + '</table></div><div class="note">Strength order: A, B, C, D. Nodes act for the planets they represent.</div></div>';
  } else if (seg === 'rp') {
    var L = DB.settings.loc, rp = J.rulingPlanets(now, L.lat, L.lon, locOff(), 'kp');
    h += '<div class="card"><h3>Ruling planets now</h3><div class="mut" style="font-size:12.5px;margin:-4px 0 8px">' + N.dmyt(now) + ' · ' + esc(L.name) + '</div>' + rp.list.map(function (x) { return '<div class="row" style="padding:7px 0;border-top:1px solid var(--line)"><span>' + x.role + '</span><b>' + PN[x.lord] + '</b></div>'; }).join('') + '<div class="verd good">Ruling set: ' + rp.set.map(function (x) { return PN[x]; }).join(', ') + '</div><div class="note">Dasha periods of these planets, when they also signify the matter, are the likely time of the event.</div></div>';
  } else {
    var L2 = DB.settings.loc, rp2 = J.rulingPlanets(now, L2.lat, L2.lon, locOff(), 'kp'), jm = N.judgeMatter(sig, U.kpm, kpDasha(c), now, 5, rp2.set);
    h += '<div class="card"><div class="field" style="margin-bottom:0"><span>QUESTION</span>' + sel('kpm', Object.keys(N.KP_MATTERS).map(function (x) { return [x, N.KP_MATTERS[x].l]; }), U.kpm) + '</div></div>';
    var wins = S.kpWindows(sig, jm.m, kpDasha(c), now, 36, 3, rp2.set), sk = S.kp(jm, U.kpm, wins, now);
    h += answerCard({ verdict: sk.verdict, label: sk.q, headline: sk.headline, meaning: sk.meaning, rows: [['When', sk.when, 'when'], ['Do', sk.do, 'do'], ['Avoid', sk.avoid, 'avoid']] });
    h += techBlock('Show the KP working', kpJudgeHtml(jm, rp2, now));
  }
  return h + '</div>';
};
ACT.kpseg = function (el) { U.kpseg = el.dataset.v; rerender(true); };
CHG.kpm = function (el) { U.kpm = el.value; rerender(true); };
function hsHtml(houses, m) { return houses.map(function (x) { return '<span class="' + (m.fav.indexOf(x) >= 0 ? 'f' : m.neg.indexOf(x) >= 0 ? 'x' : '') + '">' + x + '</span>'; }).join(' '); }
function kpJudgeHtml(jm, rp, now) {
  var m = jm.m, h = '';
  jm.js.forEach(function (j, idx) {
    var v = N.VERD[j.level];
    h += '<div class="card"><div class="row"><b>' + nth(j.cusp) + ' cusp sub lord: ' + PN[j.csl] + '</b>' + vchip(v[1], idx === 0 ? 'Main' : 'Support') + '</div><div class="mut" style="font-size:12px;margin:2px 0 8px">Favourable ' + m.fav.join(', ') + ' · against ' + m.neg.join(', ') + '</div>' +
      '<div class="cbox"><i>1</i><div><b>' + PN[j.csl] + '</b><small>planet</small></div><span class="hs">' + hsHtml(j.st.planet.houses, m) + '</span></div>' +
      '<div class="cbox"><i>2</i><div><b>Star ' + PN[j.st.star.lord] + '</b><small>result</small></div><span class="hs">' + hsHtml(j.st.star.houses, m) + '</span></div>' +
      '<div class="cbox"><i>3</i><div><b>Sub ' + PN[j.st.sub.lord] + '</b><small>quality</small></div><span class="hs">' + hsHtml(j.st.sub.houses, m) + '</span></div>' +
      '<div class="cbox" style="margin-bottom:0"><i>4</i><div><b>Sub’s star ' + PN[j.st.subStar.lord] + '</b><small>outcome</small></div><span class="hs">' + hsHtml(j.st.subStar.houses, m) + '</span></div>' +
      '<div class="verd ' + v[1] + '">' + v[0] + '. ' + (j.pf.length ? 'Signifies ' + j.pf.join(', ') + (j.pn.length ? ', but also ' + j.pn.join(', ') : '') + '.' : 'Does not signify ' + m.fav.join(', ') + '.') + '</div></div>';
  });
  var tw = N.topWindows(jm.timing, 6);
  h += '<div class="card"><h3>When</h3>' + (tw.length ? '<div class="tl">' + tw.map(function (w) { return '<span class="d">' + N.dmY(w.start) + ' ' + String(loc2y(w.start)).slice(2) + '</span><span><b>' + PN[w.md] + ' › ' + PN[w.ad] + ' › ' + PN[w.pd] + '</b>' + (w.rank === 2 ? ' <span class="tag g">best</span>' : '') + ' <span class="mut">until ' + N.dmy(w.end) + '</span>' + ((rp.set.indexOf(w.ad) >= 0 || rp.set.indexOf(w.pd) >= 0) ? ' <span class="tag">RP</span>' : '') + '</span>'; }).join('') + '</div>' : '<p>No period in the window both signifies the matter and is free of strong denial.</p>') + '<div class="note">Windows are dasha › bhukti › antara periods whose lords signify the favourable houses. RP = also a ruling planet now.</div></div>';
  return h;
}
function loc2y(d) { return new Date(d.getTime() + locOff() * 3600e3).getUTCFullYear(); }

/* ---------- Ashtakavarga ---------- */
function avWord(v) { return v >= 30 ? ['Strong', 'g', 'gives results with little effort'] : v >= 28 ? ['Good', 'g', 'supports you well'] : v >= 25 ? ['Average', 'm', 'works with steady effort'] : v >= 22 ? ['Weak', 'b', 'needs care, patience and remedies'] : ['Very weak', 'b', 'is a sensitive area; avoid risks here'] ; }
TABF.av = function (p, c, now) {
  var k = c.k, av = c.av, sav = av.sav, h = '<div class="pad">', nums = [];
  for (var i = 1; i <= 12; i++) nums.push(sav[(k.ascSign + i - 1) % 12]);
  var signs = []; for (var j = 0; j < 12; j++) signs.push((k.ascSign + j) % 12);
  h += '<div class="card" style="padding:10px"><div class="ctitle">Sarvashtakavarga by house · total ' + sav.reduce(function (a, b) { return a + b; }, 0) + '</div>' + Charts.north([], signs, { nums: nums, numCls: function (v) { return v >= 28 ? 'hi' : v < 25 ? 'lo' : ''; } }) + '<div class="note" style="text-align:center">Average is 28 per house. Green 28+, red below 25.</div></div>';
  h += '<div class="card"><h3>What each house tells you</h3>';
  nums.forEach(function (v, i) { var w = avWord(v), hh = i + 1, pct = Math.min(100, Math.round(v / 45 * 100)), col = w[1] === 'g' ? 'var(--good)' : w[1] === 'm' ? 'var(--warn)' : 'var(--bad)';
    h += '<div class="hrow"><span class="hn">' + hh + '</span><div><b>' + esc(cap(KB.HOUSE[hh].topic.split(',').slice(0, 3).join(','))) + '</b><small>' + SG[signs[i]] + ' · ' + w[0] + ': this area ' + w[2] + '.</small><div class="bar"><i style="width:' + pct + '%;background:' + col + '"></i></div></div><span class="sv" style="color:' + col + '">' + v + '</span></div>'; });
  var s11 = nums[10], s12 = nums[11], s1 = nums[0], s10 = nums[9];
  h += '<div class="note">Checks: 11th (' + s11 + ') ' + (s11 > s12 ? '>' : '≤') + ' 12th (' + s12 + ') means income ' + (s11 > s12 ? 'beats' : 'does not beat') + ' expenses. 10th (' + s10 + ') ' + (s10 >= 28 ? 'supports' : 'needs effort for') + ' career. Lagna (' + s1 + ') ' + (s1 >= 28 ? 'gives good resilience.' : 'asks you to protect your energy.') + '</div></div>';
  /* transit use */
  var tr = N.transitAt(c, now).filter(function (x) { return x.bav != null && x.code !== 'Mo'; });
  h += '<div class="card"><h3>Using it for transits now</h3>' + tr.map(function (x) { return '<div class="pc-row">' + itemIcon(x.bav >= 5 ? 'pro' : x.bav <= 3 ? 'con' : 'info') + '<span><b>' + PN[x.code] + ' in ' + SG[x.sign] + ':</b> ' + x.bav + ' of 8 in its own chart, ' + sav[x.sign] + ' in total. ' + (x.bav >= 5 ? 'Gives good results there.' : x.bav <= 3 ? 'Weak support; results come slowly.' : 'Average.') + '</span></div>'; }).join('') + '<div class="note">A planet gives good results while it moves through signs where it has 5 or more bindus in its own Ashtakavarga.</div></div>';
  /* BAV table */
  h += '<div class="card"><h3>Bhinnashtakavarga (by sign)</h3><div class="tw"><table><tr><th></th>' + SG3.map(function (s, i) { return '<th style="' + (i === k.ascSign ? 'color:var(--acc)' : '') + '">' + s + '</th>'; }).join('') + '<th>Tot</th></tr>' + J.P7.map(function (code) { var r = av.bav[code]; return '<tr><td><b>' + code + '</b></td>' + r.map(function (v) { return '<td class="mono" style="color:' + (v >= 5 ? 'var(--good)' : v <= 2 ? 'var(--bad)' : 'inherit') + '">' + v + '</td>'; }).join('') + '<td class="mono"><b>' + r.reduce(function (a, b) { return a + b; }, 0) + '</b></td></tr>'; }).join('') + '<tr><td><b>SAV</b></td>' + sav.map(function (v) { return '<td class="mono"><b>' + v + '</b></td>'; }).join('') + '<td class="mono"><b>' + sav.reduce(function (a, b) { return a + b; }, 0) + '</b></td></tr></table></div></div>';
  return h + '</div>';
};

/* ---------- Varshphal ---------- */
var MUNTHA_H = { 1: ['good', 'health, recognition and fresh starts'], 2: ['good', 'money and family gains'], 3: ['good', 'courage, effort and short travel pay off'], 4: ['bad', 'worries at home, property or mother'], 5: ['good', 'children, learning and enjoyment'], 6: ['bad', 'illness, debts and opponents need watching'], 7: ['bad', 'strain with partner, travel'], 8: ['bad', 'obstacles, health and sudden events'], 9: ['good', 'fortune, blessings and long travel'], 10: ['good', 'career rise and honour'], 11: ['good', 'gains and wishes fulfilled'], 12: ['bad', 'expenses and losses'] };
TABF.varsh = function (p, c, now) {
  var cur = age(p, now); if (U.vage == null || U.vageFor !== p.id) { U.vage = cur; U.vageFor = p.id; }
  var a = U.vage, vp = J.varshphal(c.k, c.birth, a, +p.lat, +p.lon), V = vp.chart, k = c.k;
  var h = '<div class="tabs">' + [cur - 2, cur - 1, cur, cur + 1, cur + 2, cur + 3].filter(function (x) { return x >= 0; }).map(function (x) { return '<button data-act="vage" data-v="' + x + '" class="' + (x === a ? 'on' : '') + '">Age ' + x + (x === cur ? ' · now' : '') + '</button>'; }).join('') + '</div><div class="pad">';
  var yl = vp.yearLord, ylp = V.P[yl], mh = MUNTHA_H[vp.munthaHouse], fw = N.funcWord(c, yl);
  h += '<div class="card dark"><div class="lbl">Varsha pravesh</div><div style="font:600 17px var(--sans);margin:4px 0 3px">' + N.dmyt(vp.at) + '</div><p>Year ' + (a + 1) + ' of life, until ' + N.dmy(vp.end) + '. Varsha lagna ' + SG[V.ascSign] + ' ' + V.ascDeg + '.</p></div>';
  var rows = [{ h: 1, code: 'Asc', deg: V.ascDeg, cls: 'asc' }, { h: vp.munthaHouse, code: 'Mu', deg: '', cls: 'asc' }].concat(V.planets.map(function (x) { return { h: x.house, code: x.code, deg: J.dm(x.lon), r: x.retro && x.code !== 'Ra' && x.code !== 'Ke', cls: x.code === 'Mo' ? 'mo' : '' }; }));
  var signs = []; for (var i = 0; i < 12; i++) signs.push((V.ascSign + i) % 12);
  h += '<div class="card" style="padding:10px">' + Charts.north(rows, signs) + '<div class="note" style="text-align:center">Mu = Muntha</div></div>';
  h += '<div class="card"><h3>Reading of the year</h3>' +
    '<div class="pc-row">' + itemIcon(mh[0] === 'good' ? 'pro' : 'con') + '<span><b>Muntha in ' + SG[vp.muntha] + ', ' + nth(vp.munthaHouse) + ' house of the year:</b> ' + mh[1] + '.</span></div>' + whyBox(['Muntha = natal lagna ' + SG[k.ascSign] + ' + ' + a + ' signs. It falls in your natal ' + nth(vp.munthaNatalHouse) + ' (' + N.houseTopic(vp.munthaNatalHouse).split(',').slice(0, 2).join(',') + ').']) +
    '<div class="pc-row">' + itemIcon(['Exalted', 'Own sign', 'Moolatrikona', 'Friendly sign'].indexOf(ylp.dignity) >= 0 ? 'pro' : ylp.dignity === 'Debilitated' || ylp.dignity === 'Enemy sign' ? 'con' : 'info') + '<span><b>Year lord ' + PN[yl] + '</b> in ' + SG[ylp.sign] + ', ' + nth(ylp.house) + ' of the year (' + ylp.dignity.toLowerCase() + '): ' + esc(N.houseTopic(ylp.house).split(',').slice(0, 3).join(',')) + ' lead the year.</span></div>' + whyBox(['Strongest of the five office-bearers that aspect the varsha lagna.', 'For your ' + SG[k.ascSign] + ' lagna ' + PN[yl] + ' is functional ' + fw + '.']) +
    '<div class="pc-row">' + itemIcon('info') + '<span><b>Varsha lagna lord ' + PN[J.RULER[V.ascSign]] + '</b> in the ' + nth(V.P[J.RULER[V.ascSign]].house) + ' of the year.</span></div></div>';
  h += '<div class="card"><h3>Office-bearers (Panchadhikari)</h3><div class="tw"><table><tr><th>Office</th><th>Planet</th><th>Aspect to lagna</th><th>Strength</th></tr>' + vp.officers.map(function (o) { return '<tr><td>' + o.role + '</td><td><b>' + PN[o.lord] + '</b>' + (o.lord === yl ? ' <span class="tag g">year lord</span>' : '') + '</td><td>' + (o.aspect || 'none') + '</td><td class="mono">' + o.score.toFixed(1) + '</td></tr>'; }).join('') + '</table></div></div>';
  h += '<div class="card"><h3>Mudda dasha</h3>' + vp.mudda.map(function (d) { var isC = now >= d.start && now < d.end; return '<div class="drow ' + (isC ? 'cur' : d.end < now ? 'past' : '') + '"><span class="nm">' + PN[d.lord] + (isC ? '<span class="now">NOW</span>' : '') + '</span><span class="du">' + durStr(d.end - d.start) + '</span><span class="rg">' + N.dmy(d.start) + ' → ' + N.dmy(d.end) + '</span></div>'; }).join('') + '<div class="note">Cast for the birth place. Tajik rules (Neelakanthi). Year lord and Mudda dasha follow standard Tajik practice; verify critical calls against the natal dasha.</div></div>';
  return h + '</div>';
};
ACT.vage = function (el) { U.vage = +el.dataset.v; rerender(true); };

/* ---------- Remedies ---------- */
TABF.remedies = function (p, c, now) {
  var R = N.remedies(c, now), k = c.k, h = '<div class="pad">';
  var F = R.func, order = J.P7.slice().sort(function (a, b) { var o = { yogakaraka: 0, benefic: 1, mixed: 2, neutral: 3, malefic: 4 }; return o[F[a].kind] - o[F[b].kind]; });
  h += '<div class="card"><h3>Your lagna decides the remedies</h3><div class="mut" style="font-size:12.5px;margin:-4px 0 8px">' + SG[k.ascSign] + ' lagna. Strengthen functional benefics; calm functional malefics; never strengthen a malefic with its stone.</div><div class="tw"><table><tr><th>Planet</th><th>Nature</th><th>Rules</th><th>Placed</th></tr>' + order.map(function (x) { var f = F[x]; return '<tr><td><b>' + PN[x] + '</b></td><td><span class="tag ' + (f.kind === 'malefic' ? 'b' : f.kind === 'benefic' || f.kind === 'yogakaraka' ? 'g' : '') + '">' + f.kind + (f.maraka ? ' · maraka' : '') + '</span></td><td>' + (f.houses.join(', ') || '–') + '</td><td>' + nth(k.P[x].house) + ', ' + k.P[x].dignity.replace(' sign', '') + '</td></tr>'; }).join('') + '</table></div><div class="note">Badhaka: ' + nth(F.badhaka.house) + ' lord ' + PN[F.badhaka.lord] + '. Maraka = 2nd/7th lord.</div></div>';
  h += '<div class="card"><h3>Right now</h3>';
  R.plan.forEach(function (x) {
    var mode = { strengthen: ['Strengthen', 'g'], calm: ['Calm', 'b'], both: ['Strengthen and calm', 'm'], balance: ['Balance', 'm'] }[x.mode];
    h += '<div class="gem"><span class="gi" style="background:' + PCOL[x.code] + ';color:#fff;font-size:11px">' + x.code + '</span><div><b>' + PN[x.code] + ' <span class="vc ' + mode[1] + '" style="margin-left:4px">' + mode[0] + '</span></b><small>' + esc(x.why) + '</small>' +
      '<small><b>Mantra:</b> ' + esc(x.mantra[0]) + ' (108 daily; full japa ' + x.mantra[1].toLocaleString('en-IN') + ')</small><small><b>Daan:</b> ' + esc(x.daan[0]) + ' on ' + x.daan[1] + '</small><small><b>Fast:</b> ' + x.fast + '</small><small><b>Lal Kitab:</b> ' + esc(x.lalkitab) + '</small></div></div>';
  });
  h += '</div>';
  h += '<div class="card"><h3>Gemstones</h3>' + R.gems.map(function (g) { var col = g.kind === 'yes' ? ['var(--goodS)', 'var(--good)', '✓'] : g.kind === 'care' ? ['var(--warnS)', 'var(--warn)', '!'] : ['var(--badS)', 'var(--bad)', '✕']; return '<div class="gem"><span class="gi" style="background:' + col[0] + ';color:' + col[1] + '">' + col[2] + '</span><div><b>' + esc(g.gem) + ' · ' + PN[g.code] + '</b><small>' + esc(g.why) + '</small>' + (g.kind !== 'no' ? '<small class="mut">' + esc(g.how) + '. Upratna: ' + esc(g.up) + '.</small>' : '') + '</div></div>'; }).join('') + '<div class="note">Wear a stone only after a trial period of a few days, and stop if things turn worse.</div></div>';
  h += '<div class="card"><h3>Rudraksha</h3>' + R.rudraksha.map(function (x) { return '<div class="pc-row">' + itemIcon('pro') + '<span><b>' + x.bead + '</b> for ' + PN[x.code] + ' (' + F[x.code].kind + ')</span></div>'; }).join('') + '<div class="pc-row">' + itemIcon('info') + '<span><b>5 Mukhi</b> is safe for everyone for general peace.</span></div></div>';
  h += '<div class="card"><h3>Crystals</h3>' + R.crystals.map(function (x) { return '<div class="pc-row">' + itemIcon('pro') + '<span><b>' + esc(x.stone) + '</b> for ' + PN[x.code] + '</span></div>'; }).join('') + '</div>';
  h += '<div class="card"><h3>Lal Kitab, by placement</h3>' + R.lalkitab.map(function (x) { return '<div class="pc-row">' + itemIcon('info') + '<span><b>' + PN[x.code] + ' in house ' + x.house + ':</b> ' + esc(x.text) + '</span></div>'; }).join('') + '<div class="note">Remedies are traditional and chosen here by your chart’s logic. No remedy can be guaranteed; use them with regular effort and, for health, with medical care.</div></div>';
  return h + '</div>';
};

/* ---------- Yogas ---------- */
TABF.yogas = function (p, c) {
  var y = c.yogas, good = y.filter(function (x) { return ['raja', 'dhana', 'mahapurusha', 'good'].indexOf(x.kind) >= 0; }), bad = y.filter(function (x) { return x.kind === 'dosha' || x.kind === 'weak'; }), mild = y.filter(function (x) { return x.kind === 'mild'; });
  var h = '<div class="pad">';
  h += '<div class="card"><h3>Yogas that help <span class="vc g">' + good.length + '</span></h3>' + (good.map(function (x) { return '<div class="pc-row">' + itemIcon('pro') + '<span><b>' + esc(x.name) + '</b></span></div>' + whyBox([x.why]); }).join('') || '<p class="mut">None of the listed classical yogas.</p>') + '</div>';
  h += '<div class="card"><h3>Doshas and weak points <span class="vc b">' + (bad.length + mild.length) + '</span></h3>' + (bad.concat(mild).map(function (x) { return '<div class="pc-row">' + itemIcon(x.kind === 'mild' ? 'info' : 'con') + '<span><b>' + esc(x.name) + (x.kind === 'mild' ? ' (mild)' : '') + '</b></span></div>' + whyBox([x.why]); }).join('') || '<p class="mut">No major dosha found.</p>') + '</div>';
  return h + '<div class="note" style="margin:0 18px 14px">A yoga gives results mainly in the dashas of the planets that form it.</div></div>';
};

/* ---------- Birth time sensitivity ---------- */
TABF.btime = function (p, c) {
  var t = N.tolerances(c), h = '<div class="pad"><div class="card"><h3>How exact must the birth time be?</h3><div class="mut" style="font-size:12.5px;margin:-4px 0 10px">Minutes the birth time can move earlier or later before each value changes.</div><div class="tw"><table><tr><th>Value</th><th>Earlier</th><th>Later</th><th></th></tr>';
  t.forEach(function (r) { var mn = Math.min(r[1][0] == null ? 999 : r[1][0], r[1][1] == null ? 999 : r[1][1]), q = mn < 2 ? ['b', 'Fragile'] : mn < 10 ? ['m', 'Sensitive'] : ['g', 'Safe']; h += '<tr><td><b>' + r[0] + '</b></td><td class="mono">' + (r[1][0] == null ? '> 4 h' : r[1][0].toFixed(1) + ' min') + '</td><td class="mono">' + (r[1][1] == null ? '> 4 h' : r[1][1].toFixed(1) + ' min') + '</td><td><span class="vc ' + q[0] + '">' + q[1] + '</span></td></tr>'; });
  h += '</table></div><div class="note">If a value is fragile, readings based on it (for example D9 or D60, or the KP lagna sub lord) depend on a birth time correct to that many minutes. Check it against known life events in the Event tab.</div></div></div>';
  return h;
};

ACT.hubBack = function () { if (history.length > 1) history.back(); else go('astro'); };
