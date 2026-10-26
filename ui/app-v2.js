/* Trikaal v2: five sections — Astrology, Panchang, Dasha, Remedies, AI (Gemini, evidence-based) */
var E = makeEvidence(A, C, J, KB, N);
NAVS = [['astro', 'Astrology'], ['panchang', 'Panchang'], ['dasha', 'Dasha'], ['remedies', 'Remedies'], ['ai', 'AI']];
IC.astro = IC.kundli; IC.panchang = IC.today;
IC.dasha = '<path d="M4 6h16M4 12h11M4 18h6"/>';
IC.remedies = '<path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z"/>';
IC.ai = '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>';
IC.gear = '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>';
function curP() { return person(U.cur) || me(); }
function topBar(title, opts) {
  opts = opts || {}; var p = curP();
  return '<div class="v2top"><h1>' + esc(title) + '</h1><div class="v2r">' + (opts.right || '') + (opts.noPerson || !p ? '' : '<button class="v2pill" data-act="pickPerson">' + esc(p.name.split(' ')[0]) + ' ▾</button>') + '<button class="v2ib" data-go="more" aria-label="Settings">' + icon('gear', 19) + '</button></div></div>';
}
function noPerson() { return emptyState('Add your kundli', 'Enter date, time and place of birth. Everything is calculated on your phone.', '<br><button class="btn acc" data-go="edit/new">Add kundli</button>'); }
ACT.pickPerson = function () {
  sheet('<div class="pad"><h3 style="font:600 18px var(--sans);margin:4px 0 10px">Choose person</h3>' + DB.people.map(function (x) { return '<button class="prow" data-act="setCur" data-v="' + x.id + '"><span class="av" style="background:' + avColor(x.id) + '">' + esc(initials(x.name)) + '</span><div><b>' + esc(x.name) + (x.id === DB.settings.meId ? ' ★' : '') + '</b><small>' + esc(birthLine(x)) + '</small></div><span></span></button>'; }).join('') +
    '<div class="grid2" style="margin-top:6px"><button class="btn acc" data-act="newPerson">+ New kundli</button><button class="btn sec" data-act="managePeople">Manage</button></div></div>');
};
ACT.setCur = function (el) { U.cur = el.dataset.v; closeSheet(); setTimeout(function () { rerender(); }, 20); };
ACT.newPerson = function () { closeSheet(true); go('edit/new'); };
ACT.managePeople = function () { closeSheet(true); go('people'); };

/* ---------- routing ---------- */
function render() {
  applySettings();
  var p = parts(), scr = p[0] || 'astro', html = '', navOn = scr;
  try {
    if (scr === 'p') { var pp = person(p[1]); if (!pp) { go('astro'); return; } U.cur = pp.id; html = Hub(pp, p[2] || 'report'); navOn = p[2] === 'dasha' ? 'dasha' : 'astro'; }
    else if (scr === 'edit') { html = EditScreen(p[1]); navOn = 'astro'; }
    else if (scr === 'people') { html = PeopleScreen(); navOn = 'astro'; }
    else if (scr === 'today') { html = TodayScreen(p[1] || U.tseg); navOn = 'panchang'; }
    else if (scr === 'more') { html = MoreScreen(); navOn = ''; }
    else if (scr === 'panchang') html = PanchangV2();
    else if (scr === 'dasha') html = DashaV2();
    else if (scr === 'remedies') html = RemediesV2();
    else if (scr === 'remedy') { html = RemedyEdit(p[1]); navOn = 'remedies'; }
    else if (scr === 'ai') html = AiV2();
    else { html = AstroV2(p[1]); navOn = 'astro'; }
  } catch (e) { html = '<div class="empty"><h2>Something went wrong</h2>' + esc(e.message) + '<br><br><button class="btn" data-go="astro">Back</button></div>'; if (window.console) console.error(e); }
  $('#app').innerHTML = html;
  $('#nav').innerHTML = NAVS.map(function (x) { return '<button data-go="' + x[0] + '" class="' + (x[0] === navOn ? 'on' : '') + '">' + icon(x[0]) + x[1] + '</button>'; }).join('');
  document.body.classList.toggle('asking', scr === 'ai');
  var ap = $('#askbar'); if (ap) ap.classList.toggle('hide', scr !== 'ai');
  (U.after || []).forEach(function (f) { try { f(); } catch (e) { } }); U.after = [];
  var on = document.querySelector('.chips button.on, .tabs button.on'); if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', inline: 'center' });
}

/* ---------- 1. Astrology ---------- */
function miniNorth(rows, asc) {
  var KHm = { 1: [200, 100], 2: [100, 45], 3: [45, 100], 4: [100, 200], 5: [45, 300], 6: [100, 355], 7: [200, 300], 8: [300, 355], 9: [355, 300], 10: [300, 200], 11: [355, 100], 12: [300, 45] };
  var s = '<svg class="mk" viewBox="0 0 400 400"><rect x="2" y="2" width="396" height="396" rx="10" fill="#fff" stroke="#B9AD98" stroke-width="3"/><path d="M2 2L398 398M398 2L2 398M200 2L398 200L200 398L2 200Z" stroke="#DCCFB8" stroke-width="3" fill="none"/>';
  for (var h = 1; h <= 12; h++) { var l = rows.filter(function (r) { return r.h === h; }), g = KHm[h], lh = 42; l.forEach(function (r, i) { s += '<text x="' + g[0] + '" y="' + (g[1] - (l.length - 1) * lh / 2 + i * lh + 14) + '" text-anchor="middle" style="font:700 38px Inter,sans-serif;fill:' + (r.code === 'Asc' ? '#C8701E' : '#1F1B16') + '">' + (r.code === 'Asc' ? 'As' : r.code) + '</text>'; }); }
  return s + '</svg>';
}
var MINI = [['D1', 'Rashi'], ['D9', 'Navamsha'], ['D10', 'Career'], ['CH', 'Chalit'], ['MO', 'Moon'], ['SU', 'Sun'], ['D2', 'Wealth'], ['D3', 'Siblings'], ['D4', 'Property'], ['D7', 'Children'], ['D12', 'Parents'], ['D16', 'Comforts'], ['D20', 'Spiritual'], ['D24', 'Education'], ['D27', 'Strength'], ['D30', 'Illness'], ['D40', 'Maternal'], ['D45', 'Character'], ['D60', 'Past karma']];
var SECTIONS = [['planets', 'Planets in detail', 'Each planet: role, strength, effect, timing'], ['kp', 'KP system', 'Cusps, sub lords, 4-step, judgement'], ['av', 'Ashtakavarga', 'Points by house and planet'], ['transit', 'Transits, month by month', 'Good or bad for you, and why'], ['varsh', 'Varshphal', 'Your year, birthday to birthday'], ['yogas', 'Yogas and doshas', ''], ['health', 'Health', 'House by house, next 6 months'], ['event', 'Why did this happen?', 'Analyse a past event'], ['report', 'Full reading', 'Point-by-point life reading'], ['btime', 'Birth time check', 'How exact the time must be']];
function AstroV2(id) {
  var p = curP(); if (!p) return topBar('Astrology', { noPerson: true }) + noPerson();
  var c = calcP(p), k = c.k; id = id || U.chart || 'D1'; U.chart = id;
  var h = topBar('Astrology');
  h += '<div class="chips v2chips">' + [['D1', 'D1 Rashi'], ['D9', 'D9'], ['D10', 'D10'], ['CH', 'Chalit'], ['MO', 'Moon'], ['ALL', 'All charts ›']].map(function (x) { return '<button data-go="astro/' + x[0] + '" class="' + (x[0] === id ? 'on' : '') + '">' + x[1] + '</button>'; }).join('') + '</div><div class="pad">';
  if (id === 'ALL') {
    h += '<div class="mgrid">' + MINI.map(function (x) { var m = chartModel(c, x[0]); return '<button data-go="astro/' + x[0] + '">' + miniNorth(m.rows, m.ascSign) + '<b>' + (x[0] === 'CH' ? 'Chalit' : x[0] === 'MO' ? 'Moon' : x[0] === 'SU' ? 'Sun' : x[0]) + '</b><small>' + x[1] + '</small></button>'; }).join('') + '</div>';
  } else {
    var style = U.style || DB.settings.style, m = chartModel(c, id);
    h += '<div class="card v2c" style="padding:10px">' + drawChart(m, style) + '<div class="v2cap"><span>' + esc(m.title) + '</span><span>' + esc(ayanShort()) + ' · <button style="text-decoration:underline;color:inherit" data-act="cstyle" data-v="' + (style === 'south' ? 'north' : 'south') + '">' + (style === 'south' ? 'North' : 'South') + '</button></span></div></div>';
    var rows = id === 'D1' || id === 'MO' || id === 'SU' || id === 'CH' ? k.planets.map(function (x) { return { code: x.code, sign: x.sign, deg: J.dm(x.lon), h: id === 'CH' ? x.bhava : id === 'D1' ? x.house : J.houseFrom(m.ascSign, x.sign), nak: x.nak.name.replace('Uttara ', 'U.').replace('Purva ', 'P.') + ' ' + x.nak.pada, dig: x.dignity, r: x.retro && x.code !== 'Ra' && x.code !== 'Ke' }; }) :
      m.rows.slice(1).map(function (r) { var x = k.P[r.code]; return { code: r.code, sign: r.sign, deg: r.deg, h: r.h, nak: r.vg ? 'Vargottama' : '', dig: r.dig, r: r.r }; });
    var DT = { 'Exalted': ['tg', 'Exalted'], 'Moolatrikona': ['tg', 'Moola'], 'Own sign': ['tg', 'Own'], 'Friendly sign': ['tn', 'Friend'], 'Neutral sign': ['tn', 'Neutral'], 'Enemy sign': ['tr', 'Enemy'], 'Debilitated': ['tr', 'Debil.'] };
    h += '<div class="card" style="padding:6px 12px"><table class="v2t"><tr><th></th><th>Sign</th><th>Degree</th><th>H</th><th>' + (m.n ? '' : 'Nakshatra') + '</th><th></th></tr>' +
      '<tr><td><span class="pt" style="background:#C8701E">As</span></td><td>' + SG3[m.ascSign] + '</td><td>' + (m.ascV ? J.dm(m.ascV.deg) : k.ascDeg) + '</td><td>1</td><td>' + (m.n ? '' : k.ascNak.name.replace('Uttara ', 'U.').replace('Purva ', 'P.') + ' ' + k.ascNak.pada) + '</td><td></td></tr>' +
      rows.map(function (r) { var d = DT[r.dig] || ['tn', '']; return '<tr data-act="planetSheet" data-v="' + r.code + '"><td><span class="pt" style="background:' + PCOL[r.code] + '">' + r.code + '</span></td><td>' + SG3[r.sign] + '</td><td>' + r.deg + (r.r ? ' R' : '') + '</td><td>' + r.h + '</td><td>' + esc(r.nak) + '</td><td><span class="tag ' + d[0] + '">' + d[1] + '</span></td></tr>'; }).join('') + '</table></div>';
    h += '<div class="chips" style="padding:0 0 10px">' + CHARTS.filter(function (x) { return ['D1', 'D9', 'D10', 'CH', 'MO'].indexOf(x[0]) < 0; }).map(function (x) { return '<button data-go="astro/' + x[0] + '" class="' + (x[0] === id ? 'on' : '') + '">' + x[1] + '</button>'; }).join('') + '</div>';
  }
  h += '<div class="card v2list">' + SECTIONS.map(function (s) { return '<button data-go="p/' + p.id + '/' + s[0] + '"><div><b>' + s[1] + '</b>' + (s[2] ? '<small>' + s[2] + '</small>' : '') + '</div><span>›</span></button>'; }).join('') + '</div>';
  return h + '</div>';
}

/* ---------- 2. Panchang ---------- */
function PanchangV2() {
  var L = DB.settings.loc, d0 = todayStart(U.dayOff), pc = J.panchang(d0, L.lat, L.lon), off = locOff(), wd = new Date(pc.rise.getTime() + off * 3600e3).getUTCDay(), now = new Date();
  var lm = J.lunarMonth(pc.rise), sv = J.samvat(pc.rise, lm.name), parts = J.dayParts(pc.rise, pc.set, wd), cg = J.choghadiya(pc.rise, pc.set, pc.nextRise, wd), vs = J.vishtiWindows(pc.rise, pc.set);
  var h = topBar('Panchang', { noPerson: true, right: '<button class="v2pill" data-act="pickLoc">' + esc(L.name) + ' ▾</button>' }) + '<div class="pad">';
  h += '<div class="v2date"><button class="v2ib" data-act="dayOff" data-v="-1">' + icon('chevL', 18) + '</button><div><b>' + J.VARAS[wd] + ', ' + N.dmy(new Date(pc.rise.getTime())) + '</b>' + (U.dayOff ? '<button class="mut" style="display:block;margin:2px auto 0;font-size:12px;text-decoration:underline" data-act="dayOff" data-v="0">Back to today</button>' : '<small>Today</small>') + '</div><button class="v2ib" data-act="dayOff" data-v="1">' + icon('chevR', 18) + '</button></div>';
  h += '<div class="v2hero"><div class="lbl">' + lm.name + (lm.adhik ? ' (Adhik)' : '') + ' · Vikram ' + sv.vikram + ' · Shaka ' + sv.shaka + '</div><h2>' + pc.tithi.paksha + ' ' + pc.tithi.name + '</h2><p>Moon in ' + SG[pc.moonSign] + ' · Sunrise ' + N.hm(pc.rise) + ' · Sunset ' + N.hm(pc.set) + '</p></div>';
  var nextT = J.tithiAt(new Date(pc.tithiEnd.getTime() + 60e3));
  h += '<div class="limb">' + [['Tithi', pc.tithi.name, 'till ' + N.hm(pc.tithiEnd) + (pc.tithiEnd > pc.nextRise ? ' tomorrow' : ', then ' + nextT.name)], ['Nakshatra', pc.nak.name, 'till ' + N.hm(pc.nakEnd) + (pc.nakEnd > pc.nextRise ? ' tomorrow' : '') + ' · lord ' + PN[pc.nak.lord]], ['Yoga', pc.yoga.name, 'till ' + N.hm(pc.yogaEnd) + (pc.yogaEnd > pc.nextRise ? ' tomorrow' : '')], ['Karana', pc.karana.name, 'till ' + N.hm(pc.karanaEnd)], ['Vara', J.VARAS[wd], 'lord ' + PN[J.VARA_LORD[wd]]], ['Moon', pc.moonrise ? N.hm(pc.moonrise) + ' rise' : '–', 'sets ' + (pc.moonset ? N.hm(pc.moonset) : '–')]].map(function (x) { return '<div><small>' + x[0] + '</small><b>' + x[1] + '</b><small>' + x[2] + '</small></div>'; }).join('') + '</div>';
  /* day bar */
  var len = pc.set - pc.rise, seg = function (w) { return { a: Math.max(0, (w.start - pc.rise) / len * 100), b: Math.min(100, (w.end - pc.rise) / len * 100) }; };
  var bad = [['Rahu Kaal', parts.rahu, '#C0392B'], ['Yamaganda', parts.yama, '#E6B0A8'], ['Gulika', parts.gulika, '#E6B0A8']].concat(vs.map(function (w) { return ['Bhadra', w, '#E9A15A']; })), good = parts.abhijit.wednesday ? [] : [['Abhijit', parts.abhijit, '#7FBF96']];
  var bar = '<div class="dbar">' + bad.concat(good).map(function (x) { var s = seg(x[1]); return s.b > s.a ? '<i style="left:' + s.a + '%;width:' + (s.b - s.a) + '%;background:' + x[2] + '"></i>' : ''; }).join('') + (now > pc.rise && now < pc.set && !U.dayOff ? '<em style="left:' + ((now - pc.rise) / len * 100) + '%"></em>' : '') + '</div>';
  h += '<div class="card"><div class="lbl">The day, ' + N.hm(pc.rise) + ' – ' + N.hm(pc.set) + '</div>' + bar + '<div class="legend">' + bad.concat(good).map(function (x) { return '<span><i style="background:' + x[2] + '"></i>' + x[0] + ' ' + N.hm(x[1].start) + '–' + N.hm(x[1].end) + '</span>'; }).join('') + '<span><i style="background:#F1E9DA"></i>Brahma muhurta ' + N.hm(parts.brahma.start) + '</span></div></div>';
  function clash(x) { return [parts.rahu, parts.yama, parts.gulika].concat(vs).some(function (w) { return x.start < w.end && w.start < x.end; }); }
  h += '<div class="card"><div class="lbl">Choghadiya · day</div>' + cg.day.map(function (x) { var c2 = x.q === 'good' && clash(x); return '<div class="row' + (now >= x.start && now < x.end ? ' nowr' : '') + '"><span>' + x.name + '</span><b style="color:' + (x.q === 'good' ? (c2 ? 'var(--warn)' : 'var(--good)') : x.q === 'bad' ? 'var(--bad)' : 'var(--mut)') + '">' + N.hm(x.start) + ' – ' + N.hm(x.end) + (c2 ? ' · clashes with a bad period' : '') + '</b></div>'; }).join('') + '<div class="lbl" style="margin-top:12px">Night</div>' + cg.night.map(function (x) { return '<div class="row"><span>' + x.name + '</span><b style="color:' + (x.q === 'good' ? 'var(--good)' : x.q === 'bad' ? 'var(--bad)' : 'var(--mut)') + '">' + N.hm(x.start) + ' – ' + N.hm(x.end) + '</b></div>'; }).join('') + '</div>';
  var hs = J.horas(pc.rise, pc.set, pc.nextRise, wd);
  h += '<div class="card"><div class="lbl">Hora</div><div class="chog" style="margin-top:8px">' + hs.slice(0, 12).map(function (x) { return '<div class="cg ' + (['Ju', 'Ve', 'Me', 'Mo'].indexOf(x.lord) >= 0 ? 'g' : x.lord === 'Sa' || x.lord === 'Ma' ? 'b' : 'm') + (now >= x.start && now < x.end ? ' nowc' : '') + '">' + PN[x.lord] + '<span>' + N.hm(x.start) + '</span></div>'; }).join('') + '</div><div class="note">Disha shool: ' + KB.DISHA_SHOOL[wd] + '.</div></div>';
  h += '<div class="card v2list"><button data-go="today/day"><div><b>My day</b><small>Today’s verdict for ' + esc((me() || { name: 'you' }).name.split(' ')[0]) + '</small></div><span>›</span></button><button data-go="today/muhurat"><div><b>Muhurat finder</b><small>Best dates for purchases, deals, travel</small></div><span>›</span></button><button data-go="today/prashna"><div><b>KP Prashna</b><small>Horary 1 to 249</small></div><span>›</span></button></div>';
  return h + '</div>';
}

/* ---------- 3. Dasha ---------- */
function DashaV2() {
  var p = curP(); if (!p) return topBar('Dasha', { noPerson: true }) + noPerson();
  var c = calcP(p), now = new Date(), ch = J.dashaChain(c.maha, now, 5), h = topBar('Dasha') + '<div class="pad">';
  h += '<div class="card"><div class="lbl">Running now · ' + N.dmyt(now) + '</div>' + ch.map(function (x, i) { var pr = Math.max(0, Math.min(100, (now - x.start) / (x.end - x.start) * 100)); return '<div class="dl2"><span class="pt" style="background:' + PCOL[x.lord] + '">' + x.lord + '</span><div><b>' + LVL[i] + ' · ' + PN[x.lord] + '</b><div class="prog"><i style="width:' + pr.toFixed(1) + '%"></i></div></div><span class="sm">to ' + (i < 3 ? N.dmy(x.end) : N.dmY(x.end) + ', ' + N.hm(x.end)) + '</span></div>'; }).join('') + '</div>';
  var path = U.dpath, list = c.maha.filter(function (d) { return d.start < new Date(c.birth.getTime() + 121 * 365.25 * 864e5); }), crumbs = [['', 'Mahadashas']], parent = null;
  for (var i = 0; i < path.length; i++) { var pick = list.filter(function (d) { return d.lord === path[i]; })[0]; if (!pick) { U.dpath = path = path.slice(0, i); break; } parent = pick; crumbs.push([path.slice(0, i + 1).join(','), PN[pick.lord]]); list = J.subPeriods(pick); }
  if (!path.length && !U.dpathTouched) { U.dpath = [ch[0].lord]; U.dpathTouched = true; return DashaV2(); }
  h += '<div class="crumbs">' + crumbs.map(function (x) { return '<button data-act="dcrumb2" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>';
  h += '<div class="card" style="padding:4px 14px"><div class="lbl" style="padding:10px 0 4px">' + (parent ? LVL[path.length] + 's in ' + PN[parent.lord] + ' ' + LVL[path.length - 1] : 'Mahadashas') + '</div>';
  list.forEach(function (d) {
    var cur = now >= d.start && now < d.end, past = d.end < now, lvl = path.length;
    h += '<button class="drow2' + (cur ? ' cur' : '') + (past ? ' past' : '') + '" ' + (lvl < 4 ? 'data-act="ddown2" data-v="' + d.lord + '"' : '') + '><span class="pt" style="background:' + PCOL[d.lord] + '">' + d.lord + '</span><div><b>' + PN[d.lord] + (cur ? ' <span class="now">NOW</span>' : '') + '</b><small>' + (lvl >= 2 ? N.dmyt(d.start) + ' → ' + N.dmyt(d.end) : N.dmy(d.start) + ' → ' + N.dmy(d.end)) + '</small>' + (lvl < 2 ? '<small>' + esc(N.lordNote(c, d.lord)) + ' · ' + N.funcWord(c, d.lord) + '</small>' : '') + '</div><span class="sm">' + durStr(d.end - d.start) + (lvl < 4 ? ' ›' : '') + '</span></button>';
  });
  h += '</div><div class="v2seg"><button class="on">Vimshottari</button><button data-act="toYogini">Yogini</button></div><div class="note" style="margin:6px 2px 14px">Tap a period to open its sub-periods, down to Prana. Dasha year: ' + DB.settings.dyear + ' days.</div>';
  return h + '</div>';
}
ACT.ddown2 = function (el) { U.dpath = U.dpath.concat([el.dataset.v]); U.dpathTouched = true; rerender(true); };
ACT.dcrumb2 = function (el) { U.dpath = el.dataset.v ? el.dataset.v.split(',') : []; U.dpathTouched = true; rerender(true); };
ACT.toYogini = function () { U.dsys = 'yog'; var p = curP(); go('p/' + p.id + '/dasha'); };

/* ---------- 4. Remedies ---------- */
var WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function dkey(d) { var x = new Date(d.getTime() + locOff() * 3600e3); return x.getUTCFullYear() + '-' + ('0' + (x.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + x.getUTCDate()).slice(-2); }
function dow(d) { return new Date(d.getTime() + locOff() * 3600e3).getUTCDay(); }
function remsFor(pid) { DB.remedies = DB.remedies || []; return DB.remedies.filter(function (r) { return r.pid === pid; }); }
function activeOn(r, d) { var k = dkey(d); if (r.from && k < r.from) return false; if (r.until && k > r.until) return false; return !r.days || !r.days.length || r.days.indexOf(dow(d)) >= 0; }
function streak(pid) {
  var rs = remsFor(pid), n = 0, d = new Date();
  var todayAll = rs.filter(function (r) { return activeOn(r, d); }), todayDone = todayAll.length && todayAll.every(function (r) { return r.done && r.done[dkey(d)]; });
  if (todayDone) n++;
  for (var i = 1; i < 400; i++) { d = new Date(Date.now() - i * 864e5); var due = rs.filter(function (r) { return activeOn(r, d) && (!r.created || r.created <= d.getTime() + 864e5); }); if (!due.length) continue; if (due.every(function (r) { return r.done && r.done[dkey(d)]; })) n++; else break; }
  return n;
}
function RemediesV2() {
  var p = curP(); if (!p) return topBar('Remedies', { noPerson: true }) + noPerson();
  var rs = remsFor(p.id), now = new Date(), today = rs.filter(function (r) { return activeOn(r, now); }), done = today.filter(function (r) { return r.done && r.done[dkey(now)]; }).length;
  var h = topBar('Remedies') + '<div class="pad">';
  if (!rs.length) h += '<div class="card"><b style="font:600 16px var(--sans)">No remedies yet</b><p class="sm" style="margin:6px 0 12px">Add your own, or start with the ones your chart suggests for this period.</p><button class="btn acc wide" data-act="addSuggested">Add suggested remedies for ' + esc(p.name.split(' ')[0]) + '</button></div>';
  else {
    var st = streak(p.id);
    h += '<div class="card"><div class="row" style="border:0;padding:0"><div><div class="lbl">Today · ' + J.VARAS[dow(now)] + '</div><div style="font:500 23px var(--serif);margin-top:3px">' + (today.length ? done + ' of ' + today.length + ' done' : 'Nothing due today') + '</div></div>' + (st ? '<div style="font:700 13px var(--sans);color:var(--acc)">🔥 ' + st + '-day streak</div>' : '') + '</div>' + (today.length ? '<div class="prog" style="height:9px;margin-top:10px"><i style="width:' + (done / today.length * 100) + '%"></i></div>' : '') + '</div>';
    if (today.length) h += '<div class="card">' + today.map(function (r) { var on = r.done && r.done[dkey(now)]; return '<div class="chk2"><button class="box2' + (on ? ' on' : '') + '" data-act="tickRem" data-v="' + r.id + '">' + (on ? '✓' : '') + '</button><button data-go="remedy/' + r.id + '" style="text-align:left"><b>' + esc(r.name) + (r.count > 1 ? ' · ' + r.count + '×' : '') + '</b><span>' + esc(remLine(r)) + '</span></button></div>'; }).join('') + '</div>';
    var later = rs.filter(function (r) { return today.indexOf(r) < 0; });
    if (later.length) h += '<div class="lbl" style="margin:14px 2px 8px">Other days</div><div class="card">' + later.map(function (r) { return '<button class="row" style="width:100%" data-go="remedy/' + r.id + '"><span style="text-align:left">' + esc(r.name) + '<br><small class="mut">' + esc(remLine(r)) + '</small></span><span class="tag tn">' + (r.planet ? PN[r.planet] : r.type) + '</span></button>'; }).join('') + '</div>';
    h += '<button class="btn sec wide" style="margin-top:4px" data-act="addSuggested">+ Add suggested remedies for my chart</button>';
  }
  return h + '<div style="height:70px"></div></div><button class="fab" data-go="remedy/new">+ Add remedy</button>';
}
function remLine(r) { var d = !r.days || !r.days.length || r.days.length === 7 ? 'Daily' : r.days.map(function (x) { return WD[x]; }).join(', '); return d + (r.time ? ' · ' + r.time : '') + (r.planet ? ' · ' + PN[r.planet] : '') + ' · ' + r.type + (r.until ? ' · till ' + r.until : '') + (r.note ? ' · ' + r.note : ''); }
ACT.tickRem = function (el) { var r = (DB.remedies || []).filter(function (x) { return x.id === el.dataset.v; })[0]; if (!r) return; r.done = r.done || {}; var k = dkey(new Date()); if (r.done[k]) delete r.done[k]; else r.done[k] = 1; save(); rerender(true); };
ACT.addSuggested = function () {
  var p = curP(), c = calcP(p), R = N.remedies(c, new Date()), added = 0; DB.remedies = DB.remedies || [];
  R.plan.forEach(function (x) {
    var dayIdx = WD.map(function (w) { return w; }).indexOf(x.daan[1].slice(0, 3));
    [{ name: x.mantra[0], type: 'Mantra', count: 108, days: [], note: (x.mode === 'calm' ? 'Calms ' : 'Strengthens ') + PN[x.code] + (x.why ? '. ' + x.why.trim() : '') }, { name: 'Donate ' + x.daan[0], type: 'Daan', count: 1, days: dayIdx >= 0 ? [dayIdx] : [], note: 'For ' + PN[x.code] }].forEach(function (r) {
      if (DB.remedies.some(function (y) { return y.pid === p.id && y.name === r.name; })) return;
      DB.remedies.push({ id: 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), pid: p.id, name: r.name, type: r.type, planet: x.code, days: r.days, count: r.count, time: '07:00', from: dkey(new Date()), until: '', note: r.note, done: {}, created: Date.now() }); added++;
    });
  });
  save(); scheduleAll(); toast(added ? 'Added ' + added + ' remedies' : 'Already added'); rerender(true);
};
var REDIT = null;
function RemedyEdit(id) {
  var r = (DB.remedies || []).filter(function (x) { return x.id === id; })[0];
  if (!REDIT || REDIT._for !== id) REDIT = r ? JSON.parse(JSON.stringify(r)) : { name: '', type: 'Mantra', planet: '', days: [], count: 1, time: '07:00', from: dkey(new Date()), until: '', note: '', remind: true };
  REDIT._for = id; var e = REDIT;
  var h = '<div class="v2top"><h1>' + (r ? 'Edit remedy' : 'New remedy') + '</h1><div class="v2r"><button class="v2pill" data-act="remCancel">Cancel</button></div></div><div class="pad">';
  h += '<label class="field"><span>WHAT</span><input class="inp" data-in="rf" data-f="name" value="' + esc(e.name) + '" placeholder="e.g. Feed jaggery to a cow"></label>';
  function opts(f, list, multi) { return '<div class="opts">' + list.map(function (o) { var on = multi ? e[f].indexOf(o[0]) >= 0 : e[f] === o[0]; return '<button data-act="rOpt" data-f="' + f + '" data-v="' + o[0] + '" data-m="' + (multi ? 1 : 0) + '" class="' + (on ? 'on' : '') + '">' + o[1] + '</button>'; }).join('') + '</div>'; }
  h += '<div class="field"><span>TYPE</span>' + opts('type', ['Mantra', 'Daan', 'Fast', 'Gemstone', 'Lal Kitab', 'Rudraksha', 'Puja', 'Other'].map(function (x) { return [x, x]; })) + '</div>';
  h += '<div class="field"><span>FOR PLANET</span>' + opts('planet', [['', 'Any']].concat(J.PC.map(function (x) { return [x, PN[x]]; }))) + '</div>';
  h += '<div class="field"><span>REPEAT ON (none selected = daily)</span>' + opts('days', [1, 2, 3, 4, 5, 6, 0].map(function (x) { return [x, WD[x]]; }), true) + '</div>';
  h += '<div class="grid2"><label class="field"><span>COUNT</span><input class="inp" type="number" min="1" data-in="rf" data-f="count" value="' + esc(e.count) + '"></label><label class="field"><span>REMINDER TIME</span><input class="inp" type="time" data-in="rf" data-f="time" value="' + esc(e.time) + '"></label></div>';
  h += '<div class="grid2"><label class="field"><span>FROM</span><input class="inp" type="date" data-in="rf" data-f="from" value="' + esc(e.from) + '"></label><label class="field"><span>UNTIL (optional)</span><input class="inp" type="date" data-in="rf" data-f="until" value="' + esc(e.until) + '"></label></div>';
  h += '<label class="field"><span>NOTE</span><input class="inp" data-in="rf" data-f="note" value="' + esc(e.note) + '" placeholder="Why I’m doing it"></label>';
  h += '<div class="set" style="border:0"><div><b>Phone reminder</b><small>Notification at the reminder time on the chosen days</small></div><button class="sw ' + (e.remind !== false ? 'on' : '') + '" data-act="rRemind"></button></div>';
  h += '<button class="btn acc wide" data-act="remSave">Save remedy</button>' + (r ? '<button class="btn danger wide" style="margin-top:10px" data-act="remDel">Delete</button>' : '');
  if (r) { var cnt = Object.keys(r.done || {}).length; h += '<div class="note" style="margin-top:12px">Done on ' + cnt + ' day' + (cnt === 1 ? '' : 's') + ' so far.</div>'; }
  return h + '<div style="height:30px"></div></div>';
}
INP.rf = function (el) { REDIT[el.dataset.f] = el.dataset.f === 'count' ? Math.max(1, +el.value || 1) : el.value; };
ACT.rOpt = function (el) { var f = el.dataset.f, v = f === 'days' ? +el.dataset.v : el.dataset.v; if (el.dataset.m === '1') { var i = REDIT[f].indexOf(v); if (i >= 0) REDIT[f].splice(i, 1); else REDIT[f].push(v); } else REDIT[f] = v; rerender(true); };
ACT.rRemind = function (el) { REDIT.remind = REDIT.remind === false; el.classList.toggle('on', REDIT.remind !== false); };
ACT.remCancel = function () { REDIT = null; go('remedies'); };
ACT.remSave = function () {
  var e = REDIT; if (!e.name.trim()) return toast('Write what the remedy is');
  DB.remedies = DB.remedies || []; var p = curP();
  var rec = { id: e.id || ('r' + Date.now().toString(36)), pid: e.pid || p.id, name: e.name.trim(), type: e.type, planet: e.planet, days: e.days.slice().sort(), count: +e.count || 1, time: e.time, from: e.from, until: e.until, note: e.note, remind: e.remind !== false, done: e.done || {}, created: e.created || Date.now() };
  var i = DB.remedies.map(function (x) { return x.id; }).indexOf(rec.id); if (i >= 0) DB.remedies[i] = rec; else DB.remedies.push(rec);
  save(); scheduleAll(); REDIT = null; toast('Remedy saved'); go('remedies');
};
ACT.remDel = function () { var id = REDIT.id; DB.remedies = (DB.remedies || []).filter(function (x) { return x.id !== id; }); try { if (AND && AND.cancelReminder) AND.cancelReminder(id); } catch (e) { } save(); REDIT = null; go('remedies'); };
function scheduleAll() {
  if (!AND || !AND.scheduleReminder) return;
  (DB.remedies || []).forEach(function (r) {
    try {
      if (r.remind === false || !r.time || (r.until && r.until < dkey(new Date()))) { AND.cancelReminder(r.id); return; }
      var t = r.time.split(':'), pn = person(r.pid); AND.scheduleReminder(r.id, r.name, (pn ? pn.name.split(' ')[0] + ' · ' : '') + (r.count > 1 ? r.count + '× · ' : '') + r.type, +t[0], +t[1], (r.days || []).join(','));
    } catch (e) { }
  });
}

/* ---------- 5. AI (Gemini) ---------- */
function geminiFormat(name) {
  return 'You are Trikaal, an expert Vedic astrologer (Parashari and KP). You are given an EVIDENCE SHEET computed precisely from the chart; positions are accurate to the arc-second. Use ONLY these numbers and dates. Never invent a position, aspect, dasha or date. If something is not in the sheet, say it is not available.\n' +
    'Before answering, reason through every layer in order: (1) D1 house, its lord and the karaka, with occupants, aspects and conjunctions; (2) the divisional chart for the topic and D9; (3) Mahadasha, Antardasha, Pratyantar, Sookshma and Prana lords and how each links to the topic houses; (4) transits, double transit and Ashtakavarga support; (5) functional nature for this lagna; (6) KP cusp sub lord where useful. Only conclude after weighing all layers; if layers disagree, say so and give the date when they agree.\n' +
    'Address the person warmly by first name (' + name + ') and answer in the language the user writes in. Use exactly these sections with bold titles:\n' +
    '**Quick Answer** two or three sentences: the verdict for the period asked, what to expect and the key date.\n' +
    '**A Quick Question** one short clarifying question only if it would genuinely change the answer; otherwise omit this section.\n' +
    '**Astrological Explanation** three to five short paragraphs in plain language, citing the actual chart facts (house, lord, divisional chart, each dasha level, aspects, transits, bindus).\n' +
    '**Key Dates** a short list of dates from the sheet with what happens.\n' +
    '**What to do** two to four practical steps, including remedies tied to the planets involved.\n' +
    '**Chain:** one line showing the reasoning, e.g. 10th house → lord Mars in 9th → D10 ... → Jupiter MD / Saturn AD / Saturn PD / Mercury SD → transit ... → result.\n' +
    'Be honest about uncertainty; never claim 100% certainty. For health, give astrological timing only and advise a doctor.\n\n' + E.RULES;
}
function askGemini(p, c, q) {
  var now = new Date(), ev = E.build(p, c, q, now), name = p.name.split(' ')[0];
  var hist = (DB.chats[p.id] || []).filter(function (m) { return m.text; }).slice(-9, -1).map(function (m) { return { role: m.role === 'me' ? 'user' : 'model', parts: [{ text: m.text.slice(0, 4000) }] }; });
  while (hist.length && hist[0].role !== 'user') hist.shift();
  var contents = hist.concat([{ role: 'user', parts: [{ text: 'EVIDENCE SHEET (computed now for this question)\n' + ev.text + '\n\nFULL CHART SUMMARY\n' + dossier(p, c) + '\n\nQUESTION: ' + q } ] }]);
  var model = DB.settings.gmodel || 'gemini-2.5-pro';
  var body = JSON.stringify({ system_instruction: { parts: [{ text: geminiFormat(name) }] }, contents: contents, generationConfig: { temperature: 0.35, maxOutputTokens: 8192 } });
  return http('POST', 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent', { 'content-type': 'application/json', 'x-goog-api-key': DB.settings.gkey }, body).then(function (r) {
    var d; try { d = JSON.parse(r.text); } catch (e) { throw new Error('Unexpected reply (' + r.status + ')'); }
    if (r.status !== 200) throw new Error((d.error && d.error.message) || ('HTTP ' + r.status));
    var cand = d.candidates && d.candidates[0], txt = cand && cand.content && cand.content.parts ? cand.content.parts.filter(function (x) { return x.text && !x.thought; }).map(function (x) { return x.text; }).join('\n') : '';
    if (!txt) throw new Error(cand && cand.finishReason ? 'No answer (' + cand.finishReason + ')' : 'Empty answer');
    return { txt: txt, ev: ev };
  });
}
function aiBubbles(txt, ev) {
  var chain = '', m = txt.match(/\*{0,2}Chain:?\*{0,2}:?\s*([\s\S]*)$/);
  if (m) { chain = m[1].trim(); txt = txt.slice(0, m.index); }
  var parts2 = txt.split(/\*{0,2}(Quick Answer|A Quick Question|Astrological Explanation|Key Dates|What to do)\*{0,2}:?/), out = '';
  if (parts2.length < 3) out = '<div class="msg bot sto">' + mdToHtml(txt) + '</div>';
  else { if (parts2[0].trim()) out += '<div class="msg bot sto">' + mdToHtml(parts2[0]) + '</div>'; for (var i = 1; i < parts2.length; i += 2) { var b = mdToHtml((parts2[i + 1] || '').trim()); out += '<div class="msg bot sto' + (parts2[i] === 'Key Dates' ? ' kd' : '') + '"><b class="sh">' + esc(parts2[i]) + '</b>' + b + '</div>'; } }
  if (chain) out += '<div class="msg bot chain"><b class="sh">Chain of logic</b><div class="ch">' + chain.split(/\s*(?:→|->)\s*/).map(function (s) { return '<span>' + esc(s.replace(/\*\*/g, '')) + '</span>'; }).join('<i>›</i>') + '</div>' + (ev ? '<details><summary>Evidence sheet used (' + esc(ev.topic) + ', ' + esc(ev.vlabel.split(' ')[0]) + ')</summary><pre class="evs">' + esc(ev.text) + '</pre></details>' : '') + '</div>';
  return out;
}
function AiV2() {
  var p = curP(); if (!p) return topBar('Ask AI', { noPerson: true }) + noPerson();
  var msgs = DB.chats[p.id] || [], hasKey = !!DB.settings.gkey;
  var h = topBar('Ask AI', { right: '<span class="gem">' + (hasKey ? '✦ Gemini' : 'Offline') + '</span>' + (msgs.length ? '<button class="v2ib" data-act="clearAsk" aria-label="Clear conversation" style="color:var(--bad)">' + icon('trash', 18) + '</button>' : '') }) + '<div class="pad">';
  if (!hasKey) h += '<div class="card"><b style="font:600 15px var(--sans)">Connect Gemini for full answers</b><p class="sm" style="margin:6px 0 10px">Paste your Gemini API key (from aistudio.google.com). Every answer will then use your D1, divisional chart, all 5 dasha levels, aspects, transits and Ashtakavarga. Without a key you get the shorter offline answers.</p><input class="inp mono" id="gkeyIn" placeholder="AIza..." autocomplete="off"><button class="btn acc wide" style="margin-top:8px" data-act="saveGkey">Save key</button></div>';
  h += '</div>';
  var Q = ['How will my health be in the next 3 months?', 'Will I get a promotion this year?', 'Explain my Ashtakavarga', 'What does my current dasha mean?', 'How is my D9 for marriage?', 'Best time to invest in the next 6 months?'];
  if (!msgs.length) h += '<div class="qchips" style="flex-wrap:wrap">' + Q.map(function (q) { return '<button data-act="askQ2">' + esc(q) + '</button>'; }).join('') + '</div>';
  h += '<div class="chat" id="chat">' + msgs.map(function (m) { return m.role === 'me' ? '<div class="msg me">' + esc(m.text) + '</div>' : m.multi ? m.html : '<div class="msg bot">' + m.html + '</div>'; }).join('') + '</div><div style="height:100px"></div>';
  U.after = (U.after || []).concat([function () { window.scrollTo(0, document.body.scrollHeight); }]);
  return h;
}
ACT.saveGkey = function () { var v = ($('#gkeyIn').value || '').trim(); if (!v) return toast('Paste the key first'); DB.settings.gkey = v; save(); toast('Gemini connected'); rerender(); };
ACT.clearAsk = function () {
  var p = curP(), n = (DB.chats[p.id] || []).filter(function (m) { return m.role === 'me'; }).length;
  var others = Object.keys(DB.chats).filter(function (k) { return k !== p.id && (DB.chats[k] || []).length; }).length;
  sheet('<div class="pad"><h3 style="font:600 18px var(--sans);margin:4px 0 6px">Clear conversation?</h3><p class="sm" style="margin-bottom:14px">This deletes the questions and answers from this phone. It cannot be undone.</p>' +
    '<button class="btn wide" style="background:var(--bad);color:#fff;margin-bottom:8px" data-act="clearChat2">Clear ' + esc(p.name.split(' ')[0]) + '\'s chat (' + n + ' question' + (n === 1 ? '' : 's') + ')</button>' +
    (others ? '<button class="btn sec wide" style="color:var(--bad);margin-bottom:8px" data-act="clearAllChats">Clear chats for all people</button>' : '') +
    '<button class="btn sec wide" data-act="closeSheetBtn">Cancel</button></div>');
};
ACT.clearChat2 = function () { var p = curP(); DB.chats[p.id] = []; save(); closeSheet(); setTimeout(rerender, 20); toast('Conversation cleared'); };
ACT.clearAllChats = function () { DB.chats = {}; save(); closeSheet(); setTimeout(rerender, 20); toast('All conversations cleared'); };
ACT.closeSheetBtn = function () { closeSheet(); };
ACT.askQ2 = function (el) { $('#askIn').value = el.textContent; ACT.askSend(); };
ACT.askSend = function () {
  var t = $('#askIn'), q = (t.value || '').trim(), p = curP(); if (!q || !p) return;
  t.value = ''; t.style.height = '';
  var c = calcP(p), list = DB.chats[p.id] = DB.chats[p.id] || [];
  list.push({ role: 'me', text: q });
  if (!DB.settings.gkey) {
    var res = null; try { res = answerLocal(p, c, q); } catch (e) { res = { html: '<p>Could not work that out: ' + esc(e.message) + '</p>' }; }
    list.push(res && res.story ? { role: 'bot', multi: true, ask: !!res.story.question, html: res.html, text: res.text } : { role: 'bot', html: res ? res.html : HELP, text: res ? (res.text || htmlText(res.html)).slice(0, 3000) : '' });
    trimChat(list); save(); rerender(); return;
  }
  save(); rerender();
  var pend = document.createElement('div'); pend.className = 'msg bot'; pend.innerHTML = '<span class="typing"><i></i><i></i><i></i></span> <span class="mut" style="font-size:12.5px">Checking D1, divisional chart, dashas, aspects and transits…</span>'; $('#chat').appendChild(pend); window.scrollTo(0, document.body.scrollHeight);
  askGemini(p, c, q).then(function (r) {
    list.push({ role: 'bot', multi: true, html: aiBubbles(r.txt, r.ev), text: r.txt }); trimChat(list); save(); if (location.hash.indexOf('ai') >= 0) rerender();
  }).catch(function (e) {
    var res = null; try { res = answerLocal(p, c, q); } catch (x) { }
    list.push({ role: 'bot', multi: !!(res && res.story), html: '<div class="msg bot"><p class="mut" style="font-size:12.5px">Gemini could not answer: ' + esc(e.message) + '. ' + (res ? 'Offline answer below.' : '') + '</p></div>' + (res ? (res.story ? res.html : '<div class="msg bot">' + res.html + '</div>') : ''), text: '' });
    list[list.length - 1].multi = true; trimChat(list); save(); if (location.hash.indexOf('ai') >= 0) rerender();
  });
};
