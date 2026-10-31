/* Trikaal v2: five sections — Astrology, Panchang, Dasha, Remedies, AI (Gemini, evidence-based) */
var E = makeEvidence(A, C, J, KB, N), KA = makeKundliAnalysis(A, C, J, KB, N, S);
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
    else if (scr === 'analysis') { html = AnalysisV2(); navOn = 'astro'; }
    else if (scr === 'reports') { html = ReportsV2(); navOn = 'astro'; }
    else if (scr === 'reminders') { html = RemindersV2(); navOn = 'remedies'; }
    else if (scr === 'milan') { html = MilanScreen(); navOn = 'astro'; }
    else if (scr === 'report') { html = ReportView(p[1]); navOn = 'astro'; }
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
  h += '<div class="kpair"><button class="kentry" data-go="analysis"><span class="kei">✦</span><div><b>Kundli analysis</b><small>Strengths, yogas, golden periods, timelines</small></div></button><button class="kentry k2" data-go="reports"><span class="kei">☰</span><div><b>Reports</b><small>21 ready readings: doshas, Sade Sati, remedies, months</small></div></button></div>';
  h += '<button class="kentry k3" data-go="report/disease"><span class="kei">✚</span><div><b>Health risks</b><small>BP, diabetes, thyroid, kidneys and more: what to avoid, tests to get</small></div><span>›</span></button>';
  h += '<button class="kentry k4" data-go="milan"><span class="kei">♥</span><div><b>Kundli Milan</b><small>Match two kundlis: 36 gunas, Mangal dosha, remedies</small></div><span>›</span></button>';
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
  var CGM = { Amrit: 'Best for everything: new starts, puja, purchases', Shubh: 'Auspicious: ceremonies, learning, family events', Labh: 'Gains: business, deals, money matters', Char: 'Movement: travel, short trips, outings', Udveg: 'Avoid new starts; fine for government work', Kaal: 'Avoid new starts; routine work only', Rog: 'Avoid new starts, disputes and surgery' };
  function clashName(x) { var n = [['Rahu Kaal', parts.rahu], ['Yamaganda', parts.yama], ['Gulika', parts.gulika]].concat(vs.map(function (w) { return ['Bhadra', w]; })).filter(function (w) { return x.start < w[1].end && w[1].start < x.end; }).map(function (w) { return w[0] + ' ' + N.hm(w[1].start) + '–' + N.hm(w[1].end); }); return n; }
  function cgRow(x, day) {
    var cl = day && x.q === 'good' ? clashName(x) : [], full = cl.length && [parts.rahu, parts.yama, parts.gulika].concat(vs).some(function (w) { return w.start <= x.start + 6e4 && w.end >= x.end - 6e4; }), q = x.q === 'good' ? (full ? 'b' : cl.length ? 'w' : 'g') : x.q === 'bad' ? 'b' : 'n', isNow = now >= x.start && now < x.end && !U.dayOff;
    return '<div class="cgr ' + q + (isNow ? ' now' : '') + '"><div class="cgt mono">' + N.hm(x.start) + '<small>' + N.hm(x.end) + '</small></div><div class="cgm"><b>' + x.name + (isNow ? ' <em>now</em>' : '') + '</b><small>' + (CGM[x.name] || '') + '</small>' + (cl.length ? '<span class="cgc">' + (full ? 'Fully covered by ' + cl.join(', ') + ': skip it today' : 'Partly spoilt by ' + cl.join(', ') + ': start before or after it') + '</span>' : '') + '</div><span class="cgq">' + { g: 'Good', w: 'Good*', b: 'Avoid', n: 'Neutral' }[q] + '</span></div>';
  }
  h += '<div class="card"><div class="kgh"><h3>Choghadiya</h3><span class="sm">' + N.hm(pc.rise) + ' sunrise</span></div><div class="lbl" style="margin:6px 0 4px">Day</div>' + cg.day.map(function (x) { return cgRow(x, true); }).join('') + '<div class="lbl" style="margin:12px 0 4px">Night</div>' + cg.night.map(function (x) { return cgRow(x, false); }).join('') + '<p class="note">Good* = good Choghadiya that overlaps Rahu Kaal, Yamaganda, Gulika or Bhadra; use the part outside it.</p></div>';
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
  h += '<button class="kentry k2" data-go="reminders" style="margin-bottom:10px"><span class="kei">🔔</span><div><b>Reminders and alerts</b><small>Morning briefing, transit and dasha alerts, remedy reminders · choose who gets them</small></div><span>›</span></button>';
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
    [{ name: x.mantra[0], type: 'Mantra', count: 108, days: [], note: (x.mode === 'calm' ? 'Calms ' : 'Strengthens ') + PN[x.code] + (x.why ? '. ' + x.why.trim() : '') + ' ' + KB.MANTRA_HOW }, { name: 'Donate ' + KB.DAAN_SHORT[x.code][0], type: 'Daan', count: 1, days: dayIdx >= 0 ? [dayIdx] : [], note: 'For ' + PN[x.code] + '. Give ' + x.daan[0] + '. ' + KB.DAAN_HOW }].forEach(function (r) {
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
/* what kind of question: 'explain' (what / which / explain / list / meaning) or 'predict' (will / when / how will / should I) */
function qIntent(q) {
  var ql = q.toLowerCase();
  if (/\b(key ?points?|talking points?|tell (the |my |this )?client|tell (him|her|them)|what (should|do|can) i (tell|say|explain|share)|client ko|consultation|brief (me|for)|how (do|should) i explain)\b/.test(ql)) return 'consult';
  if (/\b(will|when|kab|should i|shall i|chances?|possible|how will|how is my .* (going|next)|next \d+|this year|next year|future|predict|timing|best time)\b/.test(ql)) return 'predict';
  if (/\b(what|which|explain|list|meaning|means|tell me about|describe|how many|kya|kaun|why|show)\b/.test(ql)) return 'explain';
  return 'predict';
}
function geminiFormat(name, intent, rel, me) {
  var third = rel && rel !== 'me';
  var core = (third ? 'You are Trikaal, a senior Vedic astrologer (Parashari system, N.C. Lahiri ayanamsa) advising ' + me + ', who is the consultant. The chart belongs to ' + (rel === 'client' ? 'his client ' : 'his family member or friend ') + name + '. Speak to ' + me + ' and refer to ' + name + ' in the third person by name (never "you" for ' + name + ').' : 'You are Trikaal, an expert Vedic astrologer (Parashari system, N.C. Lahiri ayanamsa) talking to ' + name + '.') + ' You are given FIXED FACTS and an EVIDENCE SHEET computed precisely from the chart. Use ONLY these. Never invent a position, yoga, aspect, dasha or date, and never contradict the FIXED FACTS (especially which Mahadasha, Antardasha and Pratyantar are running now). If something is not in the sheet, say so.\n' +
    'ANSWER ONLY THE CURRENT QUESTION (marked ==== CURRENT QUESTION ====), exactly what was asked. Earlier messages are background only.\n' +
    'Write in plain, warm language a non-astrologer understands; explain any term in a few words the first time. Answer in the language the user writes in.' + (third ? '' : ' Address ' + name + ' by name once.') + '\n';
  if (intent === 'consult') return core +
    'This is a CONSULTATION BRIEF: ' + me + ' wants the key points to tell ' + name + '. Give points ' + name + ' will understand and value: what is strong, what needs care, what is coming and when (month-year), and what to do. Use the KUNDLI ANALYSIS block and the running dasha. Every point must come from the sheet.\n' +
    'Use exactly these sections with bold titles:\n' +
    '**Quick Answer** two sentences: the overall picture of ' + name + '\'s chart and the current period, for ' + me + '.\n' +
    '**Key points to tell the client** 6 to 8 numbered points, each one plain sentence ' + me + ' can say directly to ' + name + ', with dates where relevant (current period, next good window, any caution period).\n' +
    '**Say it gently** sensitive points (health, marriage, doshas, Sade Sati, difficult periods) with a suggested calm, non-scary way to phrase each.\n' +
    '**Remedies to suggest** three to five specific remedies for ' + name + ' (mantra, daan, gemstone yes/avoid) tied to the planets involved.\n' +
    '**Questions to ask the client** two or three questions about past events (with years from the dasha list) that confirm the chart and birth time.\n' +
    '**Chain:** one line with the main facts behind the brief.\n\n' + E.RULES;
  if (intent === 'explain') return core +
    'This is an EXPLAIN question. Answer it directly and specifically from THIS chart. If it asks "which/what yogas, planets, houses, doshas", name every one that exists in the sheet, with the actual planets and houses. Never answer with generic statements like "your chart has powerful yogas".\n' +
    'Use exactly these sections with bold titles:\n' +
    '**Quick Answer** two or three sentences answering the question directly (e.g. "You have 4 Raja yogas: ...").\n' +
    '**Details** one bullet per item. Each bullet: **Name** – how it forms in your chart (which planets, which houses, signs) – what it gives you in real life – how strong it is (dignity, D9, combustion, cancellation) – when it delivers (the Mahadasha/Antardasha periods of those planets with dates from the sheet).\n' +
    '**What it means for you** two or three sentences: the practical takeaway and what to do.\n' +
    '**Be careful about** always include this: one to three bullets on the weak side or risks of what was asked (doshas, weak planets, difficult periods with dates).\n' +
    '**Chain:** one line linking the key facts, e.g. Venus (4th & 9th lord) + Saturn (1st lord) conjunct in 9th → Raja yoga → active in Saturn AD 2026–2029.\n\n' + E.RULES;
  return core +
    'This is a PREDICTION question. The person wants WHAT WILL HAPPEN and WHEN. Before concluding, weigh: D1 house, lord and karaka; the same houses from the Moon; the divisional chart and D9; all five dasha levels and how each links to the topic; transits from lagna and Moon with bindus. Never predict from the dasha alone. Give concrete results (e.g. "a raise or new role offer", "delays and extra workload"), never "the dasha supports growth". If the result is negative, say so and say when it improves.\n' +
    'Use exactly these sections with bold titles:\n' +
    '**Quick Answer** start with one verdict word in bold (Yes / Likely / Partly / Delayed / Unlikely / Good / Mixed / Difficult), then two sentences: the concrete outcome and the best (or worst) window as month-year to month-year. End with "Confidence: High/Medium/Low" and why.\n' +
    '**A Quick Question** one short clarifying question only if it would genuinely change the answer; otherwise omit this section.\n' +
    '**What will happen** 3 to 6 bullets in time order: "Month Year – Month Year: concrete outcome (reason: dasha level + transit)".\n' +
    '**Astrological Explanation** at most two short paragraphs citing the chart facts that decide this outcome.\n' +
    '**What to do** two to four specific actions tied to the dates above.\n' +
    '**Be careful about** always include this, even when the outlook is good: two to four bullets with the specific risks, the dates or periods when they peak, and what to avoid.\n' +
    '**Chain:** one line, e.g. 10th house → lord Mars in 9th → Moon chart 10th → D10 → Jupiter MD / Saturn AD / Mercury PD → transit → result.\n' +
    'Never claim 100% certainty. For health, give astrological timing only and advise a doctor.\n\n' + E.RULES;
}
/* facts the answer must not contradict */
function fixedFacts(p, c) {
  var k = c.k, now = new Date(), ch = J.dashaChain(c.maha, now, 3), LV = ['Mahadasha', 'Antardasha', 'Pratyantar'], a = kaOf(p);
  return 'FIXED FACTS (do not contradict)\n' +
    'AGE NOW: ' + age(p, now) + ' (' + NARR.stage(age(p, now)) + '). Tailor every point to this stage of life: for a child, talk about health, temperament, studies, parents\' guidance and what the child can do; for a teen, studies, exams, career direction and habits; never talk about marriage, spouse, money or career for a child unless asked. For any past or future period, use the age at that period.\n' +
    'Lagna ' + J.SIGNS[k.ascSign] + ' (lord ' + PN[J.lordOfHouse(k.ascSign, 1)] + '); Moon sign ' + J.SIGNS[k.P.Mo.sign] + ', nakshatra ' + k.P.Mo.nak.name + '; Sun sign ' + J.SIGNS[k.P.Su.sign] + '.\n' +
    'RUNNING NOW (' + N.dmy(now) + '): ' + ch.map(function (x, i) { return LV[i] + ' ' + PN[x.lord] + ' (' + N.dmy(x.start) + ' to ' + N.dmy(x.end) + ')'; }).join(', ') + '.\n' +
    'Planets: ' + k.planets.map(function (x) { return PN[x.code] + ' ' + J.SIGNS[x.sign] + ' house ' + x.house + ' ' + x.dignity.toLowerCase() + (x.combust ? ' combust' : ''); }).join('; ') + '.\n' +
    'ALL YOGAS AND DOSHAS IN THIS CHART (complete list): ' + a.yogas.map(function (y) { return y.name + ' [' + y.label + ']: ' + y.why; }).join(' | ') + '\n';
}
/* catch a wrong running dasha in the answer */
function dashaSlip(txt, c) {
  var now = new Date(), ch = J.dashaChain(c.maha, now, 2), md = PN[ch[0].lord], ad = ch[1] ? PN[ch[1].lord] : '', bad = [];
  var re = /(Sun|Moon|Mars|Mercury|Jupiter|Venus|Saturn|Rahu|Ketu)\s+(Mahadasha|Maha ?dasha|MD)\b/gi, m;
  txt.split(/(?<=[.!?\n])/).forEach(function (sent) {
    if (!/\b(now|current|currently|running|present|presently|ongoing|this period)\b/i.test(sent)) return;
    re.lastIndex = 0; while ((m = re.exec(sent))) { var pl = m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase(); if (pl !== md && bad.indexOf(pl) < 0) bad.push(pl); }
  });
  return bad.length ? 'Your answer says ' + bad.join(', ') + ' Mahadasha is running now. That is wrong: the running Mahadasha is ' + md + ' (' + N.dmy(ch[0].start) + ' to ' + N.dmy(ch[0].end) + ')' + (ad ? ', Antardasha ' + ad + ' (to ' + N.dmy(ch[1].end) + ')' : '') + '. Rewrite the whole answer correctly using the FIXED FACTS.' : '';
}
/* ---------- Gemini model handling: find the newest model this key can use ---------- */
var GBASE = 'https://generativelanguage.googleapis.com/v1beta/';
var GDEFAULT = 'gemini-3.1-pro-preview';
function gVer(n) { var m = n.match(/gemini-(\d+(?:\.\d+)?)/); return m ? +m[1] : 0; }
function gRank(n, want) {
  var s = gVer(n) * 100;
  if (/-pro/.test(n)) s += want === 'flash' ? 10 : 50; else if (/-flash(?!-lite)/.test(n)) s += want === 'flash' ? 50 : 20; else if (/lite/.test(n)) s += 5;
  else s -= 1000; /* codenames like gemini-4-argon: never auto-picked */
  if (/latest$/.test(n)) s += 2; if (/exp/.test(n)) s -= 3;
  if ((DB.settings.gbad || []).indexOf(n) >= 0) s -= 5000; /* no quota on this key */
  return s;
}
function gListModels() {
  return http('GET', GBASE + 'models?pageSize=200', { 'x-goog-api-key': DB.settings.gkey }).then(function (r) {
    var d; try { d = JSON.parse(r.text); } catch (e) { throw new Error('Unexpected reply (' + r.status + ')'); }
    if (r.status !== 200) throw new Error((d.error && d.error.message) || ('HTTP ' + r.status));
    var list = (d.models || []).filter(function (m) { return (m.supportedGenerationMethods || []).indexOf('generateContent') >= 0; })
      .map(function (m) { return m.name.replace(/^models\//, ''); })
      .filter(function (n) { return /^gemini-/.test(n) && !/image|tts|audio|live|embed|computer|robotics|vision|learnlm|aqa|gemma|nano|banana/.test(n); });
    list.sort(function (a, b) { return gRank(b, 'pro') - gRank(a, 'pro'); });
    DB.settings.gmodels = list; save();
    return list;
  });
}
function gBest(list, want) { return list.slice().sort(function (a, b) { return gRank(b, want) - gRank(a, want); })[0]; }
/* POST generateContent; if the model is retired or unknown, switch to the best available model and retry once */
var G_ON = null; /* live listener while an answer streams: G_ON(kind 'thought'|'text', text) */
function gCall(model, body, tries) {
  var t0 = Date.now(); gCall.got = false;
  return gCall1(model, body).catch(function (e) {
    if (e.slow) throw e;
    /* retry only quick drops before any text arrived; a long answer cut midway is not re-sent automatically */
    if ((tries || 0) >= 2 || gCall.got || Date.now() - t0 > 20000) throw new Error('Connection dropped (' + e.message.replace(/^\w+Exception:\s*/, '') + '). Check your internet and try again.');
    return gWait(1500).then(function () { return gCall(model, body, (tries || 0) + 1); });
  });
}
function gCall1(model, body) {
  var H = { 'content-type': 'application/json', 'x-goog-api-key': DB.settings.gkey };
  if (!G_ON) return http('POST', GBASE + 'models/' + encodeURIComponent(model) + ':generateContent', H, body).then(function (r) {
    var d; try { d = JSON.parse(r.text); } catch (e) { d = {}; }
    return { model: model, status: r.status, d: d, msg: (d.error && d.error.message) || ('HTTP ' + r.status) };
  });
  var acc = '', fin = '', on = G_ON, dead = false, last = Date.now(), wd;
  /* watchdog: nothing for 45 s at the start, or a 60 s stall mid-answer, counts as a slow call */
  var slow = new Promise(function (res, rej) { wd = setInterval(function () { if (Date.now() - last > (gCall.got ? 60000 : 45000)) { dead = true; clearInterval(wd); var e = new Error('Gemini is taking too long'); e.slow = true; rej(e); } }, 1000); });
  var main = httpStream(GBASE + 'models/' + encodeURIComponent(model) + ':streamGenerateContent?alt=sse', H, body, function (data) {
    if (dead) return;
    var j; try { j = JSON.parse(data); } catch (e) { return; }
    gCall.got = true; last = Date.now();
    (j.candidates || []).forEach(function (cd) {
      if (cd.finishReason) fin = cd.finishReason;
      ((cd.content && cd.content.parts) || []).forEach(function (pt) {
        if (!pt.text) return;
        if (pt.thought) on('thought', pt.text); else { acc += pt.text; on('text', acc); }
      });
    });
  }).then(function (r) {
    clearInterval(wd); if (dead) return new Promise(function () { });
    if (r.status === 200) return { model: model, status: 200, d: { candidates: [{ content: { parts: [{ text: acc }] }, finishReason: fin }] }, msg: '' };
    var d; try { d = JSON.parse(r.text); if (Array.isArray(d)) d = d[0]; } catch (e) { d = {}; }
    return { model: model, status: r.status, d: d, msg: (d.error && d.error.message) || ('HTTP ' + r.status) };
  }, function (e) { clearInterval(wd); if (dead) return new Promise(function () { }); throw e; });
  return Promise.race([main, slow]);
}
function gWait(ms) { return new Promise(function (res) { setTimeout(res, ms); }); }
function gBusy(x) { return x.status === 503 || x.status === 500 || x.status === 504 || /high demand|overloaded|unavailable|try again later|deadline/i.test(x.msg) || (x.status === 429 && !/limit: 0/.test(x.msg)); }
/* Calls Gemini with the chosen model.
   - retired model or no free Pro quota: switch the saved model for good, then retry
   - busy or rate-limited: wait and retry once, then answer with the next-best models (saved choice kept) */
function uniqA(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
function gGenerate(body, depth) {
  var model = DB.settings.gmodel || GDEFAULT, first;
  return gCall(model, body).then(function (x) {
    if (x.status === 200) return x.d;
    first = x;
    if (x.status === 400 && /thinking/i.test(x.msg) && body.indexOf('thinkingConfig') >= 0) {
      var bj = JSON.parse(body); delete bj.generationConfig.thinkingConfig; return gGenerate(JSON.stringify(bj), depth);
    }
    var noQuota = x.status === 429 && /limit: 0/i.test(x.msg);
    if (noQuota) { DB.settings.gbad = uniqA((DB.settings.gbad || []).concat([model])); if (/-pro/.test(model)) DB.settings.gnoPro = true; save(); }
    if (noQuota || x.status === 404 || /no longer available|not found|not supported/i.test(x.msg)) {
      if ((depth || 0) >= 4) throw new Error(gShort(x.status, x.msg));
      return gListModels().then(function (list) {
        var best = gBest(list, DB.settings.gnoPro || /flash/.test(model) ? 'flash' : 'pro');
        if (!best || best === model || gRank(best, 'flash') < 0) throw new Error(noQuota ? 'Your free key has no quota for any listed model. Check the key in Google AI Studio.' : gShort(x.status, x.msg));
        DB.settings.gmodel = best; save(); toast((noQuota ? model + ' is not free on your key, using ' : 'Switched to ') + best, 3000);
        return gGenerate(body, (depth || 0) + 1);
      });
    }
    if (!gBusy(x)) throw new Error(gShort(x.status, x.msg));
    toast(model + ' is busy, retrying…', 2000);
    return gWait(2500).then(function () { return gCall(model, body); }).then(function (y) {
      if (y.status === 200) return y.d;
      if (!gBusy(y)) throw new Error(gShort(y.status, y.msg));
      var listP = DB.settings.gmodels && DB.settings.gmodels.length ? Promise.resolve(DB.settings.gmodels) : gListModels();
      return listP.then(function (list) {
        var want = DB.settings.gnoPro || /flash/.test(model) ? 'flash' : 'pro';
        var alts = list.filter(function (n) { return n !== model && gRank(n, want) > 0 && !(DB.settings.gnoPro && /-pro/.test(n)); })
          .sort(function (p, q) { return gRank(q, want) - gRank(p, want); }).slice(0, 4);
        var i = 0;
        function next() {
          if (i >= alts.length) throw new Error('All Gemini models are busy right now. Please try again in a minute.');
          var m = alts[i++];
          return gCall(m, body).then(function (z) {
            if (z.status === 200) { toast(model + ' was busy, answered with ' + m, 3000); return z.d; }
            return next();
          });
        }
        return next();
      });
    });
  });
}
function gShort(st, msg) {
  if (st === 429) { var w = msg.match(/retry in ([\d]+h)?([\d]+m)?/); return 'Gemini daily/minute limit reached on your free plan' + (w ? ' (resets in ' + ((w[1] || '') + (w[2] || '')) + ')' : '') + '. Try a Flash model, or enable billing in Google AI Studio.'; }
  return msg.split(/\.\s/)[0].slice(0, 220);
}
function gText(d) {
  var cand = d.candidates && d.candidates[0], txt = cand && cand.content && cand.content.parts ? cand.content.parts.filter(function (x) { return x.text && !x.thought; }).map(function (x) { return x.text; }).join('\n') : '';
  if (!txt) throw new Error(cand && cand.finishReason ? 'No answer (' + cand.finishReason + ')' : 'Empty answer');
  return txt;
}
function answerAny(p, c, q) {
  if (/\b(yogas?|dosh\w*|raj ?yoga|raja ?yoga|dhana ?yoga)\b/i.test(q)) {
    var ka = kaOf(p), want = /raj/i.test(q) ? ka.yogas.filter(function (y) { return y.kind === 'raja' || y.kind === 'mahapurusha' || /Yogakaraka/.test(y.name); }) : /dhan/i.test(q) ? ka.yogas.filter(function (y) { return y.kind === 'dhana'; }) : /dosh/i.test(q) ? ka.yogas.filter(function (y) { return !y.good || y.kind === 'mild'; }) : ka.yogas;
    var hy = '<p><b>' + want.length + (/raj/i.test(q) ? ' Raja yoga' : /dhan/i.test(q) ? ' Dhana yoga' : /dosh/i.test(q) ? ' dosha' : ' yoga') + (want.length === 1 ? '' : 's') + ' in your chart:</b></p><ul>' + want.map(function (y) { return '<li><b>' + esc(y.name) + '</b>: ' + esc(y.why) + '</li>'; }).join('') + '</ul><button class="btn sec sm" style="margin-top:8px" data-go="analysis">See all yogas in Kundli analysis ›</button>';
    return { html: hy, text: htmlText(hy) };
  }
  if (!isWholeChart(q)) return answerLocal(p, c, q);
  var a = kaOf(p), h = '<p><b>' + esc(a.snapshot.grade[0]) + '.</b> ' + esc(a.snapshot.grade[1]) + '</p>' +
    '<p><b>Strengths:</b> ' + esc(a.pros.slice(0, 4).map(function (x) { return x.t; }).join('; ')) + '.</p>' +
    '<p><b>Weak spots:</b> ' + esc(a.cons.slice(0, 4).map(function (x) { return x.t; }).join('; ')) + '.</p>' +
    '<p><b>Golden periods:</b> ' + esc(a.golden.slice(0, 3).map(function (g) { return g.label + ' (' + N.dmy(g.start) + ' – ' + N.dmy(g.end) + ')'; }).join('; ')) + '.</p>' +
    '<button class="btn acc sm" style="margin-top:8px" data-go="analysis">Open full Kundli analysis ›</button>';
  return { html: h, text: htmlText(h) };
}
function isWholeChart(q) { var ql = q.toLowerCase(); return /\b(kundli|kundali|horoscope|birth ?chart|whole chart|complete|overall|full reading|full analysis|strengths?|weakness\w*|golden|my life|life reading|summary of my chart)\b/.test(ql); }
function kaText(p) {
  var a = kaOf(p), d = function (x) { return N.dmy(x); }, L = [];
  L.push('Overall: ' + a.snapshot.grade[0] + '. Strongest planets ' + a.snapshot.best.join(', ') + '; needing support ' + a.snapshot.weak.join(', ') + '.');
  L.push('STRENGTHS: ' + a.pros.map(function (x) { return x.t + ' [' + (x.why || []).join(' ') + ']'; }).join(' | '));
  L.push('WEAK SPOTS: ' + a.cons.map(function (x) { return x.t + ' [' + (x.why || []).join(' ') + ']'; }).join(' | '));
  L.push('YOGAS: ' + a.yogas.map(function (y) { return y.name + ' (' + y.label + '): ' + y.why; }).join(' | '));
  L.push('GOLDEN PERIODS: ' + a.golden.map(function (g) { return g.label + ' ' + d(g.start) + '–' + d(g.end) + ' (' + g.rate + '; ' + g.areas.join(', ') + ')'; }).join(' | '));
  L.push('MAHADASHA RATINGS: ' + a.life.map(function (m) { return m.lord + ' age ' + m.from + '–' + m.to + ' ' + m.rate; }).join(', '));
  L.push('HEALTH CARE PERIODS: ' + (a.health.map(function (x) { return x.label + ' ' + d(x.start) + '–' + d(x.end) + ' (' + x.level + ': ' + x.areas.join('; ') + ')'; }).join(' | ') || 'none strong') + '. Saturn cycles: ' + (a.saturn.map(function (x) { return x.label + ' ' + d(x.start) + '–' + d(x.end); }).join(', ') || 'none'));
  L.push('SUCCESS PERIODS: ' + a.success.map(function (x) { return x.label + ' ' + d(x.start) + '–' + d(x.end) + ' (' + x.level + ': ' + x.areas.join(', ') + ')'; }).join(' | '));
  L.push('NATURE: ' + a.nature.map(function (x) { return x.t + ': ' + x.d; }).join(' '));
  L.push('DEITY: ' + a.deity.map(function (x) { return x.role + ': ' + x.name; }).join('; ') + '. FOOD NOW: ' + a.food.items.map(function (x) { return PN[x.code] + ' favour ' + x.favour; }).join('; ') + '.');
  return L.join('\n');
}
function askGemini(p, c, q, onLive) {
  var now = new Date(), ev = E.build(p, c, q, now), name = p.name.split(' ')[0];
  /* earlier conversation: only completed question–answer pairs (an unanswered question is dropped, so it can never be answered in place of the new one) */
  var all = (DB.chats[p.id] || []).slice(0, -1), pairs = [];
  for (var i = 0; i < all.length - 1; i++) if (all[i].role === 'me' && all[i + 1].role === 'bot' && all[i + 1].text) { pairs.push([all[i].text, all[i + 1].text]); i++; }
  var hist = []; pairs.slice(-3).forEach(function (x) { hist.push({ role: 'user', parts: [{ text: '(Earlier question, already answered) ' + x[0].slice(0, 600) }] }, { role: 'model', parts: [{ text: x[1].slice(0, 2500) }] }); });
  var whole = isWholeChart(q) || qIntent(q) === 'consult', extra = whole ? '\n\nKUNDLI ANALYSIS (computed by the app for the whole chart)\n' + kaText(p) : '';
  if (ev.topic === 'health' || /\b(bp|blood pressure|diabet|sugar|thyroid|heart|cholesterol|kidney|disease|illness|asthma|arthritis|joint|acidity|anxiety|depression|liver)\b/i.test(q)) {
    try { extra += '\n\nHEALTH TENDENCIES (scored by the app from the chart; strongest first): ' + MED.analyze(c, new Date()).map(function (x) { return x.name + ' ' + x.level + ' (score ' + x.score + '; ' + x.why.join('; ') + '; extra care in ' + (x.when.map(function (w) { return w.t + ' ' + N.dmy(w.s) + '–' + N.dmy(w.e); }).join(', ') || 'no specific period') + '; avoid: ' + x.avoid.join(', ') + '; tests: ' + x.tests + ')'; }).join(' | ') + '\nGive health tendencies as astrology only, never as a diagnosis, and always advise the tests and a doctor.'; } catch (e) { }
  }
  if (/varsh|solar return|year chart|annual chart|varshaphal|varshphal/i.test(q)) {
    try {
      var ag = (q.match(/age (\d{1,2})/i) || [])[1], yr = (q.match(/year (\d{1,2}) of life/i) || [])[1], aa = ag != null ? +ag : yr != null ? +yr - 1 : age(p, new Date()), vo = varshOutcome(p, c, new Date(), aa), V = vo.vp.chart;
      extra += '\n\nVARSHPHAL (Tajik annual chart) for age ' + aa + ', ' + N.dmy(vo.vp.at) + ' to ' + N.dmy(vo.vp.end) + ': Varsha lagna ' + J.SIGNS[V.ascSign] + '; Muntha ' + J.SIGNS[vo.vp.muntha] + ' in year house ' + vo.vp.munthaHouse + ' (' + MUNTHA_H[vo.vp.munthaHouse][1] + '); year lord ' + PN[vo.vp.yearLord] + '. Year planets: ' + V.planets.map(function (x) { return PN[x.code] + ' ' + J.SIGNS[x.sign] + ' h' + x.house + ' ' + x.dignity.toLowerCase(); }).join('; ') + '. App verdict: ' + vo.verdict[0] + '. Areas: ' + vo.areas.map(function (x) { return x.t + ' ' + x.w[0] + ' (' + x.why + ')'; }).join('; ') + '. Mudda dasha: ' + vo.months.map(function (m) { return PN[m.d.lord] + ' ' + N.dmy(m.d.start) + '–' + N.dmy(m.d.end) + ' ' + m.w[0]; }).join('; ') + '.';
    } catch (e) { }
  }
  var rb = ''; try { var lo = answerAny(p, c, q); rb = (lo.text || htmlText(lo.html) || '').replace(/\s+/g, ' ').slice(0, 1500); } catch (e) { }
  if (rb && !E.isKP(q)) rb = rb.split(/(?<=[.!?])\s+/).filter(function (x) { return !/\bKP\b|sub ?lord|significator|cusp/i.test(x); }).join(' ');
  if (rb) extra += '\n\nRULE-BASED VERDICT FROM THE APP (cross-check; if you disagree, say why)\n' + rb;
  var contents = hist.concat([{ role: 'user', parts: [{ text: 'EVIDENCE SHEET (computed now for this question)\n' + ev.text + extra + '\n\nFULL CHART SUMMARY\n' + dossier(p, c, E.isKP(q)) + '\n\n==== CURRENT QUESTION (answer ONLY this) ====\n' + q } ] }]);
  var gc = { temperature: 0.35, maxOutputTokens: 32768, thinkingConfig: { includeThoughts: true } };
  if (DB.settings.gfast) { if (gVer(DB.settings.gmodel || GDEFAULT) >= 3) gc.thinkingConfig.thinkingLevel = 'low'; else gc.thinkingConfig.thinkingBudget = 1024; }
  var intent = qIntent(q); gc.temperature = 0.2;
  contents[contents.length - 1].parts[0].text = fixedFacts(p, c) + '\n' + contents[contents.length - 1].parts[0].text;
  var rel = relOf(p), meP = me(), meName = meP && meP.id !== p.id ? meP.name.split(' ')[0] : 'the astrologer';
  var body = JSON.stringify({ system_instruction: { parts: [{ text: geminiFormat(name, intent, rel, meName) + (E.isKP(q) ? '\n' + E.RULES_KP : '\nThis is a Parashari reading with the N.C. Lahiri ayanamsa and whole-sign houses. Do NOT use or mention KP, sub lords, cusps, cuspal sub lords or significators.') }] }, contents: contents, generationConfig: gc });
  G_ON = onLive || null;
  return gGenerate(body).catch(function (e) {
    /* deep answer too slow or cut off before any text: try once more with light reasoning */
    if (DB.settings.gfast || !(e.slow || /dropped/i.test(e.message)) || gCall.got) throw e;
    if (onLive) onLive('thought', 'Taking long, switching to a faster answer');
    var fc = JSON.parse(body); if (gVer(DB.settings.gmodel || GDEFAULT) >= 3) fc.generationConfig.thinkingConfig.thinkingLevel = 'low'; else fc.generationConfig.thinkingConfig.thinkingBudget = 1024;
    return gGenerate(JSON.stringify(fc));
  }).then(function (d) {
    var txt = gText(d), slip = dashaSlip(txt, c);
    if (!slip) { G_ON = null; return { txt: txt, ev: ev }; }
    /* the answer named the wrong running dasha: ask once more with the correction */
    if (onLive) onLive('thought', 'Checking the answer against your dasha…');
    var b2 = JSON.parse(body); b2.contents.push({ role: 'model', parts: [{ text: txt }] }, { role: 'user', parts: [{ text: slip }] });
    return gGenerate(JSON.stringify(b2)).then(function (d2) { G_ON = null; var t2 = gText(d2); return { txt: dashaSlip(t2, c) ? t2 + '\n\n_(Note: the running Mahadasha is ' + PN[J.dashaChain(c.maha, new Date(), 1)[0].lord] + '.)_' : t2, ev: ev }; });
  }, function (e) { G_ON = null; throw e; });
}
function aiBubbles(txt, ev) {
  var chain = '', m = txt.match(/\*{0,2}Chain:?\*{0,2}:?\s*([\s\S]*)$/);
  if (m) { chain = m[1].trim(); txt = txt.slice(0, m.index); }
  var parts2 = txt.split(/\*{0,2}(Quick Answer|A Quick Question|What will happen|Details|What it means for you|Key points to tell the client|Say it gently|Remedies to suggest|Questions to ask the client|Be careful about|Astrological Explanation|Key Dates|What to do)\*{0,2}:?/), out = '';
  if (parts2.length < 3) out = '<div class="msg bot sto">' + mdToHtml(txt) + '</div>';
  else { if (parts2[0].trim()) out += '<div class="msg bot sto">' + mdToHtml(parts2[0]) + '</div>'; for (var i = 1; i < parts2.length; i += 2) { var b = mdToHtml((parts2[i + 1] || '').trim()); out += '<div class="msg bot sto' + (['Key Dates', 'What will happen', 'Details', 'Key points to tell the client'].indexOf(parts2[i]) >= 0 ? ' kd' : '') + (parts2[i] === 'Quick Answer' ? ' qa' : '') + (parts2[i] === 'Be careful about' ? ' bc' : '') + '"><b class="sh">' + esc(parts2[i]) + '</b>' + b + '</div>'; } }
  if (chain) out += '<div class="msg bot chain"><b class="sh">Chain of logic</b><div class="ch">' + chain.split(/\s*(?:→|->)\s*/).map(function (s) { return '<span>' + esc(s.replace(/\*\*/g, '')) + '</span>'; }).join('<i>›</i>') + '</div>' + (ev ? '<details><summary>Evidence sheet used (' + esc(ev.topic) + ', ' + esc(ev.vlabel.split(' ')[0]) + ')</summary><pre class="evs">' + esc(ev.text) + '</pre></details>' : '') + '</div>';
  return out;
}
function liveHtml(L) {
  var sec = L ? Math.round((Date.now() - L.t0) / 1000) : 0;
  if (L && L.text) return '<div class="msg bot sto">' + mdToHtml(L.text.replace(/\*{0,2}Chain:?[\s\S]*$/, '')) + '<p class="mut" style="font-size:12px;margin-top:6px"><span class="typing"><i></i><i></i><i></i></span> writing… ' + sec + 's</p></div>';
  return '<div class="msg bot"><span class="typing"><i></i><i></i><i></i></span> <span class="mut" style="font-size:12.5px">' + (L && L.thought ? 'Reasoning: ' + esc(L.thought) : 'Checking D1, Moon chart, divisional chart, dashas, aspects and transits…') + ' · ' + sec + 's</span></div>';
}
function AiV2() {
  var p = curP(); if (!p) return topBar('Ask AI', { noPerson: true }) + noPerson();
  var msgs = DB.chats[p.id] || [], hasKey = !!DB.settings.ckey;
  var h = topBar('Ask AI', { right: '<span class="gem">' + (hasKey ? '✦ Claude' : 'Offline') + '</span>' + (msgs.length ? '<button class="v2ib" data-act="clearAsk" aria-label="Clear conversation" style="color:var(--bad)">' + icon('trash', 18) + '</button>' : '') }) + '<div class="pad">';
  if (relOf(p) !== 'me') h += '<div class="cline">Consulting for <b>' + esc(p.name) + '</b> · ' + (relOf(p) === 'client' ? 'client' : 'family / friend') + ' · answers are written for you to explain to them</div>';
  if (!hasKey) h += '<div class="card"><b style="font:600 15px var(--sans)">Connect Claude for full answers</b><p class="sm" style="margin:6px 0 10px">Paste your Claude API key (from console.anthropic.com). Every answer will then use your full chart, dashas, transits and the medical astrology section. Without a key you get the shorter offline answers.</p><input class="inp mono" id="gkeyIn" placeholder="sk-ant-..." autocomplete="off"><button class="btn acc wide" style="margin-top:8px" data-act="saveGkey">Save key</button></div>';
  h += '</div>';
  var Q0 = ['How will my health be in the next 3 months?', 'Will I get a promotion this year?', 'Explain my Ashtakavarga', 'What does my current dasha mean?', 'How is my D9 for marriage?', 'Best time to invest in the next 6 months?'];
  var fn = p.name.split(' ')[0], Q = relOf(p) === 'me' ? Q0 : ['Key points to tell ' + fn, 'What should I tell ' + fn + ' about career and money?', fn + '\'s golden periods and cautions', 'Which raj yogas does ' + fn + ' have?', 'Remedies I should suggest to ' + fn, 'Explain ' + fn + '\'s current dasha'];
  if (!msgs.length) h += '<div class="qchips" style="flex-wrap:wrap">' + Q.map(function (q) { return '<button data-act="askQ2">' + esc(q) + '</button>'; }).join('') + '</div>';
  h += '<div class="chat" id="chat">' + msgs.map(function (m, i) { var orphan = m.role === 'me' && (msgs[i + 1] ? msgs[i + 1].role === 'me' : !(U.pending && U.pending[p.id])); return m.role === 'me' ? '<div class="msg me">' + esc(m.text) + '</div>' + (orphan ? '<div class="msg bot"><p class="mut" style="font-size:12.5px">This question was not answered (the app was closed or the connection dropped).</p><button class="btn sec sm" style="margin-top:6px" data-act="retryOrphan" data-i="' + i + '">↻ Ask this again</button></div>' : '') : m.multi ? m.html : '<div class="msg bot">' + m.html + '</div>'; }).join('') + (U.pending && U.pending[p.id] ? '<div id="liveAns">' + liveHtml(U.live && U.live[p.id]) + '</div>' : '') + '</div><div style="height:100px"></div>';
  U.after = (U.after || []).concat([function () { window.scrollTo(0, document.body.scrollHeight); }]);
  return h;
}
ACT.saveGkey = function () { var v = ($('#gkeyIn').value || '').trim(); if (!v) return toast('Paste the key first'); DB.settings.ckey = v; save(); toast('Gemini connected'); rerender(); };
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
ACT.retryOrphan = function (el) { var p = curP(), list = DB.chats[p.id] || [], i = +el.dataset.i, q = list[i] && list[i].text; if (!q || (U.pending && U.pending[p.id])) return; list.splice(i, 1); save(); $('#askIn').value = q; ACT.askSend(); };
ACT.retryAsk = function (el) { var p = curP(), list = DB.chats[p.id] || []; if (U.pending && U.pending[p.id]) return; if (list.length && list[list.length - 1].role === 'bot') list.pop(); if (list.length && list[list.length - 1].role === 'me') list.pop(); $('#askIn').value = el.dataset.q; ACT.askSend(); };
ACT.askQ2 = function (el) { $('#askIn').value = el.textContent; ACT.askSend(); };
ACT.askSend = function () {
  var t = $('#askIn'), q = (t.value || '').trim(), p = curP(); if (!q || !p) return;
  if (U.pending && U.pending[p.id]) return toast('Still answering your last question…');
  t.value = ''; t.style.height = '';
  var c = calcP(p), list = DB.chats[p.id] = DB.chats[p.id] || [];
  list.push({ role: 'me', text: q });
  if (!DB.settings.ckey) {
    var res = null; try { res = answerAny(p, c, q); } catch (e) { res = { html: '<p>Could not work that out: ' + esc(e.message) + '</p>' }; }
    list.push(res && res.story ? { role: 'bot', multi: true, ask: !!res.story.question, html: res.html, text: res.text } : { role: 'bot', html: res ? res.html : HELP, text: res ? (res.text || htmlText(res.html)).slice(0, 3000) : '' });
    trimChat(list); save(); rerender(); return;
  }
  U.pending = U.pending || {}; U.pending[p.id] = 1;
  save(); rerender();
  var t0 = Date.now(); U.live = U.live || {}; U.live[p.id] = { t0: t0, thought: '', text: '' };
  var tick = setInterval(liveDraw, 1000);
  function liveDraw() { var el = document.getElementById('liveAns'); if (el && U.live[p.id]) el.innerHTML = liveHtml(U.live[p.id]); }
  askGemini(p, c, q, function (kind, txt) {
    var L = U.live[p.id]; if (!L) return;
    if (kind === 'thought') { var m = txt.match(/\*\*([^*]{3,80})\*\*/); L.thought = m ? m[1] : txt.split('\n')[0].slice(0, 90); } else L.text = txt;
    liveDraw(); var ch = document.getElementById('chat'); if (ch && kind === 'text') window.scrollTo(0, document.body.scrollHeight);
  }).then(function (r) {
    clearInterval(tick); delete U.live[p.id];
    delete U.pending[p.id];
    list.push({ role: 'bot', multi: true, html: aiBubbles(r.txt, r.ev), text: r.txt }); trimChat(list); save(); if (location.hash.indexOf('ai') >= 0) rerender();
  }).catch(function (e) {
    clearInterval(tick); delete U.live[p.id];
    delete U.pending[p.id];
    var res = null; try { res = answerAny(p, c, q); } catch (x) { }
    list.push({ role: 'bot', multi: !!(res && res.story), html: '<div class="msg bot"><p class="mut" style="font-size:12.5px"AI could not answer: ' + esc(e.message.replace(/\.$/, '')) + '. ' + (res ? 'Offline answer below.' : '') + '</p><button class="btn sec sm" style="margin-top:8px" data-act="retryAsk" data-q="' + esc(q) + '">↻ Ask again</button></div>' + (res ? (res.story ? res.html : '<div class="msg bot">' + res.html + '</div>') : ''), text: '' });
    list[list.length - 1].multi = true; trimChat(list); save(); if (location.hash.indexOf('ai') >= 0) rerender();
  });
};

/* ---------- Kundli analysis (Astrology › Kundli analysis) ---------- */
var KA_CACHE = {};
function kaOf(p) { var c = calcP(p), key = p.id + '|' + DB.settings.ayan + '|' + DB.settings.node + '|' + new Date().toDateString(); if (!KA_CACHE[key]) KA_CACHE[key] = KA.analyze(c, new Date()); return KA_CACHE[key]; }
function kaWhy(why) { return why && why.length ? '<details class="kwhy"><summary>Why</summary>' + why.map(function (w) { return '<p>' + esc(w) + '</p>'; }).join('') + '</details>' : ''; }
function kaRate(r) { return '<span class="krate k' + r.charAt(0) + '">' + r + '</span>'; }
function kaDates(a, b) { var f = function (d) { return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()] + ' ' + d.getFullYear(); }; return f(a) + ' – ' + f(b); }
var KA_SECS = [['pros', 'Strengths'], ['cons', 'Weak spots'], ['yogas', 'Yogas'], ['golden', 'Golden periods'], ['tough', 'Difficult periods'], ['risks', 'Health risks'], ['health', 'Health timeline'], ['remedies', 'Remedies'], ['success', 'Success timeline'], ['nature', 'Nature'], ['deity', 'Deity'], ['food', 'Food now'], ['lucky', 'Lucky factors']];
function AnalysisV2() {
  var p = curP(); if (!p) return topBar('Kundli analysis', { noPerson: true }) + noPerson();
  var a = kaOf(p), s = a.snapshot, now = new Date(), h = topBar('Analysis');
  h += '<div class="chips v2chips">' + KA_SECS.map(function (x) { return '<button data-act="kaJump" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div><div class="pad">';
  h += '<div class="v2hero"><div class="lbl">Kundli analysis · ' + esc(p.name) + '</div><h2>' + esc(s.grade[0]) + '</h2><p>' + esc(s.grade[1]) + '</p>' +
    '<div class="khero"><span><small>Lagna</small>' + s.lagna + '</span><span><small>Moon</small>' + s.moon + '</span><span><small>Star</small>' + esc(s.nak.split(' pada')[0]) + '</span><span><small>Dasha</small>' + esc(s.dasha.split(' / ').slice(0, 2).join('–')) + '</span></div>' +
    '<p style="margin-top:8px;font-size:12.5px">Strongest: <b>' + s.best.join(', ') + '</b> · Needs support: <b>' + s.weak.join(', ') + '</b></p></div>';
  function sec(id, title, sub, body) { return '<div class="card ksec" id="ka-' + id + '"><h3>' + title + '</h3>' + (sub ? '<p class="sm" style="margin:-4px 0 8px">' + sub + '</p>' : '') + body + '</div>'; }
  function li(kind, t, why, right, x) { x = x || {}; return '<div class="kli"><span class="kic ' + kind + '">' + (kind === 'g' ? '✓' : kind === 'b' ? '!' : '•') + '</span><div><b>' + esc(t) + '</b>' + (x.out ? '<p class="kout">' + esc(x.out) + '</p>' : '') + (x.watch ? '<p class="kwatch">' + esc(x.watch) + '</p>' : '') + (x.when ? '<p class="kwhen">' + esc(x.when) + '</p>' : '') + kaWhy(why) + '</div>' + (right || '') + '</div>'; }
  h += sec('pros', 'Strengths of your kundli', a.pros.length + ' things working for you', a.pros.map(function (x) { return li('g', x.t, x.why, '', x); }).join(''));
  h += sec('cons', 'Weak spots in your birth chart', a.cons.length + (a.cons.length === 1 ? ' area' : ' areas') + ' that need care or remedies', a.cons.map(function (x) { return li('b', x.t, x.why, '', x); }).join(''));
  h += sec('yogas', 'All yogas in your chart', a.yogas.filter(function (y) { return y.good && y.kind !== 'mild'; }).length + ' helpful · ' + a.yogas.filter(function (y) { return !y.good || y.kind === 'mild'; }).length + ' doshas, mild or weak', a.yogas.map(function (y) { var ki = y.kind === 'mild' ? 'n' : y.good ? 'g' : 'b'; return '<div class="kli"><span class="kic ' + ki + '">' + (ki === 'g' ? '✓' : ki === 'b' ? '!' : '•') + '</span><div><b>' + esc(y.name) + '</b>' + (y.out ? '<p class="kout">' + esc(y.out) + '</p>' : '') + '<p class="sm">' + esc(y.why) + '</p>' + (y.when ? '<p class="kwhen">' + esc(y.when) + '</p>' : '') + '</div><span class="tag ' + (ki === 'g' ? 'tg' : ki === 'b' ? 'tr' : 'tn') + '">' + esc(y.label.split(' (')[0]) + '</span></div>'; }).join(''));
  h += sec('golden', 'Golden dasha periods', 'Best Mahadasha–Antardasha combinations in the next 30 years', a.golden.map(function (g) { return '<div class="kgold' + (g.now ? ' now' : '') + '"><div class="kgh"><b>' + esc(g.label) + '</b>' + kaRate(g.rate) + '</div><div class="sm">' + kaDates(g.start, g.end) + ' · age ' + g.ageFrom + (g.now ? ' · <b style="color:var(--acc)">running now</b>' : '') + '</div><div class="kar">' + g.areas.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' + (g.out ? '<p class="kout">' + esc(g.out) + '</p>' : '') + (g.watch ? '<p class="kwatch">' + esc(g.watch) + '</p>' : '') + kaWhy(g.why) + '</div>'; }).join('') +
    '<div class="lbl" style="margin:14px 0 6px">Your whole life, Mahadasha by Mahadasha</div>' + a.life.map(function (m) { return '<div class="klife' + (m.now ? ' now' : '') + '"><span class="pt" style="background:' + PCOL[m.code] + '">' + m.code + '</span><div><b>' + m.lord + '</b><small>age ' + m.from + '–' + m.to + ' · ' + m.start.getFullYear() + '–' + m.end.getFullYear() + (m.now ? ' · now' : '') + '</small></div>' + kaRate(m.rate) + '</div>'; }).join(''));
  h += sec('tough', 'Difficult periods to watch', 'Weakest Mahadasha–Antardasha combinations in the next 30 years', (a.tough && a.tough.length ? a.tough.map(function (g) { return '<div class="kgold tough' + (g.now ? ' now' : '') + '"><div class="kgh"><b>' + esc(g.label) + '</b><span class="krate kT">Careful</span></div><div class="sm">' + kaDates(g.start, g.end) + ' · age ' + g.ageFrom + (g.now ? ' · <b style="color:var(--bad)">running now</b>' : '') + '</div><div class="kar">' + g.areas.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div><p class="kout">' + esc(g.out) + '</p><p class="kwatch">' + esc(g.remedy) + '</p>' + kaWhy(g.why) + '</div>'; }).join('') : '<p class="sm">No strongly difficult periods in the next 30 years.</p>'));
  var R = a.rem, GK = { yes: ['tg', 'Suits you'], care: ['tn', 'With advice'], no: ['tr', 'Avoid'] };
  h += sec('remedies', 'Recommended remedies', 'Based on your lagna, running dasha and Saturn cycle',
    R.plan.map(function (x) { return '<div class="krem"><div class="kgh"><b><span class="pt" style="background:' + PCOL[x.code] + '">' + x.code + '</span> ' + PN[x.code] + '</b><span class="tag ' + (x.mode === 'calm' ? 'tr' : 'tg') + '">' + (x.mode === 'calm' ? 'Calm it' : x.mode === 'both' ? 'Strengthen & calm' : 'Strengthen') + '</span></div><p class="sm">' + esc((x.why || '').trim()) + '</p>' +
      '<ul><li><b>Mantra:</b> "' + esc(x.mantra[0]) + '". ' + esc(KB.MANTRA_HOW) + '</li><li><b>Daan (donation) every ' + esc(x.daan[1]) + ':</b> ' + esc(x.daan[0]) + '. ' + esc(KB.DAAN_HOW) + '</li><li><b>Lal Kitab:</b> ' + esc(x.lalkitab) + '</li><li><b>Fast:</b> on ' + esc(x.fast) + 's, eat one simple meal (no non-veg or alcohol) and pray to the planet\'s deity.</li><li><b>Rudraksha:</b> wear a ' + esc(x.rudra) + ' rudraksha on a red or yellow thread, after a short prayer on a Monday.</li></ul></div>'; }).join('') +
    '<div class="lbl" style="margin:12px 0 6px">Gemstones</div>' + R.gems.map(function (g) { return '<div class="kli"><span class="pt" style="background:' + PCOL[g.code] + '">' + g.code + '</span><div><b>' + esc(g.gem) + '</b><p class="sm">' + esc(g.why) + (g.kind !== 'no' ? ' Wear: ' + esc(g.how) + '. Lighter option: ' + esc(g.up) + '.' : '') + '</p></div><span class="tag ' + GK[g.kind][0] + '">' + GK[g.kind][1] + '</span></div>'; }).join('') +
    '<button class="btn acc wide" style="margin-top:10px" data-act="kaAddRem">+ Add these remedies to my tracker</button>');
  var MR = MED.analyze(calcP(p), now), MT = MR.filter(function (x) { return x.level !== 'Low' || x.now; }).slice(0, 5);
  h += sec('risks', 'Health risks to prevent', 'Conditions the chart is prone to, and what to avoid', (MT.length ? MT.map(function (x) { return '<div class="kgold' + (x.level === 'Higher' ? ' tough' : '') + '"><div class="kgh"><b>' + esc(x.name) + '</b><span class="krate ' + (x.now || x.level === 'Higher' ? 'kT' : 'kM') + '">' + (x.now || x.level) + '</span></div>' + (x.now && x.trig.length ? '<p class="kwatch"><b>Right now:</b> ' + esc(x.trig.join('; ')) + '.</p>' : '') + (x.soon.length ? '<p class="kwhen">Next 3 years, careful in: ' + esc(x.soon.map(function (w) { return w.t + ' (' + N.dmy(w.s) + ' – ' + N.dmy(w.e) + ')'; }).join('; ')) + '</p>' : '') + '<p class="kwatch">Avoid strictly: ' + esc(x.avoid.slice(0, 3).join('; ')) + '.</p><p class="kout">Do: ' + esc(x.dos.slice(0, 2).join('; ')) + '. Tests: ' + esc(x.tests) + '</p>' + (x.when.length ? '<p class="kwhen">Later in life: ' + esc(x.when.slice(0, 2).map(function (w) { return w.t + ' (' + w.s.getFullYear() + '–' + w.e.getFullYear() + ')'; }).join('; ')) + '</p>' : '') + kaWhy(x.why) + '</div>'; }).join('') : '<p class="sm">No strong health risk shown; keep normal yearly check-ups.</p>') + '<button class="btn sec wide" style="margin-top:8px" data-go="report/disease">Full health risk report ›</button><p class="note">Astrological tendencies, not a diagnosis. Get the tests and follow your doctor.</p>');
  h += sec('health', 'Health timeline by body area', 'Dasha periods when the body needs extra care, and the conditions linked to them',
    (a.health.length ? a.health.map(function (x) { return '<div class="ktl"><div class="kgh"><b>' + kaDates(x.start, x.end) + '</b><span class="tag ' + (x.level === 'Watch' ? 'tr' : 'tn') + '">' + x.level + '</span></div><div class="sm">' + esc(x.label) + ' period · body areas: ' + esc(x.areas.join('; ')) + '</div>' + (function () { var adl = x.label.split(' – ')[1] || '', code = Object.keys(PN).filter(function (q) { return PN[q] === adl.split(',')[0].trim(); })[0], lc = MR.filter(function (m) { var cd = MED.COND.filter(function (z) { return z.id === m.id; })[0]; return code && ((cd.pl[code] && m.level !== 'Low') || (x.start <= now && m.now && m.trig.join(' ').indexOf(PN[code]) >= 0)); }); return lc.length ? '<p class="kwatch">Linked: ' + esc(lc.map(function (m) { return m.name + ' (avoid ' + m.avoid[0].toLowerCase() + ')'; }).join('; ')) + '.</p>' : ''; })() + kaWhy(x.why) + '</div>'; }).join('') : '<p class="sm">No strongly sensitive dasha periods in the next 25 years. Keep normal check-ups.</p>') +
    (a.saturn.length ? '<div class="lbl" style="margin:12px 0 6px">Saturn cycles from your Moon</div>' + a.saturn.map(function (x) { return '<div class="ktl"><div class="kgh"><b>' + esc(x.label) + '</b><span class="sm">' + kaDates(x.start, x.end) + '</span></div><div class="sm">' + (x.label === 'Sade Sati' ? 'Slower results, fatigue and pressure; steady routine and Saturn remedies help.' : x.label === 'Ashtama Shani' ? 'Watch health, sudden expenses and stress; avoid risky moves.' : 'Pressure at home and on peace of mind; patience pays.') + '</div></div>'; }).join('') : '') +
    '<p class="note">Astrological indications only, not a diagnosis. See a doctor for any symptoms.</p>');
  h += sec('success', 'Potential success periods', 'When career, money and other goals get the strongest support',
    a.success.length ? a.success.map(function (x) { return '<div class="ktl"><div class="kgh"><b>' + kaDates(x.start, x.end) + '</b><span class="tag tg">' + x.level + '</span></div><div class="sm">' + esc(x.label) + ' period</div><div class="kar">' + x.areas.map(function (y) { return '<span>' + esc(y) + '</span>'; }).join('') + '</div>' + kaWhy(x.why) + '</div>'; }).join('') : '<p class="sm">No standout periods; progress comes steadily through effort.</p>');
  h += sec('nature', 'Your nature', '', a.nature.map(function (x) { return '<div class="knat"><b>' + esc(x.t) + '</b><p>' + esc(x.d) + '</p></div>'; }).join(''));
  h += sec('deity', 'Deity to worship', '', a.deity.map(function (d) { return '<div class="krem"><div class="kgh"><b>' + esc(d.name) + '</b><span class="pt" style="background:' + PCOL[d.code] + '">' + d.code + '</span></div><div class="lbl" style="margin:2px 0 4px">' + esc(d.role) + '</div><p class="sm">' + esc(d.how) + '</p>' + kaWhy([d.why]) + '</div>'; }).join(''));
  var F = a.food;
  h += sec('food', 'Favourable food in this dasha', PN[F.md] + ' Mahadasha (to ' + N.dmy(F.mdTo) + ')' + (F.ad !== F.md ? ' · ' + PN[F.ad] + ' Antardasha (to ' + N.dmy(F.adTo) + ')' : ''),
    F.items.map(function (x) { return '<div class="krem"><div class="kgh"><b>For ' + PN[x.code] + '</b><span class="tag ' + (x.mode === 'balance' ? 'tn' : 'tg') + '">' + (x.mode === 'balance' ? 'Balance it' : 'Strengthen it') + '</span></div><p class="sm"><b style="color:var(--good)">Favour:</b> ' + esc(x.favour) + '</p><p class="sm"><b style="color:var(--bad)">Go easy on:</b> ' + esc(x.limit) + '</p></div>'; }).join('') +
    '<div class="krem"><b>Your body type: ' + F.nadi + ' nadi (' + F.dosha + ')</b><p class="sm">' + esc(F.tip.charAt(0).toUpperCase() + F.tip.slice(1)) + '.</p></div>');
  h += sec('lucky', 'Lucky factors and other useful info', '', '<div class="klk">' + a.lucky.map(function (x) { return '<div><small>' + esc(x.t) + '</small><b>' + esc(x.d) + '</b></div>'; }).join('') + '</div>');
  h += (relOf(p) !== 'me' ? '<button class="btn acc wide" style="margin:4px 0 8px" data-act="kaBrief">✦ Key points to tell ' + esc(p.name.split(' ')[0]) + '</button>' : '') + '<button class="btn sec wide" style="margin:4px 0 6px" data-act="kaAsk">✦ Ask AI to explain ' + (relOf(p) === 'me' ? 'my' : esc(p.name.split(' ')[0]) + '\'s') + ' kundli in depth</button></div>';
  return h;
}
ACT.kaJump = function (el) { var t = document.getElementById('ka-' + el.dataset.v); if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' }); };
ACT.kaAddRem = function () { ACT.addSuggested(); setTimeout(function () { go('remedies'); }, 600); };
ACT.kaBrief = function () { var p = curP(); go('ai'); setTimeout(function () { var t = $('#askIn'); if (t) { t.value = 'Key points to tell ' + p.name.split(' ')[0] + ' in the consultation'; ACT.askSend(); } }, 120); };
ACT.kaAsk = function () { go('ai'); setTimeout(function () { var t = $('#askIn'); if (t) { t.value = 'Give me a complete analysis of my kundli: strengths, weaknesses, yogas, golden periods and what I should focus on now.'; ACT.askSend(); } }, 120); };
